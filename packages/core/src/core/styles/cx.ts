/**
 * Concatenates class names, filtering out falsy values.
 *
 * This is a minimal implementation that replaces the need for external
 * libraries like `clsx`. It only handles string concatenation, which is
 * sufficient for PrismUI's styling system.
 *
 * @param args - Class names to concatenate
 * @returns Concatenated class names
 *
 * @example
 * ```ts
 * cx('a', 'b', 'c'); // → 'a b c'
 * cx('a', undefined, 'c'); // → 'a c'
 * cx('a', false, 'c'); // → 'a c'
 * cx(); // → ''
 * ```
 */
export function cx(...args: Array<string | undefined | false | null>): string {
  return args.filter(Boolean).join(' ');
}
