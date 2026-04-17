import 'react-native-url-polyfill/auto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';
import type { Database } from '../../types/database';

export const MISSING_SUPABASE_ENV_MESSAGE =
  '[supabaseClient] Missing SUPABASE_URL or SUPABASE_ANON_KEY. ' +
    'Copy .env.example to .env, fill in the Supabase credentials, then rebuild the app.';

const SUPABASE_URL = Config.SUPABASE_URL?.trim();
const SUPABASE_ANON_KEY = Config.SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/**
 * Supabase browser client, or `null` when native config has no URL/key (e.g. no
 * `.env` yet). Do **not** throw at import time — a failed module aborts exports
 * and leaves `supabase` as `undefined`, which breaks callers like `authStore`.
 *
 * Use `requireSupabase()` inside services that must perform network calls.
 */
export const supabase: SupabaseClient<Database> | null =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          storage: AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      })
    : null;

export function requireSupabase(): SupabaseClient<Database> {
  if (!supabase) {
    throw new Error(MISSING_SUPABASE_ENV_MESSAGE);
  }
  return supabase;
}
