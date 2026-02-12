import type { CSSProperties } from '../../../types';
import type { PrismuiTheme } from '../../../theme';
import type { GetStylesApiOptions } from '../../styles-api.types';
import { getThemeStyles } from './get-theme-styles';
import { resolveStyle, type PrismuiStyleProp } from './resolve-style';
import { resolveStyles, type _Styles } from './resolve-styles';
import { resolveVars, type _VarsResolver } from './resolve-vars';

export interface GetStyleInput {
  theme: PrismuiTheme;
  themeName: string[];
  selector: string;
  rootSelector: string;
  options: GetStylesApiOptions | undefined;
  props: Record<string, any>;
  stylesCtx: Record<string, any> | undefined;
  styles: _Styles;
  style: PrismuiStyleProp;
  vars: _VarsResolver | undefined;
  varsResolver: _VarsResolver | undefined;
}

export function getStyle({
  theme,
  themeName,
  selector,
  options,
  props,
  stylesCtx,
  rootSelector,
  styles,
  style,
  vars,
  varsResolver,
}: GetStyleInput): CSSProperties {
  return {
    // 1. Theme-level styles
    ...getThemeStyles(theme, themeName, props, stylesCtx, selector),
    // 2. Component-level styles (from useStyles input)
    ...resolveStyles(theme, styles, props, stylesCtx)[selector],
    // 3. Per-selector styles from getStyles() options
    ...resolveStyles(
      theme,
      options?.styles as _Styles,
      options?.props || props,
      stylesCtx,
    )[selector],
    // 4. CSS variables from varsResolver + theme vars + user vars
    ...resolveVars(theme, props, stylesCtx, selector, themeName, varsResolver, vars),
    // 5. Root style (only for root selector)
    ...(rootSelector === selector ? resolveStyle(style, theme) : null),
    // 6. Per-selector style from getStyles() options
    ...resolveStyle(options?.style, theme),
  };
}
