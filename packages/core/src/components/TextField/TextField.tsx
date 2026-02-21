'use client';

import React, { forwardRef, useId, useState, useCallback, useRef, useEffect } from 'react';
import type { PrismuiRadius } from '../../core/theme/types';
import classes from './TextField.module.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TextFieldVariant = 'outlined' | 'filled' | 'standard';
export type TextFieldSize = 'sm' | 'md';

export type TextFieldStylesNames =
  | 'root'
  | 'wrapper'
  | 'input'
  | 'label'
  | 'helperText'
  | 'section'
  | 'required'
  | 'notch';

export interface TextFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Floating label text. */
  label?: string;

  /** Helper text displayed below the input. */
  helperText?: React.ReactNode;

  /** Error message or error state. When truthy, shows error styling. */
  error?: React.ReactNode | boolean;

  /** Visual variant. @default 'outlined' */
  variant?: TextFieldVariant;

  /** Input size. @default 'md' */
  size?: TextFieldSize;

  /** Border radius (outlined variant only). */
  radius?: PrismuiRadius;

  /** Force label shrink state. Useful for date/time inputs. */
  shrink?: boolean;

  /** Content on the left side of the input. */
  leftSection?: React.ReactNode;

  /** Content on the right side of the input. */
  rightSection?: React.ReactNode;

  /** pointer-events on the right section. @default 'none' */
  rightSectionPointerEvents?: React.CSSProperties['pointerEvents'];

  /** If true, the input takes 100% width. @default true */
  fullWidth?: boolean;

  /** Whether the input is required (adds asterisk to label). */
  required?: boolean;

  /** Multiline mode (renders textarea). @default false */
  multiline?: boolean;

  /** Number of rows for multiline. */
  rows?: number;

  /** Disables pointer events on the input (for Select trigger). @default false */
  pointer?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const TextField = forwardRef<HTMLInputElement | HTMLTextAreaElement, TextFieldProps>(
  function TextField(
    {
      label,
      helperText,
      error,
      variant = 'outlined',
      size = 'md',
      radius,
      shrink: shrinkProp,
      leftSection,
      rightSection,
      rightSectionPointerEvents = 'none',
      fullWidth = true,
      required,
      disabled,
      multiline = false,
      rows,
      pointer,
      id: idProp,
      value,
      defaultValue,
      placeholder,
      onFocus,
      onBlur,
      onChange,
      className,
      style,
      type,
      readOnly,
      ...rest
    },
    ref,
  ) {
    const generatedId = useId();
    const id = idProp ?? generatedId;
    const helperId = `${id}-helper`;

    const [focused, setFocused] = useState(false);
    const [hasValue, setHasValue] = useState(() => {
      if (value !== undefined) return value !== '' && value !== null;
      if (defaultValue !== undefined) return defaultValue !== '' && defaultValue !== null;
      return false;
    });

    // Track value for uncontrolled inputs
    const internalRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

    // Sync hasValue with controlled value prop
    useEffect(() => {
      if (value !== undefined) {
        setHasValue(value !== '' && value !== null);
      }
    }, [value]);

    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLInputElement & HTMLTextAreaElement>) => {
        setFocused(true);
        onFocus?.(e as React.FocusEvent<HTMLInputElement>);
      },
      [onFocus],
    );

    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLInputElement & HTMLTextAreaElement>) => {
        setFocused(false);
        onBlur?.(e as React.FocusEvent<HTMLInputElement>);
      },
      [onBlur],
    );

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>) => {
        setHasValue(e.target.value !== '');
        onChange?.(e as React.ChangeEvent<HTMLInputElement>);
      },
      [onChange],
    );

    // Determine shrink state
    const shouldShrink = shrinkProp ?? (focused || hasValue || !!placeholder);

    const hasError = !!error;
    const showHelperText = (hasError && typeof error !== 'boolean') || helperText;

    // ARIA
    const ariaProps: Record<string, unknown> = {};
    if (required) ariaProps['aria-required'] = true;
    if (hasError) ariaProps['aria-invalid'] = true;
    if (showHelperText) ariaProps['aria-describedby'] = helperId;

    // Right section style
    const rightSectionStyle: React.CSSProperties | undefined =
      rightSectionPointerEvents !== 'none'
        ? { pointerEvents: rightSectionPointerEvents }
        : undefined;

    // Radius style (outlined only)
    const rootStyle: React.CSSProperties = {
      ...style,
      ...(radius !== undefined && variant === 'outlined'
        ? { '--tf-radius': typeof radius === 'number' ? `${radius}px` : `var(--prismui-radius-${radius})` }
        : {}),
    } as React.CSSProperties;

    // Shared input props
    const inputProps = {
      ref: (node: HTMLInputElement | HTMLTextAreaElement | null) => {
        internalRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLInputElement | HTMLTextAreaElement | null>).current = node;
        }
      },
      id,
      disabled,
      readOnly,
      value,
      defaultValue,
      placeholder,
      onFocus: handleFocus,
      onBlur: handleBlur,
      onChange: handleChange,
      className: classes.input,
      'data-pointer': pointer || undefined,
      'data-multiline': multiline || undefined,
      ...ariaProps,
      ...rest,
    };

    // Label text for the notch legend (outlined variant)
    const labelText = label
      ? `${label}${required ? ' *' : ''}`
      : undefined;

    return (
      <div
        className={[classes.root, className].filter(Boolean).join(' ')}
        data-variant={variant}
        data-size={size}
        data-error={hasError || undefined}
        data-disabled={disabled || undefined}
        data-shrink={shouldShrink || undefined}
        data-has-label={label ? true : undefined}
        data-with-left-section={leftSection ? true : undefined}
        data-with-right-section={rightSection ? true : undefined}
        style={rootStyle}
      >
        <div
          className={classes.wrapper}
          data-disabled={disabled || undefined}
          data-multiline={multiline || undefined}
        >
          {/* Floating label — inside wrapper so top:50% is relative to input area */}
          {label && (
            <label
              className={classes.label}
              htmlFor={id}
              data-shrink={shouldShrink || undefined}
            >
              {label}
              {required && <span className={classes.required} aria-hidden="true"> *</span>}
            </label>
          )}

          {leftSection && (
            <div className={classes.section} data-position="left">
              {leftSection}
            </div>
          )}

          {multiline ? (
            <textarea
              {...(inputProps as React.TextareaHTMLAttributes<HTMLTextAreaElement> & Record<string, unknown>)}
              ref={inputProps.ref as React.Ref<HTMLTextAreaElement>}
              rows={rows}
            />
          ) : (
            <input
              {...(inputProps as React.InputHTMLAttributes<HTMLInputElement> & Record<string, unknown>)}
              ref={inputProps.ref as React.Ref<HTMLInputElement>}
              type={type}
            />
          )}

          {rightSection && (
            <div
              className={classes.section}
              data-position="right"
              style={rightSectionStyle}
            >
              {rightSection}
            </div>
          )}

          {/* Outlined notch: fieldset+legend creates the border gap around the label */}
          {variant === 'outlined' && (
            <fieldset aria-hidden="true" className={classes.notch} data-shrink={shouldShrink || undefined}>
              <legend className={classes.notchLegend} data-shrink={shouldShrink || undefined}>
                {shouldShrink && labelText ? (
                  <span>{labelText}</span>
                ) : (
                  // When not shrunk, legend has zero width so no notch gap
                  <span className={classes.notchLegendHidden}>{labelText || ''}</span>
                )}
              </legend>
            </fieldset>
          )}
        </div>

        {showHelperText && (
          <div className={classes.helperText} id={helperId} role={hasError ? 'alert' : undefined}>
            {hasError && typeof error !== 'boolean' ? error : helperText}
          </div>
        )}
      </div>
    );
  },
);

TextField.displayName = '@prismui/core/TextField';
