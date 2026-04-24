/**
 * Stage-10 · L4 Feedback · `FeedbackController` tests
 *
 * Contract: `@/devdocs/system/feedback-contract.md` v0.2
 *
 * Coverage:
 *   · Ingress / Egress separation (FB-ARCH-3.1 / 3.3)
 *   · Dispatch order (FB-ARCH-3.2)
 *   · Managed Ephemeral Instances lifecycle (FB-2 / 2.1 / 2.3)
 *   · Concurrent pointerId isolation (C-1)
 *   · updateFactories policy (§6.6 · OQ-FB-12)
 *   · reduced-motion main guarantee (§9.1 · OQ-FB-8)
 *   · Unmount dispose (L-F1 / L-F3)
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { PressEvent } from '../interaction-events';

import {
  createFeedbackController,
  type CreateFeedbackControllerResult,
} from './FeedbackController';
import type {
  FeedbackFactory,
  FeedbackInstance,
  InteractionEvent,
  PressHandlers,
} from './types';

// ─────────────────────────────────────────────────────────────────────
// Test fixtures
// ─────────────────────────────────────────────────────────────────────

interface TrackedInstance extends FeedbackInstance {
  readonly calls: {
    start: InteractionEvent[];
    finish: number;
    cancel: number;
    dispose: number;
  };
}

function createTrackedFactory(name = 'tracked'): FeedbackFactory & {
  readonly instances: TrackedInstance[];
} {
  const instances: TrackedInstance[] = [];

  const factory: FeedbackFactory = {
    name,
    create({ event }) {
      if (event.source !== 'press') {
        // Keep the tracker simple · Phase 2 press-only.
        throw new Error(`tracked factory only supports press source (got ${event.source})`);
      }
      const calls = { start: [] as InteractionEvent[], finish: 0, cancel: 0, dispose: 0 };
      let disposed = false;
      const instance: TrackedInstance = {
        id: `${name}-${instances.length}`,
        pointerId: event.pointerId,
        source: 'press',
        calls,
        start(e) {
          if (disposed) return;
          calls.start.push(e);
        },
        finish() {
          if (disposed) return;
          calls.finish += 1;
        },
        cancel() {
          if (disposed) return;
          calls.cancel += 1;
        },
        dispose() {
          if (disposed) return;
          disposed = true;
          calls.dispose += 1;
        },
      };
      instances.push(instance);
      return instance;
    },
  };

  return Object.assign(factory, { instances });
}

function makePressEvent(overrides: Partial<PressEvent> = {}): PressEvent {
  const target = document.createElement('button');
  return {
    type: 'pressstart',
    pointerType: 'mouse',
    pointerId: 1,
    target,
    originalTarget: target,
    path: [target],
    x: 10,
    y: 20,
    width: 100,
    height: 40,
    timestamp: 123,
    modifiers: { ctrl: false, shift: false, alt: false, meta: false },
    ...overrides,
  };
}

// Mock matchMedia before every test so the Controller picks it up.
type MediaQueryListener = (e: MediaQueryListEvent) => void;

interface MockMediaQueryList {
  matches: boolean;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
  addListener: ReturnType<typeof vi.fn>; // legacy Safari stub (not used)
  removeListener: ReturnType<typeof vi.fn>;
  media: string;
  onchange: MediaQueryListener | null;
  dispatchEvent: (event: Event) => boolean;
}

let currentMedia: MockMediaQueryList | null = null;

beforeEach(() => {
  const listeners = new Set<MediaQueryListener>();
  const media: MockMediaQueryList = {
    matches: false,
    media: '(prefers-reduced-motion: reduce)',
    onchange: null,
    addEventListener: vi.fn((_type: string, listener: MediaQueryListener) => {
      listeners.add(listener);
    }),
    removeEventListener: vi.fn((_type: string, listener: MediaQueryListener) => {
      listeners.delete(listener);
    }),
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

  // Expose a helper to fire change events from individual tests.
  (media as unknown as { __fire: (matches: boolean) => void }).__fire = (matches: boolean) => {
    media.matches = matches;
    const evt = { matches, media: media.media } as MediaQueryListEvent;
    for (const l of listeners) l(evt);
  };
});

afterEach(() => {
  currentMedia = null;
  // @ts-expect-error · cleanup test double
  delete window.matchMedia;
});

function fireMediaChange(matches: boolean): void {
  if (!currentMedia) throw new Error('matchMedia mock not installed');
  (currentMedia as unknown as { __fire: (m: boolean) => void }).__fire(matches);
}

// ─────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────

describe('FeedbackController', () => {
  let built: CreateFeedbackControllerResult | null = null;

  afterEach(() => {
    built?.dispose();
    built = null;
  });

  // ── Ingress handler behavior (FB-ARCH-3.1 Phase 2 concretization) ──

  describe('ingress (pressHandlers)', () => {
    it('creates one instance per factory on pressstart and calls start() exactly once (FB-2.3)', () => {
      const factory = createTrackedFactory();
      built = createFeedbackController([factory]);

      const e = makePressEvent({ pointerId: 1 });
      built.controller.pressHandlers.onPressStart(e);

      expect(factory.instances).toHaveLength(1);
      expect(factory.instances[0].calls.start).toHaveLength(1);
      expect(factory.instances[0].calls.start[0]).toMatchObject({
        source: 'press',
        pointerId: 1,
        x: 10,
        width: 100,
      });
    });

    it('creates one instance per factory when multiple factories are registered', () => {
      const a = createTrackedFactory('a');
      const b = createTrackedFactory('b');
      built = createFeedbackController([a, b]);

      built.controller.pressHandlers.onPressStart(makePressEvent({ pointerId: 1 }));

      expect(a.instances).toHaveLength(1);
      expect(b.instances).toHaveLength(1);
    });

    it('calls finish() on every active instance on pressend (success path)', () => {
      const factory = createTrackedFactory();
      built = createFeedbackController([factory]);

      const e = makePressEvent({ pointerId: 1 });
      built.controller.pressHandlers.onPressStart(e);
      built.controller.pressHandlers.onPressEnd(e);

      expect(factory.instances[0].calls.finish).toBe(1);
      expect(factory.instances[0].calls.cancel).toBe(0);
    });

    it('calls cancel() on every active instance on presscancel (failure path)', () => {
      const factory = createTrackedFactory();
      built = createFeedbackController([factory]);

      const e = makePressEvent({ pointerId: 1 });
      built.controller.pressHandlers.onPressStart(e);
      built.controller.pressHandlers.onPressCancel(e);

      expect(factory.instances[0].calls.cancel).toBe(1);
      expect(factory.instances[0].calls.finish).toBe(0);
    });
  });

  // ── Concurrent pointerId isolation (C-1) ──

  describe('concurrent pointerId isolation', () => {
    it('tracks independent instance arrays per pointerId', () => {
      const factory = createTrackedFactory();
      built = createFeedbackController([factory]);

      built.controller.pressHandlers.onPressStart(makePressEvent({ pointerId: 1 }));
      built.controller.pressHandlers.onPressStart(makePressEvent({ pointerId: 2 }));

      expect(factory.instances).toHaveLength(2);
      expect(factory.instances[0].pointerId).toBe(1);
      expect(factory.instances[1].pointerId).toBe(2);
    });

    it('finishing one pointerId does not affect other pointerIds', () => {
      const factory = createTrackedFactory();
      built = createFeedbackController([factory]);

      built.controller.pressHandlers.onPressStart(makePressEvent({ pointerId: 1 }));
      built.controller.pressHandlers.onPressStart(makePressEvent({ pointerId: 2 }));
      built.controller.pressHandlers.onPressEnd(makePressEvent({ pointerId: 1 }));

      expect(factory.instances[0].calls.finish).toBe(1);
      expect(factory.instances[1].calls.finish).toBe(0);
    });
  });

  // ── Egress subscribers + dispatch order (FB-ARCH-3.2 / 3.3) ──

  describe('egress (subscribePress)', () => {
    it('notifies subscribers on every press phase', () => {
      built = createFeedbackController([]);
      const observer: PressHandlers = {
        onPressStart: vi.fn(),
        onPressEnd: vi.fn(),
        onPressCancel: vi.fn(),
      };
      built.controller.subscribePress(observer);

      const e = makePressEvent({ pointerId: 1 });
      built.controller.pressHandlers.onPressStart(e);
      built.controller.pressHandlers.onPressEnd(e);
      built.controller.pressHandlers.onPressCancel(e);

      expect(observer.onPressStart).toHaveBeenCalledWith(e);
      expect(observer.onPressEnd).toHaveBeenCalledWith(e);
      expect(observer.onPressCancel).toHaveBeenCalledWith(e);
    });

    it('unsubscribing stops further notifications (FB-ARCH-3.3)', () => {
      built = createFeedbackController([]);
      const observer: PressHandlers = { onPressStart: vi.fn() };
      const off = built.controller.subscribePress(observer);

      built.controller.pressHandlers.onPressStart(makePressEvent());
      off();
      built.controller.pressHandlers.onPressStart(makePressEvent());

      expect(observer.onPressStart).toHaveBeenCalledTimes(1);
    });

    it('dispatch order: activeInstances manages before subscribers are notified (FB-ARCH-3.2)', () => {
      const order: string[] = [];
      const factory: FeedbackFactory = {
        name: 'order-probe',
        create({ event }) {
          if (event.source !== 'press') throw new Error('press only');
          return {
            id: 'p',
            pointerId: event.pointerId,
            source: 'press',
            start() {
              order.push('instance.start');
            },
            finish() {},
            cancel() {},
            dispose() {},
          };
        },
      };
      built = createFeedbackController([factory]);
      built.controller.subscribePress({
        onPressStart: () => {
          order.push('subscriber.onPressStart');
        },
      });

      built.controller.pressHandlers.onPressStart(makePressEvent());

      expect(order).toEqual(['instance.start', 'subscriber.onPressStart']);
    });
  });

  // ── updateFactories policy (§6.6 · OQ-FB-12) ──

  describe('updateFactories policy', () => {
    it('only affects future onPressStart (active instances keep running)', () => {
      const factoryA = createTrackedFactory('a');
      const factoryB = createTrackedFactory('b');
      built = createFeedbackController([factoryA]);

      built.controller.pressHandlers.onPressStart(makePressEvent({ pointerId: 1 }));
      built.controller.updateFactories([factoryB]);
      built.controller.pressHandlers.onPressStart(makePressEvent({ pointerId: 2 }));

      // active instance from factoryA is untouched
      expect(factoryA.instances).toHaveLength(1);
      expect(factoryA.instances[0].calls.cancel).toBe(0);
      expect(factoryA.instances[0].calls.dispose).toBe(0);

      // new pointerId activates factoryB
      expect(factoryB.instances).toHaveLength(1);
      expect(factoryB.instances[0].pointerId).toBe(2);
    });

    it('removing the last factory lets active instances finish naturally on pressend', () => {
      const factory = createTrackedFactory();
      built = createFeedbackController([factory]);

      const e = makePressEvent({ pointerId: 1 });
      built.controller.pressHandlers.onPressStart(e);
      built.controller.updateFactories([]);
      built.controller.pressHandlers.onPressEnd(e);

      expect(factory.instances[0].calls.finish).toBe(1);
      expect(factory.instances[0].calls.cancel).toBe(0);
    });
  });

  // ── reduced-motion (§9.1 · OQ-FB-8) ──

  describe('reduced-motion main guarantee', () => {
    it('does not create instances when matchMedia matches on mount', () => {
      if (!currentMedia) throw new Error('media mock missing');
      currentMedia.matches = true;

      const factory = createTrackedFactory();
      built = createFeedbackController([factory]);

      built.controller.pressHandlers.onPressStart(makePressEvent({ pointerId: 1 }));

      expect(factory.instances).toHaveLength(0);
    });

    it('runtime change false → true stops creating new instances but keeps active ones', () => {
      const factory = createTrackedFactory();
      built = createFeedbackController([factory]);

      built.controller.pressHandlers.onPressStart(makePressEvent({ pointerId: 1 }));
      fireMediaChange(true);
      built.controller.pressHandlers.onPressStart(makePressEvent({ pointerId: 2 }));

      expect(factory.instances).toHaveLength(1);
      expect(factory.instances[0].calls.cancel).toBe(0); // not disposed retroactively
    });
  });

  // ── Unmount dispose (L-F1 / L-F3) ──

  describe('dispose (unmount path)', () => {
    it('calls dispose() on every active instance and clears state', () => {
      const factory = createTrackedFactory();
      built = createFeedbackController([factory]);

      built.controller.pressHandlers.onPressStart(makePressEvent({ pointerId: 1 }));
      built.controller.pressHandlers.onPressStart(makePressEvent({ pointerId: 2 }));

      built.dispose();

      expect(factory.instances[0].calls.dispose).toBe(1);
      expect(factory.instances[1].calls.dispose).toBe(1);
    });

    it('removes matchMedia change listener (L-F3)', () => {
      const factory = createTrackedFactory();
      built = createFeedbackController([factory]);
      const removeSpy = currentMedia?.removeEventListener;

      built.dispose();
      built = null; // prevent afterEach double-dispose

      expect(removeSpy).toHaveBeenCalledWith('change', expect.any(Function));
    });
  });

  // ── trigger() DEV guard (FB-ARCH-3.1 Phase 2 concretization) ──

  describe('trigger()', () => {
    it('warns (DEV only) when called with a non-programmatic source', () => {
      built = createFeedbackController([]);
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      try {
        const pressEv = makePressEvent({ pointerId: 1 });
        built.controller.trigger({ source: 'press', ...pressEv });
        expect(warnSpy).toHaveBeenCalledTimes(1);
      } finally {
        warnSpy.mockRestore();
      }
    });

    it('silently accepts programmatic source (Phase 6+ placeholder)', () => {
      built = createFeedbackController([]);
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      try {
        built.controller.trigger({ source: 'programmatic', timestamp: 1 });
        expect(warnSpy).not.toHaveBeenCalled();
      } finally {
        warnSpy.mockRestore();
      }
    });
  });
});
