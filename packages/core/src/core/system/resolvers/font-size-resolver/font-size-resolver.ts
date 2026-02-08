import type { PrismuiTheme } from '../../../theme/types';
import { rem } from '../../../../utils';

export function fontSizeResolver(value: unknown, _theme: PrismuiTheme): string | undefined {
  if (value == null) return undefined;

  if (value === 'md' || value === 'base') {
    return 'var(--prismui-font-size)';
  }

  return rem(value);
}
