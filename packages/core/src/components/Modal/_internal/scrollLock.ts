/**
 * Stage-11 Phase 7a · Modal · `_internal/scrollLock`
 *
 * Authority: ADR-007 决策 5 + Hypothesis H1 + ROUND-0 §A.1 OQ-MODAL-2 路径 A.
 *
 * Vendor `react-remove-scroll` ^2.6.0 thin re-export. The component pattern
 * (NOT a hook) is the natural shape vendor exposes — Phase 7b Modal.Content
 * will wrap children with this helper. We keep this `_internal/` re-export
 * stable so vendor swaps (e.g. v1.x H1 升 invariant 后切换实现) don't ripple
 * into Phase 7b consumer code.
 *
 * **Phase 7a placeholder name dissolution note**:
 * ROUND-0 §5.2 originally named the deliverable `useScrollLock` (hook).
 * Decision 5 (vendor `react-remove-scroll`) renders the hook shape un-
 * natural — vendor exposes a `<RemoveScroll>` component, not a hook. We
 * therefore deliver `<ModalScrollLock>` component (this file) instead of
 * a hook; the substantive deliverable (Modal-internal scroll-lock primitive)
 * is unchanged. ADR-007 audit log 2026-05-08 Phase 7a 启动 entry records
 * this dissolution in detail.
 *
 * **API contract**:
 *   - `<ModalScrollLock active>{children}</ModalScrollLock>` — wraps
 *     children with vendor's lock when `active`, otherwise renders
 *     `<>{children}</>` (zero overhead).
 *   - `removeScrollBar={true}` (vendor default) — compensates scrollbar
 *     gutter to prevent CLS spike (PR-LOCK-2 mitigation).
 *   - `inert={false}` — Modal owns inertness (议题 A useFocusTrap +
 *     议题 D nested ESC stack); we don't double-lock interaction.
 *   - `enabled` is the vendor prop name; we expose `active` to match
 *     PrismUI conventions (Stage-12 Presence `present`, useFocusTrap
 *     `active`). One-to-one passthrough.
 *
 * NOT public — `_internal/` private. Phase 7b Modal compound directly
 * imports this and composes inside Modal.Content.
 */

import { createElement, Fragment, type ReactElement, type ReactNode } from 'react';
import { RemoveScroll } from 'react-remove-scroll';

export interface ModalScrollLockProps {
  /** When `false`, renders children unwrapped. */
  active: boolean;
  children: ReactNode;
}

export function ModalScrollLock({ active, children }: ModalScrollLockProps): ReactElement {
  if (!active) return createElement(Fragment, null, children);
  // `removeScrollBar` defaults true in vendor — explicit for documentation.
  // `inert` left default (false) — Modal owns interactivity gating.
  // `children` is part of vendor's props type (not a third createElement arg).
  return createElement(RemoveScroll, {
    enabled: true,
    removeScrollBar: true,
    children,
  });
}
