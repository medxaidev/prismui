import type { PrismuiTheme } from '../../../theme/types';
import { colorResolver } from '../color-resolver/color-resolver';

export function textColorResolver(value: unknown, theme: PrismuiTheme): string | undefined {
  return colorResolver(value, theme);
}
