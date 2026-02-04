import type * as React from 'react';
import type { ElementType } from './element-type';
import type { PolymorphicComponentProps } from './polymorphic-component-props';

/**
 * Type-level helper that casts a base component implementation into a polymorphic component.
 *
 * The runtime value is unchanged; this function only provides an ergonomic polymorphic call
 * signature: <C>(props: PolymorphicComponentProps<C, Props>) => ReactElement.
 */
export function createPolymorphicComponent<
  DefaultC extends ElementType,
  Props extends object,
  StaticComponents extends Record<string, unknown> = Record<string, never>
>(component: unknown) {

  /** Polymorphic call signature (generic over the underlying element type). */
  type Polymorphic = <C extends ElementType = DefaultC>(
    props: PolymorphicComponentProps<C, Props>
  ) => React.ReactElement | null;

  /** Common React component statics. */
  type ComponentStatics = {
    displayName?: string;
    defaultProps?: unknown;
    propTypes?: unknown;
  };

  return component as Polymorphic & ComponentStatics & StaticComponents;
}