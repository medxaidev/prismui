// ---------------------------------------------------------------------------
// RuntimeStore — immutable state container with versioned snapshots
// Zero React, zero DOM, zero browser API imports.
// ---------------------------------------------------------------------------

/**
 * Core runtime state. Minimal by design — only `version` is owned by Core.
 * Module-contributed fields (currentPage, modalStack, etc.) are added via
 * `initialState` in their module definitions.
 */
export interface RuntimeState {
  version: number;
  [key: string]: unknown;
}

/** Listener callback for state changes. */
export type StateListener = (state: RuntimeState) => void;

/**
 * The RuntimeStore is the single source of truth for runtime state.
 *
 * - State is never mutated directly — `setState` uses an updater function.
 * - `version` is auto-incremented on every `setState` call.
 * - Subscribers are called synchronously after each state change.
 * - `getSnapshot()` returns a shallow-frozen copy isolated from future changes.
 */
export interface RuntimeStore {
  /** Get the current state (readonly reference). */
  getState(): Readonly<RuntimeState>;

  /** Update state via an updater function. Auto-increments `version`. */
  setState(updater: (prev: RuntimeState) => RuntimeState): void;

  /** Subscribe to state changes. Returns an unsubscribe function. */
  subscribe(listener: StateListener): () => void;

  /** Get a shallow-frozen snapshot isolated from future changes. */
  getSnapshot(): RuntimeState;
}

/**
 * Create a RuntimeStore instance.
 *
 * @param initial — partial initial state merged with `{ version: 0 }`
 */
export function createRuntimeStore(initial?: Partial<RuntimeState>): RuntimeStore {
  let state: RuntimeState = { version: 0, ...initial };
  let listeners: StateListener[] = [];

  const store: RuntimeStore = {
    getState(): Readonly<RuntimeState> {
      return state;
    },

    setState(updater: (prev: RuntimeState) => RuntimeState): void {
      const prev = state;
      const next = updater(prev);
      // Auto-increment version
      state = { ...next, version: prev.version + 1 };

      // Notify subscribers synchronously
      const snapshot = listeners.slice();
      for (let i = 0; i < snapshot.length; i++) {
        snapshot[i](state);
      }
    },

    subscribe(listener: StateListener): () => void {
      listeners.push(listener);
      return () => {
        listeners = listeners.filter((l) => l !== listener);
      };
    },

    getSnapshot(): RuntimeState {
      return Object.freeze({ ...state });
    },
  };

  return store;
}
