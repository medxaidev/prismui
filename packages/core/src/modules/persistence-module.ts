// ---------------------------------------------------------------------------
// Persistence Module — Built-in Interaction Module (Layer 0.5)
// Persists selected runtime state keys to storage (localStorage by default).
// Zero React, zero DOM in module logic — browser API isolated in adapter.
// ---------------------------------------------------------------------------

import type { RuntimeModule } from '../module';
import type { EventBus } from '../event-bus';
import type { RuntimeState, RuntimeStore } from '../store';

// ── Types ─────────────────────────────────────────────────────────────

/** Pluggable storage adapter interface. */
export interface PersistenceAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** Options for createPersistenceModule. */
export interface PersistenceModuleOptions {
  /** Storage key prefix (default: 'prismui-state') */
  key?: string;
  /** State keys to persist — whitelist. If empty, persists nothing. */
  include?: string[];
  /** Debounce interval in ms (default: 300) */
  debounceMs?: number;
  /** Storage adapter (default: localStorage wrapper) */
  adapter?: PersistenceAdapter;
}

/** Controller API exposed on runtime.modules.persistence */
export interface PersistenceController {
  /** Force save current state immediately. */
  save(): void;
  /** Restore persisted state into runtime (dispatches event). */
  restore(): void;
  /** Clear all persisted state. */
  clear(): void;
  /** Check if there is persisted state available. */
  hasSavedState(): boolean;
  /** Get the raw persisted data (parsed JSON). */
  getSavedState(): Record<string, unknown> | null;
}

// ── Event Constants ───────────────────────────────────────────────────

export const PERSISTENCE_SAVE = 'PERSISTENCE_SAVE';
export const PERSISTENCE_RESTORE = 'PERSISTENCE_RESTORE';
export const PERSISTENCE_CLEAR = 'PERSISTENCE_CLEAR';

// ── LocalStorage Adapter ──────────────────────────────────────────────

/** Creates a localStorage-based persistence adapter. SSR-safe. */
export function createLocalStorageAdapter(): PersistenceAdapter {
  const g = typeof globalThis !== 'undefined' ? globalThis : undefined;
  const storage = (g as Record<string, unknown> | undefined)?.localStorage as
    | { getItem(k: string): string | null; setItem(k: string, v: string): void; removeItem(k: string): void }
    | undefined;

  return {
    getItem(key: string): string | null {
      if (!storage) return null;
      try {
        return storage.getItem(key);
      } catch {
        return null;
      }
    },
    setItem(key: string, value: string): void {
      if (!storage) return;
      try {
        storage.setItem(key, value);
      } catch {
        // Storage full or blocked — silently fail
      }
    },
    removeItem(key: string): void {
      if (!storage) return;
      try {
        storage.removeItem(key);
      } catch {
        // Silently fail
      }
    },
  };
}

// ── Persistence Module Factory ────────────────────────────────────────

/**
 * Create the Persistence Module.
 *
 * Subscribes to store changes and persists selected state keys.
 * On init, restores persisted state if available.
 */
export function createPersistenceModule(
  options?: PersistenceModuleOptions,
): RuntimeModule<PersistenceController> {
  const storageKey = options?.key ?? 'prismui-state';
  const include = options?.include ?? [];
  const debounceMs = options?.debounceMs ?? 300;
  const adapter = options?.adapter ?? createLocalStorageAdapter();

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let storeUnsubscribe: (() => void) | null = null;

  function pickState(state: Readonly<RuntimeState>): Record<string, unknown> {
    if (include.length === 0) return {};
    const picked: Record<string, unknown> = {};
    for (const key of include) {
      if (key in state) {
        picked[key] = state[key];
      }
    }
    return picked;
  }

  function saveToStorage(state: Readonly<RuntimeState>): void {
    const data = pickState(state);
    if (Object.keys(data).length === 0) return;
    try {
      adapter.setItem(storageKey, JSON.stringify(data));
    } catch {
      // Serialization error — skip
    }
  }

  function loadFromStorage(): Record<string, unknown> | null {
    const raw = adapter.getItem(storageKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  return {
    name: 'persistence',

    initialState: {},

    reducers: {
      [PERSISTENCE_RESTORE]: (event, prevState) => {
        const { data } = event.payload as { data: Record<string, unknown> };
        // Merge persisted data into state (only whitelisted keys)
        const merged = { ...prevState };
        for (const key of include) {
          if (key in data) {
            merged[key] = data[key];
          }
        }
        return { nextState: merged };
      },

      [PERSISTENCE_CLEAR]: (_event, prevState) => {
        return { nextState: prevState };
      },
    },

    onInit: ({ bus, store }) => {
      // Auto-restore on init
      const saved = loadFromStorage();
      if (saved) {
        bus.dispatch({
          type: PERSISTENCE_RESTORE,
          payload: { data: saved },
        });
      }

      // Subscribe to state changes for auto-save
      storeUnsubscribe = store.subscribe(() => {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          saveToStorage(store.getState());
        }, debounceMs);
      });
    },

    onDestroy: () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      if (storeUnsubscribe) storeUnsubscribe();
    },

    createController: ({ bus, store }: { bus: EventBus; store: RuntimeStore }) => ({
      save(): void {
        if (debounceTimer) clearTimeout(debounceTimer);
        saveToStorage(store.getState());
        bus.dispatch({ type: PERSISTENCE_SAVE });
      },

      restore(): void {
        const data = loadFromStorage();
        if (data) {
          bus.dispatch({
            type: PERSISTENCE_RESTORE,
            payload: { data },
          });
        }
      },

      clear(): void {
        adapter.removeItem(storageKey);
        bus.dispatch({ type: PERSISTENCE_CLEAR });
      },

      hasSavedState(): boolean {
        return adapter.getItem(storageKey) !== null;
      },

      getSavedState(): Record<string, unknown> | null {
        return loadFromStorage();
      },
    }),
  };
}
