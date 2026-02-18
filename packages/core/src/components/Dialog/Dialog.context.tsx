'use client';

import { createContext, useContext } from 'react';

// ---------------------------------------------------------------------------
// Context value
// ---------------------------------------------------------------------------

export interface DialogContextValue {
  /** Callback to close the dialog. */
  onClose: () => void;

  /** Whether the dialog has a close button. */
  withCloseButton: boolean;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export const DialogContext = createContext<DialogContextValue | null>(null);

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useDialogContext(): DialogContextValue {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error(
      '[PrismUI] useDialogContext must be used within a <Dialog>. ' +
      'Make sure your component is a child of Dialog.',
    );
  }
  return ctx;
}
