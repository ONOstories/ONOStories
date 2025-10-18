// filepath: h:\ONO\ONO Stories\ONOStories\supabase\functions\_shared\supabaseAdmin.ts
import { createClient } from 'npm:@supabase/supabase-js@2.44.2';

// Create a single Supabase client for interacting with your database
export const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);