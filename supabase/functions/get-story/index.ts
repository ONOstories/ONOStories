// supabase/functions/get-story/index.ts
import { createServerClient } from "https://esm.sh/@supabase/ssr@0.4.0";
import { corsHeaders } from "../_shared/cors.ts";

function parseCookies(h: string | null) {
  const m = new Map<string, string>();
  if (!h) return m;
  h.split(";").forEach((p) => {
    const i = p.indexOf("=");
    if (i > -1)
      m.set(p.slice(0, i).trim(), decodeURIComponent(p.slice(i + 1).trim()));
  });
  return m;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders });
  const headers = new Headers({
    ...corsHeaders,
    "Content-Type": "application/json",
  });
  const secure = !!Deno.env.get("DENO_DEPLOYMENT_ID");
  const sameSite = "Lax";
  const path = "/";
  const jar = parseCookies(req.headers.get("Cookie"));
  const setCookies: string[] = [];
  const url = new URL(req.url);
  const storyId = url.searchParams.get("storyId");

  if (!storyId)
    return new Response(JSON.stringify({ error: "Missing storyId" }), {
      headers,
      status: 400,
    });

  const supabase = createServerClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    {
      cookies: {
        get: (n) => jar.get(n),
        set: (n, v, o) => {
          let c = `${n}=${v}; Path=${path}; HttpOnly; SameSite=${sameSite}`;
          if (secure) c += "; Secure";
          if (o?.maxAge) c += `; Max-Age=${o.maxAge}`;
          setCookies.push(c);
        },
        remove: (n) => {
          let c = `${n}=; Path=${path}; HttpOnly; SameSite=${sameSite}; Max-Age=0`;
          if (secure) c += "; Secure";
          setCookies.push(c);
        },
      },
    }
  );

  // Get user (but don't require authentication)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Build query based on whether user is authenticated or not
  let query = supabase
    .from("stories")
    .select("title, storybook_data")
    .eq("id", storyId);

  if (user) {
    // Authenticated user: can see their own stories OR free stories
    query = query.or(`user_id.eq.${user.id},is_free.eq.true`);
  } else {
    // Anonymous user: can only see free stories
    query = query.eq("is_free", true);
  }

  const { data, error } = await query.single();

  for (const c of setCookies) headers.append("Set-Cookie", c);
  if (error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers,
      status: 403,
    });
  return new Response(JSON.stringify({ story: data ?? null }), {
    headers,
    status: 200,
  });
});
