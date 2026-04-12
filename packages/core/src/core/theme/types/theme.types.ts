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
import type { PrismuiSizeTokens } from "../../size/types";
import type { PrismuiStateTokens } from "../../state/types";

/**
 * CSS Length
 *
 * Supported CSS length units:
 * - number: treated as px (e.g. 12 → "12px"). Convention is fixed — no ambiguity.
 * - `${n}px`: explicit pixels
 * - `${n}rem`: relative to root font size
 * - `${n}%`: percentage
 *
 * ⚠️ number = px is a system-wide invariant. The Styling Engine MUST NOT reinterpret
 * this as rem or scaled units. "Interpretation authority must not drift."
 */
export type CSSLength = number | `${number}px` | `${number}rem` | `${number}%`;

/**
 * Token Reference
 *
 * Used to reference other tokens (Graph structure).
 * Format: "category.key" or "category.family.shade"
 *
 * Examples:
 * - "colors.blue.500" → references colors.blue[500]
 * - "spacing.md" → references spacing.md
 *
 * ⚠️ TokenRef is typed as `string` for authoring flexibility (Steps 3.2–3.3 use
 * concrete typed structs instead). The format convention above is a DOCUMENTATION
 * CONTRACT, not enforced at the type level. Consumers must validate references
 * at build time or via resolveColorRef at runtime.
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
  size: PrismuiSizeTokens;
  state: PrismuiStateTokens;
  scale: number;
}

