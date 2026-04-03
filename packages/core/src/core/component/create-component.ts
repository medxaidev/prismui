import * as React from 'react';
import type { ElementType, PolymorphicProps } from '../polymorphic/types';

/**
 * Polymorphic component type that supports dynamic element rendering.
 * 
 * This type represents a component that can render as different HTML elements
 * or React components while maintaining full type safety for props and refs.
 * 
 * Note: ref is already included in PolymorphicProps via PropsOf (ComponentPropsWithRef),
 * so it does not need to be added separately.
 * 
 * @template DefaultC - The default element type (e.g., 'button', 'div')
 * @template Props - Additional props specific to the component
 * 
 * @example
 * ```tsx
 * // Component can be called with different element types
 * <Button />                           // Renders as button
 * <Button component="a" href="..." />  // Renders as anchor
 * <Button component={Link} to="..." /> // Renders as Link
 * 
 * // Ref type is correctly inferred based on component prop
 * const buttonRef = useRef<HTMLButtonElement>(null);
 * const anchorRef = useRef<HTMLAnchorElement>(null);
 * <Button ref={buttonRef} />                    // ✅ Correct
 * <Button component="a" ref={anchorRef} />      // ✅ Correct
 * ```
 */
export type PolymorphicComponent<DefaultC extends ElementType, Props = {}> = <
  C extends ElementType = DefaultC,
>(
  props: PolymorphicProps<C, Props>,
) => React.ReactElement | null;

/**
 * Creates a polymorphic component with full type safety.
 * 
 * This factory function wraps a render function with React.forwardRef and
 * provides correct type inference for:
 * - Props based on the `component` prop
 * - Ref type matching the rendered element
 * - Automatic generic inference
 * 
 * @template DefaultC - The default element type when `component` prop is not provided
 * @template Props - Additional props specific to your component
 * 
 * @param component - A forwardRef render function that receives props and ref
 * @returns A polymorphic component that can render as different elements
 * 
 * @example
 * ```tsx
 * // Define component-specific props
 * type ButtonProps = {
 *   variant?: 'primary' | 'secondary';
 * };
 * 
 * // Create polymorphic Button component
 * export const Button = createComponent<'button', ButtonProps>(
 *   (props, ref) => {
 *     const {
 *       component: Component = 'button',
 *       variant,
 *       ...rest
 *     } = props;
 * 
 *     return <Component ref={ref} {...rest} />;
 *   }
 * );
 * 
 * // Usage:
 * <Button onClick={...} />                    // button props
 * <Button component="a" href="..." />         // anchor props
 * <Button component={Link} to="..." />        // Link props
 * ```
 * 
 * @remarks
 * Key design decisions:
 * 
 * 1. **Single factory function** - No separate `createPolymorphicComponent`,
 *    all components are polymorphic by default.
 * 
 * 2. **Zero configuration** - Generic parameters express everything needed,
 *    no configuration object required.
 * 
 * 3. **Type safety** - Uses `as unknown as` instead of `as any` for safer
 *    type assertions.
 * 
 * 4. **Ref forwarding** - Automatically handles ref forwarding with correct
 *    type inference based on the rendered element. Ref is included in PolymorphicProps
 *    via PropsOf (ComponentPropsWithRef).
 * 
 * 5. **Props merging** - Component props override element props at the type level
 *    (Component Props > Element Props), allowing components to define their own APIs.
 */
export function createComponent<DefaultC extends ElementType, Props = {}>(
  component: any,
): PolymorphicComponent<DefaultC, Props> {
  // Wrap the component with React.forwardRef to enable ref forwarding
  // Use 'as unknown as' for type assertion (safer than direct 'as any')
  // This is necessary because React.forwardRef's return type doesn't match
  // our PolymorphicComponent signature exactly, but we know it's correct
  //
  // Note: We use 'any' for the component parameter because:
  // 1. React.forwardRef expects PropsWithoutRef which conflicts with our PolymorphicProps
  // 2. The actual type safety is enforced by PolymorphicComponent's return type
  // 3. Users will get correct type inference when defining and using the component
  // 4. This is the same approach used by Mantine's polymorphicFactory
  return React.forwardRef(component) as unknown as PolymorphicComponent<
    DefaultC,
    Props
  >;
}
