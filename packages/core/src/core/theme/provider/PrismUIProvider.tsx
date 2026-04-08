import React, { useLayoutEffect, useRef } from "react";
import { defaultTheme } from "../default-theme";
import { ThemeContext } from "../context/theme.context";
import {
  generateCSSVariables,
  applyDiffCSSVariables,
} from "../context/css-variables";
import type { PrismUITheme } from "../types";

export interface PrismUIProviderProps {
  /**
   * The theme to inject. Must be a complete PrismUITheme (no merge).
   * Defaults to defaultTheme.
   */
  theme?: PrismUITheme;

  /**
   * Which palette set to use for CSS Variables generation.
   * Controls whether palette.light or palette.dark is used.
   * Defaults to 'light'.
   */
  colorScheme?: "light" | "dark";

  /**
   * CSS Variables injection target element.
   * Defaults to document.documentElement (:root) for global scope.
   *
   * Advanced: pass a specific HTMLElement to scope variables to a subtree.
   * This enables multiple independent PrismUIProviders with different themes
   * on the same page (multi-theme isolation).
   *
   * @example
   * // Default: inject to :root (global, works with Portals)
   * <PrismUIProvider theme={theme} />
   *
   * // Advanced: inject to a specific container (multi-theme)
   * <PrismUIProvider theme={themeA} target={containerA} />
   * <PrismUIProvider theme={themeB} target={containerB} />
   */
  target?: HTMLElement;

  children: React.ReactNode;
}

/**
 * PrismUIProvider
 *
 * Injects PrismUITheme into React context and generates CSS Variables.
 *
 * Design decisions:
 * - No DOM wrapper produced (pure Context + side-effect)
 * - CSS Variables injected via useLayoutEffect (before paint, avoids FOUC)
 * - Diff update: only setProperty for changed variables
 * - target cleanup: old target variables cleared when target changes
 * - Default target: document.documentElement (:root) for global CSS Variable scope
 */
export function PrismUIProvider({
  theme = defaultTheme,
  colorScheme = "light",
  target,
  children,
}: PrismUIProviderProps) {
  // INTERNAL CACHE — do not rely on identity
  // Tracks previous CSS variable map for diff update (setProperty only on changes)
  const prevVarsRef = useRef<Record<string, string>>({});
  // Tracks previous injection target for cleanup on target change
  const prevTargetRef = useRef<HTMLElement | null>(null);

  // useLayoutEffect (not useEffect):
  // CSS Variables must be applied before paint to avoid FOUC.
  // useEffect (after paint) would cause: initial render → default styles → vars applied → flash.
  useLayoutEffect(() => {
    const element = target ?? document.documentElement;

    // Clean up old target when target changes.
    // Without this, switching from target=A to target=B leaves stale variables on A.
    // This is critical for multi-theme isolation correctness.
    if (prevTargetRef.current && prevTargetRef.current !== element) {
      applyDiffCSSVariables(prevTargetRef.current, {}, prevVarsRef.current);
      // Reset cache: new target has no previously-applied variables
      prevVarsRef.current = {};
    }

    const next = generateCSSVariables(theme, colorScheme);
    applyDiffCSSVariables(element, next, prevVarsRef.current);
    prevVarsRef.current = next;
    prevTargetRef.current = element;
  }, [theme, colorScheme, target]);

  // No DOM wrapper — pure Context + side-effect only
  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}
