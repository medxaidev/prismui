import type { PrismuiTheme } from '../../../theme/types';

export function lineHeightResolver(value: unknown, _theme: PrismuiTheme): string | undefined {
  if (value == null) return undefined;

  if (value === 'md' || value === 'base') {
    return 'var(--prismui-line-height-md)';
  }

  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);

  return undefined;
}
