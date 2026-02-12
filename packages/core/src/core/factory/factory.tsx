import { forwardRef } from 'react';
import type * as React from 'react';
import type { ClassNames, Styles, PartialVarsResolver } from '../styles-api';

// ---------------------------------------------------------------------------
// Payload types — every component declares its capabilities via these types
// ---------------------------------------------------------------------------

export type DataAttributes = Record<`data-${string}`, any>;

/**
 * Non-polymorphic component metadata.
 *
 * Each component declares a concrete `FactoryPayload` that drives the entire
 * type system: `useStyles` selector autocomplete, `classNames` key constraints,
 * `vars` variable name constraints, etc.
 */
export interface FactoryPayload {
  props: Record<string, any>;
  ctx?: any;
  ref?: any;
  stylesNames?: string;
  vars?: any;
  variant?: string;
  staticComponents?: Record<string, any>;
  compound?: boolean;
}

/**
 * Polymorphic component metadata — extends `FactoryPayload` with a default
 * element type and ref.
 */
export interface PolymorphicFactoryPayload extends FactoryPayload {
  defaultComponent: any;
  defaultRef: any;
}

// ---------------------------------------------------------------------------
// ExtendComponent — the shape returned by Component.extend()
// ---------------------------------------------------------------------------

/**
 * Compound components can only customize defaultProps via theme.
 */
export interface ExtendCompoundComponent<Payload extends FactoryPayload> {
  defaultProps?: Partial<Payload['props']> & DataAttributes;
}

/**
 * Root (non-compound) components can customize defaultProps, classNames, styles, vars.
 */
export interface ExtendsRootComponent<Payload extends FactoryPayload> {
  defaultProps?: Partial<Payload['props']> & DataAttributes & { component?: any };
  classNames?: ClassNames<Payload>;
  styles?: Styles<Payload>;
  vars?: PartialVarsResolver<Payload>;
}

/**
 * Conditional type: compound components get a restricted extend shape.
 */
export type ExtendComponent<Payload extends FactoryPayload> =
  Payload['compound'] extends true
  ? ExtendCompoundComponent<Payload>
  : ExtendsRootComponent<Payload>;

// ---------------------------------------------------------------------------
// Static property types
// ---------------------------------------------------------------------------

export type StaticComponents<Input> =
  Input extends Record<string, any> ? Input : Record<string, never>;

export interface ThemeExtend<Payload extends FactoryPayload> {
  extend: (input: ExtendComponent<Payload>) => ExtendComponent<Payload>;
}

export type ComponentClasses<Payload extends FactoryPayload> = {
  classes: Payload['stylesNames'] extends string ? Record<string, string> : never;
};

export type FactoryComponentWithProps<Payload extends FactoryPayload> = {
  withProps: (props: Partial<Payload['props']>) => React.ForwardRefExoticComponent<
    Payload['props'] &
    React.RefAttributes<Payload['ref']> & {
      component?: any;
      renderRoot?: (props: Record<string, any>) => React.ReactNode;
    }
  >;
};

export type PrismuiComponentStaticProperties<Payload extends FactoryPayload> =
  ThemeExtend<Payload> &
  ComponentClasses<Payload> &
  StaticComponents<Payload['staticComponents']> &
  FactoryComponentWithProps<Payload>;

// ---------------------------------------------------------------------------
// PrismuiComponent — the type returned by factory()
// ---------------------------------------------------------------------------

export type PrismuiComponent<Payload extends FactoryPayload> =
  React.ForwardRefExoticComponent<
    Payload['props'] &
    React.RefAttributes<Payload['ref']> & {
      component?: any;
      renderRoot?: (props: Record<string, any>) => React.ReactNode;
    }
  > &
  PrismuiComponentStaticProperties<Payload>;

// ---------------------------------------------------------------------------
// identity — used by .extend() at runtime (type-only marker)
// ---------------------------------------------------------------------------

export function identity<T>(value: T): T {
  return value;
}

// ---------------------------------------------------------------------------
// factory() — non-polymorphic component factory
// ---------------------------------------------------------------------------

/**
 * Wraps `forwardRef` and attaches `.extend()`, `.withProps()`, and `.classes`.
 *
 * ```ts
 * const Paper = factory<PaperFactory>((props, ref) => { ... });
 * ```
 */
export function factory<Payload extends FactoryPayload>(
  ui: React.ForwardRefRenderFunction<Payload['ref'], Payload['props']>,
) {
  const Component = forwardRef(ui) as any;

  Component.extend = identity as any;
  Component.withProps = (fixedProps: any) => {
    const Extended = forwardRef((props, ref) => (
      <Component {...fixedProps} {...props} ref={ref as any} />
    )) as any;
    Extended.extend = Component.extend;
    Extended.displayName = `WithProps(${Component.displayName})`;
    return Extended;
  };

  return Component as PrismuiComponent<Payload>;
}
