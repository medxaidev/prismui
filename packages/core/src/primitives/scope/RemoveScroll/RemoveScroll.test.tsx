/**
 * Stage-15 Phase 2 · LY-SCOPE-2 · RemoveScroll test suite.
 *
 * Test topology (mapped back to invariants):
 *   - LY-SCOPE-2 acquire · overflow + padding compensation            (3 tests)
 *   - LY-SCOPE-2 release · restore body styles byte-for-byte          (3 tests)
 *   - LY-SCOPE-2 nested ref-count (first-in · last-out)               (3 tests)
 *   - LY-SCOPE-2 enabled prop toggle                                  (3 tests)
 *   - LY-SCOPE-2 no scrollbar (viewport === client)                   (1 test)
 *   - LY-SCOPE-2 preserves user-set body styles                       (2 tests)
 *   - LY-SCOPE-5 no wrapper DOM · children transparent passthrough    (2 tests)
 *
 * Body state is mutable module-global state. Every test MUST end with
 * body.style fully restored to its pre-test state. The beforeEach /
 * afterEach guards below enforce this.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { RemoveScroll, __TEST_ONLY_resetScrollLock } from './RemoveScroll';

// ── Test isolation harness ──────────────────────────────────────────────────

/**
 * Stub `window.innerWidth` / `html.clientWidth` to simulate a viewport
 * with a visible scrollbar. JSDOM by default returns 0 / 0 for both,
 * which collapses the scrollbar-width calculation to zero (no padding
 * compensation). We deliberately mutate them so the compensation path
 * is exercisable — values are restored in afterEach.
 */
const SIMULATED_VIEWPORT_WIDTH = 1024;
const SIMULATED_HTML_CLIENT_WIDTH = 1009; // 15-px scrollbar

let originalInnerWidth: number;
let originalBodyOverflow: string;
let originalBodyPaddingRight: string;

beforeEach(() => {
  __TEST_ONLY_resetScrollLock();
  originalInnerWidth = window.innerWidth;
  originalBodyOverflow = document.body.style.overflow;
  originalBodyPaddingRight = document.body.style.paddingRight;

  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    value: SIMULATED_VIEWPORT_WIDTH,
    writable: true,
  });
  Object.defineProperty(document.documentElement, 'clientWidth', {
    configurable: true,
    value: SIMULATED_HTML_CLIENT_WIDTH,
    writable: true,
  });
});

afterEach(() => {
  __TEST_ONLY_resetScrollLock();
  // Clean body styles regardless of what the test did.
  document.body.style.overflow = originalBodyOverflow;
  document.body.style.paddingRight = originalBodyPaddingRight;
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    value: originalInnerWidth,
    writable: true,
  });
});

// ── LY-SCOPE-2 · acquire ────────────────────────────────────────────────────

describe('RemoveScroll · LY-SCOPE-2 acquire', () => {
  it('sets body.style.overflow = "hidden" on mount', () => {
    render(<RemoveScroll>inner</RemoveScroll>);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('adds scrollbar-width padding-right compensation', () => {
    render(<RemoveScroll>inner</RemoveScroll>);
    const expected = SIMULATED_VIEWPORT_WIDTH - SIMULATED_HTML_CLIENT_WIDTH;
    expect(document.body.style.paddingRight).toBe(`${expected}px`);
  });

  it('stacks padding-right on top of pre-existing body padding', () => {
    document.body.style.paddingRight = '20px';
    const scrollbarWidth = SIMULATED_VIEWPORT_WIDTH - SIMULATED_HTML_CLIENT_WIDTH;
    render(<RemoveScroll>inner</RemoveScroll>);
    // Total should be base (20) + scrollbar (15) = 35px. JSDOM does
    // not fully implement getComputedStyle for inline styles, but the
    // value read back from `style.paddingRight` is the literal string
    // we injected — so the expected value is `${20 + 15}px`.
    expect(document.body.style.paddingRight).toBe(`${20 + scrollbarWidth}px`);
  });
});

// ── LY-SCOPE-2 · release ────────────────────────────────────────────────────

describe('RemoveScroll · LY-SCOPE-2 release', () => {
  it('restores body.style.overflow to empty string on unmount', () => {
    const { unmount } = render(<RemoveScroll>inner</RemoveScroll>);
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('');
  });

  it('restores body.style.paddingRight to empty string on unmount', () => {
    const { unmount } = render(<RemoveScroll>inner</RemoveScroll>);
    expect(document.body.style.paddingRight).not.toBe('');
    unmount();
    expect(document.body.style.paddingRight).toBe('');
  });

  it('restores a pre-existing overflow value exactly (not just empty)', () => {
    document.body.style.overflow = 'scroll';
    const { unmount } = render(<RemoveScroll>inner</RemoveScroll>);
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    // Byte-for-byte restoration — the user set 'scroll' before us,
    // and that is exactly what must come back.
    expect(document.body.style.overflow).toBe('scroll');
  });
});

// ── LY-SCOPE-2 · nested ref-count ───────────────────────────────────────────

describe('RemoveScroll · LY-SCOPE-2 nested ref-count', () => {
  it('inner unmount does NOT release while outer is still mounted', () => {
    const { rerender, unmount } = render(
      <RemoveScroll>
        <RemoveScroll>inner</RemoveScroll>
      </RemoveScroll>,
    );
    expect(document.body.style.overflow).toBe('hidden');

    // Drop the inner lock. Outer still wants the lock.
    rerender(
      <RemoveScroll>
        <div>inner replaced</div>
      </RemoveScroll>,
    );
    expect(document.body.style.overflow).toBe('hidden');

    // Drop the outer lock. Now body should be unlocked.
    unmount();
    expect(document.body.style.overflow).toBe('');
  });

  it('two sibling RemoveScrolls ref-count correctly', () => {
    function Siblings({ aOpen, bOpen }: { aOpen: boolean; bOpen: boolean }) {
      return (
        <>
          {aOpen ? <RemoveScroll>a</RemoveScroll> : null}
          {bOpen ? <RemoveScroll>b</RemoveScroll> : null}
        </>
      );
    }
    const { rerender, unmount } = render(<Siblings aOpen={true} bOpen={true} />);
    expect(document.body.style.overflow).toBe('hidden');

    rerender(<Siblings aOpen={true} bOpen={false} />);
    expect(document.body.style.overflow).toBe('hidden');

    rerender(<Siblings aOpen={false} bOpen={false} />);
    expect(document.body.style.overflow).toBe('');

    unmount();
  });

  it('body styles are saved once, at the FIRST lock — survives inner remount', () => {
    document.body.style.overflow = 'auto';
    const { rerender, unmount } = render(
      <RemoveScroll>
        <RemoveScroll>inner</RemoveScroll>
      </RemoveScroll>,
    );
    // Re-render inner (cycling its lock) should not corrupt the saved
    // state (which captured 'auto' at the first outer mount).
    rerender(
      <RemoveScroll>
        <div>temp</div>
      </RemoveScroll>,
    );
    rerender(
      <RemoveScroll>
        <RemoveScroll>inner again</RemoveScroll>
      </RemoveScroll>,
    );
    unmount();
    expect(document.body.style.overflow).toBe('auto');
  });
});

// ── LY-SCOPE-2 · enabled toggle ─────────────────────────────────────────────

describe('RemoveScroll · LY-SCOPE-2 enabled prop', () => {
  it('enabled={false} is a transparent passthrough (no body change)', () => {
    render(<RemoveScroll enabled={false}>inner</RemoveScroll>);
    expect(document.body.style.overflow).toBe('');
    expect(document.body.style.paddingRight).toBe('');
  });

  it('toggling enabled true → false releases the lock', () => {
    const { rerender } = render(<RemoveScroll enabled={true}>inner</RemoveScroll>);
    expect(document.body.style.overflow).toBe('hidden');
    rerender(<RemoveScroll enabled={false}>inner</RemoveScroll>);
    expect(document.body.style.overflow).toBe('');
  });

  it('toggling enabled false → true acquires the lock', () => {
    const { rerender } = render(<RemoveScroll enabled={false}>inner</RemoveScroll>);
    expect(document.body.style.overflow).toBe('');
    rerender(<RemoveScroll enabled={true}>inner</RemoveScroll>);
    expect(document.body.style.overflow).toBe('hidden');
  });
});

// ── LY-SCOPE-2 · no scrollbar branch ────────────────────────────────────────

describe('RemoveScroll · LY-SCOPE-2 no-scrollbar viewport', () => {
  it('does NOT add padding-right when viewport === client width', () => {
    Object.defineProperty(document.documentElement, 'clientWidth', {
      configurable: true,
      value: SIMULATED_VIEWPORT_WIDTH, // equal → scrollbar width = 0
      writable: true,
    });
    render(<RemoveScroll>inner</RemoveScroll>);
    expect(document.body.style.overflow).toBe('hidden');
    expect(document.body.style.paddingRight).toBe('');
  });
});

// ── LY-SCOPE-2 · preserve user-set body styles ──────────────────────────────

describe('RemoveScroll · LY-SCOPE-2 preserves user-set body styles', () => {
  it('restores pre-existing padding-right exactly on final release', () => {
    document.body.style.paddingRight = '8px';
    const { unmount } = render(<RemoveScroll>inner</RemoveScroll>);
    // During lock: 8 + 15 = 23px.
    const scrollbarWidth = SIMULATED_VIEWPORT_WIDTH - SIMULATED_HTML_CLIENT_WIDTH;
    expect(document.body.style.paddingRight).toBe(`${8 + scrollbarWidth}px`);
    unmount();
    expect(document.body.style.paddingRight).toBe('8px');
  });

  it('does NOT mutate non-scroll body styles (e.g. background)', () => {
    document.body.style.background = 'pink';
    const { unmount } = render(<RemoveScroll>inner</RemoveScroll>);
    expect(document.body.style.background).toBe('pink');
    unmount();
    expect(document.body.style.background).toBe('pink');
    // Cleanup for test isolation.
    document.body.style.background = '';
  });
});

// ── LY-SCOPE-5 · no wrapper DOM ─────────────────────────────────────────────

describe('RemoveScroll · LY-SCOPE-5 no wrapper DOM', () => {
  it('renders children directly (no wrapper element introduced)', () => {
    const { container } = render(
      <RemoveScroll>
        <div data-testid="child" />
      </RemoveScroll>,
    );
    // The only element under the testing-library container should be
    // our child. No <div wrapper> / <span wrapper> / anything else.
    expect(container.children.length).toBe(1);
    expect(container.firstElementChild!.getAttribute('data-testid')).toBe('child');
  });

  it('preserves sibling order with multiple children', () => {
    const { container } = render(
      <RemoveScroll>
        <div data-order="1" />
        <div data-order="2" />
        <div data-order="3" />
      </RemoveScroll>,
    );
    const orders = Array.from(container.children).map((el) => el.getAttribute('data-order'));
    expect(orders).toEqual(['1', '2', '3']);
  });
});
