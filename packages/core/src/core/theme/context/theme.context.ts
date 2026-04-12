import React from "react";
import { defaultTheme } from "../default-theme";
import type { PrismUITheme } from "../types";

/**
 * ThemeContext
 *
 * Default value is null (not defaultTheme).
 * Reason: createContext(defaultTheme) creates a "fake safety" —
 * useTheme() would silently succeed even without a Provider,
 * making missing-Provider bugs invisible.
 *
 * null forces the check in useTheme() to actually catch the error.
 */
export const ThemeContext = React.createContext<PrismUITheme<string, string> | null>(null);

/**
 * useTheme
 *
 * Read the current PrismUITheme from context.
 * MUST be used within <PrismUIProvider>.
 * Throws if called outside Provider (null default enforces this).
 */
export function useTheme(): PrismUITheme<string, string> {
  const theme = React.useContext(ThemeContext);
  if (!theme) {
    throw new Error(
      "[PrismUI] useTheme must be used within <PrismUIProvider>. " +
      "Wrap your application with <PrismUIProvider theme={theme}>.",
    );
  }
  return theme;
}

/**
 * useThemeOptional
 *
 * Internal: read theme without throwing.
 * Falls back to defaultTheme when used outside Provider.
 * Used by createStylingContext to inject theme into varsResolver.
 *
 * Why this exists separately from useTheme:
 * - createStylingContext needs a theme even without a Provider
 *   (components should work standalone for testing / SSR)
 * - Avoids forcing every component to wrap with Provider in tests
 * - The public API (useTheme) still enforces Provider requirement
 */
export function useThemeOptional(): PrismUITheme<string, string> {
  return React.useContext(ThemeContext) ?? defaultTheme;
}
