import { forwardRef } from 'react';
import type { ElementType } from '../../core/types';
import type { PrismuiStyleProp, PrismuiCSSVars } from '../../core/theme/types';
import { createPolymorphicComponent } from '../../core/types';


export interface BoxProps {
  className?: string;
  style?: PrismuiStyleProp;
  __vars?: PrismuiCSSVars;
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
