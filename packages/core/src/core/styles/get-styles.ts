import { cx } from './cx';
import type { GetStylesInput, GetStylesFn, WithRoot } from './types';

/**
 * Creates a getStyles function for a component.
 *
 * The getStyles function computes the final className and style for each slot
 * (StylesName) by merging system styles and user overrides.
 *
 * **Merge strategy**:
 * - className: `system classes → classNames[name] → className (root only)`
 * - style (root only): `system vars → user override`
 *
 * **Key behaviors**:
 * 1. All slots get merged className
 * 2. Only root slot gets style (ALWAYS present, even if empty `{}`)
 * 3. User style directly overrides system vars (simple object spread)
 *
 * **Critical constraint**: Style merging MUST NOT introduce layering semantics.
 * User override is atomic: `{ ...systemVars, ...userStyle }`
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
  const { classes, varsChain, className, classNames, style, styles } = input;

  return function getStyles(name: WithRoot<Names>) {
    // Root slot: merge className and style
    if (name === 'root') {
      // Merge all vars layers in order (priority: later layers win).
      // varsChain is assembled by createStylingContext; createGetStyles is layer-agnostic.
      const mergedVars: Record<string, string | number> = {};
      for (const layer of varsChain) {
        if (layer) Object.assign(mergedVars, layer);
      }

      const rootStyles = styles?.['root' as WithRoot<Names>];
      const mergedStyle = {
        ...mergedVars,  // All CSS Variable layers (order decided by createStylingContext)
        ...rootStyles,  // User inline styles for root (from styles.root)
        ...style,       // User inline style for root (from style prop, highest priority)
      };

      return {
        className: cx(classes.root, classNames?.root, className),
        // Only include style prop if it has properties (avoid <div style={{}} />)
        style: Object.keys(mergedStyle).length > 0 ? mergedStyle : undefined,
      };
    }

    // Other slots: merge className and styles
    const slotStyle = styles?.[name];

    return {
      className: cx(classes[name], classNames?.[name]),
      // Include style if user provided styles for this slot
      style: slotStyle && Object.keys(slotStyle).length > 0 ? slotStyle : undefined,
    };
  };
}
