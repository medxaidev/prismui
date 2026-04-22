import * as React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useControllableState,
  type UseControllableStateOptions,
} from './use-controllable-state';

// Design reference: @/devdocs/hooks/use-controllable-state.md v0.2
// 22 tests split across 8 categories, each anchored to a design invariant
// (H-1 ~ H-10) or a hook-contract rule (HR-*). The goal is not coverage for
// coverage's sake — every test maps to a named invariant listed in §一 of
// the design doc. When you're tempted to delete one, re-read the invariant
// first: if it still holds, the test still earns its keep.

describe('useControllableState', () => {
  // ───────────────────────────────────────────────────────────────────────
  // 非受控模式 (uncontrolled)
  // ───────────────────────────────────────────────────────────────────────
  describe('uncontrolled mode', () => {
    it('initial value === defaultValue', () => {
      const { result } = renderHook(() =>
        useControllableState({ defaultValue: 42 }),
      );
      expect(result.current[0]).toBe(42);
    });

    it('setValue updates the returned value', () => {
      const { result } = renderHook(() =>
        useControllableState({ defaultValue: 0 }),
      );
      act(() => result.current[1](7));
      expect(result.current[0]).toBe(7);
    });

    it('onChange fires with the new value on setValue', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useControllableState({ defaultValue: 0, onChange }),
      );
      act(() => result.current[1](9));
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(9);
    });

    it('functional updater reads the latest prev (H-5)', () => {
      const { result } = renderHook(() =>
        useControllableState({ defaultValue: 0 }),
      );
      act(() => result.current[1]((p) => p + 1));
      act(() => result.current[1]((p) => p + 1));
      act(() => result.current[1]((p) => p + 1));
      expect(result.current[0]).toBe(3);
    });

    it('two synchronous functional updaters in one act() read intermediate ref (H-3 detail)', () => {
      // The key correctness test: inside one event handler, two synchronous
      // setValue(p=>...) calls must compose correctly. This would break
      // without the immediate `uncontrolledRef.current = resolved` in the
      // implementation (the effect-based sync runs far too late).
      const { result } = renderHook(() =>
        useControllableState({ defaultValue: 0 }),
      );
      act(() => {
        result.current[1]((p) => p + 1);
        result.current[1]((p) => p + 1);
      });
      expect(result.current[0]).toBe(2);
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // 受控模式 (controlled)
  // ───────────────────────────────────────────────────────────────────────
  describe('controlled mode', () => {
    it('controlled value overrides defaultValue', () => {
      const { result } = renderHook(() =>
        useControllableState({ value: 'live', defaultValue: 'fallback' }),
      );
      expect(result.current[0]).toBe('live');
    });

    it('setValue in controlled mode does NOT mutate internal state — only calls onChange', () => {
      // This is the defining property of controlled mode: the hook is a
      // transparent pipe. The parent owns the state; setValue is just a
      // notification channel. We assert BOTH halves: (a) value stays at the
      // controlled prop, (b) onChange fires with the next value.
      const onChange = vi.fn();
      const { result, rerender } = renderHook(
        ({ v }: { v: number }) =>
          useControllableState({ value: v, defaultValue: 0, onChange }),
        { initialProps: { v: 10 } },
      );
      act(() => result.current[1](99));
      // `current[0]` is still tied to the prop (parent hasn't updated yet)
      expect(result.current[0]).toBe(10);
      expect(onChange).toHaveBeenCalledWith(99);
      // Now the parent "accepts" the change by re-rendering with new value
      rerender({ v: 99 });
      expect(result.current[0]).toBe(99);
    });

    it('parent value changes are reflected immediately (no effect lag)', () => {
      const { result, rerender } = renderHook(
        ({ v }: { v: number }) =>
          useControllableState({ value: v, defaultValue: 0 }),
        { initialProps: { v: 1 } },
      );
      rerender({ v: 2 });
      expect(result.current[0]).toBe(2);
      rerender({ v: 3 });
      expect(result.current[0]).toBe(3);
    });

    it('functional updater in controlled mode reads props.value as prev', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useControllableState({ value: 5, defaultValue: 0, onChange }),
      );
      act(() => result.current[1]((p) => p + 10));
      expect(onChange).toHaveBeenCalledWith(15);
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // setter 稳定性 (H-3)
  // ───────────────────────────────────────────────────────────────────────
  describe('H-3 · setter reference stability', () => {
    it('setter reference is identical across renders', () => {
      const { result, rerender } = renderHook(
        ({ v }: { v: number }) =>
          useControllableState({ value: v, defaultValue: 0 }),
        { initialProps: { v: 1 } },
      );
      const setter1 = result.current[1];
      rerender({ v: 2 });
      const setter2 = result.current[1];
      rerender({ v: 3 });
      const setter3 = result.current[1];
      expect(setter1).toBe(setter2);
      expect(setter2).toBe(setter3);
    });

    it('setter placed in effect deps does NOT re-trigger the effect', () => {
      // If the setter reference were to churn, `effect` would fire again on
      // every render. We rerender multiple times and assert it only fires
      // once (the initial mount).
      const effect = vi.fn();
      const { rerender } = renderHook(
        ({ v }: { v: number }) => {
          const [, setValue] = useControllableState({
            value: v,
            defaultValue: 0,
          });
          React.useEffect(() => {
            effect();
          }, [setValue]);
          return setValue;
        },
        { initialProps: { v: 0 } },
      );
      rerender({ v: 1 });
      rerender({ v: 2 });
      rerender({ v: 3 });
      expect(effect).toHaveBeenCalledTimes(1);
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // onChange ref-latch (H-8)
  // ───────────────────────────────────────────────────────────────────────
  describe('H-8 · onChange ref-latched', () => {
    it('setter invokes the LATEST onChange identity, not the initial one', () => {
      // Without ref-latching, inline lambdas `onChange={v => ...}` would
      // bind to the stale closure from the render when the setter was first
      // created — a nasty stale-state class of bugs.
      const callsA: number[] = [];
      const callsB: number[] = [];
      const onChangeA = (v: number) => callsA.push(v);
      const onChangeB = (v: number) => callsB.push(v);
      const { result, rerender } = renderHook(
        ({ onChange }: { onChange: (v: number) => void }) =>
          useControllableState({ defaultValue: 0, onChange }),
        { initialProps: { onChange: onChangeA } },
      );
      act(() => result.current[1](1));
      rerender({ onChange: onChangeB });
      act(() => result.current[1](2));
      expect(callsA).toEqual([1]);
      expect(callsB).toEqual([2]);
    });

    it('undefined onChange does not throw on setValue', () => {
      const { result } = renderHook(() =>
        useControllableState({ defaultValue: 0 }),
      );
      expect(() => act(() => result.current[1](1))).not.toThrow();
      expect(result.current[0]).toBe(1);
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // 模式切换 DEV warn (H-6)
  // ───────────────────────────────────────────────────────────────────────
  describe('H-6 · mode transition DEV warn', () => {
    let spy: ReturnType<typeof vi.spyOn>;
    beforeEach(() => {
      spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });
    afterEach(() => {
      // Restore so the next test sees a clean console.error. Without this,
      // asynchronous effects from a previous test can leak into the next
      // test's fresh spy (Strict Mode / React 18 effect flush timing) and
      // cause false-positive "transition" counts.
      spy.mockRestore();
    });

    it('warns when uncontrolled → controlled transition is observed', () => {
      const { rerender } = renderHook(
        ({ v }: { v?: number }) =>
          useControllableState({ value: v, defaultValue: 0 }),
        { initialProps: { v: undefined as number | undefined } },
      );
      // Was uncontrolled; now becomes controlled.
      rerender({ v: 5 });
      const transitionWarnings = spy.mock.calls.filter((call: unknown[]) =>
        /switching between controlled and uncontrolled/.test(String(call[0])),
      );
      expect(transitionWarnings.length).toBeGreaterThan(0);
    });

    it('warns when controlled → uncontrolled transition is observed', () => {
      const { rerender } = renderHook(
        ({ v }: { v?: number }) =>
          useControllableState({ value: v, defaultValue: 0 }),
        { initialProps: { v: 5 as number | undefined } },
      );
      rerender({ v: undefined });
      const transitionWarnings = spy.mock.calls.filter((call: unknown[]) =>
        /switching between controlled and uncontrolled/.test(String(call[0])),
      );
      expect(transitionWarnings.length).toBeGreaterThan(0);
    });

    it('does NOT warn when mode is stable across renders', () => {
      const { rerender } = renderHook(
        ({ v }: { v: number }) =>
          useControllableState({ value: v, defaultValue: 0 }),
        { initialProps: { v: 1 } },
      );
      rerender({ v: 2 });
      rerender({ v: 3 });
      const transitionWarnings = spy.mock.calls.filter((call: unknown[]) =>
        /switching between controlled and uncontrolled/.test(String(call[0])),
      );
      expect(transitionWarnings).toHaveLength(0);
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // H-9 · equality shortcut
  // ───────────────────────────────────────────────────────────────────────
  describe('H-9 · equality shortcut', () => {
    it('setValue(x); setValue(x) fires onChange exactly ONCE (default Object.is)', () => {
      // The motivating bug: without an equality check, analytics / network
      // requests in the parent's onChange would be spuriously triggered on
      // every "idempotent" setter call. Locked-in by this test.
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useControllableState({ defaultValue: 0, onChange }),
      );
      act(() => result.current[1](5));
      act(() => result.current[1](5));
      act(() => result.current[1](5));
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(5);
    });

    it('setValue(prev => prev) is a complete no-op (typo-guard)', () => {
      // A common typo: writing `setValue(prev => prev)` (often when the
      // update logic accidentally becomes an identity function). Without
      // H-9, this produces a "ghost event" that's hard to track down.
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useControllableState({ defaultValue: 'a', onChange }),
      );
      act(() => result.current[1]((p) => p));
      expect(onChange).not.toHaveBeenCalled();
      expect(result.current[0]).toBe('a');
    });

    it('custom shouldUpdate can treat structurally equal arrays as unchanged', () => {
      // Demonstrates the escape hatch: when `T` is an array/object with
      // reference-unstable but structurally equal values (very common for
      // Select / Combobox / Slider), users can supply deep-equal.
      const onChange = vi.fn();
      const shallowArrayEqual = <U,>(a: readonly U[], b: readonly U[]): boolean =>
        a.length === b.length && a.every((v, i) => Object.is(v, b[i]));
      const { result } = renderHook(() =>
        useControllableState<readonly number[]>({
          defaultValue: [1, 2, 3],
          onChange,
          shouldUpdate: (prev, next) => !shallowArrayEqual(prev, next),
        }),
      );
      act(() => result.current[1]([1, 2, 3])); // new array, same content
      expect(onChange).not.toHaveBeenCalled();
      act(() => result.current[1]([1, 2, 4]));
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith([1, 2, 4]);
    });

    it('Object.is treats NaN as equal (default shouldUpdate edge case)', () => {
      // `===` would fail here (`NaN !== NaN`), firing onChange twice. The
      // `Object.is` default correctly collapses. This is the headline
      // reason for choosing Object.is over === (OQ-H-7 rationale).
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useControllableState({ defaultValue: NaN, onChange }),
      );
      act(() => result.current[1](NaN));
      act(() => result.current[1](NaN));
      expect(onChange).not.toHaveBeenCalled();
    });

    it('Object.is treats +0 and -0 as distinct (default shouldUpdate edge case)', () => {
      // Symmetric to the NaN test: `+0 === -0` is true, but `Object.is(+0,
      // -0)` is false. Rare in practice, but when it matters (physics /
      // signed arithmetic) the default is correct out of the box.
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useControllableState({ defaultValue: +0, onChange }),
      );
      act(() => result.current[1](-0));
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(-0);
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // H-10 · lazy defaultValue
  // ───────────────────────────────────────────────────────────────────────
  describe('H-10 · lazy defaultValue', () => {
    it('function form is called exactly once across many renders', () => {
      const lazy = vi.fn(() => 'heavy-result');
      const { rerender, result } = renderHook(
        ({ opt }: { opt: UseControllableStateOptions<string> }) =>
          useControllableState(opt),
        { initialProps: { opt: { defaultValue: lazy } } },
      );
      expect(result.current[0]).toBe('heavy-result');
      expect(lazy).toHaveBeenCalledTimes(1);
      // Many rerenders must NOT re-invoke the lazy initializer, mirroring
      // `useState(() => heavy())` semantics (H-10).
      rerender({ opt: { defaultValue: lazy } });
      rerender({ opt: { defaultValue: lazy } });
      rerender({ opt: { defaultValue: lazy } });
      expect(lazy).toHaveBeenCalledTimes(1);
    });

    it('non-function form still works (backward compatible)', () => {
      const { result } = renderHook(() =>
        useControllableState({ defaultValue: 'plain-value' }),
      );
      expect(result.current[0]).toBe('plain-value');
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // Edge cases
  // ───────────────────────────────────────────────────────────────────────
  describe('edge cases', () => {
    it('`null` is a legitimate controlled value (not treated as sentinel)', () => {
      // Only `undefined` means uncontrolled (H-1). `null`, `0`, `false`,
      // `''` are all legitimate controlled values. Locked to prevent
      // future "oh let's widen the sentinel" regressions.
      const { result } = renderHook(() =>
        useControllableState<string | null>({
          value: null,
          defaultValue: 'fallback',
        }),
      );
      expect(result.current[0]).toBeNull();
    });

    it('complex object value uses reference equality by default', () => {
      // Default shouldUpdate = !Object.is, which for objects is reference
      // comparison. Users are expected to provide their own deep-equal if
      // they want structural comparison (covered elsewhere in H-9 tests).
      const onChange = vi.fn();
      const obj = { a: 1 };
      const { result } = renderHook(() =>
        useControllableState<{ a: number }>({ defaultValue: obj, onChange }),
      );
      act(() => result.current[1](obj)); // same reference → no update
      expect(onChange).not.toHaveBeenCalled();
      act(() => result.current[1]({ a: 1 })); // new reference → update
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('setter called inside an effect reads the correct post-mount value', () => {
      // Regression for the subtle timing issue where a setter called in
      // the very first effect (via []-deps effect) must still see the
      // committed uncontrolled state.
      const onChange = vi.fn();
      renderHook(() => {
        const [value, setValue] = useControllableState({
          defaultValue: 'initial',
          onChange,
        });
        React.useEffect(() => {
          // We use a functional updater so the closure doesn't lock `value`.
          setValue((prev) => `${prev}-touched`);
        }, [setValue]);
        return value;
      });
      expect(onChange).toHaveBeenCalledWith('initial-touched');
    });
  });
});
