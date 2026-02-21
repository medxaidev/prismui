'use client';

import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import { ComboboxBase } from '../ComboboxBase/ComboboxBase';
import { useCombobox } from '../ComboboxBase/useCombobox';
import { InputBase } from '../InputBase/InputBase';
import type { InputBaseSize, InputBaseVariant } from '../InputBase/InputBase';
import type { PrismuiRadius } from '../../core/theme/types';
import type { SelectOption } from '../Select/Select';
import classes from './Combobox.module.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ComboboxProps {
  /** Array of options or string shorthand. */
  data: (SelectOption | string)[];

  /** Controlled selected value. */
  value?: string | null;

  /** Default selected value (uncontrolled). */
  defaultValue?: string | null;

  /** Callback when a value is selected. */
  onChange?: (value: string | null) => void;

  /** Controlled search value. */
  searchValue?: string;

  /** Callback when search value changes. */
  onSearchChange?: (value: string) => void;

  /** Custom filter function. @default case-insensitive label match */
  filter?: (option: SelectOption, search: string) => boolean;

  /** Placeholder text when no value is selected. */
  placeholder?: string;

  /** Search input placeholder. @default 'Search...' */
  searchPlaceholder?: string;

  /** Input label. */
  label?: React.ReactNode;

  /** Helper text. */
  description?: React.ReactNode;

  /** Error message or state. */
  error?: React.ReactNode | boolean;

  /** Required asterisk. */
  required?: boolean;

  /** Alias for required. */
  withAsterisk?: boolean;

  /** Input size. @default 'sm' */
  size?: InputBaseSize;

  /** Visual variant. @default 'outlined' */
  variant?: InputBaseVariant;

  /** Border radius. */
  radius?: PrismuiRadius;

  /** Whether the combobox is disabled. @default false */
  disabled?: boolean;

  /** Whether the value can be cleared. @default false */
  clearable?: boolean;

  /** Text shown when no options match. @default 'No options' */
  nothingFoundMessage?: React.ReactNode;

  /** If true, the combobox takes full width. @default false */
  fullWidth?: boolean;

  /** Left section content. */
  leftSection?: React.ReactNode;

  /** Additional className. */
  className?: string;

  /** Additional style. */
  style?: React.CSSProperties;

  /** Input id. */
  id?: string;

  /** Custom render function for options. */
  renderOption?: (option: SelectOption, props: { selected: boolean; active: boolean }) => React.ReactNode;

  /** Whether to render dropdown within a portal. @default true */
  withinPortal?: boolean;

  /** Transition duration in ms. @default 150 */
  transitionDuration?: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalizeData(data: (SelectOption | string)[]): SelectOption[] {
  return data.map((item) =>
    typeof item === 'string' ? { value: item, label: item } : item,
  );
}

function defaultFilter(option: SelectOption, search: string): boolean {
  const label = (option.label || option.value).toLowerCase();
  return label.includes(search.toLowerCase().trim());
}

// ---------------------------------------------------------------------------
// Chevron icon
// ---------------------------------------------------------------------------

function ChevronIcon({ opened }: { opened: boolean }) {
  return (
    <span className={classes.chevron} data-opened={opened || undefined}>
      <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M4 6L8 10L12 6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Clear button
// ---------------------------------------------------------------------------

function ClearButton({ onClick }: { onClick: (e: React.MouseEvent) => void }) {
  return (
    <button
      type="button"
      className={classes.clearButton}
      onClick={onClick}
      aria-label="Clear selection"
      tabIndex={-1}
    >
      <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M4 4L12 12M12 4L4 12"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Combobox — public component
// ---------------------------------------------------------------------------

export function Combobox({
  data,
  value: controlledValue,
  defaultValue,
  onChange,
  searchValue: controlledSearch,
  onSearchChange,
  filter = defaultFilter,
  placeholder,
  searchPlaceholder = 'Search...',
  label,
  description,
  error,
  required,
  withAsterisk,
  size = 'sm',
  variant = 'outlined',
  radius,
  disabled = false,
  clearable = false,
  nothingFoundMessage = 'No options',
  fullWidth,
  leftSection,
  className,
  style,
  id,
  renderOption,
  withinPortal,
  transitionDuration,
}: ComboboxProps) {
  // ---- Value state (controlled/uncontrolled) ----
  const isValueControlled = controlledValue !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<string | null>(defaultValue ?? null);
  const _value = isValueControlled ? controlledValue : uncontrolledValue;

  const setValue = useCallback(
    (val: string | null) => {
      if (!isValueControlled) setUncontrolledValue(val);
      onChange?.(val);
    },
    [isValueControlled, onChange],
  );

  // ---- Search state (controlled/uncontrolled) ----
  const isSearchControlled = controlledSearch !== undefined;
  const [uncontrolledSearch, setUncontrolledSearch] = useState('');
  const _search = isSearchControlled ? controlledSearch : uncontrolledSearch;

  const setSearch = useCallback(
    (val: string) => {
      if (!isSearchControlled) setUncontrolledSearch(val);
      onSearchChange?.(val);
    },
    [isSearchControlled, onSearchChange],
  );

  // ---- Combobox store ----
  const combobox = useCombobox({
    onDropdownOpen: () => {
      combobox.updateSelectedOptionIndex('active', { scrollIntoView: true });
    },
    onDropdownClose: () => {
      combobox.resetSelectedOption();
    },
  });

  const triggerRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // ---- Data ----
  const normalizedData = useMemo(() => normalizeData(data), [data]);

  // Build options lockup
  const optionsLockup = useMemo(() => {
    const map: Record<string, SelectOption> = {};
    for (const opt of normalizedData) {
      map[opt.value] = opt;
    }
    return map;
  }, [normalizedData]);

  const selectedOption = _value != null ? optionsLockup[_value] : undefined;

  // Filter options based on search
  const filteredData = useMemo(
    () =>
      _search
        ? normalizedData.filter((opt) => filter(opt, _search))
        : normalizedData,
    [normalizedData, _search, filter],
  );

  // Focus search input when dropdown opens
  useEffect(() => {
    if (combobox.dropdownOpened) {
      requestAnimationFrame(() => {
        searchRef.current?.focus();
      });
    }
  }, [combobox.dropdownOpened]);

  // ---- Handlers ----
  const handleOptionSubmit = useCallback(
    (val: string) => {
      const nextValue = _value === val ? null : val;
      setValue(nextValue);
      setSearch('');
      combobox.closeDropdown();
      triggerRef.current?.focus();
    },
    [_value, setValue, setSearch, combobox],
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setValue(null);
      setSearch('');
      triggerRef.current?.focus();
    },
    [setValue, setSearch],
  );

  const handleClick = useCallback(() => {
    if (!disabled) {
      combobox.toggleDropdown();
    }
  }, [disabled, combobox]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
      combobox.resetSelectedOption();
    },
    [setSearch, combobox],
  );

  // ---- Right section ----
  const showClear = clearable && _value != null && !disabled;
  const rightSection = (
    <>
      {showClear && <ClearButton onClick={handleClear} />}
      <ChevronIcon opened={combobox.dropdownOpened} />
    </>
  );

  // ---- Render options ----
  const optionElements: React.ReactNode[] = [];

  for (const opt of filteredData) {
    const isSelected = _value === opt.value;
    optionElements.push(
      <ComboboxBase.Option
        key={opt.value}
        value={opt.value}
        disabled={opt.disabled}
        active={isSelected}
        className={classes.option}
      >
        {renderOption
          ? renderOption(opt, { selected: isSelected, active: false })
          : (opt.label || opt.value)}
      </ComboboxBase.Option>,
    );
  }

  const hasEnabledOptions = filteredData.some((o) => !o.disabled);

  return (
    <ComboboxBase
      store={combobox}
      onOptionSubmit={handleOptionSubmit}
      disabled={disabled}
      withinPortal={withinPortal}
      transitionDuration={transitionDuration}
    >
      <ComboboxBase.Target targetType="button">
        <InputBase
          ref={triggerRef}
          label={label}
          description={description}
          error={error}
          required={required}
          withAsterisk={withAsterisk}
          size={size}
          variant={variant}
          leftSection={leftSection}
          rightSection={rightSection}
          rightSectionPointerEvents="all"
          fullWidth={fullWidth}
          pointer
          disabled={disabled}
          readOnly
          value={selectedOption ? (selectedOption.label || selectedOption.value) : ''}
          placeholder={placeholder}
          id={id}
          onClick={handleClick}
          className={className}
          style={style}
        />
      </ComboboxBase.Target>

      <ComboboxBase.Dropdown className={classes.dropdown}>
        <ComboboxBase.Search
          ref={searchRef}
          className={classes.search}
          placeholder={searchPlaceholder}
          value={_search}
          onChange={handleSearchChange}
        />
        <div className={classes.options}>
          <ComboboxBase.Options>
            {optionElements}
          </ComboboxBase.Options>
          {!hasEnabledOptions && nothingFoundMessage && (
            <ComboboxBase.Empty className={classes.empty}>
              {nothingFoundMessage}
            </ComboboxBase.Empty>
          )}
        </div>
      </ComboboxBase.Dropdown>
    </ComboboxBase>
  );
}

Combobox.displayName = '@prismui/core/Combobox';
