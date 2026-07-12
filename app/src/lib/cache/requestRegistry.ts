const inFlightRequests = new Map<string, Promise<unknown>>();

export function createRequestKey(...parts: (string | number | undefined | null)[]): string {
  return parts.filter(p => p !== undefined && p !== null).join('::');
}

export async function dedupRequest<T>(
  key: string,
  fetcher: () => PromiseLike<T>
): Promise<T> {
  const existing = inFlightRequests.get(key);
  if (existing) {
    return existing as Promise<T>;
  }

  const promise = Promise.resolve(fetcher()).finally(() => {
    inFlightRequests.delete(key);
  });

  inFlightRequests.set(key, promise);
  return promise;
}

export function clearRequestRegistry(): void {
  inFlightRequests.clear();
}
