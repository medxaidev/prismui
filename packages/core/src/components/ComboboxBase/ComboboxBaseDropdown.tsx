'use client';

import React from 'react';
import { useComboboxBaseContext } from './ComboboxBase.context';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ComboboxBaseDropdownProps {
  /** Dropdown content (ComboboxBaseOptions, ComboboxBaseSearch, etc.). */
  children: React.ReactNode;

  /** Additional className for the dropdown element. */
  className?: string;

  /** Additional style for the dropdown element. */
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ComboboxBaseDropdown({
  children,
  className,
  style,
}: ComboboxBaseDropdownProps) {
  const ctx = useComboboxBaseContext();

  if (!ctx.opened) return null;

  return (
    <div
      id={`${ctx.comboboxId}-listbox`}
      role="listbox"
      aria-label="Options"
      className={className}
      style={style}
    >
      {children}
    </div>
  );
}

ComboboxBaseDropdown.displayName = '@prismui/core/ComboboxBaseDropdown';
