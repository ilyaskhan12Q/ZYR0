const activeWarnings = new Set<string>();

export function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  fallback: T,
  label?: string,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<T>((resolve) => {
    timer = setTimeout(() => {
      if (label && !activeWarnings.has(label)) {
        activeWarnings.add(label);
        console.warn(`[withTimeout] ${label} exceeded ${ms}ms — using fallback`);
        setTimeout(() => activeWarnings.delete(label), 30_000);
      }
      resolve(fallback);
    }, ms);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}
