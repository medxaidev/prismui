import type { VarsResolver } from '../styles/types';
import { WITH_STATE_MARK } from '../component/system-marks';
import { defaultStateTokens } from './default-state-tokens';

/**
 * STATE_CSS_VARS
 *
 * The 2 system-level CSS variable names that withStateVars injects.
 * Naming convention: dimension-first (state → dimension → state-name)
 *
 *   --prismui-state-opacity-disabled  → disabled opacity (0~1)
 *   --prismui-state-cursor-disabled   → disabled cursor style
 *
 * Future extensions follow the same pattern:
 *   --prismui-state-opacity-hover
 *   --prismui-state-opacity-loading
 *
 * Explicitly excluded from this contract:
 *   colors  → Variant System (color='disabled' future)
 *   loading → Stage 6 DOM layer (requires Spinner insertion)
 *   focus   → Browser native :focus-visible, no vars needed
 */
export const STATE_CSS_VARS = {
  opacityDisabled: '--prismui-state-opacity-disabled',
  cursorDisabled:  '--prismui-state-cursor-disabled',
} as const;

export type StateCssVarKey  = keyof typeof STATE_CSS_VARS;
export type StateCssVarName = (typeof STATE_CSS_VARS)[StateCssVarKey];

/**
 * Options for withStateVars middleware.
 */
export interface WithStateVarsOptions<Props extends Record<string, any>> {
  /**
   * Predicate that controls whether state vars are injected.
   * Defaults to: always inject.
   *
   * Note: Unlike size/variant, state vars are typically always injected.
   * The CSS :disabled selector controls when they visually take effect.
   */
  enabled?: (props: Props) => boolean;
}

/**
 * withStateVars
 *
 * A varsResolver middleware that injects --prismui-state-opacity-disabled
 * and --prismui-state-cursor-disabled based on theme.state tokens.
 *
 * State vars are injected unconditionally (regardless of props.disabled).
 * The CSS :disabled pseudo-class controls when the vars visually take effect.
 * This keeps the middleware stateless and symmetric with withSizeVars.
 *
 * Spread order: system state vars first, then baseVars.
 * This means baseVarsResolver can override any --prismui-state-* variable
 * by returning the same key — giving components an explicit escape hatch.
 *
 * Execution order: state must be the rightmost system (highest priority):
 *   systems: ['variant', 'size', 'state']
 *   → withStateVars(withSizeVars(withVariantColors(base)))
 *
 * @param base - The component's own varsResolver
 * @param options - Optional configuration
 * @returns A new varsResolver that merges state system vars + base vars
 *
 * @example
 * factory({
 *   systems: ['variant', 'size', 'state'],
 *   styling: { logic: { varsResolver: () => ({}) } },
 * });
 */
export function withStateVars<Props extends Record<string, any>>(
  base: VarsResolver<Props>,
  options?: WithStateVarsOptions<Props>,
): VarsResolver<Props> {
  const wrapped = (props: Props, theme: Parameters<VarsResolver<Props>>[1]) => {
    const baseVars = base(props, theme);

    if (options?.enabled && !options.enabled(props)) {
      return baseVars;
    }

    const stateTokens = theme?.state ?? defaultStateTokens;

    return {
      [STATE_CSS_VARS.opacityDisabled]: stateTokens.disabled.opacity,
      [STATE_CSS_VARS.cursorDisabled]:  stateTokens.disabled.cursor,
      ...baseVars,
    };
  };
  (wrapped as any)[WITH_STATE_MARK] = true;
  return wrapped as VarsResolver<Props>;
}
