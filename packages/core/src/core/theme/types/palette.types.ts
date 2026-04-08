/**
 * Semantic Palette Types
 *
 * Core Definition:
 * Semantic Palette = Fully Static + Fully Resolvable Token Graph
 *
 * Design Decisions (from stage-3-step-3.md):
 * - All values are ColorRef (type-safe string references)
 * - hover/active are explicitly defined (Freeze Method A — fully static)
 * - Two independent palettes for light/dark mode
 * - No runtime computation, no dynamic derivation
 */

import type { ColorRef, DefaultColorFamily } from "./color.types";

/**
 * Semantic Color Token
 *
 * A single semantic color with all UI interaction states.
 * All values are ColorRef — statically resolvable references to color families.
 *
 * Freeze Decision: Method A (fully static)
 * - No shade+N runtime derivation
 * - All states explicitly defined
 * - Designers can precisely control each state
 *
 * @example
 * primary: {
 *   base: "colors.blue.500",   // default state
 *   hover: "colors.blue.600",  // hover state (darker in light mode)
 *   active: "colors.blue.700", // pressed/active state (darkest in light mode)
 * }
 */
export interface SemanticColorToken<
  T extends string = DefaultColorFamily,
> {
  base: ColorRef<T>;
  hover: ColorRef<T>;
  active: ColorRef<T>;
}

/**
 * Semantic Palette
 *
 * Maps semantic roles to color family references.
 * Used in two independent sets: light and dark mode.
 *
 * Semantic roles:
 * - primary:   main brand color (buttons, links, focus rings)
 * - secondary: secondary brand color (supporting actions)
 * - info:      informational feedback
 * - success:   positive feedback
 * - warning:   cautionary feedback
 * - error:     negative feedback / destructive actions
 * - neutral:   text, borders, backgrounds (references gray family)
 *
 * @example
 * theme.palette.light.primary.base  // "colors.blue.500"
 * theme.palette.dark.error.hover    // "colors.red.300"
 */
export interface PrismUIPalette<
  T extends string = DefaultColorFamily,
> {
  primary: SemanticColorToken<T>;
  secondary: SemanticColorToken<T>;
  info: SemanticColorToken<T>;
  success: SemanticColorToken<T>;
  warning: SemanticColorToken<T>;
  error: SemanticColorToken<T>;
  neutral: SemanticColorToken<T>;
}

/**
 * Semantic Color Name
 *
 * All valid semantic color roles in the palette
 */
export type SemanticColorName = keyof PrismUIPalette;
