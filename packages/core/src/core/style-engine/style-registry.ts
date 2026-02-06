/**
 * SSR style collection registry.
 *
 * On the server there is no DOM, so CSS rules generated during render
 * are collected into this registry instead. After the render pass the
 * consumer calls `flush()` to retrieve the accumulated CSS and inject
 * it into the HTML response (e.g. via `useServerInsertedHTML` in Next.js).
 */
export interface PrismuiStyleRegistry {
  /** Collect a CSS snippet. Duplicate `id`s are silently ignored. */
  insert: (id: string, cssText: string) => void;
  /** Returns `true` when `id` has already been inserted. */
  has: (id: string) => boolean;
  /** Returns concatenated CSS for all inserted snippets (insertion order). */
  toString: () => string;
  /** Returns current CSS **and clears** the registry for the next flush cycle. */
  flush: () => string;
}

export function createStyleRegistry(): PrismuiStyleRegistry {
  const ids = new Set<string>();
  const chunks: string[] = [];

  function getCssText(): string {
    return chunks.map((c) => (c.endsWith('\n') ? c : c + '\n')).join('');
  }

  return {
    insert(id, cssText) {
      if (ids.has(id)) return;
      ids.add(id);
      chunks.push(cssText);
    },

    has(id) {
      return ids.has(id);
    },

    toString() {
      return getCssText();
    },

    flush() {
      const css = getCssText();
      ids.clear();
      chunks.length = 0;
      return css;
    },
  };
}
