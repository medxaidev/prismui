// ---------------------------------------------------------------------------
// ReplaySystem — Deterministic event replay with state hash verification
// Zero React, zero DOM, zero browser API imports.
// ---------------------------------------------------------------------------

import type { RuntimeEvent } from '../event-bus';
import type { RuntimeState } from '../store';
import type { InteractionRuntime } from '../runtime';
import type { AuditTrail } from './audit-trail';
import { computeStateHash } from './state-hash';

/**
 * Options for controlling replay behavior.
 */
export interface ReplayOptions {
  /** Playback speed: 0 = instant (synchronous), >0 = ms interval between events. Default: 0. */
  speed?: number;
  /** Callback fired for each replayed event. */
  onEvent?: (event: RuntimeEvent, index: number) => void;
  /** Callback fired when replay completes. */
  onComplete?: (result: ReplayResult) => void;
  /** If true, disables side effects (e.g., Audit recording) during replay. Default: true. */
  disableSideEffects?: boolean;
}

/**
 * Result of a replay operation.
 */
export interface ReplayResult {
  /** Whether replay completed successfully with matching state. */
  success: boolean;
  /** Number of events replayed. */
  eventsReplayed: number;
  /** Final state after replay. */
  finalState: RuntimeState;
  /** Expected state hash (from original execution). */
  expectedStateHash?: string;
  /** Actual state hash (from replay). */
  actualStateHash?: string;
  /** Index of first event where state diverged (-1 if no mismatch). */
  mismatchIndex?: number;
}

/**
 * Replay system for deterministic event replay.
 */
export interface ReplaySystem {
  /** Replay a sequence of events. */
  replay(events: RuntimeEvent[], options?: ReplayOptions): void;
  /** Replay events extracted from an AuditTrail. */
  replayFromAudit(audit: AuditTrail, options?: ReplayOptions): void;
  /** Pause an ongoing timed replay. */
  pause(): void;
  /** Resume a paused timed replay. */
  resume(): void;
  /** Stop and cancel an ongoing replay. */
  stop(): void;
  /** Whether a replay is currently in progress. */
  isReplaying(): boolean;
}

/**
 * Create a ReplaySystem for a given InteractionRuntime.
 *
 * - Replay dispatches events through the runtime pipeline.
 * - State hash computed at each step for verification against expected hashes.
 * - Speed 0 = synchronous (instant), >0 = timer-based intervals.
 *
 * Note on state reset: RuntimeStore.setState() auto-increments version,
 * so we cannot reset version to 0 via setState(). Instead, replay dispatches
 * events directly on the runtime. For deterministic replay from a known initial
 * state, create a fresh runtime instance.
 */
export function createReplaySystem(runtime: InteractionRuntime): ReplaySystem {
  let replaying = false;
  let paused = false;
  let stopped = false;
  let timerId: ReturnType<typeof setTimeout> | null = null;

  function replayInstant(
    events: RuntimeEvent[],
    options: ReplayOptions,
    expectedHashes?: string[],
  ): ReplayResult {
    replaying = true;
    stopped = false;

    let mismatchIndex = -1;
    let eventsReplayed = 0;

    for (let i = 0; i < events.length; i++) {
      if (stopped) break;

      runtime.dispatch(events[i]);
      eventsReplayed++;

      if (options.onEvent) {
        options.onEvent(events[i], i);
      }

      // Verify hash if expected hashes provided
      if (expectedHashes && expectedHashes[i]) {
        const currentHash = computeStateHash(runtime.getState());
        if (currentHash !== expectedHashes[i] && mismatchIndex === -1) {
          mismatchIndex = i;
        }
      }
    }

    const finalState = runtime.getState();
    const actualHash = computeStateHash(finalState);
    const expectedHash = expectedHashes?.[events.length - 1];

    const result: ReplayResult = {
      success: mismatchIndex === -1 && (!expectedHash || actualHash === expectedHash),
      eventsReplayed,
      finalState,
      actualStateHash: actualHash,
      ...(expectedHash ? { expectedStateHash: expectedHash } : {}),
      ...(mismatchIndex !== -1 ? { mismatchIndex } : {}),
    };

    replaying = false;

    if (options.onComplete) {
      options.onComplete(result);
    }

    return result;
  }

  function replayTimed(
    events: RuntimeEvent[],
    options: ReplayOptions,
    expectedHashes?: string[],
  ): void {
    replaying = true;
    stopped = false;
    paused = false;

    let index = 0;
    let mismatchIndex = -1;
    const speed = options.speed!;

    function step(): void {
      if (stopped || index >= events.length) {
        const finalState = runtime.getState();
        const actualHash = computeStateHash(finalState);
        const expectedHash = expectedHashes?.[events.length - 1];

        const result: ReplayResult = {
          success: !stopped && mismatchIndex === -1 && (!expectedHash || actualHash === expectedHash),
          eventsReplayed: index,
          finalState,
          actualStateHash: actualHash,
          ...(expectedHash ? { expectedStateHash: expectedHash } : {}),
          ...(mismatchIndex !== -1 ? { mismatchIndex } : {}),
        };

        replaying = false;
        timerId = null;

        if (options.onComplete) {
          options.onComplete(result);
        }
        return;
      }

      if (paused) {
        // Check again later
        timerId = setTimeout(step, 50);
        return;
      }

      runtime.dispatch(events[index]);

      if (options.onEvent) {
        options.onEvent(events[index], index);
      }

      if (expectedHashes && expectedHashes[index]) {
        const currentHash = computeStateHash(runtime.getState());
        if (currentHash !== expectedHashes[index] && mismatchIndex === -1) {
          mismatchIndex = index;
        }
      }

      index++;
      timerId = setTimeout(step, speed);
    }

    step();
  }

  const system: ReplaySystem = {
    replay(events, options = {}) {
      const speed = options.speed ?? 0;

      if (speed === 0) {
        replayInstant(events, options);
      } else {
        replayTimed(events, options);
      }
    },

    replayFromAudit(audit, options = {}) {
      const entries = audit.getEntries();
      const events = entries.map((e) => e.event);
      // Extract expected state hashes from audit entries for verification
      const expectedHashes = entries.map((e) =>
        e.nextState ? computeStateHash(e.nextState) : '',
      );

      const speed = options.speed ?? 0;
      if (speed === 0) {
        replayInstant(events, options, expectedHashes);
      } else {
        replayTimed(events, options, expectedHashes);
      }
    },

    pause() {
      if (replaying) {
        paused = true;
      }
    },

    resume() {
      if (replaying && paused) {
        paused = false;
      }
    },

    stop() {
      stopped = true;
      if (timerId !== null) {
        clearTimeout(timerId);
        timerId = null;
      }
      replaying = false;
    },

    isReplaying() {
      return replaying;
    },
  };

  return system;
}
