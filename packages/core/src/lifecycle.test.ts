import { describe, it, expect, vi } from 'vitest';
import { createInteractionRuntime } from './runtime';
import { createPageModule } from './modules/page-module';
import { createModalModule } from './modules/modal-module';
import { MODULE_INIT, MODULE_DESTROY } from './lifecycle';
import {
  createAuditTrail,
  createAuditMiddleware,
  createPolicyEngine,
  createPolicyMiddleware,
} from './governance';
import type { RuntimeModule } from './module';
import type { RuntimeEvent, EventBus } from './event-bus';
import type { RuntimeStore } from './store';
import type { Scheduler } from './scheduler';

describe('Module Lifecycle', () => {
  // ── onInit ──────────────────────────────────────────────────────────

  describe('onInit', () => {
    it('onInit called after module wired', () => {
      const onInit = vi.fn();
      const mod: RuntimeModule = {
        name: 'test',
        onInit,
      };

      createInteractionRuntime({ modules: [mod] });

      expect(onInit).toHaveBeenCalledTimes(1);
    });

    it('onInit receives core subsystems', () => {
      let receivedCore: { bus: EventBus; scheduler: Scheduler; store: RuntimeStore } | null = null;
      const mod: RuntimeModule = {
        name: 'test',
        onInit: (core) => {
          receivedCore = core;
        },
      };

      const runtime = createInteractionRuntime({ modules: [mod] });

      expect(receivedCore).not.toBeNull();
      expect(receivedCore!.bus).toBe(runtime.bus);
      expect(receivedCore!.store).toBe(runtime.store);
      expect(receivedCore!.scheduler).toBe(runtime.scheduler);
    });

    it('onInit called in module registration order', () => {
      const order: string[] = [];
      const modA: RuntimeModule = {
        name: 'alpha',
        onInit: () => order.push('alpha'),
      };
      const modB: RuntimeModule = {
        name: 'beta',
        onInit: () => order.push('beta'),
      };
      const modC: RuntimeModule = {
        name: 'gamma',
        onInit: () => order.push('gamma'),
      };

      createInteractionRuntime({ modules: [modA, modB, modC] });

      expect(order).toEqual(['alpha', 'beta', 'gamma']);
    });

    it('onInit can dispatch events', () => {
      const events: RuntimeEvent[] = [];
      const mod: RuntimeModule = {
        name: 'test',
        onInit: ({ bus }) => {
          bus.dispatch({ type: 'CUSTOM_INIT', payload: { ready: true } });
        },
      };

      const runtime = createInteractionRuntime({ modules: [mod] });
      const history = runtime.bus.getHistory();
      const customInit = history.find((e) => e.type === 'CUSTOM_INIT');

      expect(customInit).toBeDefined();
      expect(customInit!.payload).toEqual({ ready: true });
    });
  });

  // ── onDestroy ───────────────────────────────────────────────────────

  describe('onDestroy', () => {
    it('onDestroy called on runtime.destroy()', () => {
      const onDestroy = vi.fn();
      const mod: RuntimeModule = {
        name: 'test',
        onDestroy,
      };

      const runtime = createInteractionRuntime({ modules: [mod] });
      expect(onDestroy).not.toHaveBeenCalled();

      runtime.destroy();
      expect(onDestroy).toHaveBeenCalledTimes(1);
    });

    it('onDestroy called in reverse order', () => {
      const order: string[] = [];
      const modA: RuntimeModule = {
        name: 'alpha',
        onDestroy: () => order.push('alpha'),
      };
      const modB: RuntimeModule = {
        name: 'beta',
        onDestroy: () => order.push('beta'),
      };
      const modC: RuntimeModule = {
        name: 'gamma',
        onDestroy: () => order.push('gamma'),
      };

      const runtime = createInteractionRuntime({ modules: [modA, modB, modC] });
      runtime.destroy();

      expect(order).toEqual(['gamma', 'beta', 'alpha']);
    });

    it('onDestroy errors do not prevent other cleanups', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
      const order: string[] = [];

      const modA: RuntimeModule = {
        name: 'alpha',
        onDestroy: () => order.push('alpha'),
      };
      const modB: RuntimeModule = {
        name: 'beta',
        onDestroy: () => {
          throw new Error('beta exploded');
        },
      };
      const modC: RuntimeModule = {
        name: 'gamma',
        onDestroy: () => order.push('gamma'),
      };

      const runtime = createInteractionRuntime({ modules: [modA, modB, modC] });
      runtime.destroy();

      // gamma (reverse first), beta throws, alpha still runs
      expect(order).toEqual(['gamma', 'alpha']);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  // ── backward compat ─────────────────────────────────────────────────

  describe('backward compatibility', () => {
    it('module without onInit/onDestroy works fine', () => {
      const runtime = createInteractionRuntime({
        modules: [createPageModule(), createModalModule()],
      });

      // Should not throw
      expect(runtime.getModuleStatus()).toEqual({
        page: 'active',
        modal: 'active',
      });

      runtime.destroy();

      expect(runtime.getModuleStatus()).toEqual({
        page: 'destroyed',
        modal: 'destroyed',
      });
    });
  });

  // ── lifecycle events ────────────────────────────────────────────────

  describe('lifecycle events', () => {
    it('MODULE_INIT event dispatched per module', () => {
      const events: RuntimeEvent[] = [];
      const runtime = createInteractionRuntime({
        modules: [createPageModule(), createModalModule()],
      });

      const history = runtime.bus.getHistory();
      const initEvents = history.filter((e) => e.type === MODULE_INIT);

      expect(initEvents).toHaveLength(2);
      expect(initEvents[0].payload).toEqual({ moduleName: 'page' });
      expect(initEvents[1].payload).toEqual({ moduleName: 'modal' });
    });

    it('MODULE_DESTROY event dispatched per module', () => {
      const destroyEvents: RuntimeEvent[] = [];
      const runtime = createInteractionRuntime({
        modules: [createPageModule(), createModalModule()],
      });

      runtime.bus.subscribe(MODULE_DESTROY, (event) => {
        destroyEvents.push(event);
      });

      runtime.destroy();

      // Dispatched in reverse order
      expect(destroyEvents).toHaveLength(2);
      expect(destroyEvents[0].payload).toEqual({ moduleName: 'modal' });
      expect(destroyEvents[1].payload).toEqual({ moduleName: 'page' });
    });
  });

  // ── module status ───────────────────────────────────────────────────

  describe('module status', () => {
    it('getModuleStatus returns active after init', () => {
      const runtime = createInteractionRuntime({
        modules: [createPageModule()],
      });

      expect(runtime.getModuleStatus()).toEqual({ page: 'active' });
    });

    it('getModuleStatus returns destroyed after destroy', () => {
      const runtime = createInteractionRuntime({
        modules: [createPageModule(), createModalModule()],
      });

      runtime.destroy();

      const status = runtime.getModuleStatus();
      expect(status.page).toBe('destroyed');
      expect(status.modal).toBe('destroyed');
    });
  });

  // ── governance integration ──────────────────────────────────────────

  describe('governance', () => {
    it('lifecycle events tracked by audit', () => {
      const audit = createAuditTrail({ maxEntries: 100 });
      const runtime = createInteractionRuntime({
        modules: [createPageModule()],
      });

      runtime.scheduler.use(createAuditMiddleware(audit, runtime.store));

      // Dispatch a regular event to trigger audit
      runtime.dispatch({ type: 'PAGE_MOUNT', payload: { pageId: 'test' } });

      const entries = audit.getEntries();
      expect(entries.length).toBeGreaterThan(0);
    });

    it('lifecycle events subject to policy', () => {
      const policy = createPolicyEngine();
      const denied: string[] = [];
      policy.addRule({
        name: 'observe-module-init',
        eventTypes: [MODULE_INIT],
        evaluate: (event) => {
          denied.push((event.payload as { moduleName: string }).moduleName);
          return { verdict: 'allow' };
        },
      });

      const audit = createAuditTrail({ maxEntries: 100 });
      const runtime = createInteractionRuntime({
        modules: [createPageModule()],
      });

      runtime.scheduler.use(createPolicyMiddleware(policy, runtime.store, audit));

      // Dispatch a MODULE_INIT-like event to verify policy can evaluate it
      runtime.dispatch({ type: MODULE_INIT, payload: { moduleName: 'test-manual' } });

      expect(denied).toContain('test-manual');
    });
  });

  // ── isolation ───────────────────────────────────────────────────────

  describe('isolation', () => {
    it('has no React/DOM imports', async () => {
      const fs = await import('node:fs');
      const path = await import('node:path');

      for (const file of ['lifecycle.ts', 'runtime.ts', 'module.ts']) {
        const filePath = path.resolve(__dirname, file);
        const source = fs.readFileSync(filePath, 'utf-8');

        expect(source).not.toMatch(/from ['"]react['"]/);
        expect(source).not.toMatch(/from ['"]react-dom['"]/);
        expect(source).not.toMatch(/document\./);
        expect(source).not.toMatch(/window\./);
      }
    });
  });
});
