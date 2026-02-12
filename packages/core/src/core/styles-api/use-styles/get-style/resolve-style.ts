import type { CSSProperties } from 'react';
import type { PrismuiTheme } from '../../../theme';

export type PrismuiStyleProp =
  | CSSProperties
  | ((theme: PrismuiTheme) => CSSProperties)
  | (CSSProperties | ((theme: PrismuiTheme) => CSSProperties))[]
  | undefined;

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
