import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('placeholder')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

/**
 * Upload compressed slip or ticket directly to Supabase Storage
 */
export async function uploadToSupabaseStorage(
  bucketName: 'slips' | 'tickets' | 'trip-assets',
  filePath: string,
  fileBlob: Blob
): Promise<string | null> {
  if (!supabase || !isSupabaseConfigured) return null;

  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileBlob, {
        upsert: true,
        contentType: fileBlob.type || 'image/jpeg',
      });

    if (error) {
      console.error('Supabase storage upload error:', error);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('Failed to upload to Supabase:', err);
    return null;
  }
}

/**
 * Trigger Real Instagram OAuth 2.0 flow via Supabase
 */
export async function signInWithInstagram() {
  if (!supabase || !isSupabaseConfigured) {
    console.warn('Supabase not configured. Using mock login simulation.');
    return;
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'facebook', // Meta / Instagram uses Facebook/Meta Graph API provider or Custom OIDC
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      scopes: 'public_profile,email',
    },
  });

  if (error) {
    console.error('Error signing in with Instagram:', error);
    throw error;
  }

  return data;
}
