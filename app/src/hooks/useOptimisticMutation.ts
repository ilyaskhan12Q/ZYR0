import { useState, useCallback, useRef } from 'react';
import {
  beginTransaction,
  commitTransaction,
  rollbackTransaction,
} from '@/lib/cache/optimistic';

interface OptimisticMutationOptions<TData, TArgs extends unknown[]> {
  mutationFn: (...args: TArgs) => Promise<TData>;
  cacheKeys: string[];
  optimisticUpdate: (...args: TArgs) => void;
  onSuccess?: (data: TData, ...args: TArgs) => void;
  onError?: (error: Error, ...args: TArgs) => void;
}

interface OptimisticMutationState<TData, TArgs extends unknown[]> {
  mutate: (...args: TArgs) => Promise<TData | undefined>;
  isLoading: boolean;
  error: Error | null;
}

export function useOptimisticMutation<TData, TArgs extends unknown[] = unknown[]>(
  options: OptimisticMutationOptions<TData, TArgs>
): OptimisticMutationState<TData, TArgs> {
  const { mutationFn, cacheKeys, optimisticUpdate, onSuccess, onError } = options;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const txIdRef = useRef<string | null>(null);

  const mutate = useCallback(async (...args: TArgs): Promise<TData | undefined> => {
    setIsLoading(true);
    setError(null);

    const txId = beginTransaction(cacheKeys);
    txIdRef.current = txId;

    try {
      optimisticUpdate(...args);

      const result = await mutationFn(...args);

      commitTransaction(txId);
      txIdRef.current = null;
      setIsLoading(false);

      onSuccess?.(result, ...args);
      return result;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));

      if (txIdRef.current) {
        rollbackTransaction(txIdRef.current);
        txIdRef.current = null;
      }

      setError(errorObj);
      setIsLoading(false);

      onError?.(errorObj, ...args);
      return undefined;
    }
  }, [mutationFn, cacheKeys, optimisticUpdate, onSuccess, onError]);

  return { mutate, isLoading, error };
}
