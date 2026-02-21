'use client';

import React from 'react';
import { PopoverBaseDropdown } from '../PopoverBase/PopoverBaseDropdown';

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

  /** Whether the dropdown should be hidden (e.g. no options). */
  hidden?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ComboboxBaseDropdown({
  children,
  className,
  style,
  hidden,
}: ComboboxBaseDropdownProps) {
  // Delegate entirely to PopoverBase.Dropdown — no double-gating.
  // PopoverBase controls visibility via Transition + opened state.
  return (
    <PopoverBaseDropdown
      className={className}
      style={{
        ...style,
        display: hidden ? 'none' : undefined,
      }}
    >
      {children}
    </PopoverBaseDropdown>
  );
}

ComboboxBaseDropdown.displayName = '@prismui/core/ComboboxBaseDropdown';
