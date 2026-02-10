import type { ElementType } from './element-type';
import type { JSXProps } from './jsx-props';
import type { MergeProps } from './merge-props';
import type { PolymorphicRef } from './polymorphic-ref';


/** `component` prop allows consumers to change the rendered element type. */
type ComponentProp<C> = {
  component?: C;
};

/** Compute final props for a given element type C, merged with component-specific props. */
type InheritedProps<C extends ElementType, Props extends object> =
  MergeProps<JSXProps<C>, Props>;

/**
 * Polymorphic component props.
 *
 * Uses a conditional type (not a constraint on C) so that unconstrained
 * generics like `<C = 'button'>` work in factory signatures.
 *
 * When C extends ElementType → merge element props + component prop + ref + renderRoot.
 * Otherwise → just the component's own Props + a required `component` prop.
 */
export type PolymorphicComponentProps<
  C,
  Props extends object = {}
> = C extends ElementType
  ? InheritedProps<C, Props & ComponentProp<C>> & {
    ref?: PolymorphicRef<C>;
    renderRoot?: (props: any) => any;
  }
  : Props & { component: ElementType; renderRoot?: (props: Record<string, any>) => any };
