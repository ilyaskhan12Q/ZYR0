type RefreshCallback = () => void;

const refreshTriggers = new Map<string, Set<RefreshCallback>>();
const focusListener: (() => void) | null = null;
const onlineListener: (() => void) | null = null;
let registeredCount = 0;

export function registerRefreshCallback(key: string, cb: RefreshCallback): () => void {
  let set = refreshTriggers.get(key);
  if (!set) {
    set = new Set();
    refreshTriggers.set(key, set);
  }
  set.add(cb);
  registeredCount++;

  if (registeredCount === 1) {
    setupGlobalListeners();
  }

  return () => {
    set?.delete(cb);
    registeredCount--;
    if (set?.size === 0) {
      refreshTriggers.delete(key);
    }
    if (registeredCount === 0) {
      teardownGlobalListeners();
    }
  };
}

export function triggerRefresh(key: string): void {
  const set = refreshTriggers.get(key);
  if (!set) return;
  set.forEach((cb) => cb());
}

function onWindowFocus(): void {
  for (const [, set] of refreshTriggers) {
    set.forEach((cb) => cb());
  }
}

function onOnline(): void {
  for (const [, set] of refreshTriggers) {
    set.forEach((cb) => cb());
  }
}

function setupGlobalListeners(): void {
  if (typeof window === 'undefined') return;
  window.addEventListener('focus', onWindowFocus);
  window.addEventListener('online', onOnline);
}

function teardownGlobalListeners(): void {
  if (typeof window === 'undefined') return;
  window.removeEventListener('focus', onWindowFocus);
  window.removeEventListener('online', onOnline);
}

export function clearAllRefreshCallbacks(): void {
  refreshTriggers.clear();
  teardownGlobalListeners();
  registeredCount = 0;
}
