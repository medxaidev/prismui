/**
 * Stage-10 · L4 Feedback · `FeedbackController` implementation
 *
 * Source of truth: `@/devdocs/system/feedback-contract.md` v0.5 (Phase 4.1)
 *   · §4   Source-Agnostic API (v0.5 · press + focus both real)
 *   · §6   Managed Ephemeral Instances (FB-2)
 *   · §6.1 Hybrid storage model (Z-1): press Map + focus singleton field
 *   · §6.4 Focus-source concurrency (Z-2: pointerId === null)
 *   · §6.5 Cleanup rules (P0-2: focus identity guard for blur→refocus)
 *   · §6.6 updateFactories policy (OQ-FB-12 · natural finish · no migration)
 *   · §9.1 reduced-motion layering (contract main guarantee + CSS defense-in-depth)
 *
 * Architecture:
 *   · `createFeedbackController()` returns a `{ controller, dispose }` pair so
 *     the React hook layer (`useFeedback`) owns lifecycle cleanup. The public
 *     `FeedbackController` type (see `./types.ts`) mirrors §4.3 exactly.
 *
 *   · Internal state (Z-1 hybrid storage model):
 *       currentFactories          — replaceable factory list (OQ-FB-12)
 *       activeInstances           — Map<pointerId, FeedbackInstance[]> (press · FB-2)
 *       focusInstances            — FeedbackInstance[] | null  (focus singleton · Z-2)
 *       pressSubscribers          — Set<PressHandlers>          (press egress observers)
 *       focusSubscribers          — Set<FocusHandlers>          (focus egress observers · v0.5)
 *       reducedMotion / mediaQuery — matchMedia('(prefers-reduced-motion: reduce)')
 *
 *   · Dispatch order (FB-ARCH-3.2 · symmetric for press / focus):
 *       1. normalize adapter event → InteractionEvent (press: PressEvent →
 *          PressInteractionEvent · focus: React.FocusEvent → FocusSourceEvent)
 *       2. manage instance store (reduced-motion gate for create)
 *       3. notify subscribers (with the original adapter event · §4.2 P0-1)
 *
 *   · Ingress / Egress separation (FB-ARCH-3.1):
 *       press  ingress  = `controller.pressHandlers`  (spread onto usePress options)
 *       press  egress   = `controller.subscribePress(custom)`
 *       focus  ingress  = `controller.focusHandlers`  (spread onto host element React props)
 *       focus  egress   = `controller.subscribeFocus(custom)`
 *
 *   · P0-2 Focus identity guard (v0.5 Round 1):
 *       blur completion captures the current `focusInstances` array reference;
 *       the post-animation callback only clears the field if it is still the
 *       same array (i.e. no intervening refocus replaced it). This prevents
 *       the blur→finish-animation→refocus race from clearing the new account.
 *
 *   · Non-equivalence (FB-ARCH-3.3):
 *       subscribers are only invoked because the ingress was wired — they are
 *       NOT a substitute for the ingress handshake with usePress / host props.
 */

import type * as React from 'react';

import type { PressEvent } from '../interaction-events';

import type {
  FeedbackController,
  FeedbackFactory,
  FeedbackInstance,
  FocusHandlers,
  FocusSourceEvent,
  HoverHandlers,
  InteractionEvent,
  PressHandlers,
  PressInteractionEvent,
  Unsubscribe,
} from './types';

// ─────────────────────────────────────────────────────────────────────
// Public factory
// ─────────────────────────────────────────────────────────────────────

export interface CreateFeedbackControllerResult {
  controller: FeedbackController;
  /**
   * Release all Controller-owned resources (activeInstances + matchMedia
   * subscription). `useFeedback` MUST call this on unmount (L-F1 / L-F3).
   */
  dispose: () => void;
}

export function createFeedbackController(
  initialFactories: FeedbackFactory[] = [],
): CreateFeedbackControllerResult {
  // ── Internal state ───────────────────────────────────────────
  let currentFactories: FeedbackFactory[] = initialFactories;

  // Press source store · Map<pointerId, FeedbackInstance[]> (FB-2 · §6.1).
  const activeInstances = new Map<number, FeedbackInstance[]>();
  const pressSubscribers = new Set<PressHandlers>();

  // Focus source store · singleton field (Z-1 hybrid model · §6.1).
  // Array reference identity is the basis for the P0-2 identity guard:
  // each `onFocus` call assigns a fresh array, and the subsequent `onBlur`
  // captures it; only that captured snapshot may clear the field.
  let focusInstances: FeedbackInstance[] | null = null;
  const focusSubscribers = new Set<FocusHandlers>();

  // ── reduced-motion (OQ-FB-8 Option A · subscribe 'change') ──
  let reducedMotion = false;
  let mediaQuery: MediaQueryList | null = null;
  let handleMediaChange: ((e: MediaQueryListEvent) => void) | null = null;

  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotion = mediaQuery.matches;
    handleMediaChange = (e: MediaQueryListEvent) => {
      reducedMotion = e.matches;
      // Per §9.1 + OQ-FB-8:
      //   · false → true  · do NOT dispose active instances (visual continuity)
      //   · just stop creating new instances going forward
      // Already-active instances finish naturally; nothing to do here.
    };
    // addEventListener is universal since Safari 14; we rely on modern browsers.
    mediaQuery.addEventListener('change', handleMediaChange);
  }

  // ── Helpers ──────────────────────────────────────────────────
  const wrapPress = (event: PressEvent): PressInteractionEvent => ({
    source: 'press',
    ...event,
  });

  /**
   * Derive `:focus-visible` once at the Controller boundary (Z-5 · §6.4).
   * Factories receive the boolean as part of `FocusSourceEvent.focusVisible`
   * and MUST NOT walk back into the DOM to re-derive it (FB-3 No DOM Read).
   *
   * Failure modes (jsdom / SSR-shaped env / non-Element targets) collapse
   * to `false` — a safe default that simply prevents focus glow visuals from
   * firing in non-keyboard navigation contexts.
   */
  const deriveFocusVisible = (event: React.FocusEvent<HTMLElement>): boolean => {
    try {
      const target = event.currentTarget;
      // `matches(':focus-visible')` is the spec-blessed query (Chromium /
      // Firefox / Safari 15.4+). jsdom returns `false` (the heuristic is
      // unimplemented) — that is the right answer for headless tests.
      return typeof target?.matches === 'function'
        ? target.matches(':focus-visible')
        : false;
    } catch {
      // Some test envs throw on unsupported pseudo-class queries — degrade
      // gracefully to "not focus-visible" rather than crash the ingress.
      return false;
    }
  };

  const wrapFocus = (
    event: React.FocusEvent<HTMLElement>,
  ): FocusSourceEvent & { source: 'focus' } => ({
    source: 'focus',
    target: event.currentTarget,
    focusVisible: deriveFocusVisible(event),
    nativeEvent: event.nativeEvent,
  });

  // ── Default ingress · pressHandlers (FB-ARCH-3.1 Phase 2) ────
  const onPressStart = (event: PressEvent): void => {
    const iev = wrapPress(event);

    // 1. Manage activeInstances (reduced-motion gate · §9.1 main guarantee)
    if (!reducedMotion && currentFactories.length > 0) {
      for (const factory of currentFactories) {
        const instance = factory.create({ event: iev });
        const arr = activeInstances.get(event.pointerId);
        if (arr) {
          arr.push(instance);
        } else {
          activeInstances.set(event.pointerId, [instance]);
        }
        // FB-2.3: Controller invokes start() at most once per instance.
        instance.start(iev);
      }
    }

    // 2. Notify egress subscribers (FB-ARCH-3.2 dispatch order)
    for (const sub of pressSubscribers) {
      sub.onPressStart?.(event);
    }
  };

  const onPressEnd = (event: PressEvent): void => {
    // 1. Manage activeInstances · natural finish path
    const arr = activeInstances.get(event.pointerId);
    if (arr) {
      for (const instance of arr) {
        instance.finish();
      }
      // §6.5: wait animation → Map.delete. Implementations self-manage the
      // animation-end → dispose cycle; the Controller only owns the Map
      // ownership handoff, which happens synchronously here. Individual
      // instance `dispose()` can be called later without Controller help
      // (FB-2.1 idempotent no-op already guards duplicate dispose).
      activeInstances.delete(event.pointerId);
    }

    // 2. Notify egress subscribers
    for (const sub of pressSubscribers) {
      sub.onPressEnd?.(event);
    }
  };

  const onPressCancel = (event: PressEvent): void => {
    // 1. Manage activeInstances · immediate cancel path
    const arr = activeInstances.get(event.pointerId);
    if (arr) {
      for (const instance of arr) {
        instance.cancel();
      }
      activeInstances.delete(event.pointerId);
    }

    // 2. Notify egress subscribers
    for (const sub of pressSubscribers) {
      sub.onPressCancel?.(event);
    }
  };

  const pressHandlers: Required<PressHandlers> = {
    onPressStart,
    onPressEnd,
    onPressCancel,
  };

  // ── Default ingress · focusHandlers (FB-ARCH-3.1 · v0.5 Phase 4.1) ──
  //
  // Each `onFocus` / `onBlur` invocation receives a React.FocusEvent — the
  // adapter shape committed in §4.2 (P0-1). Internally we normalize it to a
  // `FocusSourceEvent & { source: 'focus' }` before handing it to factories;
  // egress observers (`focusSubscribers`) see the original React event so
  // observer code stays adapter-aware (FB-ARCH-3.2).
  const onFocus = (event: React.FocusEvent<HTMLElement>): void => {
    const fev = wrapFocus(event);

    // 1. Manage focusInstances singleton (reduced-motion gate · §9.1).
    //    Always create one instance per factory — factories that do not
    //    care about focus return a no-op (`createNoOpInstance` shape ·
    //    `factories.length` invariant in §6.4 · P1-2 ghost field removal).
    if (!reducedMotion && currentFactories.length > 0) {
      const instances: FeedbackInstance[] = [];
      for (const factory of currentFactories) {
        const instance = factory.create({ event: fev });
        instances.push(instance);
        instance.start(fev);
      }
      // Fresh array assignment is the foundation of P0-2 identity guard:
      // any in-flight blur completion captured a different array reference.
      focusInstances = instances;
    }

    // 2. Notify egress subscribers (FB-ARCH-3.2 dispatch order).
    for (const sub of focusSubscribers) {
      sub.onFocus?.(event);
    }
  };

  const onBlur = (event: React.FocusEvent<HTMLElement>): void => {
    // 1. Manage focusInstances · natural finish path with identity guard.
    //
    // P0-2 (v0.5 Round 1): the post-animation cleanup callback only clears
    // `focusInstances` if the field still references the same array we
    // captured at blur time. If a refocus has already replaced it with a
    // new array, the old completion is a no-op — the new account survives.
    const capturedArray = focusInstances;
    if (capturedArray) {
      for (const instance of capturedArray) {
        instance.finish();
      }
      // Synchronous handoff: instances now own their own animation-end →
      // dispose cycle (FB-2.1 idempotent guard handles repeat dispose).
      // The Controller's only remaining duty is the identity-guarded
      // clearing of `focusInstances` once the CURRENT generation completes.
      // Real factories (e.g. glow) call `dispose()` from `finish` → cleanup
      // path; the Controller does not actively wait for animationend itself
      // because the Map<pointerId,...> press path doesn't either (the
      // contract just says "wait for animation"). Symmetry: clear the
      // singleton field ONLY if it still equals the captured snapshot.
      if (focusInstances === capturedArray) {
        focusInstances = null;
      }
    }

    // 2. Notify egress subscribers.
    for (const sub of focusSubscribers) {
      sub.onBlur?.(event);
    }
  };

  const focusHandlers: Required<FocusHandlers> = {
    onFocus,
    onBlur,
  };

  // ── Controller surface ───────────────────────────────────────
  const controller: FeedbackController = {
    subscribePress(handlers: PressHandlers): Unsubscribe {
      pressSubscribers.add(handlers);
      return () => {
        pressSubscribers.delete(handlers);
      };
    },

    // Phase 6+ placeholder · wired to a no-op so the signature resolves;
    // nothing fires until the hover source adapter lands.
    subscribeHover(_handlers: HoverHandlers): Unsubscribe {
      void _handlers;
      return () => {
        /* no-op · Phase 6+ */
      };
    },

    // v0.5 Phase 4.1 · real focus egress (parallels subscribePress).
    subscribeFocus(handlers: FocusHandlers): Unsubscribe {
      focusSubscribers.add(handlers);
      return () => {
        focusSubscribers.delete(handlers);
      };
    },

    /**
     * Phase 2: only `source: 'programmatic'` is a legitimate trigger target
     * (its lifecycle contract is Phase 6+). Non-programmatic sources MUST
     * route through their own ingress adapter (press → usePress, focus →
     * host onFocus/onBlur) — calling `trigger` with those shapes is a
     * misuse and is intentionally a no-op.
     */
    trigger(event: InteractionEvent): void {
      if (event.source === 'programmatic') {
        // Placeholder for Phase 6+ programmatic-source instance management.
        // Intentionally no-op in Phase 2 (no analytics / form-error
        // Feedback factories ship yet).
        return;
      }
      if (process.env.NODE_ENV !== 'production') {
        // Fire a DEV warning to catch accidental misuse early.
        console.warn(
          `[prismui] FeedbackController.trigger only supports source: 'programmatic' in Phase 2 ` +
            `(got source: ${String(event.source)}). Wire through the adapter instead.`,
        );
      }
    },

    get pressHandlers() {
      return pressHandlers;
    },

    get focusHandlers() {
      return focusHandlers;
    },

    updateFactories(factories: FeedbackFactory[]): void {
      // OQ-FB-12 policy: only affect future source activations. Do NOT
      // touch active instances — removed factories' instances finish
      // naturally, new factories apply starting on the next source
      // activation (`onPressStart` / `onFocus`).
      currentFactories = factories;
    },
  };

  // ── Unmount disposer (L-F1 + L-F3) ───────────────────────────
  const dispose = (): void => {
    // FB-2 §6.5 unmount rule: dispose() every active instance synchronously,
    // then clear the stores. Bypasses `finish`/`cancel` to match L2 C-3
    // "unmount is the highest-priority terminator" contract.

    // Press source store.
    for (const [, instances] of activeInstances) {
      for (const instance of instances) {
        instance.dispose();
      }
    }
    activeInstances.clear();

    // Focus source store (v0.5 Phase 4.1 · §6.5 unmount row).
    if (focusInstances) {
      for (const instance of focusInstances) {
        instance.dispose();
      }
      // Synchronous · unmount terminal state has no generation ambiguity
      // (the host React tree is gone — refocus is impossible).
      focusInstances = null;
    }

    // Detach matchMedia subscription (L-F3).
    if (mediaQuery && handleMediaChange) {
      mediaQuery.removeEventListener('change', handleMediaChange);
      mediaQuery = null;
      handleMediaChange = null;
    }

    // Drop egress observers — not strictly required for GC, but makes the
    // controller inert after unmount (defensive).
    pressSubscribers.clear();
    focusSubscribers.clear();
  };

  return { controller, dispose };
}
