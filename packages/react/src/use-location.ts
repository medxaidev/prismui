// ---------------------------------------------------------------------------
// useLocation — reactive router location hook
// Thin wrapper — zero business logic.
// ---------------------------------------------------------------------------

import type { RouterLocation } from '@prismui/core';
import { useRuntimeState } from './use-runtime-state';

/**
 * Returns the current router location reactively.
 * Re-renders when location changes.
 */
export function useLocation(): RouterLocation {
  const state = useRuntimeState();
  return (state.routerLocation as RouterLocation) ?? {
    pathname: '/',
    search: '',
    hash: '',
    state: null,
  };
}
