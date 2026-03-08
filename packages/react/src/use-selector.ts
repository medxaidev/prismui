// ---------------------------------------------------------------------------
// useSelector — efficient partial state subscription for React
// Uses useSyncExternalStore for tear-free reads.
// ---------------------------------------------------------------------------

import { useCallback, useRef } from 'react';
import { useSyncExternalStore } from 'react';
import type { StateSelector } from '@prismui/core';
import { useRuntime } from './use-runtime';

/**
 * Subscribe to a derived slice of RuntimeState.
 * Only re-renders when the selected value changes (`Object.is` comparison).
 * Uses `useSyncExternalStore` (React 18 recommended pattern).
 */
export function useSelector<T>(selector: StateSelector<T>): T {
  const runtime = useRuntime();

  // Keep selector ref stable to avoid re-subscribing on every render
  const selectorRef = useRef(selector);
  selectorRef.current = selector;

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      return runtime.store.subscribe(onStoreChange);
    },
    [runtime.store],
  );

  const getSnapshot = useCallback(
    () => selectorRef.current(runtime.store.getState()),
    [runtime.store],
  );

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
