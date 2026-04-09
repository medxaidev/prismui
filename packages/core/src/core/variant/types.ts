/**
 * Variant System — Step 4.1: Variant Model
 *
 * Two independent dimensions:
 *   - Variant: visual style emphasis (HOW it looks)
 *   - ThemeColor: semantic color role (WHICH color family)
 *
 * Design: Aligned with MUI Joy UI 4-variant model.
 * Color uses Stage 3 semantic palette (not raw color family names).
 */

/**
 * Visual style variant dimension.
 *
 * 4 levels of emphasis, no overlap:
 *   filled   — solid background, highest contrast (≈ Joy UI solid, Mantine filled)
 *   outlined — transparent background + border (≈ Joy UI outlined, Mantine outline)
 *   soft     — tinted background, low emphasis  (≈ Joy UI soft, Mantine light)
 *   plain    — fully transparent, minimal       (≈ Joy UI plain, Mantine subtle)
 */
export type Variant = "filled" | "outlined" | "soft" | "plain";

/**
 * Semantic color dimension.
 *
 * Maps to Stage 3 palette semantic names.
 * Components receive a ThemeColor and resolve it through
 * the palette's SemanticColorToken (Step 4.2).
 *
 * Not a color family name (e.g. 'blue') — always semantic.
 */
export type ThemeColor =
  | "primary"
  | "secondary"
  | "info"
  | "success"
  | "warning"
  | "error"
  | "neutral";

/**
 * All valid Variant values as a readonly tuple.
 * Useful for runtime iteration (e.g. story matrices, tests).
 */
export const VARIANTS = ["filled", "outlined", "soft", "plain"] as const satisfies readonly Variant[];

/**
 * All valid ThemeColor values as a readonly tuple.
 */
export const THEME_COLORS = [
  "primary",
  "secondary",
  "info",
  "success",
  "warning",
  "error",
  "neutral",
] as const satisfies readonly ThemeColor[];
