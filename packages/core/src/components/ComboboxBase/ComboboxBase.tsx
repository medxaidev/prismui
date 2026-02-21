'use client';

import React from 'react';
import { PopoverBase } from '../PopoverBase/PopoverBase';
import type { PopoverBaseProps } from '../PopoverBase/PopoverBase';
import { ComboboxBaseContext } from './ComboboxBase.context';
import { ComboboxBaseTarget } from './ComboboxBaseTarget';
import { ComboboxBaseDropdown } from './ComboboxBaseDropdown';
import { ComboboxBaseOptions } from './ComboboxBaseOptions';
import { ComboboxBaseOption } from './ComboboxBaseOption';
import { ComboboxBaseSearch } from './ComboboxBaseSearch';
import { ComboboxBaseEmpty } from './ComboboxBaseEmpty';
import { useCombobox } from './useCombobox';
import type { ComboboxStore } from './useCombobox';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ComboboxBaseProps
  extends Pick<
    PopoverBaseProps,
    | 'position'
    | 'offset'
    | 'withinPortal'
    | 'transitionDuration'
    | 'zIndex'
    | 'closeOnClickOutside'
  > {
  /** Combobox content (Target + Dropdown). */
  children?: React.ReactNode;

  /** Combobox store — can be used to control combobox state externally. */
  store?: ComboboxStore;

  /** Called when an option is submitted (clicked or Enter). */
  onOptionSubmit?: (value: string, optionProps: Record<string, unknown>) => void;

  /** Called when dropdown closes. */
  onClose?: () => void;

  /** Controls option font-size and padding. @default 'sm' */
  size?: string;

  /** Whether selection resets on option hover. @default false */
  resetSelectionOnOptionHover?: boolean;

  /** Whether the combobox is read-only. */
  readOnly?: boolean;

  /** Whether the combobox is disabled. @default false */
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ComboboxBase({
  children,
  store: controlledStore,
  onOptionSubmit,
  onClose,
  size = 'sm',
  resetSelectionOnOptionHover = false,
  readOnly,
  disabled = false,
  position = 'bottom-start',
  offset = 4,
  withinPortal = true,
  transitionDuration = 150,
  zIndex,
  closeOnClickOutside = true,
}: ComboboxBaseProps) {
  const uncontrolledStore = useCombobox();
  const store = controlledStore || uncontrolledStore;

  const onDropdownClose = () => {
    onClose?.();
    store.closeDropdown();
  };

  return (
    <ComboboxBaseContext.Provider
      value={{
        store,
        onOptionSubmit,
        size,
        resetSelectionOnOptionHover,
        readOnly,
      }}
    >
      <PopoverBase
        opened={store.dropdownOpened}
        onClose={onDropdownClose}
        position={position}
        offset={offset}
        withinPortal={withinPortal}
        transitionDuration={transitionDuration}
        zIndex={zIndex}
        closeOnClickOutside={closeOnClickOutside}
        closeOnEscape
        withArrow={false}
        disabled={disabled}
      >
        {children}
      </PopoverBase>
    </ComboboxBaseContext.Provider>
  );
}

// Attach compound components
ComboboxBase.Target = ComboboxBaseTarget;
ComboboxBase.Dropdown = ComboboxBaseDropdown;
ComboboxBase.Options = ComboboxBaseOptions;
ComboboxBase.Option = ComboboxBaseOption;
ComboboxBase.Search = ComboboxBaseSearch;
ComboboxBase.Empty = ComboboxBaseEmpty;

ComboboxBase.displayName = '@prismui/core/ComboboxBase';
