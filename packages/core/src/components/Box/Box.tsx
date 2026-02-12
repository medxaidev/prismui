import type { ReactElement } from 'react';
import { forwardRef } from 'react';
import type * as React from 'react';
import cx from 'clsx';
import type { PrismuiStyleProp, PrismuiCSSVars } from '../../core/theme/types';
import { createPolymorphicComponent } from '../../core/types';
import type { ElementType } from '../../core/types';
import type { SystemProps } from '../../core/system';
import { splitSystemProps, resolveSystemProps } from '../../core/system';
import { usePrismuiContext } from '../../core/PrismuiProvider/prismui-theme-context';
import { useStyleRegistry } from '../../core/style-engine';
import { defaultTheme } from '../../core/theme/default-theme';
import { getBoxStyle } from './get-box-style/get-box-style';
import type { BoxMod } from './get-box-mod/get-box-mod';
import { getBoxMod } from './get-box-mod/get-box-mod';

export type ElementProps<
  ElementType extends React.ElementType,
  PropsToOmit extends string = never,
> = Omit<React.ComponentPropsWithoutRef<ElementType>, 'style' | PropsToOmit>;

export interface BoxProps extends SystemProps {
  className?: string;
  style?: PrismuiStyleProp;
  __vars?: PrismuiCSSVars;

  /** Modifier data-attributes. Accepts string, object, or nested arrays. */
  mod?: BoxMod;

  /**
   * Render-prop alternative to `component`.
   * Receives computed props and returns the root element.
   *
   * @example
   * <Box renderRoot={(props) => <a {...props} href="/link" />}>Link</Box>
   */
  renderRoot?: (props: Record<string, any>) => ReactElement;
}

export interface BoxComponentProps extends BoxProps {
  /** Variant passed from parent component, sets `data-variant` */
  variant?: string;

  /** Size passed from parent component, sets `data-size` if value is not number-like */
  size?: string | number;
}

interface _BoxProps extends BoxComponentProps {
  component?: ElementType;
}

const _Box = forwardRef<HTMLDivElement, _BoxProps>(
  (
    {
      className,
      style,
      __vars,
      component,
      renderRoot,
      mod,
      variant,
      size,
      ...others
    },
    ref
  ) => {
    const theme = usePrismuiContext()?.theme ?? defaultTheme;
    const Element = component || 'div';
    const { styleProps, rest } = splitSystemProps(others);
    const registry = useStyleRegistry() ?? undefined;
    const resolved = resolveSystemProps({ styleProps, theme, registry });

    const dataAttrs: Record<string, any> = {};
    if (variant != null) dataAttrs['data-variant'] = variant;
    if (size != null && typeof size !== 'number') dataAttrs['data-size'] = size;

    const props: Record<string, any> = {
      ref,
      style: getBoxStyle({
        theme,
        style,
        vars: __vars,
        styleProps: resolved.inlineStyles,
      }),
      className: cx(className, resolved.className),
      ...dataAttrs,
      ...getBoxMod(mod),
      ...rest,
    };

    if (renderRoot) {
      return renderRoot(props);
    }

    return <Element {...props} />;
  }
);

_Box.displayName = '@prismui/core/Box';

export const Box = createPolymorphicComponent<'div', BoxComponentProps>(_Box);
