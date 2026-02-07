'use client';

import type { ReactNode } from 'react';
import type { PrismuiTheme, PrismuiColorScheme, PrismuiResolvedColorScheme } from '../theme';
import type { PrismuiStyleRegistry } from '../style-engine';
import { StyleRegistryProvider } from '../style-engine';
import { PrismuiThemeProvider } from './PrismuiThemeProvider';
import type { PrismuiColorSchemeManager } from './color-scheme-manager';
import { ThemeVars } from '../css-vars';
import { CssBaseline } from '../css-baseline';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface PrismuiProviderProps {
  /** Theme overrides to merge into the base theme. */
  theme?: Partial<PrismuiTheme>;
  /** Provider children. */
  children?: ReactNode;
  /** Default color scheme preference. */
  defaultColorScheme?: PrismuiColorScheme;
  /** Force a specific color scheme (overrides defaultColorScheme and user toggle). */
  forceColorScheme?: PrismuiResolvedColorScheme;

  /**
   * Color scheme manager for persistence and cross-tab sync.
   * Pass `null` to disable persistence entirely.
   */
  colorSchemeManager?: PrismuiColorSchemeManager | null;

  /** Optional style registry for SSR. When provided, CSS is collected into it. */
  registry?: PrismuiStyleRegistry;

  /** Whether to inject CSS variables via ThemeVars. @default true */
  withCssVars?: boolean;
  /** Whether to inject global reset/base styles via CssBaseline. @default true */
  withCssBaseline?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * All-in-one PrismUI root provider.
 *
 * Composes:
 * - `PrismuiThemeProvider` — theme context + color scheme state
 * - `StyleRegistryProvider` — SSR CSS collection (when `registry` is provided)
 * - `ThemeVars` — CSS variable injection (when `withCssVars` is true)
 * - `CssBaseline` — global reset/base styles (when `withCssBaseline` is true)
 *
 * @example
 * ```tsx
 * // SPA usage
 * import { PrismuiProvider } from '@prismui/core';
 *
 * <PrismuiProvider theme={{ primaryColor: 'indigo' }}>
 *   <App />
 * </PrismuiProvider>
 *
 * // SSR usage (Next.js App Router)
 * import { PrismuiProvider, createStyleRegistry } from '@prismui/core';
 *
 * const registry = createStyleRegistry();
 *
 * <PrismuiProvider registry={registry} theme={{ primaryColor: 'indigo' }}>
 *   <App />
 * </PrismuiProvider>
 * ```
 */
export function PrismuiProvider({
  theme,
  children,
  defaultColorScheme = 'light',
  forceColorScheme,
  colorSchemeManager,
  registry,
  withCssVars = true,
  withCssBaseline = true,
}: PrismuiProviderProps) {

  const content = (
    <PrismuiThemeProvider
      theme={theme}
      defaultColorScheme={defaultColorScheme}
      forceColorScheme={forceColorScheme}
      colorSchemeManager={colorSchemeManager}
    >
      {withCssVars ? <ThemeVars /> : null}
      {withCssBaseline ? <CssBaseline /> : null}
      {children}
    </PrismuiThemeProvider>
  );

  return registry ? (
    <StyleRegistryProvider registry={registry}>
      {content}
    </StyleRegistryProvider>
  ) : (
    content
  );
}
