// supabase/functions/auth-logout/index.ts
import { createServerClient } from 'https://esm.sh/@supabase/ssr@0.4.0';
import { corsHeaders } from '../_shared/cors.ts';

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
  const secure = !!Deno.env.get('DENO_DEPLOYMENT_ID');
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

  await supabase.auth.signOut();
  for (const c of setCookies) headers.append('Set-Cookie', c);
  return new Response(JSON.stringify({ ok: true }), { headers, status: 200 });
});
