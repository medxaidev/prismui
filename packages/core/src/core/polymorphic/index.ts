/**
 * Polymorphic type system for PrismUI components.
 * 
 * This module provides a complete type-level solution for creating polymorphic components
 * that can render as different HTML elements or React components while maintaining full
 * type safety for props and refs.
 * 
 * @module polymorphic
 * 
 * @example
 * ```tsx
 * import type { PolymorphicProps, ElementType } from '@prismui/core/polymorphic';
 * 
 * // Define a polymorphic Button component
 * type ButtonProps<C extends ElementType = 'button'> = PolymorphicProps<C, {
 *   size?: 'sm' | 'md' | 'lg';
 *   variant?: 'solid' | 'outlined';
 * }>;
 * 
 * // Usage:
 * <Button onClick={...} />                    // Renders as button
 * <Button component="a" href="..." />         // Renders as anchor
 * <Button component={Link} to="..." />        // Renders as React Router Link
 * ```
 */

export * from './types';