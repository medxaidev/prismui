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
 * Extracts props from an element type, excluding ref.
 * Uses LibraryManagedAttributes to handle defaultProps and other React internals.
 *
 * @template C - The element type to extract props from
 *
 * @example
 * ```ts
 * type ButtonProps = PropsOf<'button'>; // HTMLButtonElement props without ref
 * type AnchorProps = PropsOf<'a'>; // HTMLAnchorElement props without ref
 * ```
 */
export type PropsOf<C extends ElementType> = React.JSX.LibraryManagedAttributes<
  C,
  React.ComponentPropsWithoutRef<C>
>;

/**
 * Merges two prop types, with OverrideProps taking precedence.
 * Properties in OverrideProps will override those in BaseProps.
 *
 * @template BaseProps - The base props type
 * @template OverrideProps - The overriding props type
 *
 * @example
 * ```ts
 * type Base = { a: string; b: number };
 * type Override = { b: string; c: boolean };
 * type Merged = MergeProps<Base, Override>; // { a: string; b: string; c: boolean }
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
 * Extracts the correct ref type for a given element type.
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
 * - Element-specific props (from PropsOf)
 * - Custom component props
 * - Component prop for polymorphic rendering
 * - Correctly typed ref
 *
 * @template C - The element type (defaults to the component's default element)
 * @template Props - Additional props specific to the component
 *
 * @example
 * ```ts
 * // Button component with default 'button' element
 * type ButtonProps<C extends ElementType = 'button'> = PolymorphicProps<C, {
 *   size?: 'sm' | 'md' | 'lg';
 * }>;
 *
 * // Usage:
 * <Button onClick={...} />                    // button props
 * <Button component="a" href="..." />         // anchor props
 * <Button component={Link} to="..." />        // Link props
 * ```
 */
export type PolymorphicProps<C extends ElementType, Props = {}> = MergeProps<
  PropsOf<C>,
  Props & ComponentProp<C>
> & {
  ref?: PolymorphicRef<C>;
};