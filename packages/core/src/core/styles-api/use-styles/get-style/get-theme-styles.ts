import type { CSSProperties } from 'react';
import type { PrismuiTheme } from '../../../theme';
import { resolveStyles } from './resolve-styles';

export function getThemeStyles(
  theme: PrismuiTheme,
  themeName: string[],
  props: Record<string, any>,
  stylesCtx: Record<string, any> | undefined,
  selector: string,
): CSSProperties {
  return themeName
    .map(
      (n) =>
        resolveStyles(
          theme,
          theme.components[n]?.styles,
          props,
          stylesCtx,
        )[selector],
    )
    .reduce<CSSProperties>((acc, val) => ({ ...acc, ...val }), {});
}
