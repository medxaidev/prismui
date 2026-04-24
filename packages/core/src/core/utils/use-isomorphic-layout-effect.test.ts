/**
 * Stage-10 · Utility · `useIsomorphicLayoutEffect` tests
 *
 * Contract: `@/devdocs/system/feedback-contract.md` v0.2 §9.2
 */

import { useEffect, useLayoutEffect } from 'react';
import { describe, expect, it } from 'vitest';

import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';

describe('useIsomorphicLayoutEffect', () => {
  it('selects useLayoutEffect in a browser-like environment (jsdom)', () => {
    // The vitest environment here is jsdom (see vitest.config), so `window`
    // is defined and the hook must alias `useLayoutEffect`.
    expect(typeof window).not.toBe('undefined');
    expect(useIsomorphicLayoutEffect).toBe(useLayoutEffect);
    expect(useIsomorphicLayoutEffect).not.toBe(useEffect);
  });
});
