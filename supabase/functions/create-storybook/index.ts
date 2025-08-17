import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";
import { OpenAI } from "https://esm.sh/openai@4.10.0";
import { corsHeaders } from "../_shared/cors.ts";

// Initialize AI clients
const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") });
const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${geminiApiKey}`;

console.log("Function create-storybook initialized.");

interface StoryPage {
  narration: string;
  illustration_prompt: string;
}

// Helper to update the story's status and log progress
async function updateStoryStatus(supabase: SupabaseClient, storyId: string, status: 'processing' | 'complete' | 'failed', pdfUrl?: string, errorMessage?: string) {
  console.log(`[STORY ID: ${storyId}] Attempting to update status to: ${status}`);
  const updates: { status: string; pdf_url?: string; short_description?: string } = { status };
  if (pdfUrl) updates.pdf_url = pdfUrl;
  if (errorMessage) updates.short_description = `Error: ${errorMessage.substring(0, 450)}`;


  const { error } = await supabase.from('stories').update(updates).eq('id', storyId);
  if (error) {
    console.error(`[STORY ID: ${storyId}] FATAL: Could not update status to ${status}. Reason:`, error.message);
  } else {
    console.log(`[STORY ID: ${storyId}] Status successfully updated to ${status}.`);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  let storyId: string | null = null;
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    console.log("--- Create-storybook function invoked ---");
    const { storyId: reqStoryId } = await req.json();
    storyId = reqStoryId; // Assign to outer scope for error handling

    if (!storyId) {
      throw new Error("Missing 'storyId' in the request body.");
    }
    console.log(`[STORY ID: ${storyId}] Received request.`);

    // STEP 1: Fetch the existing story record from the database
    console.log(`[STORY ID: ${storyId}] Fetching story details from the database...`);
    const { data: storyRecord, error: fetchError } = await supabaseAdmin
      .from('stories')
      .select('*')
      .eq('id', storyId)
      .single();

    if (fetchError || !storyRecord) {
      console.error(`Database fetch error for story ID ${storyId}:`, fetchError?.message);
      throw new Error(`Failed to fetch story record: ${fetchError?.message}`);
    }

    console.log(`[STORY ID: ${storyId}] Successfully fetched story details.`);
    await updateStoryStatus(supabaseAdmin, storyId, 'processing');

    const { user_id, title, child_name, gender, age, genre, short_description } = storyRecord;

    // STEP 2: Generate story content with Gemini
    const geminiPrompt = `
      You are an expert children's story author. Create a children’s story that centers on the photo the user uploads.
      Generate a 5-page story based on these details.
      Output ONLY a valid JSON array of 5 objects. Each object must have two keys: "narration" (string, <=100 words) and "illustration_prompt" (string).
      For each "illustration_prompt", describe a scene suitable for a 3D animated movie, focusing on character emotion and action.
      Every generated illustration must feature an animated version of the same child, closely matching the child’s facial features, hairstyle, and clothing style from the photo.
      Maintain the child’s outfit colors and overall color palette consistently across all pages so the PDF feels visually unified.
      Details -> Name: ${child_name}, Age: ${age}, Gender: ${gender}, Title: ${title}, Genre: ${genre}, Description: ${short_description}`;

    console.log(`[STORY ID: ${storyId}] Sending prompt to Gemini.`);
    const geminiResponse = await fetch(geminiApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: geminiPrompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!geminiResponse.ok) {
        const errorBody = await geminiResponse.text();
        throw new Error(`Gemini API error: ${geminiResponse.status} ${errorBody}`);
    }

    const geminiResult = await geminiResponse.json();
    const storyText = geminiResult.candidates[0]?.content?.parts[0]?.text;
    if (!storyText) throw new Error("Gemini response was empty or malformed.");
    
    const storyPages: StoryPage[] = JSON.parse(storyText);
    console.log(`[STORY ID: ${storyId}] Story JSON received from Gemini.`);

    // STEP 3: Generate Illustrations with DALL-E
    console.log(`[STORY ID: ${storyId}] Generating 5 images with DALL-E.`);
    const imagePromises = storyPages.map(page =>
      openai.images.generate({
        model: "dall-e-2",
        prompt: `${page.illustration_prompt}, in a charming 3D animated style like a Pixar movie, soft cinematic lighting, vibrant colors, digital illustration.`,
        n: 1,
        size: "512x512",
        response_format: "url",
      })
    );
    const imageResponses = await Promise.all(imagePromises);
    const imageUrls = imageResponses.map(res => res.data[0]?.url).filter((url): url is string => !!url);
    if (imageUrls.length !== 5) throw new Error("DALL-E failed to generate all 5 images.");
    console.log(`[STORY ID: ${storyId}] 5 images generated successfully.`);

    // STEP 4: Create PDF
    console.log(`[STORY ID: ${storyId}] Creating PDF in memory.`);
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    for (let i = 0; i < 5; i++) {
        const page = pdfDoc.addPage();
        const { width, height } = page.getSize();
        const imageBytes = await fetch(imageUrls[i]).then(res => res.arrayBuffer());
        const embeddedImage = await pdfDoc.embedPng(imageBytes);
        const imgDims = embeddedImage.scaleToFit(width - 100, height - 250);
        page.drawImage(embeddedImage, { x: (width - imgDims.width) / 2, y: height - imgDims.height - 50, width: imgDims.width, height: imgDims.height });
        page.drawText(storyPages[i].narration, { x: 50, y: 120, font, size: 16, lineHeight: 24, color: rgb(0.1, 0.1, 0.1), maxWidth: width - 100 });
    }
    const pdfBytes = await pdfDoc.save();
    console.log(`[STORY ID: ${storyId}] PDF created successfully.`);

    // STEP 5: Upload PDF to Supabase Storage
    const filePath = `${user_id}/${storyId}.pdf`;
    console.log(`[STORY ID: ${storyId}] Uploading PDF to storage at path: ${filePath}`);
    const { error: uploadError } = await supabaseAdmin.storage.from("storybooks").upload(filePath, pdfBytes, { contentType: "application/pdf", upsert: true });
    if (uploadError) throw uploadError;
    
    const { data: { publicUrl } } = supabaseAdmin.storage.from("storybooks").getPublicUrl(filePath);
    console.log(`[STORY ID: ${storyId}] PDF uploaded successfully. Public URL: ${publicUrl}`);

    // STEP 6: Final status update to 'complete'
    await updateStoryStatus(supabaseAdmin, storyId, 'complete', publicUrl);

    // STEP 7: Return the final URL to the frontend
    return new Response(JSON.stringify({ success: true, pdfUrl: publicUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });

  } catch (error) {
    console.error(`[STORY ID: ${storyId ?? 'Unknown'}] CRITICAL ERROR in function execution:`, error.message);
    if (storyId) {
        await updateStoryStatus(supabaseAdmin, storyId, 'failed', undefined, error.message);
    }
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});