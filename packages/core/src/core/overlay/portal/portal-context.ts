/**
 * Stage-11 · L0 Overlay Foundation · Portal · internal context
 *
 * Contract: `@/devdocs/system/portal-primitive.md` §2.4
 *
 * NOTE: This module is INTERNAL — not re-exported from `index.ts`.
 *       Public surface = { Portal, usePortalContainer, OverlayProvider }.
 *
 * Type widening (v0.1.1 P1-1 fix): `Element | DocumentFragment` aligns with
 * React `createPortal(children, container: Element | DocumentFragment, ...)`
 * and covers ShadowRoot (ShadowRoot ⊂ DocumentFragment).
 */

import { createContext } from 'react';

export type PortalContainerSource =
  | Element
  | DocumentFragment
  | (() => Element | DocumentFragment | null);

export interface PortalContextValue {
  container: PortalContainerSource | undefined;
}

const DEFAULT_PORTAL_CONTEXT_VALUE: PortalContextValue = { container: undefined };

export const PortalContext = createContext<PortalContextValue>(DEFAULT_PORTAL_CONTEXT_VALUE);
