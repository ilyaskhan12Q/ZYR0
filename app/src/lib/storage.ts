import { supabase } from '@/lib/supabase';

const PRIVATE_BUCKETS = new Set(['offer-letters', 'task-documents']);
const PUBLIC_MARKER = '/storage/v1/object/public/';

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

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 3600);
    if (error) return url;
    return data?.signedUrl ?? url;
  } catch {
    return url;
  }
}

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
