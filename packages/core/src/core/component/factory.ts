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
import {
  collectSystemDataAttrs,
  resolveDisabilityAttrs,
  warnSystemDataAttrOverrides,
} from './collect-system-data-attrs';
import { useThemeOptional } from '../theme/context/theme.context';
import { useComponentDefaultProps } from './use-component-default-props';
import { useComponentStylingInput } from './use-component-styling-input';
import { SLOT_SYMBOL } from './define-slots';
import type { SlotMetadata } from './define-slots';
import { resolveStylesNames } from './resolve-styles-names';
import type { ComponentPayload, ResolvedNames } from './types';

// DEV: module-level registry to detect duplicate componentName registrations.
// Lives outside render — populated once per factory() call at module load time.
const _registeredComponentNames =
  process.env.NODE_ENV !== 'production' ? new Set<string>() : null;

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
  /**
   * System-managed root `data-*` attrs (Step 10 §5.3).
   *
   * Derived from declared `systems` (variant / size / state / ...). MUST be
   * spread on the root element, AFTER any component-local data-attrs, so that
   * system values hard-override component misdeclarations (SR-7 / IV-DC5).
   *
   * Example spread order inside a custom render:
   * ```tsx
   * <Element
   *   {...styles.getRootProps()}
   *   {...rootDataAttrs}        // component-local (data-full-width / data-pointer / ...)
   *   {...systemDataAttrs}      // ← MUST be last (hard override)
   *   {...disabilityAttrs}
   *   {...domProps}
   * />
   * ```
   */
  systemDataAttrs: Record<string, string>;
  /**
   * Disability attrs: native `disabled` or `aria-disabled` + `aria-busy`
   * derived by §2.4 decision table and §5.4. Spread on the root (see example
   * above in `systemDataAttrs`).
   */
  disabilityAttrs: Record<string, any>;
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
  render?: (ctx: FactoryRenderContext<any, ResolvedNames<Payload>>) => React.ReactNode,
) {
  // ── Stage 9: slots.root > defaultElement resolution ──
  // slots is the structure source of truth; defaultElement is legacy fallback.
  const effectiveDefaultElement = payload.slots?.root ?? payload.defaultElement;

  if (process.env.NODE_ENV !== 'production') {
    if (payload.slots?.root && payload.defaultElement) {
      if (payload.slots.root !== payload.defaultElement) {
        console.warn(
          `[PrismUI] "${payload.displayName}" has inconsistent root element:\n` +
          `  defaultElement = "${String(payload.defaultElement)}"\n` +
          `  slots.root = "${String(payload.slots.root)}"\n` +
          `→ slots.root will be used as source of truth.`,
        );
      }
    }
  }

  // ── Stage 9: resolve stylesNames via single source of truth ──
  // When slots exist, stylesNames is derived from slots keys (or explicit subset).
  // resolveStylesNames handles all 4 priority paths + DEV subset validation.
  const resolvedStylesNames = resolveStylesNames(payload);

  // ── Stage 8.3: build validSlotsSet once at factory definition time (not per render) ──
  // Uses resolvedStylesNames (slots-aware) instead of raw stylesNames.
  const validSlotsSet = resolvedStylesNames.length > 0
    ? new Set(resolvedStylesNames)
    : undefined;

  // ── DEV-only: componentName stability checks (runs once at factory init, not per render) ──
  if (process.env.NODE_ENV !== 'production') {
    if (!payload.componentName) {
      console.warn(
        `[PrismUI] componentName is missing for "${payload.displayName}". ` +
        `Theme overrides via theme.components will NOT work reliably for this component. ` +
        `Add componentName to enable theming.`,
      );
    }
    const name = payload.componentName ?? payload.displayName;
    if (_registeredComponentNames!.has(name)) {
      console.warn(
        `[PrismUI] Duplicate componentName "${name}" detected. ` +
        `theme.components defaultProps may be overridden unexpectedly.`,
      );
    } else {
      _registeredComponentNames!.add(name);
    }
  }

  const Component = React.forwardRef<any, any>((props: any, ref) => {
    // ── Stage 7.4 + Step 10 · A-2: resolve defaults before any other logic ──
    // Priority (lowest → highest): payload.defaultProps ← theme.defaultProps ← user props.
    // This makes the merged `resolvedProps` the SINGLE WRITER (A-6) seen by:
    //   • varsResolver / system vars middleware
    //   • collectSystemDataAttrs (root `data-*`)
    //   • component render body
    // No further defaulting via destructuring fallback is needed or encouraged.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const resolvedProps = useComponentDefaultProps(
      payload.componentName ?? payload.displayName,
      props,
      payload.componentPropKeys as readonly (keyof typeof props)[] | undefined,
      payload.defaultProps as Partial<typeof props> | undefined,
    );

    // CRITICAL: Extract styling props to prevent leakage to DOM.
    // classNames/styles/vars are consumed by useComponentStylingInput and re-added
    // explicitly as merged outputs — they must not leak into stylingProps via rest.
    const { component, className, style, classNames: _, styles: __, vars: ___, ...rest } = resolvedProps;

    const Element = component || effectiveDefaultElement;

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
          // Step 10 · SR-7.1 · `vars: false` participates in data-attrs only.
          // Component provides its own vars wiring (e.g. Input consumes a
          // different variant vocabulary and wires --prismui-variant-* in its
          // own varsResolver). Default is `true` for back-compat.
          const varsEnabled = typeof entry === 'string' ? true : entry.vars !== false;
          if (!varsEnabled) continue;
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

      // Stage 8.2: merge theme.components[X].classNames/.styles/.vars with props inputs.
      // themeVars and vars are separate channels — NOT merged here.
      // Stage 8.3: pass validSlotsSet for DEV unknown-slot warn (stable Set, built at factory init).
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { classNames, styles: mergedStyles, themeVars, vars } = useComponentStylingInput(
        payload.componentName ?? payload.displayName,
        resolvedProps.classNames,
        resolvedProps.styles,
        resolvedProps.vars,
        validSlotsSet as ReadonlySet<string> | undefined,
      );

      // stylingProps is a fresh object — not a patch over resolvedProps.
      // Explicitly exclude classNames/styles/vars from rest to avoid implicit override.
      const stylingProps = {
        ...rest,
        className,
        style,
        classNames,
        styles: mergedStyles,
        themeVars,
        vars,
      };

      const styles = createStylingContext(
        resolvedStyling,
        stylingProps,
        payload.componentPropKeys as any,
        theme,
      );

      // ── Step 10 §5.3: collect system-managed root data-* attrs ──
      // Built from `rest` (resolvedProps minus styling props) so the state
      // system sees disabled / loading / readOnly regardless of whether the
      // component declared them in componentPropKeys (they are universal
      // HTML-compatible attrs that reach every component via rest).
      const systemDataAttrs = collectSystemDataAttrs(payload.systems, rest as Record<string, any>);
      const disabilityAttrs = resolveDisabilityAttrs(Element, rest as Record<string, any>);

      // ── Phase 3 · SR-7 enforcement (DEV only) ──
      // Warn when user / component-authored props collide with a key that a
      // declared system is the single writer for. Fingerprinted per
      // (component × attr) pair to avoid render-loop spam. No-op in prod.
      if (process.env.NODE_ENV !== 'production') {
        warnSystemDataAttrOverrides(
          payload.componentName ?? payload.displayName,
          payload.systems,
          props as Record<string, any>,
        );
      }

      // Custom render (multi-slot support)
      if (render) {
        // ✅ Split props into componentProps + domProps for type safety
        const componentProps = payload.componentPropKeys
          ? pickComponentProps(rest, payload.componentPropKeys as any)
          : ({} as any); // fallback: empty (legacy)

        return render({
          componentProps,
          domProps,
          ref,
          Element,
          styles,
          systemDataAttrs,
          disabilityAttrs,
        }) as any;
      }

      // Default render (root-only)
      // ✅ getRootProps() encapsulates style merge rule
      // ✅ domProps = rest minus component props (correct direction)
      // ✅ systemDataAttrs + disabilityAttrs spread AFTER domProps → hard override
      const rootProps = styles.getRootProps();
      return React.createElement(Element, {
        ref,
        ...rootProps,
        ...domProps,
        ...systemDataAttrs,
        ...disabilityAttrs,
      });
    }

    // Fallback: no styling system, pass className/style directly
    return React.createElement(Element, { ref, className, style, ...domProps });
  });

  Component.displayName = payload.displayName;

  // ── Stage 9: Compound Component auto-generation + SLOT_SYMBOL marker ──
  // Runs once at factory init (module load time), not per render.
  if (payload.slots) {
    for (const [name, slotDefaultElement] of Object.entries(payload.slots)) {
      if (name === 'root') continue; // root is the component itself

      const slotDisplayName = name.charAt(0).toUpperCase() + name.slice(1);
      const fullDisplayName = `${payload.displayName}.${slotDisplayName}`;

      const SlotComponent = React.forwardRef<any, any>((slotProps, slotRef) => {
        // DEV: detect compound used outside factory render (no styles)
        if (process.env.NODE_ENV !== 'production') {
          if (!slotProps['data-prismui-slot-usage']) {
            console.warn(
              `[PrismUI] ${fullDisplayName} is used outside of ` +
              `${payload.displayName} render.\n` +
              `It will NOT receive styles automatically. ` +
              `This is a structure label, not a structure instance.`,
            );
          }
        }

        // Strip internal marker before passing to DOM
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { 'data-prismui-slot-usage': _marker, ...domProps } = slotProps;
        return React.createElement(slotDefaultElement, { ref: slotRef, ...domProps });
      });
      SlotComponent.displayName = fullDisplayName;

      // Slot metadata marker — for DEV tools and future system observability
      (SlotComponent as any)[SLOT_SYMBOL] = {
        slotName: name,
        componentName: payload.componentName ?? payload.displayName,
      } satisfies SlotMetadata;

      (Component as any)[slotDisplayName] = SlotComponent;
    }
  }

  return Component as any;
}
