// supabase/functions/create-storybook/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.4";
import { PDFDocument, rgb } from "https://esm.sh/pdf-lib@1.17.1";
import { corsHeaders } from "../_shared/cors.ts";
import OpenAI from "https://deno.land/x/openai@v4.20.1/mod.ts";       // OpenAI SDK

/* ----------------------------------------------------------------- */
/* 1.  CONFIG & HELPERS                                              */
/* ----------------------------------------------------------------- */
const SUPABASE_URL              = Deno.env.get("VITE_SUPABASE_URL")                 ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")    ?? "";
const GEMINI_API_KEY            = Deno.env.get("GEMINI_API_KEY");              // for narration
const OPENAI_API_KEY            = Deno.env.get("OPENAI_API_KEY");              // for images
if (!GEMINI_API_KEY)  throw new Error("GEMINI_API_KEY not set.");
if (!OPENAI_API_KEY)  throw new Error("OPENAI_API_KEY not set.");

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const openai   = new OpenAI({ apiKey: OPENAI_API_KEY });

/* ----------------------------------------------------------------- */
/* 2.  MAIN EDGE FUNCTION                                            */
/* ----------------------------------------------------------------- */
serve(async (req) => {
  console.log("--- Create-storybook invoked ---");

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    /* -------------------------------------------------------------- */
    /* Parse payload                                                  */
    /* -------------------------------------------------------------- */
    const { storyId, userId } = await req.json();
    if (!storyId || !userId) throw new Error("storyId or userId missing.");

    /* -------------------------------------------------------------- */
    /* Pull base story metadata                                       */
    /* -------------------------------------------------------------- */
    const { data: storyMeta, error: metaErr } = await supabase
      .from("stories")
      .select("title, child_name, short_description, age, gender, genre")
      .eq("id", storyId)
      .single();
    if (metaErr) throw metaErr;
    if (!storyMeta) throw new Error("Story metadata not found.");

    const { title, child_name, short_description, age, gender, genre } = storyMeta;

    /* -------------------------------------------------------------- */
    /*  Ask Gemini-1.5-Pro for a 5-page JSON story                    */
    /* -------------------------------------------------------------- */
    console.log(`[STORY: ${storyId}] Requesting narration from Gemini…`);

    const geminiPrompt = `
      Create a 5-page children's story about a ${age}-year-old ${gender}
      named ${child_name}. Genre: ${genre}. Core idea: "${short_description}".
      Return raw JSON **array** of 5 objects with keys:
        "content"              – narration (≤100 words)
        "illustration_prompt"  – prompt for an image generator
      Example item:
      {
        "content": "....",
        "illustration_prompt": "...."
      }
    `.trim();

    const geminiResp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: geminiPrompt }] }],
          generationConfig: { response_mime_type: "application/json" },
        }),
      },
    );
    if (!geminiResp.ok) {
      const body = await geminiResp.text();
      throw new Error(`Gemini error ${geminiResp.status}: ${body}`);
    }

    const geminiJson = await geminiResp.json();
    const pages = JSON.parse(geminiJson.candidates[0].content.parts.text); // 5 pages
    console.log(`[STORY: ${storyId}] Narration received.`);

    /* -------------------------------------------------------------- */
    /*  Build PDF, one page at a time                                */
    /* -------------------------------------------------------------- */
    const pdf = await PDFDocument.create();

    for (const [idx, page] of pages.entries()) {
      console.log(`[STORY: ${storyId}] Generating DALL·E image for page ${idx + 1}…`);

      /* --- DALL·E 2 image ---------------------------------------- */
      const imgResp = await openai.images.generate({
        model: "dall-e-2",
        prompt: `${page.illustration_prompt}, children's storybook illustration, vibrant colors`,
        n: 1,
        size: "1024x1024",
      });
      const imgUrl   = imgResp.data[0].url;
      const imgBytes = await (await fetch(imgUrl)).arrayBuffer();
      const embedded = await pdf.embedPng(imgBytes);

      /* --- Add to PDF -------------------------------------------- */
      const pdfPage = pdf.addPage();
      const { width, height } = pdfPage.getSize();

      pdfPage.drawImage(embedded, {
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

      console.log(`[STORY: ${storyId}] Page ${idx + 1} added.`);
    }

    /* -------------------------------------------------------------- */
    /*  Save & upload PDF                                            */
    /* -------------------------------------------------------------- */
    const bytes     = await pdf.save();
    const fileName  = `${title.replace(/\s+/g, "_")}_${storyId}.pdf`;
    const filePath  = `${userId}/${fileName}`;

    const { error: upErr } = await supabase.storage
      .from("story_pdfs")
      .upload(filePath, bytes, { contentType: "application/pdf", upsert: true });
    if (upErr) throw upErr;

    const { data: urlData } = supabase.storage.from("story_pdfs").getPublicUrl(filePath);
    console.log(`[STORY: ${storyId}] PDF stored.`);

    /* -------------------------------------------------------------- */
    /*  Return public URL                                            */
    /* -------------------------------------------------------------- */
    return new Response(
      JSON.stringify({ pdfUrl: urlData.publicUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (err) {
    console.error("Create-storybook error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});
