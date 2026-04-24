/**
 * Stage-10 · L4 Feedback · `useFeedback` tests
 *
 * Contract: `@/devdocs/system/feedback-contract.md` v0.2 §5 + §6.6 + §9.2
 *
 * Coverage:
 *   · Controller identity stability across renders (OQ-FB-4)
 *   · updateFactories propagation on factories prop change (§6.6)
 *   · Unmount disposes active instances + detaches matchMedia (L-F1 / L-F3)
 *   · No SSR-unsafe API use on mount (matchMedia mocked)
 */

import { act, render } from '@testing-library/react';
import { useEffect, useRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { FeedbackController, FeedbackFactory } from './types';
import { useFeedback } from './useFeedback';

// ── matchMedia mock (reused style from FeedbackController.test.ts) ──
type MediaQueryListener = (e: MediaQueryListEvent) => void;

interface MockMediaQueryList {
  matches: boolean;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
  addListener: ReturnType<typeof vi.fn>;
  removeListener: ReturnType<typeof vi.fn>;
  media: string;
  onchange: MediaQueryListener | null;
  dispatchEvent: (event: Event) => boolean;
}

let currentMedia: MockMediaQueryList | null = null;

beforeEach(() => {
  const media: MockMediaQueryList = {
    matches: false,
    media: '(prefers-reduced-motion: reduce)',
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: () => false,
  };
  currentMedia = media;
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: () => media,
  });
});

afterEach(() => {
  currentMedia = null;
  // @ts-expect-error · cleanup test double
  delete window.matchMedia;
});

// ─────────────────────────────────────────────────────────────────────
// Tracked factory (mirrors FeedbackController.test.ts style)
// ─────────────────────────────────────────────────────────────────────

interface TrackedFactory extends FeedbackFactory {
  readonly created: { id: string; pointerId: number }[];
  readonly disposed: Set<string>;
}

function createTrackedFactory(name: string): TrackedFactory {
  const created: { id: string; pointerId: number }[] = [];
  const disposed = new Set<string>();
  let counter = 0;
  return {
    name,
    created,
    disposed,
    create({ event }) {
      if (event.source !== 'press') throw new Error('press only');
      const id = `${name}-${counter++}`;
      created.push({ id, pointerId: event.pointerId });
      let isDisposed = false;
      return {
        id,
        pointerId: event.pointerId,
        source: 'press',
        start() {},
        finish() {},
        cancel() {},
        dispose() {
          if (isDisposed) return;
          isDisposed = true;
          disposed.add(id);
        },
      };
    },
  };
}

function makePressEvent(pointerId = 1) {
  const target = document.createElement('button');
  return {
    type: 'pressstart' as const,
    pointerType: 'mouse' as const,
    pointerId,
    target,
    originalTarget: target,
    path: [target],
    x: 0,
    y: 0,
    width: 10,
    height: 10,
    timestamp: 0,
    modifiers: { ctrl: false, shift: false, alt: false, meta: false },
  };
}

// ─────────────────────────────────────────────────────────────────────
// Harness helpers
// ─────────────────────────────────────────────────────────────────────

interface HostProps {
  factories: FeedbackFactory[];
  /** Captures the controller reference each render for identity checks. */
  onController?: (c: FeedbackController) => void;
}

function Host({ factories, onController }: HostProps) {
  const controller = useFeedback(factories);
  // Report the controller every commit so the test can compare identities.
  useEffect(() => {
    onController?.(controller);
  });
  return <div data-testid="host" />;
}

// ─────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────

describe('useFeedback', () => {
  it('returns a stable FeedbackController reference across re-renders (OQ-FB-4)', () => {
    const seen: FeedbackController[] = [];
    const factory = createTrackedFactory('a');
    const onController = (c: FeedbackController) => {
      seen.push(c);
    };

    const view = render(<Host factories={[factory]} onController={onController} />);
    view.rerender(<Host factories={[factory]} onController={onController} />);
    view.rerender(<Host factories={[factory]} onController={onController} />);

    expect(seen.length).toBeGreaterThanOrEqual(3);
    const first = seen[0];
    for (const next of seen) {
      expect(next).toBe(first);
    }
  });

  it('propagates factory updates without rebuilding the controller (§6.6)', () => {
    const refCell = { current: null as FeedbackController | null };
    function Probe({ factories }: { factories: FeedbackFactory[] }) {
      const c = useFeedback(factories);
      const storedRef = useRef<FeedbackController | null>(null);
      storedRef.current = c;
      refCell.current = c;
      return null;
    }

    const a = createTrackedFactory('a');
    const b = createTrackedFactory('b');

    const view = render(<Probe factories={[a]} />);
    const controllerAfterMount = refCell.current;

    view.rerender(<Probe factories={[b]} />);
    const controllerAfterUpdate = refCell.current;

    expect(controllerAfterMount).toBe(controllerAfterUpdate);

    // Fire a press to see which factory is active now.
    act(() => {
      controllerAfterUpdate!.pressHandlers.onPressStart(makePressEvent(1));
    });

    expect(a.created).toHaveLength(0);
    expect(b.created).toHaveLength(1);
  });

  it('disposes every active instance on unmount (L-F1)', () => {
    const factory = createTrackedFactory('a');
    let controller: FeedbackController | null = null;
    function Probe() {
      controller = useFeedback([factory]);
      return null;
    }
    const view = render(<Probe />);

    act(() => {
      controller!.pressHandlers.onPressStart(makePressEvent(1));
      controller!.pressHandlers.onPressStart(makePressEvent(2));
    });
    expect(factory.created).toHaveLength(2);
    expect(factory.disposed.size).toBe(0);

    view.unmount();

    expect(factory.disposed.size).toBe(2);
  });

  it('detaches the matchMedia change listener on unmount (L-F3)', () => {
    const factory = createTrackedFactory('a');
    const view = render(<Host factories={[factory]} />);

    view.unmount();

    expect(currentMedia?.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });
});
