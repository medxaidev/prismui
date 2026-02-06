import { useState, useCallback, useEffect, useRef } from 'react';
import type { PrismuiColorScheme, PrismuiResolvedColorScheme } from '../../theme';
import type { PrismuiColorSchemeManager } from '../color-scheme-manager';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveScheme(scheme: PrismuiColorScheme): PrismuiResolvedColorScheme {
  if (scheme !== 'auto') return scheme;
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
  return 'light';
}

function setColorSchemeAttribute(colorScheme: PrismuiResolvedColorScheme) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-prismui-color-scheme', colorScheme);
  }
}

// ---------------------------------------------------------------------------
// Hook options
// ---------------------------------------------------------------------------

export interface UseProviderColorSchemeOptions {
  /** Color scheme manager for persistence / cross-tab sync. `null` to disable. */
  manager: PrismuiColorSchemeManager | null;
  /** Default color scheme when no persisted value exists. */
  defaultColorScheme: PrismuiColorScheme;
  /** Force a specific color scheme, ignoring user toggle and persistence. */
  forceColorScheme?: PrismuiResolvedColorScheme;
}

// ---------------------------------------------------------------------------
// Hook return
// ---------------------------------------------------------------------------

export interface UseProviderColorSchemeReturn {
  /** The current resolved color scheme ('light' | 'dark'). */
  colorScheme: PrismuiResolvedColorScheme;
  /** Update the color scheme. Persists via manager and updates DOM attribute. */
  setColorScheme: (scheme: PrismuiColorScheme) => void;
  /** Reset to the default color scheme. */
  clearColorScheme: () => void;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Manages color scheme state with optional persistence, cross-tab sync,
 * system preference tracking, and DOM attribute updates.
 *
 * Sets `data-prismui-color-scheme` on `document.documentElement`.
 */
export function useProviderColorScheme({
  manager,
  defaultColorScheme,
  forceColorScheme,
}: UseProviderColorSchemeOptions): UseProviderColorSchemeReturn {
  // ---- initial state -------------------------------------------------------

  const [value, setValue] = useState<PrismuiColorScheme>(() => {
    if (manager) {
      return manager.get(defaultColorScheme);
    }
    return defaultColorScheme;
  });

  // The effective resolved scheme (respects forceColorScheme)
  const resolvedScheme = forceColorScheme ?? resolveScheme(value);

  // ---- setColorScheme ------------------------------------------------------

  const setColorScheme = useCallback(
    (scheme: PrismuiColorScheme) => {
      if (forceColorScheme) return; // forced — ignore user toggle
      setValue(scheme);
      manager?.set(scheme);
      setColorSchemeAttribute(resolveScheme(scheme));
    },
    [forceColorScheme, manager],
  );

  // ---- clearColorScheme ----------------------------------------------------

  const clearColorScheme = useCallback(() => {
    setValue(defaultColorScheme);
    manager?.set(defaultColorScheme);
    setColorSchemeAttribute(resolveScheme(defaultColorScheme));
  }, [defaultColorScheme, manager]);

  // ---- sync DOM attribute on mount & value/force changes -------------------

  useEffect(() => {
    setColorSchemeAttribute(resolvedScheme);
  }, [resolvedScheme]);

  // ---- cross-tab sync via manager.subscribe --------------------------------

  useEffect(() => {
    if (!manager || forceColorScheme) return undefined;

    const unsubscribe = manager.subscribe((newValue) => {
      setValue(newValue);
      setColorSchemeAttribute(resolveScheme(newValue));
    });

    return unsubscribe;
  }, [manager, forceColorScheme]);

  // ---- system preference (prefers-color-scheme) tracking -------------------

  const mediaRef = useRef<MediaQueryList | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;

    mediaRef.current = window.matchMedia('(prefers-color-scheme: dark)');

    const listener = () => {
      // Only react to system changes when the current value is 'auto'
      if (value === 'auto') {
        setColorSchemeAttribute(resolveScheme('auto'));
      }
    };

    mediaRef.current.addEventListener('change', listener);
    return () => mediaRef.current?.removeEventListener('change', listener);
  }, [value]);

  // ---- return --------------------------------------------------------------

  return { colorScheme: resolvedScheme, setColorScheme, clearColorScheme };
}
