import type { PrismuiTheme } from '../../../theme/types';

export function borderResolver(value: unknown, _theme: PrismuiTheme): string | undefined {
  if (value == null) return undefined;
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return undefined;
}
