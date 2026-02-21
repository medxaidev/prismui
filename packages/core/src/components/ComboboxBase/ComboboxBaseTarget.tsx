'use client';

import React from 'react';
import { useComboboxBaseContext } from './ComboboxBase.context';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ComboboxBaseTargetProps {
  /** The trigger element. Must accept ref, onClick, onKeyDown, aria-* props. */
  children: React.ReactElement;

  /** If true, the trigger opens on click. @default true */
  openOnClick?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ComboboxBaseTarget({
  children,
  openOnClick = true,
}: ComboboxBaseTargetProps) {
  const ctx = useComboboxBaseContext();

  const child = React.Children.only(children);

  const handleClick = (e: React.MouseEvent) => {
    if (!ctx.disabled) {
      ctx.onToggle();
    }
    (child.props as { onClick?: React.MouseEventHandler }).onClick?.(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    (child.props as { onKeyDown?: React.KeyboardEventHandler }).onKeyDown?.(e);
  };

  return React.cloneElement(child, {
    role: 'combobox',
    'aria-expanded': ctx.opened,
    'aria-haspopup': 'listbox',
    'aria-controls': `${ctx.comboboxId}-listbox`,
    'aria-activedescendant':
      ctx.opened && ctx.activeIndex >= 0
        ? `${ctx.comboboxId}-option-${ctx.activeIndex}`
        : undefined,
    onClick: openOnClick ? handleClick : (child.props as { onClick?: React.MouseEventHandler }).onClick,
    onKeyDown: handleKeyDown,
  } as React.HTMLAttributes<HTMLElement>);
}

ComboboxBaseTarget.displayName = '@prismui/core/ComboboxBaseTarget';
