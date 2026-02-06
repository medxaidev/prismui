import { useMemo } from 'react';
import type { ReactNode } from 'react';
import type { PrismuiTheme, PrismuiColorScheme, PrismuiResolvedColorScheme } from '../theme';
import { createTheme } from '../theme';
import { PrismuiThemeContext } from './prismui-theme-context';
import type { PrismuiThemeContextValue } from './prismui-theme-context';
import type { PrismuiColorSchemeManager } from './color-scheme-manager';
import { useProviderColorScheme } from './use-provider-color-scheme';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface PrismuiThemeProviderProps {
  /** Theme overrides to merge into the base theme. */
  theme?: Partial<PrismuiTheme>;
  /** Default color scheme preference. */
  defaultColorScheme?: PrismuiColorScheme;
  /** Force a specific color scheme (overrides defaultColorScheme and user toggle). */
  forceColorScheme?: PrismuiResolvedColorScheme;
  /**
   * Color scheme manager for persistence and cross-tab sync.
   * Pass `null` to disable persistence entirely.
   * When `undefined` (default), no persistence is used.
   */
  colorSchemeManager?: PrismuiColorSchemeManager | null;
  /** Provider children. */
  children?: ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Provides the resolved PrismUI theme and color scheme to the component tree.
 *
 * This is the **theme-only** provider. For the all-in-one provider that also
 * handles CSS variables, baseline styles, and SSR registry, use `PrismuiProvider`.
 *
 * @example
 * ```tsx
 * import { PrismuiThemeProvider } from '@prismui/core';
 *
 * <PrismuiThemeProvider theme={{ primaryColor: 'indigo' }}>
 *   <App />
 * </PrismuiThemeProvider>
 * ```
 */
export function PrismuiThemeProvider({
  theme: themeOverrides,
  defaultColorScheme = 'light',
  forceColorScheme,
  colorSchemeManager,
  children,
}: PrismuiThemeProviderProps) {
  const resolvedTheme = useMemo(
    () => createTheme(themeOverrides ?? {}),
    [themeOverrides],
  );

  const { colorScheme, setColorScheme, clearColorScheme } = useProviderColorScheme({
    manager: colorSchemeManager ?? null,
    defaultColorScheme,
    forceColorScheme,
  });

  const contextValue = useMemo<PrismuiThemeContextValue>(
    () => ({
      theme: resolvedTheme,
      colorScheme,
      setColorScheme,
      clearColorScheme,
    }),
    [resolvedTheme, colorScheme, setColorScheme, clearColorScheme],
  );

  return (
    <PrismuiThemeContext.Provider value={contextValue}>
      {children}
    </PrismuiThemeContext.Provider>
  );
}
