'use client';

import React, { cloneElement, useState, useCallback } from 'react';
import { useComboboxBaseContext } from './ComboboxBase.context';
import { usePopoverBaseContext } from '../PopoverBase/PopoverBase.context';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ComboboxBaseTargetProps {
  /** The trigger element. Must accept ref, onClick, onKeyDown, aria-* props. */
  children: React.ReactElement;

  /** Determines which keyboard events are handled.
   * `button` handles Space/Enter to toggle.
   * `input` handles ArrowUp/Down/Enter/Escape.
   * @default 'input'
   */
  targetType?: 'button' | 'input';

  /** If set, the target has aria-* attributes. @default true */
  withAriaAttributes?: boolean;

  /** If set, the target has keyboard navigation. @default true */
  withKeyboardNavigation?: boolean;

  /** Input autocomplete attribute. @default 'off' */
  autoComplete?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ComboboxBaseTarget({
  children,
  targetType = 'input',
  withAriaAttributes = true,
  withKeyboardNavigation = true,
  autoComplete = 'off',
}: ComboboxBaseTargetProps) {
  const ctx = useComboboxBaseContext();
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  const child = React.Children.only(children);
  const childProps = child.props as Record<string, unknown>;

  // ---- Keyboard handler ----
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      // Forward to child's onKeyDown
      (childProps.onKeyDown as React.KeyboardEventHandler<HTMLElement> | undefined)?.(event);

      if (ctx.readOnly) return;

      if (withKeyboardNavigation) {
        // Ignore during IME composition
        if (event.nativeEvent.isComposing) return;

        if (event.nativeEvent.code === 'ArrowDown') {
          event.preventDefault();
          if (!ctx.store.dropdownOpened) {
            ctx.store.openDropdown('keyboard');
            setSelectedOptionId(ctx.store.selectActiveOption());
            ctx.store.updateSelectedOptionIndex('selected', { scrollIntoView: true });
          } else {
            setSelectedOptionId(ctx.store.selectNextOption());
          }
        }

        if (event.nativeEvent.code === 'ArrowUp') {
          event.preventDefault();
          if (!ctx.store.dropdownOpened) {
            ctx.store.openDropdown('keyboard');
            setSelectedOptionId(ctx.store.selectActiveOption());
            ctx.store.updateSelectedOptionIndex('selected', { scrollIntoView: true });
          } else {
            setSelectedOptionId(ctx.store.selectPreviousOption());
          }
        }

        if (event.nativeEvent.code === 'Enter' || event.nativeEvent.code === 'NumpadEnter') {
          // Safari IME workaround
          if (event.nativeEvent.keyCode === 229) return;

          const selectedIdx = ctx.store.getSelectedOptionIndex();
          if (ctx.store.dropdownOpened && selectedIdx !== -1) {
            event.preventDefault();
            ctx.store.clickSelectedOption();
          } else if (targetType === 'button') {
            event.preventDefault();
            ctx.store.openDropdown('keyboard');
          }
        }

        if (event.key === 'Escape') {
          ctx.store.closeDropdown('keyboard');
        }

        if (event.nativeEvent.code === 'Space' && targetType === 'button') {
          event.preventDefault();
          ctx.store.toggleDropdown('keyboard');
        }
      }
    },
    [ctx, childProps.onKeyDown, withKeyboardNavigation, targetType],
  );

  // ---- ARIA attributes ----
  const ariaAttributes = withAriaAttributes
    ? {
      role: 'combobox' as const,
      'aria-haspopup': 'listbox' as const,
      'aria-expanded': ctx.store.dropdownOpened,
      'aria-controls':
        ctx.store.dropdownOpened && ctx.store.listId ? ctx.store.listId : undefined,
      'aria-activedescendant': ctx.store.dropdownOpened
        ? selectedOptionId || undefined
        : undefined,
      autoComplete,
      'data-expanded': ctx.store.dropdownOpened || undefined,
    }
    : {};

  const popoverCtx = usePopoverBaseContext();
  const targetWrapperRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node) {
        // Find the InputBase visual wrapper (the bordered element with data-variant)
        // This ensures positioning is relative to the input box, not the label/description
        const inputWrapper = node.querySelector('[data-variant]') as HTMLElement;
        popoverCtx.setTargetRef(inputWrapper || node.firstElementChild as HTMLElement || node);
      } else {
        popoverCtx.setTargetRef(null);
      }
    },
    [popoverCtx],
  );

  const clonedElement = cloneElement(child, {
    ...ariaAttributes,
    onKeyDown: handleKeyDown,
  } as any);

  return (
    <div ref={targetWrapperRef} style={{ display: 'contents' }}>
      {clonedElement}
    </div>
  );
}

ComboboxBaseTarget.displayName = '@prismui/core/ComboboxBaseTarget';
