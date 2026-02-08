import type { CSSVariable, CSSVars } from '../../types';
import type { PrismuiTheme } from './theme';

/**
 * Theme-aware CSS variables type.
 *
 * Supports static objects, theme functions, and arrays:
 * - `{ '--my-var': '10px' }`
 * - `(theme) => ({ '--my-color': theme.colorSchemes.light.palette.common.black })`
 * - `[vars1, vars2]`
 */
export type PrismuiCSSVars<
  Variable extends string = CSSVariable
> = CSSVars<Variable, PrismuiTheme>;
