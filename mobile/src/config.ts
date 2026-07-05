import { SUPABASE_URL, SUPABASE_ANON_KEY, API_BASE_URL } from '@env';

export const config = {
  supabaseUrl: SUPABASE_URL ?? '',
  supabaseAnonKey: SUPABASE_ANON_KEY ?? '',
  apiBaseUrl: API_BASE_URL ?? 'http://localhost:3000',
};

export const isConfigured = Boolean(config.supabaseUrl && config.supabaseAnonKey);
