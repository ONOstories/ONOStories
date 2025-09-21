// supabase/functions/start-story/index.ts
import { createServerClient } from 'https://esm.sh/@supabase/ssr@0.4.0';
import { corsHeaders } from '../_shared/cors.ts';

function parseCookies(header: string | null) {
  const map = new Map<string, string>();
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

  try {
    const formData = await req.formData();
    const photo = formData.get('photo') as File | null;
    const title = String(formData.get('title') ?? '');
    const childName = String(formData.get('childName') ?? '');
    const age = String(formData.get('age') ?? '');
    const gender = String(formData.get('gender') ?? '');
    const genre = String(formData.get('genre') ?? '');
    const short_description = String(formData.get('short_description') ?? '');

    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: 'Unauthenticated' }), { headers, status: 401 });
    }

      // Fetch user profile & check limits
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('role, plan_expires_at, stories_generated, stories_downloaded, subscription_status')
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

  // Pro limitations
  if (profile.role === 'prouser') {
    // Get plan type by expiry window
    const days = Math.round(
      (new Date(profile.plan_expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    const isAnnual = days > 60; // crude but effective

    const maxStories = isAnnual ? 236 : 20;

    if (profile.stories_generated >= maxStories) {
      // Downgrade on overflow
      await supabase.from('profiles').update({
        role: 'normaluser',
        subscription_status: 'inactive',
        plan_expires_at: null
      }).eq('id', user.id);
      return new Response(JSON.stringify({
        error: `Story generation limit reached (${maxStories}). Your plan has expired.`
      }), { headers, status: 403 });
    }
  }

    if (!photo) {
      return new Response(JSON.stringify({ error: 'Missing photo' }), { headers, status: 400 });
    }

    const fileExt = photo.name.split('.').pop() ?? 'jpg';
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    // Upload as the user; RLS must allow insert into child-photos at folder [auth.uid()]
    const { error: uploadError } = await supabase
      .storage
      .from('child-photos')
      .upload(filePath, photo, { upsert: false, contentType: photo.type });

    if (uploadError) {
      console.error('start-story: upload error', uploadError);
      return new Response(JSON.stringify({ error: uploadError.message }), { headers, status: 403 });
    }

    // If bucket is public, get a public URL; if private, consider creating a signed URL instead
    const { data: pub } = supabase.storage.from('child-photos').getPublicUrl(filePath);
    const photo_url = pub?.publicUrl ?? null;

    const { data: storyData, error: insertError } = await supabase
      .from('stories')
      .insert({
        user_id: user.id,
        title,
        child_name: childName,
        age: parseInt(age, 10),
        gender,
        genre,
        short_description,
        photo_url,
        status: 'pending',
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('start-story: insert error', insertError);
      return new Response(JSON.stringify({ error: insertError.message }), { headers, status: 403 });
    }

      if (profile.role === 'prouser') {
    await supabase
      .from('profiles')
      .update({ stories_generated: (profile.stories_generated ?? 0) + 1 })
      .eq('id', user.id);
  }

    for (const c of setCookies) headers.append('Set-Cookie', c);
    return new Response(JSON.stringify({ storyId: storyData.id, photo_url }), { headers, status: 200 });
  } catch (e) {
    console.error('start-story: Critical error:', e);
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), { headers, status: 500 });
  }
});
