/**
 * Stage-10 · L4 Feedback · `rippleFeedback` tests
 *
 * Contract: `@/devdocs/system/feedback-contract.md` v0.2 §10 + §8 (FB-3)
 *
 * Coverage:
 *   · press-source lifecycle (start → finish → animationend → dispose)
 *   · cancel path · immediate dispose
 *   · FB-2.1 idempotent no-op on re-start / re-dispose
 *   · FB-2.3 start at most once
 *   · P1-1 ownerDocument-based createElement (iframe correctness proxy)
 *   · non-press source returns no-op placeholder instance
 *   · self-owned node cleanup on dispose
 *   · concurrent pointer ids create independent nodes
 */

import { describe, expect, it, vi } from 'vitest';

import type { InteractionEvent, PressInteractionEvent } from '../../core/feedback';

import { rippleFeedback } from './ripple-feedback';

function makePressInteractionEvent(
  overrides: Partial<PressInteractionEvent> = {},
): PressInteractionEvent {
  const target = document.createElement('button');
  document.body.appendChild(target);
  return {
    source: 'press',
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
    timestamp: 0,
    modifiers: { ctrl: false, shift: false, alt: false, meta: false },
    ...overrides,
  };
}

describe('rippleFeedback', () => {
  it('creates a <span class="prismui-ripple"> on start() inside the press target', () => {
    const event = makePressInteractionEvent();
    const instance = rippleFeedback.create({ event });

    expect(event.target.querySelector('.prismui-ripple')).toBeNull();
    instance.start(event);
    const span = event.target.querySelector<HTMLSpanElement>('.prismui-ripple');
    expect(span).not.toBeNull();
    expect(span?.tagName).toBe('SPAN');
  });

  it('populates CSS custom properties --ripple-x / -y / -size from the event geometry', () => {
    const event = makePressInteractionEvent({ x: 42, y: 13, width: 100, height: 40 });
    const instance = rippleFeedback.create({ event });
    instance.start(event);

    const span = event.target.querySelector<HTMLSpanElement>('.prismui-ripple')!;
    expect(span.style.getPropertyValue('--ripple-x')).toBe('42px');
    expect(span.style.getPropertyValue('--ripple-y')).toBe('13px');
    // size = max(width, height) * 2 = 200
    expect(span.style.getPropertyValue('--ripple-size')).toBe('200px');
  });

  it('uses target.ownerDocument.createElement (iframe-safe · P1-1)', () => {
    const event = makePressInteractionEvent();
    const spy = vi.spyOn(event.target.ownerDocument, 'createElement');
    const instance = rippleFeedback.create({ event });
    instance.start(event);
    expect(spy).toHaveBeenCalledWith('span');
    spy.mockRestore();
  });

  it('finish() removes the node after animationend fires', () => {
    const event = makePressInteractionEvent();
    const instance = rippleFeedback.create({ event });
    instance.start(event);
    const span = event.target.querySelector<HTMLSpanElement>('.prismui-ripple')!;

    instance.finish();
    // Before animationend · the element still exists.
    expect(event.target.contains(span)).toBe(true);

    // Fire the animation-end lifecycle event manually.
    span.dispatchEvent(new Event('animationend'));

    expect(event.target.querySelector('.prismui-ripple')).toBeNull();
  });

  it('cancel() removes the node immediately (no wait for animationend)', () => {
    const event = makePressInteractionEvent();
    const instance = rippleFeedback.create({ event });
    instance.start(event);

    instance.cancel();
    expect(event.target.querySelector('.prismui-ripple')).toBeNull();
  });

  it('dispose() synchronously removes the node and is idempotent (FB-2.1)', () => {
    const event = makePressInteractionEvent();
    const instance = rippleFeedback.create({ event });
    instance.start(event);

    instance.dispose();
    expect(event.target.querySelector('.prismui-ripple')).toBeNull();

    // Second dispose is a no-op · no throw.
    expect(() => instance.dispose()).not.toThrow();
  });

  it('ignores duplicate start() calls (FB-2.3)', () => {
    const event = makePressInteractionEvent();
    const instance = rippleFeedback.create({ event });
    instance.start(event);
    instance.start(event); // defensive no-op

    const rippleNodes = event.target.querySelectorAll('.prismui-ripple');
    expect(rippleNodes).toHaveLength(1);
  });

  it('returns a no-op instance for non-press sources (Phase 2 scope)', () => {
    const progEvent: InteractionEvent = { source: 'programmatic', timestamp: 1 };
    const instance = rippleFeedback.create({ event: progEvent });

    // No DOM mutation on the no-op path.
    const before = document.body.innerHTML;
    instance.start(progEvent);
    instance.finish();
    instance.cancel();
    instance.dispose();
    const after = document.body.innerHTML;
    expect(after).toBe(before);

    expect(instance.source).toBe('programmatic');
  });

  it('produces independent nodes for concurrent pointerIds', () => {
    const e1 = makePressInteractionEvent({ pointerId: 1, x: 10 });
    const e2 = makePressInteractionEvent({ pointerId: 2, x: 20 });
    const i1 = rippleFeedback.create({ event: e1 });
    const i2 = rippleFeedback.create({ event: e2 });
    i1.start(e1);
    i2.start(e2);

    expect(e1.target.querySelectorAll('.prismui-ripple')).toHaveLength(1);
    expect(e2.target.querySelectorAll('.prismui-ripple')).toHaveLength(1);

    // Cancelling one does not touch the other.
    i1.cancel();
    expect(e1.target.querySelectorAll('.prismui-ripple')).toHaveLength(0);
    expect(e2.target.querySelectorAll('.prismui-ripple')).toHaveLength(1);

    i2.dispose();
  });
});
