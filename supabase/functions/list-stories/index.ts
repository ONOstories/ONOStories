// supabase/functions/list-stories/index.ts
import { createServerClient } from 'https://esm.sh/@supabase/ssr@0.4.0';
import { corsHeaders } from '../_shared/cors.ts';

function parseCookies(h: string | null) {
  const m = new Map<string, string>();
  if (!h) return m;
  h.split(';').forEach(p => { const i = p.indexOf('='); if (i > -1) m.set(p.slice(0, i).trim(), decodeURIComponent(p.slice(i + 1).trim())); });
  return m;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const headers = new Headers({ ...corsHeaders, 'Content-Type': 'application/json' });
  const url = new URL(req.url);

  const secure = !!Deno.env.get('DENO_DEPLOYMENT_ID');
  const sameSite = 'Lax';
  const path = '/';

  const jar = parseCookies(req.headers.get('Cookie'));
  const setCookies: string[] = [];

  const supabase = createServerClient(
    Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!,
    {
      cookies: {
        get: (n) => jar.get(n),
        set: (n, v, o) => {
          let c = `${n}=${v}; Path=${path}; HttpOnly; SameSite=${sameSite}`;
          if (secure) c += '; Secure';
          if (o?.maxAge) c += `; Max-Age=${o.maxAge}`;
          setCookies.push(c);
        },
        remove: (n) => {
          let c = `${n}=; Path=${path}; HttpOnly; SameSite=${sameSite}; Max-Age=0`;
          if (secure) c += '; Secure';
          setCookies.push(c);
        },
      },
    }
  );

  // FETCH FREE STORIES (all users)
  const { data: free, error: freeError } = await supabase
    .from('stories')
    .select('id, title, pdf_url, status, storybook_data, created_at')
    .eq('is_free', true)
    .eq('status', 'complete')
    .order('created_at', { ascending: false });

  // If freeOnly, return immediately (anonymous-friendly)
  if (url.searchParams.get('freeOnly') === 'true') {
    for (const c of setCookies) headers.append('Set-Cookie', c);
    if (freeError) return new Response(JSON.stringify({ error: freeError.message }), { headers, status: 403 });
    return new Response(JSON.stringify({ free }), { headers, status: 200 });
  }

  // Auth required for generated stories
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    for (const c of setCookies) headers.append('Set-Cookie', c);
    return new Response(JSON.stringify({ error: 'Unauthenticated' }), { headers, status: 401 });
  }

  // FETCH USER'S GENERATED STORIES (that are not marked free)
  const { data: generated, error: genError } = await supabase
    .from('stories')
    .select('id, title, pdf_url, status, storybook_data, created_at')
    .eq('user_id', user.id)
    .or('is_free.is.false,is_free.is.null')
    .order('created_at', { ascending: false });

  for (const c of setCookies) headers.append('Set-Cookie', c);
  if (freeError || genError)
    return new Response(JSON.stringify({ error: freeError?.message ?? genError?.message }), { headers, status: 403 });

  return new Response(JSON.stringify({ free, generated }), { headers, status: 200 });
});
