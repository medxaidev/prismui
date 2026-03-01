// ---------------------------------------------------------------------------
// usePage — convenience hook combining reactive page state + page controller
// Thin wrapper — zero business logic.
// ---------------------------------------------------------------------------

import { useCallback } from 'react';
import type { PageController } from '@prismui/core';
import { useRuntime } from './use-runtime';
import { useRuntimeState } from './use-runtime-state';

/** Return type of usePage(). */
export interface UsePageReturn {
  currentPage: string | null;
  mountedPages: string[];
  isLocked: boolean;
  mount: (pageId: string) => void;
  unmount: (pageId: string) => void;
  transition: (pageId: string) => void;
  lock: () => void;
  unlock: () => void;
}

/**
 * Convenience hook for page operations.
 * Combines `useRuntimeState()` for reactive data with `runtime.modules.page` for actions.
 */
export function usePage(): UsePageReturn {
  const runtime = useRuntime();
  const state = useRuntimeState();
  const controller = runtime.modules.page as PageController;

  const mount = useCallback((pageId: string) => controller.mount(pageId), [controller]);
  const unmount = useCallback((pageId: string) => controller.unmount(pageId), [controller]);
  const transition = useCallback((pageId: string) => controller.transition(pageId), [controller]);
  const lock = useCallback(() => controller.lock(), [controller]);
  const unlock = useCallback(() => controller.unlock(), [controller]);

  return {
    currentPage: state.currentPage as string | null,
    mountedPages: state.mountedPages as string[],
    isLocked: state.locked as boolean,
    mount,
    unmount,
    transition,
    lock,
    unlock,
  };
}
