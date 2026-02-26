// ---------------------------------------------------------------------------
// EventBus — core event dispatch & subscription system
// Zero React, zero DOM, zero browser API imports.
// ---------------------------------------------------------------------------

/**
 * A runtime event flowing through the system.
 * `timestamp` is added by EventBus.dispatch(), NOT by the caller.
 */
export interface RuntimeEvent<T = unknown> {
  type: string;
  payload?: T;
  timestamp: number;
  source?: string;
}

/** Listener callback for events. */
export type EventListener = (event: RuntimeEvent) => void;

/** Options for creating an EventBus. */
export interface EventBusOptions {
  /** Maximum number of events kept in history (ring buffer). Default: 100 */
  historySize?: number;
}

/**
 * The EventBus is the backbone of the runtime event system.
 *
 * - `dispatch()` is synchronous — no async, no batching.
 * - `subscribe()` supports global and type-filtered listeners.
 * - History is stored as a ring buffer with configurable size.
 */
export interface EventBus {
  /** Dispatch an event to all matching subscribers. Adds `timestamp` automatically. */
  dispatch<T>(event: Omit<RuntimeEvent<T>, 'timestamp'>): void;

  /** Subscribe to ALL events. Returns an unsubscribe function. */
  subscribe(listener: EventListener): () => void;
  /** Subscribe to events of a specific type. Returns an unsubscribe function. */
  subscribe(type: string, listener: EventListener): () => void;

  /** Get the event history (readonly). Most recent event is last. */
  getHistory(): readonly RuntimeEvent[];

  /** Remove all subscribers and clear history. */
  clear(): void;
}

/**
 * Create an EventBus instance.
 *
 * @param options.historySize — ring buffer capacity (default 100)
 */
export function createEventBus(options?: EventBusOptions): EventBus {
  const historySize = options?.historySize ?? 100;

  // --- Subscriber storage ---
  let globalListeners: EventListener[] = [];
  const typedListeners = new Map<string, EventListener[]>();

  // --- Ring buffer history ---
  const buffer: RuntimeEvent[] = new Array(historySize);
  let head = 0;   // next write position
  let count = 0;  // current number of items in buffer

  // --- Helpers ---

  function pushHistory(event: RuntimeEvent): void {
    buffer[head] = event;
    head = (head + 1) % historySize;
    if (count < historySize) {
      count++;
    }
  }

  function readHistory(): readonly RuntimeEvent[] {
    if (count === 0) return [];
    if (count < historySize) {
      // Buffer not yet full — items are at indices 0..count-1
      return buffer.slice(0, count);
    }
    // Buffer full — head points to oldest, wrap around
    return [...buffer.slice(head), ...buffer.slice(0, head)];
  }

  // --- EventBus implementation ---

  const bus: EventBus = {
    dispatch<T>(event: Omit<RuntimeEvent<T>, 'timestamp'>): void {
      const fullEvent: RuntimeEvent = {
        ...event,
        timestamp: Date.now(),
      } as RuntimeEvent;

      // Record in history
      pushHistory(fullEvent);

      // Notify global listeners
      const globals = globalListeners.slice(); // snapshot to avoid mutation during iteration
      for (let i = 0; i < globals.length; i++) {
        globals[i](fullEvent);
      }

      // Notify type-filtered listeners
      const typed = typedListeners.get(fullEvent.type);
      if (typed) {
        const snapshot = typed.slice();
        for (let i = 0; i < snapshot.length; i++) {
          snapshot[i](fullEvent);
        }
      }
    },

    subscribe(
      typeOrListener: string | EventListener,
      maybeListener?: EventListener,
    ): () => void {
      if (typeof typeOrListener === 'function') {
        // Global subscription
        const listener = typeOrListener;
        globalListeners.push(listener);
        return () => {
          globalListeners = globalListeners.filter((l) => l !== listener);
        };
      }

      // Type-filtered subscription
      const type = typeOrListener;
      const listener = maybeListener!;
      let list = typedListeners.get(type);
      if (!list) {
        list = [];
        typedListeners.set(type, list);
      }
      list.push(listener);

      return () => {
        const current = typedListeners.get(type);
        if (current) {
          const filtered = current.filter((l) => l !== listener);
          if (filtered.length === 0) {
            typedListeners.delete(type);
          } else {
            typedListeners.set(type, filtered);
          }
        }
      };
    },

    getHistory(): readonly RuntimeEvent[] {
      return readHistory();
    },

    clear(): void {
      globalListeners = [];
      typedListeners.clear();
      head = 0;
      count = 0;
      // No need to zero out buffer — head/count control visibility
    },
  };

  return bus;
}
