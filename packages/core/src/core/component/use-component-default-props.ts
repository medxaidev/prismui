import { useThemeOptional } from '../theme/context/theme.context';

/**
 * Merges theme defaultProps with user-provided props.
 *
 * Semantics (UI-system-consistency-first, not React controlled/uncontrolled):
 * - not passed  → defaultProps value applies
 * - undefined   → treated as "not passed" → defaultProps value applies
 * - null        → explicit clear → null applies
 * - any value   → user value wins
 *
 * Referential stability: if no default needs to be applied (all defaults keys
 * are already provided with a non-undefined value in props), the original
 * props object is returned unchanged.
 *
 * NOTE: defaultProps is an input simulator, not a safety filter.
 * Runtime cannot determine component declared Props type; unknown key detection
 * is deferred to Stage X via payload.componentPropKeys.
 */
function mergeWithDefaults<P extends Record<string, any>>(
  defaults: Partial<P>,
  props: P,
): P {
  // fast path: no defaults configured
  // Object.keys() allocs an array — acceptable at this stage.
  // If profiling shows this as a hot path, replace with a for...in empty check.
  if (Object.keys(defaults).length === 0) return props;

  // fast path: if no default needs to be applied, return original reference.
  // Only checks defaults keys — no deep equality (cost too high).
  let shouldApplyDefaults = false;
  for (const key in defaults) {
    if (props[key] === undefined) {
      shouldApplyDefaults = true;
      break;
    }
  }
  if (!shouldApplyDefaults) return props;

  // Start from props as base, then fill in only the missing defaults.
  // defaultProps is an input simulator: it fills missing inputs, not a safety filter.
  const result: Record<string, any> = { ...props };
  for (const key in defaults) {
    if (props[key] === undefined) {
      result[key] = defaults[key];
    }
  }
  return result as P;
}

/**
 * Hook: resolves theme.components[componentName].defaultProps and merges with props.
 *
 * DEV guards:
 * - Warns if defaultProps contains `styles` or `classNames` (must use Styling Engine instead).
 *
 * @param componentName - Stable system ID (from payload.componentName ?? payload.displayName)
 * @param props - Raw props received by the component
 */
export function useComponentDefaultProps<P extends Record<string, any>>(
  componentName: string,
  props: P,
): P {
  const theme = useThemeOptional();
  const defaults = (theme.components?.[componentName]?.defaultProps ?? {}) as Partial<P>;

  if (process.env.NODE_ENV !== 'production') {
    if ('styles' in defaults || 'classNames' in defaults) {
      console.warn(
        `[PrismUI] Do not use "styles" or "classNames" in theme.components["${componentName}"].defaultProps. ` +
        `Use the Styling Engine classNames/styles override instead.`,
      );
    }
  }

  return mergeWithDefaults(defaults, props);
}
