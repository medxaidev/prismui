'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getFirstIndex, getNextIndex, getPreviousIndex } from './get-index';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ComboboxDropdownEventSource = 'keyboard' | 'mouse' | 'unknown';

export interface ComboboxStore {
  /** Current dropdown opened state */
  dropdownOpened: boolean;

  /** Opens dropdown */
  openDropdown: (eventSource?: ComboboxDropdownEventSource) => void;

  /** Closes dropdown */
  closeDropdown: (eventSource?: ComboboxDropdownEventSource) => void;

  /** Toggles dropdown opened state */
  toggleDropdown: (eventSource?: ComboboxDropdownEventSource) => void;

  /** Selected option index (ref-based, not state) */
  selectedOptionIndex: number;

  /** Returns currently selected option index or -1 */
  getSelectedOptionIndex: () => number;

  /** Selects Combobox.Option by index — sets data-combobox-selected on the DOM element */
  selectOption: (index: number) => string | null;

  /** Selects first option with data-combobox-active, or first non-disabled option */
  selectActiveOption: () => string | null;

  /** Selects first non-disabled option */
  selectFirstOption: () => string | null;

  /** Selects next non-disabled option (loops if enabled) */
  selectNextOption: () => string | null;

  /** Selects previous non-disabled option (loops if enabled) */
  selectPreviousOption: () => string | null;

  /** Resets selected option index to -1, removes data-combobox-selected */
  resetSelectedOption: () => void;

  /** Triggers click on the currently selected option */
  clickSelectedOption: () => void;

  /** Updates selected option index to match currently selected/active DOM element */
  updateSelectedOptionIndex: (
    target?: 'active' | 'selected',
    options?: { scrollIntoView?: boolean },
  ) => void;

  /** Listbox id for ARIA linking */
  listId: string | null;

  /** Sets listbox id */
  setListId: (id: string) => void;

  /** Ref for the search input */
  searchRef: React.RefObject<HTMLInputElement | null>;

  /** Moves focus to search input */
  focusSearchInput: () => void;

  /** Ref for the target element */
  targetRef: React.RefObject<HTMLElement | null>;

  /** Moves focus to target element */
  focusTarget: () => void;
}

export interface UseComboboxOptions {
  /** Default opened state. @default false */
  defaultOpened?: boolean;

  /** Controlled opened state */
  opened?: boolean;

  /** Called when opened state changes */
  onOpenedChange?: (opened: boolean) => void;

  /** Called when dropdown closes */
  onDropdownClose?: (eventSource: ComboboxDropdownEventSource) => void;

  /** Called when dropdown opens */
  onDropdownOpen?: (eventSource: ComboboxDropdownEventSource) => void;

  /** Whether arrow keys loop through options. @default true */
  loop?: boolean;

  /** scrollIntoView behavior. @default 'instant' */
  scrollBehavior?: ScrollBehavior;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useCombobox({
  defaultOpened,
  opened: controlledOpened,
  onOpenedChange,
  onDropdownClose,
  onDropdownOpen,
  loop = true,
  scrollBehavior = 'instant',
}: UseComboboxOptions = {}): ComboboxStore {
  // ---- Opened state (controlled/uncontrolled) ----
  const isControlled = controlledOpened !== undefined;
  const [uncontrolledOpened, setUncontrolledOpened] = useState(defaultOpened ?? false);
  const dropdownOpened = isControlled ? controlledOpened : uncontrolledOpened;

  const setOpened = useCallback(
    (value: boolean) => {
      if (!isControlled) {
        setUncontrolledOpened(value);
      }
      onOpenedChange?.(value);
    },
    [isControlled, onOpenedChange],
  );

  // ---- Refs ----
  const listId = useRef<string | null>(null);
  const selectedOptionIndex = useRef<number>(-1);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const targetRef = useRef<HTMLElement | null>(null);
  const focusSearchTimeout = useRef<number>(-1);
  const focusTargetTimeout = useRef<number>(-1);
  const selectedIndexUpdateTimeout = useRef<number>(-1);

  // ---- Helpers: query option elements from the DOM ----
  const getOptionElements = useCallback((): HTMLElement[] => {
    if (!listId.current) return [];
    const list = document.getElementById(listId.current);
    if (!list) return [];
    return Array.from(list.querySelectorAll<HTMLElement>('[data-combobox-option]'));
  }, []);

  const clearSelectedItem = useCallback(() => {
    if (!listId.current) return;
    const list = document.getElementById(listId.current);
    if (!list) return;
    const selected = list.querySelector('[data-combobox-selected]');
    selected?.removeAttribute('data-combobox-selected');
    selected?.removeAttribute('aria-selected');
  }, []);

  // ---- Open/Close/Toggle ----
  const openDropdown: ComboboxStore['openDropdown'] = useCallback(
    (eventSource = 'unknown') => {
      if (!dropdownOpened) {
        setOpened(true);
        onDropdownOpen?.(eventSource);
      }
    },
    [dropdownOpened, setOpened, onDropdownOpen],
  );

  const closeDropdown: ComboboxStore['closeDropdown'] = useCallback(
    (eventSource = 'unknown') => {
      if (dropdownOpened) {
        setOpened(false);
        onDropdownClose?.(eventSource);
      }
    },
    [dropdownOpened, setOpened, onDropdownClose],
  );

  const toggleDropdown: ComboboxStore['toggleDropdown'] = useCallback(
    (eventSource = 'unknown') => {
      if (dropdownOpened) {
        closeDropdown(eventSource);
      } else {
        openDropdown(eventSource);
      }
    },
    [dropdownOpened, closeDropdown, openDropdown],
  );

  // ---- Selection ----
  const selectOption: ComboboxStore['selectOption'] = useCallback(
    (index: number) => {
      const items = getOptionElements();
      if (!items.length) return null;

      const nextIndex = index >= items.length ? 0 : index < 0 ? items.length - 1 : index;
      selectedOptionIndex.current = nextIndex;

      if (items[nextIndex] && !items[nextIndex].hasAttribute('data-combobox-disabled')) {
        clearSelectedItem();
        items[nextIndex].setAttribute('data-combobox-selected', 'true');
        items[nextIndex].setAttribute('aria-selected', 'true');
        items[nextIndex].scrollIntoView({ block: 'nearest', behavior: scrollBehavior });
        return items[nextIndex].id || null;
      }

      return null;
    },
    [getOptionElements, clearSelectedItem, scrollBehavior],
  );

  const selectActiveOption: ComboboxStore['selectActiveOption'] = useCallback(() => {
    const items = getOptionElements();
    const activeIndex = items.findIndex((el) => el.hasAttribute('data-combobox-active'));
    if (activeIndex >= 0) {
      return selectOption(activeIndex);
    }
    return selectOption(getFirstIndex(items));
  }, [getOptionElements, selectOption]);

  const selectFirstOption: ComboboxStore['selectFirstOption'] = useCallback(() => {
    const items = getOptionElements();
    return selectOption(getFirstIndex(items));
  }, [getOptionElements, selectOption]);

  const selectNextOption: ComboboxStore['selectNextOption'] = useCallback(() => {
    const items = getOptionElements();
    return selectOption(getNextIndex(selectedOptionIndex.current, items, loop));
  }, [getOptionElements, selectOption, loop]);

  const selectPreviousOption: ComboboxStore['selectPreviousOption'] = useCallback(() => {
    const items = getOptionElements();
    return selectOption(getPreviousIndex(selectedOptionIndex.current, items, loop));
  }, [getOptionElements, selectOption, loop]);

  const resetSelectedOption: ComboboxStore['resetSelectedOption'] = useCallback(() => {
    selectedOptionIndex.current = -1;
    clearSelectedItem();
  }, [clearSelectedItem]);

  const clickSelectedOption: ComboboxStore['clickSelectedOption'] = useCallback(() => {
    const items = getOptionElements();
    const item = items[selectedOptionIndex.current];
    item?.click();
  }, [getOptionElements]);

  const updateSelectedOptionIndex: ComboboxStore['updateSelectedOptionIndex'] = useCallback(
    (target: 'active' | 'selected' = 'selected', options?: { scrollIntoView?: boolean }) => {
      selectedIndexUpdateTimeout.current = window.setTimeout(() => {
        const items = getOptionElements();
        const index = items.findIndex((el) => el.hasAttribute(`data-combobox-${target}`));
        selectedOptionIndex.current = index;

        if (options?.scrollIntoView && items[index]) {
          items[index].scrollIntoView({ block: 'nearest', behavior: scrollBehavior });
        }
      }, 0);
    },
    [getOptionElements, scrollBehavior],
  );

  // ---- Focus helpers ----
  const setListId: ComboboxStore['setListId'] = useCallback((id: string) => {
    listId.current = id;
  }, []);

  const focusSearchInput: ComboboxStore['focusSearchInput'] = useCallback(() => {
    focusSearchTimeout.current = window.setTimeout(() => searchRef.current?.focus(), 0);
  }, []);

  const focusTarget: ComboboxStore['focusTarget'] = useCallback(() => {
    focusTargetTimeout.current = window.setTimeout(() => targetRef.current?.focus(), 0);
  }, []);

  const getSelectedOptionIndex: ComboboxStore['getSelectedOptionIndex'] = useCallback(
    () => selectedOptionIndex.current,
    [],
  );

  // ---- Cleanup timeouts ----
  useEffect(
    () => () => {
      window.clearTimeout(focusSearchTimeout.current);
      window.clearTimeout(focusTargetTimeout.current);
      window.clearTimeout(selectedIndexUpdateTimeout.current);
    },
    [],
  );

  return {
    dropdownOpened,
    openDropdown,
    closeDropdown,
    toggleDropdown,

    selectedOptionIndex: selectedOptionIndex.current,
    getSelectedOptionIndex,
    selectOption,
    selectFirstOption,
    selectActiveOption,
    selectNextOption,
    selectPreviousOption,
    resetSelectedOption,
    updateSelectedOptionIndex,

    listId: listId.current,
    setListId,
    clickSelectedOption,

    searchRef,
    focusSearchInput,

    targetRef,
    focusTarget,
  };
}
