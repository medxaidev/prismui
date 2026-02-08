import type { PrismuiTheme } from '../../../theme/types';

export function fontFamilyResolver(value: unknown, _theme: PrismuiTheme): string | undefined {
  if (value == null) return undefined;

  if (value === 'mono') {
    return 'var(--prismui-font-family-monospace)';
  }

  if (value === 'sans' || value === 'default') {
    return 'var(--prismui-font-family)';
  }

  if (typeof value === 'string') return value;

  return undefined;
}
