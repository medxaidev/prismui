import { describe, expect, it, beforeEach, vi } from 'vitest';
import { hashString, insertCssOnce } from './insert-css';
import { createStyleRegistry } from './style-registry';

// ---------------------------------------------------------------------------
// hashString
// ---------------------------------------------------------------------------

describe('hashString', () => {
  it('returns a string', () => {
    expect(typeof hashString('hello')).toBe('string');
  });

  it('is deterministic', () => {
    expect(hashString('abc')).toBe(hashString('abc'));
  });

  it('produces different hashes for different inputs', () => {
    expect(hashString('abc')).not.toBe(hashString('xyz'));
  });

  it('handles empty string', () => {
    const h = hashString('');
    expect(typeof h).toBe('string');
    expect(h.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// insertCssOnce — browser (jsdom) path
// ---------------------------------------------------------------------------

describe('insertCssOnce (browser)', () => {
  beforeEach(() => {
    // Clean up all injected <style> elements between tests
    document.head.querySelectorAll('style').forEach((el) => el.remove());

    // Reset the module-level `inserted` Map by re-importing.
    // Since vitest caches modules, we clear the dedup state by inserting
    // a unique id that won't collide with test ids.
    // A cleaner approach: we just accept that dedup state persists and
    // use unique ids per test.
  });

  it('creates <style data-prismui-style-engine> element', () => {
    insertCssOnce('test-engine-create', '.x { color: red; }');
    const el = document.head.querySelector('style[data-prismui-style-engine]');
    expect(el).not.toBeNull();
  });

  it('injects CSS rule into the style-engine element', () => {
    insertCssOnce('test-inject-rule', '.test-inject { color: blue; }');
    const el = document.head.querySelector(
      'style[data-prismui-style-engine]',
    ) as HTMLStyleElement;
    expect(el).not.toBeNull();

    // Check via CSSOM or textContent
    const hasRule =
      (el.sheet && el.sheet.cssRules.length > 0) ||
      el.textContent?.includes('.test-inject');
    expect(hasRule).toBe(true);
  });

  it('deduplicates identical CSS for the same id', () => {
    const css = '.dedup-test { margin: 0; }';
    insertCssOnce('test-dedup', css);
    insertCssOnce('test-dedup', css);

    const el = document.head.querySelector(
      'style[data-prismui-style-engine]',
    ) as HTMLStyleElement;

    // Count occurrences — should appear only once
    if (el.sheet && el.sheet.cssRules.length > 0) {
      const matches = Array.from(el.sheet.cssRules).filter((r) =>
        r.cssText.includes('dedup-test'),
      );
      expect(matches.length).toBe(1);
    } else {
      const count = (el.textContent?.match(/dedup-test/g) || []).length;
      expect(count).toBe(1);
    }
  });

  it('allows different ids with different CSS', () => {
    insertCssOnce('test-multi-a', '.multi-a { color: red; }');
    insertCssOnce('test-multi-b', '.multi-b { color: blue; }');

    const el = document.head.querySelector(
      'style[data-prismui-style-engine]',
    ) as HTMLStyleElement;

    const ruleCount = el.sheet?.cssRules.length ?? 0;
    const textHasBoth =
      el.textContent?.includes('multi-a') &&
      el.textContent?.includes('multi-b');

    expect(ruleCount >= 2 || textHasBoth).toBe(true);
  });

  // ---- Theme vars dedicated <style> ----

  it('creates a separate <style data-prismui-theme-vars> for theme variables', () => {
    insertCssOnce('prismui-theme-vars', ':root { --prismui-test: red; }');

    const themeEl = document.head.querySelector(
      'style[data-prismui-theme-vars]',
    );
    const engineEl = document.head.querySelector(
      'style[data-prismui-style-engine]',
    );

    expect(themeEl).not.toBeNull();
    expect(themeEl?.textContent).toContain('--prismui-test');

    // Theme vars should NOT be in the engine element (if it exists)
    if (engineEl) {
      expect(engineEl.textContent).not.toContain('--prismui-test');
    }
  });

  it('replaces theme vars on subsequent calls (not appends)', () => {
    insertCssOnce('prismui-theme-vars', ':root { --prismui-a: 1; }');
    insertCssOnce('prismui-theme-vars', ':root { --prismui-b: 2; }');

    const el = document.head.querySelector(
      'style[data-prismui-theme-vars]',
    ) as HTMLStyleElement;

    expect(el.textContent).toContain('--prismui-b');
    expect(el.textContent).not.toContain('--prismui-a');
  });
});

// ---------------------------------------------------------------------------
// insertCssOnce — SSR path (registry)
// ---------------------------------------------------------------------------

describe('insertCssOnce (SSR via registry)', () => {
  it('delegates to registry when DOM is unavailable', () => {
    // Temporarily hide document to simulate SSR
    const originalDocument = globalThis.document;
    // @ts-expect-error — intentionally removing document for SSR simulation
    delete globalThis.document;

    try {
      const registry = createStyleRegistry();
      insertCssOnce('ssr-test', '.ssr { color: green; }', registry);

      expect(registry.has('ssr-test')).toBe(true);
      expect(registry.toString()).toContain('.ssr { color: green; }');
    } finally {
      globalThis.document = originalDocument;
    }
  });

  it('does nothing on server when no registry is provided', () => {
    const originalDocument = globalThis.document;
    // @ts-expect-error — intentionally removing document for SSR simulation
    delete globalThis.document;

    try {
      // Should not throw
      expect(() => {
        insertCssOnce('ssr-no-reg', '.noop {}');
      }).not.toThrow();
    } finally {
      globalThis.document = originalDocument;
    }
  });
});
