import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";
import { OpenAI } from "https://esm.sh/openai@4.10.0";
import { corsHeaders } from "../_shared/cors.ts";

// Initialize AI clients
const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") });
const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${geminiApiKey}`;

interface StoryRecord {
  id: string;
  user_id: string;
  title: string;
  child_name: string;
  gender: string;
  age: number;
  genre: string;
  short_description: string;
  photo_url: string;
}

interface StoryPage {
  narration: string;
  illustration_prompt: string;
}

// Helper function to update story status for better error tracking
async function updateStoryStatus(supabase: SupabaseClient, storyId: string, status: 'processing' | 'complete' | 'failed', pdfUrl?: string, errorMessage?: string) {
  const updates: { status: string; pdf_url?: string; short_description?: string } = { status };
  if (pdfUrl) updates.pdf_url = pdfUrl;
  if (errorMessage) updates.short_description = `Error: ${errorMessage.substring(0, 400)}`;

  const { error } = await supabase.from('stories').update(updates).eq('id', storyId);
  if (error) {
    console.error(`[STORY ID: ${storyId}] FATAL: Could not update status to ${status}:`, error.message);
  } else {
    console.log(`[STORY ID: ${storyId}] Status updated to ${status}.`);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  let storyRecord: StoryRecord | null = null;

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    console.log("--- Create-storybook function invoked ---");
    const payload = await req.json();

    // Enhanced Debugging: Log the entire payload to see what the trigger is sending
    console.log("Received payload:", JSON.stringify(payload, null, 2));

    // The data from a database trigger is expected in `payload.record`
    storyRecord = payload.record;

    if (!storyRecord || !storyRecord.id || !storyRecord.user_id) {
      // Log the failure reason before throwing an error
      console.error("Payload validation failed. 'record' object or its 'id'/'user_id' is missing.");
      throw new Error("Invalid trigger payload. 'record' with id and user_id is missing.");
    }
    
    const { id: storyId, user_id, title, child_name, gender, age, genre, short_description } = storyRecord;
    console.log(`[STORY ID: ${storyId}] Trigger received for user ${user_id}. Starting processing.`);
    await updateStoryStatus(supabaseAdmin, storyId, 'processing');

    // 2. Generate Story JSON with Gemini
    const geminiPrompt = `
      You are an expert children's story author. Generate a 5-page story based on these details.
      Output ONLY a valid JSON array of 5 objects. Each object must have two keys: "narration" (string, <=100 words) and "illustration_prompt" (string).
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
    if (!storyText) {
        throw new Error("Gemini response was empty or malformed.");
    }
    const storyPages: StoryPage[] = JSON.parse(storyText);
    console.log(`[STORY ID: ${storyId}] Story JSON received from Gemini.`);

    // 3. Generate Illustrations with DALL-E
    console.log(`[STORY ID: ${storyId}] Generating 5 images with DALL-E.`);
    const imagePromises = storyPages.map(page =>
      openai.images.generate({
        model: "dall-e-2",
        prompt: `${page.illustration_prompt}, in a whimsical, vibrant children's book style, digital art.`,
        n: 1,
        size: "512x512",
        response_format: "url",
      })
    );
    const imageResponses = await Promise.all(imagePromises);
    const imageUrls = imageResponses.map(res => res.data[0]?.url).filter((url): url is string => !!url);
    if (imageUrls.length !== 5) throw new Error("DALL-E failed to generate all 5 images.");
    console.log(`[STORY ID: ${storyId}] 5 images generated successfully.`);

    // 4. Create PDF
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
    console.log(`[STORY ID: ${storyId}] PDF created in memory.`);

    // 5. Upload PDF to Storage
    const filePath = `${user_id}/${storyId}.pdf`;
    const { error: uploadError } = await supabaseAdmin.storage.from("storybooks").upload(filePath, pdfBytes, { contentType: "application/pdf", upsert: true });
    if (uploadError) throw uploadError;
    const { data: { publicUrl } } = supabaseAdmin.storage.from("storybooks").getPublicUrl(filePath);
    console.log(`[STORY ID: ${storyId}] PDF uploaded to storage.`);

    // 6. Final Update to 'complete'
    await updateStoryStatus(supabaseAdmin, storyId, 'complete', publicUrl);

    return new Response(JSON.stringify({ success: true, storyId: storyId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error(`[STORY ID: ${storyRecord?.id}] CRITICAL ERROR:`, error.message);
    if (storyRecord?.id) {
        await updateStoryStatus(supabaseAdmin, storyRecord.id, 'failed', undefined, error.message);
    }
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
