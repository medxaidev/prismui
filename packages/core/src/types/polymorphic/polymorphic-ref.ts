import type * as React from 'react';
import type { ElementType } from './element-type';

/** Extract the correct `ref` type for a given element/component. */
export type PolymorphicRef<C extends ElementType> = React.ComponentPropsWithRef<C>['ref'];