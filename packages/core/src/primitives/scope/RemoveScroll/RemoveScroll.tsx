import * as React from 'react';

/**
 * `<RemoveScroll>` — Stage-15 Phase 2 Behavior Scope primitive · body
 * scroll lock with scrollbar-gutter compensation.
 *
 * Contracts (see `@/devdocs/stage/STAGE-15-OVERVIEW.md` §3.7 + ADR-006):
 *
 *   - **LY-SCOPE-2** — while at least one `<RemoveScroll>` is mounted
 *     with `enabled={true}`:
 *       1. `document.body.style.overflow = 'hidden'` — prevents the
 *          page from scrolling while an overlay is open.
 *       2. `document.body.style.paddingRight` is increased by the
 *          scrollbar width (the "scrollbar-gutter compensation") —
 *          prevents the visible-content region from jumping sideways
 *          when the scrollbar disappears.
 *     On the last unmount / disable, the original body styles are
 *     restored byte-for-byte (including empty strings — we don't
 *     clobber user styles we didn't set).
 *   - **LY-SCOPE-5** — produces NO visible DOM. Children are rendered
 *     via a transparent fragment; no wrapper element is introduced.
 *   - **iOS viewport quirks are OUT OF SCOPE for v1** (LY-SCOPE-2). A
 *     future v1.x revisit may add `position: fixed` restoration with
 *     saved `scrollY`. For now the `overflow: hidden`-only approach
 *     preserves scroll offset automatically (nothing to restore).
 *
 * ## Why module-level reference counting?
 *
 * Realistic overlay stacks nest: Modal → Menu inside → Tooltip inside.
 * Each layer may want scroll lock. Naive per-instance lock/unlock would
 * have the innermost `unmount` prematurely restore body styles while
 * the outer Modal still needs the lock. A module-level counter with
 * "first-in applies · last-out restores" semantics handles the stack
 * naturally — identical to the pattern in `react-remove-scroll`,
 * `body-scroll-lock`, Radix, Chakra, etc.
 *
 * ## Why save styles at acquire time (not at module load)?
 *
 * Users may set `document.body.style.overflow = 'scroll'` globally
 * BEFORE any RemoveScroll mounts. The "saved" body styles must reflect
 * the state at the moment of the FIRST lock acquisition, not a
 * hard-coded empty string. This preserves the contract "we only touch
 * what we set; we restore exactly what we found".
 */

// ── module-level lock state ────────────────────────────────────────────────

interface SavedBodyStyles {
  overflow: string;
  paddingRight: string;
}

let lockCount = 0;
let savedBodyStyles: SavedBodyStyles | null = null;

/** Acquire a scroll lock. Idempotent in the aggregate (first caller wins). */
function acquireScrollLock(): void {
  // SSR guard — all DOM reads go through `document` / `window`.
  if (typeof document === 'undefined' || typeof window === 'undefined') return;

  lockCount += 1;
  if (lockCount !== 1) return; // already locked by outer scope

  const body = document.body;
  const html = document.documentElement;

  // Scrollbar width = viewport minus inner-content width. Zero when
  // there is no scrollbar (short page · mobile). getComputedStyle is
  // unreliable for `padding-right` on <body> pre-style-inject, so we
  // parse it up-front and re-apply the sum (see note below).
  const scrollbarWidth = Math.max(window.innerWidth - html.clientWidth, 0);

  savedBodyStyles = {
    overflow: body.style.overflow,
    paddingRight: body.style.paddingRight,
  };

  body.style.overflow = 'hidden';

  if (scrollbarWidth > 0) {
    // Respect the user's pre-existing padding-right if any — we stack
    // on top of it, so the restore path putting back the original
    // value is the correct complement. `parseFloat('')` is NaN, which
    // `|| 0` folds to zero.
    const basePadding = parseFloat(window.getComputedStyle(body).paddingRight) || 0;
    body.style.paddingRight = `${basePadding + scrollbarWidth}px`;
  }
}

/** Release a scroll lock. Last caller restores the saved body styles. */
function releaseScrollLock(): void {
  if (typeof document === 'undefined') return;
  if (lockCount === 0) return; // defensive — should never happen under symmetric acquire/release

  lockCount -= 1;
  if (lockCount !== 0) return; // an outer scope still wants the lock

  if (savedBodyStyles !== null) {
    const body = document.body;
    // Restore byte-for-byte — empty strings are meaningful ("unset the
    // inline property"), so we pass them through verbatim.
    body.style.overflow = savedBodyStyles.overflow;
    body.style.paddingRight = savedBodyStyles.paddingRight;
    savedBodyStyles = null;
  }
}

// ── Test-only reset ────────────────────────────────────────────────────────

/**
 * Reset the module-level lock state. **DO NOT CALL IN APPLICATION CODE.**
 * This escape hatch exists purely for test isolation — Vitest runs tests
 * in the same module instance, and a leaked lock from a failing test
 * would contaminate the next test. Exported with a sentinel name so
 * accidental imports stand out in code review.
 *
 * @internal
 */
export function __TEST_ONLY_resetScrollLock(): void {
  lockCount = 0;
  savedBodyStyles = null;
}

// ── Component ──────────────────────────────────────────────────────────────

export interface RemoveScrollProps {
  /**
   * When `true` (default), the body scroll lock is applied while this
   * component is mounted. When `false`, the component is a transparent
   * passthrough — no body styles are touched. Toggling `enabled` at
   * runtime acquires / releases the lock on the boundary.
   */
  enabled?: boolean;
  /** Children are rendered through a fragment (LY-SCOPE-5 · no wrapper). */
  children?: React.ReactNode;
}

/**
 * Body scroll lock + scrollbar-gutter compensation. Mount inside any
 * overlay surface (Modal / Drawer / Dropdown menu etc.) to prevent
 * page-level scrolling while the overlay is open.
 *
 * Usage:
 * ```tsx
 * <Dialog open={isOpen}>
 *   <RemoveScroll>
 *     <DialogSurface>...</DialogSurface>
 *   </RemoveScroll>
 * </Dialog>
 * ```
 */
export function RemoveScroll(props: RemoveScrollProps): React.ReactElement {
  const { enabled = true, children } = props;

  React.useEffect(() => {
    if (!enabled) return undefined;
    acquireScrollLock();
    return () => {
      releaseScrollLock();
    };
  }, [enabled]);

  // LY-SCOPE-5 · no wrapper DOM. Fragment preserves sibling ordering
  // for the consumer and adds zero visual footprint.
  return <>{children}</>;
}

RemoveScroll.displayName = 'RemoveScroll';
