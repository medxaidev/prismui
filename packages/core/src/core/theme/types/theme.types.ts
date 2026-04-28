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
  TransitionDurationScale,
  TransitionEasingScale,
} from "./token-scale.types";
import type { DefaultColorFamily, PrismUIColorFamilies } from "./color.types";
import type { PrismUIPalette, TextRoleName, TextRoleRef } from "./palette.types";
import type { PrismuiSizeTokens } from "../../size/types";
import type { PrismuiStateTokens } from "../../state/types";
import type { FeedbackFactory } from "../../feedback";

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
 * - `defaultFeedbacks`: L4 Feedback factory list applied when the component
 *   does not receive a `feedbacks` prop (v0.5 Phase 4.1 · D-3 decision ·
 *   `@/devdocs/system/feedback-contract.md` §12.2). Replacement semantics —
 *   undefined → component module default · `[]` → explicit opt-out · array →
 *   complete substitution. Currently consumed by `<Button>`; other Action
 *   Surface components (IconButton / ToggleButton / Switch / Checkbox) gain
 *   the same hook in Phase 4.2+ via the same key.
 */
export interface PrismUIComponentConfig {
  defaultProps?: Record<string, unknown>;
  classNames?: Record<string, string>;
  styles?: Record<string, React.CSSProperties>;
  vars?: Record<CSSVarKey, string | number>;
  defaultFeedbacks?: FeedbackFactory[];
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
  transition: {
    duration: Record<TransitionDurationScale, string>;
    easing: Record<TransitionEasingScale, string>;
  };
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
  /**
   * Focus Pointer-Halo tokens (Switch v1.0 OQ-S-7 · focus-behavior.md §4.3).
   *
   * Controls the appearance of the pointer-focus "halo" — the weak-signal
   * channel in the mode-B真分轨 focus contract. Applied via `box-shadow`
   * on `:focus:not(:focus-visible)` when the element is non-text-input
   * (UA does NOT force `:focus-visible` for <button role="switch"> etc.,
   * so the selector genuinely matches pointer focus).
   *
   * Injected as CSS Variables:
   *   --prismui-focus-pointer-halo-width  → box-shadow spread radius
   *   --prismui-focus-pointer-halo-color  → halo color (CSS color value)
   *
   * Contract scope (see `focus-behavior.md` §4.3 / Switch `design.md` §11.1):
   * PrismUI's official default + official theme preset MUST preserve the
   * halo channel for components that declare mode-B真分轨 (currently only
   * Switch carries this contract). Users who override via
   * `classNames` / `styles` / `vars` retain that SR-1 right; the runtime
   * does NOT block such overrides and they are not in the test scope.
   *
   * Separate from `focusRing` because the two channels have intentionally
   * different visual weights:
   *   - focusRing  — strong-signal (keyboard a11y · WCAG 2.4.7 mandatory)
   *   - focusPointerHalo — weak-signal (pointer confirmation · optional
   *                        per Surface, mandatory on C-2 mode-B carriers)
   */
  focusPointerHalo: {
    width: CSSLength;
    color: string;
  };
  /**
   * Text Role Layer (Step 3.8)
   *
   * Maps abstract text roles to structured palette references.
   * Generates `--prismui-text-{role}` CSS variables at runtime.
   *
   * Usage boundary (System Invariant Rule 3):
   * - Text color (CSS `color`): use `var(--prismui-text-*)`
   * - Non-text (bg/border/icon): use `var(--prismui-color-{semantic}-*)`
   *
   * See stage-3-step-(stage-9)-8.md §3.
   */
  textRoles: Record<TextRoleName, TextRoleRef>;

  /**
   * Z-Index tokens (Stage-11 · L0 Overlay Foundation · OV-FLOAT-3 single source).
   *
   * Drives `useFloatingPosition({ zIndexLevel })` and any future overlay layer
   * stacking. Components MUST NOT hard-code numeric z-index values — always
   * read from this map via Floating primitive or `theme.zIndex.{key}`.
   *
   * Defaults: tooltip 1500 · popover 1300 · modal 1400 · toast 1600.
   * Source: `@/devdocs/system/floating-primitive.md` §5.2.
   */
  zIndex: {
    tooltip: number;
    popover: number;
    modal: number;
    toast: number;
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

