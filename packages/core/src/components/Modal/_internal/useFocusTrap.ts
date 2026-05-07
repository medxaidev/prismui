/**
 * Stage-11 Phase 7a · Modal · `_internal/useFocusTrap`
 *
 * Authority: ADR-007 决策 1-3 + OV-MODAL-1 invariant.
 *
 * Self-built focus-trap hook — Modal-local, not promoted to system layer
 * (`core/focus/`) until Phase 9 Dropdown / Phase 10 DatePicker validate
 * cross-component reuse (ADR-007 决策 1 升格路径)。
 *
 * **OV-MODAL-1 三子合约**:
 *   1. **Tab cycle** — Tab at last tabbable → first; Shift+Tab at first → last.
 *   2. **Auto-focus** — on `active` flip `false → true`, focus
 *      `initialFocusRef.current` if provided & inside container & tabbable;
 *      otherwise the first tabbable; fallback container itself with
 *      `tabIndex=-1` programmatic focus.
 *   3. **Return-focus** — on `active` flip `true → false`, focus
 *      `returnFocusRef.current` if provided; otherwise the element that had
 *      focus immediately before activation (captured at activation time).
 *
 * **Strict-Mode safety**:
 *   - Activation snapshot lives in a ref (not state) so the React 18 / 19
 *     double-invoke pattern `effect → cleanup → effect` does NOT lose the
 *     pre-activation focus pointer.
 *   - Listener add/remove is symmetric; a duplicate add no-ops because the
 *     inner ref already holds the same handler instance.
 *
 * **Empty-tabbable fallback**:
 *   - When the container has zero tabbable descendants we focus the
 *     container itself. Caller is responsible for ensuring the container
 *     element accepts focus (Phase 7b Modal.Content sets `tabIndex={-1}`).
 *
 * **NOT in scope (v1)**:
 *   - iframe / shadow DOM trap escapees — see `tabbable.ts` header.
 *   - Mutation-observed dynamic tabbable list — we re-query on every Tab
 *     keypress, which is sufficient for typical Modal content (button
 *     enable/disable mid-modal).
 *   - portalled descendants outside `containerRef.current` (议题 E asChild
 *     covers this only via the root container; portalled trap content is
 *     a v1.x consideration).
 */

import { useEffect, useRef, type RefObject } from 'react';
import { getTabbables } from './tabbable';

export interface UseFocusTrapOptions {
  /** Whether the trap is engaged. `false` → no-op + restore prior focus. */
  active: boolean;
  /** The element whose descendants form the trap region (typically Modal.Content). */
  containerRef: RefObject<HTMLElement | null>;
  /**
   * Optional explicit initial-focus target (OQ-MODAL-7 / 决策 2 — ref-based,
   * not callback). Must be a descendant of `containerRef`. If not present in
   * the DOM at activation time, falls back to the first tabbable.
   */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /**
   * Optional explicit return-focus target. Defaults to the element that had
   * focus immediately before the trap activated (typically the trigger).
   * Phase 7b Modal.Trigger registers itself via openerRef; this hook does
   * NOT depend on that registration — it observes `document.activeElement`
   * directly.
   */
  returnFocusRef?: RefObject<HTMLElement | null>;
}

export function useFocusTrap(options: UseFocusTrapOptions): void {
  const { active, containerRef, initialFocusRef, returnFocusRef } = options;

  // Pre-activation focus snapshot. Ref (not state) so it survives Strict-
  // Mode double effect invocation without re-rendering.
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;

    const container = containerRef.current;
    if (container === null) return;

    // ── 1. Snapshot pre-activation focus ──────────────────────────────
    const activeEl = (container.ownerDocument ?? document).activeElement;
    previouslyFocusedRef.current =
      activeEl instanceof HTMLElement && activeEl !== document.body ? activeEl : null;

    // ── 2. Auto-focus initial target ──────────────────────────────────
    const initialEl = initialFocusRef?.current ?? null;
    if (initialEl !== null && container.contains(initialEl)) {
      initialEl.focus();
    } else {
      const tabbables = getTabbables(container);
      if (tabbables.length > 0) {
        tabbables[0].focus();
      } else {
        // Empty-tabbable fallback — container itself receives programmatic
        // focus. Phase 7b Modal.Content sets tabIndex=-1 to accept this.
        container.focus();
      }
    }

    // ── 3. Tab cycle keydown handler ──────────────────────────────────
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Tab') return;
      const tabbables = getTabbables(container);
      if (tabbables.length === 0) {
        // Container is the only focusable element — keep focus there.
        event.preventDefault();
        container.focus();
        return;
      }

      const first = tabbables[0];
      const last = tabbables[tabbables.length - 1];
      const current = (container.ownerDocument ?? document).activeElement;

      if (event.shiftKey) {
        // Shift+Tab at first (or focus outside container) → last.
        if (current === first || !container.contains(current)) {
          event.preventDefault();
          last.focus();
        }
      } else {
        // Tab at last (or focus outside container) → first.
        if (current === last || !container.contains(current)) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    container.addEventListener('keydown', onKeyDown);

    // ── 4. Cleanup · listener removal + return-focus ──────────────────
    return () => {
      container.removeEventListener('keydown', onKeyDown);

      const returnTarget = returnFocusRef?.current ?? previouslyFocusedRef.current;
      if (returnTarget !== null && returnTarget.isConnected) {
        // Defer one frame to avoid clashing with React's commit phase in
        // strict mode + Stage-12 Presence exit transition.
        // (Synchronous focus during unmount can trigger blur events on
        // already-detached nodes in some browsers.)
        queueMicrotask(() => {
          if (returnTarget.isConnected) returnTarget.focus();
        });
      }
      previouslyFocusedRef.current = null;
    };
    // initialFocusRef / returnFocusRef are refs — referential stability is
    // the caller's contract (mirrors React's own ref pattern). Only `active`
    // and `containerRef` participate in re-engagement.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, containerRef]);
}
