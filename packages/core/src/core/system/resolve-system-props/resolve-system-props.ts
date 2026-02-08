import type { CSSProperties } from 'react';
import type { PrismuiTheme } from '../../theme/types';
import type { PrismuiStyleRegistry } from '../../style-engine';
import type { SystemProps } from '../system-props.types';
import { SYSTEM_CONFIG } from '../system-config';
import { resolvers } from '../resolvers';
import { normalizeResponsiveValue } from './normalize-responsive-value';
import { hashString, insertCssOnce } from '../../style-engine';

export interface ResolveSystemPropsResult {
  hasResponsiveStyles: boolean;
  inlineStyles: CSSProperties;
  className?: string;
}

/**
 * Resolves system props into inline styles and/or an injected responsive CSS class.
 *
 * Mobile-first approach:
 * - `base` value becomes the un-wrapped style (no media query).
 * - Breakpoint overrides become `@media (min-width: <bp>)` rules, sorted ascending.
 * - CSS is deduplicated via content-hashed class names + `insertCssOnce`.
 */
export function resolveSystemProps(options: {
  styleProps: Partial<SystemProps>;
  theme: PrismuiTheme;
  registry?: PrismuiStyleRegistry;
}): ResolveSystemPropsResult {
  const { styleProps, theme, registry } = options;

  const inlineStyles: CSSProperties = {};
  const baseStyles: CSSProperties = {};
  const media: Record<string, Record<string, any>> = {};

  let hasResponsiveStyles = false;

  type SystemPropKey = keyof typeof SYSTEM_CONFIG;
  const propKeys = Object.keys(SYSTEM_CONFIG) as SystemPropKey[];

  for (const propKey of propKeys) {
    const conf = SYSTEM_CONFIG[propKey as keyof typeof SYSTEM_CONFIG];
    if (!conf) continue;

    const raw = styleProps[propKey as keyof SystemProps];
    if (raw === undefined) continue;

    const resolver = resolvers[conf.transform as keyof typeof resolvers];
    if (typeof resolver !== 'function') continue;

    const { base, overrides } = normalizeResponsiveValue(
      raw,
      theme.breakpoints,
    );

    const overrideKeys = Object.keys(overrides) as Array<keyof typeof overrides>;
    const hasOverrides = overrideKeys.some((k) => overrides[k] !== undefined);

    if (!hasOverrides) {
      const cssValue = resolver(base, theme);
      if (cssValue !== undefined) (inlineStyles as any)[conf.cssProperty] = cssValue;
      continue;
    }

    hasResponsiveStyles = true;

    const baseCssValue = resolver(base, theme);
    if (baseCssValue !== undefined) (baseStyles as any)[conf.cssProperty] = baseCssValue;

    for (const bp of overrideKeys) {
      const v = overrides[bp];
      if (v === undefined) continue;

      const cssValue = resolver(v, theme);
      if (cssValue === undefined) continue;

      const query = `(min-width: ${theme.breakpoints[bp as keyof typeof theme.breakpoints]})`;
      media[query] = {
        ...media[query],
        [conf.cssProperty]: cssValue,
      };
    }
  }

  if (!hasResponsiveStyles) {
    return { hasResponsiveStyles: false, inlineStyles };
  }

  const selectorPlaceholder = '.__PRISMUI_SELECTOR__';

  const baseRule =
    Object.keys(baseStyles).length > 0
      ? `${selectorPlaceholder}{${Object.entries(baseStyles)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}:${v};`)
        .join('')}}`
      : '';

  const mediaRules = Object.keys(media)
    .sort((a, b) => extractMinWidthRem(a) - extractMinWidthRem(b))
    .map((query) => {
      const styles = media[query];
      const decl = Object.entries(styles).sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}:${v};`)
        .join('');
      return `@media ${query}{${selectorPlaceholder}{${decl}}}`;
    })
    .join('\n');

  const cssTemplate = [baseRule, mediaRules].filter(Boolean).join('\n');
  const className = `prismui-${hashString(cssTemplate)}`;
  const cssText = cssTemplate.replaceAll(selectorPlaceholder, `.${className}`);

  insertCssOnce(className, cssText, registry);

  return {
    hasResponsiveStyles: true,
    inlineStyles,
    className,
  };
}

function extractMinWidthRem(query: string): number {
  const m = query.match(/min-width:\s*([0-9.]+)rem/i);
  return m ? Number(m[1]) : 0;
}
