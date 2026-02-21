'use client';

import React from 'react';
import { useComboboxBaseContext } from './ComboboxBase.context';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ComboboxBaseSearchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  /** Additional className. */
  className?: string;

  /** Additional style. */
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const ComboboxBaseSearch = React.forwardRef<HTMLInputElement, ComboboxBaseSearchProps>(
  function ComboboxBaseSearch({ className, style, onKeyDown, ...rest }, ref) {
    const ctx = useComboboxBaseContext();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      ctx.setSearchValue(e.target.value);
      // Reset active index when search changes
      ctx.setActiveIndex(0);
    };

    return (
      <input
        ref={ref}
        role="searchbox"
        aria-autocomplete="list"
        aria-controls={`${ctx.comboboxId}-listbox`}
        value={ctx.searchValue}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        className={className}
        style={style}
        {...rest}
      />
    );
  },
);

ComboboxBaseSearch.displayName = '@prismui/core/ComboboxBaseSearch';
