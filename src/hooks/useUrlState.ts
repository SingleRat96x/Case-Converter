/**
 * useUrlState Hook
 * 
 * Synchronize component state with URL query parameters
 * Enables shareable links that preserve tool configuration
 */

'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export interface UrlStateOptions {
  debounceMs?: number;
  replaceHistory?: boolean;
}

export type StateSerializer<T> = (value: T) => string;
export type StateDeserializer<T> = (value: string) => T;

/**
 * Hook to sync state with URL query parameters
 * 
 * @param key - Query parameter name
 * @param defaultValue - Default value if param not present
 * @param serialize - Function to convert value to string
 * @param deserialize - Function to convert string to value
 * @param options - Configuration options
 */
export function useUrlState<T>(
  key: string,
  defaultValue: T,
  serialize: StateSerializer<T>,
  deserialize: StateDeserializer<T>,
  options: UrlStateOptions = {}
): [T, (value: T) => void] {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const {debounceMs = 500, replaceHistory = true} = options;

  // Initialize state from URL or default
  const [state, setState] = useState<T>(() => {
    const paramValue = searchParams?.get(key);
    if (paramValue !== null && paramValue !== undefined) {
      try {
        return deserialize(paramValue);
      } catch (e) {
        console.warn(`Failed to deserialize URL param "${key}":`, e);
        return defaultValue;
      }
    }
    return defaultValue;
  });

  // Debounce timer ref
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  /**
   * Update URL with new state value
   */
  const updateUrl = useCallback(
    (newValue: T) => {
      if (!searchParams) return;

      const current = new URLSearchParams(Array.from(searchParams.entries()));
      const serialized = serialize(newValue);

      // Only update URL if value differs from default
      if (serialized === serialize(defaultValue)) {
        current.delete(key);
      } else {
        current.set(key, serialized);
      }

      const search = current.toString();
      const query = search ? `?${search}` : '';
      const newUrl = `${pathname}${query}`;

      // Use replace to avoid cluttering browser history
      if (replaceHistory) {
        router.replace(newUrl, { scroll: false });
      } else {
        router.push(newUrl, { scroll: false });
      }
    },
    [searchParams, pathname, router, key, defaultValue, serialize, replaceHistory]
  );

  /**
   * Update state and sync to URL (debounced)
   */
  const setStateAndUrl = useCallback(
    (newValue: T) => {
      setState(newValue);

      // Clear existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Set new timeout for URL update
      const newTimeoutId = setTimeout(() => {
        updateUrl(newValue);
      }, debounceMs);

      setTimeoutId(newTimeoutId);
    },
    [updateUrl, debounceMs, timeoutId]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return [state, setStateAndUrl];
}

/**
 * Common serializers/deserializers
 */
export const serializers = {
  string: {
    serialize: (v: string) => v,
    deserialize: (v: string) => v
  },
  number: {
    serialize: (v: number) => v.toString(),
    deserialize: (v: string) => {
      const parsed = parseInt(v, 10);
      return isNaN(parsed) ? 0 : parsed;
    }
  },
  boolean: {
    serialize: (v: boolean) => v ? '1' : '0',
    deserialize: (v: string) => v === '1' || v === 'true'
  },
  json: {
    serialize: <T,>(v: T) => JSON.stringify(v),
    deserialize: <T,>(v: string): T => JSON.parse(v)
  }
};

/**
 * Hook specifically for boolean flags
 */
export function useBooleanUrlState(
  key: string,
  defaultValue: boolean,
  options?: UrlStateOptions
): [boolean, (value: boolean) => void] {
  return useUrlState(
    key,
    defaultValue,
    serializers.boolean.serialize,
    serializers.boolean.deserialize,
    options
  );
}

/**
 * Hook specifically for number values
 */
export function useNumberUrlState(
  key: string,
  defaultValue: number,
  options?: UrlStateOptions
): [number, (value: number) => void] {
  return useUrlState(
    key,
    defaultValue,
    serializers.number.serialize,
    serializers.number.deserialize,
    options
  );
}

/**
 * Hook specifically for string values
 */
export function useStringUrlState(
  key: string,
  defaultValue: string,
  options?: UrlStateOptions
): [string, (value: string) => void] {
  return useUrlState(
    key,
    defaultValue,
    serializers.string.serialize,
    serializers.string.deserialize,
    options
  );
}

/**
 * Hook for managing multiple URL params at once
 */
export function useMultipleUrlState() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      if (!searchParams) return;

      const current = new URLSearchParams(Array.from(searchParams.entries()));

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') {
          current.delete(key);
        } else {
          current.set(key, value);
        }
      });

      const search = current.toString();
      const query = search ? `?${search}` : '';
      const newUrl = `${pathname}${query}`;

      router.replace(newUrl, { scroll: false });
    },
    [searchParams, pathname, router]
  );

  const getParam = useCallback(
    (key: string): string | null => {
      return searchParams?.get(key) || null;
    },
    [searchParams]
  );

  return {
    updateParams,
    getParam,
    searchParams
  };
}
