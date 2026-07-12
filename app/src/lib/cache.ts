interface CacheEntry<T = unknown> {
  data: T;
  createdAt: number;
  updatedAt: number;
  expiresAt: number;
  staleAfter: number;
  version: number;
  source: 'cache' | 'network';
}

export interface CachePolicy {
  ttlMs: number;
  staleAfter: number;
}

const cache = new Map<string, CacheEntry>();
let globalVersion = 0;

const POLICIES: Record<string, CachePolicy> = {
  profile: { ttlMs: 300_000, staleAfter: 300_000 },
  companies: { ttlMs: 300_000, staleAfter: 300_000 },
  internships: { ttlMs: 120_000, staleAfter: 120_000 },
  applications: { ttlMs: 60_000, staleAfter: 60_000 },
  tasks: { ttlMs: 60_000, staleAfter: 60_000 },
  notifications: { ttlMs: 15_000, staleAfter: 15_000 },
  messages: { ttlMs: 10_000, staleAfter: 10_000 },
  workspace: { ttlMs: 30_000, staleAfter: 30_000 },
  certificates: { ttlMs: 1_800_000, staleAfter: 1_800_000 },
  offer_letters: { ttlMs: 1_800_000, staleAfter: 1_800_000 },
};

const POLICY_ALIASES: Record<string, string> = {
  my_tasks: 'tasks',
  assigned_by_tasks: 'tasks',
  my_applications: 'applications',
  has_applied: 'applications',
  applications_for_internship: 'applications',
  all_company_applications: 'applications',
  my_offer_letters: 'offer_letters',
  offer_letter: 'offer_letters',
  offer_letter_by_application: 'offer_letters',
  all_offer_letters: 'offer_letters',
  company_offer_letters: 'offer_letters',
  my_certificates: 'certificates',
  verify_certificate: 'certificates',
  company_certificates: 'certificates',
  my_active_internships: 'internships',
  internship_domains: 'internships',
  my_company: 'companies',
  all_companies: 'companies',
  company: 'companies',
  workspace_events: 'workspace',
  public_profile: 'profile',
  unread_notifications_count: 'notifications',
  conversations: 'messages',
  unread_count: 'messages',
};

const DEFAULT_POLICY: CachePolicy = { ttlMs: 5_000, staleAfter: 5_000 };

export function setCachePolicy(serviceKey: string, policy: Partial<CachePolicy>): void {
  const base = POLICIES[serviceKey] ?? DEFAULT_POLICY;
  POLICIES[serviceKey] = { ...base, ...policy };
}

export function getCachePolicy(serviceKey: string): CachePolicy {
  return POLICIES[serviceKey] ?? DEFAULT_POLICY;
}

function resolvePolicyKey(cacheKey: string): string {
  const first = cacheKey.split('::')[0];
  if (POLICIES[first]) return first;
  if (POLICY_ALIASES[first]) return POLICY_ALIASES[first];
  for (const [prefix, mapped] of Object.entries(POLICY_ALIASES)) {
    if (cacheKey.startsWith(prefix)) return mapped;
  }
  return '';
}

function now(): number {
  return Date.now();
}

function createEntry<T>(data: T, policy: CachePolicy, source: 'cache' | 'network'): CacheEntry<T> {
  const timestamp = now();
  return {
    data,
    createdAt: timestamp,
    updatedAt: timestamp,
    expiresAt: timestamp + policy.ttlMs,
    staleAfter: timestamp + policy.staleAfter,
    version: ++globalVersion,
    source,
  };
}

export function getCachedData<T>(key: string, ttlMs?: number): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  const effectiveTtl = ttlMs ?? (entry.expiresAt - entry.createdAt);
  if (now() - entry.updatedAt > effectiveTtl) {
    return null;
  }
  return entry.data as T;
}

export function getCacheEntry<T>(key: string): CacheEntry<T> | null {
  const entry = cache.get(key);
  return entry ? (entry as CacheEntry<T>) : null;
}

export function getStaleData<T>(key: string, staleAfter?: number): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  const effectiveStale = staleAfter ?? (entry.staleAfter - entry.createdAt);
  if (now() - entry.updatedAt > effectiveStale) {
    return null;
  }
  return entry.data as T;
}

export function setCachedData(key: string, data: unknown): void {
  const policyKey = resolvePolicyKey(key);
  const policy = policyKey ? getCachePolicy(policyKey) : DEFAULT_POLICY;
  cache.set(key, createEntry(data, policy, 'network'));
}

export function setCachedDataWithPolicy(
  key: string,
  data: unknown,
  policy: CachePolicy,
  source?: 'cache' | 'network'
): void {
  cache.set(key, createEntry(data, policy, source ?? 'network'));
}

export function clearCache(keyPrefix?: string): void {
  if (keyPrefix) {
    for (const key of cache.keys()) {
      if (key.startsWith(keyPrefix)) {
        cache.delete(key);
      }
    }
  } else {
    cache.clear();
  }
}

export function getCacheSize(): number {
  return cache.size;
}
