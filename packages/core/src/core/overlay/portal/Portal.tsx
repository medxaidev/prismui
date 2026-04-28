/**
 * Stage-11 · L0 Overlay Foundation · Portal · component
 *
 * Contract: `@/devdocs/system/portal-primitive.md` §2.1 + §四
 *
 * Renders children into the resolved container via `ReactDOM.createPortal`.
 * Returns `null` on SSR / pre-mount (OV-PORTAL-2).
 *
 * Children retain access to parent React context — this is a React kernel
 * guarantee documented at react.dev/reference/react-dom/createPortal.
 * OV-PORTAL-3 was withdrawn in Round 1 (see ADR-003 Decision 2) and is
 * intentionally NOT re-asserted as a PrismUI-level invariant.
 *
 * Portal carries no DOM of its own:
 *   · No wrapper element.
 *   · No `ref` (forwarding would be misleading).
 *   · No className / style / data-* props.
 */

import type { ReactNode, ReactPortal } from 'react';
import { createPortal } from 'react-dom';

import { usePortalContainer } from './usePortalContainer';
import type { PortalContainerSource } from './portal-context';

export interface PortalProps {
  /**
   * Target container. Falls back per OV-PORTAL-1 cascade:
   *   1. this prop  →  2. OverlayProvider.container  →  3. document.body
   *
   * Accepts `Element | DocumentFragment` (ShadowRoot is supported as a
   * DocumentFragment subclass).
   */
  container?: PortalContainerSource;
  children: ReactNode;
}

export function Portal({ container, children }: PortalProps): ReactPortal | null {
  const resolved = usePortalContainer({ container });
  if (resolved == null) return null;
  return createPortal(children, resolved);
}
