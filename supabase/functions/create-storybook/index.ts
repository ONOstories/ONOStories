// supabase/functions/create-storybook/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.4";
import { PDFDocument, rgb } from "https://esm.sh/pdf-lib@1.17.1";
import { corsHeaders } from "../_shared/cors.ts";

// The main function that handles requests
serve(async (req) => {
  console.log("--- Create-storybook function invoked! ---"); // DEBUG: Check if function is reached

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. INITIAL SETUP
    // -----------------
    // Create a Supabase client with the service role key for admin-level access
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get the Replicate API key from environment variables (Supabase Secrets)
    const REPLICATE_API_KEY = Deno.env.get("REPLICATE_API_KEY");
    if (!REPLICATE_API_KEY) {
      throw new Error("REPLICATE_API_KEY is not set in Supabase secrets.");
    }

    // Extract the story ID and user ID from the request body
    const { storyId, userId } = await req.json();
    if (!storyId || !userId) {
      throw new Error("Missing storyId or userId in the request body.");
    }

    console.log(`[STORY: ${storyId}] Starting storybook creation for user: ${userId}`);

    // 2. FETCH STORY DATA
    // -------------------
    // Retrieve the story content and pages from your database
    const { data: storyData, error: storyError } = await supabaseClient
      .from("stories")
      .select("title, pages")
      .eq("id", storyId)
      .single();

    if (storyError) throw storyError;
    if (!storyData) throw new Error("Story not found.");

    const storyPages = storyData.pages as { page_number: number; content: string; illustration_prompt: string }[];
    const storyTitle = storyData.title;

    // 3. IMAGE GENERATION & PDF CREATION
    // ------------------------------------
    const pdfDoc = await PDFDocument.create();

    // Loop through each page of the story
    for (let i = 0; i < storyPages.length; i++) {
      const page = storyPages[i];
      console.log(`[STORY: ${storyId}] Generating image for page ${i + 1} with Replicate...`);

      // A. START THE REPLICATE PREDICTION
      const startResponse = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${REPLICATE_API_KEY}`
        },
        body: JSON.stringify({
          version: "ac732df83cea72166812028106150c841417482f5780aa4e97a85c602DE7775F",
          input: {
            prompt: `${page.illustration_prompt}, children's storybook illustration, vibrant colors, simple style`
          }
        }),
      });

      let prediction = await startResponse.json();
      if (startResponse.status !== 201) {
        throw new Error(`Replicate API failed to start prediction: ${prediction.detail}`);
      }

      // B. POLL FOR THE RESULT (ASYNC PROCESS)
      while (prediction.status !== "succeeded" && prediction.status !== "failed") {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second
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

      // C. PROCESS THE SUCCESSFUL RESULT
      const imageUrl = prediction.output[0];
      const imageResponse = await fetch(imageUrl);
      const imageBytes = await imageResponse.arrayBuffer();

      // D. ADD IMAGE AND TEXT TO PDF
      const pdfPage = pdfDoc.addPage();
      const { width, height } = pdfPage.getSize();
      const embeddedImage = await pdfDoc.embedPng(imageBytes);

      pdfPage.drawImage(embeddedImage, {
        x: 50,
        y: height / 2,
        width: width - 100,
        height: height / 2 - 50,
      });

      pdfPage.drawText(page.content, {
        x: 50,
        y: 50,
        size: 14,
        color: rgb(0, 0, 0),
        maxWidth: width - 100,
        lineHeight: 20,
      });

      console.log(`[STORY: ${storyId}] Successfully added page ${i + 1} to PDF.`);
    }

    // 4. SAVE AND UPLOAD THE FINAL PDF
    // --------------------------------
    const pdfBytes = await pdfDoc.save();
    const pdfFileName = `${storyTitle.replace(/\s+/g, '_')}_${storyId}.pdf`;
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

    // 5. RETURN THE PUBLIC URL
    // ------------------------
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
