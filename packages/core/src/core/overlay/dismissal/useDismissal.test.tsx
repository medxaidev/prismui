/**
 * Stage-11 · L0 Overlay Foundation · `useDismissal` hook tests
 *
 * Contract: `@/devdocs/system/dismissal-primitive.md` v0.1.2 §10 (D-1 ~ D-4 +
 * cancel · §10.5 secondary)
 */

import React from 'react';
import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  DismissalStack,
  __resetDismissalStack,
  useDismissal,
  type DismissalReason,
  type UseDismissalOptions,
  type UseDismissalResult,
} from './index';

// ─────────────────────────────────────────────────────────────────────────────
// Test harness
// ─────────────────────────────────────────────────────────────────────────────

interface HarnessProps extends Omit<UseDismissalOptions, 'overlayRef' | 'onDismiss'> {
  onDismiss: UseDismissalOptions['onDismiss'];
  attachOverlay?: boolean; // default true
  attachTrigger?: boolean; // default false
  onResult?: (result: UseDismissalResult) => void;
  /** Optional id for the overlay element (used by some tests). */
  overlayId?: string;
}

function DismissalHarness({
  onDismiss,
  attachOverlay = true,
  attachTrigger = false,
  onResult,
  overlayId,
  ...rest
}: HarnessProps) {
  const overlayRef = React.useRef<HTMLDivElement | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);

  const result = useDismissal({
    overlayRef,
    triggerRef: attachTrigger ? triggerRef : undefined,
    onDismiss,
    ...rest,
  });
  onResult?.(result);

  return (
    <div>
      {attachTrigger && (
        <button ref={triggerRef} data-testid="trigger" type="button">
          trigger
        </button>
      )}
      {attachOverlay && (
        <div ref={overlayRef} id={overlayId} data-testid="overlay">
          <span data-testid="overlay-child">inside</span>
        </div>
      )}
      <div data-testid="outside">outside</div>
    </div>
  );
}

function dispatchPointerDown(target: Element, init: PointerEventInit = {}) {
  const event = new PointerEvent('pointerdown', {
    bubbles: true,
    cancelable: true,
    pointerType: 'mouse',
    ...init,
  });
  target.dispatchEvent(event);
}

function dispatchClick(target: Element) {
  target.dispatchEvent(
    new MouseEvent('click', { bubbles: true, cancelable: true }),
  );
}

function dispatchKeyDown(key: string, init: KeyboardEventInit = {}) {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...init,
  });
  window.dispatchEvent(event);
}

function dispatchFocusIn(target: Element) {
  target.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
}

function dispatchScroll(target: EventTarget = document) {
  target.dispatchEvent(new Event('scroll', { bubbles: true }));
}

beforeEach(() => {
  __resetDismissalStack();
});

afterEach(() => {
  __resetDismissalStack();
});

// ─────────────────────────────────────────────────────────────────────────────
// D-1 · DismissalStack 嵌套 Esc
// ─────────────────────────────────────────────────────────────────────────────

describe('useDismissal · D-1 · stack nesting (escape-key)', () => {
  it('single layer · Escape triggers onDismiss once', () => {
    const onDismiss = vi.fn();
    render(
      <DismissalHarness onDismiss={onDismiss} escapeKey />,
    );
    dispatchKeyDown('Escape');
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledWith('escape-key', expect.any(KeyboardEvent));
  });

  it('three nested layers · Escape only fires top entry', () => {
    const a = vi.fn();
    const b = vi.fn();
    const c = vi.fn();
    render(
      <>
        <DismissalHarness onDismiss={a} escapeKey />
        <DismissalHarness onDismiss={b} escapeKey />
        <DismissalHarness onDismiss={c} escapeKey />
      </>,
    );
    dispatchKeyDown('Escape');
    expect(a).not.toHaveBeenCalled();
    expect(b).not.toHaveBeenCalled();
    expect(c).toHaveBeenCalledTimes(1);
  });

  it('non-top layer with escapeKey: true stays silent', () => {
    const middle = vi.fn();
    const top = vi.fn();
    render(
      <>
        <DismissalHarness onDismiss={middle} escapeKey />
        <DismissalHarness onDismiss={top} escapeKey />
      </>,
    );
    dispatchKeyDown('Escape');
    expect(middle).not.toHaveBeenCalled();
    expect(top).toHaveBeenCalledTimes(1);
  });

  it('IME composition · Escape ignored', () => {
    const onDismiss = vi.fn();
    render(<DismissalHarness onDismiss={onDismiss} escapeKey />);
    dispatchKeyDown('Escape', { isComposing: true });
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('keyCode 229 legacy IME · Escape ignored', () => {
    const onDismiss = vi.fn();
    render(<DismissalHarness onDismiss={onDismiss} escapeKey />);
    // Construct a KeyboardEvent with keyCode = 229 (legacy IME signal).
    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    Object.defineProperty(event, 'keyCode', { value: 229 });
    window.dispatchEvent(event);
    expect(onDismiss).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// D-2 · OV-DISMISS-3 trigger 自反互斥 (default pointerdown)
// ─────────────────────────────────────────────────────────────────────────────

describe('useDismissal · D-2 · trigger self-reflexive exclusion', () => {
  it('pointerdown on trigger · onDismiss not called', () => {
    const onDismiss = vi.fn();
    const { getByTestId } = render(
      <DismissalHarness onDismiss={onDismiss} pointerOutside attachTrigger />,
    );
    act(() => dispatchPointerDown(getByTestId('trigger')));
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('pointerdown inside overlay · onDismiss not called', () => {
    const onDismiss = vi.fn();
    const { getByTestId } = render(
      <DismissalHarness onDismiss={onDismiss} pointerOutside attachTrigger />,
    );
    act(() => dispatchPointerDown(getByTestId('overlay-child')));
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('pointerdown outside · onDismiss called once with reason pointer-outside', () => {
    const onDismiss = vi.fn();
    const { getByTestId } = render(
      <DismissalHarness onDismiss={onDismiss} pointerOutside attachTrigger />,
    );
    act(() => dispatchPointerDown(getByTestId('outside')));
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledWith('pointer-outside', expect.any(PointerEvent));
  });

  it('trigger: "click" branch · click outside fires · pointerdown outside ignored', () => {
    const onDismiss = vi.fn();
    const { getByTestId } = render(
      <DismissalHarness
        onDismiss={onDismiss}
        pointerOutside={{ trigger: 'click' }}
        attachTrigger
      />,
    );
    act(() => dispatchPointerDown(getByTestId('outside')));
    expect(onDismiss).not.toHaveBeenCalled();
    act(() => dispatchClick(getByTestId('outside')));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('triggerRef undefined · only overlay boundary applied', () => {
    const onDismiss = vi.fn();
    const { getByTestId } = render(
      <DismissalHarness onDismiss={onDismiss} pointerOutside />,
    );
    act(() => dispatchPointerDown(getByTestId('outside')));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// D-3 · 多 channel 同步轮次幂等
// ─────────────────────────────────────────────────────────────────────────────

describe('useDismissal · D-3 · multi-channel idempotence (synchronous round)', () => {
  it('Escape + pointer dispatched in same round · onDismiss called once', () => {
    const onDismiss = vi.fn();
    const { getByTestId } = render(
      <DismissalHarness onDismiss={onDismiss} pointerOutside escapeKey />,
    );
    act(() => {
      dispatchKeyDown('Escape');
      dispatchPointerDown(getByTestId('outside'));
    });
    expect(onDismiss).toHaveBeenCalledTimes(1);
    // escape-key (priority 2) wins over pointer-outside (priority 3).
    expect(onDismiss.mock.calls[0]![0]).toBe('escape-key');
  });

  it('programmatic + escape · programmatic wins (priority)', () => {
    const onDismiss = vi.fn();
    let result: UseDismissalResult | undefined;
    render(
      <DismissalHarness
        onDismiss={onDismiss}
        escapeKey
        onResult={(r) => (result = r)}
      />,
    );
    act(() => {
      result!.close();
      dispatchKeyDown('Escape');
    });
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onDismiss.mock.calls[0]![0]).toBe('programmatic-close');
  });

  it('next round dispatches independently (not merged across ticks)', async () => {
    const onDismiss = vi.fn();
    const { getByTestId } = render(
      <DismissalHarness onDismiss={onDismiss} pointerOutside escapeKey />,
    );
    act(() => dispatchKeyDown('Escape'));
    // > 1ms gap so the second dispatch falls outside the dedup window.
    await new Promise((r) => setTimeout(r, 5));
    act(() => dispatchPointerDown(getByTestId('outside')));
    expect(onDismiss).toHaveBeenCalledTimes(2);
  });

  it('two hook instances do NOT share the dedup latch', () => {
    const a = vi.fn();
    const b = vi.fn();
    render(
      <>
        <DismissalHarness onDismiss={a} focusOutside />
        <DismissalHarness onDismiss={b} focusOutside />
      </>,
    );
    // Outside focus event fires both layers (focus-outside is independent of stack).
    const outside = document.createElement('div');
    document.body.appendChild(outside);
    act(() => dispatchFocusIn(outside));
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
    document.body.removeChild(outside);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// D-4 · Unmount cleanup
// ─────────────────────────────────────────────────────────────────────────────

describe('useDismissal · D-4 · unmount cleanup', () => {
  it('unmount removes entry from stack', () => {
    const { unmount } = render(<DismissalHarness onDismiss={() => {}} escapeKey />);
    expect(DismissalStack.size()).toBe(1);
    unmount();
    expect(DismissalStack.size()).toBe(0);
  });

  it('unmount stops dispatching to that entry', () => {
    const onDismiss = vi.fn();
    const { unmount } = render(
      <DismissalHarness onDismiss={onDismiss} escapeKey />,
    );
    unmount();
    dispatchKeyDown('Escape');
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('enabled: false unregisters and stays silent', () => {
    const onDismiss = vi.fn();
    const { rerender } = render(
      <DismissalHarness onDismiss={onDismiss} escapeKey />,
    );
    expect(DismissalStack.size()).toBe(1);
    rerender(<DismissalHarness onDismiss={onDismiss} escapeKey enabled={false} />);
    expect(DismissalStack.size()).toBe(0);
    dispatchKeyDown('Escape');
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('last entry unmount tears down global keydown listener', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = render(<DismissalHarness onDismiss={() => {}} escapeKey />);
    unmount();
    expect(
      removeSpy.mock.calls.some(([type]) => type === 'keydown'),
    ).toBe(true);
    removeSpy.mockRestore();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// cancel return value (P0-2)
// ─────────────────────────────────────────────────────────────────────────────

describe('useDismissal · cancel via return false (P0-2)', () => {
  it('returning false prevents the dismissal flow continuing', () => {
    const onDismiss = vi.fn().mockReturnValue(false);
    render(<DismissalHarness onDismiss={onDismiss} escapeKey />);
    dispatchKeyDown('Escape');
    expect(onDismiss).toHaveBeenCalledTimes(1);
    // No additional dispatch — but if cancel reset the latch, the next event
    // can still proceed (asserted below).
  });

  it('returning void / true allows further dispatch in next round', async () => {
    const onDismiss = vi.fn();
    const { getByTestId } = render(
      <DismissalHarness onDismiss={onDismiss} pointerOutside escapeKey />,
    );
    dispatchKeyDown('Escape');
    await new Promise((r) => setTimeout(r, 5));
    act(() => dispatchPointerDown(getByTestId('outside')));
    expect(onDismiss).toHaveBeenCalledTimes(2);
  });

  it('cancel resets latch · subsequent same-tick event can still trigger', () => {
    // Consumer cancels escape, then a pointer-outside in the same round
    // should still fire because the latch was cleared.
    const reasons: DismissalReason[] = [];
    const onDismiss = vi.fn((reason: DismissalReason) => {
      reasons.push(reason);
      if (reason === 'escape-key') return false;
      return undefined;
    });
    const { getByTestId } = render(
      <DismissalHarness
        onDismiss={onDismiss as UseDismissalOptions['onDismiss']}
        pointerOutside
        escapeKey
      />,
    );
    act(() => {
      dispatchKeyDown('Escape');
      dispatchPointerDown(getByTestId('outside'));
    });
    expect(reasons).toEqual(['escape-key', 'pointer-outside']);
  });

  it('programmatic close passes event === null', () => {
    const onDismiss = vi.fn();
    let result: UseDismissalResult | undefined;
    render(
      <DismissalHarness
        onDismiss={onDismiss}
        escapeKey
        onResult={(r) => (result = r)}
      />,
    );
    act(() => result!.close());
    expect(onDismiss).toHaveBeenCalledWith('programmatic-close', null);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// §10.5 contract tests
// ─────────────────────────────────────────────────────────────────────────────

describe('useDismissal · §10.5 · contract', () => {
  it('enabled: false · hook is a noop (no register, no listener)', () => {
    const onDismiss = vi.fn();
    render(
      <DismissalHarness onDismiss={onDismiss} escapeKey enabled={false} />,
    );
    expect(DismissalStack.size()).toBe(0);
    dispatchKeyDown('Escape');
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('close() in enabled: false is a no-op (P0-1)', () => {
    const onDismiss = vi.fn();
    let result: UseDismissalResult | undefined;
    render(
      <DismissalHarness
        onDismiss={onDismiss}
        enabled={false}
        onResult={(r) => (result = r)}
      />,
    );
    act(() => result!.close());
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('overlayRef null · pointerdown anywhere does NOT dismiss (P1-1)', () => {
    const onDismiss = vi.fn();
    const { getByTestId } = render(
      <DismissalHarness
        onDismiss={onDismiss}
        pointerOutside
        attachOverlay={false}
      />,
    );
    act(() => dispatchPointerDown(getByTestId('outside')));
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('focus-outside ignores stack (every layer judges independently)', () => {
    const a = vi.fn();
    const b = vi.fn();
    render(
      <>
        <DismissalHarness onDismiss={a} focusOutside />
        <DismissalHarness onDismiss={b} focusOutside />
      </>,
    );
    const outside = document.createElement('div');
    document.body.appendChild(outside);
    act(() => dispatchFocusIn(outside));
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
    document.body.removeChild(outside);
  });

  it('scroll-outside · document scroll fires (passive listener)', () => {
    const addSpy = vi.spyOn(document, 'addEventListener');
    const onDismiss = vi.fn();
    render(<DismissalHarness onDismiss={onDismiss} scrollOutside />);
    const scrollCall = addSpy.mock.calls.find(([type]) => type === 'scroll');
    expect(scrollCall).toBeDefined();
    expect(scrollCall![2]).toMatchObject({ capture: true, passive: true });
    act(() => dispatchScroll(document));
    expect(onDismiss).toHaveBeenCalledWith('scroll-outside', expect.any(Event));
    addSpy.mockRestore();
  });

  it('isTopOfStack reactive · push/pop updates value', () => {
    const seenA: boolean[] = [];
    const seenB: boolean[] = [];
    const a = vi.fn();
    const b = vi.fn();
    const HarnessA = () => {
      const ref = React.useRef<HTMLDivElement | null>(null);
      const { isTopOfStack } = useDismissal({
        overlayRef: ref,
        onDismiss: a,
        escapeKey: true,
      });
      seenA.push(isTopOfStack);
      return <div ref={ref} />;
    };
    const HarnessB = () => {
      const ref = React.useRef<HTMLDivElement | null>(null);
      const { isTopOfStack } = useDismissal({
        overlayRef: ref,
        onDismiss: b,
        escapeKey: true,
      });
      seenB.push(isTopOfStack);
      return <div ref={ref} />;
    };
    const { rerender } = render(<HarnessA />);
    rerender(
      <>
        <HarnessA />
        <HarnessB />
      </>,
    );
    // After both mount, B should be the top.
    expect(seenA[seenA.length - 1]).toBe(false);
    expect(seenB[seenB.length - 1]).toBe(true);
  });

  it('Strict Mode double-invoke · register dedup keeps stack at size 1', () => {
    render(
      <React.StrictMode>
        <DismissalHarness onDismiss={() => {}} escapeKey />
      </React.StrictMode>,
    );
    expect(DismissalStack.size()).toBe(1);
  });

  it('public API surface matches contract', async () => {
    // Compile-time + runtime sanity: barrel exports the documented symbols
    // and nothing internal.
    const mod = await import('./index');
    const keys = Object.keys(mod).sort();
    expect(keys).toEqual(
      ['DismissalStack', '__resetDismissalStack', 'useDismissal'].sort(),
    );
  });

  it('SSR safe · DismissalStack methods callable without DOM', () => {
    // Sanity — module load and `DismissalStack.size()` work in any env.
    expect(typeof DismissalStack.size).toBe('function');
    expect(DismissalStack.size()).toBe(0);
  });

  it('pointerTypes filter · touch ignored when whitelist is mouse/pen', () => {
    const onDismiss = vi.fn();
    const { getByTestId } = render(
      <DismissalHarness
        onDismiss={onDismiss}
        pointerOutside={{ trigger: 'pointerdown', pointerTypes: ['mouse', 'pen'] }}
      />,
    );
    act(() =>
      dispatchPointerDown(getByTestId('outside'), { pointerType: 'touch' }),
    );
    expect(onDismiss).not.toHaveBeenCalled();
    act(() =>
      dispatchPointerDown(getByTestId('outside'), { pointerType: 'mouse' }),
    );
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
