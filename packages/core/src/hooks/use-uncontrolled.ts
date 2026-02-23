import { useState, useCallback } from 'react';

export interface UseUncontrolledInput<T> {
  /** Controlled value */
  value?: T;

  /** Default value for uncontrolled mode */
  defaultValue?: T;

  /** Fallback value when both value and defaultValue are undefined */
  finalValue?: T;

  /** Called when value changes */
  onChange?: (value: T) => void;
}

/**
 * Manages controlled/uncontrolled state for a component.
 *
 * - If `value` is provided, the component is controlled.
 * - Otherwise, internal state is used, initialized from `defaultValue` or `finalValue`.
 *
 * Returns `[currentValue, setValue, isControlled]`.
 */
export function useUncontrolled<T>({
  value,
  defaultValue,
  finalValue,
  onChange,
}: UseUncontrolledInput<T>): [T, (val: T) => void, boolean] {
  const isControlled = value !== undefined;

  const [internalValue, setInternalValue] = useState<T>(
    defaultValue !== undefined ? defaultValue : (finalValue as T),
  );

  const handleChange = useCallback(
    (val: T) => {
      if (!isControlled) {
        setInternalValue(val);
      }
      onChange?.(val);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isControlled, onChange],
  );

  return [isControlled ? (value as T) : internalValue, handleChange, isControlled];
}
