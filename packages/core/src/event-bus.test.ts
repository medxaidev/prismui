import { describe, it, expect, vi } from 'vitest';
import { createEventBus, type RuntimeEvent } from './event-bus';

describe('EventBus', () => {
  // ── creation ──────────────────────────────────────────────────────────

  describe('creation', () => {
    it('creates EventBus instance', () => {
      const bus = createEventBus();
      expect(bus).toBeDefined();
      expect(typeof bus.dispatch).toBe('function');
      expect(typeof bus.subscribe).toBe('function');
      expect(typeof bus.getHistory).toBe('function');
      expect(typeof bus.clear).toBe('function');
    });
  });

  // ── dispatch ──────────────────────────────────────────────────────────

  describe('dispatch', () => {
    it('dispatches event to global subscribers', () => {
      const bus = createEventBus();
      const listener = vi.fn();
      bus.subscribe(listener);

      bus.dispatch({ type: 'TEST' });

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'TEST' }),
      );
    });

    it('dispatches event to type-filtered subscribers', () => {
      const bus = createEventBus();
      const listener = vi.fn();
      bus.subscribe('TEST', listener);

      bus.dispatch({ type: 'TEST', payload: 42 });

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'TEST', payload: 42 }),
      );
    });

    it('does not deliver to non-matching type subscribers', () => {
      const bus = createEventBus();
      const listener = vi.fn();
      bus.subscribe('OTHER', listener);

      bus.dispatch({ type: 'TEST' });

      expect(listener).not.toHaveBeenCalled();
    });

    it('includes timestamp in dispatched event', () => {
      const bus = createEventBus();
      const listener = vi.fn();
      bus.subscribe(listener);

      const before = Date.now();
      bus.dispatch({ type: 'TEST' });
      const after = Date.now();

      const event: RuntimeEvent = listener.mock.calls[0][0];
      expect(event.timestamp).toBeGreaterThanOrEqual(before);
      expect(event.timestamp).toBeLessThanOrEqual(after);
    });
  });

  // ── subscribe ─────────────────────────────────────────────────────────

  describe('subscribe', () => {
    it('supports multiple global subscribers', () => {
      const bus = createEventBus();
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      bus.subscribe(listener1);
      bus.subscribe(listener2);

      bus.dispatch({ type: 'TEST' });

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
    });

    it('supports multiple type-filtered subscribers', () => {
      const bus = createEventBus();
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      bus.subscribe('TEST', listener1);
      bus.subscribe('TEST', listener2);

      bus.dispatch({ type: 'TEST' });

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
    });

    it('returns unsubscribe function', () => {
      const bus = createEventBus();
      const listener = vi.fn();
      const unsub = bus.subscribe(listener);

      expect(typeof unsub).toBe('function');
    });

    it('unsubscribed listener does not receive events', () => {
      const bus = createEventBus();
      const listener = vi.fn();
      const unsub = bus.subscribe(listener);

      bus.dispatch({ type: 'A' });
      expect(listener).toHaveBeenCalledTimes(1);

      unsub();
      bus.dispatch({ type: 'B' });
      expect(listener).toHaveBeenCalledTimes(1); // still 1
    });
  });

  // ── history ───────────────────────────────────────────────────────────

  describe('history', () => {
    it('records events in history', () => {
      const bus = createEventBus();

      bus.dispatch({ type: 'A' });
      bus.dispatch({ type: 'B' });

      const history = bus.getHistory();
      expect(history).toHaveLength(2);
      expect(history[0].type).toBe('A');
      expect(history[1].type).toBe('B');
    });

    it('respects historySize limit', () => {
      const bus = createEventBus({ historySize: 3 });

      bus.dispatch({ type: 'A' });
      bus.dispatch({ type: 'B' });
      bus.dispatch({ type: 'C' });
      bus.dispatch({ type: 'D' });
      bus.dispatch({ type: 'E' });

      const history = bus.getHistory();
      expect(history).toHaveLength(3);
      // Oldest events (A, B) should be evicted; C, D, E remain
      expect(history[0].type).toBe('C');
      expect(history[1].type).toBe('D');
      expect(history[2].type).toBe('E');
    });

    it('getHistory returns readonly array', () => {
      const bus = createEventBus();
      bus.dispatch({ type: 'TEST' });

      const history = bus.getHistory();
      // Should be a new array each call (not the internal buffer)
      const history2 = bus.getHistory();
      expect(history).not.toBe(history2);
      expect(history).toEqual(history2);
    });
  });

  // ── clear ─────────────────────────────────────────────────────────────

  describe('clear', () => {
    it('clear removes all subscribers', () => {
      const bus = createEventBus();
      const globalListener = vi.fn();
      const typedListener = vi.fn();
      bus.subscribe(globalListener);
      bus.subscribe('TEST', typedListener);

      bus.clear();

      bus.dispatch({ type: 'TEST' });
      expect(globalListener).not.toHaveBeenCalled();
      expect(typedListener).not.toHaveBeenCalled();
    });

    it('clear empties history', () => {
      const bus = createEventBus();
      bus.dispatch({ type: 'A' });
      bus.dispatch({ type: 'B' });
      expect(bus.getHistory()).toHaveLength(2);

      bus.clear();
      expect(bus.getHistory()).toHaveLength(0);
    });
  });

  // ── isolation ─────────────────────────────────────────────────────────

  describe('isolation', () => {
    it('has no React/DOM imports', async () => {
      // Read the source file and verify no React/DOM imports
      const fs = await import('node:fs');
      const path = await import('node:path');
      const filePath = path.resolve(__dirname, 'event-bus.ts');
      const source = fs.readFileSync(filePath, 'utf-8');

      // Must not contain React or DOM imports
      expect(source).not.toMatch(/from\s+['"]react['"]/);
      expect(source).not.toMatch(/from\s+['"]react-dom['"]/);
      expect(source).not.toMatch(/\bdocument\b/);
      expect(source).not.toMatch(/\bwindow\b/);
      expect(source).not.toMatch(/\bHTMLElement\b/);
    });
  });
});
