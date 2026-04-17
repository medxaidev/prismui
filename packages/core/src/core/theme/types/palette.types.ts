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

import type { ColorRef, ColorExpression, DefaultColorFamily } from "./color.types";
import type { ShadowExpression } from "./effect.types";

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
export interface SemanticColorRoles {
  high: {
    bg: ColorExpression;           // high-emphasis background (shade 500)
    hoverBg: ColorExpression;      // hover background (shade 700)
    activeBg: ColorExpression;     // active/pressed background (shade 800)
    fg: ColorExpression;           // foreground: text / icon (near-white)
    hoverShadow: ColorExpression | ShadowExpression;  // hover shadow (per-color glow)
  };
  low: {
    bg: ColorExpression;           // subtle background (alpha 0.08)
    hoverBg: ColorExpression;      // hover background (alpha 0.16)
    activeBg: ColorExpression;     // active background (alpha 0.24)
    fg: ColorExpression;           // foreground (shade 700)
  };
  bordered: {
    bg: ColorExpression;           // background (transparent)
    fg: ColorExpression;           // foreground (shade 600)
    border: ColorExpression;       // border color (alpha / currentcolor-based)
    hoverBg: ColorExpression;      // hover background (alpha 0.08)
    activeBg: ColorExpression;     // active background (alpha 0.16)
    hoverBorder: ColorExpression;  // hover border (currentcolor)
    hoverShadow: ColorExpression | ShadowExpression;  // hover shadow (currentcolor outline)
  };
  minimal: {
    fg: ColorExpression;           // foreground (shade 600)
    hoverBg: ColorExpression;      // hover background (alpha 0.08)
    activeBg: ColorExpression;     // active background (alpha 0.16)
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
> extends SemanticColorRoles {
  base: ColorRef<T>;
  hover: ColorRef<T>;
  active: ColorRef<T>;
  /**
   * The color family name this semantic color maps to.
   * Used by resolveColorExpression to look up shades.
   * e.g. primary → "blue", error → "red"
   */
  family: T;
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

/**
 * Text Role Field
 *
 * Palette fields permitted as text color source.
 * Restricted to `fg` and `bg` — other fields (border, hoverBg, activeBg)
 * are NOT semantically meaningful as text color.
 *
 * See stage-3-step-(stage-9)-8.md §3 for full Text Role Layer spec.
 */
export type TextRoleField = 'fg' | 'bg';

/**
 * Text Role Name (Step 3.8)
 *
 * Abstract roles for text color usage in the UI.
 * Each role maps to a structured TextRoleRef pointing into the semantic palette.
 *
 * Design rationale:
 * - primary/secondary/disabled: neutral-based (text hierarchy)
 * - danger/warning/success/info: semantic-based (status text)
 *
 * See stage-3-step-(stage-9)-8.md §3.
 */
export type TextRoleName =
  | 'primary'    // main body text (Label, Heading)
  | 'secondary'  // supporting text (Description, Caption)
  | 'disabled'   // disabled-state text (usually combined with opacity)
  | 'danger'     // error message text
  | 'warning'    // warning message text
  | 'success'    // success message text
  | 'info';      // informational message text

/**
 * Text Role Reference (Step 3.8)
 *
 * Structured reference from a text role to a semantic palette slot.
 * Replaces string DSL (e.g. `'error.high.bg'`) with a type-safe structure.
 *
 * Benefits over string paths:
 * - Typo-proof (TS validates each field)
 * - Refactorable (IDE can rename roles / fields)
 * - Structurally bound to palette (palette shape changes are caught)
 *
 * Constraint (Rule 5): `semantic` MUST be a SemanticColorName; no variant tokens.
 * Constraint (Rule 7): resolved color MUST be readable on the default background
 *                      (WCAG AA). See stage-3-step-(stage-9)-8.md §5.
 */
export interface TextRoleRef {
  semantic: SemanticColorName;
  role: ColorRoleLevel;
  field: TextRoleField;
}
