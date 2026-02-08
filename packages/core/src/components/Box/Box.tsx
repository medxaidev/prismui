import { forwardRef, useContext } from 'react';
import cx from 'clsx';
import type { ElementType } from '../../core/types';
import type { PrismuiStyleProp, PrismuiCSSVars } from '../../core/theme/types';
import { createPolymorphicComponent } from '../../core/types';
import type { SystemProps } from '../../core/system';
import { splitSystemProps, resolveSystemProps } from '../../core/system';
import { PrismuiThemeContext } from '../../core/PrismuiProvider/prismui-theme-context';
import { useStyleRegistry } from '../../core/style-engine';
import { defaultTheme } from '../../core/theme/default-theme';
import { getBoxStyle } from './get-box-style/get-box-style';


export interface BoxProps extends SystemProps {
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
    const ctx = useContext(PrismuiThemeContext);
    const theme = ctx?.theme ?? defaultTheme;
    const Element = component || 'div';
    const { styleProps, rest } = splitSystemProps(others);
    const registry = useStyleRegistry() ?? undefined;
    const resolved = resolveSystemProps({ styleProps, theme, registry });

    const props = {
      ref,
      style: getBoxStyle({
        theme,
        style,
        vars: __vars,
        styleProps: resolved.inlineStyles,
      }),
      className: cx(className, resolved.className),
      ...rest,
    };

    return <Element {...props} />;
  });


export const Box = createPolymorphicComponent<'div', BoxProps>(_Box);
Box.displayName = '@prismui/core/Box';
