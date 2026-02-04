import { forwardRef } from 'react';
import type {
  ElementType,
  StyleProp,
  CSSVars
} from '../../core/types';
import { createPolymorphicComponent } from '../../core/types';


export interface BoxProps {
  className?: string;
  style?: StyleProp;
  __vars?: CSSVars;
}

interface _BoxProps extends BoxProps {
  component?: ElementType;
}

const _Box = forwardRef<unknown, _BoxProps>(
  (
    {
      className,
      style,
      __vars,
      component,
      ...others
    },
    ref
  ) => {
    const Element = component || 'div';

    const props = {
      ref,
      className,
      style: style as any,
      ...others
    };


    return <Element {...props} />;

  });


export const Box = createPolymorphicComponent<'div', BoxProps>(_Box);
Box.displayName = '@prismui/core/Box';
