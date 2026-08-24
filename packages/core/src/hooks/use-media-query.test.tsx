/**
 * Stage-16 · Phase 3 · useMediaQuery test suite.
 *
 * Uses a controllable matchMedia mock (min-width aware) with strict
 * afterEach restoration so no listener/global leaks across files
 * (deliberately avoiding the D-1 cross-file contamination class).
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, act, cleanup } from '@testing-library/react';
import { useMediaQuery } from './use-media-query';

const originalMatchMedia = window.matchMedia;

/** Install a min-width-aware matchMedia mock; returns a width setter. */
function installMatchMedia(initialWidth: number) {
  let width = initialWidth;
  const registry = new Map<string, Set<(e: unknown) => void>>();
  const parseMin = (q: string): number => {
    const m = /min-width:\s*(\d+)px/.exec(q);
    return m ? Number(m[1]) : 0;
  };
  window.matchMedia = vi.fn((q: string) => {
    const min = parseMin(q);
    return {
      media: q,
      get matches() {
        return width >= min;
      },
      addEventListener: (_: string, cb: (e: unknown) => void) => {
        if (!registry.has(q)) registry.set(q, new Set());
        registry.get(q)!.add(cb);
      },
      removeEventListener: (_: string, cb: (e: unknown) => void) => {
        registry.get(q)?.delete(cb);
      },
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
      onchange: null,
    } as unknown as MediaQueryList;
  });
  return {
    setWidth(w: number) {
      width = w;
      for (const set of registry.values()) for (const cb of set) cb({});
    },
    registry,
  };
}

function Probe({ query }: { query: string }) {
  const matches = useMediaQuery(query);
  return <span data-testid="v">{String(matches)}</span>;
}

afterEach(() => {
  cleanup();
  window.matchMedia = originalMatchMedia;
});

describe('useMediaQuery', () => {
  it('returns true when the query matches the current viewport', () => {
    installMatchMedia(1300);
    const { getByTestId } = render(<Probe query="(min-width: 1200px)" />);
    expect(getByTestId('v').textContent).toBe('true');
  });

  it('returns false when the query does not match', () => {
    installMatchMedia(800);
    const { getByTestId } = render(<Probe query="(min-width: 1200px)" />);
    expect(getByTestId('v').textContent).toBe('false');
  });

  it('updates reactively when the viewport crosses the query threshold', () => {
    const mm = installMatchMedia(800);
    const { getByTestId } = render(<Probe query="(min-width: 1200px)" />);
    expect(getByTestId('v').textContent).toBe('false');
    act(() => mm.setWidth(1300));
    expect(getByTestId('v').textContent).toBe('true');
    act(() => mm.setWidth(600));
    expect(getByTestId('v').textContent).toBe('false');
  });

  it('removes its change listener on unmount (no leak)', () => {
    const mm = installMatchMedia(800);
    const { unmount } = render(<Probe query="(min-width: 1200px)" />);
    const total = () => [...mm.registry.values()].reduce((n, s) => n + s.size, 0);
    expect(total()).toBeGreaterThan(0);
    unmount();
    expect(total()).toBe(0);
  });

  it('returns undefined when matchMedia is unavailable (SSR / non-browser)', () => {
    // Simulate an environment without matchMedia.
    // @ts-expect-error — deliberately deleting for the test.
    window.matchMedia = undefined;
    const { getByTestId } = render(<Probe query="(min-width: 1200px)" />);
    expect(getByTestId('v').textContent).toBe('undefined');
  });
});
