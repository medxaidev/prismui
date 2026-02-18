'use client';

import { createContext, useContext } from 'react';

// ---------------------------------------------------------------------------
// Context value
// ---------------------------------------------------------------------------

export interface ModalBaseContextValue {
  /** Whether the modal is currently open. */
  opened: boolean;

  /** Callback to close the modal. */
  onClose: () => void;

  /** Whether to trap keyboard focus within the modal content. */
  trapFocus: boolean;

  /** Whether clicking outside the content should close the modal. */
  closeOnClickOutside: boolean;

  /** The z-index allocated for this modal. */
  zIndex: number;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export const ModalBaseContext = createContext<ModalBaseContextValue | null>(null);

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useModalBaseContext(): ModalBaseContextValue {
  const ctx = useContext(ModalBaseContext);
  if (!ctx) {
    throw new Error(
      '[PrismUI] useModalBaseContext must be used within a <ModalBase>. ' +
      'Make sure your component is a child of ModalBase.',
    );
  }
  return ctx;
}
