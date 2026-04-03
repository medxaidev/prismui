import { cx } from './cx';
import { splitStyle } from './split-style';
import type { GetStylesInput, GetStylesFn, WithRoot } from './types';

/**
 * Creates a getStyles function for a component.
 *
 * The getStyles function computes the final className and style for each slot
 * (StylesName) by merging system styles and user overrides.
 *
 * **Merge strategy**:
 * - className: `system classes → classNames[name] → className (root only)`
 * - style (root only): `system vars → user vars → inline styles`
 *
 * **Key behaviors**:
 * 1. All slots get merged className
 * 2. Only root slot gets style (ALWAYS present, even if empty `{}`)
 * 3. User style is split into CSS Variables and inline styles for layered merging
 *
 * **Deterministic design**: Root slot always returns a style object (never undefined).
 * This avoids conditional branching and ensures consistent behavior.
 *
 * **Type constraint**: Names MUST include 'root'. This is enforced at compile time.
 *
 * @template Names - The component's StylesNames type (must include 'root')
 * @param input - Input data for computing styles
 * @returns A getStyles function
 *
 * @example
 * ```ts
 * // ✅ Valid: Names includes 'root'
 * const getStyles = createGetStyles({
 *   classes: { root: 'btn-root', label: 'btn-label' },
 *   vars: { '--button-height': '48px' },
 *   className: 'user-button',
 *   classNames: { root: 'user-root' },
 *   style: { '--opacity': 0.5, padding: 0 },
 * });
 *
 * getStyles('root');
 * // → {
 * //   className: 'btn-root user-root user-button',
 * //   style: { '--button-height': '48px', '--opacity': 0.5, padding: 0 }
 * // }
 *
 * getStyles('label');
 * // → { className: 'btn-label' }
 *
 * // ❌ Invalid: Names doesn't include 'root' (compile error)
 * // const badGetStyles = createGetStyles<'label' | 'icon'>({ ... });
 * ```
 */
export function createGetStyles<Names extends string>(
  input: GetStylesInput<WithRoot<Names>>,
): GetStylesFn<WithRoot<Names>> {
  const { classes, vars, className, classNames, style } = input;

  return function getStyles(name: WithRoot<Names>) {
    // Root slot: merge className and style
    if (name === 'root') {
      // Split user style into CSS Variables and inline styles
      const { vars: userVars, inline } = splitStyle(style);

      return {
        className: cx(classes.root, classNames?.root, className),
        style: {
          ...vars,      // System CSS Variables (from VarsResolver)
          ...userVars,  // User CSS Variables (from style prop)
          ...inline,    // Inline styles (from style prop)
        },
      };
    }

    // Other slots: merge className only
    return {
      className: cx(classes[name], classNames?.[name]),
    };
  };
}
