import { serve } from "https://deno.land/std@0.201.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const plans = {
  monthly: { price: 399 * 100, duration_days: 30 },
  annual: { price: 4214 * 100, duration_days: 365 },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { planId, userId } = await req.json();

    if (!planId || !userId) throw new Error("Plan ID and User ID are required.");
    const plan = plans[planId as keyof typeof plans];
    if (!plan) throw new Error("Invalid plan selected.");

    const key_id = Deno.env.get("RAZORPAY_KEY_ID")!;
    const key_secret = Deno.env.get("RAZORPAY_KEY_SECRET")!;

    // Use built-in btoa for Basic Auth, no external library needed
    const authString = btoa(`${key_id}:${key_secret}`);

    const orderOptions = {
      amount: plan.price,
      currency: "INR",
      receipt: `receipt_order_${new Date().getTime()}`,
      notes: { user_id: userId, plan_id: planId },
    };

    // Use Deno's native fetch, no external library needed
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${authString}`,
      },
      body: JSON.stringify(orderOptions),
    });

    if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(errorBody.error.description || "Failed to create Razorpay order");
    }

    const order = await response.json();

    return new Response(JSON.stringify(order), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});