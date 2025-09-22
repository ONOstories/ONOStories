import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import {
  createClient,
  SupabaseClient,
} from "https://esm.sh/@supabase/supabase-js@2";
import { OpenAI } from "https://esm.sh/openai@4.10.0";
import { corsHeaders } from "../_shared/cors.ts";

const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") });
const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${geminiApiKey}`;

interface StoryPage {
  narration: string;
  illustration_prompt: string;
}

async function updateStory(
  supabase: SupabaseClient,
  storyId: string,
  updates: object
) {
  console.log(`[STORY ID: ${storyId}] Attempting to update with:`, updates);
  const { error } = await supabase
    .from("stories")
    .update(updates)
    .eq("id", storyId);
  if (error) {
    console.error(
      `[STORY ID: ${storyId}] FATAL: Could not update story. Reason:`,
      error.message
    );
    // Throw an error to be caught by the main handler
    throw new Error(`Supabase update failed: ${error.message}`);
  } else {
    console.log(`[STORY ID: ${storyId}] Story updated successfully.`);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders });

  let storyId: string | null = null;
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const { storyId: reqStoryId } = await req.json();
    storyId = reqStoryId;
    if (!storyId) throw new Error("Missing 'storyId' in the request body.");
    console.log(`[STORY ID: ${storyId}] Function invoked.`);

    await updateStory(supabaseAdmin, storyId, { status: "processing" });

    const { data: storyRecord, error: fetchError } = await supabaseAdmin
      .from("stories")
      .select("*")
      .eq("id", storyId)
      .single();
    if (fetchError || !storyRecord)
      throw new Error(`Failed to fetch story record: ${fetchError?.message}`);

    const {
      user_id,
      title,
      child_name,
      gender,
      age,
      genre,
      short_description,
    } = storyRecord;

    const geminiPrompt = `
      You are an expert children's story author. Create a simple, heartwarming 5-page story using simple English that a 10-year-old can read. Avoid big words and keep the story friendly and easy.
      Output ONLY a valid JSON array of 5 objects. Each object must have "narration" (string, <=100 words) and "illustration_prompt" (string).
      Details -> Name: ${child_name}, Age: ${age}, Gender: ${gender}, Title: ${title}, Genre: ${genre}, Description: ${short_description}`;

    const geminiResponse = await fetch(geminiApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: geminiPrompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    });
    if (!geminiResponse.ok)
      throw new Error(`Gemini API error: ${await geminiResponse.text()}`);

    const geminiResult = await geminiResponse.json();
    const storyText = geminiResult.candidates[0]?.content?.parts[0]?.text;
    if (!storyText) throw new Error("Gemini response was empty or malformed.");
    const storyPages: StoryPage[] = JSON.parse(storyText);
    console.log(`[STORY ID: ${storyId}] Story text generated.`);
    
    const childDescriptor = `The main character is a child named ${child_name}, age ${age}, gender ${gender}. Match the child's facial features, skin tone, and hairstyle to this reference photo: ${storyRecord.photo_url}. Keep the same color and style of clothing throughout all images.`;

    const imagePromises = storyPages.map((page) =>
      openai.images.generate({
        model: "dall-e-3",
        prompt: `${childDescriptor}\n${page.illustration_prompt}. Style: beautiful children's book illustration, consistent child appearance, clean line-work, soft vibrant colors.`,
        n: 1,
        size: "1024x1024",
        response_format: "url",
      })
    );

    const imageResponses = await Promise.all(imagePromises);
    const tempImageUrls = imageResponses
      .map((res) => res.data[0]?.url)
      .filter((url): url is string => !!url);
    if (tempImageUrls.length !== 5)
      throw new Error("DALL-E 3 failed to generate all 5 images.");
    console.log(`[STORY ID: ${storyId}] Temporary image URLs received.`);

    const permanentImageUrls = await Promise.all(
      tempImageUrls.map(async (tempUrl, index) => {
        const imageResponse = await fetch(tempUrl);
        const imageBlob = await imageResponse.blob();
        const imagePath = `${user_id}/${storyId}/page_${index + 1}.png`;
        const { error: uploadError } = await supabaseAdmin.storage
          .from("storybooks")
          .upload(imagePath, imageBlob, {
            contentType: "image/png",
            upsert: true,
          });
        if (uploadError)
          throw new Error(
            `Failed to upload image ${index + 1}: ${uploadError.message}`
          );
        const {
          data: { publicUrl },
        } = supabaseAdmin.storage.from("storybooks").getPublicUrl(imagePath);
        return publicUrl;
      })
    );
    console.log(`[STORY ID: ${storyId}] Permanent image URLs created.`);

    const storybookData = storyPages.map((page, index) => ({
      narration: page.narration,
      imageUrl: permanentImageUrls[index],
    }));

    await updateStory(supabaseAdmin, storyId, {
      status: "complete",
      storybook_data: storybookData,
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error(
      `[STORY ID: ${storyId ?? "Unknown"}] CRITICAL ERROR:`,
      error.message
    );
    if (storyId) {
      // This block might not be reached if the updateStory itself fails, but it's a good fallback.
      await supabaseAdmin
        .from("stories")
        .update({
          status: "failed",
          short_description: `Error: ${error.message.substring(0, 450)}`,
        })
        .eq("id", storyId);
    }
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
