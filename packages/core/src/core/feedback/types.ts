/**
 * Stage-10 · L4 Feedback · Type Contracts
 *
 * Source of truth: `@/devdocs/system/feedback-contract.md` v0.5 (Phase 4.1 ·
 * Round 1 + Round 2 收敛 · 待签字实施)
 *   · §3.1 FeedbackInstance     (v0.5 · `pointerId: number | null` extended)
 *   · §3.2 FeedbackFactory
 *   · §3.3 FeedbackCreateParams (v0.2 · minimal `{ event }` form · OQ-FB-11)
 *   · §4.1 InteractionEvent     (discriminated union · v0.5 · focus variant
 *                                lifted from `Record<string, never>` to a
 *                                real `FocusSourceEvent` shape)
 *   · §4.2 Source-specific handlers (v0.5 P0-1 · ingress 类型闭环修正:
 *                                    PressHandlers stays `PressEvent`,
 *                                    FocusHandlers takes `React.FocusEvent`)
 *   · §4.3 FeedbackController   (v0.5 · `focusHandlers: Required<FocusHandlers>`
 *                                ingress · `subscribeFocus` egress real)
 *
 * Invariant anchors:
 *   · FB-2   Managed Ephemeral Instances
 *   ·  ├ 2.1 disposed is an absolute terminal state · idempotent no-op
 *   ·  ├ 2.2 state-transition graph is contract-level
 *   ·  └ 2.3 start() called at most once per instance
 *   · FB-3   No DOM Input Read + No Foreign Tree Query
 *   · FB-ARCH-3 Source-Agnostic API
 *   ·  ├ 3.1 Ingress/Egress separation  (general principle + Phase 2/4
 *   ·  │     concretization · press + focus both real)
 *   ·  ├ 3.2 Dispatch order: internal activeInstances → subscribers
 *   ·  └ 3.3 Non-equivalence between {press,focus}Handlers (ingress) and
 *   ·        subscribe{Press,Focus} (egress)
 */

import type * as React from 'react';

import type { PressEvent } from '../interaction-events';

// ─────────────────────────────────────────────────────────────────────
// Source enumeration (FB-ARCH-3)
// ─────────────────────────────────────────────────────────────────────

export type InteractionEventSource = 'press' | 'hover' | 'focus' | 'programmatic';

// ─────────────────────────────────────────────────────────────────────
// InteractionEvent · discriminated union (OQ-FB-3 decision)
// ─────────────────────────────────────────────────────────────────────

/**
 * Hover variant placeholder · Phase 6+ wire-up. Kept as a structural empty
 * type so the discriminated union compiles today.
 *
 * Name is `HoverSourceEvent` (not bare `HoverEvent`) to avoid shadowing DOM
 * globals at consumer import sites.
 */
export type HoverSourceEvent = Record<string, never>;

/**
 * Focus variant · v0.5 Phase 4.1 lifted from placeholder to real shape.
 *
 * The Controller normalizes the inbound `React.FocusEvent<HTMLElement>` into
 * a `FocusSourceEvent` before handing it to factories (§4.2 mapping table).
 * Factories MUST treat all three fields as authoritative · they MUST NOT
 * walk back into `nativeEvent.target.matches(':focus-visible')` themselves
 * (FB-3 · No DOM Input Read · the `focusVisible` boolean is the contract).
 */
export interface FocusSourceEvent {
  /**
   * The element receiving focus (`event.currentTarget` from the React
   * synthetic event). Factories own DOM ops on this node only —
   * `target.classList.add('prismui-{factoryName}-active')` etc. (§8.1
   * receivers whitelist + OQ-FB-P4-2 prefix constraint).
   */
  target: HTMLElement;
  /**
   * Whether the focus should produce a visible ring under current focus
   * conditions. Derived once by the Controller using `:focus-visible`
   * matching at handoff time (Z-5: factory-layer judgment moved to
   * Controller-layer derivation to avoid every factory re-walking the DOM).
   *
   * Factories that want focus-visible-only feedback (e.g. glowFeedback)
   * MUST early-return a no-op instance when this is `false`. Factories
   * targeting always-on focus visuals (rare) MAY ignore the flag.
   */
  focusVisible: boolean;
  /** Underlying browser FocusEvent · used for advanced consumers / DevTools. */
  nativeEvent: globalThis.FocusEvent;
}

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
  /** 【Phase 6+ placeholder · adapter shape will be the React.PointerEvent or useHover analogue】 */
  onHoverStart?: (event: React.PointerEvent<HTMLElement>) => void;
  /** 【Phase 6+ placeholder】 */
  onHoverEnd?: (event: React.PointerEvent<HTMLElement>) => void;
}

/**
 * Focus ingress / egress handlers · v0.5 Phase 4.1 P0-1 类型闭环修正.
 *
 *   Contract v0.2 drafting initially typed these as
 *   `(e: InteractionEvent & { source: 'focus' }) => void`. That signature
 *   was incompatible with the only legitimate adapter · React DOM
 *   `onFocus={...}` / `onBlur={...}` · whose synthetic event is
 *   `React.FocusEvent<HTMLElement>`. To be spreadable directly onto the
 *   host element (zero-cost interop · no manual `wrap()` step in the
 *   component layer) handlers MUST receive the native React event.
 *
 *   Controller-internal normalization to the discriminated `FocusSourceEvent`
 *   happens at the **start edge**: `factory.create({ event: ... })` and
 *   `instance.start(event)`. `finish()` / `cancel()` / `dispose()` are
 *   parameterless (§3.1) — life-cycle terminators carry no event context.
 *
 *   Egress observers (`subscribeFocus`) see the same React event the
 *   ingress did · no re-shape happens at the egress border (FB-ARCH-3.2).
 */
export interface FocusHandlers {
  onFocus?: (event: React.FocusEvent<HTMLElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLElement>) => void;
}

// ─────────────────────────────────────────────────────────────────────
// FeedbackInstance · managed ephemeral instance (FB-2)
// ─────────────────────────────────────────────────────────────────────

export interface FeedbackInstance {
  /** Unique id (concurrency tracking + test snapshots). */
  id: string;

  /**
   * Bound pointerId (FB-2 concurrency prerequisite · aligns with L2 C-1
   * independent FSM-per-pointerId).
   *
   *   · Press source : `number` — outer key of `activeInstances:
   *     Map<pointerId, FeedbackInstance[]>` (§6.1).
   *   · Focus source (v0.5 Phase 4.1 · Z-2): `null` — focus is a
   *     singleton (one focused element per document); the Controller
   *     stores focus instances in a separate `focusInstances` field
   *     keyed by nothing (§6.4).
   *   · Programmatic source: `null` — pointerId is intrinsically absent.
   *   · Hover source: Phase 6+ adapter spec will decide (likely `number`).
   *
   * Consumers reading this value MUST handle `null` (§6.5: external
   * pointerId references are forbidden anyway · this readonly view exists
   * for DevTools / log / test snapshot only).
   */
  readonly pointerId: number | null;

  /** Bound source (FB-ARCH-3 · v0.5 supports `'press'` + `'focus'` · `'hover'` / `'programmatic'` Phase 6+). */
  readonly source: InteractionEventSource;

  /**
   * Source-start callback · instance enters active state · begins animation
   * / playback / analytics.
   *
   *   - press source: invoked from `onPressStart` (Controller · L2 usePress)
   *   - focus source: invoked from `onFocus` (Controller · React FocusEvent
   *     adapter · §6.1)
   *
   * Contract (FB-2.3): Controller MUST call at most once per instance.
   * Instance MAY defensively ignore duplicate `start()` calls.
   *
   * The argument is the Controller-normalized `InteractionEvent` (the only
   * place the discriminated union appears on the factory boundary · §4.2
   * P0-1 mapping table).
   */
  start(event: InteractionEvent): void;

  /**
   * Success-path terminator · wait for animation to complete, then dispose.
   *
   *   - press source: invoked from `onPressEnd`
   *   - focus source: invoked from `onBlur`
   *
   * Parameterless · life-cycle terminators carry no event context (v0.5
   * Round 2 P1-1 · interface stays consistent with v0.2 Phase 2 Delivered).
   */
  finish(): void;

  /**
   * Failure-path terminator · destroy immediately · animation interrupted.
   *
   *   - press source: invoked from `onPressCancel` (e.g. interactive
   *     disabled flip mid-press)
   *   - focus source: invoked when the host explicitly aborts the focus
   *     visual (e.g. disabled-flip while focused, programmatic dispose)
   *
   * Parameterless (v0.5 Round 2 P1-1).
   */
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
  /**
   * Focus egress observers (v0.5 Phase 4.1 real · upgraded from placeholder).
   * Observers receive the same `React.FocusEvent<HTMLElement>` the ingress
   * did (FB-ARCH-3.2 dispatch order: internal focusInstances → subscribers).
   */
  subscribeFocus(handlers: FocusHandlers): Unsubscribe;

  /**
   * Programmatic trigger (analytics / form error / tests · no DOM source adapter).
   *
   * For `source: 'press' | 'focus'` events prefer wiring through their
   * respective ingress adapters (`pressHandlers` / `focusHandlers`);
   * `trigger` is meant for emission paths without an ingress adapter
   * (FB-ARCH-3.1 Phase 2 concretization).
   */
  trigger(event: InteractionEvent): void;

  /**
   * Press ingress adapter (FB-ARCH-3.1 · press source input channel).
   *
   * Stable reference across renders (OQ-FB-4 useRef + updateFactories).
   * Caller MUST spread onto `usePress({...})` options — otherwise the
   * Controller receives no press events and the default ripple handlers
   * never fire.
   */
  readonly pressHandlers: Required<PressHandlers>;

  /**
   * Focus ingress adapter (v0.5 Phase 4.1 real · FB-ARCH-3.1 · focus source
   * input channel).
   *
   * Stable reference across renders. Caller MUST spread onto the host
   * element's `onFocus` / `onBlur` React props (or chain via `chainHandlers`
   * with any user-supplied focus handlers — otherwise the focus glow
   * factories never fire).
   *
   * The Controller normalizes each inbound `React.FocusEvent<HTMLElement>`
   * into a `FocusSourceEvent` before handing it to factories (§4.2 mapping
   * table · `:focus-visible` derivation also happens here).
   */
  readonly focusHandlers: Required<FocusHandlers>;

  /**
   * Swap the active factory list (OQ-FB-12 policy):
   *   · only affects future source activations (`onPressStart` / `onFocus`)
   *   · already-active instances keep running under their original factory
   *   · removed factories' instances finish naturally (no retroactive cancel)
   *   · new factories come into effect on the next source activation
   *
   * The Controller itself retains a stable reference — this method mutates
   * internal state only.
   */
  updateFactories(factories: FeedbackFactory[]): void;
}
