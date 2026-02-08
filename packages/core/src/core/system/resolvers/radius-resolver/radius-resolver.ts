import type { PrismuiTheme } from '../../../theme/types';
import { rem } from '../../../../utils';

export function radiusResolver(value: unknown, _theme: PrismuiTheme): string | undefined {
  if (value == null) return undefined;

  if (value === 'theme') {
    return 'var(--prismui-radius-md)';
  }

  if (value === 'none') {
    return '0';
  }

  if (value === 'full') {
    return '9999px';
  }

  if (typeof value === 'number' || typeof value === 'string') {
    return rem(value);
  }

  return undefined;
}
