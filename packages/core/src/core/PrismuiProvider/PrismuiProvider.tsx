'use client';

import { useMemo, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { PrismuiTheme, PrismuiColorScheme, PrismuiResolvedColorScheme } from '../theme';
import type { PrismuiStyleRegistry } from '../style-engine';
import { StyleRegistryProvider } from '../style-engine';
import { PrismuiThemeProvider } from './PrismuiThemeProvider';
import type { PrismuiColorSchemeManager } from './color-scheme-manager';
import { ThemeVars } from '../css-vars';
import { CssBaseline } from '../css-baseline';
import type { PrismuiModule } from '../runtime/types';
import { createRuntimeKernel } from '../runtime/RuntimeKernel';
import { RuntimeContext } from '../runtime/RuntimeContext';

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

  /** When true, all components skip CSS Module classes (global headless mode). @default false */
  headless?: boolean;

  /**
   * Runtime modules to register with the kernel.
   * Modules are set up on mount and torn down on unmount.
   *
   * @example
   * ```tsx
   * <PrismuiProvider modules={[overlayModule(), dialogModule()]}>
   *   <App />
   * </PrismuiProvider>
   * ```
   */
  modules?: PrismuiModule[];
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
  headless = false,
  modules,
}: PrismuiProviderProps) {

  // -- Runtime Kernel -------------------------------------------------------
  // Kernel is created once and stable across re-renders.
  // Module setup runs synchronously so children can access services on first render.
  const kernel = useMemo(() => {
    const k = createRuntimeKernel();
    if (modules && modules.length > 0) {
      modules.forEach((mod) => mod.setup(k));
    }
    return k;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const modulesRef = useRef(modules);
  modulesRef.current = modules;

  // Teardown on unmount
  useEffect(() => {
    return () => {
      const mods = modulesRef.current;
      if (!mods || mods.length === 0) return;
      mods.forEach((mod) => mod.teardown?.());
    };
  }, [kernel]);

  // -- Compose providers ----------------------------------------------------

  const content = (
    <RuntimeContext.Provider value={kernel}>
      <PrismuiThemeProvider
        theme={theme}
        defaultColorScheme={defaultColorScheme}
        forceColorScheme={forceColorScheme}
        colorSchemeManager={colorSchemeManager}
        headless={headless}
      >
        {withCssVars ? <ThemeVars /> : null}
        {withCssBaseline ? <CssBaseline /> : null}
        {children}
      </PrismuiThemeProvider>
    </RuntimeContext.Provider>
  );

  return registry ? (
    <StyleRegistryProvider registry={registry}>
      {content}
    </StyleRegistryProvider>
  ) : (
    content
  );
}
