import { supabase } from '@/lib/supabase';

const PRIVATE_BUCKETS = new Set(['offer-letters', 'task-documents']);

/**
 * Rows keep the stable public-style URL so the path survives re-signing. These
 * buckets are private, so swap that URL for a short-lived signed URL at read
 * time. Returns the original value for anything else (public buckets, external
 * links, legacy absolute URLs).
 */
export async function resolvePrivateUrl(url?: string | null): Promise<string | undefined> {
  if (!url) return undefined;

  const marker = '/storage/v1/object/public/';
  const index = url.indexOf(marker);
  if (index === -1) return url;

  const [bucket, ...pathParts] = url.slice(index + marker.length).split('/');
  if (!PRIVATE_BUCKETS.has(bucket) || pathParts.length === 0) return url;

  let path: string;
  try {
    path = decodeURIComponent(pathParts.join('/'));
  } catch {
    path = pathParts.join('/');
  }

  const { data } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 3600);

  return data?.signedUrl ?? url;
}
