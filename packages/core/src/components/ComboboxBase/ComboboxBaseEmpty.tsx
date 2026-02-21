'use client';

import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ComboboxBaseEmptyProps {
  /** Content to display when no options are available. */
  children: React.ReactNode;

  /** Additional className. */
  className?: string;

  /** Additional style. */
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ComboboxBaseEmpty({ children, className, style }: ComboboxBaseEmptyProps) {
  return (
    <div role="status" aria-live="polite" className={className} style={style}>
      {children}
    </div>
  );
}

ComboboxBaseEmpty.displayName = '@prismui/core/ComboboxBaseEmpty';
