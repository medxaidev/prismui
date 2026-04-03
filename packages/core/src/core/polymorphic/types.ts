import type * as React from 'react';

/**
 * Valid element types for polymorphic components.
 * Includes both intrinsic HTML elements and custom React components.
 *
 * @example
 * ```ts
 * type ButtonElement = ElementType; // 'button' | 'a' | typeof Link | ...
 * ```
 */
export type ElementType = keyof React.JSX.IntrinsicElements | React.JSXElementConstructor<any>;

/**
 * Extracts props from an element type, including ref.
 * Uses LibraryManagedAttributes to handle defaultProps and other React internals.
 * Ref is handled natively by React to ensure proper variance.
 *
 * @template C - The element type to extract props from
 *
 * @example
 * ```ts
 * type ButtonProps = PropsOf<'button'>; // HTMLButtonElement props with ref
 * type AnchorProps = PropsOf<'a'>; // HTMLAnchorElement props with ref
 * ```
 */
export type PropsOf<C extends ElementType> = React.JSX.LibraryManagedAttributes<
  C,
  React.ComponentPropsWithRef<C>
>;

/**
 * Merges two prop types, with OverrideProps taking precedence.
 * Properties in OverrideProps will override those in BaseProps.
 *
 * At the TYPE LEVEL (Step 1):
 * Component Props (OverrideProps) > Element Props (BaseProps)
 * This ensures component-defined APIs are not overridden by intrinsic element attributes.
 *
 * @template BaseProps - The base props type (Element props, lower priority)
 * @template OverrideProps - The overriding props type (Component props, higher priority)
 *
 * @example
 * ```ts
 * type ElementProps = { type: 'button' | 'submit' };
 * type ComponentProps = { type?: 'primary' | 'secondary'; variant?: 'solid' };
 * type Merged = MergeProps<ElementProps, ComponentProps>;
 * // Result: { type?: 'primary' | 'secondary'; variant?: 'solid' }
 * // Note: Component's 'type' overrides Element's 'type' to allow component API design
 * ```
 */
export type MergeProps<BaseProps, OverrideProps> = OverrideProps &
  Omit<BaseProps, keyof OverrideProps>;

/**
 * Props for the component prop that allows polymorphic rendering.
 *
 * @template C - The element type
 *
 * @example
 * ```ts
 * type ButtonComponentProp = ComponentProp<'button'>; // { component?: 'button' }
 * ```
 */
export type ComponentProp<C extends ElementType> = {
  component?: C;
};

/**
 * Type-level constraint that prevents 'component' from being defined in user Props.
 * Returns 'never' if 'component' is found, blocking the type instead of polluting it.
 *
 * This uses a constraint-based approach: errors should BLOCK, not CARRY.
 *
 * @template Props - User-defined props to validate
 *
 * @example
 * ```ts
 * type GoodProps = { variant?: 'solid' };
 * type ValidatedGood = DisallowComponentProp<GoodProps>; // { variant?: 'solid' }
 *
 * type BadProps = { component?: string; variant?: 'solid' };
 * type ValidatedBad = DisallowComponentProp<BadProps>; // never (blocks the type)
 * ```
 */
export type DisallowComponentProp<Props> = 'component' extends keyof Props
  ? never
  : Props;

/**
 * Extracts the correct ref type for a given element type.
 * Note: With the current implementation, ref is already included in PropsOf,
 * so this type is primarily for explicit ref typing when needed.
 *
 * @template C - The element type
 *
 * @example
 * ```ts
 * type ButtonRef = PolymorphicRef<'button'>; // React.Ref<HTMLButtonElement>
 * type AnchorRef = PolymorphicRef<'a'>; // React.Ref<HTMLAnchorElement>
 * ```
 */
export type PolymorphicRef<C extends ElementType> = React.ComponentPropsWithRef<C>['ref'];

/**
 * Complete polymorphic props type that combines:
 * - Element-specific props (from PropsOf, including ref)
 * - Custom component props
 * - Component prop for polymorphic rendering
 *
 * Note: ref is handled natively by React through PropsOf (ComponentPropsWithRef),
 * ensuring proper variance and avoiding manual override conflicts.
 *
 * The 'component' prop is a RESERVED KEYWORD for polymorphic rendering.
 * If you try to define 'component' in your Props, you will get an explicit type error.
 *
 * @template C - The element type (defaults to the component's default element)
 * @template Props - Additional props specific to the component (must not include 'component')
 *
 * @example
 * ```ts
 * // Correct: Button component with default 'button' element
 * type ButtonProps<C extends ElementType = 'button'> = PolymorphicProps<C, {
 *   size?: 'sm' | 'md' | 'lg';
 * }>;
 *
 * // Usage:
 * <Button onClick={...} />                    // button props
 * <Button component="a" href="..." />         // anchor props
 * <Button component={Link} to="..." />        // Link props
 *
 * // Error: User cannot define 'component' prop
 * type BadProps = { component?: string; variant?: 'solid' };
 * type ErrorProps = PolymorphicProps<'button', BadProps>;
 * // Type error: Do not define "component" in component props. It is a reserved keyword.
 * ```
 */
export type PolymorphicProps<C extends ElementType, Props = {}> = MergeProps<
  PropsOf<C>,
  Omit<DisallowComponentProp<Props>, 'component'> & ComponentProp<C>
>;