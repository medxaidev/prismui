/**
 * Stage-10 · L2 press-reducer · Pure-function tests
 *
 * Coverage matrix (interaction-events.md §10):
 *   · R-1 Replay stability (3× identical inputs → bit-for-bit identical outputs)
 *   · R-2 DOM independence (reducer runs with DOM APIs nuked)
 *   · R-3 No external-variable dependencies (frozen state/input accepted)
 *   · R-4 No timers / RAF / performance.now / Date.now
 *   · IE-CORE-3 success vs failure mutual exclusion + pressup-before-pressend
 *   · IE-CORE-4 four-state transition table (13 rows)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { pressReducer, INITIAL_PRESS_STATE } from './press-reducer';
import type { InputStreamEvent, PressState } from './types';

// ─────────────────────────────────────────────────────────────────────
// Test helpers
// ─────────────────────────────────────────────────────────────────────

function fakeTarget(): Element {
  // Minimal Element-shaped object · reducer treats as opaque reference.
  const el = { __mark: 'pressTarget' } as unknown as Element;
  return el;
}

function rect(overrides: Partial<{ width: number; height: number; left: number; top: number }> = {}) {
  return { width: 40, height: 40, left: 10, top: 20, ...overrides };
}

function pointerDownAt(target: Element, overrides: Partial<InputStreamEvent> = {}): InputStreamEvent {
  return {
    kind: 'pointerdown',
    pointerId: 1,
    pointerType: 'mouse',
    timestamp: 100,
    target,
    clientX: 25, // inside rect ⇒ x = 15
    clientY: 35, // inside rect ⇒ y = 15
    targetRect: rect(),
    path: [target],
    originalTarget: target,
    modifiers: { ctrl: false, shift: false, alt: false, meta: false },
    ...overrides,
  };
}

function pointerUpAt(target: Element, overrides: Partial<InputStreamEvent> = {}): InputStreamEvent {
  return {
    kind: 'pointerup',
    pointerId: 1,
    pointerType: 'mouse',
    timestamp: 200,
    target,
    clientX: 30,
    clientY: 40,
    targetRect: rect(),
    path: [target],
    originalTarget: target,
    modifiers: { ctrl: false, shift: false, alt: false, meta: false },
    ...overrides,
  };
}

function runStream(inputs: InputStreamEvent[]): Array<ReturnType<typeof pressReducer>> {
  const outputs: Array<ReturnType<typeof pressReducer>> = [];
  let state: PressState = INITIAL_PRESS_STATE;
  for (const input of inputs) {
    const out = pressReducer(state, input);
    outputs.push(out);
    state = out.state;
  }
  return outputs;
}

// ─────────────────────────────────────────────────────────────────────
// IE-CORE-4 · State transition table
// ─────────────────────────────────────────────────────────────────────

describe('press-reducer · state transitions (IE-CORE-4)', () => {
  it('idle + pointerdown → active + pressstart', () => {
    const target = fakeTarget();
    const out = pressReducer(INITIAL_PRESS_STATE, pointerDownAt(target));
    expect(out.state.kind).toBe('active');
    expect(out.events).toHaveLength(1);
    expect(out.events[0].type).toBe('pressstart');
    expect(out.events[0].target).toBe(target);
    expect(out.events[0].x).toBe(15); // 25 - 10
    expect(out.events[0].y).toBe(15); // 35 - 20
    expect(out.events[0].width).toBe(40);
    expect(out.events[0].height).toBe(40);
    expect(out.events[0].pointerType).toBe('mouse');
    expect(out.events[0].pointerId).toBe(1);
  });

  it('active + pointerup inside → terminated + [pressup, pressend] (success path · IE-CORE-3)', () => {
    const target = fakeTarget();
    const stream = runStream([pointerDownAt(target), pointerUpAt(target)]);
    const final = stream[1];
    expect(final.state.kind).toBe('terminated');
    expect(final.events.map(e => e.type)).toEqual(['pressup', 'pressend']);
    // IE-CORE-3: pressup and presscancel never co-occur
    expect(final.events.some(e => e.type === 'presscancel')).toBe(false);
  });

  it('active + pointerup outside → terminated + presscancel (failure path)', () => {
    const target = fakeTarget();
    const other = fakeTarget();
    const stream = runStream([pointerDownAt(target), pointerUpAt(other)]);
    const final = stream[1];
    expect(final.state.kind).toBe('terminated');
    expect(final.events.map(e => e.type)).toEqual(['presscancel']);
  });

  it('active + pointerleave → suspended (no events · IE-CORE-3 re-entry support)', () => {
    const target = fakeTarget();
    const stream = runStream([
      pointerDownAt(target),
      { kind: 'pointerleave', pointerId: 1, timestamp: 150, target },
    ]);
    expect(stream[1].state.kind).toBe('suspended');
    expect(stream[1].events).toHaveLength(0);
  });

  it('suspended + pointerenter → active + pointerup inside → success path (re-entry)', () => {
    const target = fakeTarget();
    const stream = runStream([
      pointerDownAt(target),
      { kind: 'pointerleave', pointerId: 1, timestamp: 150, target },
      { kind: 'pointerenter', pointerId: 1, timestamp: 160, target },
      pointerUpAt(target, { timestamp: 200 }),
    ]);
    expect(stream[2].state.kind).toBe('active');
    expect(stream[3].state.kind).toBe('terminated');
    expect(stream[3].events.map(e => e.type)).toEqual(['pressup', 'pressend']);
  });

  it('active + blur → terminated + presscancel (OQ-IE-2 aligns with native)', () => {
    const target = fakeTarget();
    const stream = runStream([
      pointerDownAt(target),
      { kind: 'blur', timestamp: 150, target },
    ]);
    expect(stream[1].state.kind).toBe('terminated');
    expect(stream[1].events.map(e => e.type)).toEqual(['presscancel']);
  });

  it('active + disabled-flip → terminated + presscancel (C-2 synchronous cancel)', () => {
    const target = fakeTarget();
    const stream = runStream([
      pointerDownAt(target),
      { kind: 'disabled-flip', timestamp: 150, target },
    ]);
    expect(stream[1].state.kind).toBe('terminated');
    expect(stream[1].events.map(e => e.type)).toEqual(['presscancel']);
  });

  it('active + unmount → terminated · NO event callbacks (C-3 top priority)', () => {
    const target = fakeTarget();
    const stream = runStream([
      pointerDownAt(target),
      { kind: 'unmount', timestamp: 150 },
    ]);
    expect(stream[1].state.kind).toBe('terminated');
    expect(stream[1].events).toHaveLength(0);
  });

  it('active + pointercancel → terminated + presscancel', () => {
    const target = fakeTarget();
    const stream = runStream([
      pointerDownAt(target),
      { kind: 'pointercancel', pointerId: 1, timestamp: 150, target },
    ]);
    expect(stream[1].state.kind).toBe('terminated');
    expect(stream[1].events.map(e => e.type)).toEqual(['presscancel']);
  });

  it('terminated · absorbing state · all inputs silent', () => {
    const target = fakeTarget();
    const stream = runStream([
      pointerDownAt(target),
      pointerUpAt(target),
      pointerDownAt(target, { timestamp: 300 }),
    ]);
    // Once terminated, further pointerdown stays terminated (reducer is per-pointerId FSM;
    // new press lifecycles require a new reducer instance · hook layer resets).
    expect(stream[2].state.kind).toBe('terminated');
    expect(stream[2].events).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────
// Keyboard transitions (§5.1 host-neutral)
// ─────────────────────────────────────────────────────────────────────

describe('press-reducer · keyboard (§5.1)', () => {
  it('idle + keydown Space → active + pressstart with x=width/2, y=height/2', () => {
    const target = fakeTarget();
    const out = pressReducer(INITIAL_PRESS_STATE, {
      kind: 'keydown',
      key: ' ',
      timestamp: 100,
      target,
      targetRect: rect(),
      path: [target],
      originalTarget: target,
      pointerId: -1,
      pointerType: 'keyboard',
    });
    expect(out.state.kind).toBe('active');
    expect(out.events[0].type).toBe('pressstart');
    expect(out.events[0].x).toBe(20); // width/2
    expect(out.events[0].y).toBe(20); // height/2
    expect(out.events[0].pointerType).toBe('keyboard');
  });

  it('active (keyboard) + keyup Enter → terminated + [pressup, pressend]', () => {
    const target = fakeTarget();
    const startState = pressReducer(INITIAL_PRESS_STATE, {
      kind: 'keydown',
      key: 'Enter',
      timestamp: 100,
      target,
      targetRect: rect(),
      pointerId: -1,
      pointerType: 'keyboard',
    }).state;

    const out = pressReducer(startState, {
      kind: 'keyup',
      key: 'Enter',
      timestamp: 200,
      target,
      pointerId: -1,
      pointerType: 'keyboard',
    });
    expect(out.state.kind).toBe('terminated');
    expect(out.events.map(e => e.type)).toEqual(['pressup', 'pressend']);
  });

  it('idle + keydown non-activation key → idle (no event)', () => {
    const target = fakeTarget();
    const out = pressReducer(INITIAL_PRESS_STATE, {
      kind: 'keydown',
      key: 'a',
      timestamp: 100,
      target,
      targetRect: rect(),
    });
    expect(out.state.kind).toBe('idle');
    expect(out.events).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────
// R-1 · Replay stability
// ─────────────────────────────────────────────────────────────────────

describe('press-reducer · R-1 replayability', () => {
  it('3 replays of identical InputStream produce bit-for-bit identical PressEvent outputs', () => {
    const target = fakeTarget();
    const stream: InputStreamEvent[] = [
      pointerDownAt(target, { timestamp: 100 }),
      { kind: 'pointerleave', pointerId: 1, timestamp: 150, target },
      { kind: 'pointerenter', pointerId: 1, timestamp: 160, target },
      pointerUpAt(target, { timestamp: 200 }),
    ];

    const run1 = runStream(stream).flatMap(o => o.events);
    const run2 = runStream(stream).flatMap(o => o.events);
    const run3 = runStream(stream).flatMap(o => o.events);

    // Bit-for-bit equality of all PressEvent fields.
    expect(run2).toEqual(run1);
    expect(run3).toEqual(run1);

    // Sanity: produced the expected events (pressstart + pressup + pressend · leave/enter silent).
    expect(run1.map(e => e.type)).toEqual(['pressstart', 'pressup', 'pressend']);
  });
});

// ─────────────────────────────────────────────────────────────────────
// R-2 · DOM independence
// ─────────────────────────────────────────────────────────────────────

describe('press-reducer · R-2 DOM independence', () => {
  it('runs correctly with DOM APIs nuked (reducer consumes no DOM state)', () => {
    // Nuke common DOM reads that upstream layers use.
    const proto = Element.prototype as any;
    const originalGBCR = proto.getBoundingClientRect;
    const originalContains = proto.contains;
    proto.getBoundingClientRect = () => {
      throw new Error('getBoundingClientRect should not be called by reducer');
    };
    proto.contains = () => {
      throw new Error('Element.contains should not be called by reducer');
    };

    try {
      const target = fakeTarget();
      const out = runStream([pointerDownAt(target), pointerUpAt(target)]);
      expect(out[1].state.kind).toBe('terminated');
      expect(out[1].events.map(e => e.type)).toEqual(['pressup', 'pressend']);
    } finally {
      proto.getBoundingClientRect = originalGBCR;
      proto.contains = originalContains;
    }
  });
});

// ─────────────────────────────────────────────────────────────────────
// R-3 · No external-variable dependency · frozen inputs accepted
// ─────────────────────────────────────────────────────────────────────

describe('press-reducer · R-3 no external-variable mutation', () => {
  it('accepts deeply-frozen state and input without throwing (proves no in-place mutation)', () => {
    const target = fakeTarget();
    const input = Object.freeze(pointerDownAt(target));
    const frozenState = Object.freeze({ ...INITIAL_PRESS_STATE });

    // Should not throw · reducer must return new state, not mutate input/state.
    const out = pressReducer(frozenState, input);
    expect(out.state.kind).toBe('active');

    // Produced events should also not reference input objects for identity-sensitive work.
    expect(out.events[0]).not.toBe(input);
  });
});

// ─────────────────────────────────────────────────────────────────────
// R-4 · No timers / RAF / performance.now / Date.now
// ─────────────────────────────────────────────────────────────────────

describe('press-reducer · R-4 no timers / RAF / time sources', () => {
  let spies: Array<{ name: string; spy: ReturnType<typeof vi.spyOn> }> = [];

  beforeEach(() => {
    spies = [
      { name: 'performance.now', spy: vi.spyOn(performance, 'now') },
      { name: 'Date.now', spy: vi.spyOn(Date, 'now') },
      { name: 'requestAnimationFrame', spy: vi.spyOn(globalThis, 'requestAnimationFrame') },
      { name: 'setTimeout', spy: vi.spyOn(globalThis, 'setTimeout') },
      { name: 'setInterval', spy: vi.spyOn(globalThis, 'setInterval') },
      { name: 'queueMicrotask', spy: vi.spyOn(globalThis, 'queueMicrotask') },
    ];
  });

  afterEach(() => {
    spies.forEach(({ spy }) => spy.mockRestore());
  });

  it('runs a full press lifecycle without invoking any time source / scheduler', () => {
    const target = fakeTarget();
    runStream([
      pointerDownAt(target),
      { kind: 'pointerleave', pointerId: 1, timestamp: 150, target },
      { kind: 'pointerenter', pointerId: 1, timestamp: 160, target },
      pointerUpAt(target),
    ]);

    for (const { name, spy } of spies) {
      expect(spy, `${name} should not be called by reducer`).not.toHaveBeenCalled();
    }
  });
});
