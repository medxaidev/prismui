/**
 * Stage-10 · L4 Feedback · `FeedbackController` implementation
 *
 * Source of truth: `@/devdocs/system/feedback-contract.md` v0.2
 *   · §4   Source-Agnostic API
 *   · §6   Managed Ephemeral Instances (FB-2)
 *   · §6.6 updateFactories policy (OQ-FB-12 · natural finish · no migration)
 *   · §9.1 reduced-motion layering (contract main guarantee + CSS defense-in-depth)
 *
 * Architecture:
 *   · `createFeedbackController()` returns a `{ controller, dispose }` pair so
 *     the React hook layer (`useFeedback`) owns lifecycle cleanup. The public
 *     `FeedbackController` type (see `./types.ts`) mirrors §4.3 exactly.
 *   · Internal state:
 *       currentFactories          — replaceable factory list (OQ-FB-12)
 *       activeInstances           — Map<pointerId, FeedbackInstance[]> (FB-2)
 *       pressSubscribers          — Set<PressHandlers> (egress observers)
 *       reducedMotion / mediaQuery — matchMedia('(prefers-reduced-motion: reduce)')
 *
 *   · Dispatch order (FB-ARCH-3.2):
 *       1. wrap L2 `PressEvent` → `PressInteractionEvent`
 *       2. manage activeInstances (reduced-motion gate for create)
 *       3. notify pressSubscribers
 *
 *   · Ingress / Egress separation (FB-ARCH-3.1):
 *       ingress  = `controller.pressHandlers` (spread onto usePress options)
 *       egress   = `controller.subscribePress(custom)` (extra observers)
 *
 *   · Non-equivalence (FB-ARCH-3.3):
 *       subscribers are only invoked because the ingress was wired — they are
 *       NOT a substitute for the ingress handshake with `usePress`.
 */

import type { PressEvent } from '../interaction-events';

import type {
  FeedbackController,
  FeedbackFactory,
  FeedbackInstance,
  FocusHandlers,
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
  const activeInstances = new Map<number, FeedbackInstance[]>();
  const pressSubscribers = new Set<PressHandlers>();

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

  // ── Controller surface ───────────────────────────────────────
  const controller: FeedbackController = {
    subscribePress(handlers: PressHandlers): Unsubscribe {
      pressSubscribers.add(handlers);
      return () => {
        pressSubscribers.delete(handlers);
      };
    },

    // Phase 6+ placeholders · wired to empty Sets so signatures resolve
    // but nothing fires until the corresponding source adapters land.
    subscribeHover(_handlers: HoverHandlers): Unsubscribe {
      void _handlers;
      return () => {
        /* no-op · Phase 6+ */
      };
    },
    subscribeFocus(_handlers: FocusHandlers): Unsubscribe {
      void _handlers;
      return () => {
        /* no-op · Phase 6+ */
      };
    },

    /**
     * Phase 2: only `source: 'programmatic'` is a legitimate trigger target
     * (its lifecycle contract is Phase 6+). Non-programmatic sources MUST
     * route through their own ingress adapter (press → usePress) — calling
     * `trigger` with those shapes is a misuse and is intentionally a no-op.
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

    updateFactories(factories: FeedbackFactory[]): void {
      // OQ-FB-12 policy: only affect future onPressStart. Do NOT touch
      // activeInstances — removed factories' instances finish naturally,
      // new factories apply starting on the next source activation.
      currentFactories = factories;
    },
  };

  // ── Unmount disposer (L-F1 + L-F3) ───────────────────────────
  const dispose = (): void => {
    // FB-2 §6.5 unmount rule: dispose() every active instance synchronously,
    // then clear the Map. Bypasses `finish`/`cancel` to match L2 C-3
    // "unmount is the highest-priority terminator" contract.
    for (const [, instances] of activeInstances) {
      for (const instance of instances) {
        instance.dispose();
      }
    }
    activeInstances.clear();

    // Detach matchMedia subscription (L-F3).
    if (mediaQuery && handleMediaChange) {
      mediaQuery.removeEventListener('change', handleMediaChange);
      mediaQuery = null;
      handleMediaChange = null;
    }

    // Drop egress observers — not strictly required for GC, but makes the
    // controller inert after unmount (defensive).
    pressSubscribers.clear();
  };

  return { controller, dispose };
}
