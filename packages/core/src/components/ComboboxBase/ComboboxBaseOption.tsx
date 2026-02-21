'use client';

import React from 'react';
import { useComboboxBaseContext } from './ComboboxBase.context';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ComboboxBaseOptionProps {
  /** The option value. */
  value: string;

  /** The option label / content. */
  children: React.ReactNode;

  /** Whether this option is disabled. @default false */
  disabled?: boolean;

  /** 0-based index within the options list (set by parent). */
  index: number;

  /** Additional className. */
  className?: string;

  /** Additional style. */
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ComboboxBaseOption({
  value,
  children,
  disabled = false,
  index,
  className,
  style,
}: ComboboxBaseOptionProps) {
  const ctx = useComboboxBaseContext();

  const isSelected = ctx.value === value;
  const isActive = ctx.activeIndex === index;

  const handleClick = () => {
    if (!disabled) {
      ctx.onSelect(value);
    }
  };

  const handleMouseEnter = () => {
    if (!disabled) {
      ctx.setActiveIndex(index);
    }
  };

  return (
    <div
      id={`${ctx.comboboxId}-option-${index}`}
      role="option"
      aria-selected={isSelected}
      aria-disabled={disabled || undefined}
      data-selected={isSelected || undefined}
      data-active={isActive || undefined}
      data-disabled={disabled || undefined}
      className={className}
      style={style}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
    >
      {children}
    </div>
  );
}

ComboboxBaseOption.displayName = '@prismui/core/ComboboxBaseOption';
