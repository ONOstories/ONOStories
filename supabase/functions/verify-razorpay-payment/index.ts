import { serve } from "https://deno.land/std@0.201.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const plans = {
  monthly: { price: 399 * 100, duration_days: 30 },
  annual: { price: 4214 * 100, duration_days: 365 },
};

serve(async (req) => {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const webhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET")!;

    if (!signature) throw new Error("Signature missing from header");

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(webhookSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

    if (expectedSignature !== signature) {
      throw new Error("Invalid webhook signature");
    }

    const payload = JSON.parse(body);

    if (payload.event === "payment.captured") {
      const payment = payload.payload.payment.entity;
      const userId = payment.notes.user_id;
      const planId = payment.notes.plan_id;

      if (!userId || !planId) throw new Error("User ID or Plan ID missing");
      const plan = plans[planId as keyof typeof plans];
      if (!plan) throw new Error("Invalid plan details in payment");

      // UPDATED: Use the new secret names
      const supabaseAdmin = createClient(
          Deno.env.get('ONO_SUPABASE_URL') ?? '',
          Deno.env.get('ONO_SERVICE_ROLE_KEY') ?? '',
          {
            auth: {
              persistSession: false,
              autoRefreshToken: false,
              detectSessionInUrl: false,
            },
          }
      );

      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + plan.duration_days);

      const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({
          role: "prouser",
          subscription_status: "active",
          plan_expires_at: expiryDate.toISOString(),
          stories_generated: 0,
          stories_downloaded: 0
        })
        .eq("id", userId);

      if (updateError) throw new Error(updateError.message);
    }

    return new Response(JSON.stringify({ status: "ok" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});