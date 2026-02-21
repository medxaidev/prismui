'use client';

import React, { forwardRef, useId, useState, useCallback } from 'react';
import { InputBaseContext } from './InputBase.context';
import classes from './InputBase.module.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type InputBaseSize = 'sm' | 'md' | 'lg';
export type InputBaseVariant = 'outlined' | 'soft' | 'plain';

export interface InputWrapperProps {
  /** Input label. */
  label?: React.ReactNode;

  /** Helper text displayed below the input. */
  description?: React.ReactNode;

  /** Error message (string) or error state (boolean). */
  error?: React.ReactNode | boolean;

  /** Adds required asterisk after label. */
  required?: boolean;

  /** Alias for required — adds asterisk after label. */
  withAsterisk?: boolean;

  /** htmlFor on the <label> element. */
  labelFor?: string;

  /** Order of label, input, description, error elements. */
  inputWrapperOrder?: ('label' | 'input' | 'description' | 'error')[];

  /** Whether the input takes full width. */
  fullWidth?: boolean;

  /** Input element. */
  children: React.ReactNode;

  /** IDs for ARIA linking (set internally by InputBase). */
  _descriptionId?: string;
  _errorId?: string;
}

export interface InputBaseProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Input label. */
  label?: React.ReactNode;

  /** Helper text displayed below the input. */
  description?: React.ReactNode;

  /** Error message (string) or error state (boolean). */
  error?: React.ReactNode | boolean;

  /** Adds required asterisk after label. */
  required?: boolean;

  /** Alias for required — adds asterisk after label. */
  withAsterisk?: boolean;

  /** Input size. @default 'sm' */
  size?: InputBaseSize;

  /** Visual variant. @default 'outlined' */
  variant?: InputBaseVariant;

  /** Content on the left side of the input. */
  leftSection?: React.ReactNode;

  /** Width of the left section slot. */
  leftSectionWidth?: number | string;

  /** Content on the right side of the input. */
  rightSection?: React.ReactNode;

  /** Width of the right section slot. */
  rightSectionWidth?: number | string;

  /** pointer-events on the right section. @default 'none' */
  rightSectionPointerEvents?: React.CSSProperties['pointerEvents'];

  /** If true, the input takes 100% width of its container. @default false */
  fullWidth?: boolean;

  /** Disables pointer events on the input (for Select trigger). @default false */
  pointer?: boolean;

  /** Order of label, input, description, error elements. */
  inputWrapperOrder?: ('label' | 'input' | 'description' | 'error')[];

  /** Additional props for the outer wrapper div. */
  wrapperProps?: React.HTMLAttributes<HTMLDivElement>;

  /** Additional className for the wrapper div (set by Layer 3 via getStyles). */
  wrapperClassName?: string;

  /** Additional style for the wrapper div (set by Layer 3 via varsResolver). */
  wrapperStyle?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// InputWrapper — standalone layout primitive
// ---------------------------------------------------------------------------

export function InputWrapper({
  label,
  description,
  error,
  required,
  withAsterisk,
  labelFor,
  inputWrapperOrder = ['label', 'input', 'description', 'error'],
  fullWidth,
  children,
  _descriptionId,
  _errorId,
}: InputWrapperProps) {
  const showAsterisk = required || withAsterisk;
  const hasError = !!error;

  const labelEl = label ? (
    <label key="label" className={classes.label} htmlFor={labelFor}>
      {label}
      {showAsterisk && (
        <span className={classes.required} aria-hidden="true">*</span>
      )}
    </label>
  ) : null;

  const descriptionEl = description ? (
    <div key="description" id={_descriptionId} className={classes.description}>
      {description}
    </div>
  ) : null;

  const errorEl = hasError && typeof error !== 'boolean' ? (
    <div key="error" id={_errorId} className={classes.error} role="alert">
      {error}
    </div>
  ) : null;

  const inputEl = <React.Fragment key="input">{children}</React.Fragment>;

  const elementMap: Record<string, React.ReactNode> = {
    label: labelEl,
    input: inputEl,
    description: descriptionEl,
    error: errorEl,
  };

  return (
    <div className={classes.root} data-full-width={fullWidth || undefined}>
      {inputWrapperOrder.map((key) => elementMap[key])}
    </div>
  );
}

InputWrapper.displayName = '@prismui/core/InputWrapper';

// ---------------------------------------------------------------------------
// InputBase — Layer 2 behavioral base
// ---------------------------------------------------------------------------

export const InputBase = forwardRef<HTMLInputElement, InputBaseProps>(
  function InputBase(
    {
      label,
      description,
      error,
      required,
      withAsterisk,
      size = 'sm',
      variant = 'outlined',
      leftSection,
      leftSectionWidth,
      rightSection,
      rightSectionWidth,
      rightSectionPointerEvents = 'none',
      fullWidth,
      pointer,
      inputWrapperOrder,
      wrapperProps,
      wrapperClassName,
      wrapperStyle,
      id: idProp,
      disabled,
      onFocus,
      onBlur,
      style,
      className,
      ...rest
    },
    ref,
  ) {
    const generatedId = useId();
    const id = idProp ?? generatedId;
    const descriptionId = `${id}-description`;
    const errorId = `${id}-error`;

    const [focused, setFocused] = useState(false);

    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setFocused(true);
        onFocus?.(e);
      },
      [onFocus],
    );

    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setFocused(false);
        onBlur?.(e);
      },
      [onBlur],
    );

    const hasError = !!error;

    const leftSectionStyle: React.CSSProperties | undefined = leftSectionWidth
      ? { width: leftSectionWidth }
      : undefined;

    const rightSectionStyle: React.CSSProperties | undefined =
      rightSectionWidth || rightSectionPointerEvents !== 'none'
        ? {
            ...(rightSectionWidth ? { width: rightSectionWidth } : {}),
            pointerEvents: rightSectionPointerEvents,
          }
        : undefined;

    const ariaProps: React.AriaAttributes = {};
    if (required || withAsterisk) ariaProps['aria-required'] = true;
    if (hasError) ariaProps['aria-invalid'] = true;
    if (description) ariaProps['aria-describedby'] = descriptionId;
    if (hasError && typeof error !== 'boolean') {
      ariaProps['aria-errormessage'] = errorId;
    }

    const wrapperCls = [classes.wrapper, wrapperClassName].filter(Boolean).join(' ');

    const inputEl = (
      <InputBaseContext.Provider
        value={{ error: hasError, disabled: !!disabled, id, descriptionId, errorId }}
      >
        <div
          className={wrapperCls}
          data-variant={variant}
          data-size={size}
          data-focused={focused || undefined}
          data-error={hasError || undefined}
          data-disabled={disabled || undefined}
          data-with-left-section={leftSection ? true : undefined}
          data-with-right-section={rightSection ? true : undefined}
          style={wrapperStyle}
          {...wrapperProps}
        >
          {leftSection && (
            <div className={classes.section} data-position="left" style={leftSectionStyle}>
              {leftSection}
            </div>
          )}

          <input
            ref={ref}
            id={id}
            disabled={disabled}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={[classes.input, className].filter(Boolean).join(' ')}
            data-pointer={pointer || undefined}
            style={style}
            {...ariaProps}
            {...rest}
          />

          {rightSection && (
            <div className={classes.section} data-position="right" style={rightSectionStyle}>
              {rightSection}
            </div>
          )}
        </div>
      </InputBaseContext.Provider>
    );

    if (!label && !description && !error) {
      return inputEl;
    }

    return (
      <InputWrapper
        label={label}
        description={description}
        error={error}
        required={required}
        withAsterisk={withAsterisk}
        labelFor={id}
        inputWrapperOrder={inputWrapperOrder}
        fullWidth={fullWidth}
        _descriptionId={descriptionId}
        _errorId={errorId}
      >
        {inputEl}
      </InputWrapper>
    );
  },
);

InputBase.displayName = '@prismui/core/InputBase';
