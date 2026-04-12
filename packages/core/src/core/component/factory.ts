import * as React from 'react';
import {
  createStylingContext,
  omitComponentProps,
  type StylingContext,
} from './create-styling-context';
import { SYSTEM_MARKS } from './system-marks';
import { withVariantColors } from '../variant/with-variant-colors';
import { withSizeVars } from '../size/with-size-vars';
import { withStateVars } from '../state/with-state-vars';
import { useThemeOptional } from '../theme/context/theme.context';
import type { ComponentPayload } from './types';

/**
 * Pick only declared component props from a props object.
 * Used for custom render function to provide type-safe componentProps.
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
 * Factory render context.
 * Provides all necessary data for custom rendering.
 *
 * ✅ TYPE SAFETY: Props are cleanly separated into component and DOM props.
 * - componentProps: Only declared component-specific props (size, variant, etc.)
 * - domProps: Only DOM-safe props (onClick, aria-*, data-*, etc.)
 *
 * This separation ensures:
 * - Type safety: componentProps type matches declared Props exactly
 * - Clear intent: Custom render knows exactly what each prop is for
 * - DevTools support: Can inspect component vs DOM props separately
 */
export type FactoryRenderContext<Props, Names extends string> = {
  /** Component-specific props (size, variant, radius, etc.) */
  componentProps: Props;
  /** DOM-safe props (onClick, aria-*, data-*, children, etc.) */
  domProps: Record<string, any>;
  /** Forwarded ref */
  ref: React.ForwardedRef<any>;
  /** Element to render */
  Element: React.ElementType;
  /** Styling Engine Instance */
  styles: StylingContext<Names>;
};

/**
 * Creates a polymorphic component with styling system integration.
 *
 * **Architecture**: Factory is an orchestrator, not an engine.
 * - Factory delegates styling calculation to createStylingContext()
 * - This ensures clean separation and future extensibility
 *
 * **Multi-Slot Support**:
 * - Default: root-only rendering
 * - Advanced: custom render function for multi-slot components
 *
 * **CRITICAL RULE**: Root slot MUST use getRootProps(), not getStyles('root')
 * - getRootProps() encapsulates style merge rule (user style ALWAYS wins)
 * - getStyles('root') bypasses this rule and causes inconsistent behavior
 * - Dev mode will warn if getStyles('root') is called directly
 *
 * **Prop Isolation Model**:
 * - Component declares its prop keys via `componentPropKeys`
 * - Factory uses `omitComponentProps()` to derive DOM props
 * - CORRECT: DOMProps = AllProps - ComponentProps - StylingProps
 * - WRONG: whitelist DOM props (breaks on new HTML attrs, Web Components)
 *
 * @template Payload - Component payload type
 * @param payload - Component configuration (must include componentPropKeys)
 * @param render - Optional custom render function for multi-slot components
 * @returns A polymorphic React component
 *
 * @example
 * ```typescript
 * // Simple component (root-only)
 * const Paper = factory({
 *   displayName: "Paper",
 *   defaultElement: "div",
 *   componentPropKeys: ["shadow", "radius", "withBorder"],
 *   styling: { structure, resources, logic },
 * });
 *
 * // Complex component (multi-slot)
 * const Button = factory(
 *   {
 *     displayName: "Button",
 *     defaultElement: "button",
 *     componentPropKeys: ["size", "variant", "radius", "loading"],
 *     styling: { structure, resources, logic },
 *   },
 *   ({ Element, ref, componentProps, domProps, styles }) => (
 *     <Element ref={ref} {...styles.getRootProps()} {...domProps}>
 *       <span {...styles.getStyles('inner')}>
 *         <span {...styles.getStyles('label')}>{domProps.children}</span>
 *       </span>
 *     </Element>
 *   )
 * );
 * ```
 */
export function factory<Payload extends ComponentPayload>(
  payload: Payload,
  render?: (ctx: FactoryRenderContext<any, any>) => React.ReactNode,
) {
  const Component = React.forwardRef<any, any>((props: any, ref) => {
    // CRITICAL: Extract styling props to prevent leakage to DOM
    const { component, className, style, classNames, ...rest } = props;

    const Element = component || payload.defaultElement;

    // ✅ CORRECT MODEL: DOMProps = AllProps - ComponentProps - StylingProps
    // omitComponentProps removes declared component props, leaving only DOM-safe props
    // (className/style/classNames already extracted above)
    const domProps = payload.componentPropKeys
      ? omitComponentProps(rest, payload.componentPropKeys as any)
      : rest; // fallback: pass all (legacy, unsafe)

    // Dev-mode validation: warn if componentPropKeys is missing
    if (process.env.NODE_ENV !== 'production') {
      if (!payload.componentPropKeys && Object.keys(rest).length > 0) {
        const knownDOMProps = ['children', 'id', 'role', 'tabIndex', 'title'];
        const unknownProps = Object.keys(rest).filter(
          (key) =>
            !key.startsWith('data-') &&
            !key.startsWith('aria-') &&
            !key.startsWith('on') &&
            !knownDOMProps.includes(key),
        );
        if (unknownProps.length > 0) {
          console.warn(
            `[PrismUI] Component "${payload.displayName}" has props that may leak to DOM: ${unknownProps.join(', ')}. ` +
            `Consider declaring componentPropKeys: ${JSON.stringify(unknownProps)}`,
          );
        }
      }
    }

    // Apply styling system if configured
    if (payload.styling) {
      // Stage 5.1: systems injection — apply declared systems left-to-right.
      // Each system wraps the previous resolver; rightmost = highest priority.
      // A Symbol mark on the resolver prevents double-wrapping.
      let resolvedStyling = payload.styling;
      if (payload.systems && payload.systems.length > 0) {
        let resolver = payload.styling.logic?.varsResolver ?? (() => ({}));
        for (const entry of payload.systems) {
          const name = typeof entry === 'string' ? entry : entry.name;
          const opts = typeof entry === 'string' ? undefined : { enabled: entry.enabled };
          if (name === 'variant') {
            if (!(resolver as any)[SYSTEM_MARKS.variant]) {
              resolver = withVariantColors(resolver, opts);
            }
          } else if (name === 'size') {
            if (!(resolver as any)[SYSTEM_MARKS.size]) {
              resolver = withSizeVars(resolver, opts);
            }
          } else if (name === 'state') {
            if (!(resolver as any)[SYSTEM_MARKS.state]) {
              resolver = withStateVars(resolver, opts);
            }
          }
        }
        resolvedStyling = {
          ...payload.styling,
          logic: { ...payload.styling.logic, varsResolver: resolver },
        };
      }

      // CRITICAL: Create Styling Engine Instance
      // Pass componentPropKeys for varsResolver isolation
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const theme = useThemeOptional();
      const styles = createStylingContext(
        resolvedStyling,
        props,
        payload.componentPropKeys as any,
        theme,
      );

      // Custom render (multi-slot support)
      if (render) {
        // ✅ Split props into componentProps + domProps for type safety
        const componentProps = payload.componentPropKeys
          ? pickComponentProps(rest, payload.componentPropKeys as any)
          : ({} as any); // fallback: empty (legacy)

        return render({ componentProps, domProps, ref, Element, styles }) as any;
      }

      // Default render (root-only)
      // ✅ getRootProps() encapsulates style merge rule
      // ✅ domProps = rest minus component props (correct direction)
      const rootProps = styles.getRootProps();
      return React.createElement(Element, { ref, ...rootProps, ...domProps });
    }

    // Fallback: no styling system, pass className/style directly
    return React.createElement(Element, { ref, className, style, ...domProps });
  });

  Component.displayName = payload.displayName;
  return Component as any;
}
