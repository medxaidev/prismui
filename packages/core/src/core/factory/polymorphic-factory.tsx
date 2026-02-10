import { forwardRef } from 'react';
import type { PolymorphicComponentProps } from '../types/polymorphic/polymorphic-component-props';
import {
  identity,
} from './factory';
import type {
  ComponentClasses,
  PolymorphicFactoryPayload,
  StaticComponents,
  ThemeExtend,
} from './factory';

// ---------------------------------------------------------------------------
// PolymorphicComponentWithProps
// ---------------------------------------------------------------------------

export type PolymorphicComponentWithProps<Payload extends PolymorphicFactoryPayload> = {
  withProps: <C = Payload['defaultComponent']>(
    fixedProps: PolymorphicComponentProps<C, Payload['props']>,
  ) => <L = C>(props: PolymorphicComponentProps<L, Payload['props']>) => React.ReactElement;
};

// ---------------------------------------------------------------------------
// polymorphicFactory() — polymorphic component factory
// ---------------------------------------------------------------------------

/**
 * Wraps `forwardRef` and attaches `.extend()`, `.withProps()`, `.classes`.
 * The resulting component accepts a `component` prop with full type inference.
 *
 * Replaces the Stage-1 `createPolymorphicComponent` utility.
 *
 * ```ts
 * const Button = polymorphicFactory<ButtonFactory>((_props, ref) => { ... });
 * ```
 */
export function polymorphicFactory<Payload extends PolymorphicFactoryPayload>(
  ui: React.ForwardRefRenderFunction<Payload['defaultRef'], Payload['props']>,
) {
  type ComponentProps<C> = PolymorphicComponentProps<C, Payload['props']>;

  type _PolymorphicComponent = <C = Payload['defaultComponent']>(
    props: ComponentProps<C>,
  ) => React.ReactElement;

  type ComponentProperties = Omit<React.FunctionComponent<ComponentProps<any>>, never>;

  type PolymorphicComponent = _PolymorphicComponent &
    ComponentProperties &
    ThemeExtend<Payload> &
    ComponentClasses<Payload> &
    PolymorphicComponentWithProps<Payload> &
    StaticComponents<Payload['staticComponents']>;

  const Component = forwardRef(ui) as unknown as PolymorphicComponent;
  Component.withProps = (fixedProps: any) => {
    const Extended = forwardRef((props, ref) => (
      <Component {...fixedProps} {...props} ref={ref as any} />
    )) as any;
    Extended.extend = Component.extend;
    Extended.displayName = `WithProps(${Component.displayName})`;
    return Extended;
  };

  Component.extend = identity as any;

  return Component as PolymorphicComponent;
}

// ---------------------------------------------------------------------------
// PrismuiPolymorphicComponent — exported type for external use
// ---------------------------------------------------------------------------

export type PrismuiPolymorphicComponent<Payload extends PolymorphicFactoryPayload> = (<
  C = Payload['defaultComponent'],
>(
  props: PolymorphicComponentProps<C, Payload['props']>,
) => React.ReactElement) &
  Omit<React.FunctionComponent<PolymorphicComponentProps<any, Payload['props']>>, never> &
  ThemeExtend<Payload> &
  ComponentClasses<Payload> &
  PolymorphicComponentWithProps<Payload> &
  StaticComponents<Payload['staticComponents']>;
