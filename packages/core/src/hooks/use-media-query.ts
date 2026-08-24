/**
 * Stage-16 · Phase 3 · `useMediaQuery` client hook
 *
 * Subscribe to a CSS media-query string and return whether it currently
 * matches. Built on `window.matchMedia` + `useSyncExternalStore` so it is
 * tear-free and concurrent-safe.
 *
 * SSR / non-browser contract (ADR-008 decision 6 · honest `undefined`):
 *   - During server render (no `window`) the server snapshot is `undefined`
 *     — the hook does NOT guess `false`, avoiding hydration-mismatch flashes
 *     and letting callers branch on "unknown yet".
 *   - In a pure SPA (MYK's target) `window.matchMedia` exists from the first
 *     client render, so a real boolean is returned immediately.
 *
 * @example
 *   const isDesktop = useMediaQuery(up('lg')); // boolean | undefined
 */
import * as React from 'react';

function hasMatchMedia(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function';
}

export function useMediaQuery(query: string): boolean | undefined {
  const subscribe = React.useCallback(
    (onStoreChange: () => void) => {
      if (!hasMatchMedia()) return () => {};
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onStoreChange);
      return () => mql.removeEventListener('change', onStoreChange);
    },
    [query],
  );

  const getSnapshot = React.useCallback((): boolean | undefined => {
    if (!hasMatchMedia()) return undefined;
    return window.matchMedia(query).matches;
  }, [query]);

  // Server snapshot is always `undefined` (honest default · no guessing).
  const getServerSnapshot = React.useCallback((): boolean | undefined => undefined, []);

  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
