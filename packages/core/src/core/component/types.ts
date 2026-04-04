import type { ElementType } from 'react';
import type { Classes, VarsResolver } from '../styles';

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
};

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
