import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import {
  createClient,
  SupabaseClient,
} from "https://esm.sh/@supabase/supabase-js@2";
import { OpenAI } from "https://esm.sh/openai@4.10.0";
import { corsHeaders } from "../_shared/cors.ts";

const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") });
const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;

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
    throw new Error(`Supabase update failed: ${error.message}`);
  } else {
    console.log(`[STORY ID: ${storyId}] Story updated successfully.`);
  }
}

// --- SAFETY-AWARE DALL-E PROMPT FUNCTION ---
async function safeGenerateImage(imagePrompt: string, fallbackPrompt?: string) {
  try {
    const res = await openai.images.generate({
      model: "dall-e-3",
      prompt: imagePrompt,
      n: 1,
      size: "1024x1024",
      response_format: "url",
    });
    return res.data[0]?.url;
  } catch (err) {
    // Handle OpenAI safety block error
    if (
      String(err?.message || "")
        .toLowerCase()
        .includes("safety system") ||
      String(err?.message || "")
        .toLowerCase()
        .includes("not allowed")
    ) {
      console.warn("[DALL-E safety warning]", err.message, imagePrompt);
      if (fallbackPrompt) {
        try {
          const resFallback = await openai.images.generate({
            model: "dall-e-3",
            prompt: fallbackPrompt,
            n: 1,
            size: "1024x1024",
            response_format: "url",
          });
          return resFallback.data[0]?.url;
        } catch (fallbackErr) {
          console.warn(
            "[DALL-E fallback also failed]",
            fallbackErr.message,
            fallbackPrompt
          );
        }
      }
    }
    throw err;
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

    const childDescriptor = `The main character is a child named ${child_name}, age ${age}, gender ${gender}. 
      Match the child's facial features, skin tone, and hairstyle as seen in the following reference photo: ${storyRecord.photo_url}. 
      For ALL story images, strictly make the main character wear the EXACT clothing shown in the reference photo, 
      with the same color, pattern, sleeves, and accessories. Do not alter or vary the clothing style, color, or outfit at all from the reference. 
      Repeat this clothing style consistently for every generated illustration.`;

    const safeImageUrls = [];
    for (let i = 0; i < storyPages.length; ++i) {
      const page = storyPages[i];
      // Use fallback prompt if safety filter triggers: remove all "reference photo" and just use a generic prompt
      const safePrompt = `${page.illustration_prompt}.
        Style: beautiful children's book illustration, child character, clean line-work, soft vibrant colors. Do not include any text, captions, letters, or words in the image.`;
      const fullPrompt = `
${childDescriptor}.
${page.illustration_prompt}.
Style: ultra-detailed 3D Pixar-style children's illustration with cinematic lighting and realistic textures. 
Render the child with consistent facial features, hairstyle, and clothing (exactly as described above and shown in the reference). 
Use warm, soft lighting with a cozy, storybook atmosphere. 
Focus on expressive eyes, natural skin tones, and lifelike depth of field. 
Keep the environment richly detailed but child-friendly — use smooth edges, soft shadows, and gentle color gradients.
Maintain the same outfit and proportions across all scenes.
Do NOT introduce new clothing, accessories, or props beyond those described.
Do NOT include any text, captions, or words in the image.
`;

      const url = await safeGenerateImage(fullPrompt, safePrompt);
      if (!url)
        throw new Error(`DALL-E 3 failed to generate image for page ${i + 1}.`);
      safeImageUrls.push(url);
    }

    if (safeImageUrls.length !== 5)
      throw new Error(
        "DALL-E 3 failed to generate all 5 images even after retries."
      );
    console.log(`[STORY ID: ${storyId}] Temporary image URLs received.`);

    const permanentImageUrls = await Promise.all(
      safeImageUrls.map(async (tempUrl, index) => {
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
