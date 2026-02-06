import { createContext, useContext } from 'react';
import type { PrismuiTheme, PrismuiColorScheme, PrismuiResolvedColorScheme } from '../theme';

// ---------------------------------------------------------------------------
// Context value
// ---------------------------------------------------------------------------

export interface PrismuiThemeContextValue {
  /** Theme object (semantic palette colors resolved at CSS variable generation time). */
  theme: PrismuiTheme;
  /** Current resolved color scheme ('light' | 'dark'). */
  colorScheme: PrismuiResolvedColorScheme;
  /** Switch the active color scheme at runtime. Accepts 'light', 'dark', or 'auto'. */
  setColorScheme: (scheme: PrismuiColorScheme) => void;
  /** Reset to the default color scheme. */
  clearColorScheme: () => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export const PrismuiThemeContext =
  createContext<PrismuiThemeContextValue | null>(null);

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Returns the current PrismUI theme context.
 *
 * Must be called within a `PrismuiThemeProvider` or `PrismuiProvider`.
 * Throws if no provider is found.
 */
export function usePrismuiTheme(): PrismuiThemeContextValue {
  const ctx = useContext(PrismuiThemeContext);
  if (!ctx) {
    throw new Error(
      'usePrismuiTheme must be used within a <PrismuiProvider> or <PrismuiThemeProvider>.',
    );
  }
  return ctx;
}

/**
 * Returns the resolved PrismuiTheme object.
 */
export function useTheme(): PrismuiTheme {
  return usePrismuiTheme().theme;
}

/**
 * Returns the current color scheme and a setter to change it.
 */
export function useColorScheme(): [
  PrismuiResolvedColorScheme,
  (scheme: PrismuiColorScheme) => void,
] {
  const { colorScheme, setColorScheme } = usePrismuiTheme();
  return [colorScheme, setColorScheme];
}
