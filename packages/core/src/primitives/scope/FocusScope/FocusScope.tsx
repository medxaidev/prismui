import * as React from 'react';

/**
 * `<FocusScope>` — Stage-15 Phase 2 Behavior Scope primitive · keyboard
 * focus trap with focus restoration on unmount.
 *
 * Contracts (see `@/devdocs/stage/STAGE-15-OVERVIEW.md` §3.7 + ADR-006):
 *
 *   - **LY-SCOPE-1** — on mount, save `document.activeElement` (the
 *     "trigger") and move focus to the first tabbable inside the scope.
 *     Tab / Shift+Tab beyond the scope boundary wraps back to the
 *     opposite end (focus is "trapped"). On unmount, restore focus to
 *     the saved trigger. Does NOT introduce a wrapper element around
 *     `children` ("内部无 DOM wrapper") and explicitly does NOT handle
 *     escape key / outside-click dismissal — those are Stage-11
 *     Dismissal's responsibility.
 *   - **LY-SCOPE-5** — produces no VISIBLE DOM and does not disrupt
 *     CSS layout. The two sentinel guard `<span>` elements added at the
 *     scope boundary are bracket peers (not wrappers around children),
 *     visually invisible (`opacity: 0` · `pointer-events: none`), and
 *     out of flow (`position: fixed` · `width/height: 1px`). They are
 *     the minimum intrusion needed to detect focus escape without
 *     wrapping consumer DOM.
 *
 * ## Why sentinel guards (and not a wrapper div / a keydown listener)?
 *
 *   - **A wrapper `<div>`** would violate LY-SCOPE-1 explicitly ("不加
 *     div"). It would also disrupt CSS layout (consumer expects a
 *     bare child structure inside their Modal/Dialog panel).
 *   - **A document-level Tab keydown listener** sounds non-intrusive,
 *     but cannot reliably define "the scope boundary" without a
 *     wrapper. It also fights the browser's natural focus chain
 *     (preventDefault + manual `.focus()`), which screen-reader users
 *     can perceive as discontinuous.
 *   - **Sentinel guards** let the browser's own focus engine drive Tab
 *     traversal: when focus naturally moves out of the last in-scope
 *     tabbable, it lands on `endGuard` (a tabIndex=0 sibling), whose
 *     `onFocus` redirects to `startGuard.nextTabbable`. Same for
 *     Shift+Tab from the first tabbable → `startGuard` → wrap to
 *     `endGuard.prevTabbable`. This is also Radix's approach, validated
 *     across screen readers and browsers.
 *
 * ## Strict-mode + double-mount semantics
 *
 * `triggerRef` is a `useRef`, which persists across React 18 strict-mode
 * mount → cleanup → mount cycles. The cleanup of the transient first
 * mount calls `.focus()` on the trigger; the second mount then re-saves
 * `document.activeElement` (which is now the trigger again) and re-runs
 * initial-focus. Net result: identical to a single mount. Real unmount
 * also restores correctly because cleanup always runs last.
 */

// ── Tabbable detection ──────────────────────────────────────────────────────

/**
 * CSS selector for elements that are POTENTIALLY tabbable. The selector
 * is intentionally permissive (e.g. matches all `[tabindex]`); the
 * `isTabbable` predicate below applies the precise rules (negative
 * tabindex / disabled / hidden filtering).
 *
 * Order is irrelevant — we filter and re-sort in document order via
 * `compareDocumentPosition`.
 */
const TABBABLE_SELECTOR = [
  'a[href]',
  'button',
  'input',
  'select',
  'textarea',
  '[tabindex]',
  '[contenteditable=""]',
  '[contenteditable="true"]',
].join(',');

function isTabbable(el: HTMLElement): boolean {
  // `disabled` form controls are not tabbable.
  if ((el as HTMLInputElement).disabled === true) return false;
  // Hidden inputs are never tabbable.
  if (el instanceof HTMLInputElement && el.type === 'hidden') return false;
  // Negative tabindex opts out of tab order.
  const tabindexAttr = el.getAttribute('tabindex');
  if (tabindexAttr !== null && parseInt(tabindexAttr, 10) < 0) return false;
  // Visibility check — only consider the element's OWN computed style
  // (`display: none` / `visibility: hidden`). We deliberately do NOT
  // walk ancestors here:
  //   - In real browsers, `.focus()` on an element inside a hidden
  //     ancestor is a no-op anyway, so a stale entry in the tabbable
  //     list degrades gracefully (focus stays where it was).
  //   - The classic ancestor-walk approximation (`offsetParent === null`)
  //     is unreliable in JSDOM (no layout engine → offsetParent is
  //     always null), which would falsely reject every tabbable in
  //     test environments. The own-style check is correct in both.
  if (typeof window !== 'undefined') {
    const cs = window.getComputedStyle(el);
    if (cs.display === 'none') return false;
    if (cs.visibility === 'hidden' || cs.visibility === 'collapse') return false;
  }
  return true;
}

/**
 * Collects every tabbable element strictly between `start` and `end`
 * sentinel guards, in document order. The guards themselves are
 * filtered out. The shared parent of the two guards defines the
 * candidate root — we never walk outside it, so a portal that escapes
 * to `body` is naturally not part of the scope.
 */
function getTabbableInScope(start: HTMLElement, end: HTMLElement): HTMLElement[] {
  const root = start.parentElement;
  if (root === null) return [];
  const candidates = Array.from(root.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR));
  return candidates.filter((el) => {
    if (el === start || el === end) return false;
    const posVsStart = start.compareDocumentPosition(el);
    const posVsEnd = end.compareDocumentPosition(el);
    return (
      (posVsStart & Node.DOCUMENT_POSITION_FOLLOWING) !== 0 &&
      (posVsEnd & Node.DOCUMENT_POSITION_PRECEDING) !== 0 &&
      isTabbable(el)
    );
  });
}

// ── Sentinel guards ─────────────────────────────────────────────────────────

const GUARD_STYLE: React.CSSProperties = {
  // `position: fixed` removes the guard from normal flow (LY-SCOPE-5
  // "不干扰 CSS layout"). Anchored at top:0 left:0 so SR cursor remains
  // near the visual content if it momentarily reads the guard.
  position: 'fixed',
  top: 0,
  left: 0,
  width: 1,
  height: 1,
  // Fully transparent + non-interactive to mouse — pure focus trap.
  opacity: 0,
  pointerEvents: 'none',
};

// ── Component ───────────────────────────────────────────────────────────────

export interface FocusScopeProps {
  /** Children are rendered between the two guard sentinels (no wrapper). */
  children?: React.ReactNode;
}

export function FocusScope(props: FocusScopeProps): React.ReactElement {
  const { children } = props;
  const startGuardRef = React.useRef<HTMLSpanElement | null>(null);
  const endGuardRef = React.useRef<HTMLSpanElement | null>(null);
  const triggerRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    // ── Save trigger ────────────────────────────────────────────────────
    // Use the active element AT MOUNT as the restoration target. If
    // that element no longer exists at unmount time (DOM removed), we
    // simply skip the restore — focus naturally falls back to body,
    // which is the browser's default behaviour.
    const active = (typeof document !== 'undefined'
      ? (document.activeElement as HTMLElement | null)
      : null);
    triggerRef.current = active;

    // ── Initial focus ───────────────────────────────────────────────────
    // Move focus to the first tabbable in scope. If the scope contains
    // no tabbable element (rare for an overlay surface), focus the
    // start guard so subsequent Tab moves to the first focusable
    // descendant of whatever consumer eventually adds.
    const startGuard = startGuardRef.current;
    const endGuard = endGuardRef.current;
    if (startGuard !== null && endGuard !== null) {
      const tabbables = getTabbableInScope(startGuard, endGuard);
      if (tabbables.length > 0) {
        tabbables[0].focus();
      }
    }

    return () => {
      // ── Restore focus ─────────────────────────────────────────────────
      const trigger = triggerRef.current;
      triggerRef.current = null;
      if (trigger !== null && typeof trigger.focus === 'function') {
        // Guard against a detached trigger (e.g. consumer removed the
        // button that opened the dialog). `.focus()` on a detached
        // element is a no-op in modern browsers but throws in some
        // legacy environments — wrap defensively.
        try {
          trigger.focus();
        } catch {
          /* swallow · focus restore is best-effort */
        }
      }
    };
  }, []);

  const handleStartGuardFocus = React.useCallback(() => {
    // Shift+Tab from the first in-scope tabbable lands here. Wrap to
    // the LAST in-scope tabbable.
    const startGuard = startGuardRef.current;
    const endGuard = endGuardRef.current;
    if (startGuard === null || endGuard === null) return;
    const tabbables = getTabbableInScope(startGuard, endGuard);
    if (tabbables.length > 0) {
      tabbables[tabbables.length - 1].focus();
    }
  }, []);

  const handleEndGuardFocus = React.useCallback(() => {
    // Tab from the last in-scope tabbable lands here. Wrap to the
    // FIRST in-scope tabbable.
    const startGuard = startGuardRef.current;
    const endGuard = endGuardRef.current;
    if (startGuard === null || endGuard === null) return;
    const tabbables = getTabbableInScope(startGuard, endGuard);
    if (tabbables.length > 0) {
      tabbables[0].focus();
    }
  }, []);

  return (
    <>
      <span
        ref={startGuardRef}
        data-prismui-focus-guard="start"
        aria-hidden="true"
        tabIndex={0}
        onFocus={handleStartGuardFocus}
        style={GUARD_STYLE}
      />
      {children}
      <span
        ref={endGuardRef}
        data-prismui-focus-guard="end"
        aria-hidden="true"
        tabIndex={0}
        onFocus={handleEndGuardFocus}
        style={GUARD_STYLE}
      />
    </>
  );
}

FocusScope.displayName = 'FocusScope';
