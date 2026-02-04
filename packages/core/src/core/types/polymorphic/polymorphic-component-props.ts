import type { ElementType } from './element-type';
import type { JSXProps } from './jsx-props';
import type { MergeProps } from './merge-props';
import type { PolymorphicRef } from './polymorphic-ref';


/** `component` prop allows consumers to change the rendered element type. */
type ComponentProp<C extends ElementType> = {
  component?: C;
};

/** Compute final props for a given element type C, merged with component-specific props. */
type ComponentPropsOf<C extends ElementType, Props extends object> =
  MergeProps<JSXProps<C>, Props>;


export type PolymorphicComponentProps<
  C extends ElementType,
  Props extends object = {}
> = ComponentPropsOf<C, Props & ComponentProp<C>> & {
  ref?: PolymorphicRef<C>;
};
