import { describe, it, expect, vi } from 'vitest';
import { createEventBus, type RuntimeEvent } from './event-bus';
import { createRuntimeStore } from './store';
import { createScheduler, SYSTEM_ERROR, type EventReducer } from './scheduler';

describe('Scheduler', () => {
  // ── creation ──────────────────────────────────────────────────────────

  describe('creation', () => {
    it('creates Scheduler instance', () => {
      const bus = createEventBus();
      const store = createRuntimeStore();
      const scheduler = createScheduler(store, bus);

      expect(scheduler).toBeDefined();
      expect(typeof scheduler.process).toBe('function');
      expect(typeof scheduler.registerReducer).toBe('function');
      expect(typeof scheduler.use).toBe('function');
    });
  });

  // ── reducer ───────────────────────────────────────────────────────────

  describe('reducer', () => {
    it('routes event to registered reducer', () => {
      const bus = createEventBus();
      const store = createRuntimeStore();
      const scheduler = createScheduler(store, bus);
      const reducer = vi.fn<EventReducer>((_event, prevState) => ({
        nextState: { ...prevState, handled: true },
      }));

      scheduler.registerReducer('TEST', reducer);
      scheduler.process({ type: 'TEST', timestamp: Date.now() });

      expect(reducer).toHaveBeenCalledTimes(1);
    });

    it('reducer receives event and prevState (not store)', () => {
      const bus = createEventBus();
      const store = createRuntimeStore({ count: 0 });
      const scheduler = createScheduler(store, bus);

      scheduler.registerReducer('INC', (event, prevState) => {
        // prevState should be the store state, not the store itself
        expect(prevState.count).toBe(0);
        expect(prevState.version).toBe(0);
        expect(event.type).toBe('INC');
        return { nextState: { ...prevState, count: 1 } };
      });

      scheduler.process({ type: 'INC', timestamp: Date.now() });
    });

    it('reducer result.nextState is committed to store', () => {
      const bus = createEventBus();
      const store = createRuntimeStore({ count: 0 });
      const scheduler = createScheduler(store, bus);

      scheduler.registerReducer('SET', (_event, prevState) => ({
        nextState: { ...prevState, count: 42 },
      }));

      scheduler.process({ type: 'SET', timestamp: Date.now() });
      expect(store.getState().count).toBe(42);
    });

    it('unregistered event types are silently dropped', () => {
      const bus = createEventBus();
      const store = createRuntimeStore();
      const scheduler = createScheduler(store, bus);

      // Should not throw
      expect(() => {
        scheduler.process({ type: 'UNKNOWN', timestamp: Date.now() });
      }).not.toThrow();

      // State unchanged (version still 0)
      expect(store.getState().version).toBe(0);
    });

    it('registerReducer returns unregister function', () => {
      const bus = createEventBus();
      const store = createRuntimeStore();
      const scheduler = createScheduler(store, bus);

      const unregister = scheduler.registerReducer('TEST', (_e, s) => ({ nextState: s }));
      expect(typeof unregister).toBe('function');
    });

    it('unregistered reducer no longer receives events', () => {
      const bus = createEventBus();
      const store = createRuntimeStore({ count: 0 });
      const scheduler = createScheduler(store, bus);
      const reducer = vi.fn<EventReducer>((_e, s) => ({
        nextState: { ...s, count: (s.count as number) + 1 },
      }));

      const unregister = scheduler.registerReducer('INC', reducer);
      scheduler.process({ type: 'INC', timestamp: Date.now() });
      expect(reducer).toHaveBeenCalledTimes(1);

      unregister();
      scheduler.process({ type: 'INC', timestamp: Date.now() });
      expect(reducer).toHaveBeenCalledTimes(1); // still 1
    });
  });

  // ── commit ────────────────────────────────────────────────────────────

  describe('commit', () => {
    it('store.setState is only called by Scheduler commit', () => {
      const bus = createEventBus();
      const store = createRuntimeStore({ count: 0 });
      const setStateSpy = vi.spyOn(store, 'setState');
      const scheduler = createScheduler(store, bus);

      scheduler.registerReducer('TEST', (_e, s) => ({
        nextState: { ...s, count: 1 },
      }));

      scheduler.process({ type: 'TEST', timestamp: Date.now() });
      // setState called exactly once by Scheduler commit
      expect(setStateSpy).toHaveBeenCalledTimes(1);
    });

    it('prevState and nextState are captured correctly', () => {
      const bus = createEventBus();
      const store = createRuntimeStore({ count: 0 });
      const scheduler = createScheduler(store, bus);
      const stateLog: { prev: number; next: number }[] = [];

      scheduler.registerReducer('INC', (_e, prevState) => {
        const nextCount = (prevState.count as number) + 1;
        stateLog.push({ prev: prevState.count as number, next: nextCount });
        return { nextState: { ...prevState, count: nextCount } };
      });

      scheduler.process({ type: 'INC', timestamp: Date.now() });
      scheduler.process({ type: 'INC', timestamp: Date.now() });

      expect(stateLog).toEqual([
        { prev: 0, next: 1 },
        { prev: 1, next: 2 },
      ]);
    });
  });

  // ── sideEffects ───────────────────────────────────────────────────────

  describe('sideEffects', () => {
    it('sideEffects are dispatched after commit', () => {
      const bus = createEventBus();
      const store = createRuntimeStore({ count: 0 });
      const scheduler = createScheduler(store, bus);
      const sideEffectReceived = vi.fn();

      scheduler.registerReducer('TRIGGER', (_e, s) => ({
        nextState: { ...s, count: 1 },
        sideEffects: [{ type: 'SIDE_EFFECT', timestamp: 0 }],
      }));

      scheduler.registerReducer('SIDE_EFFECT', (_e, s) => {
        // When side effect is processed, the store should already have count=1
        sideEffectReceived(s.count);
        return { nextState: { ...s, sideEffectHandled: true } };
      });

      scheduler.process({ type: 'TRIGGER', timestamp: Date.now() });

      expect(sideEffectReceived).toHaveBeenCalledTimes(1);
      // prevState.count should be 1 (committed before sideEffect dispatch)
      expect(sideEffectReceived).toHaveBeenCalledWith(1);
    });

    it('sideEffects are not dispatched if empty/undefined', () => {
      const bus = createEventBus();
      const store = createRuntimeStore();
      const scheduler = createScheduler(store, bus);
      const dispatchSpy = vi.spyOn(bus, 'dispatch');

      scheduler.registerReducer('NO_SIDE', (_e, s) => ({
        nextState: s,
      }));

      scheduler.registerReducer('EMPTY_SIDE', (_e, s) => ({
        nextState: s,
        sideEffects: [],
      }));

      scheduler.process({ type: 'NO_SIDE', timestamp: Date.now() });
      scheduler.process({ type: 'EMPTY_SIDE', timestamp: Date.now() });

      // dispatchSpy should not have been called by sideEffects
      // (it IS called by scheduler.process triggering bus.subscribe, but no extra sideEffect dispatches)
      // Only the 2 process calls themselves go through bus (if we called bus.dispatch directly)
      // Since we call scheduler.process directly, bus.dispatch is NOT called by us.
      // So any calls would only be from sideEffects — which should be 0.
      expect(dispatchSpy).not.toHaveBeenCalled();
    });
  });

  // ── middleware ─────────────────────────────────────────────────────────

  describe('middleware', () => {
    it('middleware executes before reducer', () => {
      const bus = createEventBus();
      const store = createRuntimeStore();
      const scheduler = createScheduler(store, bus);
      const order: string[] = [];

      scheduler.use((_event, next) => {
        order.push('middleware');
        next();
      });

      scheduler.registerReducer('TEST', (_e, s) => {
        order.push('reducer');
        return { nextState: s };
      });

      scheduler.process({ type: 'TEST', timestamp: Date.now() });
      expect(order).toEqual(['middleware', 'reducer']);
    });

    it('multiple middleware execute in order', () => {
      const bus = createEventBus();
      const store = createRuntimeStore();
      const scheduler = createScheduler(store, bus);
      const order: string[] = [];

      scheduler.use((_event, next) => { order.push('mw1'); next(); });
      scheduler.use((_event, next) => { order.push('mw2'); next(); });
      scheduler.use((_event, next) => { order.push('mw3'); next(); });

      scheduler.registerReducer('TEST', (_e, s) => {
        order.push('reducer');
        return { nextState: s };
      });

      scheduler.process({ type: 'TEST', timestamp: Date.now() });
      expect(order).toEqual(['mw1', 'mw2', 'mw3', 'reducer']);
    });

    it('middleware can stop chain by not calling next', () => {
      const bus = createEventBus();
      const store = createRuntimeStore({ count: 0 });
      const scheduler = createScheduler(store, bus);

      scheduler.use((_event, _next) => {
        // Intentionally NOT calling next()
      });

      scheduler.registerReducer('TEST', (_e, s) => ({
        nextState: { ...s, count: 99 },
      }));

      scheduler.process({ type: 'TEST', timestamp: Date.now() });
      // Reducer should not have been called; state unchanged
      expect(store.getState().count).toBe(0);
    });

    it('middleware receives the event', () => {
      const bus = createEventBus();
      const store = createRuntimeStore();
      const scheduler = createScheduler(store, bus);
      const receivedEvents: RuntimeEvent[] = [];

      scheduler.use((event, next) => {
        receivedEvents.push(event);
        next();
      });

      const event: RuntimeEvent = { type: 'TEST', payload: 42, timestamp: 123 };
      scheduler.process(event);

      expect(receivedEvents).toHaveLength(1);
      expect(receivedEvents[0].type).toBe('TEST');
      expect(receivedEvents[0].payload).toBe(42);
    });
  });

  // ── error ─────────────────────────────────────────────────────────────

  describe('error', () => {
    it('reducer error does not commit state', () => {
      const bus = createEventBus();
      const store = createRuntimeStore({ count: 0 });
      const scheduler = createScheduler(store, bus);
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

      scheduler.registerReducer('BAD', () => {
        throw new Error('reducer failed');
      });

      scheduler.process({ type: 'BAD', timestamp: Date.now() });

      // State unchanged
      expect(store.getState().count).toBe(0);
      expect(store.getState().version).toBe(0);

      // SYSTEM_ERROR should be in history
      const history = bus.getHistory();
      const errorEvent = history.find((e) => e.type === SYSTEM_ERROR);
      expect(errorEvent).toBeDefined();
      expect((errorEvent!.payload as { error: Error }).error.message).toBe('reducer failed');

      consoleSpy.mockRestore();
    });
  });

  // ── integration ───────────────────────────────────────────────────────

  describe('integration', () => {
    it('processes events from EventBus automatically', () => {
      const bus = createEventBus();
      const store = createRuntimeStore({ count: 0 });
      createScheduler(store, bus);

      // Register reducer via the scheduler returned by createScheduler
      // But we need a reference. Let's use the bus subscription approach:
      // createScheduler subscribes to bus — so dispatching via bus should trigger processing.
      const scheduler = createScheduler(store, bus);
      scheduler.registerReducer('INC', (_e, s) => ({
        nextState: { ...s, count: (s.count as number) + 1 },
      }));

      // Dispatch via bus — scheduler should process automatically
      bus.dispatch({ type: 'INC' });

      expect(store.getState().count).toBe(1);
    });
  });

  // ── isolation ─────────────────────────────────────────────────────────

  describe('isolation', () => {
    it('has no React/DOM imports', async () => {
      const fs = await import('node:fs');
      const path = await import('node:path');
      const filePath = path.resolve(__dirname, 'scheduler.ts');
      const source = fs.readFileSync(filePath, 'utf-8');

      expect(source).not.toMatch(/from\s+['"]react['"]/);
      expect(source).not.toMatch(/from\s+['"]react-dom['"]/);
      expect(source).not.toMatch(/\bdocument\b/);
      expect(source).not.toMatch(/\bwindow\b/);
      expect(source).not.toMatch(/\bHTMLElement\b/);
    });
  });
});
