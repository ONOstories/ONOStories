// supabase/functions/auth-login/index.ts
import { createServerClient } from 'https://esm.sh/@supabase/ssr@0.4.0';
import { corsHeaders } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';

function parseCookies(header: string | null) {
  const map = new Map<string, string>();
  if (!header) return map;
  header.split(';').forEach((p) => {
    const i = p.indexOf('=');
    if (i > -1) map.set(p.slice(0, i).trim(), p.slice(i + 1).trim());
  });
  return map;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const headers = new Headers({ ...corsHeaders, 'Content-Type': 'application/json' });
  const secure = !!Deno.env.get('DENO_DEPLOYMENT_ID'); // true on Edge deploy
  const sameSite = 'Lax';
  const path = '/';

  const cookieJar = parseCookies(req.headers.get('Cookie'));
  const setCookies: string[] = [];

  const supabase = createServerClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    {
      cookies: {
        get(name: string) {
          return cookieJar.get(name);
        },
        set(name: string, value: string, options: { maxAge?: number }) {
          let c = `${name}=${value}; Path=${path}; HttpOnly; SameSite=${sameSite}`;
          if (secure) c += '; Secure';
          if (options?.maxAge) c += `; Max-Age=${options.maxAge}`;
          setCookies.push(c);
        },
        remove(name: string) {
          let c = `${name}=; Path=${path}; HttpOnly; SameSite=${sameSite}; Max-Age=0`;
          if (secure) c += '; Secure';
          setCookies.push(c);
        },
      },
    }
  );

  try {
    const { email, password } = await req.json();

    // 1. Check if user exists using the admin client
    const { data: user, error: userError } = await supabaseAdmin
      .from('profiles') // or 'users' in the 'auth' schema if you prefer
      .select('id')
      .eq('email', email)
      .single();

    if (userError || !user) {
      // User not found, return a clear message. Use 401 for consistency.
      return new Response(JSON.stringify({ error: 'Email not registered. Please sign up first.' }), { headers, status: 401 });
    }

    // 2. If user exists, attempt to sign in with password
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError || !data.session) {
      // This will now correctly handle only the invalid password case
      return new Response(JSON.stringify({ error: 'Invalid login credentials.' }), { headers, status: 401 });
    }

    for (const c of setCookies) headers.append('Set-Cookie', c);
    return new Response(JSON.stringify({ ok: true }), { headers, status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), { headers, status: 500 });
  }
});
