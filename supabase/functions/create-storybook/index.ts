// supabase/functions/create-storybook/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.4";
import { PDFDocument, rgb } from "https://esm.sh/pdf-lib@1.17.1";
import { corsHeaders } from "../_shared/cors.ts";

// The main function that handles requests
serve(async (req) => {
  console.log("--- Create-storybook function invoked! ---");

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. INITIAL SETUP
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const REPLICATE_API_KEY = Deno.env.get("REPLICATE_API_KEY");
    if (!REPLICATE_API_KEY) {
      throw new Error("REPLICATE_API_KEY is not set in Supabase secrets.");
    }

    const { storyId, userId } = await req.json();
    if (!storyId || !userId) {
      throw new Error("Missing storyId or userId in the request body.");
    }

    console.log(`[STORY: ${storyId}] Starting storybook creation for user: ${userId}`);

    // 2. FETCH INITIAL STORY DATA
    const { data: initialStoryData, error: fetchError } = await supabaseClient
      .from("stories")
      .select("title, child_name, short_description")
      .eq("id", storyId)
      .single();

    if (fetchError) throw fetchError;
    if (!initialStoryData) throw new Error("Initial story data not found.");
    
    const { title, child_name, short_description } = initialStoryData;

    // 3. GENERATE STORY CONTENT IN MEMORY
    console.log(`[STORY: ${storyId}] Generating story content...`);
    const generatedPages = [
      {
        page_number: 1,
        content: `Once upon a time, a brave child named ${child_name} decided to go on an adventure based on this idea: "${short_description}".`,
        illustration_prompt: `A cute child named ${child_name} looking excited at the start of an adventure, vibrant children's storybook illustration style.`
      },
      {
        page_number: 2,
        content: `${child_name} journeyed through a magical forest and met a friendly talking squirrel.`,
        illustration_prompt: `The child ${child_name} talking to a friendly squirrel on a tree branch in a magical, glowing forest, simple cartoon style.`
      },
      {
        page_number: 3,
        content: `Together, they discovered a hidden treasure chest filled with sparkling candies and toys.`,
        illustration_prompt: `The child ${child_name} and a squirrel opening a glowing treasure chest full of candy, joyous and colorful.`
      }
    ];
    console.log(`[STORY: ${storyId}] Story content generated.`);

    // 4. IMAGE GENERATION & PDF CREATION
    const pdfDoc = await PDFDocument.create();

    for (let i = 0; i < generatedPages.length; i++) {
      const page = generatedPages[i];
      console.log(`[STORY: ${storyId}] Generating image for page ${i + 1} with Replicate...`);

      const startResponse = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${REPLICATE_API_KEY}`
        },
        body: JSON.stringify({
          // *** CRITICAL FIX: Updated to the latest correct version hash for SDXL ***
          version: "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
          input: { prompt: page.illustration_prompt }
        }),
      });

      let prediction = await startResponse.json();
      if (startResponse.status !== 201) {
        throw new Error(`Replicate API failed to start prediction: ${prediction.detail}`);
      }

      while (prediction.status !== "succeeded" && prediction.status !== "failed") {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const pollResponse = await fetch(prediction.urls.get, {
          headers: {
            "Authorization": `Token ${REPLICATE_API_KEY}`,
            "Content-Type": "application/json",
          }
        });
        prediction = await pollResponse.json();
        console.log(`[STORY: ${storyId}] Polling Replicate... status: ${prediction.status}`);
      }

      if (prediction.status === "failed") {
        throw new Error(`Replicate image generation failed: ${prediction.error}`);
      }

      const imageUrl = prediction.output[0];
      const imageResponse = await fetch(imageUrl);
      const imageBytes = await imageResponse.arrayBuffer();
      const embeddedImage = await pdfDoc.embedPng(imageBytes);

      const pdfPage = pdfDoc.addPage();
      const { width, height } = pdfPage.getSize();
      
      pdfPage.drawImage(embeddedImage, {
        x: 50, y: height / 2, width: width - 100, height: height / 2 - 50,
      });

      pdfPage.drawText(page.content, {
        x: 50, y: 50, size: 14, color: rgb(0, 0, 0), maxWidth: width - 100, lineHeight: 20,
      });

      console.log(`[STORY: ${storyId}] Successfully added page ${i + 1} to PDF.`);
    }

    // 5. SAVE AND UPLOAD THE FINAL PDF
    const pdfBytes = await pdfDoc.save();
    const pdfFileName = `${title.replace(/\s+/g, '_')}_${storyId}.pdf`;
    const filePath = `${userId}/${pdfFileName}`;

    const { error: uploadError } = await supabaseClient.storage
      .from("story_pdfs")
      .upload(filePath, pdfBytes, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabaseClient.storage
      .from("story_pdfs")
      .getPublicUrl(filePath);

    console.log(`[STORY: ${storyId}] Storybook PDF successfully created and uploaded.`);

    // 6. RETURN THE PUBLIC URL
    return new Response(JSON.stringify({ pdfUrl: urlData.publicUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in create-storybook function:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
