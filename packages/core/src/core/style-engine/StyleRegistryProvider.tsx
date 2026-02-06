import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { PrismuiStyleRegistry } from './style-registry';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const StyleRegistryContext = createContext<PrismuiStyleRegistry | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export interface StyleRegistryProviderProps {
  registry: PrismuiStyleRegistry;
  children?: ReactNode;
}

/**
 * Makes a `PrismuiStyleRegistry` available to the component tree.
 *
 * In SSR environments, wrap the app with this provider so that
 * `insertCssOnce` can collect CSS into the registry instead of
 * attempting (and failing) to access the DOM.
 *
 * @example
 * ```tsx
 * // Next.js App Router — app/layout.tsx
 * 'use client';
 * import { createStyleRegistry, StyleRegistryProvider } from '@prismui/core';
 *
 * const registry = createStyleRegistry();
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <StyleRegistryProvider registry={registry}>
 *       {children}
 *     </StyleRegistryProvider>
 *   );
 * }
 * ```
 */
export function StyleRegistryProvider({
  registry,
  children,
}: StyleRegistryProviderProps) {
  return (
    <StyleRegistryContext.Provider value={registry}>
      {children}
    </StyleRegistryContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Returns the current `PrismuiStyleRegistry` from context, or `null`
 * if no `StyleRegistryProvider` is present (i.e. running in the browser
 * without SSR).
 */
export function useStyleRegistry(): PrismuiStyleRegistry | null {
  return useContext(StyleRegistryContext);
}
