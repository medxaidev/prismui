'use client';

import React, { useState, useCallback, useId } from 'react';
import { PopoverBase } from '../PopoverBase/PopoverBase';
import type { PopoverBaseProps } from '../PopoverBase/PopoverBase';
import { ComboboxBaseContext } from './ComboboxBase.context';
import { ComboboxBaseTarget } from './ComboboxBaseTarget';
import { ComboboxBaseDropdown } from './ComboboxBaseDropdown';
import { ComboboxBaseOptions } from './ComboboxBaseOptions';
import { ComboboxBaseOption } from './ComboboxBaseOption';
import { ComboboxBaseSearch } from './ComboboxBaseSearch';
import { ComboboxBaseEmpty } from './ComboboxBaseEmpty';

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
  children: React.ReactNode;

  /** Controlled opened state. */
  opened?: boolean;

  /** Callback when dropdown opens. */
  onOpen?: () => void;

  /** Callback when dropdown closes. */
  onClose?: () => void;

  /** Callback when opened state changes. */
  onDropdownChange?: (opened: boolean) => void;

  /** Controlled selected value. */
  value?: string | null;

  /** Default selected value (uncontrolled). */
  defaultValue?: string | null;

  /** Callback when a value is selected. */
  onOptionSubmit?: (value: string) => void;

  /** Controlled search value. */
  searchValue?: string;

  /** Default search value (uncontrolled). */
  defaultSearchValue?: string;

  /** Callback when search value changes. */
  onSearchChange?: (value: string) => void;

  /** Whether the combobox is disabled. @default false */
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ComboboxBase({
  children,
  opened: controlledOpened,
  onOpen: onOpenProp,
  onClose: onCloseProp,
  onDropdownChange,
  value: controlledValue,
  defaultValue = null,
  onOptionSubmit,
  searchValue: controlledSearch,
  defaultSearchValue = '',
  onSearchChange,
  disabled = false,
  position = 'bottom-start',
  offset = 4,
  withinPortal = true,
  transitionDuration = 150,
  zIndex,
  closeOnClickOutside = true,
}: ComboboxBaseProps) {
  // ---- Open state ----
  const [uncontrolledOpened, setUncontrolledOpened] = useState(false);
  const isOpenControlled = controlledOpened !== undefined;
  const opened = isOpenControlled ? controlledOpened! : uncontrolledOpened;

  // ---- Value state ----
  const [uncontrolledValue, setUncontrolledValue] = useState<string | null>(defaultValue);
  const isValueControlled = controlledValue !== undefined;
  const value = isValueControlled ? controlledValue! : uncontrolledValue;

  // ---- Search state ----
  const [uncontrolledSearch, setUncontrolledSearch] = useState(defaultSearchValue);
  const isSearchControlled = controlledSearch !== undefined;
  const searchValue = isSearchControlled ? controlledSearch! : uncontrolledSearch;

  // ---- Active index ----
  const [activeIndex, setActiveIndex] = useState(-1);

  // ---- Options count ----
  const [optionsCount, setOptionsCount] = useState(0);

  // ---- ID ----
  const comboboxId = useId();

  // ---- Handlers ----
  const onOpen = useCallback(() => {
    if (disabled) return;
    if (!isOpenControlled) setUncontrolledOpened(true);
    onOpenProp?.();
    onDropdownChange?.(true);
  }, [disabled, isOpenControlled, onOpenProp, onDropdownChange]);

  const onClose = useCallback(() => {
    if (!isOpenControlled) setUncontrolledOpened(false);
    onCloseProp?.();
    onDropdownChange?.(false);
    setActiveIndex(-1);
  }, [isOpenControlled, onCloseProp, onDropdownChange]);

  const onToggle = useCallback(() => {
    if (opened) onClose();
    else onOpen();
  }, [opened, onOpen, onClose]);

  const onSelect = useCallback(
    (val: string) => {
      if (!isValueControlled) setUncontrolledValue(val);
      onOptionSubmit?.(val);
      onClose();
    },
    [isValueControlled, onOptionSubmit, onClose],
  );

  const handleSearchChange = useCallback(
    (val: string) => {
      if (!isSearchControlled) setUncontrolledSearch(val);
      onSearchChange?.(val);
    },
    [isSearchControlled, onSearchChange],
  );

  return (
    <ComboboxBaseContext.Provider
      value={{
        opened,
        onOpen,
        onClose,
        onToggle,
        value,
        onSelect,
        activeIndex,
        setActiveIndex,
        optionsCount,
        setOptionsCount,
        searchValue,
        setSearchValue: handleSearchChange,
        comboboxId,
        disabled,
      }}
    >
      <PopoverBase
        opened={opened}
        onOpen={onOpen}
        onClose={onClose}
        onChange={onDropdownChange}
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
