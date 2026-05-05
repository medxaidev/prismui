/**
 * Stage-15 Phase 2 · LY-SCOPE-1 · FocusScope test suite.
 *
 * Test topology (mapped back to invariants):
 *   - LY-SCOPE-1 initial focus on mount                                (3 tests)
 *   - LY-SCOPE-1 Tab wraps from last → first (endGuard onFocus)        (3 tests)
 *   - LY-SCOPE-1 Shift+Tab wraps from first → last (startGuard onFocus)(2 tests)
 *   - LY-SCOPE-1 focus restoration on unmount                          (3 tests)
 *   - LY-SCOPE-1 tabbable filtering · disabled / hidden / -1 tabindex  (3 tests)
 *   - LY-SCOPE-1 nested FocusScopes · inner restores into outer        (1 test)
 *   - LY-SCOPE-1 empty scope (no tabbable) · graceful no-op            (1 test)
 *   - LY-SCOPE-5 no wrapper DOM · sentinels are siblings only          (3 tests)
 *
 * JSDOM caveats acknowledged:
 *   - Real Tab key navigation is NOT simulated by JSDOM. We trigger the
 *     trap mechanism by directly firing `focus` events on the sentinel
 *     guards (which is exactly what the browser does when Tab moves
 *     focus from the last in-scope tabbable to the trailing guard).
 *   - `userEvent.tab()` IS available and uses guard `onFocus` correctly,
 *     so a few end-to-end tab-traversal tests use it for higher
 *     confidence.
 */
import { describe, it, expect } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FocusScope } from './FocusScope';

// ── Helpers ─────────────────────────────────────────────────────────────────

function getStartGuard(container: HTMLElement): HTMLElement {
  const el = container.querySelector('[data-prismui-focus-guard="start"]');
  if (el === null) throw new Error('start guard not found');
  return el as HTMLElement;
}
function getEndGuard(container: HTMLElement): HTMLElement {
  const el = container.querySelector('[data-prismui-focus-guard="end"]');
  if (el === null) throw new Error('end guard not found');
  return el as HTMLElement;
}

// ── LY-SCOPE-1 · initial focus ──────────────────────────────────────────────

describe('FocusScope · LY-SCOPE-1 initial focus on mount', () => {
  it('moves focus to the first tabbable child on mount', () => {
    render(
      <FocusScope>
        <button>first</button>
        <button>second</button>
      </FocusScope>,
    );
    expect(document.activeElement?.textContent).toBe('first');
  });

  it('skips non-tabbable elements when picking the initial focus target', () => {
    render(
      <FocusScope>
        <span>not-focusable</span>
        <button disabled>disabled</button>
        <button>real-first</button>
      </FocusScope>,
    );
    expect(document.activeElement?.textContent).toBe('real-first');
  });

  it('honours tabindex=-1 (does not focus elements with negative tabindex)', () => {
    render(
      <FocusScope>
        <button tabIndex={-1}>opt-out</button>
        <button>real-first</button>
      </FocusScope>,
    );
    expect(document.activeElement?.textContent).toBe('real-first');
  });
});

// ── LY-SCOPE-1 · Tab wrap (endGuard) ────────────────────────────────────────

describe('FocusScope · LY-SCOPE-1 Tab wraps last → first via endGuard', () => {
  it('focusing the endGuard programmatically wraps focus to the first tabbable', () => {
    const { container } = render(
      <FocusScope>
        <button>first</button>
        <button>second</button>
        <button>third</button>
      </FocusScope>,
    );
    // Simulate the browser landing focus on the trailing guard (which
    // happens after Tab from the last tabbable). React's `onFocus`
    // listener fires on `focusin`, which `fireEvent.focus` dispatches.
    act(() => {
      getEndGuard(container).focus();
    });
    expect(document.activeElement?.textContent).toBe('first');
  });

  it('userEvent.tab() from the last tabbable wraps to the first', async () => {
    const user = userEvent.setup();
    render(
      <FocusScope>
        <button>first</button>
        <button>last</button>
      </FocusScope>,
    );
    // Initial focus is on first → tab once → on last → tab → wraps to first.
    expect(document.activeElement?.textContent).toBe('first');
    await user.tab();
    expect(document.activeElement?.textContent).toBe('last');
    await user.tab();
    expect(document.activeElement?.textContent).toBe('first');
  });

  it('focusing endGuard with NO tabbable in scope is a graceful no-op', () => {
    const { container } = render(
      <FocusScope>
        <span>plain text</span>
      </FocusScope>,
    );
    // No throw. Focus stays on the guard (or wherever it landed).
    expect(() => {
      act(() => {
        getEndGuard(container).focus();
      });
    }).not.toThrow();
  });
});

// ── LY-SCOPE-1 · Shift+Tab wrap (startGuard) ────────────────────────────────

describe('FocusScope · LY-SCOPE-1 Shift+Tab wraps first → last via startGuard', () => {
  it('focusing the startGuard programmatically wraps to the last tabbable', () => {
    const { container } = render(
      <FocusScope>
        <button>first</button>
        <button>second</button>
        <button>last</button>
      </FocusScope>,
    );
    act(() => {
      getStartGuard(container).focus();
    });
    expect(document.activeElement?.textContent).toBe('last');
  });

  it('userEvent.tab({shift:true}) from the first tabbable wraps to the last', async () => {
    const user = userEvent.setup();
    render(
      <FocusScope>
        <button>first</button>
        <button>middle</button>
        <button>last</button>
      </FocusScope>,
    );
    expect(document.activeElement?.textContent).toBe('first');
    await user.tab({ shift: true });
    expect(document.activeElement?.textContent).toBe('last');
  });
});

// ── LY-SCOPE-1 · focus restoration ──────────────────────────────────────────

describe('FocusScope · LY-SCOPE-1 focus restoration on unmount', () => {
  it('restores focus to the trigger element on unmount', () => {
    // Render a "trigger" outside the scope, focus it, then mount the
    // scope. On unmount, focus should return to the trigger.
    const { unmount: unmountTrigger } = render(<button data-testid="trigger">open</button>);
    const trigger = document.querySelector('[data-testid="trigger"]') as HTMLButtonElement;
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    const { unmount: unmountScope } = render(
      <FocusScope>
        <button>inside</button>
      </FocusScope>,
    );
    expect(document.activeElement?.textContent).toBe('inside');

    unmountScope();
    expect(document.activeElement).toBe(trigger);

    unmountTrigger();
  });

  it('does NOT throw if the trigger was removed from the DOM before unmount', () => {
    // Trigger is rendered then immediately removed AFTER the scope mounts.
    const triggerHost = document.createElement('button');
    triggerHost.textContent = 'detached';
    document.body.appendChild(triggerHost);
    triggerHost.focus();

    const { unmount } = render(
      <FocusScope>
        <button>inside</button>
      </FocusScope>,
    );
    // Detach the trigger.
    triggerHost.remove();

    // Unmount must not throw even though the trigger no longer exists.
    expect(() => unmount()).not.toThrow();
  });

  it('does NOT throw when no element was focused before mount (body active)', () => {
    // Force `document.activeElement` to be `body`.
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    const { unmount } = render(
      <FocusScope>
        <button>inside</button>
      </FocusScope>,
    );
    expect(() => unmount()).not.toThrow();
  });
});

// ── LY-SCOPE-1 · tabbable filtering ─────────────────────────────────────────

describe('FocusScope · LY-SCOPE-1 tabbable filtering', () => {
  it('skips disabled buttons during wrap', () => {
    const { container } = render(
      <FocusScope>
        <button>first</button>
        <button disabled>SKIP</button>
        <button>last</button>
      </FocusScope>,
    );
    act(() => {
      getEndGuard(container).focus();
    });
    expect(document.activeElement?.textContent).toBe('first');
  });

  it('skips type="hidden" inputs', () => {
    render(
      <FocusScope>
        <input type="hidden" defaultValue="csrf" />
        <button>first</button>
      </FocusScope>,
    );
    expect(document.activeElement?.tagName).toBe('BUTTON');
  });

  it('treats explicit positive tabindex as tabbable', () => {
    render(
      <FocusScope>
        <div tabIndex={0} data-testid="custom">custom-tabbable</div>
        <button>real-button</button>
      </FocusScope>,
    );
    // Both are tabbable; document order picks the custom div first.
    expect(document.activeElement?.getAttribute('data-testid')).toBe('custom');
  });
});

// ── LY-SCOPE-1 · nested FocusScopes ─────────────────────────────────────────

describe('FocusScope · LY-SCOPE-1 nested scopes', () => {
  it('inner unmount restores focus to the outer scope (the inner trigger)', () => {
    function Stage({ inner }: { inner: boolean }) {
      return (
        <FocusScope>
          <button>outer-a</button>
          <button data-testid="open-inner">open-inner</button>
          {inner ? (
            <FocusScope>
              <button>inner-only</button>
            </FocusScope>
          ) : null}
        </FocusScope>
      );
    }

    const { rerender } = render(<Stage inner={false} />);
    // Initial focus on first outer tabbable.
    expect(document.activeElement?.textContent).toBe('outer-a');

    // Click the "open-inner" button (becomes activeElement before
    // mounting the inner scope). This simulates the realistic flow.
    const openBtn = document.querySelector('[data-testid="open-inner"]') as HTMLButtonElement;
    openBtn.focus();
    expect(document.activeElement).toBe(openBtn);

    rerender(<Stage inner={true} />);
    expect(document.activeElement?.textContent).toBe('inner-only');

    // Unmount inner — focus should return to `open-inner` (the trigger
    // captured at inner-scope mount time), NOT outer-a.
    rerender(<Stage inner={false} />);
    expect(document.activeElement).toBe(openBtn);
  });
});

// ── LY-SCOPE-1 · empty scope ────────────────────────────────────────────────

describe('FocusScope · LY-SCOPE-1 empty scope (no tabbable)', () => {
  it('does NOT throw when scope contains no tabbable elements', () => {
    expect(() =>
      render(
        <FocusScope>
          <p>just text</p>
          <span>more text</span>
        </FocusScope>,
      ),
    ).not.toThrow();
  });
});

// ── LY-SCOPE-5 · no wrapper DOM ─────────────────────────────────────────────

describe('FocusScope · LY-SCOPE-5 no wrapper · sentinels are siblings only', () => {
  it('renders children directly between two sibling guards (no wrapper around children)', () => {
    const { container } = render(
      <FocusScope>
        <button data-testid="child">click</button>
      </FocusScope>,
    );
    // Top-level structure: [startGuard, child, endGuard] · all siblings
    // of one another · no wrapper element introduced.
    expect(container.children.length).toBe(3);
    expect(container.children[0].getAttribute('data-prismui-focus-guard')).toBe('start');
    expect(container.children[1].getAttribute('data-testid')).toBe('child');
    expect(container.children[2].getAttribute('data-prismui-focus-guard')).toBe('end');
  });

  it('guards are aria-hidden + visually invisible (LY-SCOPE-5 "no visible DOM")', () => {
    const { container } = render(
      <FocusScope>
        <button>x</button>
      </FocusScope>,
    );
    const start = getStartGuard(container);
    const end = getEndGuard(container);
    for (const guard of [start, end]) {
      expect(guard.getAttribute('aria-hidden')).toBe('true');
      expect(guard.style.opacity).toBe('0');
      expect(guard.style.position).toBe('fixed');
      expect(guard.style.pointerEvents).toBe('none');
    }
  });

  it('preserves children sibling order (multiple children pass through unchanged)', () => {
    const { container } = render(
      <FocusScope>
        <div data-order="1" />
        <div data-order="2" />
        <div data-order="3" />
      </FocusScope>,
    );
    // Inner-content sequence should be 1 → 2 → 3, bracketed by guards.
    const dataOrders = Array.from(container.children).map((el) => el.getAttribute('data-order'));
    expect(dataOrders).toEqual([null, '1', '2', '3', null]);
  });
});

// Suppress unused-import warnings for fireEvent (kept for potential future
// keydown-based tests · all current trap tests use direct .focus() which
// the browser implicitly does on Tab traversal).
void fireEvent;
