import type { PrismuiColorScheme } from '../../theme';

// ---------------------------------------------------------------------------
// ColorSchemeManager interface
// ---------------------------------------------------------------------------

/**
 * Strategy interface for persisting and synchronizing the user's color scheme
 * preference across sessions and browser tabs.
 *
 * Implementations must provide:
 * - `get` — read the persisted value (or return the default)
 * - `set` — persist a new value
 * - `subscribe` — listen for external changes (e.g. another tab), return an
 *   unsubscribe function
 */
export interface PrismuiColorSchemeManager {
  /** Read the persisted color scheme, falling back to `defaultValue`. */
  get: (defaultValue: PrismuiColorScheme) => PrismuiColorScheme;
  /** Persist the given color scheme. */
  set: (value: PrismuiColorScheme) => void;
  /**
   * Subscribe to external changes (e.g. `storage` events from other tabs).
   * Returns an unsubscribe function.
   */
  subscribe: (onUpdate: (value: PrismuiColorScheme) => void) => () => void;
}
