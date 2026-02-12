import type { CSSProperties } from 'react';
import type { PrismuiTheme } from '../../theme/types';
import type { PrismuiStyleRegistry } from '../../style-engine';
import { normalizeResponsiveValue } from '../resolve-system-props/normalize-responsive-value';
import { hashString, insertCssOnce } from '../../style-engine';

/**
 * Describes a single responsive CSS variable binding.
 *
 * - `value`: the raw prop value — either a plain value or a responsive object
 *   `{ base: 'sm', md: 'lg', xl: 'xl' }`
 * - `resolver`: transforms the raw value into a CSS string
 *   (e.g. `spacingResolver` turns `2` into `0.5rem`)
 * - `cssVar`: the CSS custom property name (e.g. `'--stack-gap'`)
 */
export interface ResponsiveVarBinding {
  value: unknown;
  resolver: (value: unknown, theme: PrismuiTheme) => string | undefined;
  cssVar: string;
}

export interface ResolveResponsiveVarsResult {
  /** Base CSS variable values to set as inline styles */
  style: CSSProperties;
  /** Injected responsive className (undefined if no responsive overrides) */
  className?: string;
}

/**
 * Resolves component prop values into CSS variables with responsive support.
 *
 * This is the **responsive props engine** — it allows any component prop
 * to support breakpoint-based responsive values using the same mobile-first
 * approach as SystemProps.
 *
 * Usage in a component:
 * ```ts
 * const responsive = resolveResponsiveVars({
 *   theme,
 *   vars: [
 *     { cssVar: '--stack-gap', value: gap, resolver: spacingResolver },
 *     { cssVar: '--stack-align', value: align, resolver: identityResolver },
 *   ],
 *   registry,
 * });
 * // responsive.style  → { '--stack-gap': 'var(--prismui-spacing-md)', ... }
 * // responsive.className → 'prismui-abc123' (only if responsive values used)
 * ```
 *
 * Supports:
 * - Plain values: `gap="md"` → inline CSS variable
 * - Responsive objects: `gap={{ base: 'sm', md: 'lg' }}` → base + media query CSS injected via class rule
 *   (base values go into the class rule, NOT inline style, so @media overrides win at same specificity)
 */
export function resolveResponsiveVars(options: {
  vars: ResponsiveVarBinding[];
  theme: PrismuiTheme;
  registry?: PrismuiStyleRegistry;
}): ResolveResponsiveVarsResult {
  const { vars, theme, registry } = options;

  const inlineStyle: Record<string, string> = {};
  const baseDecls: Record<string, string> = {};
  const media: Record<string, Record<string, string>> = {};
  let hasResponsive = false;

  for (const binding of vars) {
    const { value, resolver, cssVar } = binding;
    if (value === undefined) continue;

    const { base, overrides } = normalizeResponsiveValue(
      value,
      theme.breakpoints,
    );

    // Check if this binding has responsive overrides
    const overrideKeys = Object.keys(overrides) as Array<keyof typeof overrides>;
    const bindingHasOverrides = overrideKeys.some((bp) => overrides[bp] !== undefined);

    // Resolve base value
    if (base !== undefined) {
      const resolved = resolver(base, theme);
      if (resolved !== undefined) {
        if (bindingHasOverrides) {
          // When responsive overrides exist, base goes into the CSS class rule
          // so that @media rules at the same specificity can override it.
          // Inline styles would always win over class-based @media rules.
          baseDecls[cssVar] = resolved;
        } else {
          // No responsive overrides — inline style is fine (and avoids
          // unnecessary CSS injection for simple static values).
          inlineStyle[cssVar] = resolved;
        }
      }
    }

    // Resolve responsive overrides
    for (const bp of overrideKeys) {
      const v = overrides[bp];
      if (v === undefined) continue;

      const resolved = resolver(v, theme);
      if (resolved === undefined) continue;

      hasResponsive = true;
      const query = `(min-width: ${theme.breakpoints[bp as keyof typeof theme.breakpoints]})`;
      media[query] = {
        ...media[query],
        [cssVar]: resolved,
      };
    }
  }

  if (!hasResponsive) {
    return { style: inlineStyle as unknown as CSSProperties };
  }

  // Build responsive CSS (same pattern as resolveSystemProps)
  // Base declarations go into an un-wrapped class rule so @media rules can override them.
  const selectorPlaceholder = '.__PRISMUI_SELECTOR__';

  const baseRule = Object.keys(baseDecls).length > 0
    ? `${selectorPlaceholder}{${Object.entries(baseDecls)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v};`)
      .join('')}}`
    : '';

  const mediaRules = Object.keys(media)
    .sort((a, b) => extractMinWidthRem(a) - extractMinWidthRem(b))
    .map((query) => {
      const decl = Object.entries(media[query])
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}:${v};`)
        .join('');
      return `@media ${query}{${selectorPlaceholder}{${decl}}}`;
    })
    .join('\n');

  const fullCss = [baseRule, mediaRules].filter(Boolean).join('\n');
  const className = `prismui-rv-${hashString(fullCss)}`;
  const cssText = fullCss.replaceAll(selectorPlaceholder, `.${className}`);

  insertCssOnce(className, cssText, registry);

  return {
    style: inlineStyle as unknown as CSSProperties,
    className,
  };
}

function extractMinWidthRem(query: string): number {
  const m = query.match(/min-width:\s*([0-9.]+)rem/i);
  return m ? Number(m[1]) : 0;
}
