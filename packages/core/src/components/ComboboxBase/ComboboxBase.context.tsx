'use client';

import { createContext, useContext } from 'react';
import type { ComboboxStore } from './useCombobox';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ComboboxBaseContextValue {
  /** The combobox store (DOM-based selection, open/close, keyboard nav). */
  store: ComboboxStore;

  /** Called when an option is submitted (clicked or Enter). */
  onOptionSubmit?: (value: string, optionProps: Record<string, unknown>) => void;

  /** Controls option font-size and padding. */
  size?: string;

  /** Whether selection should be reset on option hover. @default false */
  resetSelectionOnOptionHover?: boolean;

  /** Whether the combobox is read-only. */
  readOnly?: boolean;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export const ComboboxBaseContext = createContext<ComboboxBaseContextValue | null>(null);

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useComboboxBaseContext(): ComboboxBaseContextValue {
  const ctx = useContext(ComboboxBaseContext);
  if (!ctx) {
    throw new Error(
      '[PrismUI] useComboboxBaseContext must be used within a <ComboboxBase>.',
    );
  }
  return ctx;
}
