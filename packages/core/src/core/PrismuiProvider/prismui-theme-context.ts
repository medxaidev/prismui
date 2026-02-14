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
  /** When true, all components skip CSS Module classes (global headless mode). */
  headless: boolean;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export const PrismuiThemeContext =
  createContext<PrismuiThemeContextValue | null>(null);

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/**
 * Returns the raw PrismUI theme context value, or `null` if no provider is present.
 *
 * Use this in components that should work **with or without** a provider
 * (e.g. Box). For components that **require** a provider, use `usePrismuiTheme()`.
 */
export function usePrismuiContext(): PrismuiThemeContextValue | null {
  return useContext(PrismuiThemeContext);
}

/**
 * Returns the current PrismUI theme context.
 *
 * Must be called within a `PrismuiThemeProvider` or `PrismuiProvider`.
 * Throws if no provider is found.
 */
export function usePrismuiTheme(): PrismuiThemeContextValue {
  const ctx = usePrismuiContext();
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

/**
 * Returns whether the component should operate in headless mode.
 *
 * Headless mode is active when either:
 * - The provider-level `headless` prop is `true`, OR
 * - The component-level `unstyled` prop is `true`
 *
 * In headless mode, CSS Module classes are stripped — only user-provided
 * `className`, `style`, and CSS variables remain.
 */
export function useIsHeadless(unstyled?: boolean): boolean {
  const ctx = usePrismuiContext();
  return unstyled === true || ctx?.headless === true;
}
