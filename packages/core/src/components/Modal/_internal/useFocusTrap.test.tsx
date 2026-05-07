/**
 * Stage-11 Phase 7a · Modal · `useFocusTrap` · trap-focus hook tests
 *
 * Authority: ADR-007 决策 1-3 + OV-MODAL-1 invariant.
 *
 * Test topology (mapped back to OV-MODAL-1 三子合约):
 *   - 子合约 1 · Tab cycle · forward + backward + inside-content     (3 tests)
 *   - 子合约 2 · Auto-focus · initialFocus / fallback / empty       (3 tests)
 *   - 子合约 3 · Return-focus · trigger restore / explicit override (2 tests)
 *   - active toggle · activate / deactivate / re-engage             (2 tests)
 */

import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { act, render } from '@testing-library/react';
import { useFocusTrap, type UseFocusTrapOptions } from './useFocusTrap';

interface HarnessProps extends Omit<UseFocusTrapOptions, 'containerRef'> {
  initialFocus?: 'first' | 'second' | 'third' | 'none';
  showThird?: boolean;
}

/**
 * Test harness — renders a container with 3 buttons and engages the trap
 * via the hook. Caller controls `active` and `initialFocus` selection.
 */
function TrapHarness(props: HarnessProps): React.ReactElement {
  const { active, initialFocus = 'none', showThird = true } = props;
  const containerRef = React.useRef<HTMLDivElement>(null);
  const firstRef = React.useRef<HTMLButtonElement>(null);
  const secondRef = React.useRef<HTMLButtonElement>(null);
  const thirdRef = React.useRef<HTMLButtonElement>(null);

  const initialRef =
    initialFocus === 'first'
      ? firstRef
      : initialFocus === 'second'
        ? secondRef
        : initialFocus === 'third'
          ? thirdRef
          : undefined;

  useFocusTrap({
    active,
    containerRef,
    initialFocusRef: initialRef as React.RefObject<HTMLElement | null> | undefined,
  });

  return (
    <>
      <button data-testid="outside-before">outside-before</button>
      <div ref={containerRef} data-testid="container" tabIndex={-1}>
        <button ref={firstRef} data-testid="first">
          first
        </button>
        <button ref={secondRef} data-testid="second">
          second
        </button>
        {showThird ? (
          <button ref={thirdRef} data-testid="third">
            third
          </button>
        ) : null}
      </div>
      <button data-testid="outside-after">outside-after</button>
    </>
  );
}

function pressTab(target: Element, opts: { shift?: boolean } = {}): boolean {
  const event = new KeyboardEvent('keydown', {
    key: 'Tab',
    bubbles: true,
    cancelable: true,
    shiftKey: opts.shift === true,
  });
  return target.dispatchEvent(event);
}

// Wait one microtask flush — useFocusTrap defers return-focus via
// queueMicrotask so the cleanup-time focus restoration lands after a flush.
async function flushMicrotasks(): Promise<void> {
  await Promise.resolve();
}

// ── 子合约 1 · Tab cycle ────────────────────────────────────────────────
describe('useFocusTrap · 子合约 1 · Tab cycle', () => {
  it('Tab at last tabbable cycles to first', () => {
    const { getByTestId } = render(<TrapHarness active />);
    const third = getByTestId('third') as HTMLButtonElement;
    const first = getByTestId('first') as HTMLButtonElement;
    third.focus();
    expect(document.activeElement).toBe(third);

    act(() => {
      pressTab(third);
    });

    expect(document.activeElement).toBe(first);
  });

  it('Shift+Tab at first tabbable cycles to last', () => {
    const { getByTestId } = render(<TrapHarness active />);
    const first = getByTestId('first') as HTMLButtonElement;
    const third = getByTestId('third') as HTMLButtonElement;
    first.focus();

    act(() => {
      pressTab(first, { shift: true });
    });

    expect(document.activeElement).toBe(third);
  });

  it('Tab in the middle of the trap does NOT preventDefault (browser handles)', () => {
    // Hook only intercepts at boundaries. Browser-native Tab traversal
    // covers middle steps — we verify our handler does not preventDefault
    // when current focus is not at a boundary.
    const { getByTestId } = render(<TrapHarness active />);
    const second = getByTestId('second') as HTMLButtonElement;
    second.focus();

    let prevented = false;
    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
    });
    second.addEventListener(
      'keydown',
      (e) => {
        if (e.defaultPrevented) prevented = true;
      },
      { capture: false },
    );
    act(() => {
      second.dispatchEvent(event);
    });
    expect(prevented).toBe(false);
  });
});

// ── 子合约 2 · Auto-focus ───────────────────────────────────────────────
describe('useFocusTrap · 子合约 2 · auto-focus', () => {
  it('falls back to first tabbable when initialFocusRef is not provided', () => {
    const { getByTestId } = render(<TrapHarness active />);
    expect(document.activeElement).toBe(getByTestId('first'));
  });

  it('focuses initialFocusRef.current when provided & inside container', () => {
    const { getByTestId } = render(<TrapHarness active initialFocus="second" />);
    expect(document.activeElement).toBe(getByTestId('second'));
  });

  it('falls back to container itself when no tabbables exist', () => {
    function EmptyTrapHarness(): React.ReactElement {
      const containerRef = React.useRef<HTMLDivElement>(null);
      useFocusTrap({ active: true, containerRef });
      return (
        <div ref={containerRef} data-testid="empty-container" tabIndex={-1}>
          {/* no tabbables */}
          <p>nothing focusable</p>
        </div>
      );
    }
    const { getByTestId } = render(<EmptyTrapHarness />);
    expect(document.activeElement).toBe(getByTestId('empty-container'));
  });
});

// ── 子合约 3 · Return-focus ─────────────────────────────────────────────
describe('useFocusTrap · 子合约 3 · return-focus', () => {
  it('restores focus to the previously-focused element on deactivation', async () => {
    function ToggleHarness({ active }: { active: boolean }): React.ReactElement {
      return <TrapHarness active={active} />;
    }
    const outsideBeforeId = 'outside-before';
    const { getByTestId, rerender } = render(<ToggleHarness active={false} />);

    // Focus a trigger-like element BEFORE activating.
    const trigger = getByTestId(outsideBeforeId) as HTMLButtonElement;
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    // Activate · trap captures previous focus.
    rerender(<ToggleHarness active />);
    expect(document.activeElement).toBe(getByTestId('first'));

    // Deactivate · trap should restore focus to the trigger.
    rerender(<ToggleHarness active={false} />);
    await act(async () => {
      await flushMicrotasks();
    });
    expect(document.activeElement).toBe(trigger);
  });

  it('honours explicit returnFocusRef override', async () => {
    function OverrideHarness({ active }: { active: boolean }): React.ReactElement {
      const containerRef = React.useRef<HTMLDivElement>(null);
      const returnRef = React.useRef<HTMLButtonElement>(null);
      useFocusTrap({
        active,
        containerRef,
        returnFocusRef: returnRef as React.RefObject<HTMLElement | null>,
      });
      return (
        <>
          <button data-testid="trigger">trigger</button>
          <button ref={returnRef} data-testid="return-target">
            return target
          </button>
          <div ref={containerRef} data-testid="container" tabIndex={-1}>
            <button data-testid="inside">inside</button>
          </div>
        </>
      );
    }
    const { getByTestId, rerender } = render(<OverrideHarness active={false} />);
    const trigger = getByTestId('trigger') as HTMLButtonElement;
    trigger.focus();

    rerender(<OverrideHarness active />);
    rerender(<OverrideHarness active={false} />);
    await act(async () => {
      await flushMicrotasks();
    });

    expect(document.activeElement).toBe(getByTestId('return-target'));
  });
});

// ── active toggle · re-engagement ───────────────────────────────────────
describe('useFocusTrap · active toggle', () => {
  it('does nothing when active=false from the start', () => {
    const { getByTestId } = render(<TrapHarness active={false} />);
    const outside = getByTestId('outside-before') as HTMLButtonElement;
    outside.focus();
    expect(document.activeElement).toBe(outside);

    // Tab is not intercepted — handler not installed.
    act(() => {
      pressTab(getByTestId('first'));
    });
    // No assertion on focus target here because the browser is not driving
    // Tab traversal in jsdom. The point is no exception, no focus capture.
    expect(document.activeElement).toBe(outside);
  });

  it('re-engages after deactivate → activate cycle', async () => {
    function ToggleHarness({ active }: { active: boolean }): React.ReactElement {
      return <TrapHarness active={active} />;
    }
    const { getByTestId, rerender } = render(<ToggleHarness active />);
    expect(document.activeElement).toBe(getByTestId('first'));

    rerender(<ToggleHarness active={false} />);
    await act(async () => {
      await flushMicrotasks();
    });

    // Re-activate · auto-focus runs again.
    const trigger = getByTestId('outside-before') as HTMLButtonElement;
    trigger.focus();
    rerender(<ToggleHarness active />);
    expect(document.activeElement).toBe(getByTestId('first'));
  });
});
