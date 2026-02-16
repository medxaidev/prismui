import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDidUpdate } from './use-did-update';

describe('useDidUpdate', () => {
  it('does not call fn on initial render', () => {
    const fn = vi.fn();
    renderHook(() => useDidUpdate(fn, []));
    expect(fn).not.toHaveBeenCalled();
  });

  it('calls fn on subsequent renders', () => {
    const fn = vi.fn();
    const { rerender } = renderHook(
      ({ dep }) => useDidUpdate(fn, [dep]),
      { initialProps: { dep: 0 } },
    );
    expect(fn).not.toHaveBeenCalled();

    rerender({ dep: 1 });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('calls fn on every dependency change', () => {
    const fn = vi.fn();
    const { rerender } = renderHook(
      ({ dep }) => useDidUpdate(fn, [dep]),
      { initialProps: { dep: 0 } },
    );

    rerender({ dep: 1 });
    rerender({ dep: 2 });
    rerender({ dep: 3 });
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('calls cleanup on dependency change', () => {
    const cleanup = vi.fn();
    const fn = vi.fn(() => cleanup);
    const { rerender } = renderHook(
      ({ dep }) => useDidUpdate(fn, [dep]),
      { initialProps: { dep: 0 } },
    );

    rerender({ dep: 1 });
    expect(fn).toHaveBeenCalledTimes(1);
    expect(cleanup).not.toHaveBeenCalled();

    rerender({ dep: 2 });
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('does not call fn when dependencies do not change', () => {
    const fn = vi.fn();
    const { rerender } = renderHook(
      ({ dep }) => useDidUpdate(fn, [dep]),
      { initialProps: { dep: 0 } },
    );

    rerender({ dep: 0 });
    expect(fn).not.toHaveBeenCalled();
  });
});
