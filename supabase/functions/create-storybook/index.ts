// supabase/functions/create-storybook/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import {
  createClient,
  SupabaseClient,
} from "https://esm.sh/@supabase/supabase-js@2";
import { OpenAI } from "https://esm.sh/openai@4.10.0";
import { corsHeaders } from "../_shared/cors.ts";

// Robust base64 encoder (avoids String.fromCharCode(...Uint8Array))
import { encode as encodeBase64 } from "https://deno.land/std@0.177.0/encoding/base64.ts";

const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") });
const geminiApiKey = Deno.env.get("GEMINI_API_KEY");

// Use header-based auth (x-goog-api-key) and keep v1beta generateContent endpoint
const geminiApiUrl =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

interface StoryPage {
  narration: string;
  illustration_prompt: string;
}

async function updateStory(
  supabase: SupabaseClient,
  storyId: string,
  updates: object,
) {
  console.log(`[STORY ID: ${storyId}] Attempting to update with:`, updates);
  const { error } = await supabase.from("stories").update(updates).eq("id", storyId);
  if (error) {
    console.error(
      `[STORY ID: ${storyId}] FATAL: Could not update story. Reason:`,
      error.message,
    );
    throw new Error(`Supabase update failed: ${error.message}`);
  } else {
    console.log(`[STORY ID: ${storyId}] Story updated successfully.`);
  }
}

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
  } catch (err: any) {
    if (
      String(err?.message || "").toLowerCase().includes("safety system") ||
      String(err?.message || "").toLowerCase().includes("not allowed")
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
        } catch (fallbackErr: any) {
          console.warn(
            "[DALL-E fallback also failed]",
            fallbackErr.message,
            fallbackPrompt,
          );
        }
      }
    }
    throw err;
  }
}

// Helper: fetch image, ensure it's an image, derive MIME, and base64-encode safely
async function fetchAndEncodeImage(url: string) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) {
    throw new Error(`Could not fetch child photo: ${res.status} ${res.statusText}`);
  }

  // Try Content-Type header first
  let mimeType = res.headers.get("content-type")?.split(";")[0]?.toLowerCase() ?? "";

  // If header absent or not an image, infer from extension
  if (!mimeType.startsWith("image/")) {
    const ext = new URL(url).pathname.split(".").pop()?.toLowerCase() ?? "";
    const map: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      heic: "image/heic",
      heif: "image/heif",
    };
    mimeType = map[ext] ?? "image/jpeg";
  }

  if (!mimeType.startsWith("image/")) {
    throw new Error(`Photo URL is not an image (mime: ${mimeType}).`);
  }

  const arrBuf = await res.arrayBuffer();
  const base64 = encodeBase64(new Uint8Array(arrBuf));

  return { mimeType, base64 };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  let storyId: string | null = null;
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
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
    if (fetchError || !storyRecord) {
      throw new Error(`Failed to fetch story record: ${fetchError?.message}`);
    }

    const {
      user_id,
      title,
      child_name,
      gender,
      age,
      genre,
      short_description,
      photo_url, // image for Gemini
    } = storyRecord;

    // 1) Describe the child from the photo using Gemini image understanding
    console.log(
      `[STORY ID: ${storyId}] Requesting child description from Gemini Vision.`,
    );

    const visionPrompt = `
      Analyze the provided image of a child. Provide a detailed, factual description focusing on visual attributes for an AI illustrator.
      Describe the following, keeping the descriptions concise and clear:
      - Hair: color, style (e.g., short and straight, curly, long and wavy), and any notable features like bangs.
      - Eyes: color.
      - Skin tone: (e.g., light, medium, dark).
      - Clothing: Describe the main outfit in detail, including the type of clothing (e.g., t-shirt, dress), color, and any patterns or graphics.
      - Distinct features: Mention any highly visible and defining features like glasses, freckles, etc. Extract only the features related to the child.Combine this into a single, cohesive paragraph. This description will be used to create a consistent character in a storybook.
    `.trim();

    // Fetch and encode the image, and detect the correct mime type
    const { mimeType, base64 } = await fetchAndEncodeImage(photo_url);

    // Place the image part FIRST, then the text part; pass key via header
    const visionResponse = await fetch(geminiApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": geminiApiKey!,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64,
                },
              },
              { text: visionPrompt },
            ],
          },
        ],
      }),
    });

    if (!visionResponse.ok) {
      throw new Error(`Gemini Vision API error: ${await visionResponse.text()}`);
    }

    const visionResult = await visionResponse.json();
    const characterDescriptionFromVision =
      visionResult?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!characterDescriptionFromVision) {
      throw new Error("Gemini Vision response was empty or malformed.");
    }

    console.log(
      `[STORY ID: ${storyId}] Successfully received description: "${characterDescriptionFromVision}"`,
    );

    // 2) Generate Story Text
    const storyPrompt = `
      You are an expert children's story author. Create a simple, heartwarming 5-page story using simple English that a 10-year-old can read.
      Output ONLY a valid JSON array of 5 objects. Each object must have "narration" (string, <=100 words) and "illustration_prompt" (string).
      Details -> Name: ${child_name}, Age: ${age}, Gender: ${gender}, Title: ${title}, Genre: ${genre}, Description: ${short_description}
    `.trim();

    const storyResponse = await fetch(geminiApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": geminiApiKey!,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: storyPrompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    });

    if (!storyResponse.ok) {
      throw new Error(`Gemini API error: ${await storyResponse.text()}`);
    }

    const storyResult = await storyResponse.json();
    const storyText = storyResult?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!storyText) throw new Error("Gemini story response was empty or malformed.");

    const storyPages: StoryPage[] = JSON.parse(storyText);
    console.log(`[STORY ID: ${storyId}] Story text generated.`);

    // 3) Use the Gemini-generated description for DALL·E
    const childDescriptor = `The main character is ${child_name}, an ${age}-year-old ${gender}.
**Appearance details:** ${characterDescriptionFromVision}
**Instruction for AI:** For ALL images, you must strictly and consistently draw the main character with the exact appearance, hairstyle, and clothing described above. Do not alter or vary the character's look across the illustrations.`;

    const safeImageUrls: string[] = [];
    for (let i = 0; i < storyPages.length; ++i) {
      const page = storyPages[i];
      const safePrompt = `${page.illustration_prompt}. Style: beautiful children's book illustration.`;
      const fullPrompt = `${childDescriptor}

**Scene:** ${page.illustration_prompt}

**Style:** ultra-detailed 3D Pixar-style children's illustration with cinematic lighting. Do NOT include any text or words.`;

      const url = await safeGenerateImage(fullPrompt, safePrompt);
      if (!url) throw new Error(`DALL-E 3 failed to generate image for page ${i + 1}.`);
      safeImageUrls.push(url);
    }

    if (safeImageUrls.length !== 5) {
      throw new Error("DALL-E 3 failed to generate all 5 images.");
    }
    console.log(`[STORY ID: ${storyId}] All 5 image URLs received.`);

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
        if (uploadError) {
          throw new Error(`Failed to upload image ${index + 1}: ${uploadError.message}`);
        }
        const {
          data: { publicUrl },
        } = supabaseAdmin.storage.from("storybooks").getPublicUrl(imagePath);
        return publicUrl;
      }),
    );

    console.log(`[STORY ID: ${storyId}] Images permanently stored.`);

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
  } catch (error: any) {
    console.error(
      `[STORY ID: ${storyId ?? "Unknown"}] CRITICAL ERROR:`,
      error.message,
    );
    if (storyId) {
      await supabaseAdmin
        .from("stories")
        .update({
          status: "failed",
          short_description: `Error: ${String(error.message).substring(0, 450)}`,
        })
        .eq("id", storyId);
    }
    return new Response(JSON.stringify({ error: String(error.message) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
