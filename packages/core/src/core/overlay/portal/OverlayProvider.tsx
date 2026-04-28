/**
 * Stage-11 · L0 Overlay Foundation · Portal · `OverlayProvider`
 *
 * Contract: `@/devdocs/system/portal-primitive.md` §2.3 + §4.3
 *
 * Optional Context wrapper providing a default `container` to descendant
 * <Portal> instances. Round 1 议题 B 决议:
 *   · Pure context bridge — no effect, no state, no side effects.
 *   · NOT a singleton.
 *   · NOT an imperative controller (no `getOpenOverlays` / `closeAll` etc.).
 *   · NO global event bus.
 *
 * Nesting semantics: inner provider overrides outer (React Context standard).
 */

import { useMemo, type ReactElement, type ReactNode } from 'react';

import {
  PortalContext,
  type PortalContainerSource,
  type PortalContextValue,
} from './portal-context';

export interface OverlayProviderProps {
  /**
   * Default portal container for descendant <Portal> elements without an
   * explicit `container` prop. Accepts `Element | DocumentFragment` or a lazy
   * callback returning either.
   */
  container?: PortalContainerSource;
  children: ReactNode;
}

export function OverlayProvider({ container, children }: OverlayProviderProps): ReactElement {
  const value = useMemo<PortalContextValue>(() => ({ container }), [container]);
  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>;
}
