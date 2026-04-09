// CSSLength is defined in theme.types: number = px (system-wide invariant)
import type { CSSLength } from "./theme.types";
import type {
  SpacingScale,
  FontSizeScale,
  FontWeightScale,
  LineHeightScale,
  RadiusScale,
  ShadowScale,
  BreakpointScale,
} from "./token-scale.types";

/**
 * Usage Types
 *
 * Provides specification + escape hatch
 * For Stage 2 StyleProps consumption
 *
 * These types are independent of Theme structure
 * They use Token Scale types directly to avoid circular dependencies
 */

/**
 * Spacing Value
 *
 * Supports theme token + CSSLength escape hatch
 */
export type SpacingValue = SpacingScale | CSSLength;

/**
 * Font Size Value
 *
 * Supports theme token + CSSLength escape hatch
 */
export type FontSizeValue = FontSizeScale | CSSLength;

/**
 * Font Weight Value
 *
 * Supports theme token + number escape hatch
 */
export type FontWeightValue = FontWeightScale | number;

/**
 * Line Height Value
 *
 * Supports theme token + number escape hatch
 */
export type LineHeightValue = LineHeightScale | number;

/**
 * Radius Value
 *
 * Supports theme token + CSSLength escape hatch
 */
export type RadiusValue = RadiusScale | CSSLength;

/**
 * Shadow Value
 *
 * Supports theme token + any CSS shadow string escape hatch
 */
export type ShadowValue = ShadowScale | string;

/**
 * Breakpoint Value
 *
 * Supports theme token + number escape hatch
 */
export type BreakpointValue = BreakpointScale | number;
