import type { CSSProperties } from './css-properties';

/**
 * Base style type: static object or theme function
 */
export type Style<Theme = unknown> =
  | CSSProperties
  | ((theme: Theme) => CSSProperties);

/**
 * Style prop that supports arrays and undefined
 * 
 * Supports:
 * - Static styles: { color: 'red' }
 * - Theme function: (theme) => ({ color: theme.colors.primary[5] })
 * - Arrays: [style1, style2, ...]
 * - undefined (optional prop)
 */
export type StyleProp<Theme = unknown> =
  | Style<Theme>
  | Style<Theme>[]
  | undefined;
