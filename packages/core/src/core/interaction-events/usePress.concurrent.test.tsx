/**
 * Stage-10 · L2 Interaction Events · Concurrency & race condition tests
 *
 * Coverage matrix (interaction-events.md §10.2 · C-1 ~ C-5):
 *   · C-1 · iPad two-finger independent FSMs (per-pointerId reducer)
 *   · C-2 · pressstart → setDisabled(true) → synchronous presscancel
 *   · C-3 · unmount top-priority terminate (also covered by usePress.test L-1 · sanity repeat)
 *   · C-4 · <100ms rapid double-click each fully independent
 *   · C-5 · duplicate pressstart on same pointerId → DEV warn + ignore
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { usePress } from './usePress';
import { __resetPressInvariantWarnings } from './press-invariants';
import type { UsePressOptions } from './types';

interface PressHarnessProps extends UsePressOptions {
  children?: React.ReactNode;
}

function PressHarness(props: PressHarnessProps) {
  const { children, ...pressOptions } = props;
  const { pressProps, isPressed } = usePress(pressOptions);
  return (
    <button type="button" data-testid="press-target" data-pressed={isPressed} {...pressProps}>
      {children ?? 'press me'}
    </button>
  );
}

beforeEach(() => {
  __resetPressInvariantWarnings();
});

// ─────────────────────────────────────────────────────────────
// C-1 · Concurrent pointerIds (independent FSMs)
// ─────────────────────────────────────────────────────────────

describe('usePress · C-1 concurrent pointerIds (iPad two-finger)', () => {
  it('two pointerdown events with different pointerIds run independent FSMs', () => {
    const onPressStart = vi.fn();
    const onPressEnd = vi.fn();
    const onPressCancel = vi.fn();

    const { getByTestId } = render(
      <PressHarness
        isInteractiveDisabled={false}
        onPressStart={onPressStart}
        onPressEnd={onPressEnd}
        onPressCancel={onPressCancel}
      />,
    );
    const target = getByTestId('press-target');

    // Finger A (pointerId: 1) presses.
    fireEvent.pointerDown(target, { pointerId: 1, pointerType: 'touch' });
    expect(onPressStart).toHaveBeenCalledTimes(1);
    expect(onPressStart.mock.calls[0][0].pointerId).toBe(1);

    // Finger B (pointerId: 2) presses while A is still active.
    fireEvent.pointerDown(target, { pointerId: 2, pointerType: 'touch' });
    expect(onPressStart).toHaveBeenCalledTimes(2);
    expect(onPressStart.mock.calls[1][0].pointerId).toBe(2);

    // Release finger A first. Finger B FSM must remain active.
    act(() => {
      fireEvent.pointerUp(target, { pointerId: 1, pointerType: 'touch' });
    });
    expect(onPressEnd).toHaveBeenCalledTimes(1);
    expect(onPressEnd.mock.calls[0][0].pointerId).toBe(1);
    expect(onPressCancel).not.toHaveBeenCalled();

    // Release finger B. Its independent success path fires.
    act(() => {
      fireEvent.pointerUp(target, { pointerId: 2, pointerType: 'touch' });
    });
    expect(onPressEnd).toHaveBeenCalledTimes(2);
    expect(onPressEnd.mock.calls[1][0].pointerId).toBe(2);
    expect(onPressCancel).not.toHaveBeenCalled();
  });

  it('pointerup for a non-matching pointerId does not affect other FSMs', () => {
    const onPressStart = vi.fn();
    const onPressEnd = vi.fn();
    const onPressCancel = vi.fn();

    const { getByTestId } = render(
      <PressHarness
        isInteractiveDisabled={false}
        onPressStart={onPressStart}
        onPressEnd={onPressEnd}
        onPressCancel={onPressCancel}
      />,
    );
    const target = getByTestId('press-target');

    fireEvent.pointerDown(target, { pointerId: 10, pointerType: 'touch' });
    // A pointerup for an unrelated pointerId 999 must not fire any callback.
    act(() => {
      fireEvent.pointerUp(target, { pointerId: 999, pointerType: 'touch' });
    });
    expect(onPressEnd).not.toHaveBeenCalled();
    expect(onPressCancel).not.toHaveBeenCalled();

    // Original press can still complete normally.
    act(() => {
      fireEvent.pointerUp(target, { pointerId: 10, pointerType: 'touch' });
    });
    expect(onPressEnd).toHaveBeenCalledTimes(1);
    expect(onPressEnd.mock.calls[0][0].pointerId).toBe(10);
  });
});

// ─────────────────────────────────────────────────────────────
// C-2 · Synchronous disabled-flip
// ─────────────────────────────────────────────────────────────

describe('usePress · C-2 disabled-flip synchronous presscancel', () => {
  it('pressstart → rerender with isInteractiveDisabled=true → presscancel fires BEFORE any pointerup', () => {
    const onPressStart = vi.fn();
    const onPressEnd = vi.fn();
    const onPressCancel = vi.fn();

    const { getByTestId, rerender } = render(
      <PressHarness
        isInteractiveDisabled={false}
        onPressStart={onPressStart}
        onPressEnd={onPressEnd}
        onPressCancel={onPressCancel}
      />,
    );
    const target = getByTestId('press-target');

    fireEvent.pointerDown(target, { pointerId: 1, pointerType: 'mouse' });
    expect(onPressStart).toHaveBeenCalledTimes(1);
    expect(onPressCancel).not.toHaveBeenCalled();

    // Flip disabled → true. C-2 contract: this fires presscancel synchronously.
    rerender(
      <PressHarness
        isInteractiveDisabled={true}
        onPressStart={onPressStart}
        onPressEnd={onPressEnd}
        onPressCancel={onPressCancel}
      />,
    );

    expect(onPressCancel).toHaveBeenCalledTimes(1);
    expect(onPressEnd).not.toHaveBeenCalled();

    // Subsequent pointerup on the now-terminated FSM is a no-op.
    act(() => {
      fireEvent.pointerUp(target, { pointerId: 1, pointerType: 'mouse' });
    });
    expect(onPressEnd).not.toHaveBeenCalled();
    expect(onPressCancel).toHaveBeenCalledTimes(1); // still only the flip cancel
  });
});

// ─────────────────────────────────────────────────────────────
// C-4 · Rapid double-click (each lifecycle independent)
// ─────────────────────────────────────────────────────────────

describe('usePress · C-4 rapid double-click (<100ms)', () => {
  it('two complete lifecycles back-to-back produce two independent pressend events', () => {
    const onPressStart = vi.fn();
    const onPressEnd = vi.fn();

    const { getByTestId } = render(
      <PressHarness
        isInteractiveDisabled={false}
        onPressStart={onPressStart}
        onPressEnd={onPressEnd}
      />,
    );
    const target = getByTestId('press-target');

    // First press (fully terminated).
    fireEvent.pointerDown(target, { pointerId: 1, pointerType: 'mouse' });
    act(() => {
      fireEvent.pointerUp(target, { pointerId: 1, pointerType: 'mouse' });
    });

    // Second press immediately after · new pointerId to simulate fresh press (or same pointerId).
    fireEvent.pointerDown(target, { pointerId: 1, pointerType: 'mouse' });
    act(() => {
      fireEvent.pointerUp(target, { pointerId: 1, pointerType: 'mouse' });
    });

    expect(onPressStart).toHaveBeenCalledTimes(2);
    expect(onPressEnd).toHaveBeenCalledTimes(2);
  });
});

// ─────────────────────────────────────────────────────────────
// C-5 · Duplicate pressstart on same pointerId
// ─────────────────────────────────────────────────────────────

describe('usePress · C-5 duplicate pressstart on same pointerId', () => {
  it('second pointerdown on already-active pointerId is ignored + DEV warns once', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const onPressStart = vi.fn();

    try {
      const { getByTestId } = render(
        <PressHarness isInteractiveDisabled={false} onPressStart={onPressStart} />,
      );
      const target = getByTestId('press-target');

      fireEvent.pointerDown(target, { pointerId: 1, pointerType: 'mouse' });
      expect(onPressStart).toHaveBeenCalledTimes(1);

      // Second pointerdown on same pointerId (FSM still active) → ignored.
      fireEvent.pointerDown(target, { pointerId: 1, pointerType: 'mouse' });
      expect(onPressStart).toHaveBeenCalledTimes(1);

      // DEV warn fires once per process.
      const duplicateWarns = warn.mock.calls.filter((c) =>
        String(c[0]).includes('duplicate pressstart'),
      );
      expect(duplicateWarns.length).toBe(1);
    } finally {
      warn.mockRestore();
    }
  });
});
