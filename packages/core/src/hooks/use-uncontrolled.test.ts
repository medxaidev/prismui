import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUncontrolled } from './use-uncontrolled';

describe('useUncontrolled', () => {
  describe('uncontrolled mode', () => {
    it('uses defaultValue as initial value', () => {
      const { result } = renderHook(() =>
        useUncontrolled({ defaultValue: 'hello' }),
      );
      expect(result.current[0]).toBe('hello');
      expect(result.current[2]).toBe(false); // not controlled
    });

    it('uses finalValue when defaultValue is undefined', () => {
      const { result } = renderHook(() =>
        useUncontrolled({ finalValue: 'fallback' }),
      );
      expect(result.current[0]).toBe('fallback');
    });

    it('updates internal state on setValue', () => {
      const { result } = renderHook(() =>
        useUncontrolled({ defaultValue: 'a' }),
      );
      act(() => result.current[1]('b'));
      expect(result.current[0]).toBe('b');
    });

    it('calls onChange when setValue is called', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useUncontrolled({ defaultValue: 'a', onChange }),
      );
      act(() => result.current[1]('b'));
      expect(onChange).toHaveBeenCalledWith('b');
    });
  });

  describe('controlled mode', () => {
    it('returns the controlled value', () => {
      const { result } = renderHook(() =>
        useUncontrolled({ value: 'controlled' }),
      );
      expect(result.current[0]).toBe('controlled');
      expect(result.current[2]).toBe(true); // is controlled
    });

    it('does not update internal state when controlled', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useUncontrolled({ value: 'controlled', onChange }),
      );
      act(() => result.current[1]('new'));
      // Still returns the controlled value
      expect(result.current[0]).toBe('controlled');
      // But onChange is called
      expect(onChange).toHaveBeenCalledWith('new');
    });

    it('reflects external value changes', () => {
      const { result, rerender } = renderHook(
        ({ value }: { value: string }) => useUncontrolled({ value }),
        { initialProps: { value: 'a' } },
      );
      expect(result.current[0]).toBe('a');
      rerender({ value: 'b' });
      expect(result.current[0]).toBe('b');
    });
  });

  describe('edge cases', () => {
    it('handles null as a valid controlled value', () => {
      const { result } = renderHook(() =>
        useUncontrolled<string | null>({ value: null }),
      );
      // null !== undefined, so it's controlled
      expect(result.current[0]).toBe(null);
      expect(result.current[2]).toBe(true);
    });

    it('handles undefined value as uncontrolled', () => {
      const { result } = renderHook(() =>
        useUncontrolled({ value: undefined, defaultValue: 'default' }),
      );
      expect(result.current[0]).toBe('default');
      expect(result.current[2]).toBe(false);
    });
  });
});
