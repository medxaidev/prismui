/**
 * PrismUI Theme Types
 *
 * Core Definition:
 * Theme = Fully Static + Fully Resolvable Token Graph
 *
 * Constraints:
 * - Pure data, no functions
 * - All tokens have explicit granularity + escape hatch
 * - Uses independent Token Scale types
 * - Statically resolvable
 */

import type {
  SpacingScale,
  FontSizeScale,
  FontWeightScale,
  LineHeightScale,
  RadiusScale,
  ShadowScale,
  BreakpointScale,
} from "./token-scale.types";
import type { PrismUIColorFamilies } from "./color.types";
import type { PrismUIPalette } from "./palette.types";

/**
 * CSS Length
 *
 * Supported CSS length units
 * - number: numeric value (interpreted by Styling Engine)
 * - px: pixels
 * - rem: relative to root element font size
 * - %: percentage
 */
export type CSSLength = number | `${number}px` | `${number}rem` | `${number}%`;

/**
 * Token Reference
 *
 * Used to reference other tokens (Graph structure)
 * Format: "category.key" or "category.family.shade"
 *
 * Examples:
 * - "colors.blue.500" → references colors.blue[500]
 * - "spacing.md" → references spacing.md
 */
export type TokenRef = string;

/**
 * PrismUI Theme
 */
export interface PrismUITheme {
  colors: PrismUIColorFamilies;
  palette: {
    light: PrismUIPalette;
    dark: PrismUIPalette;
  };
  typography: {
    fontFamily: string;
    fontFamilyMonospace: string;
    fontSize: Record<FontSizeScale, CSSLength>;
    fontWeight: Record<FontWeightScale, number>;
    lineHeight: Record<LineHeightScale, number>;
  };
  spacing: Record<SpacingScale, CSSLength>;
  radius: Record<RadiusScale, CSSLength>;
  shadows: Record<ShadowScale, string>;
  breakpoints: Record<BreakpointScale, number>;
  scale: number;
}

