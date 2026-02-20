'use client';

import { createContext, useContext } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DrawerPosition = 'left' | 'right' | 'top' | 'bottom';

export interface DrawerBaseContextValue {
  /** Whether the drawer is currently open. */
  opened: boolean;

  /** Callback to close the drawer. */
  onClose: () => void;

  /** Which edge the drawer slides from. */
  position: DrawerPosition;

  /** Whether clicking outside the content should close the drawer. */
  closeOnClickOutside: boolean;

  /** The z-index allocated for this drawer. */
  zIndex: number;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export const DrawerBaseContext = createContext<DrawerBaseContextValue | null>(null);

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useDrawerBaseContext(): DrawerBaseContextValue {
  const ctx = useContext(DrawerBaseContext);
  if (!ctx) {
    throw new Error(
      '[PrismUI] useDrawerBaseContext must be used within a <DrawerBase>. ' +
      'Make sure your component is a child of DrawerBase.',
    );
  }
  return ctx;
}
