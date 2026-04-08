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
 * Semantic Color Roles (Step 3.4)
 *
 * Provides statically resolvable color tokens for each emphasis level.
 * This layer is consumed by the variant system (Step 4.2) via a lookup table —
 * it does NOT define variant behavior itself.
 *
 * Naming uses abstract emphasis levels, fully decoupled from variant names:
 *   high     → strong emphasis  (consumed by 'filled' variant)
 *   low      → subtle emphasis  (consumed by 'soft' variant)
 *   bordered → structural       (consumed by 'outlined' variant)
 *   minimal  → minimal          (consumed by 'plain' variant)
 *
 * The mapping from variant → role is defined in Step 4.2 (VARIANT_TO_ROLE).
 * This decoupling means: adding a new variant never requires changing the palette.
 *
 * Field naming:
 *   fg = foreground (text, icons, and other foreground elements)
 *   bg = background surface
 *   hoverBg = background surface revealed on hover interaction
 *   border = structural border color
 *
 * Note on hoverBg: intentionally kept as 'hoverBg' (not 'hoverLayer') at this
 * stage. Renaming to a more abstract 'hoverLayer' is deferred to Stage 5 when
 * an overlay/state-layer abstraction is introduced.
 */
export interface SemanticColorRoles<
  T extends string = DefaultColorFamily,
> {
  high: {
    bg: ColorRef<T>;   // high-emphasis background (typically shade 500)
    hoverBg: ColorRef<T>;   // background on hover (typically shade 600)
    fg: ColorRef<T>;   // foreground: text / icon (typically near-white)
  };
  low: {
    bg: ColorRef<T>;   // subtle background (typically shade 50)
    hoverBg: ColorRef<T>;   // background on hover (typically shade 100)
    fg: ColorRef<T>;   // foreground: text / icon (typically shade 700)
  };
  bordered: {
    border: ColorRef<T>;   // border color (typically shade 300)
    fg: ColorRef<T>;   // foreground: text / icon (typically shade 600)
    hoverBg: ColorRef<T>;   // background revealed on hover (typically shade 50)
  };
  minimal: {
    fg: ColorRef<T>;   // foreground: text / icon (typically shade 600)
    hoverBg: ColorRef<T>;   // background revealed on hover (typically shade 50)
  };
}

/**
 * Semantic Color Token
 *
 * Combines abstract interaction states (Step 3.3) with color roles (Step 3.4).
 *
 * Interaction states (base/hover/active):
 *   Generic states for non-variant-specific use cases, e.g.:
 *   focus rings, generic color references, icon colors outside variant context.
 *
 * Color roles (high/low/bordered/minimal):
 *   Variant-specific UI expressions. The variant system queries these
 *   tokens via a lookup table — zero runtime derivation.
 *
 * Freeze Decision: Method A (fully static)
 * - No shade+N runtime derivation
 * - All states explicitly defined
 * - Designers can precisely control each state
 *
 * @example
 * theme.palette.light.primary.base           // "colors.blue.500"
 * theme.palette.light.primary.high.bg        // "colors.blue.500"
 * theme.palette.light.primary.low.fg         // "colors.blue.700"
 * theme.palette.light.primary.bordered.border // "colors.blue.300"
 */
export interface SemanticColorToken<
  T extends string = DefaultColorFamily,
> extends SemanticColorRoles<T> {
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

/**
 * Color Role Level
 *
 * The four emphasis levels in SemanticColorRoles.
 * Used as a lookup key in Step 4.2's VARIANT_TO_ROLE mapping.
 */
export type ColorRoleLevel = keyof SemanticColorRoles;
