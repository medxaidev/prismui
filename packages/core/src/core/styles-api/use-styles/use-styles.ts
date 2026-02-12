import type { CSSProperties } from '../../types';
import type { FactoryPayload } from '../../factory';
import { useTheme } from '../../PrismuiProvider/prismui-theme-context';
import type { PartialVarsResolver, VarsResolver } from '../create-vars-resolver';
import type { ClassNames, GetStylesApiOptions, Styles } from '../styles-api.types';
import { getClassName } from './get-class-name/get-class-name';
import type { _ClassNamesArray } from './get-class-name/resolve-class-names';
import { getStyle } from './get-style/get-style';
import type { PrismuiStyleProp } from './get-style/resolve-style';
import type { _Styles } from './get-style/resolve-styles';
import type { _VarsResolver } from './get-style/resolve-vars';

// ---------------------------------------------------------------------------
// UseStylesInput — configuration passed to useStyles()
// ---------------------------------------------------------------------------

export interface UseStylesInput<Payload extends FactoryPayload> {
  name: string | (string | undefined)[];
  classes: Payload['stylesNames'] extends string ? Record<string, string> : never;
  props: Payload['props'];
  stylesCtx?: Payload['ctx'];
  className?: string;
  style?: PrismuiStyleProp;
  rootSelector?: Payload['stylesNames'];
  unstyled?: boolean;
  classNames?: ClassNames<Payload> | _ClassNamesArray;
  styles?: Styles<Payload>;
  vars?: PartialVarsResolver<Payload>;
  varsResolver?: VarsResolver<Payload>;
}

// ---------------------------------------------------------------------------
// GetStylesApi — the function returned by useStyles()
// ---------------------------------------------------------------------------

export type GetStylesApi<Payload extends FactoryPayload> = (
  selector: NonNullable<Payload['stylesNames']>,
  options?: GetStylesApiOptions,
) => {
  className: string;
  style: CSSProperties;
};

// ---------------------------------------------------------------------------
// useStyles — the main hook
// ---------------------------------------------------------------------------

export function useStyles<Payload extends FactoryPayload>({
  name,
  classes,
  props,
  stylesCtx,
  className,
  style,
  rootSelector = 'root' as NonNullable<Payload['stylesNames']>,
  unstyled,
  classNames,
  styles,
  vars,
  varsResolver,
}: UseStylesInput<Payload>): GetStylesApi<Payload> {
  const theme = useTheme();
  const themeName = (Array.isArray(name) ? name : [name]).filter(Boolean) as string[];

  return (selector, options) => ({
    className: getClassName({
      theme,
      options,
      themeName,
      selector: selector as string,
      classNames: classNames as _ClassNamesArray,
      classes: classes as Record<string, string>,
      unstyled,
      className,
      rootSelector: rootSelector as string,
      props,
      stylesCtx,
      withStaticClasses: true,
    }),

    style: getStyle({
      theme,
      themeName,
      selector: selector as string,
      options,
      props,
      stylesCtx,
      rootSelector: rootSelector as string,
      styles: styles as _Styles,
      style,
      vars: vars as _VarsResolver | undefined,
      varsResolver: varsResolver as _VarsResolver | undefined,
    }),
  });
}
