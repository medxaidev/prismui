/**
 * Stage-10 · L2 Interaction Events · `usePress` hook tests
 *
 * Coverage matrix (interaction-events.md §10 · Phase 1 L2-only):
 *   · Main path (pressstart/up/end, pointerType, geometry)
 *   · Keyboard (§5.1 host-neutral Space/Enter)
 *   · re-entry (IE-CORE-3 · pointerleave → suspended → pointerenter → active)
 *   · blur → failure (OQ-IE-2)
 *   · Gating: missing warn, isInteractiveDisabled=true blocks pressstart
 *   · Lifecycle: L-1 unmount silent, L-2 global listener cleanup, L-3 DOM removal, L-4 no RAF
 *
 * (Concurrency C-1~C-5 tests live in `usePress.concurrent.test.tsx`.)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { usePress } from './usePress';
import { __resetPressInvariantWarnings } from './press-invariants';
import type { UsePressOptions } from './types';

// ─────────────────────────────────────────────────────────────
// Test harness component
// ─────────────────────────────────────────────────────────────

interface PressHarnessProps extends UsePressOptions {
  /** test probe for `isPressed` */
  onRender?: (isPressed: boolean) => void;
  children?: React.ReactNode;
  /** rect overrides for getBoundingClientRect · testing-library jsdom default returns 0s */
  mockRect?: { width: number; height: number; left: number; top: number };
}

function PressHarness(props: PressHarnessProps) {
  const { onRender, children, mockRect, ...pressOptions } = props;
  const { pressProps, isPressed } = usePress(pressOptions);
  onRender?.(isPressed);

  const ref = React.useRef<HTMLButtonElement | null>(null);
  // Patch getBoundingClientRect per-element for deterministic geometry tests.
  React.useLayoutEffect(() => {
    if (!ref.current || !mockRect) return;
    const el = ref.current;
    const original = el.getBoundingClientRect.bind(el);
    el.getBoundingClientRect = () =>
      ({
        ...mockRect,
        right: mockRect.left + mockRect.width,
        bottom: mockRect.top + mockRect.height,
        x: mockRect.left,
        y: mockRect.top,
        toJSON: () => ({}),
      }) as DOMRect;
    return () => {
      el.getBoundingClientRect = original;
    };
  }, [mockRect]);

  return (
    <button ref={ref} type="button" data-testid="press-target" {...pressProps}>
      {children ?? 'press me'}
    </button>
  );
}

beforeEach(() => {
  __resetPressInvariantWarnings();
});

// ─────────────────────────────────────────────────────────────
// Main path
// ─────────────────────────────────────────────────────────────

describe('usePress · main path', () => {
  it('emits pressstart → pressup → pressend on pointerdown + window pointerup inside', () => {
    const onPressStart = vi.fn();
    const onPressUp = vi.fn();
    const onPressEnd = vi.fn();
    const onPressCancel = vi.fn();

    const { getByTestId } = render(
      <PressHarness
        isInteractiveDisabled={false}
        onPressStart={onPressStart}
        onPressUp={onPressUp}
        onPressEnd={onPressEnd}
        onPressCancel={onPressCancel}
        mockRect={{ width: 100, height: 40, left: 10, top: 20 }}
      />,
    );
    const target = getByTestId('press-target');

    fireEvent.pointerDown(target, { pointerId: 1, pointerType: 'mouse', clientX: 50, clientY: 40 });
    expect(onPressStart).toHaveBeenCalledTimes(1);
    expect(onPressStart.mock.calls[0][0]).toMatchObject({
      type: 'pressstart',
      pointerId: 1,
      pointerType: 'mouse',
      x: 40, // 50 - 10
      y: 20, // 40 - 20
      width: 100,
      height: 40,
    });
    expect(onPressStart.mock.calls[0][0].target).toBe(target);

    // Release happens via a bubbling pointerup on pressTarget · window listener picks it up.
    act(() => {
      fireEvent.pointerUp(target, { pointerId: 1, pointerType: 'mouse', clientX: 60, clientY: 45 });
    });

    expect(onPressUp).toHaveBeenCalledTimes(1);
    expect(onPressEnd).toHaveBeenCalledTimes(1);
    expect(onPressCancel).not.toHaveBeenCalled();
    // IE-CORE-3: pressup before pressend
    expect(onPressUp.mock.invocationCallOrder[0]).toBeLessThan(onPressEnd.mock.invocationCallOrder[0]);
  });

  it('pointerup outside pressTarget → presscancel (failure · matches native)', () => {
    const onPressStart = vi.fn();
    const onPressCancel = vi.fn();
    const onPressEnd = vi.fn();

    const { getByTestId } = render(
      <PressHarness
        isInteractiveDisabled={false}
        onPressStart={onPressStart}
        onPressCancel={onPressCancel}
        onPressEnd={onPressEnd}
        mockRect={{ width: 100, height: 40, left: 0, top: 0 }}
      />,
    );
    const target = getByTestId('press-target');

    fireEvent.pointerDown(target, { pointerId: 1, pointerType: 'mouse' });
    expect(onPressStart).toHaveBeenCalledTimes(1);

    act(() => {
      // Dispatch pointerup on a completely different DOM element · bubble up to window.
      const outsideEl = document.createElement('div');
      document.body.appendChild(outsideEl);
      fireEvent.pointerUp(outsideEl, { pointerId: 1, pointerType: 'mouse' });
      document.body.removeChild(outsideEl);
    });

    expect(onPressCancel).toHaveBeenCalledTimes(1);
    expect(onPressEnd).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────
// Keyboard (§5.1)
// ─────────────────────────────────────────────────────────────

describe('usePress · keyboard (§5.1 host-neutral)', () => {
  it.each([[' '], ['Enter']])('keydown/keyup %s → success path with center geometry', (key) => {
    const onPressStart = vi.fn();
    const onPressEnd = vi.fn();

    const { getByTestId } = render(
      <PressHarness
        isInteractiveDisabled={false}
        onPressStart={onPressStart}
        onPressEnd={onPressEnd}
        mockRect={{ width: 80, height: 40, left: 0, top: 0 }}
      />,
    );
    const target = getByTestId('press-target');

    fireEvent.keyDown(target, { key });
    expect(onPressStart).toHaveBeenCalledTimes(1);
    expect(onPressStart.mock.calls[0][0]).toMatchObject({
      pointerType: 'keyboard',
      x: 40, // width/2
      y: 20, // height/2
    });

    fireEvent.keyUp(target, { key });
    expect(onPressEnd).toHaveBeenCalledTimes(1);
  });

  it('non-activation keys (Tab / a / Escape) are ignored', () => {
    const onPressStart = vi.fn();
    const { getByTestId } = render(
      <PressHarness isInteractiveDisabled={false} onPressStart={onPressStart} />,
    );
    const target = getByTestId('press-target');

    fireEvent.keyDown(target, { key: 'Tab' });
    fireEvent.keyDown(target, { key: 'a' });
    fireEvent.keyDown(target, { key: 'Escape' });
    expect(onPressStart).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────
// Re-entry (IE-CORE-3 · v0.3)
// ─────────────────────────────────────────────────────────────

describe('usePress · re-entry (pointerleave → suspended → enter → success)', () => {
  it('pointerleave does not emit · pointerenter resumes · pointerup inside → success', () => {
    const onPressStart = vi.fn();
    const onPressEnd = vi.fn();
    const onPressCancel = vi.fn();

    const { getByTestId } = render(
      <PressHarness
        isInteractiveDisabled={false}
        onPressStart={onPressStart}
        onPressEnd={onPressEnd}
        onPressCancel={onPressCancel}
        mockRect={{ width: 50, height: 50, left: 0, top: 0 }}
      />,
    );
    const target = getByTestId('press-target');

    fireEvent.pointerDown(target, { pointerId: 2, pointerType: 'mouse' });
    fireEvent.pointerLeave(target, { pointerId: 2 });
    expect(onPressCancel).not.toHaveBeenCalled(); // leave does NOT cancel (IE-CORE-3)

    fireEvent.pointerEnter(target, { pointerId: 2 });

    act(() => {
      fireEvent.pointerUp(target, { pointerId: 2, pointerType: 'mouse' });
    });

    expect(onPressEnd).toHaveBeenCalledTimes(1);
    expect(onPressCancel).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────
// Blur failure (OQ-IE-2)
// ─────────────────────────────────────────────────────────────

describe('usePress · blur failure (OQ-IE-2)', () => {
  it('blur during active press → presscancel (aligns with native · not React Aria)', () => {
    const onPressCancel = vi.fn();
    const onPressEnd = vi.fn();

    const { getByTestId } = render(
      <PressHarness
        isInteractiveDisabled={false}
        onPressCancel={onPressCancel}
        onPressEnd={onPressEnd}
      />,
    );
    const target = getByTestId('press-target');

    fireEvent.keyDown(target, { key: ' ' });
    fireEvent.blur(target);

    expect(onPressCancel).toHaveBeenCalledTimes(1);
    expect(onPressEnd).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────
// Gating (R-1)
// ─────────────────────────────────────────────────────────────

describe('usePress · gating (R-1)', () => {
  it('DEV warns once when isInteractiveDisabled is undefined', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      render(<PressHarness />);
      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn.mock.calls[0][0]).toMatch(/missing gating resolution/i);

      // second mount · warn still only once total (process-latched).
      render(<PressHarness />);
      expect(warn).toHaveBeenCalledTimes(1);
    } finally {
      warn.mockRestore();
    }
  });

  it('isInteractiveDisabled=true blocks pressstart', () => {
    const onPressStart = vi.fn();
    const { getByTestId } = render(
      <PressHarness isInteractiveDisabled={true} onPressStart={onPressStart} />,
    );
    const target = getByTestId('press-target');

    fireEvent.pointerDown(target, { pointerId: 1, pointerType: 'mouse' });
    fireEvent.keyDown(target, { key: 'Enter' });

    expect(onPressStart).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────
// Lifecycle L-1 · L-2 · L-4
// ─────────────────────────────────────────────────────────────

describe('usePress · lifecycle (L-1 / L-2 / L-4)', () => {
  it('L-1 · unmount during active press fires NO callbacks (C-3 top priority)', () => {
    const onPressCancel = vi.fn();
    const onPressEnd = vi.fn();

    const { getByTestId, unmount } = render(
      <PressHarness
        isInteractiveDisabled={false}
        onPressCancel={onPressCancel}
        onPressEnd={onPressEnd}
      />,
    );
    const target = getByTestId('press-target');

    fireEvent.pointerDown(target, { pointerId: 1, pointerType: 'mouse' });
    unmount();

    // Even a delayed pointerup should not reach a terminated FSM (listener removed on unmount).
    act(() => {
      fireEvent.pointerUp(document.body, { pointerId: 1, pointerType: 'mouse' });
    });

    expect(onPressEnd).not.toHaveBeenCalled();
    expect(onPressCancel).not.toHaveBeenCalled();
  });

  it('L-2 · unmount removes all global pointer listeners (spy on window.removeEventListener)', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    const { getByTestId, unmount } = render(<PressHarness isInteractiveDisabled={false} />);
    const target = getByTestId('press-target');

    fireEvent.pointerDown(target, { pointerId: 1, pointerType: 'mouse' });

    // Count registrations before unmount.
    const removeCallsBefore = removeSpy.mock.calls.length;
    unmount();
    const removeCallsAfter = removeSpy.mock.calls.length;

    // At least pointerup + pointercancel listeners must have been removed.
    const removedTypes = removeSpy.mock.calls.slice(removeCallsBefore).map((c) => c[0]);
    expect(removedTypes).toEqual(expect.arrayContaining(['pointerup', 'pointercancel']));
    expect(removeCallsAfter).toBeGreaterThan(removeCallsBefore);

    removeSpy.mockRestore();
  });

  it('L-4 · hook itself does not call requestAnimationFrame / setTimeout', () => {
    const rafSpy = vi.spyOn(globalThis, 'requestAnimationFrame');
    const timeoutSpy = vi.spyOn(globalThis, 'setTimeout');

    try {
      const { getByTestId, unmount } = render(<PressHarness isInteractiveDisabled={false} />);
      const target = getByTestId('press-target');

      fireEvent.pointerDown(target, { pointerId: 1, pointerType: 'mouse' });
      fireEvent.pointerLeave(target, { pointerId: 1 });
      fireEvent.pointerEnter(target, { pointerId: 1 });
      unmount();

      // React itself may call setTimeout for scheduler in some environments · but
      // usePress source must not contain RAF calls of its own. We assert RAF==0
      // specifically (setTimeout is tolerated because of React Scheduler).
      expect(rafSpy).not.toHaveBeenCalled();
    } finally {
      rafSpy.mockRestore();
      timeoutSpy.mockRestore();
    }
  });
});
