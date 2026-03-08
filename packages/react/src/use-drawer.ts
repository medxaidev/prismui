// ---------------------------------------------------------------------------
// useDrawer — convenience hook combining reactive drawer state + drawer controller
// Thin wrapper — zero business logic.
// ---------------------------------------------------------------------------

import { useCallback } from 'react';
import type { DrawerController, DrawerEntry, DrawerAnchor } from '@prismui/core';
import { useRuntime } from './use-runtime';
import { useRuntimeState } from './use-runtime-state';

/** Return type of useDrawer(). */
export interface UseDrawerReturn {
  drawerStack: DrawerEntry[];
  isOpen: (drawerId: string) => boolean;
  open: (drawerId: string, anchor?: DrawerAnchor) => void;
  close: (drawerId?: string) => void;
  closeAll: () => void;
  getAnchor: (drawerId: string) => DrawerAnchor | undefined;
}

/**
 * Convenience hook for drawer operations.
 * Combines `useRuntimeState()` for reactive `drawerStack` with `runtime.modules.drawer` for actions.
 */
export function useDrawer(): UseDrawerReturn {
  const runtime = useRuntime();
  const state = useRuntimeState();
  const controller = runtime.modules.drawer as DrawerController;

  const open = useCallback(
    (drawerId: string, anchor?: DrawerAnchor) => controller.open(drawerId, anchor),
    [controller],
  );
  const close = useCallback(
    (drawerId?: string) => controller.close(drawerId),
    [controller],
  );
  const closeAll = useCallback(() => controller.closeAll(), [controller]);

  // Derived from reactive state for re-render triggers
  const drawerStack = state.drawerStack as DrawerEntry[];
  const isOpen = useCallback(
    (drawerId: string) => drawerStack.some((e) => e.drawerId === drawerId),
    [drawerStack],
  );
  const getAnchor = useCallback(
    (drawerId: string) => drawerStack.find((e) => e.drawerId === drawerId)?.anchor,
    [drawerStack],
  );

  return {
    drawerStack,
    isOpen,
    open,
    close,
    closeAll,
    getAnchor,
  };
}
