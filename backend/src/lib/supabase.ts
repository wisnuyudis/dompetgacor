import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');

/** Admin client (service_role) — server only. Bypasses RLS. */
export function supabaseAdmin(): SupabaseClient {
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  return createClient(url!, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Client yang bertindak atas nama user (memakai access token dari mobile).
 * RLS + auth.uid() berlaku, jadi RPC SECURITY DEFINER aman.
 */
export function supabaseAsUser(accessToken: string): SupabaseClient {
  if (!anonKey) throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
  return createClient(url!, anonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
