import { createGetStyles, type GetStylesFn, type StyleProp } from '../styles';
import type { ComponentPayload } from './types';

/**
 * Styling context returned by createStylingContext.
 */
export type StylingContext<Names extends string = string> = {
  /**
   * Get styles for a specific slot.
   *
   * This function can be called multiple times for different slots,
   * making it suitable for both simple (root-only) and complex (multi-slot) components.
   */
  getStyles: GetStylesFn<Names>;

  /**
   * Get merged root props with correct style priority.
   *
   * User inline style ALWAYS wins over system styles (CSS Variables).
   * Use this instead of spreading getStyles('root') directly to ensure
   * style merge rules are consistently applied.
   */
  getRootProps: () => { className: string; style?: React.CSSProperties };
};

/**
 * Pick only declared component props from a props object.
 *
 * CRITICAL: This is the correct direction for prop isolation.
 * Used for varsResolver input isolation.
 */
function pickComponentProps<T extends Record<string, any>>(
  props: T,
  keys: readonly (keyof T)[],
): Partial<T> {
  const result: Partial<T> = {};
  for (const key of keys) {
    if (key in props) {
      result[key] = props[key];
    }
  }
  return result;
}

/**
 * Omit declared component props + styling props from a props object.
 * Returns only DOM-safe props.
 *
 * CORRECT MODEL: DOMProps = AllProps - ComponentProps - StylingProps
 * (NOT whitelist DOM — that breaks on new HTML attrs, Web Components, etc.)
 */
export function omitComponentProps<T extends Record<string, any>>(
  props: T,
  componentPropKeys: readonly (keyof T)[],
): Record<string, any> {
  const result: Record<string, any> = {};
  const omitSet = new Set<string | number | symbol>(componentPropKeys);

  for (const key in props) {
    if (!omitSet.has(key)) {
      result[key] = props[key];
    }
  }

  return result;
}

/**
 * Creates a Styling Engine Instance for a component.
 *
 * **CRITICAL DESIGN**: This is NOT a helper function, it's a **Styling Engine Instance**.
 *
 * **What it does**:
 * ```
 * Props → Styling Runtime → getStyles()
 *         ↑
 *    Styling Engine Instance
 * ```
 *
 * **Why this matters**:
 * - Returns a **capability** (getStyles function), not a **result** (root styles)
 * - Supports multi-slot components (not just root)
 * - Enables future DevTools, Flow Runtime, and visualization systems
 * - Avoids "dual implementation" problem (Factory vs manual getStyles)
 *
 * **Architecture**:
 * ```
 * Props → createStylingContext → { getStyles, getRootProps }
 *                                      ↓
 *                              getStyles('root')
 *                              getStyles('inner')
 *                              getStyles('label')
 * ```
 *
 * **Future capabilities**:
 * ```typescript
 * // DevTools
 * inspect(ctx.getStyles);
 *
 * // Flow Runtime
 * apply(node, ctx.getStyles);
 *
 * // SSR
 * render(ctx.getStyles);
 * ```
 *
 * This function does NOT depend on React or component lifecycle.
 * It's a pure function that can be used in:
 * - Factory (Step 2.5)
 * - useStyles Hook (Step 2.7)
 * - SSR rendering (future)
 * - DevTools inspection (future)
 *
 * @param styling - Component styling configuration
 * @param props - Full component props (including className, style, classNames)
 * @param componentPropKeys - Component prop keys for isolation
 * @returns Styling Engine Instance with getStyles and getRootProps functions
 *
 * @example
 * ```ts
 * // Factory usage (simple component)
 * const ctx = createStylingContext(payload.styling, props);
 * return <Element {...ctx.getRootProps()} />;
 *
 * // Manual usage (complex component)
 * const ctx = createStylingContext(payload.styling, props);
 * return (
 *   <button {...ctx.getRootProps()}>
 *     <span {...ctx.getStyles('inner')}>
 *       <span {...ctx.getStyles('label')}>{children}</span>
 *     </span>
 *   </button>
 * );
 * ```
 */
export function createStylingContext<Props, Names extends string = string>(
  styling: ComponentPayload<Props, Names>['styling'],
  props: Props & {
    className?: string;
    style?: React.CSSProperties;
    classNames?: Partial<Record<Names, string>>;
  },
  componentPropKeys?: readonly (keyof Props)[],
): StylingContext<Names> {
  // Fallback: no styling system
  if (!styling) {
    const getStyles: GetStylesFn<Names> = (name: Names) => {
      // ✅ Stable shape: non-root slots return empty object (not partial object)
      if (name === 'root') {
        return {
          className: props.className ?? '',
          style: props.style as StyleProp,
        };
      }
      // ✅ Non-root slots: return empty object (avoid diff noise)
      return { className: '' };
    };

    // CRITICAL: getRootProps MUST be implemented (StylingContext contract)
    // ✅ Use same merge logic as main branch (consistency)
    const getRootProps = () => {
      const root = getStyles('root' as Names);
      return {
        className: root.className,
        // Consistent merge: base ? { ...base, ...user } : user
        // (fallback has no base styles, so this is just props.style)
        style: root.style ? { ...root.style, ...(props.style as any) } : props.style,
      };
    };

    return { getStyles, getRootProps };
  }

  const { resources, logic } = styling;

  // Runtime validation (development only)
  if (process.env.NODE_ENV !== 'production') {
    if (!resources.classes.root) {
      throw new Error(
        `[PrismUI] Missing 'root' class in component styling. ` +
        `All components must define a 'root' slot in their CSS Modules.`,
      );
    }
  }

  // CRITICAL: varsResolver MUST only receive pure component props
  // Extract styling props first
  const { className, style, classNames, ...restProps } = props;

  // ✅ Use componentPropKeys to isolate component props from DOM props
  // This prevents varsResolver from accessing onClick, aria-*, etc.
  const componentProps = componentPropKeys
    ? pickComponentProps(restProps, componentPropKeys as readonly (keyof typeof restProps)[])
    : restProps; // fallback: accept rest (legacy, will warn in dev)

  const vars = logic?.varsResolver?.(componentProps as Props) ?? {};

  // Create getStyles function with dev-mode root access detection
  let rootAccessedDirectly = false;

  const rawGetStyles = createGetStyles({
    classes: resources.classes,
    vars: vars as StyleProp,
    className,
    classNames,
    style: style as StyleProp,
  });

  // SYSTEM CONSTRAINT: getStyles('root') is tracked in dev mode
  // Root slot MUST use getRootProps() to ensure style merge rules
  const getStyles: GetStylesFn<Names> = (name: Names) => {
    if (process.env.NODE_ENV !== 'production') {
      if (name === 'root') {
        rootAccessedDirectly = true;
      }
    }
    return rawGetStyles(name as any);
  };

  // CRITICAL: getRootProps encapsulates style merge rule (user style ALWAYS wins)
  // This ensures consistent priority across all components
  const getRootProps = () => {
    rootAccessedDirectly = false; // ✅ Clear flag: getRootProps is the correct path
    const root = rawGetStyles('root' as any);
    return {
      className: root.className,
      style: root.style
        ? { ...root.style, ...(style as any) } // ✅ User inline style ALWAYS wins
        : style,
    };
  };

  // Dev-mode warning: detect getStyles('root') bypass
  if (process.env.NODE_ENV !== 'production') {
    // Schedule check after render (microtask)
    queueMicrotask(() => {
      if (rootAccessedDirectly) {
        console.warn(
          '[PrismUI] Do not use getStyles("root") directly. ' +
          'Use getRootProps() instead to ensure correct style merge priority.',
        );
      }
    });
  }

  // Return Styling Engine Instance (capability, not result)
  return { getStyles, getRootProps };
}
