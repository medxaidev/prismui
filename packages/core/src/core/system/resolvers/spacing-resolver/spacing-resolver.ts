import type { PrismuiTheme } from '../../../theme/types';
import { rem } from '../../../../utils';

function isToken(value: string) {
  return value === 'xs' || value === 'sm' || value === 'md' || value === 'lg' || value === 'xl';
}

export function spacingResolver(value: unknown, theme: PrismuiTheme): string | undefined {
  if (value == null) return undefined;

  const spacingUnit = theme.spacingUnit ?? 4;

  if (typeof value === 'number') {
    return rem(value * spacingUnit);
  }

  if (typeof value !== 'string') return undefined;

  const leadingWhitespace = value.match(/^\s+/)?.[0] ?? '';
  const trimmed = value.trim();

  if (trimmed === '') {
    return rem(value);
  }

  if (trimmed.startsWith('-')) {
    const token = trimmed.slice(1);
    if (isToken(token)) {
      return `${leadingWhitespace}calc(var(--prismui-spacing-${token}) * -1)`;
    }
  }

  if (isToken(trimmed)) {
    return `${leadingWhitespace}var(--prismui-spacing-${trimmed})`;
  }

  return rem(value);
}
