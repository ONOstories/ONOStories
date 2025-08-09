// supabase/functions/create-storybook/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@^1.17.1";

// --- Keys and URLs from Environment Variables ---
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const HUGGINGFACE_API_KEY = Deno.env.get("HUGGINGFACE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

serve(async (req) => {
  const { record: story } = await req.json();

  try {
    // 1. Update story status to 'processing'
    await supabase.from("stories").update({ status: 'processing' }).eq('id', story.id);

    // ... (Steps 2 and 3 for Gemini and Hugging Face remain exactly the same)
    
    // Clean up the response from Gemini to get a valid JSON string, then parse it
    // ... (code for Gemini response parsing)

    // Generate Illustrations using Hugging Face and Create the PDF
    const pdfDoc = await PDFDocument.create();
    for (const page of storyPages) {
      // ... (code for image generation and adding to PDF)
    }

    // 4. Save the generated PDF to Supabase Storage
    const pdfBytes = await pdfDoc.save();
    const pdfPath = `${story.user_id}/${story.id}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from('storybooks')
      .upload(pdfPath, pdfBytes, { contentType: 'application/pdf', upsert: true });

    if (uploadError) throw uploadError;

    // 5. Update the story record with the public PDF URL and 'complete' status
    const { data: { publicUrl } } = supabase.storage.from('storybooks').getPublicUrl(pdfPath);
    
    const { data: updatedStory, error: updateError } = await supabase.from('stories')
      .update({ status: 'complete', pdf_url: publicUrl })
      .eq('id', story.id)
      .select() // IMPORTANT: select() returns the updated row
      .single();

    if (updateError) throw updateError;


    // --- NEW STEP 6: Broadcast a success message directly to the user ---
    const channel = supabase.channel(`stories-${story.user_id}`);
    await channel.send({
      type: 'broadcast',
      event: 'story-complete',
      payload: { story: updatedStory }, // Send the complete story object
    });
    

    // 7. Return a success response
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in create-storybook function:", error);
    await supabase.from("stories").update({ status: 'failed' }).eq('id', story.id);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});