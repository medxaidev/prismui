import { describe, it, expect, vi } from 'vitest';
import { createRuntimeStore, type RuntimeState } from './store';

describe('RuntimeStore', () => {
  // ── creation ──────────────────────────────────────────────────────────

  describe('creation', () => {
    it('creates store with default initial state', () => {
      const store = createRuntimeStore();
      const state = store.getState();
      expect(state.version).toBe(0);
    });

    it('creates store with custom initial state', () => {
      const store = createRuntimeStore({ currentPage: 'home', locked: false });
      const state = store.getState();
      expect(state.version).toBe(0);
      expect(state.currentPage).toBe('home');
      expect(state.locked).toBe(false);
    });
  });

  // ── getState ──────────────────────────────────────────────────────────

  describe('getState', () => {
    it('getState returns current state', () => {
      const store = createRuntimeStore({ count: 10 });
      expect(store.getState().count).toBe(10);
    });

    it('getState returns readonly reference', () => {
      const store = createRuntimeStore();
      const s1 = store.getState();
      const s2 = store.getState();
      // Same reference — not a copy
      expect(s1).toBe(s2);
    });
  });

  // ── setState ──────────────────────────────────────────────────────────

  describe('setState', () => {
    it('setState applies updater function', () => {
      const store = createRuntimeStore({ count: 0 });
      store.setState((prev) => ({ ...prev, count: (prev.count as number) + 1 }));
      expect(store.getState().count).toBe(1);
    });

    it('setState does not mutate previous state', () => {
      const store = createRuntimeStore({ count: 0 });
      const before = store.getState();
      store.setState((prev) => ({ ...prev, count: 99 }));
      // before still holds old values
      expect(before.count).toBe(0);
      expect(before.version).toBe(0);
    });

    it('setState increments version', () => {
      const store = createRuntimeStore();
      expect(store.getState().version).toBe(0);
      store.setState((prev) => prev);
      expect(store.getState().version).toBe(1);
    });

    it('multiple setState calls increment version correctly', () => {
      const store = createRuntimeStore();
      store.setState((prev) => prev);
      store.setState((prev) => prev);
      store.setState((prev) => prev);
      expect(store.getState().version).toBe(3);
    });
  });

  // ── subscribe ─────────────────────────────────────────────────────────

  describe('subscribe', () => {
    it('subscribe is called on state change', () => {
      const store = createRuntimeStore();
      const listener = vi.fn();
      store.subscribe(listener);

      store.setState((prev) => prev);
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('subscribe receives new state', () => {
      const store = createRuntimeStore({ count: 0 });
      const listener = vi.fn();
      store.subscribe(listener);

      store.setState((prev) => ({ ...prev, count: 42 }));

      const received: RuntimeState = listener.mock.calls[0][0];
      expect(received.count).toBe(42);
      expect(received.version).toBe(1);
    });

    it('multiple subscribers all notified', () => {
      const store = createRuntimeStore();
      const l1 = vi.fn();
      const l2 = vi.fn();
      const l3 = vi.fn();
      store.subscribe(l1);
      store.subscribe(l2);
      store.subscribe(l3);

      store.setState((prev) => prev);

      expect(l1).toHaveBeenCalledTimes(1);
      expect(l2).toHaveBeenCalledTimes(1);
      expect(l3).toHaveBeenCalledTimes(1);
    });

    it('unsubscribe stops notifications', () => {
      const store = createRuntimeStore();
      const listener = vi.fn();
      const unsub = store.subscribe(listener);

      store.setState((prev) => prev);
      expect(listener).toHaveBeenCalledTimes(1);

      unsub();
      store.setState((prev) => prev);
      expect(listener).toHaveBeenCalledTimes(1); // still 1
    });
  });

  // ── snapshot ──────────────────────────────────────────────────────────

  describe('snapshot', () => {
    it('getSnapshot returns frozen copy', () => {
      const store = createRuntimeStore({ count: 5 });
      const snap = store.getSnapshot();

      expect(snap.count).toBe(5);
      expect(snap.version).toBe(0);
      expect(Object.isFrozen(snap)).toBe(true);
    });

    it('getSnapshot is isolated from future changes', () => {
      const store = createRuntimeStore({ count: 0 });
      const snap1 = store.getSnapshot();

      store.setState((prev) => ({ ...prev, count: 100 }));
      const snap2 = store.getSnapshot();

      // snap1 still holds old values
      expect(snap1.count).toBe(0);
      expect(snap1.version).toBe(0);
      // snap2 reflects new state
      expect(snap2.count).toBe(100);
      expect(snap2.version).toBe(1);
      // Different objects
      expect(snap1).not.toBe(snap2);
    });
  });

  // ── isolation ─────────────────────────────────────────────────────────

  describe('isolation', () => {
    it('has no React/DOM imports', async () => {
      const fs = await import('node:fs');
      const path = await import('node:path');
      const filePath = path.resolve(__dirname, 'store.ts');
      const source = fs.readFileSync(filePath, 'utf-8');

      expect(source).not.toMatch(/from\s+['"]react['"]/);
      expect(source).not.toMatch(/from\s+['"]react-dom['"]/);
      expect(source).not.toMatch(/\bdocument\b/);
      expect(source).not.toMatch(/\bwindow\b/);
      expect(source).not.toMatch(/\bHTMLElement\b/);
    });
  });
});
