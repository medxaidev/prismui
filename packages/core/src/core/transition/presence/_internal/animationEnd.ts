/**
 * Stage-12 · Presence · `transitionend` / `animationend` listener install
 * (TR-PRES-3 layer 2 · OQ-PR-2 Decision C)
 *
 * Subscribes both `transitionend` and `animationend` on the target element and
 * fires the supplied handler on the FIRST event whose `target === el` (own
 * animation end · ignore bubbles from descendants — see
 * presence-primitive.md §5.1 "Why `e.target !== el` filter").
 *
 * Returns an unsubscribe function. The hook calls this in `useEffect` and
 * lets React's effect cleanup invoke the unsubscribe (PR-LIFE-2).
 *
 * jsdom note (Insight 5):
 *   · `TransitionEvent` constructor IS defined; tests can use it directly.
 *   · `AnimationEvent` constructor is NOT defined; tests dispatch
 *     `new Event('animationend', { bubbles: true })` — the listener still
 *     fires because we only assert `e.target === el` (not the event type).
 */

export interface AnimationEndSubscription {
  /** Removes both listeners. Idempotent. */
  unsubscribe: () => void;
}

export function subscribeAnimationEnd(
  el: Element,
  handler: () => void,
): AnimationEndSubscription {
  let active = true;

  const onEvent = (event: Event) => {
    if (!active) return;
    // Own-animation gate — descendant animations bubble up but should not
    // resolve the parent Presence transition.
    if (event.target !== el) return;
    handler();
  };

  el.addEventListener('transitionend', onEvent);
  el.addEventListener('animationend', onEvent);

  return {
    unsubscribe: () => {
      if (!active) return;
      active = false;
      el.removeEventListener('transitionend', onEvent);
      el.removeEventListener('animationend', onEvent);
    },
  };
}
