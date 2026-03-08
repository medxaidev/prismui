import { describe, it, expect, vi } from 'vitest';
import { createInteractionRuntime, type RuntimeModule, type RuntimeEvent } from './index';

describe('InteractionRuntime', () => {
  // ── creation ──────────────────────────────────────────────────────────

  describe('creation', () => {
    it('creates runtime with all subsystems', () => {
      const runtime = createInteractionRuntime();
      expect(runtime.bus).toBeDefined();
      expect(runtime.store).toBeDefined();
      expect(runtime.scheduler).toBeDefined();
      expect(runtime.modules).toBeDefined();
      expect(typeof runtime.dispatch).toBe('function');
      expect(typeof runtime.getState).toBe('function');
      expect(typeof runtime.subscribe).toBe('function');
      expect(typeof runtime.destroy).toBe('function');
    });
  });

  // ── dispatch ──────────────────────────────────────────────────────────

  describe('dispatch', () => {
    it('dispatch adds timestamp and dispatches event', () => {
      const runtime = createInteractionRuntime();
      const listener = vi.fn();
      runtime.bus.subscribe(listener);

      const before = Date.now();
      runtime.dispatch({ type: 'TEST', payload: 42 });
      const after = Date.now();

      expect(listener).toHaveBeenCalledTimes(1);
      const event: RuntimeEvent = listener.mock.calls[0][0];
      expect(event.type).toBe('TEST');
      expect(event.payload).toBe(42);
      expect(event.timestamp).toBeGreaterThanOrEqual(before);
      expect(event.timestamp).toBeLessThanOrEqual(after);
    });
  });

  // ── convenience ───────────────────────────────────────────────────────

  describe('convenience', () => {
    it('getState returns current store state', () => {
      const runtime = createInteractionRuntime({ initialState: { count: 0 } });
      const state = runtime.getState();
      expect(state.version).toBe(0);
      expect(state.count).toBe(0);
    });

    it('subscribe notifies on state change', () => {
      const runtime = createInteractionRuntime({ initialState: { count: 0 } });
      const listener = vi.fn();
      runtime.subscribe(listener);

      // Register a reducer to trigger state change
      runtime.scheduler.registerReducer('INC', (_e, s) => ({
        nextState: { ...s, count: (s.count as number) + 1 },
      }));

      runtime.dispatch({ type: 'INC' });
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener.mock.calls[0][0].count).toBe(1);
    });
  });

  // ── integration ───────────────────────────────────────────────────────

  describe('integration', () => {
    it('full pipeline: dispatch → reducer → commit → state update', () => {
      const runtime = createInteractionRuntime({ initialState: { count: 0 } });

      runtime.scheduler.registerReducer('ADD', (event, prevState) => ({
        nextState: {
          ...prevState,
          count: (prevState.count as number) + (event.payload as number),
        },
      }));

      runtime.dispatch({ type: 'ADD', payload: 5 });
      expect(runtime.getState().count).toBe(5);
      expect(runtime.getState().version).toBe(1);

      runtime.dispatch({ type: 'ADD', payload: 3 });
      expect(runtime.getState().count).toBe(8);
      expect(runtime.getState().version).toBe(2);
    });
  });

  // ── modules ───────────────────────────────────────────────────────────

  describe('modules', () => {
    it('module initialState is merged into store', () => {
      const mod: RuntimeModule = {
        name: 'test',
        initialState: { foo: 'bar', items: [] },
      };

      const runtime = createInteractionRuntime({ modules: [mod] });
      expect(runtime.getState().foo).toBe('bar');
      expect(runtime.getState().items).toEqual([]);
    });

    it('module reducers are registered with Scheduler', () => {
      const mod: RuntimeModule = {
        name: 'counter',
        initialState: { count: 0 },
        reducers: {
          INC: (_e, s) => ({ nextState: { ...s, count: (s.count as number) + 1 } }),
        },
      };

      const runtime = createInteractionRuntime({ modules: [mod] });
      runtime.dispatch({ type: 'INC' });
      expect(runtime.getState().count).toBe(1);
    });

    it('module middleware is added to Scheduler', () => {
      const order: string[] = [];
      const mod: RuntimeModule = {
        name: 'logger',
        middleware: [
          (_event, next) => {
            order.push('module-mw');
            next();
          },
        ],
      };

      const runtime = createInteractionRuntime({
        modules: [mod],
        middleware: [
          (_event, next) => {
            order.push('extra-mw');
            next();
          },
        ],
      });

      runtime.scheduler.registerReducer('TEST', (_e, s) => {
        order.push('reducer');
        return { nextState: s };
      });

      // Clear any entries from MODULE_INIT lifecycle events during creation
      order.length = 0;

      runtime.dispatch({ type: 'TEST' });
      // Module middleware runs before extra middleware, both before reducer
      expect(order).toEqual(['module-mw', 'extra-mw', 'reducer']);
    });

    it('module controller is accessible via runtime.modules', () => {
      interface CounterController {
        increment(): void;
        getCount(): number;
      }

      const mod: RuntimeModule<CounterController> = {
        name: 'counter',
        initialState: { count: 0 },
        reducers: {
          INC: (_e, s) => ({ nextState: { ...s, count: (s.count as number) + 1 } }),
        },
        createController: ({ bus, store }) => ({
          increment() {
            bus.dispatch({ type: 'INC' });
          },
          getCount() {
            return store.getState().count as number;
          },
        }),
      };

      const runtime = createInteractionRuntime({ modules: [mod] });
      const counter = runtime.modules.counter as CounterController;

      expect(counter).toBeDefined();
      expect(counter.getCount()).toBe(0);

      counter.increment();
      expect(counter.getCount()).toBe(1);
    });
  });

  // ── destroy ───────────────────────────────────────────────────────────

  describe('destroy', () => {
    it('destroy cleans up all subscriptions and reducers', () => {
      const runtime = createInteractionRuntime({ initialState: { count: 0 } });
      const listener = vi.fn();
      runtime.subscribe(listener);

      runtime.scheduler.registerReducer('INC', (_e, s) => ({
        nextState: { ...s, count: (s.count as number) + 1 },
      }));

      runtime.dispatch({ type: 'INC' });
      expect(listener).toHaveBeenCalledTimes(1);

      runtime.destroy();

      // After destroy, dispatch should not trigger listener or state change
      // (bus.clear() removes all subscribers including scheduler's)
      runtime.dispatch({ type: 'INC' });
      // listener not called again (bus subscribers cleared)
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  // ── isolation ─────────────────────────────────────────────────────────

  describe('isolation', () => {
    it('multiple runtime instances are isolated', () => {
      const mod: RuntimeModule = {
        name: 'counter',
        initialState: { count: 0 },
        reducers: {
          INC: (_e, s) => ({ nextState: { ...s, count: (s.count as number) + 1 } }),
        },
      };

      const r1 = createInteractionRuntime({ modules: [mod] });
      const r2 = createInteractionRuntime({ modules: [mod] });

      r1.dispatch({ type: 'INC' });
      r1.dispatch({ type: 'INC' });

      expect(r1.getState().count).toBe(2);
      expect(r2.getState().count).toBe(0); // isolated
    });

    it('has no React/DOM imports', async () => {
      const fs = await import('node:fs');
      const path = await import('node:path');

      const files = ['event-bus.ts', 'store.ts', 'scheduler.ts', 'module.ts', 'runtime.ts'];
      for (const file of files) {
        const filePath = path.resolve(__dirname, file);
        const source = fs.readFileSync(filePath, 'utf-8');

        expect(source).not.toMatch(/from\s+['"]react['"]/);
        expect(source).not.toMatch(/from\s+['"]react-dom['"]/);
        expect(source).not.toMatch(/\bdocument\b/);
        expect(source).not.toMatch(/\bwindow\b/);
        expect(source).not.toMatch(/\bHTMLElement\b/);
      }
    });
  });
});
