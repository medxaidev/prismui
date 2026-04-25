/**
 * Stage-10 · L4 Feedback · `glowFeedback` factory (v0.5 Phase 4.1)
 *
 * Source of truth: `@/devdocs/system/feedback-contract.md` v0.5 §11.
 *
 * Highlights:
 *   · Focus-source visual feedback (Z-3 · OQ-FB-P4-1 decision C):
 *     toggle a `prismui-glow-active` class on the host target. The actual
 *     visual (box-shadow / outline / border) is owned by the host CSS
 *     (§11.4 Host CSS prerequisites) — the factory only flips the boolean.
 *   · `:focus-visible`-aware (Z-5): the Controller derives the boolean
 *     once and passes it as `FocusSourceEvent.focusVisible`. Non-visible
 *     focus (e.g. mouse click) returns a no-op instance.
 *   · FB-3 receivers whitelist (§8.1 v0.5 row): `target.classList.add` /
 *     `target.classList.remove` with the prefix-constrained literal
 *     `prismui-glow-active` (OQ-FB-P4-2).
 *   · P0-3 dual-path cleanup (`finish()`): transitionend on target with
 *     `{ once: true }` + `e.target !== target` filter (rejects descendant
 *     bubble) + setTimeout fallback (350 ms) so reduced-motion / no-
 *     transition / hidden-layer cases still reach `dispose()`.
 *     `cleanup()` is idempotent — whichever path fires first wins.
 *   · FB-2.1 + FB-2.3 compliant: every method guards `disposed` · `start`
 *     honors at-most-once.
 */

import type {
  FeedbackFactory,
  FeedbackInstance,
  InteractionEvent,
  InteractionEventSource,
} from '../../core/feedback';

// Side-effect import — see `./glow-feedback.css` for the rationale. The CSS
// only ships a reduced-motion fallback (§11.3) — actual glow visuals live
// in host CSS (§11.4) so consumers can swap box-shadow / outline / border.
import './glow-feedback.css';

const ACTIVE_CLASS = 'prismui-glow-active';

/**
 * Fallback timeout for the transitionend safety net (§11.2 P0-3).
 *
 * MUST be ≥ the longest plausible host transition + a small buffer. Most
 * design systems land in the 150–250 ms range; 350 ms covers comfortable
 * 200 ms transitions plus a 150 ms cushion. Reduced-motion paths also
 * benefit — even with `transition: none`, the timer guarantees `dispose()`.
 */
const FINISH_FALLBACK_MS = 350;

let glowIdCounter = 0;

export const glowFeedback: FeedbackFactory = {
  name: 'glow',
  create({ event }): FeedbackInstance {
    // Phase 4.1: only focus source produces a glow. Other sources go
    // through `createNoOpInstance` so the Controller's
    // `factories.length === focusInstances.length` invariant (§6.4)
    // holds without ghost-field gymnastics.
    if (event.source !== 'focus') {
      return createNoOpInstance(event.source);
    }

    // Z-5 · `:focus-visible` gate. The Controller derived the boolean
    // once (deriveFocusVisible · §6.1) — factories MUST trust it
    // (FB-3 No DOM Read).
    if (!event.focusVisible) {
      return createNoOpInstance('focus');
    }

    const { target } = event;

    let disposed = false;
    let started = false; // FB-2.3 · `start` may be called at most once
    let cleaned = false; // P0-3 · idempotent cleanup guard

    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;
    let transitionListener: ((e: TransitionEvent) => void) | null = null;

    const detachListener = (): void => {
      if (transitionListener) {
        // `removeEventListener` is safe-idempotent: a `{ once: true }`
        // listener that already auto-detached after fire is a no-op
        // here. Calling it on the dispose path defends against the
        // fallback-timer-wins case where the listener never fired.
        target.removeEventListener('transitionend', transitionListener);
        transitionListener = null;
      }
    };

    const clearFallback = (): void => {
      if (fallbackTimer != null) {
        clearTimeout(fallbackTimer);
        fallbackTimer = null;
      }
    };

    const cleanup = (): void => {
      if (cleaned) return; // P0-3 · whichever path wins, the other no-ops
      cleaned = true;
      // The Controller delegates the dispose chain to the instance —
      // `dispose()` already handles classList removal + listener detach +
      // timer clear.
      self.dispose();
    };

    const self: FeedbackInstance = {
      id: `glow-${++glowIdCounter}`,
      pointerId: null, // focus source · contract §3.1 + §6.4
      source: 'focus',

      start(_e: InteractionEvent) {
        if (disposed) return;
        if (started) return; // FB-2.3 defensive ignore
        started = true;
        // §8.1 receivers whitelist · prefix-constrained literal class.
        target.classList.add(ACTIVE_CLASS);
      },

      finish() {
        if (disposed) return;
        if (!started) return; // never started · nothing to wind down
        if (cleaned) return; // already torn down via cancel / earlier finish

        // P0-3 · dual-path cleanup (§11.2):
        //   (a) transitionend with `{ once: true }` and a target filter
        //       so descendant bubble events do not prematurely cleanup
        //   (b) setTimeout fallback so reduced-motion / no-transition /
        //       hidden-layer cases still reach `dispose()`
        // `cleanup()` is idempotent — the first path to win wins.
        transitionListener = (e: TransitionEvent) => {
          // `e.target` is whatever element fired the transitionend. We
          // only care about events from `target` itself — descendants
          // (e.g. a future inner `<span>` with its own transition) MUST
          // be ignored.
          if (e.target !== target) return;
          cleanup();
        };
        target.addEventListener('transitionend', transitionListener, { once: true });

        fallbackTimer = setTimeout(cleanup, FINISH_FALLBACK_MS);

        // Toggle the class OFF — host CSS transitions back to the resting
        // state, which is what we listen for above.
        target.classList.remove(ACTIVE_CLASS);
      },

      cancel() {
        if (disposed) return;
        // Immediate path · skip transitionend dance entirely.
        cleanup();
      },

      dispose() {
        if (disposed) return;
        disposed = true; // FB-2.1 absolute terminal marker
        // Defensive class removal — covers paths where dispose() arrives
        // before `finish()` had a chance to flip the class off.
        try {
          target.classList.remove(ACTIVE_CLASS);
        } catch {
          // jsdom / detached node corner cases — swallow rather than crash
          // the unmount path.
        }
        clearFallback();
        detachListener();
      },
    };

    return self;
  },
};

/**
 * Placeholder instance for non-`focus` source events or non-visible focus.
 *
 * Same shape rationale as `ripple`'s `createNoOpInstance`: keeps the
 * `factories.length === focusInstances.length` invariant intact (§6.4 ·
 * P1-2 `supportsFocus` ghost-field removal) so the Controller never has to
 * special-case which factories opted into a source.
 */
function createNoOpInstance(source: InteractionEventSource): FeedbackInstance {
  let disposed = false;
  return {
    id: `glow-noop-${++glowIdCounter}`,
    pointerId: null, // §3.1 contract `number | null` · non-press defaults to null
    source,
    start(_e: InteractionEvent) {
      void _e;
      /* no-op · glow is focus-only · other sources fall through */
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
