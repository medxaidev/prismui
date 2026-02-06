import type { PrismuiColorSchemeManager } from './types';
import { isPrismuiColorScheme } from './is-prismui-color-scheme';

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

export interface LocalStorageColorSchemeManagerOptions {
  /**
   * localStorage key used to store the color scheme value.
   * @default 'prismui-color-scheme'
   */
  key?: string;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Creates a `PrismuiColorSchemeManager` backed by `window.localStorage`.
 *
 * Cross-tab synchronization is handled via the `storage` event.
 *
 * @example
 * ```ts
 * const manager = localStorageColorSchemeManager({ key: 'my-app-scheme' });
 * ```
 */
export function localStorageColorSchemeManager(
  options: LocalStorageColorSchemeManagerOptions = {},
): PrismuiColorSchemeManager {
  const key = options.key ?? 'prismui-color-scheme';

  return {
    get(defaultValue) {
      if (typeof window === 'undefined') {
        return defaultValue;
      }

      try {
        const stored = window.localStorage.getItem(key);
        return isPrismuiColorScheme(stored) ? stored : defaultValue;
      } catch {
        return defaultValue;
      }
    },

    set(value) {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        // localStorage may be unavailable (e.g. private browsing quota exceeded)
      }
    },

    subscribe(onUpdate) {
      if (typeof window === 'undefined') {
        return () => {};
      }

      const handler = (event: StorageEvent) => {
        if (event.storageArea === window.localStorage && event.key === key) {
          if (isPrismuiColorScheme(event.newValue)) {
            onUpdate(event.newValue);
          }
        }
      };

      window.addEventListener('storage', handler);
      return () => window.removeEventListener('storage', handler);
    },
  };
}
