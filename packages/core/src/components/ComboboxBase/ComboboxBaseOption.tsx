'use client';

import React, { useId } from 'react';
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

  /** Whether this option is currently active (e.g. matches current value). */
  active?: boolean;

  /** Additional className. */
  className?: string;

  /** Additional style. */
  style?: React.CSSProperties;

  /** Additional id (auto-generated if not provided). */
  id?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ComboboxBaseOption({
  value,
  children,
  disabled = false,
  active,
  className,
  style,
  id,
}: ComboboxBaseOptionProps) {
  const ctx = useComboboxBaseContext();
  const uuid = useId();
  const _id = id || uuid;

  return (
    <div
      id={_id}
      role="option"
      data-combobox-option
      data-combobox-active={active || undefined}
      data-combobox-disabled={disabled || undefined}
      className={className}
      style={style}
      onClick={(event) => {
        if (!disabled) {
          ctx.onOptionSubmit?.(value, { value, children, disabled, active });
        } else {
          event.preventDefault();
        }
      }}
      onMouseDown={(event) => {
        // Prevent focus loss from the trigger
        event.preventDefault();
      }}
      onMouseOver={() => {
        if (ctx.resetSelectionOnOptionHover) {
          ctx.store.resetSelectedOption();
        }
      }}
    >
      {children}
    </div>
  );
}

ComboboxBaseOption.displayName = '@prismui/core/ComboboxBaseOption';
