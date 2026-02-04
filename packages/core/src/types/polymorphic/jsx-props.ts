import type * as React from 'react';
import type { ElementType } from './element-type';

/**
 * Props for a JSX element/component, including defaultProps and propTypes adjustments.
 *
 * LibraryManagedAttributes mirrors how React computes props types at usage sites.
 */
export type JSXProps<C extends ElementType> = React.JSX.LibraryManagedAttributes<
  C,
  React.ComponentPropsWithoutRef<C>
>;
