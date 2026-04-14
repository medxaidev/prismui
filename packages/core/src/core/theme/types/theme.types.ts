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

import type * as React from 'react';
import type {
  SpacingScale,
  FontSizeScale,
  FontWeightScale,
  LineHeightScale,
  RadiusScale,
  ShadowScale,
  BreakpointScale,
} from "./token-scale.types";
import type { DefaultColorFamily, PrismUIColorFamilies } from "./color.types";
import type { PrismUIPalette } from "./palette.types";
import type { PrismuiSizeTokens } from "../../size/types";
import type { PrismuiStateTokens } from "../../state/types";

/**
 * Valid CSS Custom Property name — must start with "--" per CSS specification.
 *
 * Enforced at compile time for `vars` overrides.
 * Component-level vars should use the component prefix, e.g. "--button-height".
 * Token-domain vars ("--prismui-*") are managed by the theme token system, not here.
 *
 * @example
 *   '--button-height'  // ✅
 *   'button-height'    // ❌ compile error
 */
export type CSSVarKey = `--${string}`;

/**
 * Per-component theme configuration.
 *
 * - `defaultProps`: scalar prop defaults (shallow merge, input-simulator semantics).
 *   - `undefined` from user props falls back to defaultProps value.
 *   - `null` from user props explicitly clears the default.
 *   - `styles`/`classNames` must NOT be set here (use Styling Engine overrides).
 * - `classNames`: per-slot className injection (theme < props, cx-merged).
 * - `styles`: per-slot inline style injection (theme < props, spread-merged, undefined values stripped).
 * - `vars`: CSS Variable overrides keyed by `CSSVarKey` (`--${string}`).
 *   Compile-time enforcement: non-`--` keys are type errors.
 */
export interface PrismUIComponentConfig {
  defaultProps?: Record<string, unknown>;
  classNames?: Record<string, string>;
  styles?: Record<string, React.CSSProperties>;
  vars?: Record<CSSVarKey, string | number>;
}

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
 *
 * Generic parameter C: the union of all color family names.
 * Defaults to DefaultColorFamily (built-in families only).
 * Extend with: PrismUITheme<DefaultColorFamily | 'brand'>
 *
 * Generic parameter S: the union of all color scheme (palette) keys.
 * Defaults to 'light' | 'dark'.
 * Extend with: PrismUITheme<DefaultColorFamily, 'light' | 'dark' | 'dim'>
 */
export interface PrismUITheme<
  C extends string = DefaultColorFamily,
  S extends string = 'light' | 'dark',
> {
  colors: PrismUIColorFamilies<C>;
  palette: Record<S, PrismUIPalette<C>>;
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
  /**
   * Focus Ring tokens.
   *
   * Controls the appearance of the keyboard focus indicator (:focus-visible).
   * Injected as CSS Variables:
   *   --prismui-focus-ring-width   → outline width
   *   --prismui-focus-ring-offset  → outline offset (gap between element and ring)
   *   --prismui-focus-ring-color   → outline color (CSS color value, not ColorRef)
   *
   * color is a direct CSS value (e.g. 'var(--prismui-color-primary)') rather
   * than a ColorRef, because focus ring color often needs to reference already-
   * resolved palette variables, not raw color lookups.
   */
  focusRing: {
    width: CSSLength;
    offset: CSSLength;
    color: string;
  };
  scale: number;
  /**
   * Custom CSS Variables injection (escape hatch).
   * Keys starting with "--prismui-" will trigger a DEV warning.
   * Use your own prefix (e.g. "--app-", "--my-") for safe custom tokens.
   */
  customTokens?: Record<string, string>;

  /**
   * Per-component default props.
   * Key: componentName (stable system ID declared in factory payload).
   * Value: { defaultProps } — scalar props only (shallow merge).
   *
   * @example
   * createTheme({
   *   components: {
   *     Button: { defaultProps: { size: 'lg', variant: 'filled' } },
   *   },
   * })
   */
  components?: Record<string, PrismUIComponentConfig>;
}

