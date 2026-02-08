import type { PrismuiTheme } from '../../../theme/types';
import { rem } from '../../../../utils';

export function sizeResolver(value: unknown, _theme: PrismuiTheme): string | undefined {
  if (value == null) return undefined;
  return rem(value);
}
