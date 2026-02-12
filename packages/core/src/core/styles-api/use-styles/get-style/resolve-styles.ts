import type { CSSProperties } from '../../../types';
import type { PrismuiTheme } from '../../../theme';

export type _Styles =
  | undefined
  | Partial<Record<string, CSSProperties>>
  | ((
    theme: PrismuiTheme,
    props: Record<string, any>,
    ctx: Record<string, any> | undefined
  ) => Partial<Record<string, CSSProperties>>);

export function resolveStyles(
  theme: PrismuiTheme,
  styles: _Styles | _Styles[],
  props: Record<string, any>,
  stylesCtx: Record<string, any> | undefined,
): Record<string, CSSProperties> {
  const arrayStyles = Array.isArray(styles) ? styles : [styles];

  return arrayStyles.reduce<Record<string, any>>((acc, style) => {
    if (typeof style === 'function') {
      return { ...acc, ...style(theme, props, stylesCtx) };
    }
    return { ...acc, ...style };
  }, {});
}
