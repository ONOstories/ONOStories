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
  const { error } = await supabase.from('stories').update(updates).eq('id', storyId);
  if (error) {
    console.error(`[STORY ID: ${storyId}] FATAL: Could not update story. Reason:`, error.message);
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

    const { data: storyRecord, error: fetchError } = await supabaseAdmin.from('stories').select('*').eq('id', storyId).single();
    if (fetchError || !storyRecord) throw new Error(`Failed to fetch story record: ${fetchError?.message}`);

    await updateStory(supabaseAdmin, storyId, { status: 'processing' });
    const { title, child_name, gender, age, genre, short_description } = storyRecord;

    const geminiPrompt = `
      You are an expert children's story author. Create a simple, heartwarming 5-page children’s story.
      Output ONLY a valid JSON array of 5 objects. Each object must have "narration" (string, <=100 words) and "illustration_prompt" (string).
      For each "illustration_prompt", describe a scene that embodies: clean line-work, soft yet vibrant colors, and gently stylized forms to create a playful, storybook feel.
      Details -> Name: ${child_name}, Age: ${age}, Gender: ${gender}, Title: ${title}, Genre: ${genre}, Description: ${short_description}`;

    const geminiResponse = await fetch(geminiApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: geminiPrompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });
    if (!geminiResponse.ok) throw new Error(`Gemini API error: ${await geminiResponse.text()}`);

    const geminiResult = await geminiResponse.json();
    const storyText = geminiResult.candidates[0]?.content?.parts[0]?.text;
    if (!storyText) throw new Error("Gemini response was empty or malformed.");

    const storyPages: StoryPage[] = JSON.parse(storyText);

    const imagePromises = storyPages.map(page =>
      openai.images.generate({
        model: "dall-e-3", // Using dall-e-3 for higher quality
        prompt: `${page.illustration_prompt}. Style: beautiful children's book illustration with clean line-work, soft and vibrant colors, and gently stylized characters.`,
        n: 1,
        size: "1024x1024",
        response_format: "url",
      })
    );
    const imageResponses = await Promise.all(imagePromises);
    const imageUrls = imageResponses.map(res => res.data[0]?.url).filter((url): url is string => !!url);
    if (imageUrls.length !== 5) throw new Error("DALL-E 3 failed to generate all 5 images.");

    const storybookData = storyPages.map((page, index) => ({
      narration: page.narration,
      imageUrl: imageUrls[index],
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