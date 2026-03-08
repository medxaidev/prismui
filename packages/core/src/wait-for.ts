// ---------------------------------------------------------------------------
// waitFor — event-driven coordination between modules
// Zero React, zero DOM, zero browser API imports.
// ---------------------------------------------------------------------------

import type { RuntimeEvent, EventBus } from './event-bus';

/** Options for waitFor. */
export interface WaitForOptions {
  /** Timeout in milliseconds. Rejects with WaitForTimeoutError if exceeded. */
  timeout?: number;
  /** Optional predicate for fine-grained event matching. */
  predicate?: (event: RuntimeEvent) => boolean;
}

/** Error thrown when waitFor times out. */
export class WaitForTimeoutError extends Error {
  constructor(eventType: string, timeoutMs: number) {
    super(`waitFor('${eventType}') timed out after ${timeoutMs}ms`);
    this.name = 'WaitForTimeoutError';
  }
}

/**
 * Wait for a specific event type on the bus.
 * Returns a promise that resolves with the first matching event.
 *
 * - Optional `predicate` for fine-grained matching within the event type.
 * - Optional `timeout` (ms) rejects with `WaitForTimeoutError`.
 * - Cleans up subscription after resolve or reject.
 * - Resolves only once (first match).
 */
export function waitFor(
  bus: EventBus,
  eventType: string,
  options?: WaitForOptions,
): Promise<RuntimeEvent> {
  return new Promise<RuntimeEvent>((resolve, reject) => {
    let unsub: (() => void) | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;

    function cleanup(): void {
      if (unsub) {
        unsub();
        unsub = null;
      }
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
    }

    unsub = bus.subscribe(eventType, (event: RuntimeEvent) => {
      if (options?.predicate && !options.predicate(event)) {
        return; // Skip non-matching events
      }
      cleanup();
      resolve(event);
    });

    if (options?.timeout !== undefined && options.timeout > 0) {
      timer = setTimeout(() => {
        cleanup();
        reject(new WaitForTimeoutError(eventType, options.timeout!));
      }, options.timeout);
    }
  });
}
