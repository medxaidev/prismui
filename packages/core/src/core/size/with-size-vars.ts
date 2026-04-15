import type { VarsResolver } from '../styles/types';
import { WITH_SIZE_MARK } from '../component/system-marks';
import { defaultSizeTokens } from './default-size-tokens';
import type { PrismuiSize } from './types';

/**
 * SIZE_CSS_VARS
 *
 * The 3 system-level CSS variable names that withSizeVars injects.
 * These form the Size System v2 Contract (three-dimension proportional scale):
 *   --prismui-size-height    → component height    (step +6)
 *   --prismui-size-padding-x → horizontal padding   (step +2)
 *   --prismui-size-font-size → component font size  (step +1)
 *
 * Core principle: Typography 比 Layout 更稳定
 *   height(+6) > paddingX(+2) > fontSize(+1)
 *
 * Explicitly excluded from this contract:
 *   iconSize  → Icon System
 *   gap       → Layout/Spacing System
 */
export const SIZE_CSS_VARS = {
  height: '--prismui-size-height',
  paddingX: '--prismui-size-padding-x',
  fontSize: '--prismui-size-font-size',
} as const;

export type SizeCssVarKey = keyof typeof SIZE_CSS_VARS;
export type SizeCssVarName = (typeof SIZE_CSS_VARS)[SizeCssVarKey];

/**
 * Options for withSizeVars middleware.
 */
export interface WithSizeVarsOptions<Props extends Record<string, any>> {
  /**
   * Predicate that controls whether the size vars are injected.
   * When it returns false, withSizeVars passes through to baseVars only.
   *
   * @example
   * withSizeVars(base, {
   *   enabled: (props) => props.size !== undefined,
   * })
   */
  enabled?: (props: Props) => boolean;
}

/**
 * withSizeVars
 *
 * A varsResolver middleware that injects --prismui-size-height,
 * --prismui-size-padding-x, and --prismui-size-font-size based on
 * props.size and the theme size token table.
 *
 * Spread order: system size vars first, then baseVars.
 * This means baseVarsResolver can override any --prismui-size-* variable
 * by returning the same key — giving components an explicit escape hatch.
 *
 * When options.enabled returns false, size vars are skipped entirely and
 * only baseVars are returned.
 *
 * @param base - The component's own varsResolver
 * @param options - Optional configuration
 * @returns A new varsResolver that merges size system vars + base vars
 *
 * @example
 * // Always inject size vars (default behavior)
 * factory({
 *   systems: ['size'],
 *   styling: { logic: { varsResolver: () => ({}) } },
 * });
 *
 * @example
 * // Override a single size dimension
 * factory({
 *   systems: ['size'],
 *   styling: { logic: { varsResolver: (props) => ({
 *     ...(props.compact && { '--prismui-size-height': '28px' }),
 *   }) } },
 * });
 */
export function withSizeVars<Props extends Record<string, any>>(
  base: VarsResolver<Props>,
  options?: WithSizeVarsOptions<Props>,
): VarsResolver<Props> {
  const wrapped = (props: Props, theme: Parameters<VarsResolver<Props>>[1]) => {
    const baseVars = base(props, theme);

    if (options?.enabled && !options.enabled(props)) {
      return baseVars;
    }

    const size = (props.size as PrismuiSize) ?? 'md';
    const sizeTokens = theme?.size?.[size] ?? defaultSizeTokens[size];

    return {
      [SIZE_CSS_VARS.height]: sizeTokens.height,
      [SIZE_CSS_VARS.paddingX]: sizeTokens.paddingX,
      [SIZE_CSS_VARS.fontSize]: sizeTokens.fontSize,
      ...baseVars,
    };
  };
  (wrapped as any)[WITH_SIZE_MARK] = true;
  return wrapped as VarsResolver<Props>;
}
