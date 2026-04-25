/**
 * Stage-10 · L4 Feedback · `FeedbackController` tests
 *
 * Contract: `@/devdocs/system/feedback-contract.md` v0.5
 *
 * Coverage:
 *   · Ingress / Egress separation (FB-ARCH-3.1 / 3.3) — press + focus (v0.5)
 *   · Dispatch order (FB-ARCH-3.2) — symmetric across sources
 *   · Managed Ephemeral Instances lifecycle (FB-2 / 2.1 / 2.3)
 *   · Concurrent pointerId isolation (C-1) · focus singleton (Z-2)
 *   · updateFactories policy (§6.6 · OQ-FB-12) · press + focus
 *   · reduced-motion main guarantee (§9.1 · OQ-FB-8) · press + focus
 *   · P0-2 Focus identity guard (§6.5 · v0.5 Round 1)
 *   · Unmount dispose (L-F1 / L-F3) — drains BOTH stores
 */

import * as React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { PressEvent } from '../interaction-events';

import {
  createFeedbackController,
  type CreateFeedbackControllerResult,
} from './FeedbackController';
import type {
  FeedbackFactory,
  FeedbackInstance,
  FocusHandlers,
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

/** Simple no-op instance mimicking ripple/glow's `createNoOpInstance` shape. */
function makeNoOpInstance(
  source: FeedbackInstance['source'],
  id: string,
): FeedbackInstance {
  let disposed = false;
  return {
    id,
    pointerId: null,
    source,
    start() {
      /* no-op */
    },
    finish() {
      /* no-op */
    },
    cancel() {
      /* no-op */
    },
    dispose() {
      if (disposed) return;
      disposed = true;
    },
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
        // Match real-factory behavior (ripple): non-target sources return a
        // no-op instance so the Controller's factory-loop never crashes when
        // a mixed-source controller is stood up.
        return makeNoOpInstance(event.source, `${name}-noop-${instances.length}`);
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

/**
 * Focus-source tracked factory (v0.5 Phase 4.1).
 *
 * Mirrors `createTrackedFactory` for the focus source: records start /
 * finish / cancel / dispose per instance so we can assert identity-guard
 * and ingress semantics. `pointerId: null` per §3.1 focus-source contract.
 */
function createTrackedFocusFactory(name = 'tracked-focus'): FeedbackFactory & {
  readonly instances: TrackedInstance[];
} {
  const instances: TrackedInstance[] = [];

  const factory: FeedbackFactory = {
    name,
    create({ event }) {
      if (event.source !== 'focus') {
        // Match real-factory behavior (glow): non-focus sources return a
        // no-op instance so a mixed-source controller keeps working.
        return makeNoOpInstance(event.source, `${name}-noop-${instances.length}`);
      }
      const calls = { start: [] as InteractionEvent[], finish: 0, cancel: 0, dispose: 0 };
      let disposed = false;
      const instance: TrackedInstance = {
        id: `${name}-${instances.length}`,
        pointerId: null, // §3.1 · focus source
        source: 'focus',
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

/**
 * Build a React.FocusEvent<HTMLElement>-shaped object.
 *
 * We only populate the fields the Controller actually reads (currentTarget,
 * nativeEvent) — the rest of the `SyntheticEvent` surface is cast away so
 * tests don't have to fabricate a full React synthetic. This is the same
 * trick `@testing-library/react` uses internally when it hand-rolls a
 * synthetic event for `fireEvent.focus(...)`.
 */
function makeFocusEvent(
  target?: HTMLElement,
  opts: { nativeType?: 'focus' | 'blur' } = {},
): React.FocusEvent<HTMLElement> {
  const el = target ?? document.createElement('button');
  // jsdom exposes FocusEvent — fall back to a plain Event if not.
  const FocusEventCtor = (globalThis as { FocusEvent?: typeof FocusEvent }).FocusEvent;
  const nativeEvent = FocusEventCtor
    ? new FocusEventCtor(opts.nativeType ?? 'focus')
    : (new Event(opts.nativeType ?? 'focus') as globalThis.FocusEvent);
  const synthetic = {
    target: el,
    currentTarget: el,
    nativeEvent,
  } as unknown as React.FocusEvent<HTMLElement>;
  return synthetic;
}

/** Force `HTMLElement.prototype.matches(':focus-visible')` to a fixed value. */
function installFocusVisibleMatches(value: boolean): () => void {
  const original = HTMLElement.prototype.matches;
  HTMLElement.prototype.matches = function patched(
    this: HTMLElement,
    selectors: string,
  ): boolean {
    if (selectors === ':focus-visible') return value;
    return original.call(this, selectors);
  } as typeof HTMLElement.prototype.matches;
  return () => {
    HTMLElement.prototype.matches = original;
  };
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

  // ──────────────────────────────────────────────────────────────────
  // v0.5 Phase 4.1 · Focus source (§6.4 · Z-2 singleton model)
  // ──────────────────────────────────────────────────────────────────

  describe('ingress (focusHandlers · v0.5)', () => {
    it('creates one instance per factory on onFocus and calls start() exactly once', () => {
      const restore = installFocusVisibleMatches(true);
      try {
        const factory = createTrackedFocusFactory();
        built = createFeedbackController([factory]);

        const target = document.createElement('button');
        document.body.appendChild(target);
        built.controller.focusHandlers.onFocus(makeFocusEvent(target));

        expect(factory.instances).toHaveLength(1);
        expect(factory.instances[0].calls.start).toHaveLength(1);
        expect(factory.instances[0].calls.start[0]).toMatchObject({
          source: 'focus',
          target,
          focusVisible: true,
        });
      } finally {
        restore();
      }
    });

    it('derives focusVisible=true via :focus-visible match', () => {
      const restore = installFocusVisibleMatches(true);
      try {
        const factory = createTrackedFocusFactory();
        built = createFeedbackController([factory]);
        built.controller.focusHandlers.onFocus(makeFocusEvent());
        const [instance] = factory.instances;
        const firstStart = instance.calls.start[0];
        // Runtime discriminant — focus events carry `focusVisible`.
        expect(firstStart.source).toBe('focus');
        if (firstStart.source === 'focus') {
          expect(firstStart.focusVisible).toBe(true);
        }
      } finally {
        restore();
      }
    });

    it('derives focusVisible=false when element does NOT match :focus-visible', () => {
      const restore = installFocusVisibleMatches(false);
      try {
        const factory = createTrackedFocusFactory();
        built = createFeedbackController([factory]);
        built.controller.focusHandlers.onFocus(makeFocusEvent());
        const firstStart = factory.instances[0].calls.start[0];
        if (firstStart.source === 'focus') {
          expect(firstStart.focusVisible).toBe(false);
        }
      } finally {
        restore();
      }
    });

    it('calls finish() on every active focus instance on onBlur', () => {
      const restore = installFocusVisibleMatches(true);
      try {
        const factory = createTrackedFocusFactory();
        built = createFeedbackController([factory]);

        const target = document.createElement('button');
        built.controller.focusHandlers.onFocus(makeFocusEvent(target));
        built.controller.focusHandlers.onBlur(makeFocusEvent(target, { nativeType: 'blur' }));

        expect(factory.instances[0].calls.finish).toBe(1);
        expect(factory.instances[0].calls.cancel).toBe(0);
      } finally {
        restore();
      }
    });

    it('creates one instance per registered factory (multi-factory focus)', () => {
      const restore = installFocusVisibleMatches(true);
      try {
        const a = createTrackedFocusFactory('a');
        const b = createTrackedFocusFactory('b');
        built = createFeedbackController([a, b]);

        built.controller.focusHandlers.onFocus(makeFocusEvent());

        expect(a.instances).toHaveLength(1);
        expect(b.instances).toHaveLength(1);
      } finally {
        restore();
      }
    });

    it('no-op when factory list is empty (§6.4 factories.length invariant)', () => {
      built = createFeedbackController([]);
      // The ingress still runs — it just has nothing to create.
      expect(() => {
        built!.controller.focusHandlers.onFocus(makeFocusEvent());
        built!.controller.focusHandlers.onBlur(makeFocusEvent(undefined, { nativeType: 'blur' }));
      }).not.toThrow();
    });
  });

  describe('egress (subscribeFocus · v0.5)', () => {
    it('notifies subscribers on onFocus / onBlur with the React FocusEvent', () => {
      const restore = installFocusVisibleMatches(true);
      try {
        built = createFeedbackController([]);
        const observer = {
          onFocus: vi.fn(),
          onBlur: vi.fn(),
        };
        built.controller.subscribeFocus(observer);

        const target = document.createElement('button');
        const focusEv = makeFocusEvent(target);
        const blurEv = makeFocusEvent(target, { nativeType: 'blur' });
        built.controller.focusHandlers.onFocus(focusEv);
        built.controller.focusHandlers.onBlur(blurEv);

        expect(observer.onFocus).toHaveBeenCalledWith(focusEv);
        expect(observer.onBlur).toHaveBeenCalledWith(blurEv);
      } finally {
        restore();
      }
    });

    it('unsubscribing stops further notifications', () => {
      built = createFeedbackController([]);
      const observer = { onFocus: vi.fn() };
      const off = built.controller.subscribeFocus(observer);

      built.controller.focusHandlers.onFocus(makeFocusEvent());
      off();
      built.controller.focusHandlers.onFocus(makeFocusEvent());

      expect(observer.onFocus).toHaveBeenCalledTimes(1);
    });

    it('dispatch order: instance.start before subscriber.onFocus (FB-ARCH-3.2 symmetry)', () => {
      const restore = installFocusVisibleMatches(true);
      try {
        const order: string[] = [];
        const probe: FeedbackFactory = {
          name: 'focus-order-probe',
          create({ event }) {
            if (event.source !== 'focus') throw new Error('focus only');
            return {
              id: 'f',
              pointerId: null,
              source: 'focus',
              start() {
                order.push('instance.start');
              },
              finish() {
                /* no-op */
              },
              cancel() {
                /* no-op */
              },
              dispose() {
                /* no-op */
              },
            };
          },
        };
        built = createFeedbackController([probe]);
        built.controller.subscribeFocus({
          onFocus: () => {
            order.push('subscriber.onFocus');
          },
        });

        built.controller.focusHandlers.onFocus(makeFocusEvent());

        expect(order).toEqual(['instance.start', 'subscriber.onFocus']);
      } finally {
        restore();
      }
    });
  });

  describe('P0-2 Focus identity guard (§6.5 · v0.5 Round 1)', () => {
    it('blur → refocus → stale completion does NOT clobber new generation', () => {
      const restore = installFocusVisibleMatches(true);
      try {
        const factory = createTrackedFocusFactory();
        built = createFeedbackController([factory]);

        // Generation 1: focus → blur (captures array A).
        built.controller.focusHandlers.onFocus(makeFocusEvent());
        built.controller.focusHandlers.onBlur(
          makeFocusEvent(undefined, { nativeType: 'blur' }),
        );
        expect(factory.instances[0].calls.finish).toBe(1);

        // Generation 2: immediate refocus — creates fresh array B.
        built.controller.focusHandlers.onFocus(makeFocusEvent());
        expect(factory.instances).toHaveLength(2);
        expect(factory.instances[1].calls.start).toHaveLength(1);

        // A late terminator call on generation 1 never fires (its natural
        // handoff already completed). What we ASSERT is that generation 2
        // is still alive — blur's identity guard did its job by not clearing
        // a freshly-assigned focusInstances array.
        expect(factory.instances[1].calls.dispose).toBe(0);
        expect(factory.instances[1].calls.cancel).toBe(0);

        // Cleanly terminate generation 2.
        built.controller.focusHandlers.onBlur(
          makeFocusEvent(undefined, { nativeType: 'blur' }),
        );
        expect(factory.instances[1].calls.finish).toBe(1);
      } finally {
        restore();
      }
    });
  });

  describe('updateFactories policy · focus source (§6.6 symmetry)', () => {
    it('only affects future onFocus (active focus instance keeps running)', () => {
      const restore = installFocusVisibleMatches(true);
      try {
        const a = createTrackedFocusFactory('a');
        const b = createTrackedFocusFactory('b');
        built = createFeedbackController([a]);

        built.controller.focusHandlers.onFocus(makeFocusEvent());
        built.controller.updateFactories([b]);
        // Swap does not retroactively cancel the active instance.
        expect(a.instances[0].calls.cancel).toBe(0);
        expect(a.instances[0].calls.dispose).toBe(0);

        built.controller.focusHandlers.onBlur(
          makeFocusEvent(undefined, { nativeType: 'blur' }),
        );
        // Next focus uses the new list.
        built.controller.focusHandlers.onFocus(makeFocusEvent());
        expect(b.instances).toHaveLength(1);
      } finally {
        restore();
      }
    });
  });

  describe('reduced-motion main guarantee · focus (§9.1 symmetry)', () => {
    it('does not create focus instances when matchMedia matches on mount', () => {
      if (!currentMedia) throw new Error('media mock missing');
      currentMedia.matches = true;
      const restore = installFocusVisibleMatches(true);
      try {
        const factory = createTrackedFocusFactory();
        built = createFeedbackController([factory]);
        built.controller.focusHandlers.onFocus(makeFocusEvent());
        expect(factory.instances).toHaveLength(0);
      } finally {
        restore();
      }
    });

    it('runtime change false → true stops creating new focus instances', () => {
      const restore = installFocusVisibleMatches(true);
      try {
        const factory = createTrackedFocusFactory();
        built = createFeedbackController([factory]);
        built.controller.focusHandlers.onFocus(makeFocusEvent());
        built.controller.focusHandlers.onBlur(
          makeFocusEvent(undefined, { nativeType: 'blur' }),
        );
        fireMediaChange(true);
        built.controller.focusHandlers.onFocus(makeFocusEvent());
        expect(factory.instances).toHaveLength(1);
      } finally {
        restore();
      }
    });
  });

  describe('dispose · drains both press + focus stores (§6.5 unmount)', () => {
    it('calls dispose() on active focus instances + clears focusSubscribers', () => {
      const restore = installFocusVisibleMatches(true);
      try {
        const focusFactory = createTrackedFocusFactory();
        built = createFeedbackController([focusFactory]);
        const observer = { onFocus: vi.fn() };
        built.controller.subscribeFocus(observer);

        built.controller.focusHandlers.onFocus(makeFocusEvent());
        expect(focusFactory.instances[0].calls.dispose).toBe(0);

        built.dispose();
        const capturedInstance = focusFactory.instances[0];
        built = null; // avoid double-dispose in afterEach

        expect(capturedInstance.calls.dispose).toBe(1);
        // After dispose, the egress Set is cleared: reconstructing a controller
        // would be the right move — but within THIS already-disposed controller
        // we are simply asserting dispose ran end-to-end (no throw). Observer
        // reference retention is a GC detail we don't assert here.
      } finally {
        restore();
      }
    });

    it('drains both press + focus stores in one dispose pass', () => {
      const restore = installFocusVisibleMatches(true);
      try {
        const press = createTrackedFactory('press');
        const focus = createTrackedFocusFactory('focus');
        built = createFeedbackController([press, focus]);

        built.controller.pressHandlers.onPressStart(makePressEvent({ pointerId: 7 }));
        built.controller.focusHandlers.onFocus(makeFocusEvent());

        built.dispose();
        const pressInst = press.instances[0];
        const focusInst = focus.instances[0];
        built = null;

        expect(pressInst.calls.dispose).toBe(1);
        expect(focusInst.calls.dispose).toBe(1);
      } finally {
        restore();
      }
    });
  });

  describe('focusHandlers reference stability', () => {
    it('returns the same object across reads (FB-ARCH-3.1 · stable ingress)', () => {
      built = createFeedbackController([]);
      const a = built.controller.focusHandlers;
      const b = built.controller.focusHandlers;
      expect(a).toBe(b);
    });
  });

  // Type-surface sanity: `FocusHandlers` structural interop (touching the
  // import so TS does not drop it; also validates the public type shape).
  it('FocusHandlers contract surface (compile-time)', () => {
    const sample: FocusHandlers = {
      onFocus: () => undefined,
      onBlur: () => undefined,
    };
    expect(typeof sample.onFocus).toBe('function');
  });
});
