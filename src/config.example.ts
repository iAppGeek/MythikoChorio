// Copy this file to src/config.ts and fill in your Supabase credentials.
// src/config.ts is gitignored — never commit real credentials.
//
// Find these values in your Supabase dashboard → Settings → API.

export const config = {
  supabaseUrl: 'https://your-project-ref.supabase.co',
  supabaseAnonKey: 'your-anon-key-here',
} as const;
