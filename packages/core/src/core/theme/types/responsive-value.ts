import type { PrismuiBreakpointKey } from './breakpoint';

/**
 * A responsive value can be:
 * - A plain value (applied at all breakpoints)
 * - An object mapping breakpoint keys to values
 * - An object with a `base` key and breakpoint overrides
 */
export type ResponsiveValue<Value, BP extends string = string> =
  | Value
  | Partial<Record<BP | 'base', Value>>;

/**
 * PrismUI-specific responsive value using the theme's breakpoint keys.
 */
export type PrismuiResponsiveValue<Value> = ResponsiveValue<Value, PrismuiBreakpointKey>;
