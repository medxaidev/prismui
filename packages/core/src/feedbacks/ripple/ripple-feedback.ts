/**
 * Stage-10 · L4 Feedback · `rippleFeedback` POC implementation
 *
 * Source of truth: `@/devdocs/system/feedback-contract.md` v0.2 §10
 *
 * Highlights:
 *   · Phase 2 implements ONLY `source: 'press'` · other sources return a
 *     no-op instance placeholder (Phase 6+ fills them in).
 *   · Uses `event.target.ownerDocument.createElement` (NOT global `document`)
 *     for iframe / shadow-DOM correctness (Round 1 v2.1 P1-1).
 *   · Self-owned `<span>` node only · never mutates a foreign node
 *     (FB-3 No DOM Input Read + No Foreign Tree Query · §8).
 *   · Listens to the effect node's `animationend` event ONLY (FB-3 §8.1
 *     whitelist) · never to input events.
 *   · CSS keyframes for the animation (OQ-FB-9 decision A) · reduced-motion
 *     CSS fallback is defense-in-depth (§9.1 main guarantee lives in the
 *     Controller).
 *   · FB-2.1 + FB-2.3 compliant: every method guards `disposed` · `start`
 *     honors at-most-once.
 */

import type {
  FeedbackFactory,
  FeedbackInstance,
  InteractionEvent,
  InteractionEventSource,
} from '../../core/feedback';

let rippleIdCounter = 0;

export const rippleFeedback: FeedbackFactory = {
  name: 'ripple',
  create({ event }): FeedbackInstance {
    // Phase 2: only press source produces a visible ripple.
    if (event.source !== 'press') {
      return createNoOpInstance(event.source);
    }

    const { target, pointerId, x, y, width, height } = event;

    // Walk to the owning document — iframe / shadow-DOM correctness (P1-1).
    const doc = target.ownerDocument;

    let el: HTMLSpanElement | null = null;
    let disposed = false;
    let started = false; // FB-2.3: `start` may be called at most once

    const self: FeedbackInstance = {
      id: `ripple-${++rippleIdCounter}`,
      pointerId,
      source: 'press',

      start(e) {
        if (disposed) return;
        if (started) return; // FB-2.3 defensive ignore
        started = true;
        if (e.source !== 'press') return; // narrowing guard

        // Compute ripple geometry from press event fields (IE-CORE-2 geometry).
        const size = Math.max(width, height) * 2;

        el = doc.createElement('span'); // ✅ ownerDocument
        el.className = 'prismui-ripple';
        el.style.setProperty('--ripple-x', `${x}px`);
        el.style.setProperty('--ripple-y', `${y}px`);
        el.style.setProperty('--ripple-size', `${size}px`);

        // Self-owned mount · attached inside the press target (§8.1 whitelist).
        target.appendChild(el);
      },

      finish() {
        if (disposed) return;
        if (!el) return; // never started · nothing to cleanup

        // Listen for animation completion on the OWN node · NEVER input events.
        // `once: true` auto-removes the listener after fire (L-F2 guard).
        el.addEventListener('animationend', () => self.dispose(), { once: true });
      },

      cancel() {
        if (disposed) return;
        // Immediate path · skip the animationend dance.
        self.dispose();
      },

      dispose() {
        if (disposed) return;
        disposed = true; // FB-2.1 absolute terminal marker
        el?.remove(); // ✅ self-owned removal
        el = null;
      },
    };

    return self;
  },
};

/**
 * Placeholder instance for non-`press` source events · Phase 2 does not
 * implement hover/focus/programmatic visuals. The instance satisfies
 * `FeedbackInstance` (all methods are no-ops + idempotent) so the Controller
 * can hand it back and move on without special-casing.
 */
function createNoOpInstance(source: InteractionEventSource): FeedbackInstance {
  let disposed = false;
  return {
    id: `ripple-noop-${++rippleIdCounter}`,
    pointerId: -1, // sentinel · Phase 6+ will decide the real contract
    source,
    start(_e: InteractionEvent) {
      void _e;
      /* no-op · Phase 6+ */
    },
    finish() {
      /* no-op · Phase 6+ */
    },
    cancel() {
      /* no-op · Phase 6+ */
    },
    dispose() {
      if (disposed) return;
      disposed = true;
    },
  };
}
