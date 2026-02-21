'use client';

import React, { useEffect, useId } from 'react';
import { useComboboxBaseContext } from './ComboboxBase.context';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ComboboxBaseOptionsProps {
  /** ComboboxBaseOption elements. */
  children: React.ReactNode;

  /** Additional className. */
  className?: string;

  /** Additional style. */
  style?: React.CSSProperties;

  /** Id of the element that labels the options list. */
  labelledBy?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ComboboxBaseOptions({
  children,
  className,
  style,
  labelledBy,
}: ComboboxBaseOptionsProps) {
  const ctx = useComboboxBaseContext();
  const _id = useId();

  // Register listId with the store so keyboard nav can find options
  useEffect(() => {
    ctx.store.setListId(_id);
  }, [_id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      id={_id}
      role="listbox"
      aria-labelledby={labelledBy}
      className={className}
      style={style}
      onMouseDown={(e) => {
        // Prevent focus loss from the trigger when clicking options
        e.preventDefault();
      }}
    >
      {children}
    </div>
  );
}

ComboboxBaseOptions.displayName = '@prismui/core/ComboboxBaseOptions';
