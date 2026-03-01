// ---------------------------------------------------------------------------
// useModal — convenience hook combining reactive modal state + modal controller
// Thin wrapper — zero business logic.
// ---------------------------------------------------------------------------

import { useCallback } from 'react';
import type { ModalController } from '@prismui/core';
import { useRuntime } from './use-runtime';
import { useRuntimeState } from './use-runtime-state';

/** Return type of useModal(). */
export interface UseModalReturn {
  modalStack: string[];
  isOpen: (modalId: string) => boolean;
  open: (modalId: string) => void;
  close: (modalId?: string) => void;
  closeAll: () => void;
}

/**
 * Convenience hook for modal operations.
 * Combines `useRuntimeState()` for reactive `modalStack` with `runtime.modules.modal` for actions.
 */
export function useModal(): UseModalReturn {
  const runtime = useRuntime();
  const state = useRuntimeState();
  const controller = runtime.modules.modal as ModalController;

  const open = useCallback((modalId: string) => controller.open(modalId), [controller]);
  const close = useCallback((modalId?: string) => controller.close(modalId), [controller]);
  const closeAll = useCallback(() => controller.closeAll(), [controller]);

  // isOpen is derived from reactive state — not from controller.isOpen() —
  // so that it triggers re-render when the stack changes.
  const modalStack = state.modalStack as string[];
  const isOpen = useCallback(
    (modalId: string) => modalStack.includes(modalId),
    [modalStack],
  );

  return {
    modalStack,
    isOpen,
    open,
    close,
    closeAll,
  };
}
