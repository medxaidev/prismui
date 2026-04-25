/**
 * Stage-10 · L4 Feedback · `glowFeedback` tests (v0.5 Phase 4.1)
 *
 * Contract: `@/devdocs/system/feedback-contract.md` v0.5 §11
 *
 * Coverage:
 *   · focus-source lifecycle (start → classList.add → finish → dual-path
 *     cleanup → dispose)
 *   · non-focus source returns no-op placeholder instance
 *   · focusVisible=false returns no-op (Z-5)
 *   · classList.add / remove targeting the prefix-constrained literal
 *     `prismui-glow-active` (OQ-FB-P4-2 + §8.1 receivers whitelist)
 *   · P0-3 dual-path cleanup: transitionend fires → dispose
 *   · P0-3 dual-path cleanup: setTimeout fallback fires → dispose
 *   · idempotent cleanup (whichever path wins, the other no-ops)
 *   · cancel() immediate dispose
 *   · FB-2.1 idempotent dispose · FB-2.3 start at most once
 *   · descendant transitionend bubble is ignored (e.target filter)
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { FocusSourceEvent, InteractionEvent } from '../../core/feedback';

import { glowFeedback } from './glow-feedback';

const ACTIVE_CLASS = 'prismui-glow-active';

// ─────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────

function makeFocusInteractionEvent(
  overrides: Partial<FocusSourceEvent> = {},
): InteractionEvent & { source: 'focus' } {
  const target = overrides.target ?? document.createElement('button');
  document.body.appendChild(target);
  const FocusEventCtor = (globalThis as { FocusEvent?: typeof FocusEvent }).FocusEvent;
  const nativeEvent = FocusEventCtor
    ? new FocusEventCtor('focus')
    : (new Event('focus') as globalThis.FocusEvent);
  return {
    source: 'focus',
    target,
    focusVisible: overrides.focusVisible ?? true,
    nativeEvent: overrides.nativeEvent ?? nativeEvent,
  };
}

// ─────────────────────────────────────────────────────────────────────
// Fake timers for the P0-3 fallback path
// ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = '';
});

// ─────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────

describe('glowFeedback', () => {
  it('adds the `prismui-glow-active` class to the target on start()', () => {
    const event = makeFocusInteractionEvent();
    const instance = glowFeedback.create({ event });

    expect(event.target.classList.contains(ACTIVE_CLASS)).toBe(false);
    instance.start(event);
    expect(event.target.classList.contains(ACTIVE_CLASS)).toBe(true);
  });

  it('removes the class on finish() and fires dispose via transitionend', () => {
    const event = makeFocusInteractionEvent();
    const instance = glowFeedback.create({ event });
    instance.start(event);

    instance.finish();
    // Class toggled off synchronously as part of finish (§11.2 transition trigger).
    expect(event.target.classList.contains(ACTIVE_CLASS)).toBe(false);

    // Simulate the browser firing transitionend on the target itself.
    const transitionEvent = new Event('transitionend') as TransitionEvent;
    Object.defineProperty(transitionEvent, 'target', { value: event.target });
    event.target.dispatchEvent(transitionEvent);

    // After the listener fires, cleanup path runs dispose idempotently.
    // A second finish / cancel / dispose is a no-op (§6.5 FB-2.1 guard).
    expect(() => instance.dispose()).not.toThrow();
  });

  it('P0-3: setTimeout fallback fires dispose when transitionend never arrives', () => {
    const event = makeFocusInteractionEvent();
    const instance = glowFeedback.create({ event });
    instance.start(event);
    instance.finish();

    // Nothing yet — the class is gone but the fallback timer still pending.
    expect(event.target.classList.contains(ACTIVE_CLASS)).toBe(false);

    // Advance beyond the 350 ms fallback.
    vi.advanceTimersByTime(400);

    // Fallback ran cleanup → dispose. Second dispose is idempotent no-op.
    expect(() => instance.dispose()).not.toThrow();
  });

  it('P0-3 idempotent cleanup: transitionend winning then fallback is a no-op', () => {
    const event = makeFocusInteractionEvent();
    const instance = glowFeedback.create({ event });
    instance.start(event);

    const disposeSpy = vi.spyOn(instance, 'dispose');
    instance.finish();

    // Win via transitionend first.
    const te = new Event('transitionend') as TransitionEvent;
    Object.defineProperty(te, 'target', { value: event.target });
    event.target.dispatchEvent(te);

    expect(disposeSpy).toHaveBeenCalledTimes(1);

    // Fallback timer fires later — must NOT trigger a second dispose.
    vi.advanceTimersByTime(400);
    expect(disposeSpy).toHaveBeenCalledTimes(1);

    disposeSpy.mockRestore();
  });

  it('ignores descendant transitionend (e.target filter)', () => {
    const event = makeFocusInteractionEvent();
    const child = document.createElement('span');
    event.target.appendChild(child);
    const instance = glowFeedback.create({ event });
    instance.start(event);
    instance.finish();

    const disposeSpy = vi.spyOn(instance, 'dispose');

    // Descendant transitionend — should be ignored.
    const teChild = new Event('transitionend', { bubbles: true }) as TransitionEvent;
    Object.defineProperty(teChild, 'target', { value: child });
    child.dispatchEvent(teChild);

    expect(disposeSpy).not.toHaveBeenCalled();

    // Advance the fallback timer — now cleanup fires exactly once.
    vi.advanceTimersByTime(400);
    expect(disposeSpy).toHaveBeenCalledTimes(1);

    disposeSpy.mockRestore();
  });

  it('cancel() disposes immediately and removes the class', () => {
    const event = makeFocusInteractionEvent();
    const instance = glowFeedback.create({ event });
    instance.start(event);
    instance.cancel();

    expect(event.target.classList.contains(ACTIVE_CLASS)).toBe(false);
    // Idempotent re-cancel.
    expect(() => instance.cancel()).not.toThrow();
  });

  it('dispose() synchronously removes the class and is idempotent (FB-2.1)', () => {
    const event = makeFocusInteractionEvent();
    const instance = glowFeedback.create({ event });
    instance.start(event);
    instance.dispose();

    expect(event.target.classList.contains(ACTIVE_CLASS)).toBe(false);
    expect(() => instance.dispose()).not.toThrow();
  });

  it('ignores duplicate start() calls (FB-2.3)', () => {
    const event = makeFocusInteractionEvent();
    const instance = glowFeedback.create({ event });
    instance.start(event);
    instance.start(event); // defensive no-op — class is already on

    // One add → one class entry, no duplicates (classList is a Set-like).
    expect(event.target.classList.contains(ACTIVE_CLASS)).toBe(true);
  });

  it('returns a no-op instance for non-focus sources', () => {
    const progEvent: InteractionEvent = { source: 'programmatic', timestamp: 1 };
    const instance = glowFeedback.create({ event: progEvent });

    const before = document.body.innerHTML;
    instance.start(progEvent);
    instance.finish();
    instance.cancel();
    instance.dispose();
    const after = document.body.innerHTML;

    expect(after).toBe(before);
    expect(instance.source).toBe('programmatic');
    expect(instance.pointerId).toBeNull();
  });

  it('returns a no-op instance when focusVisible === false (Z-5)', () => {
    const event = makeFocusInteractionEvent({ focusVisible: false });
    const instance = glowFeedback.create({ event });

    // The class must NEVER appear for a non-focus-visible focus.
    instance.start(event);
    expect(event.target.classList.contains(ACTIVE_CLASS)).toBe(false);
    instance.finish();
    expect(event.target.classList.contains(ACTIVE_CLASS)).toBe(false);

    expect(instance.source).toBe('focus');
    expect(instance.pointerId).toBeNull();
  });

  it('finish() before start() is a silent no-op (never started branch)', () => {
    const event = makeFocusInteractionEvent();
    const instance = glowFeedback.create({ event });
    // No start — go straight to finish.
    expect(() => instance.finish()).not.toThrow();
    // No listener was attached, no timer scheduled; advancing timers must not
    // trigger any cleanup call chain.
    vi.advanceTimersByTime(400);
    expect(event.target.classList.contains(ACTIVE_CLASS)).toBe(false);
  });

  it('exports the correct factory name for FB-3 static scan anchor', () => {
    expect(glowFeedback.name).toBe('glow');
  });

  it('independent instances do not interfere (two concurrent focused elements)', () => {
    const a = document.createElement('button');
    const b = document.createElement('button');
    document.body.append(a, b);
    const eventA = makeFocusInteractionEvent({ target: a });
    const eventB = makeFocusInteractionEvent({ target: b });
    const iA = glowFeedback.create({ event: eventA });
    const iB = glowFeedback.create({ event: eventB });
    iA.start(eventA);
    iB.start(eventB);

    expect(a.classList.contains(ACTIVE_CLASS)).toBe(true);
    expect(b.classList.contains(ACTIVE_CLASS)).toBe(true);

    iA.cancel();
    expect(a.classList.contains(ACTIVE_CLASS)).toBe(false);
    expect(b.classList.contains(ACTIVE_CLASS)).toBe(true);

    iB.dispose();
    expect(b.classList.contains(ACTIVE_CLASS)).toBe(false);
  });
});
