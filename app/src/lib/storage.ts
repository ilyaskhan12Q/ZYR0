import { supabase } from '@/lib/supabase';

const PUBLIC_MARKER = '/storage/v1/object/public/';

/** Stored values are object names, but rows written before the buckets went private
 *  hold a full public URL. Both resolve to the object name the bucket expects. */
export function objectName(bucket: string, stored: string): string {
  const marker = `${PUBLIC_MARKER}${bucket}/`;
  const at = stored.indexOf(marker);
  return at === -1 ? stored : stored.slice(at + marker.length);
}

/** Short-lived link for a file in a private bucket. Null when the server refuses,
 *  which leaves the caller to hide the link rather than show a dead one. */
export async function signedFileUrl(
  bucket: string,
  stored: string | null | undefined,
  expiresIn = 3600,
): Promise<string | null> {
  if (!stored) return null;
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(objectName(bucket, stored), expiresIn);
  if (error) {
    console.error(`[storage] cannot sign ${bucket}:`, error.message);
    return null;
  }
  return data.signedUrl;
}
