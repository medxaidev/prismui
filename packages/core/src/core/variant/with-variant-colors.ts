import type { VarsResolver } from '../styles/types';
import { WITH_VARIANT_MARK } from '../component/system-marks';
import { variantColorResolver } from './variant-color-resolver';

/**
 * VARIANT_CSS_VARS
 *
 * The 7 system-level CSS variable names that withVariantColors injects.
 * These form the Variant System Contract: any component that participates
 * in the variant system consumes exactly these 7 variables in its CSS Module.
 */
export const VARIANT_CSS_VARS = {
  bg: '--prismui-variant-bg',
  fg: '--prismui-variant-fg',
  hoverBg: '--prismui-variant-hover-bg',
  activeBg: '--prismui-variant-active-bg',
  border: '--prismui-variant-border',
  hoverBorder: '--prismui-variant-hover-border',
  hoverShadow: '--prismui-variant-hover-shadow',
} as const;

export type VariantCssVarKey = keyof typeof VARIANT_CSS_VARS;
export type VariantCssVarName = (typeof VARIANT_CSS_VARS)[VariantCssVarKey];

/**
 * Options for withVariantColors middleware.
 */
export interface WithVariantColorsOptions<Props extends Record<string, any>> {
  /**
   * Predicate that controls whether the variant color vars are injected.
   * When it returns false, withVariantColors passes through to baseVars only.
   *
   * Useful for components where variant is truly optional and the absence of
   * a variant prop should suppress all --prismui-variant-* injection.
   *
   * @example
   * // Only inject when variant is explicitly set
   * withVariantColors(base, {
   *   enabled: (props) => props.variant !== undefined,
   * })
   */
  enabled?: (props: Props) => boolean;
}

/**
 * withVariantColors
 *
 * A varsResolver middleware that automatically injects the 4 system-level
 * --prismui-variant-* CSS variables based on props.variant and props.color.
 *
 * Usage:
 *   factory({ varsResolver: withVariantColors(sizeOnlyVarsResolver) })
 *
 * Spread order: system variant vars first, then baseVars.
 * This means baseVarsResolver can override any --prismui-variant-* variable
 * by returning the same key — giving components an explicit escape hatch.
 *
 * When options.enabled returns false, variant vars are skipped entirely and
 * only baseVars are returned — no --prismui-variant-* keys are injected.
 *
 * @param base - The component's own varsResolver (e.g. size vars only)
 * @param options - Optional configuration
 * @returns A new varsResolver that merges variant system vars + base vars
 *
 * @example
 * // Button: always inject variant colors (default behavior)
 * factory({
 *   varsResolver: withVariantColors(sizeVarsResolver),
 * });
 *
 * @example
 * // Component where variant is optional — only inject when explicitly set
 * factory({
 *   varsResolver: withVariantColors(baseVarsResolver, {
 *     enabled: (props) => props.variant !== undefined,
 *   }),
 * });
 */
export function withVariantColors<Props extends Record<string, any>>(
  base: VarsResolver<Props>,
  options?: WithVariantColorsOptions<Props>,
): VarsResolver<Props> {
  const wrapped = (props: Props, theme: Parameters<VarsResolver<Props>>[1]) => {
    const baseVars = base(props, theme);

    if (options?.enabled && !options.enabled(props)) {
      return baseVars;
    }

    const variantVars = variantColorResolver({
      variant: (props.variant as any) ?? 'filled',
      color: (props.color as any) ?? 'primary',
    });

    return {
      [VARIANT_CSS_VARS.bg]: variantVars.bg,
      [VARIANT_CSS_VARS.fg]: variantVars.fg,
      [VARIANT_CSS_VARS.hoverBg]: variantVars.hoverBg,
      [VARIANT_CSS_VARS.activeBg]: variantVars.activeBg,
      [VARIANT_CSS_VARS.border]: variantVars.border,
      [VARIANT_CSS_VARS.hoverBorder]: variantVars.hoverBorder,
      [VARIANT_CSS_VARS.hoverShadow]: variantVars.hoverShadow,
      ...baseVars,
    };
  };
  (wrapped as any)[WITH_VARIANT_MARK] = true;
  return wrapped as VarsResolver<Props>;
}
