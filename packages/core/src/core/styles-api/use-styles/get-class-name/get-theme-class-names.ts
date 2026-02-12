import type { PrismuiTheme } from '../../../theme';
import { resolveClassNames } from './resolve-class-names';

export function getThemeClassNames(
  theme: PrismuiTheme,
  themeName: string[],
  selector: string,
  props: Record<string, any>,
  stylesCtx: Record<string, any> | undefined,
): (string | undefined)[] {
  return themeName.map(
    (n) =>
      resolveClassNames(
        theme,
        theme.components[n]?.classNames,
        props,
        stylesCtx,
      )?.[selector],
  );
}
