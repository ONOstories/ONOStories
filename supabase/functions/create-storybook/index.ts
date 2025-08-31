import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { OpenAI } from "https://esm.sh/openai@4.10.0";
import { corsHeaders } from "../_shared/cors.ts";

const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") });
const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${geminiApiKey}`;

interface StoryPage {
  narration: string;
  illustration_prompt: string;
}

async function updateStory(supabase: SupabaseClient, storyId: string, updates: object) {
  console.log(`[STORY ID: ${storyId}] Attempting to update with:`, updates);
  const { error } = await supabase.from('stories').update(updates).eq('id', storyId);
  if (error) {
    console.error(`[STORY ID: ${storyId}] FATAL: Could not update story. Reason:`, error.message);
  } else {
    console.log(`[STORY ID: ${storyId}] Story updated successfully.`);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  let storyId: string | null = null;
  const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  try {
    const { storyId: reqStoryId } = await req.json();
    storyId = reqStoryId;
    if (!storyId) throw new Error("Missing 'storyId' in the request body.");
    console.log(`[STORY ID: ${storyId}] Function invoked.`);

    const { data: storyRecord, error: fetchError } = await supabaseAdmin.from('stories').select('*').eq('id', storyId).single();
    if (fetchError || !storyRecord) throw new Error(`Failed to fetch story record: ${fetchError?.message}`);

    await updateStory(supabaseAdmin, storyId, { status: 'processing' });
    const { user_id, title, child_name, gender, age, genre, short_description } = storyRecord;

    const geminiPrompt = `
      You are an expert children's story author. Create a simple, heartwarming 5-page children’s story.
      Output ONLY a valid JSON array of 5 objects. Each object must have "narration" (string, <=100 words) and "illustration_prompt" (string).
      For each "illustration_prompt", describe a scene that embodies: clean line-work, soft yet vibrant colors, and gently stylized forms to create a playful, storybook feel.
      Details -> Name: ${child_name}, Age: ${age}, Gender: ${gender}, Title: ${title}, Genre: ${genre}, Description: ${short_description}`;

    const geminiResponse = await fetch(geminiApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: geminiPrompt }] }], generationConfig: { responseMimeType: "application/json" } })
    });
    if (!geminiResponse.ok) throw new Error(`Gemini API error: ${await geminiResponse.text()}`);

    const geminiResult = await geminiResponse.json();
    const storyText = geminiResult.candidates[0]?.content?.parts[0]?.text;
    if (!storyText) throw new Error("Gemini response was empty or malformed.");
    const storyPages: StoryPage[] = JSON.parse(storyText);
    console.log(`[STORY ID: ${storyId}] Story text generated.`);

    // Step 3.1: Generate images and get temporary URLs
    const imageGenPromises = storyPages.map(page =>
      openai.images.generate({
        model: "dall-e-3",
        prompt: `${page.illustration_prompt}. Style: beautiful children's book illustration with clean line-work, soft and vibrant colors, and gently stylized characters.`,
        n: 1,
        size: "1024x1024",
        response_format: "url",
      })
    );
    const imageResponses = await Promise.all(imageGenPromises);
    const tempImageUrls = imageResponses.map(res => res.data[0]?.url).filter((url): url is string => !!url);
    if (tempImageUrls.length !== 5) throw new Error("DALL-E 3 failed to generate all 5 images.");
    console.log(`[STORY ID: ${storyId}] Temporary image URLs received.`);

    // Step 3.2: Download, re-upload to Supabase Storage, and get permanent URLs
    const permanentImageUrls = await Promise.all(
      tempImageUrls.map(async (tempUrl, index) => {
        const imageResponse = await fetch(tempUrl);
        const imageBlob = await imageResponse.blob();
        const imagePath = `${user_id}/${storyId}/page_${index + 1}.png`;

        const { error: uploadError } = await supabaseAdmin.storage
          .from('storybooks') // Uploading to the 'storybooks' bucket
          .upload(imagePath, imageBlob, { contentType: 'image/png', upsert: true });

        if (uploadError) {
          throw new Error(`Failed to upload image ${index + 1}: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabaseAdmin.storage.from('storybooks').getPublicUrl(imagePath);
        return publicUrl;
      })
    );
    console.log(`[STORY ID: ${storyId}] Permanent image URLs created in 'storybooks' bucket.`);

    // Step 3.3: Combine text with permanent image URLs
    const storybookData = storyPages.map((page, index) => ({
      narration: page.narration,
      imageUrl: permanentImageUrls[index],
    }));

    await updateStory(supabaseAdmin, storyId, {
      status: 'complete',
      storybook_data: storybookData,
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });

  } catch (error) {
    console.error(`[STORY ID: ${storyId ?? 'Unknown'}] CRITICAL ERROR:`, error.message);
    if (storyId) {
      await updateStory(supabaseAdmin, storyId, { status: 'failed', short_description: `Error: ${error.message.substring(0, 450)}` });
    }
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

