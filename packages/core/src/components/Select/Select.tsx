'use client';

import React, { useMemo, useCallback, useRef } from 'react';
import { ComboboxBase } from '../ComboboxBase/ComboboxBase';
import { useComboboxKeyboard } from '../ComboboxBase/useComboboxKeyboard';
import { useComboboxBaseContext } from '../ComboboxBase/ComboboxBase.context';
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
// Inner component (needs ComboboxBase context)
// ---------------------------------------------------------------------------

interface SelectInnerProps extends Omit<SelectProps, 'value' | 'defaultValue' | 'onChange'> {
  onClear: () => void;
}

function SelectInner({
  data,
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
  onClear,
}: SelectInnerProps) {
  const ctx = useComboboxBaseContext();
  const normalizedData = useMemo(() => normalizeData(data), [data]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Find the label for the current value
  const selectedOption = useMemo(
    () => normalizedData.find((opt) => opt.value === ctx.value),
    [normalizedData, ctx.value],
  );

  // Keyboard navigation
  const { handleKeyDown } = useComboboxKeyboard({
    opened: ctx.opened,
    onOpen: ctx.onOpen,
    onClose: ctx.onClose,
    activeIndex: ctx.activeIndex,
    setActiveIndex: ctx.setActiveIndex,
    optionsCount: ctx.optionsCount,
    onSelectActive: () => {
      // Find the option at activeIndex
      let idx = 0;
      for (const opt of normalizedData) {
        if (!opt.disabled) {
          if (idx === ctx.activeIndex) {
            ctx.onSelect(opt.value);
            return;
          }
          idx++;
        }
      }
    },
  });

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onClear();
      inputRef.current?.focus();
    },
    [onClear],
  );

  // Build right section: clear button + chevron
  const showClear = clearable && ctx.value != null && !disabled;
  const rightSection = (
    <>
      {showClear && <ClearButton onClick={handleClear} />}
      <ChevronIcon opened={ctx.opened} />
    </>
  );

  // Group options
  const grouped = useMemo(() => groupOptions(normalizedData), [normalizedData]);

  // Render options
  let optionIndex = 0;
  const optionElements: React.ReactNode[] = [];

  for (const [groupName, groupOpts] of grouped) {
    if (groupName) {
      optionElements.push(
        <div key={`group-${groupName}`} className={classes.group}>
          <div className={classes.groupLabel}>{groupName}</div>
          {groupOpts.map((opt) => {
            if (opt.disabled) {
              return (
                <div
                  key={opt.value}
                  className={classes.option}
                  data-disabled
                  role="option"
                  aria-disabled="true"
                  aria-selected={false}
                >
                  {opt.label || opt.value}
                </div>
              );
            }
            const idx = optionIndex++;
            const isSelected = ctx.value === opt.value;
            const isActive = ctx.activeIndex === idx;
            return (
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
              </div>
            );
          })}
        </div>,
      );
    } else {
      for (const opt of groupOpts) {
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
    }
  }

  const hasOptions = optionIndex > 0;

  return (
    <>
      <ComboboxBase.Target>
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
          onKeyDown={handleKeyDown}
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
    </>
  );
}

// ---------------------------------------------------------------------------
// Select — public component
// ---------------------------------------------------------------------------

export function Select({
  value,
  defaultValue,
  onChange,
  ...rest
}: SelectProps) {
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
      disabled={rest.disabled}
    >
      <SelectInner {...rest} onClear={handleClear} />
    </ComboboxBase>
  );
}

Select.displayName = '@prismui/core/Select';
