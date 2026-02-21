'use client';

import React, { useEffect, Children } from 'react';
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
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ComboboxBaseOptions({
  children,
  className,
  style,
}: ComboboxBaseOptionsProps) {
  const ctx = useComboboxBaseContext();

  // Count visible children and register with context
  const count = Children.count(children);
  useEffect(() => {
    ctx.setOptionsCount(count);
  }, [count]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}

ComboboxBaseOptions.displayName = '@prismui/core/ComboboxBaseOptions';
