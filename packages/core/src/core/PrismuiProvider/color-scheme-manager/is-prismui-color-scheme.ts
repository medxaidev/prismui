import type { PrismuiColorScheme } from '../../theme';

export function isPrismuiColorScheme(value: unknown): value is PrismuiColorScheme {
  return value === 'light' || value === 'dark' || value === 'auto';
}
