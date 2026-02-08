import type { CSSProperties } from 'react';
import type { PrismuiTheme, PrismuiStyleProp, PrismuiCSSVars } from '../../../core/theme/types';

interface GetBoxStyleOptions {
  theme: PrismuiTheme;
  styleProps: CSSProperties;
  style?: PrismuiStyleProp;
  vars?: PrismuiCSSVars;
}

function mergeStyles(
  styles: PrismuiStyleProp | PrismuiCSSVars | undefined,
  theme: PrismuiTheme
): CSSProperties {
  if (Array.isArray(styles)) {
    return styles.reduce<CSSProperties>(
      (acc, item) => ({ ...acc, ...mergeStyles(item as any, theme) }),
      {}
    );
  }

  if (typeof styles === 'function') {
    return (styles as any)(theme) ?? {};
  }

  if (styles == null) {
    return {};
  }

  return styles as CSSProperties;
}

export function getBoxStyle({ theme, style, vars, styleProps }: GetBoxStyleOptions): CSSProperties {
  const _style = mergeStyles(style, theme);
  const _vars = mergeStyles(vars, theme);
  return { ..._style, ..._vars, ...styleProps };
}
