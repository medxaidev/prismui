'use client';

import { createContext, useContext } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ComboboxBaseContextValue {
  /** Whether the dropdown is open. */
  opened: boolean;

  /** Open the dropdown. */
  onOpen: () => void;

  /** Close the dropdown. */
  onClose: () => void;

  /** Toggle the dropdown. */
  onToggle: () => void;

  /** Currently selected value (single). */
  value: string | null;

  /** Set the selected value and close the dropdown. */
  onSelect: (value: string) => void;

  /** Currently active option index for keyboard navigation. */
  activeIndex: number;

  /** Set the active option index. */
  setActiveIndex: (index: number) => void;

  /** Total number of options (registered by ComboboxBaseOptions). */
  optionsCount: number;

  /** Register the total option count. */
  setOptionsCount: (count: number) => void;

  /** Search value (for Combobox). */
  searchValue: string;

  /** Set search value. */
  setSearchValue: (value: string) => void;

  /** Unique id for ARIA linking. */
  comboboxId: string;

  /** Whether the combobox is disabled. */
  disabled: boolean;
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
