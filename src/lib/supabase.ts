/**
 * Supabase client and helpers
 * - Uses NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
 * - Exports `getColleges()` which returns only verified colleges
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Read env vars and trim whitespace
let SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
let SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

// Defensive check: sometimes env vars are accidentally swapped or misconfigured.
// If the values look swapped (key looks like a URL or url looks like a key),
// swap them to avoid `ERR_INVALID_URL` when creating the client.
const looksLikeUrl = (v?: string) => {
  if (!v) return false;
  if (/^https?:\/\//i.test(v)) return true;
  if (v.includes('.supabase.co')) return true;
  return false;
};

const looksLikeKey = (v?: string) => {
  if (!v) return false;
  // common Supabase token patterns: 'sb_publishable_', JWTs start with 'eyJ', or contain 'anon'/'publishable'
  return /^sb[_-]/i.test(v) || /^eyJ/.test(v) || /anon|publishable|public[-_]/i.test(v);
};

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  if (looksLikeKey(SUPABASE_URL) && looksLikeUrl(SUPABASE_ANON_KEY)) {
    console.warn('Detected swapped Supabase env vars — swapping NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    const tmp = SUPABASE_URL;
    SUPABASE_URL = SUPABASE_ANON_KEY;
    SUPABASE_ANON_KEY = tmp;
  }
}

// If the URL looks like a supabase host but is missing a scheme, add https://
if (SUPABASE_URL && !/^https?:\/\//i.test(SUPABASE_URL) && SUPABASE_URL.includes('.supabase.co')) {
  console.info('Normalizing Supabase URL by adding https:// prefix.');
  SUPABASE_URL = `https://${SUPABASE_URL}`;
}

// Mask helper for logging (don't print full secrets)
const mask = (v?: string) => {
  if (!v) return '<empty>';
  if (v.length <= 10) return '*****';
  return v.slice(0, 6) + '...' + v.slice(-4);
};
let supabase: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (supabase) return supabase;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.', {
      NEXT_PUBLIC_SUPABASE_URL: mask(SUPABASE_URL),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: mask(SUPABASE_ANON_KEY),
    });
    throw new Error('Supabase environment variables are not set');
  }

  // Validate URL now, at client-creation time, to avoid build-time issues.
  try {
    // eslint-disable-next-line no-new
    new URL(SUPABASE_URL);
  } catch (err) {
    console.error('Invalid NEXT_PUBLIC_SUPABASE_URL:', mask(SUPABASE_URL));
    throw new Error('Invalid NEXT_PUBLIC_SUPABASE_URL environment variable');
  }

  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false }
  });

  return supabase;
}

export async function getColleges() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('Supabase env vars not set; returning empty colleges list.');
    return [];
  }

  const client = getSupabaseClient();

  const { data, error } = await client
    .from('colleges')
    .select(
      'id,name,district,college_type,ownership_type,official_website,image_url,verified,created_at'
    )
    .eq('verified', true)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []).map((r: any) => ({
    id: String(r.id),
    name: r.name ?? '',
    district: r.district ?? '',
    type: r.college_type ?? '',
    ownership: r.ownership_type ?? '',
    image_url: r.image_url ?? null,
    website: r.official_website ?? null,
    verified: Boolean(r.verified),
    created_at: r.created_at ?? null
  }));
}
