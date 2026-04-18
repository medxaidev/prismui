import type { ElementType } from 'react';
import type { Classes, VarsResolver } from '../styles';
import type { SlotDefinition } from './define-slots';

/**
 * System identifiers for factory's declarative systems injection.
 *
 * Each system corresponds to a middleware (e.g. 'variant' → withVariantColors, 'size' → withSizeVars).
 * Future: 'state'
 */
export type ComponentSystem = 'variant' | 'size' | 'state';

/**
 * A single system entry in the factory payload.
 * Can be a plain string (always inject) or an object with per-system options.
 *
 * `options` is passed through to the system's `dataAttrsResolver` (Step 10 §5.2).
 * For example, the `state` system reads `options.interactiveStrategy`
 * ('action' | 'control' | 'disabled' | predicate) to derive
 * `data-interactive-disabled`.
 *
 * @example
 * systems: ['variant']
 * systems: [{ name: 'variant', enabled: (props) => props.variant !== undefined }]
 * systems: [{ name: 'state', options: { interactiveStrategy: 'action' } }]
 */
export type ComponentSystemEntry =
  | ComponentSystem
  | {
      name: ComponentSystem;
      enabled?: (props: any) => boolean;
      /** System-specific options (e.g. state's `interactiveStrategy`). */
      options?: Record<string, any>;
      /**
       * Opt out of the system's **CSS vars middleware** while keeping its
       * **data-attrs contribution** active (Step 10 · SR-7.1).
       *
       * Use this when a component participates in a system's *identity*
       * (e.g. needs `data-variant` emitted by the single writer) but uses a
       * different token vocabulary and wires vars manually in its own
       * `varsResolver`. Example: Input declares variant-system ownership of
       * `data-variant` (SR-7.1 rule 1) without inheriting Button's
       * `--prismui-variant-*` auto-injection.
       *
       * @default true
       */
      vars?: boolean;
    };

/**
 * Styling-specific props.
 *
 * These props control the styling system and should NOT be passed to DOM.
 * They are extracted in the Factory layer and consumed by createStylingContext.
 */
export type StylingProps<Names extends string = string> = {
  /**
   * Root element className override.
   */
  className?: string;

  /**
   * Root element inline style override.
   */
  style?: React.CSSProperties;

  /**
   * Per-slot className overrides.
   */
  classNames?: Partial<Record<Names, string>>;
};

/**
 * Component payload configuration.
 *
 * Defines all the metadata needed to create a component via factory().
 *
 * @template Props - Component-specific props type
 * @template Names - StylesNames type (must include 'root')
 */
export type ComponentPayload<Props = any, Names extends string = string> = {
  /**
   * Display name for React DevTools.
   */
  displayName: string;

  /**
   * Stable system ID for theme.components lookup.
   *
   * Unlike displayName (which may be minified or repeated), componentName is a
   * stable identifier used as the key in theme.components defaultProps.
   *
   * - If omitted, falls back to displayName (with a DEV warning).
   * - Must be globally unique within an application.
   * - Recommended format: "Button" (core), "pro.Table" (pro), "app.Card" (app-level).
   *
   * @example
   * componentName: 'Button'
   */
  componentName?: string;

  /**
   * Default HTML element or React component to render.
   */
  defaultElement: ElementType;

  /**
   * Styling system configuration (optional).
   *
   * **Layered structure** for future extensibility:
   * - `structure`: Component's styling architecture (stylesNames)
   * - `resources`: Static styling resources (CSS Modules classes)
   * - `logic`: Dynamic styling logic (varsResolver, future: variantResolver)
   *
   * This layered design allows Step 3 (Variants) to extend naturally without breaking changes.
   */
  styling?: {
    /**
     * Styling structure definition.
     */
    structure: {
      /**
       * Component's StylesNames (slot names).
       * Must include 'root'.
       */
      stylesNames: readonly Names[];
    };

    /**
     * Styling resources (static).
     */
    resources: {
      /**
       * CSS Modules classes mapping.
       * All stylesNames must be present.
       */
      classes: Classes<Names>;
    };

    /**
     * Styling logic (dynamic, optional).
     *
     * Future extensions (Step 3):
     * - variantResolver
     * - compoundVariants
     * - defaultVariants
     */
    logic?: {
      /**
       * Props to CSS Variables resolver (optional).
       */
      varsResolver?: VarsResolver<Props>;
    };
  };

  /**
   * Component-declared static default prop values (Stage 3 Step 10 · A-2).
   *
   * Single-writer hierarchy for data-\* attrs (§6.5, A-6):
   *
   * ```text
   *   payload.defaultProps           (lowest  — component author declares)
   *     ← theme.components[X].defaultProps  (theme override)
   *     ← user-passed props                  (highest — call-site)
   * ```
   *
   * Why this exists: component-level defaults previously lived only in
   * render-body destructuring (e.g. `const { size = 'md' } = componentProps`),
   * which is invisible to factory's `collectSystemDataAttrs`. Systems were
   * therefore forced to either (a) re-declare defaults inside their resolvers
   * (duplicate truth), or (b) component-local fallbacks had to self-emit the
   * attr (SR-7 carve-out). Declaring defaults here makes the merged props the
   * single source of truth for **both** CSS var resolvers **and** data-attr
   * resolvers.
   *
   * DEV: keys not present in `componentPropKeys` emit a warning via
   * `useComponentDefaultProps`.
   *
   * @example
   * defaultProps: { variant: 'filled', color: 'primary', size: 'md', radius: 'md' }
   */
  defaultProps?: Partial<Props>;

  /**
   * Component-specific prop keys for prop isolation.
   *
   * CRITICAL: This is used to:
   * 1. Isolate varsResolver input (only component props, no DOM props)
   * 2. Filter DOM output (remove component props to prevent leakage)
   *
   * Without this, component props (size, variant, radius) will leak to DOM.
   *
   * @example
   * ```ts
   * componentPropKeys: ['size', 'variant', 'radius', 'loading']
   * ```
   */
  componentPropKeys?: readonly (keyof Props)[];

  /**
   * Slot declarations (optional).
   *
   * If provided:
   * - stylesNames is auto-derived from Object.keys(slots) via resolveStylesNames
   * - Compound components are auto-generated and attached as static properties
   * - slots.root > defaultElement (slots is the structure source of truth)
   *
   * @example
   * slots: defineSlots({ root: 'button', inner: 'span', label: 'span' })
   */
  slots?: SlotDefinition;

  /**
   * Declarative system injection.
   *
   * Systems are applied left-to-right as nested wrappers around varsResolver.
   * The rightmost system is the outermost wrapper and has the highest priority.
   *
   * factory() checks for a Symbol mark on the varsResolver before injecting,
   * so manually wrapping with withVariantColors() + declaring 'variant' here
   * is safe — the mark prevents double-wrapping.
   *
   * @example
   * systems: ['variant']
   * systems: [{ name: 'variant', enabled: (props) => props.variant !== undefined }]
   */
  systems?: readonly ComponentSystemEntry[];
};

/**
 * Extract the resolved Names type from a ComponentPayload.
 *
 * Priority (matches resolveStylesNames runtime logic):
 * 1. slots exists → keyof slots & string (literal union, never degrades to `string`)
 * 2. no slots, stylesNames exists → stylesNames array element type
 * 3. neither → string (legacy fallback)
 *
 * This is the type-level counterpart of resolveStylesNames().
 * It ensures getStyles, classNames, styles are all constrained to exact slot names.
 */
export type ResolvedNames<P extends ComponentPayload> =
  P extends { slots: infer S }
    ? keyof S & string
    : P extends { styling: { structure: { stylesNames: readonly (infer N extends string)[] } } }
      ? N
      : string;

/**
 * Complete component props.
 *
 * Combines:
 * - Component-specific props (Props)
 * - Styling props (StylingProps)
 * - DOM props (React.ComponentPropsWithoutRef)
 */
export type ComponentProps<
  Props = {},
  Names extends string = string,
  Element extends React.ElementType = 'div',
> = Props & StylingProps<Names> & React.ComponentPropsWithoutRef<Element>;
