'use client';

import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import { ComboboxBase } from '../ComboboxBase/ComboboxBase';
import { useComboboxKeyboard } from '../ComboboxBase/useComboboxKeyboard';
import { useComboboxBaseContext } from '../ComboboxBase/ComboboxBase.context';
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
// Inner component (needs ComboboxBase context)
// ---------------------------------------------------------------------------

interface ComboboxInnerProps extends Omit<ComboboxProps, 'value' | 'defaultValue' | 'onChange' | 'searchValue' | 'onSearchChange'> {
  onClear: () => void;
}

function ComboboxInner({
  data,
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
  onClear,
}: ComboboxInnerProps) {
  const ctx = useComboboxBaseContext();
  const normalizedData = useMemo(() => normalizeData(data), [data]);
  const searchRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLInputElement>(null);

  // Filter options based on search
  const filteredData = useMemo(
    () =>
      ctx.searchValue
        ? normalizedData.filter((opt) => filter(opt, ctx.searchValue))
        : normalizedData,
    [normalizedData, ctx.searchValue, filter],
  );

  // Find the label for the current value
  const selectedOption = useMemo(
    () => normalizedData.find((opt) => opt.value === ctx.value),
    [normalizedData, ctx.value],
  );

  // Focus search input when dropdown opens
  useEffect(() => {
    if (ctx.opened) {
      // Small delay to ensure dropdown is rendered
      requestAnimationFrame(() => {
        searchRef.current?.focus();
      });
    }
  }, [ctx.opened]);

  // Keyboard navigation
  const enabledOptions = useMemo(
    () => filteredData.filter((opt) => !opt.disabled),
    [filteredData],
  );

  const { handleKeyDown } = useComboboxKeyboard({
    opened: ctx.opened,
    onOpen: ctx.onOpen,
    onClose: ctx.onClose,
    activeIndex: ctx.activeIndex,
    setActiveIndex: ctx.setActiveIndex,
    optionsCount: enabledOptions.length,
    onSelectActive: () => {
      if (ctx.activeIndex >= 0 && ctx.activeIndex < enabledOptions.length) {
        ctx.onSelect(enabledOptions[ctx.activeIndex].value);
      }
    },
  });

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onClear();
      ctx.setSearchValue('');
      triggerRef.current?.focus();
    },
    [onClear, ctx],
  );

  // Build right section
  const showClear = clearable && ctx.value != null && !disabled;
  const rightSection = (
    <>
      {showClear && <ClearButton onClick={handleClear} />}
      <ChevronIcon opened={ctx.opened} />
    </>
  );

  // Render options
  let optionIndex = 0;
  const optionElements: React.ReactNode[] = [];

  for (const opt of filteredData) {
    if (opt.disabled) {
      optionElements.push(
        <div
          key={opt.value}
          className={classes.option}
          data-disabled
          role="option"
          aria-disabled="true"
          aria-selected={false}
        >
          {opt.label || opt.value}
        </div>,
      );
      continue;
    }
    const idx = optionIndex++;
    const isSelected = ctx.value === opt.value;
    const isActive = ctx.activeIndex === idx;
    optionElements.push(
      <div
        key={opt.value}
        id={`${ctx.comboboxId}-option-${idx}`}
        role="option"
        aria-selected={isSelected}
        data-selected={isSelected || undefined}
        data-active={isActive || undefined}
        className={classes.option}
        onClick={() => ctx.onSelect(opt.value)}
        onMouseEnter={() => ctx.setActiveIndex(idx)}
      >
        {renderOption
          ? renderOption(opt, { selected: isSelected, active: isActive })
          : (opt.label || opt.value)}
      </div>,
    );
  }

  const hasOptions = optionIndex > 0;

  return (
    <>
      <ComboboxBase.Target>
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
          onKeyDown={handleKeyDown}
          className={className}
          style={style}
        />
      </ComboboxBase.Target>

      <ComboboxBase.Dropdown className={classes.dropdown}>
        <ComboboxBase.Search
          ref={searchRef}
          className={classes.search}
          placeholder={searchPlaceholder}
          onKeyDown={handleKeyDown}
        />
        <div className={classes.options}>
          <ComboboxBase.Options>
            {optionElements}
          </ComboboxBase.Options>
          {!hasOptions && nothingFoundMessage && (
            <ComboboxBase.Empty className={classes.empty}>
              {nothingFoundMessage}
            </ComboboxBase.Empty>
          )}
        </div>
      </ComboboxBase.Dropdown>
    </>
  );
}

// ---------------------------------------------------------------------------
// Combobox — public component
// ---------------------------------------------------------------------------

export function Combobox({
  value,
  defaultValue,
  onChange,
  searchValue,
  onSearchChange,
  ...rest
}: ComboboxProps) {
  const handleOptionSubmit = useCallback(
    (val: string) => {
      onChange?.(val);
    },
    [onChange],
  );

  const handleClear = useCallback(() => {
    onChange?.(null);
  }, [onChange]);

  return (
    <ComboboxBase
      value={value}
      defaultValue={defaultValue}
      onOptionSubmit={handleOptionSubmit}
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      disabled={rest.disabled}
    >
      <ComboboxInner {...rest} onClear={handleClear} />
    </ComboboxBase>
  );
}

Combobox.displayName = '@prismui/core/Combobox';
