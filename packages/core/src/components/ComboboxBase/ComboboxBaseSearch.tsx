'use client';

import React from 'react';
import { useComboboxBaseContext } from './ComboboxBase.context';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ComboboxBaseSearchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Additional className. */
  className?: string;

  /** Additional style. */
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const ComboboxBaseSearch = React.forwardRef<HTMLInputElement, ComboboxBaseSearchProps>(
  function ComboboxBaseSearch({ className, style, onKeyDown, onChange, ...rest }, ref) {
    const ctx = useComboboxBaseContext();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      // Reset selection when search changes
      ctx.store.resetSelectedOption();
    };

    return (
      <input
        ref={(node) => {
          // Merge refs: forward ref + store.searchRef
          if (typeof ref === 'function') ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
          (ctx.store.searchRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
        }}
        role="searchbox"
        aria-autocomplete="list"
        aria-controls={ctx.store.listId || undefined}
        onKeyDown={onKeyDown}
        onChange={handleChange}
        className={className}
        style={style}
        {...rest}
      />
    );
  },
);

ComboboxBaseSearch.displayName = '@prismui/core/ComboboxBaseSearch';
