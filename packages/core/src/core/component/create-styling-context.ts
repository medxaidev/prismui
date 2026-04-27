import { createGetStyles, type GetStylesFn, type StyleProp } from '../styles';
import type { PrismUITheme } from '../theme/types';
import type { ComponentPayload } from './types';

// Safe environment variable access for browser/Vite environments
// In Vite/browser: import.meta.env is available
// In Node.js: process.env is available
const isDev = (() => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NODE_ENV !== 'production';
  }
  // Vite injects import.meta.env at build time, so we check for DEV mode
  // @ts-ignore - import.meta.env exists in Vite but not in TypeScript by default
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // @ts-ignore
    return import.meta.env.DEV ?? true;
  }
  return true; // Default to dev mode if we can't determine
})();

// __PRISMUI_INTERNAL__ is injected at build time via vite.config.ts `define`.
// It is true only in the component library's own build, not in application builds.
// This ensures runtime validation only runs during component development.
declare const __PRISMUI_INTERNAL__: boolean | undefined;

/**
 * ⚠️ CONSTITUTIONAL CONSTRAINT
 * 
 * createStylingContext MUST NOT contain any styling semantics.
 * It ONLY orchestrates data flow.
 * 
 * FORBIDDEN:
 * - Variant logic (if variant === 'primary')
 * - State logic (if disabled)
 * - Theme interpretation
 * - Style calculation
 * - Priority resolution beyond simple merge
 * 
 * ALLOWED:
 * - Data extraction (props → componentProps)
 * - Function delegation (varsResolver, createGetStyles)
 * - Dev-mode validation (type checking, warnings)
 * - Merge orchestration (call createGetStyles, not implement merge)
 * 
 * WHY:
 * - Prevents "god function" anti-pattern
 * - Keeps styling semantics in their proper layers
 * - Ensures this remains a pure orchestrator
 * - Makes violations immediately visible in code review
 */

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
  componentPropKeys: readonly PropertyKey[],
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
    styles?: Partial<Record<Names, React.CSSProperties>>;
    themeVars?: Record<string, string | number>;
    vars?: Record<string, string | number>;
  },
  componentPropKeys?: readonly (keyof Props)[],
  theme?: PrismUITheme<string, string>,
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

  const { structure, resources, logic } = styling;

  // Runtime validation (development only, component library development mode)
  // ⚠️ Only triggers in component library build (__PRISMUI_INTERNAL__ = true via define)
  // ⚠️ Does NOT trigger in application layer usage (zero runtime overhead)
  if (isDev && typeof __PRISMUI_INTERNAL__ !== 'undefined' && __PRISMUI_INTERNAL__) {
    const { stylesNames } = structure;
    const { classes } = resources;

    // Check all stylesNames (not just root)
    for (const name of stylesNames) {
      if (!classes[name]) {
        throw new Error(
          `[PrismUI] Missing class "${name}" in CSS Module. ` +
          `Expected classes: [${stylesNames.join(', ')}]. ` +
          `Received classes: [${Object.keys(classes).join(', ')}]. ` +
          `Please ensure your CSS Module defines all required classes.`,
        );
      }
    }
  }

  // CRITICAL: varsResolver MUST only receive pure component props
  // Extract styling props first
  const { className, style, classNames, styles, themeVars, vars: userVars, ...restProps } = props;

  // ✅ Use componentPropKeys to isolate component props from DOM props
  // This prevents varsResolver from accessing onClick, aria-*, etc.
  const componentProps = componentPropKeys
    ? pickComponentProps(restProps, componentPropKeys as readonly (keyof typeof restProps)[])
    : restProps; // fallback: accept rest (legacy, will warn in dev)

  // 🚨 DEV VALIDATION: Detect leaked component props
  // This catches the silent error where componentPropKeys is incomplete
  if (isDev && componentPropKeys) {
    const declaredKeys = new Set(componentPropKeys);
    const actualKeys = Object.keys(restProps);

    // Known DOM props that are safe to pass through
    const knownDOMProps = new Set([
      'children', 'id', 'role', 'tabIndex', 'title', 'aria-label', 'aria-labelledby',
      'aria-describedby', 'aria-hidden', 'aria-expanded', 'aria-controls', 'aria-selected',
      'onClick', 'onMouseEnter', 'onMouseLeave', 'onFocus', 'onBlur', 'onChange',
      'onKeyDown', 'onKeyUp', 'onKeyPress',
      // Pointer Events (W3C) — added for Stage-10 Phase 3 Feedback integration.
      // Omitting these caused the prop-leak guard to flag user-supplied
      // `onPointerDown` etc. as declared-out leaks, even though they are
      // legitimate DOM event handlers the component chains onto the press
      // target. See feedback-contract.md §5.2 + Button Phase 3 integration.
      'onPointerDown', 'onPointerUp', 'onPointerMove', 'onPointerCancel',
      'onPointerEnter', 'onPointerLeave', 'onPointerOver', 'onPointerOut',
      'onGotPointerCapture', 'onLostPointerCapture',
      'disabled', 'type', 'name', 'value',
      'placeholder', 'autoFocus', 'autoComplete', 'required', 'readOnly', 'maxLength',
      'minLength', 'pattern', 'accept', 'multiple', 'checked', 'defaultValue',
      // <textarea>-specific natives (same rationale as maxLength / minLength on <input>).
      'rows', 'cols', 'wrap',
      'defaultChecked', 'href', 'target', 'rel', 'download', 'src', 'alt', 'width',
      'height', 'loading', 'decoding', 'crossOrigin', 'referrerPolicy', 'sizes',
      'srcSet', 'useMap', 'isMap', 'form', 'formAction', 'formEncType', 'formMethod',
      'formNoValidate', 'formTarget', 'data-testid',
    ]);

    const leaked = actualKeys.filter(
      (key) => !declaredKeys.has(key as any) && !knownDOMProps.has(key) && !key.startsWith('data-') && !key.startsWith('aria-'),
    );

    if (leaked.length > 0) {
      const declaredList = Array.from(componentPropKeys).map(k => String(k)).join(', ');
      const leakedList = leaked.join(', ');
      const fixExample = [...Array.from(componentPropKeys).map(k => String(k)), ...leaked]
        .map(k => `'${k}'`)
        .join(', ');

      console.error(
        `[PrismUI] Component prop leak detected! These props are NOT in componentPropKeys and will leak to DOM:\n` +
        `  Leaked props: ${leakedList}\n` +
        `  Declared componentPropKeys: [${declaredList}]\n` +
        `  Fix: Add missing props to componentPropKeys array.\n` +
        `  Example: componentPropKeys: [${fixExample}]`,
      );
    }
  }

  const systemVars = logic?.varsResolver?.(componentProps as Props, theme!) ?? {};

  // ── varsChain assembly — createStylingContext is the ONLY place that knows layer semantics ──
  // VarsLayerName type locks down legal layer names; new layers require explicit union extension.
  type VarsLayerName = 'system' | 'theme' | 'user';
  const varsLayers: Record<VarsLayerName, Record<string, string | number> | undefined> = {
    system: systemVars as Record<string, string | number>,  // layer 1: varsResolver output
    theme: themeVars,                                      // layer 2: theme.components[X].vars
    user: userVars,                                       // layer 3: props.vars
  };
  const varsOrder: VarsLayerName[] = ['system', 'theme', 'user'];
  const varsChain = varsOrder.map(k => varsLayers[k]);

  // Create getStyles function with dev-mode root access detection
  let rootAccessedDirectly = false;

  const rawGetStyles = createGetStyles({
    classes: resources.classes,
    varsChain,
    className,
    classNames,
    style: style as StyleProp,
    styles,
  });

  // SYSTEM CONSTRAINT: getStyles('root') is tracked in dev mode
  // Root slot MUST use getRootProps() to ensure style merge rules
  const getStyles: GetStylesFn<Names> = (name: Names) => {
    if (isDev) {
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
  if (isDev) {
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
