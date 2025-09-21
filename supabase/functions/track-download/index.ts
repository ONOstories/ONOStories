import { createServerClient } from 'https://esm.sh/@supabase/ssr@0.4.0';
import { corsHeaders } from '../_shared/cors.ts';

function parseCookies(header: string | null) {
  const map = new Map();
  if (!header) return map;
  header.split(';').forEach((p) => {
    const i = p.indexOf('=');
    if (i > -1) map.set(p.slice(0, i).trim(), decodeURIComponent(p.slice(i + 1).trim()));
  });
  return map;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const headers = new Headers({ ...corsHeaders, 'Content-Type': 'application/json' });

  const cookieJar = parseCookies(req.headers.get('Cookie'));
  const supabase = createServerClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { cookies: { get: (n) => cookieJar.get(n), set: ()=>{}, remove: ()=>{} } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response(JSON.stringify({ error: 'Unauthenticated' }), { headers, status: 401 });
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('role, plan_expires_at, stories_downloaded, subscription_status')
    .eq('id', user.id)
    .single();

  if (profileErr || !profile) {
    return new Response(JSON.stringify({ error: 'Profile not found' }), { headers, status: 403 });
  }
  // Downgrade expired
  if (profile.plan_expires_at && new Date(profile.plan_expires_at) < new Date()) {
    await supabase.from('profiles').update({
      role: 'normaluser',
      subscription_status: 'inactive',
      plan_expires_at: null
    }).eq('id', user.id);
    return new Response(JSON.stringify({ error: 'Your Pro plan has expired.' }), { headers, status: 403 });
  }
  if (profile.role === 'prouser') {
    const days = Math.round(
      (new Date(profile.plan_expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    const isAnnual = days > 60;

    const maxDownloads = isAnnual ? 120 : 10;
    if (profile.stories_downloaded >= maxDownloads) {
      // Downgrade on overflow
      await supabase.from('profiles').update({
        role: 'normaluser',
        subscription_status: 'inactive',
        plan_expires_at: null
      }).eq('id', user.id);
      return new Response(JSON.stringify({
        error: `Download limit reached (${maxDownloads}). Your plan has expired.`
      }), { headers, status: 403 });
    }
    await supabase
      .from('profiles')
      .update({ stories_downloaded: (profile.stories_downloaded ?? 0) + 1 })
      .eq('id', user.id);
    return new Response(JSON.stringify({ ok: true }), { headers, status: 200 });
  }
  // Normal users: unlimited, or restrict as needed
  return new Response(JSON.stringify({ ok: true }), { headers, status: 200 });
});
