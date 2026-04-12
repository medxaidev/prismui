import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { PrismUIProvider } from "./provider/PrismUIProvider";
import { defaultTheme } from "./default-theme";
import type { PrismUITheme } from "./types";

// ── Types ──────────────────────────────────────────────────────────────────

/**
 * ColorScheme<S>
 *
 * A valid palette key of the current theme.
 * Generic parameter S constrains the allowed values at the call site.
 *
 * @example
 * type MySchemes = 'light' | 'dark' | 'dim';
 * type Scheme = ColorScheme<MySchemes>; // 'light' | 'dark' | 'dim'
 */
export type ColorScheme<S extends string = string> = S;

/**
 * ColorSchemeStrategy<S>
 *
 * Separates "which palette key" (ColorScheme<S>) from "how to resolve the
 * initial value" ('system' = follow prefers-color-scheme).
 *
 * 'system' is a resolver strategy, not a palette key — it resolves to
 * 'light' or 'dark' at runtime and never appears as a running colorScheme.
 */
export type ColorSchemeStrategy<S extends string = string> = ColorScheme<S> | "system";

export interface ColorSchemeContextValue<S extends string = string> {
  colorScheme: ColorScheme<S>;
  setColorScheme: (scheme: ColorScheme<S>) => void;
  toggleColorScheme: () => void;
}

export interface ColorSchemeProviderProps<S extends string = string> {
  /**
   * The theme to inject. Passed through to PrismUIProvider internally.
   * S must match the palette keys of the theme.
   * Defaults to defaultTheme (S = 'light' | 'dark').
   */
  theme?: PrismUITheme<string, S>;
  /**
   * Initial color scheme strategy.
   * - A palette key (S): use this scheme directly
   * - 'system': resolve from prefers-color-scheme (falls back to 'light')
   * Defaults to 'light'.
   */
  defaultColorScheme?: ColorSchemeStrategy<S>;
  /**
   * Explicit toggle cycle order.
   * toggleColorScheme() cycles through these keys in sequence.
   * Defaults to Object.keys(theme.palette) (insertion order).
   *
   * Use this when palette key insertion order differs from desired toggle order.
   * @example
   * toggleOrder={['light', 'dark', 'dim']}
   */
  toggleOrder?: S[];
  /**
   * localStorage key for persistence.
   * Pass null to disable persistence.
   * Defaults to 'prismui-color-scheme'.
   */
  storageKey?: string | null;
  /**
   * CSS Variables injection target element.
   * Passed through to PrismUIProvider.
   * Defaults to document.documentElement (:root).
   */
  target?: HTMLElement;
  children: React.ReactNode;
}

// ── Constants ──────────────────────────────────────────────────────────────

const DEFAULT_STORAGE_KEY = "prismui-color-scheme";
const DEFAULT_TOGGLE_FALLBACK: [string, string] = ["light", "dark"];

// ── Context ────────────────────────────────────────────────────────────────

// Context stores the widened string variant to avoid generic complexity at
// context creation time. Typed accessors (useColorScheme<S>) re-narrow at
// call site.
export const ColorSchemeContext = createContext<ColorSchemeContextValue<string> | null>(null);

// ── Helpers ────────────────────────────────────────────────────────────────

function resolveInitial<S extends string>(
  defaultColorScheme: ColorSchemeStrategy<S>,
  storageKey: string | null,
): ColorScheme<S> {
  if (typeof window === "undefined") {
    return (defaultColorScheme === "system" ? "light" : defaultColorScheme) as ColorScheme<S>;
  }
  if (storageKey) {
    const stored = localStorage.getItem(storageKey);
    if (stored) return stored as ColorScheme<S>;
  }
  if (defaultColorScheme === "system") {
    return (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") as ColorScheme<S>;
  }
  return defaultColorScheme as ColorScheme<S>;
}

// ── Provider ───────────────────────────────────────────────────────────────

export function ColorSchemeProvider<S extends string = string>({
  theme = defaultTheme as unknown as PrismUITheme<string, S>,
  defaultColorScheme = "light" as ColorSchemeStrategy<S>,
  toggleOrder,
  storageKey = DEFAULT_STORAGE_KEY,
  target,
  children,
}: ColorSchemeProviderProps<S>) {
  const [colorScheme, setColorSchemeState] = useState<ColorScheme<S>>(() =>
    resolveInitial(defaultColorScheme, storageKey),
  );

  // System preference listener (only when defaultColorScheme = 'system' and no stored value)
  useEffect(() => {
    if (defaultColorScheme !== "system") return;
    if (storageKey && localStorage.getItem(storageKey)) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) =>
      setColorSchemeState((e.matches ? "dark" : "light") as ColorScheme<S>);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [defaultColorScheme, storageKey]);

  const setColorScheme = useCallback(
    (scheme: ColorScheme<S>) => {
      setColorSchemeState(scheme);
      if (storageKey) {
        try {
          localStorage.setItem(storageKey, scheme);
        } catch {
          // localStorage may be unavailable (private mode, quota exceeded)
        }
      }
    },
    [storageKey],
  );

  // toggleColorScheme cycles through toggleOrder if provided,
  // otherwise falls back to Object.keys(theme.palette) (insertion order),
  // then to ['light', 'dark'] if palette has fewer than 2 keys.
  const paletteKeys = toggleOrder ??
    (Object.keys(theme.palette as Record<string, unknown>) as S[]);
  const toggleColorScheme = useCallback(() => {
    const keys = paletteKeys.length >= 2 ? paletteKeys : DEFAULT_TOGGLE_FALLBACK as unknown as S[];
    const idx = keys.indexOf(colorScheme);
    setColorScheme(keys[(idx + 1) % keys.length] as ColorScheme<S>);
  }, [colorScheme, paletteKeys, setColorScheme]);

  const value: ColorSchemeContextValue<S> = { colorScheme, setColorScheme, toggleColorScheme };

  return (
    <ColorSchemeContext.Provider value={value as unknown as ColorSchemeContextValue<string>}>
      <PrismUIProvider theme={theme as PrismUITheme<string, string>} colorScheme={colorScheme} target={target}>
        {children}
      </PrismUIProvider>
    </ColorSchemeContext.Provider>
  );
}

// ── Hooks ──────────────────────────────────────────────────────────────────

/**
 * useColorScheme<S>
 *
 * Read and control the current color scheme.
 * MUST be used within <ColorSchemeProvider>.
 *
 * Generic S narrows setColorScheme to only accept valid palette keys:
 * @example
 * const { setColorScheme } = useColorScheme<'light' | 'dark' | 'dim'>();
 * setColorScheme('dim');  // ✅
 * setColorScheme('abc');  // ❌ TS error
 */
export function useColorScheme<S extends string = string>(): ColorSchemeContextValue<S> {
  const ctx = useContext(ColorSchemeContext);
  if (!ctx) {
    throw new Error(
      "[PrismUI] useColorScheme must be used within <ColorSchemeProvider>. " +
      "Wrap your application with <ColorSchemeProvider>.",
    );
  }
  return ctx as unknown as ColorSchemeContextValue<S>;
}

/**
 * useColorSchemeOptional
 *
 * Internal: read colorScheme without throwing.
 * Falls back to 'light' when used outside ColorSchemeProvider.
 */
export function useColorSchemeOptional(): string {
  return useContext(ColorSchemeContext)?.colorScheme ?? "light";
}
