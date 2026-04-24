/**
 * Stage-10 · L4 Feedback · Type Contracts
 *
 * Source of truth: `@/devdocs/system/feedback-contract.md` v0.2
 *   · §3.1 FeedbackInstance
 *   · §3.2 FeedbackFactory
 *   · §3.3 FeedbackCreateParams  (v0.2 · minimal `{ event }` form · OQ-FB-11)
 *   · §4.1 InteractionEvent      (discriminated union · OQ-FB-3)
 *   · §4.2 Source-specific handlers (PressHandlers / HoverHandlers / FocusHandlers)
 *   · §4.3 FeedbackController
 *
 * Invariant anchors:
 *   · FB-2   Managed Ephemeral Instances
 *   ·  ├ 2.1 disposed is an absolute terminal state · idempotent no-op
 *   ·  ├ 2.2 state-transition graph is contract-level
 *   ·  └ 2.3 start() called at most once per instance
 *   · FB-3   No DOM Input Read + No Foreign Tree Query
 *   · FB-ARCH-3 Source-Agnostic API
 *   ·  ├ 3.1 Ingress/Egress separation  (general principle + Phase 2 concretization)
 *   ·  ├ 3.2 Dispatch order: internal activeInstances → subscribers
 *   ·  └ 3.3 Non-equivalence between pressHandlers (ingress) and subscribePress (egress)
 */

import type { PressEvent } from '../interaction-events';

// ─────────────────────────────────────────────────────────────────────
// Source enumeration (FB-ARCH-3)
// ─────────────────────────────────────────────────────────────────────

export type InteractionEventSource = 'press' | 'hover' | 'focus' | 'programmatic';

// ─────────────────────────────────────────────────────────────────────
// InteractionEvent · discriminated union (OQ-FB-3 decision)
// ─────────────────────────────────────────────────────────────────────

/**
 * Phase 6+ placeholder shapes. Kept as structural types so the discriminated
 * union compiles today without forcing hover/focus wire-up work.
 *
 * Names are `*SourceEvent` (not bare `HoverEvent` / `FocusEvent`) to avoid
 * shadowing DOM globals at consumer import sites.
 */
export type HoverSourceEvent = Record<string, never>;
export type FocusSourceEvent = Record<string, never>;
export type ProgrammaticSourceEvent = { timestamp: number; [key: string]: unknown };

/**
 * Discriminated union keyed on `source`.
 *
 * TypeScript narrowing: `if (e.source === 'press') e.pointerId` is inferred
 * to `number` because the `press` variant intersects with `PressEvent`.
 *
 * Phase 2: only `source: 'press'` produces real events. The other variants
 * exist so L4 Feedback implementations can compile against the final shape
 * without breakage when hover / focus / programmatic land in Phase 6+.
 */
export type InteractionEvent =
  | ({ source: 'press' } & PressEvent)
  | ({ source: 'hover' } & HoverSourceEvent)
  | ({ source: 'focus' } & FocusSourceEvent)
  | ({ source: 'programmatic' } & ProgrammaticSourceEvent);

/** Narrowed alias · press variant only (convenience for Phase 2 code paths). */
export type PressInteractionEvent = Extract<InteractionEvent, { source: 'press' }>;

// ─────────────────────────────────────────────────────────────────────
// Source-specific handler tuples (§4.2)
// ─────────────────────────────────────────────────────────────────────

export type Unsubscribe = () => void;

/**
 * 🔴 Implementation note (v0.3 clarification · documented in Audit Log):
 *
 *   Contract v0.2 §4.2 proposes `(e: InteractionEvent & { source: 'press' })`,
 *   but `Controller.pressHandlers` MUST be spreadable onto `usePress`'s
 *   options whose callbacks are typed `(e: PressEvent) => void`. Keeping
 *   the handler signature on bare `PressEvent` preserves:
 *     · zero-cost interop with L2 usePress (no cast needed)
 *     · subscribers of `subscribePress(...)` already know the source is
 *       `'press'`; the discriminant adds no information here
 *     · `FeedbackInstance.start(event: InteractionEvent)` still carries
 *       the discriminated union — that is where factories narrow
 *
 *   The type of `PressHandlers` below therefore uses `PressEvent`. The
 *   logical mapping stays faithful to the contract: ingress (pressHandlers)
 *   wraps each inbound event into a `PressInteractionEvent` before handing
 *   it to factories / `FeedbackInstance.start`.
 */
export interface PressHandlers {
  onPressStart?: (event: PressEvent) => void;
  onPressEnd?: (event: PressEvent) => void;
  onPressCancel?: (event: PressEvent) => void;
}

export interface HoverHandlers {
  /** 【Phase 6+ placeholder】 */
  onHoverStart?: (event: Extract<InteractionEvent, { source: 'hover' }>) => void;
  /** 【Phase 6+ placeholder】 */
  onHoverEnd?: (event: Extract<InteractionEvent, { source: 'hover' }>) => void;
}

export interface FocusHandlers {
  /** 【Phase 6+ placeholder】 */
  onFocus?: (event: Extract<InteractionEvent, { source: 'focus' }>) => void;
  /** 【Phase 6+ placeholder】 */
  onBlur?: (event: Extract<InteractionEvent, { source: 'focus' }>) => void;
}

// ─────────────────────────────────────────────────────────────────────
// FeedbackInstance · managed ephemeral instance (FB-2)
// ─────────────────────────────────────────────────────────────────────

export interface FeedbackInstance {
  /** Unique id (concurrency tracking + test snapshots). */
  id: string;

  /**
   * Bound pointerId (FB-2 concurrency prerequisite · aligns with L2 C-1
   * independent FSM-per-pointerId). Used as the outer key of
   * `activeInstances: Map<pointerId, FeedbackInstance[]>`.
   */
  readonly pointerId: number;

  /** Bound source (FB-ARCH-3 · Phase 2 always `'press'`). */
  readonly source: InteractionEventSource;

  /**
   * pressstart equivalent · instance enters active / begins animation / playback / analytics.
   *
   * Contract (FB-2.3): Controller MUST call at most once per instance.
   * Instance MAY defensively ignore duplicate `start()` calls.
   */
  start(event: InteractionEvent): void;

  /** Success path · wait for animation to complete, then dispose. */
  finish(): void;

  /** Failure path · destroy immediately · animation interrupted. */
  cancel(): void;

  /**
   * Unmount path · synchronous destruction bypassing any async cleanup.
   *
   * Contract (FB-2.1): after dispose returns, `start / finish / cancel /
   * dispose` are all idempotent no-ops. Implementations MUST guard via a
   * private `disposed: boolean` flag.
   */
  dispose(): void;
}

// ─────────────────────────────────────────────────────────────────────
// FeedbackFactory · creates fresh instances per source event (FB-2)
// ─────────────────────────────────────────────────────────────────────

export interface FeedbackFactory {
  /** Identifier · DevTools / logging / FB-3 static-scan anchor. */
  name: string;

  /** Called once per source-event activation · MUST return a fresh instance. */
  create(params: FeedbackCreateParams): FeedbackInstance;
}

/**
 * 🔴 v0.2 final shape (OQ-FB-11 decision):
 *   · Only `event` — `source` and `target` have been removed
 *   · `event.source` is the single discriminant (no drift possible)
 *   · `target` is read from the narrowed event shape when present
 *   · programmatic source is legitimately target-less
 */
export interface FeedbackCreateParams {
  event: InteractionEvent;
}

// ─────────────────────────────────────────────────────────────────────
// FeedbackController · hook-returned control surface (§4.3)
// ─────────────────────────────────────────────────────────────────────

export interface FeedbackController {
  // ─── Egress observation API (extra observers · OQ-FB-5 decision A) ──
  subscribePress(handlers: PressHandlers): Unsubscribe;
  /** 【Phase 6+ placeholder】 */
  subscribeHover(handlers: HoverHandlers): Unsubscribe;
  /** 【Phase 6+ placeholder】 */
  subscribeFocus(handlers: FocusHandlers): Unsubscribe;

  /**
   * Programmatic trigger (analytics / form error / tests · no DOM source adapter).
   *
   * For `source: 'press'` events prefer wiring `pressHandlers` through
   * `usePress`; `trigger` is meant for emission paths without an ingress
   * adapter (FB-ARCH-3.1 Phase 2 concretization).
   */
  trigger(event: InteractionEvent): void;

  /**
   * Ingress adapter (FB-ARCH-3.1 · press source input channel).
   *
   * Stable reference across renders (OQ-FB-4 useRef + updateFactories).
   * Caller MUST spread onto `usePress({...})` options — otherwise the
   * Controller receives no press events and the default ripple handlers
   * never fire.
   */
  readonly pressHandlers: Required<PressHandlers>;

  /**
   * Swap the active factory list (OQ-FB-12 policy):
   *   · only affects future `onPressStart` calls
   *   · already-active instances keep running under their original factory
   *   · removed factories' instances finish naturally (no retroactive cancel)
   *   · new factories come into effect on the next source activation
   *
   * The Controller itself retains a stable reference — this method mutates
   * internal state only.
   */
  updateFactories(factories: FeedbackFactory[]): void;
}
