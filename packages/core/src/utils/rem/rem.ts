function scaleRem(remValue: string) {
  if (remValue === '0rem') {
    return '0rem';
  }

  return `calc(${remValue} * var(--prismui-scale))`;
}

/**
 * Creates a converter function for a given unit type.
 *
 * @param units The unit type to convert to (e.g. 'rem', 'em').
 * @param options Options for the converter.
 * @param options.shouldScale Whether to apply scaling using `var(--prismui-scale)`.
 *
 * @returns A converter function that takes a value and returns the converted value.
 */
function createConverter(units: string, { shouldScale = false } = {}) {
  /**
   * Converts a value to the specified unit type.
   *
   * @param value The value to convert.
   *
   * @returns The converted value, or undefined if the input value is null or undefined.
   */
  function converter(value: unknown): string | undefined {
    if (value == null) return undefined;

    if (value === 0 || value === '0') {
      return `0${units}`;
    }

    if (typeof value === 'number') {
      const val = `${value / 16}${units}`;
      return shouldScale ? scaleRem(val) : val;
    }

    if (typeof value === 'string') {
      if (value === '') {
        return value;
      }

      if (value.startsWith('calc(') || value.startsWith('clamp(') || value.includes('rgba(')) {
        return value;
      }

      if (value.includes(',')) {
        return value
          .split(',')
          .map((val) => converter(val))
          .join(',');
      }

      if (value.includes(' ')) {
        return value
          .split(' ')
          .map((val) => converter(val))
          .join(' ');
      }

      const replaced = value.replace('px', '');
      if (!Number.isNaN(Number(replaced))) {
        const val = `${Number(replaced) / 16}${units}`;
        return shouldScale ? scaleRem(val) : val;
      }
    }

    return value as string;
  }

  return converter;
}

/**
 * Converts pixel values to `rem`.
 *
 * - numbers are treated as px
 * - numeric strings ("16" / "16px") are treated as px
 * - space/comma separated values are converted part-by-part
 * - `calc(...)`, `clamp(...)`, and `rgba(...)` strings are passed through
 *
 * The output is scaled using `var(--prismui-scale)`.
 */
export const rem = createConverter('rem', { shouldScale: true });

/**
 * Converts pixel values to `em`.
 *
 * Same parsing rules as `rem`, but without applying `var(--prismui-scale)`.
 */
export const em = createConverter('em');
