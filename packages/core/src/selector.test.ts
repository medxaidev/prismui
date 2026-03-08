import { describe, it, expect, vi } from 'vitest';
import { createRuntimeStore } from './store';
import { selectFromStore, createSelector } from './selector';
import type { StateSelector } from './selector';
import type { RuntimeState } from './store';

describe('State Selectors', () => {
  // ── selectFromStore ─────────────────────────────────────────────────

  describe('selectFromStore', () => {
    it('calls listener with initial value', () => {
      const store = createRuntimeStore({ count: 10 });
      const selector: StateSelector<number> = (s) => s.count as number;
      const listener = vi.fn();

      selectFromStore(store, selector, listener);

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(10);
    });

    it('calls listener on relevant state change', () => {
      const store = createRuntimeStore({ count: 0, name: 'test' });
      const selector: StateSelector<number> = (s) => s.count as number;
      const listener = vi.fn();

      selectFromStore(store, selector, listener);
      listener.mockClear();

      store.setState((prev) => ({ ...prev, count: 5 }));

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(5);
    });

    it('skips listener on irrelevant state change', () => {
      const store = createRuntimeStore({ count: 0, name: 'test' });
      const selector: StateSelector<number> = (s) => s.count as number;
      const listener = vi.fn();

      selectFromStore(store, selector, listener);
      listener.mockClear();

      // Change 'name' only — count stays the same
      store.setState((prev) => ({ ...prev, name: 'changed' }));

      expect(listener).not.toHaveBeenCalled();
    });

    it('uses Object.is comparison', () => {
      const store = createRuntimeStore({ value: NaN });
      const selector: StateSelector<number> = (s) => s.value as number;
      const listener = vi.fn();

      selectFromStore(store, selector, listener);
      listener.mockClear();

      // NaN === NaN under Object.is → should NOT notify
      store.setState((prev) => ({ ...prev, value: NaN }));

      expect(listener).not.toHaveBeenCalled();
    });

    it('unsubscribe stops notifications', () => {
      const store = createRuntimeStore({ count: 0 });
      const selector: StateSelector<number> = (s) => s.count as number;
      const listener = vi.fn();

      const unsub = selectFromStore(store, selector, listener);
      listener.mockClear();

      unsub();

      store.setState((prev) => ({ ...prev, count: 99 }));

      expect(listener).not.toHaveBeenCalled();
    });

    it('multiple selectors on same store are independent', () => {
      const store = createRuntimeStore({ a: 1, b: 2 });
      const listenerA = vi.fn();
      const listenerB = vi.fn();

      selectFromStore(store, (s) => s.a as number, listenerA);
      selectFromStore(store, (s) => s.b as number, listenerB);
      listenerA.mockClear();
      listenerB.mockClear();

      // Change only 'a'
      store.setState((prev) => ({ ...prev, a: 10 }));

      expect(listenerA).toHaveBeenCalledTimes(1);
      expect(listenerA).toHaveBeenCalledWith(10);
      expect(listenerB).not.toHaveBeenCalled();
    });

    it('selector receives readonly state', () => {
      const store = createRuntimeStore({ count: 0 });
      let receivedState: Readonly<RuntimeState> | null = null;

      selectFromStore(
        store,
        (s) => {
          receivedState = s;
          return s.count as number;
        },
        () => {},
      );

      expect(receivedState).not.toBeNull();
      expect(receivedState!.version).toBe(0);
    });
  });

  // ── createSelector ──────────────────────────────────────────────────

  describe('createSelector', () => {
    it('single input selector', () => {
      const selectCount: StateSelector<number> = (s) => s.count as number;
      const selectDoubled = createSelector(
        [selectCount],
        (count) => count * 2,
      );

      const state: RuntimeState = { version: 0, count: 5 };
      expect(selectDoubled(state)).toBe(10);
    });

    it('multiple input selectors', () => {
      const selectA: StateSelector<number> = (s) => s.a as number;
      const selectB: StateSelector<number> = (s) => s.b as number;
      const selectSum = createSelector(
        [selectA, selectB],
        (a, b) => a + b,
      );

      const state: RuntimeState = { version: 0, a: 3, b: 7 };
      expect(selectSum(state)).toBe(10);
    });

    it('recomputes when input changes', () => {
      const resultFn = vi.fn((count: number) => count * 2);
      const selectCount: StateSelector<number> = (s) => s.count as number;
      const selectDoubled = createSelector([selectCount], resultFn);

      const state1: RuntimeState = { version: 0, count: 5 };
      selectDoubled(state1);
      expect(resultFn).toHaveBeenCalledTimes(1);

      const state2: RuntimeState = { version: 1, count: 10 };
      const result = selectDoubled(state2);
      expect(resultFn).toHaveBeenCalledTimes(2);
      expect(result).toBe(20);
    });

    it('skips recompute when inputs stable', () => {
      const resultFn = vi.fn((count: number) => count * 2);
      const selectCount: StateSelector<number> = (s) => s.count as number;
      const selectDoubled = createSelector([selectCount], resultFn);

      const state1: RuntimeState = { version: 0, count: 5 };
      selectDoubled(state1);

      // version changed but count didn't
      const state2: RuntimeState = { version: 1, count: 5 };
      const result = selectDoubled(state2);

      expect(resultFn).toHaveBeenCalledTimes(1);
      expect(result).toBe(10);
    });

    it('composes with selectFromStore', () => {
      const store = createRuntimeStore({ count: 3, factor: 2 });
      const selectCount: StateSelector<number> = (s) => s.count as number;
      const selectFactor: StateSelector<number> = (s) => s.factor as number;
      const selectProduct = createSelector(
        [selectCount, selectFactor],
        (count, factor) => count * factor,
      );

      const listener = vi.fn();
      selectFromStore(store, selectProduct, listener);

      expect(listener).toHaveBeenCalledWith(6);
      listener.mockClear();

      // Change count → product changes
      store.setState((prev) => ({ ...prev, count: 5 }));
      expect(listener).toHaveBeenCalledWith(10);
    });
  });

  // ── isolation ───────────────────────────────────────────────────────

  describe('isolation', () => {
    it('has no React/DOM imports', async () => {
      const fs = await import('node:fs');
      const path = await import('node:path');
      const filePath = path.resolve(__dirname, 'selector.ts');
      const source = fs.readFileSync(filePath, 'utf-8');

      expect(source).not.toMatch(/from ['"]react['"]/);
      expect(source).not.toMatch(/from ['"]react-dom['"]/);
      expect(source).not.toMatch(/document\./);
      expect(source).not.toMatch(/window\./);
    });
  });
});
