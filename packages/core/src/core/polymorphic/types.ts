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
 * Merges two prop types, with BaseProps taking precedence.
 * Properties in BaseProps will override those in OverrideProps.
 * This ensures Element props (BaseProps) have higher priority than Component props (OverrideProps).
 *
 * @template BaseProps - The base props type (higher priority)
 * @template OverrideProps - The additional props type (lower priority)
 *
 * @example
 * ```ts
 * type ElementProps = { href: string; onClick: () => void };
 * type ComponentProps = { href?: number; variant?: 'primary' };
 * type Merged = MergeProps<ElementProps, ComponentProps>;
 * // Result: { href: string; onClick: () => void; variant?: 'primary' }
 * // Note: href is string (from ElementProps), not number (from ComponentProps)
 * ```
 */
export type MergeProps<BaseProps, OverrideProps> = BaseProps &
  Omit<OverrideProps, keyof BaseProps>;

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
>;