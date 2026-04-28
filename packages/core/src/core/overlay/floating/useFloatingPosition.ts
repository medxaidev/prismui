/**
 * Stage-11 · L0 Overlay Foundation · Floating · `useFloatingPosition` hook
 *
 * Contract: `@/devdocs/system/floating-primitive.md` v0.1.2 §2.1 + §五 + §七
 *
 * One of the 3 vendor-touch files (§3.1):
 *   · useFloatingPosition.ts  ← this file (vendor `useFloating` + `autoUpdate`)
 *   · buildDefaultMiddleware.ts
 *   · middleware.ts
 *
 * Behaviour summary:
 *   · No `middleware` option → injects `buildDefaultMiddleware()` (OV-FLOAT-2).
 *   · `enabled: false` → installs no `autoUpdate` loop · returns inert styles
 *     (§2.1 docstring · F-1 secondary test).
 *   · `zIndex` is sourced from `theme.zIndex.{zIndexLevel}` (OV-FLOAT-3).
 *     Falls back to a built-in default + DEV warn when the token is missing
 *     (defensive · §10.5 secondary).
 */

import { useMemo } from 'react';
import {
  useFloating,
  autoUpdate,
  type Middleware,
} from '@floating-ui/react';

import { useThemeOptional } from '../../theme';
import { buildDefaultMiddleware } from './buildDefaultMiddleware';
import type {
  FloatingMiddleware,
  FloatingPlacement,
  FloatingReference,
  FloatingStrategy,
} from './types';

// ─────────────────────────────────────────────────────────────────────────────
// Public option / result types
// ─────────────────────────────────────────────────────────────────────────────

export type FloatingZIndexLevel = 'tooltip' | 'popover' | 'modal' | 'toast';

export interface UseFloatingPositionOptions {
  /** Floating placement · default `'bottom-start'`. */
  placement?: FloatingPlacement;
  /** Positioning strategy · default `'absolute'`. */
  strategy?: FloatingStrategy;
  /** Toggle floating positioning · default `true`. */
  enabled?: boolean;
  /**
   * Custom middleware chain (FULLY replaces the default chain · NOT merged).
   * Use `buildDefaultMiddleware()` to preserve OV-FLOAT-2 hard-required items.
   */
  middleware?: FloatingMiddleware[];
  /** Z-index token level · default `'popover'` (OV-FLOAT-3). */
  zIndexLevel?: FloatingZIndexLevel;
}

export interface UseFloatingPositionRefs {
  setReference: (node: FloatingReference | null) => void;
  setFloating: (node: HTMLElement | null) => void;
}

export interface UseFloatingPositionResult {
  refs: UseFloatingPositionRefs;
  floatingStyles: React.CSSProperties;
  placement: FloatingPlacement;
  middlewareData: Record<string, unknown>;
  update: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Built-in z-index fallback · used only when theme token is missing.
// Mirrors `defaultTheme.zIndex` so values stay consistent with the source.
// ─────────────────────────────────────────────────────────────────────────────

const FALLBACK_Z_INDEX: Record<FloatingZIndexLevel, number> = {
  tooltip: 1500,
  popover: 1300,
  modal: 1400,
  toast: 1600,
};

let warnedMissingZIndex = false;

function resolveZIndex(
  themeZIndex: Partial<Record<FloatingZIndexLevel, number>> | undefined,
  level: FloatingZIndexLevel,
): number {
  const value = themeZIndex?.[level];
  if (typeof value === 'number') return value;

  if (process.env.NODE_ENV !== 'production' && !warnedMissingZIndex) {
    warnedMissingZIndex = true;
    // eslint-disable-next-line no-console
    console.warn(
      `[PrismUI] useFloatingPosition: theme.zIndex.${level} is missing · ` +
        `falling back to ${FALLBACK_Z_INDEX[level]}. Define theme.zIndex on your ` +
        `PrismUITheme to silence this warning.`,
    );
  }
  return FALLBACK_Z_INDEX[level];
}

// DEV helper · reset latch for test isolation.
export function __resetFloatingZIndexWarn(): void {
  warnedMissingZIndex = false;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useFloatingPosition(
  options?: UseFloatingPositionOptions,
): UseFloatingPositionResult {
  const {
    placement = 'bottom-start',
    strategy = 'absolute',
    enabled = true,
    middleware,
    zIndexLevel = 'popover',
  } = options ?? {};

  const theme = useThemeOptional();

  // Build default chain when caller didn't supply one. Memoised so vendor
  // doesn't re-evaluate middleware identity on every render.
  const middlewareToUse = useMemo<FloatingMiddleware[]>(
    () => middleware ?? buildDefaultMiddleware(),
    [middleware],
  );

  const {
    refs,
    floatingStyles,
    placement: actualPlacement,
    middlewareData,
    update,
  } = useFloating({
    placement,
    strategy,
    middleware: middlewareToUse as unknown as Middleware[],
    // OV-FLOAT-2 / F-1 · install autoUpdate only when enabled · disabling
    // stops the rAF loop after close (`floatingStyles` becomes stable).
    whileElementsMounted: enabled ? autoUpdate : undefined,
  });

  const zIndex = resolveZIndex(
    (theme as { zIndex?: Partial<Record<FloatingZIndexLevel, number>> }).zIndex,
    zIndexLevel,
  );

  // Merge zIndex into vendor's floatingStyles. Memoised for referential
  // stability (F-1 secondary · prevents downstream React.memo invalidation).
  const styles = useMemo<React.CSSProperties>(
    () => ({ ...floatingStyles, zIndex }),
    [floatingStyles, zIndex],
  );

  // Adapt vendor refs to PrismUI typed surface. Vendor accepts
  // `Element | VirtualElement | null`, our type is structurally compatible.
  const adaptedRefs = useMemo<UseFloatingPositionRefs>(
    () => ({
      setReference: refs.setReference as (node: FloatingReference | null) => void,
      setFloating: refs.setFloating,
    }),
    [refs],
  );

  return {
    refs: adaptedRefs,
    floatingStyles: styles,
    placement: actualPlacement as FloatingPlacement,
    middlewareData: middlewareData as Record<string, unknown>,
    update,
  };
}
