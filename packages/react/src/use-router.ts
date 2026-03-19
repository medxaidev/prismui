// ---------------------------------------------------------------------------
// useRouter — convenience hook for router operations
// Thin wrapper — zero business logic.
// ---------------------------------------------------------------------------

import { useCallback } from 'react';
import type { RouterController, RouterLocation } from '@prismui/core';
import { useRuntime } from './use-runtime';
import { useRuntimeState } from './use-runtime-state';

/** Return type of useRouter(). */
export interface UseRouterReturn {
  location: RouterLocation;
  path: string;
  query: Record<string, string>;
  hash: string;
  push: (path: string, state?: unknown) => void;
  replace: (path: string, state?: unknown) => void;
  back: () => void;
  forward: () => void;
  go: (delta: number) => void;
  createHref: (path: string) => string;
}

/**
 * Convenience hook for router operations.
 * Combines `useRuntimeState()` for reactive location with `runtime.modules.router` for actions.
 */
export function useRouter(): UseRouterReturn {
  const runtime = useRuntime();
  const state = useRuntimeState();
  const controller = runtime.modules.router as RouterController;

  const location = state.routerLocation as RouterLocation;

  const push = useCallback(
    (path: string, routeState?: unknown) => controller.push(path, routeState),
    [controller],
  );
  const replace = useCallback(
    (path: string, routeState?: unknown) => controller.replace(path, routeState),
    [controller],
  );
  const back = useCallback(() => controller.back(), [controller]);
  const forward = useCallback(() => controller.forward(), [controller]);
  const go = useCallback((delta: number) => controller.go(delta), [controller]);
  const createHref = useCallback(
    (path: string) => controller.createHref(path),
    [controller],
  );

  return {
    location,
    path: location?.pathname ?? '/',
    query: controller.getQuery(),
    hash: location?.hash ?? '',
    push,
    replace,
    back,
    forward,
    go,
    createHref,
  };
}
