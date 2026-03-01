// ---------------------------------------------------------------------------
// useRuntimeState — reactive read-only state from RuntimeStore
// Uses React 18+ useSyncExternalStore for tear-free reads.
// ---------------------------------------------------------------------------

import { useSyncExternalStore } from 'react';
import type { RuntimeState } from '@prismui/core';
import { useRuntime } from './use-runtime';

/**
 * Returns the current RuntimeState, reactively updated on every state change.
 * Uses `useSyncExternalStore` (React 18 recommended pattern) to avoid tearing.
 */
export function useRuntimeState(): Readonly<RuntimeState> {
  const runtime = useRuntime();
  return useSyncExternalStore(
    runtime.store.subscribe,
    runtime.store.getState,
    runtime.store.getSnapshot,
  );
}
