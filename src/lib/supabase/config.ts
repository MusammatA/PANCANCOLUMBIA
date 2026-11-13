export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
export const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

/** False until the Supabase settings are added; the site then shows its built-in content and login is off. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const IMAGE_BUCKET = 'site-images';
