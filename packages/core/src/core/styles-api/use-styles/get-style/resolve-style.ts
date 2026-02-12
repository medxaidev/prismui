import type { CSSProperties } from '../../../types';
import type { PrismuiTheme, PrismuiStyleProp } from '../../../theme';

export type { PrismuiStyleProp };

export function resolveStyle(
  style: PrismuiStyleProp,
  theme: PrismuiTheme,
): CSSProperties {
  if (Array.isArray(style)) {
    return style.reduce<CSSProperties>(
      (acc, item) => ({ ...acc, ...resolveStyle(item, theme) }),
      {},
    );
  }

  if (typeof style === 'function') {
    return style(theme);
  }

  if (style == null) {
    return {};
  }

  return style;
}
