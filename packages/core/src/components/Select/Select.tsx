'use client';

import React, { useMemo, useCallback, useState, useRef } from 'react';
import { ComboboxBase } from '../ComboboxBase/ComboboxBase';
import { useCombobox } from '../ComboboxBase/useCombobox';
import { InputBase } from '../InputBase/InputBase';
import type { InputBaseSize, InputBaseVariant } from '../InputBase/InputBase';
import type { PrismuiRadius } from '../../core/theme/types';
import classes from './Select.module.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SelectOption {
  /** Option value (unique key). */
  value: string;

  /** Display label. Falls back to value if omitted. */
  label?: string;

  /** Whether this option is disabled. */
  disabled?: boolean;

  /** Group name for grouping options. */
  group?: string;
}

export type SelectStylesNames =
  | 'trigger'
  | 'dropdown'
  | 'option'
  | 'group'
  | 'groupLabel'
  | 'empty'
  | 'chevron'
  | 'clearButton'
  | 'placeholder';

export interface SelectProps {
  /** Array of options or string shorthand. */
  data: (SelectOption | string)[];

  /** Controlled selected value. */
  value?: string | null;

  /** Default selected value (uncontrolled). */
  defaultValue?: string | null;

  /** Callback when a value is selected. */
  onChange?: (value: string | null) => void;

  /** Placeholder text when no value is selected. */
  placeholder?: string;

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

  /** Whether the select is disabled. @default false */
  disabled?: boolean;

  /** Whether the value can be cleared. @default false */
  clearable?: boolean;

  /** Text shown when no options match. @default 'No options' */
  nothingFoundMessage?: React.ReactNode;

  /** If true, the select takes full width. @default false */
  fullWidth?: boolean;

  /** Left section content. */
  leftSection?: React.ReactNode;

  /** Additional className for the root wrapper. */
  className?: string;

  /** Additional style for the root wrapper. */
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

function groupOptions(options: SelectOption[]): Map<string | undefined, SelectOption[]> {
  const groups = new Map<string | undefined, SelectOption[]>();
  for (const opt of options) {
    const key = opt.group;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(opt);
  }
  return groups;
}

// ---------------------------------------------------------------------------
// Chevron icon (inline SVG)
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
// Clear icon (inline SVG)
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
// Select — public component
// ---------------------------------------------------------------------------

export function Select({
  data,
  value: controlledValue,
  defaultValue,
  onChange,
  placeholder,
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
}: SelectProps) {
  // ---- Value state (controlled/uncontrolled) ----
  const isControlled = controlledValue !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<string | null>(defaultValue ?? null);
  const _value = isControlled ? controlledValue : uncontrolledValue;

  const setValue = useCallback(
    (val: string | null) => {
      if (!isControlled) setUncontrolledValue(val);
      onChange?.(val);
    },
    [isControlled, onChange],
  );

  // ---- Combobox store ----
  const combobox = useCombobox({
    onDropdownOpen: () => {
      // When opening, select the active option (the one matching current value)
      combobox.updateSelectedOptionIndex('active', { scrollIntoView: true });
    },
    onDropdownClose: () => {
      combobox.resetSelectedOption();
    },
  });

  const inputRef = useRef<HTMLInputElement>(null);

  // ---- Data ----
  const normalizedData = useMemo(() => normalizeData(data), [data]);

  // Build options lockup for fast value → label lookup
  const optionsLockup = useMemo(() => {
    const map: Record<string, SelectOption> = {};
    for (const opt of normalizedData) {
      map[opt.value] = opt;
    }
    return map;
  }, [normalizedData]);

  const selectedOption = _value != null ? optionsLockup[_value] : undefined;

  // ---- Handlers ----
  const handleOptionSubmit = useCallback(
    (val: string) => {
      const nextValue = _value === val ? null : val; // allow deselect
      setValue(nextValue);
      combobox.closeDropdown();
    },
    [_value, setValue, combobox],
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setValue(null);
      inputRef.current?.focus();
    },
    [setValue],
  );

  const handleClick = useCallback(() => {
    if (!disabled) {
      combobox.toggleDropdown();
    }
  }, [disabled, combobox]);

  // ---- Right section ----
  const showClear = clearable && _value != null && !disabled;
  const rightSection = (
    <>
      {showClear && <ClearButton onClick={handleClear} />}
      <ChevronIcon opened={combobox.dropdownOpened} />
    </>
  );

  // ---- Render options ----
  const grouped = useMemo(() => groupOptions(normalizedData), [normalizedData]);
  const optionElements: React.ReactNode[] = [];

  for (const [groupName, groupOpts] of grouped) {
    if (groupName) {
      optionElements.push(
        <div key={`group-${groupName}`} className={classes.group}>
          <div className={classes.groupLabel}>{groupName}</div>
          {groupOpts.map((opt) => {
            const isSelected = _value === opt.value;
            return (
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
              </ComboboxBase.Option>
            );
          })}
        </div>,
      );
    } else {
      for (const opt of groupOpts) {
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
    }
  }

  const hasOptions = normalizedData.filter((o) => !o.disabled).length > 0;

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
          ref={inputRef}
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
        <ComboboxBase.Options>
          {optionElements}
        </ComboboxBase.Options>
        {!hasOptions && nothingFoundMessage && (
          <ComboboxBase.Empty className={classes.empty}>
            {nothingFoundMessage}
          </ComboboxBase.Empty>
        )}
      </ComboboxBase.Dropdown>
    </ComboboxBase>
  );
}

Select.displayName = '@prismui/core/Select';
