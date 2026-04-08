/**
 * Color Types
 *
 * Core Definition:
 * Color Families = Fully Static + Fully Resolvable Token Graph
 *
 * Constraints:
 * - Pure data, no functions
 * - All values are valid CSS colors
 * - Statically resolvable
 * - Supports Graph references (for Step 3.3)
 */

/**
 * Color Shade
 *
 * 10-step color scale following Tailwind/MUI convention
 * - 50: lightest
 * - 500: convention (commonly used as base, but not enforced)
 * - 900: darkest
 */
export type ColorShade =
  | 50
  | 100
  | 200
  | 300
  | 400
  | 500
  | 600
  | 700
  | 800
  | 900;

/**
 * Color Value
 *
 * Valid CSS color values
 * - Hex: #rgb, #rrggbb, #rrggbbaa
 * - RGB: rgb(...), rgba(...)
 * - HSL: hsl(...), hsla(...)
 */
export type ColorValue =
  | `#${string}`
  | `rgb(${string})`
  | `rgba(${string})`
  | `hsl(${string})`
  | `hsla(${string})`;

/**
 * Color Scale
 *
 * A single color family with 10 shades
 * Each shade must be a valid CSS color value
 */
export type ColorScale = Record<ColorShade, ColorValue>;

/**
 * Default Color Family Names
 *
 * Built-in color families provided by PrismUI
 * - Core: blue, cyan, green, yellow, violet, red
 * - Extended: indigo, purple, pink, orange, teal
 * - Neutral: gray (single, to avoid semantic overlap)
 */
export type DefaultColorFamily =
  | "blue"
  | "cyan"
  | "green"
  | "yellow"
  | "violet"
  | "red"
  | "indigo"
  | "purple"
  | "pink"
  | "orange"
  | "teal"
  | "gray";

/**
 * Color Families
 *
 * Generic type that allows extension while preserving type safety
 * - Default: uses DefaultColorFamily (autocomplete works)
 * - Extended: users can add their own families via generic parameter
 *
 * @example
 * // Default usage
 * const colors: PrismUIColorFamilies = { blue: {...}, ... };
 * colors.blue[500]; // ✅ Autocomplete works
 *
 * // Extended usage
 * type MyColors = DefaultColorFamily | 'brand' | 'accent';
 * const colors: PrismUIColorFamilies<MyColors> = {
 *   blue: {...},
 *   brand: {...},
 *   accent: {...},
 * };
 * colors.brand[500]; // ✅ Autocomplete works
 */
export type PrismUIColorFamilies<T extends string = DefaultColorFamily> =
  Record<T, ColorScale>;

/**
 * Color Reference
 *
 * Type-safe reference to a color in the color families
 * Format: "colors.{family}.{shade}"
 *
 * Used by Step 3.3 (Semantic Palette) to reference colors
 *
 * @example
 * const ref: ColorRef = "colors.blue.500"; // ✅
 * const ref2: ColorRef<DefaultColorFamily | 'brand'> = "colors.brand.500"; // ✅
 */
export type ColorRef<T extends string = DefaultColorFamily> =
  `colors.${T}.${ColorShade}`;
