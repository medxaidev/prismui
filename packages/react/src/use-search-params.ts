// ---------------------------------------------------------------------------
// useSearchParams — reactive query string hook
// Thin wrapper — zero business logic.
// ---------------------------------------------------------------------------

import type { RouterLocation, RouterController } from '@prismui/core';
import { parseQueryString } from '@prismui/core';
import { useRuntime } from './use-runtime';
import { useRuntimeState } from './use-runtime-state';
import { useCallback } from 'react';

/**
 * Returns the current query string as a parsed key-value map, reactively.
 * Also provides a setter to update query params via router.replace().
 */
export function useSearchParams(): [
  Record<string, string>,
  (params: Record<string, string>) => void,
] {
  const runtime = useRuntime();
  const state = useRuntimeState();
  const controller = runtime.modules.router as RouterController;
  const location = state.routerLocation as RouterLocation;

  const query = parseQueryString(location?.search ?? '');

  const setSearchParams = useCallback(
    (params: Record<string, string>) => {
      const entries = Object.entries(params);
      const search =
        entries.length === 0
          ? ''
          : '?' +
            entries
              .map(
                ([k, v]) =>
                  `${encodeURIComponent(k)}=${encodeURIComponent(v)}`,
              )
              .join('&');
      const currentPath = (state.routerLocation as RouterLocation)?.pathname ?? '/';
      controller.replace(currentPath + search);
    },
    [controller, state.routerLocation],
  );

  return [query, setSearchParams];
}
