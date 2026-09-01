import { useEffect, useRef } from 'react';

/**
 * Calls `callback` when the browser tab regains focus.
 * Useful for refreshing stale data after a tab switch.
 */
export function useRefreshOnFocus(callback: () => void) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        savedCallback.current();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);
}
