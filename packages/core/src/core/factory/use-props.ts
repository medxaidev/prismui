import { omitUndefinedProps } from '../../utils/omit-undefined-props';
import { useTheme } from '../PrismuiProvider/prismui-theme-context';
import type { PrismuiTheme } from '../theme';

/**
 * Three-layer props merge:
 *
 * ```
 * component defaultProps  <  theme.components[name].defaultProps  <  user props
 * ```
 *
 * - `component` — component name (e.g. `'Button'`), used to look up
 *   `theme.components[name].defaultProps`.
 * - `defaultProps` — component-level defaults declared inside the component.
 *   Pass `{}` (or `null`) when the component has no built-in defaults.
 * - `props` — the props the user passed to the component instance.
 *
 * User props with `undefined` values are filtered out so that they do not
 * shadow defaults (uses `omitUndefinedProps`).
 *
 * `defaultProps` in the theme can be an object **or** a function
 * `(theme) => object`, matching Mantine's API.
 */
export function useProps<
  T extends Record<string, any>,
  U extends Partial<T> | null = {},
>(
  component: string,
  defaultProps: U,
  props: T,
): T &
  (U extends null | undefined
    ? {}
    : {
        [Key in Extract<keyof T, keyof U>]-?: U[Key] | NonNullable<T[Key]>;
      }) {
  const theme = useSafeTheme();
  const contextPropsPayload = theme?.components?.[component]?.defaultProps;
  const contextProps: Record<string, any> | undefined =
    typeof contextPropsPayload === 'function'
      ? (contextPropsPayload as (t: PrismuiTheme) => Record<string, any>)(theme!)
      : contextPropsPayload;

  return { ...defaultProps, ...contextProps, ...omitUndefinedProps(props) } as any;
}

/**
 * Internal: returns the theme if a provider is present, or `undefined`.
 *
 * `useProps` must work even when no `PrismuiProvider` wraps the tree
 * (e.g. in unit tests or standalone usage). In that case we simply skip
 * the theme-level defaultProps layer.
 */
function useSafeTheme(): PrismuiTheme | undefined {
  try {
    return useTheme();
  } catch {
    return undefined;
  }
}
