'use client';

import { createContext, useContext } from 'react';

// ---------------------------------------------------------------------------
// Context value
// ---------------------------------------------------------------------------

export interface DrawerContextValue {
  /** Callback to close the drawer. */
  onClose: () => void;

  /** Whether the drawer has a close button. */
  withCloseButton: boolean;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export const DrawerContext = createContext<DrawerContextValue | null>(null);

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useDrawerContext(): DrawerContextValue {
  const ctx = useContext(DrawerContext);
  if (!ctx) {
    throw new Error(
      '[PrismUI] useDrawerContext must be used within a <Drawer>. ' +
      'Make sure your component is a child of Drawer.',
    );
  }
  return ctx;
}
