import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@^1.17.1";

// --- REQUIRED API KEYS AND URLS ---
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const HUGGINGFACE_API_KEY = Deno.env.get("HUGGINGFACE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

serve(async (req) => {
  let storyId: string | null = null;

  try {
    const { record: story } = await req.json();
    storyId = story.id;
    console.log(`[STORY: ${storyId}] Function started.`);

    // 1. Update story status to 'processing'
    await supabase.from("stories").update({ status: 'processing' }).eq('id', storyId);
    console.log(`[STORY: ${storyId}] Status updated to 'processing'.`);

    // 2. Send prompt to Gemini 1.5 Pro
    console.log(`[STORY: ${storyId}] Calling Gemini API...`);


    const storyPrompt = `
    Create a 10-page children's story about a ${story.age}-year-old ${story.gender} named ${story.child_name}. The story should be in the ${story.genre} genre. Short Description: ${story.short_description}. The output must be a valid JSON array, where each object represents a page and contains 'narration' (max 100 words) and 'illustration_prompt' (a detailed prompt for an image generation AI).`;

    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: storyPrompt }] }],
        generationConfig: {
          response_mime_type: "application/json",
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errorBody = await geminiResponse.text();
      throw new Error(`Gemini API failed with status ${geminiResponse.status}: ${errorBody}`);
    }

    const geminiData = await geminiResponse.json();
    const storyPages = JSON.parse(geminiData.candidates[0].content.parts[0].text);
    console.log(`[STORY: ${storyId}] Received story content from Gemini.`);

    // 3. Generate Illustrations and Create PDF
    const pdfDoc = await PDFDocument.create();

    for (let i = 0; i < storyPages.length; i++) {
      const page = storyPages[i];
      console.log(`[STORY: ${storyId}] Generating image for page ${i + 1}...`);
      
      const hfResponse = await fetch("https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0", {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`
          },
          body: JSON.stringify({
              inputs: `${page.illustration_prompt}, children's storybook illustration, vibrant colors`,
          }),
      });

      if (!hfResponse.ok) {
          const errorBody = await hfResponse.text();
          throw new Error(`Hugging Face API failed for page ${i + 1}: ${errorBody}`);
      }
      
      console.log(`[STORY: ${storyId}] Received image for page ${i + 1}.`);
      const imageBytes = new Uint8Array(await hfResponse.arrayBuffer());
      
      const pdfPage = pdfDoc.addPage();
      const { width, height } = pdfPage.getSize();
      const jpgImage = await pdfDoc.embedJpg(imageBytes);
      const jpgDims = jpgImage.scale(0.5);
      pdfPage.drawImage(jpgImage, {
        x: (width - jpgDims.width) / 2,
        y: height - jpgDims.height - 50,
        width: jpgDims.width,
        height: jpgDims.height,
      });

      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      pdfPage.drawText(page.narration, {
        x: 50,
        y: 150,
        font,
        size: 18,
        color: rgb(0, 0, 0),
        maxWidth: width - 100,
        lineHeight: 24,
      });
    }

    // 4. Save PDF to Supabase Storage
    console.log(`[STORY: ${storyId}] Saving PDF to storage...`);
    const pdfBytes = await pdfDoc.save();
    const pdfPath = `${story.user_id}/${story.id}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from('storybooks')
      .upload(pdfPath, pdfBytes, { contentType: 'application/pdf', upsert: true });

    if (uploadError) throw uploadError;

    // 5. Update story record with PDF URL
    console.log(`[STORY: ${storyId}] Updating story record in database...`);
    const { data: { publicUrl } } = supabase.storage.from('storybooks').getPublicUrl(pdfPath);
    const { data: updatedStory, error: updateError } = await supabase.from('stories')
      .update({ status: 'complete', pdf_url: publicUrl })
      .eq('id', story.id)
      .select()
      .single();

    if (updateError) throw updateError;

    // 6. Broadcast success message to the user
    console.log(`[STORY: ${storyId}] Broadcasting success message.`);
    const channel = supabase.channel(`stories-${story.user_id}`);
    await channel.send({
      type: 'broadcast',
      event: 'story-complete',
      payload: { story: updatedStory },
    });
    
    console.log(`[STORY: ${storyId}] Function finished successfully.`);
    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    console.error(`[STORY: ${storyId}] Error in create-storybook function:`, error);
    if (storyId) {
       await supabase.from("stories").update({ status: 'failed' }).eq('id', storyId);
    }
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
