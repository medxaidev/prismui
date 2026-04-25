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

// Side-effect import of the ripple stylesheet. Consumers that import
// `rippleFeedback` (directly or transitively through a component like
// `<Button>`) automatically get the `.prismui-ripple` rules without having
// to remember a separate CSS import in their app entry. This is the only
// way the bundler knows the CSS is part of the feedback factory contract —
// otherwise the class lands on the DOM with zero styling (Phase 3 storybook
// regression).
import './ripple-feedback.css';

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
 * Placeholder instance for non-`press` source events.
 *
 * v0.5 Round 2 P0-1 fix · `pointerId: null` (was `-1`) — aligns with the
 * extended contract `FeedbackInstance.pointerId: number | null` (§3.1) and
 * the focus-source rule that every focus instance MUST carry `pointerId ===
 * null` (§6.4). Hover-source pointerId narrowing is deferred to the Phase 6+
 * hover adapter spec.
 *
 * The instance satisfies `FeedbackInstance` (all methods are no-ops +
 * idempotent) so the Controller can hand it back and move on without
 * special-casing the source.
 */
function createNoOpInstance(source: InteractionEventSource): FeedbackInstance {
  let disposed = false;
  return {
    id: `ripple-noop-${++rippleIdCounter}`,
    pointerId: null, // v0.5 Round 2 P0-1 · contract `number | null` (§3.1)
    source,
    start(_e: InteractionEvent) {
      void _e;
      /* no-op · ripple is press-only · other sources fall through */
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
