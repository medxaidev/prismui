import { describe, it, expect } from 'vitest';
import { createInteractionRuntime } from '../runtime';
import { createAsyncModule, type AsyncController } from './async-module';
import { createAuditTrail } from '../governance/audit-trail';
import { createAuditMiddleware } from '../governance/audit-middleware';
import { ASYNC_START } from './async-module';

describe('Async Module', () => {
  function setup() {
    const runtime = createInteractionRuntime({
      modules: [createAsyncModule()],
    });
    const async = runtime.modules.async as AsyncController;
    return { runtime, async };
  }

  // ── basic ───────────────────────────────────────────────────────────

  describe('basic', () => {
    it('module contributes initialState', () => {
      const { runtime } = setup();
      expect(runtime.getState().asyncOperations).toEqual({});
    });
  });

  // ── lifecycle ───────────────────────────────────────────────────────

  describe('lifecycle', () => {
    it('start creates operation with loading status', () => {
      const { async } = setup();
      async.start('fetchUsers');

      const op = async.getOperation('fetchUsers');
      expect(op).toBeDefined();
      expect(op!.status).toBe('loading');
      expect(op!.error).toBe(null);
      expect(op!.startedAt).toBeGreaterThan(0);
      expect(op!.completedAt).toBe(null);
    });

    it('success transitions to success with data', () => {
      const { async } = setup();
      async.start('fetchUsers');
      async.success('fetchUsers', [{ id: 1, name: 'Alice' }]);

      const op = async.getOperation('fetchUsers');
      expect(op!.status).toBe('success');
      expect(op!.data).toEqual([{ id: 1, name: 'Alice' }]);
      expect(op!.error).toBe(null);
      expect(op!.completedAt).toBeGreaterThan(0);
    });

    it('error transitions to error with message', () => {
      const { async } = setup();
      async.start('fetchUsers');
      async.error('fetchUsers', 'Network timeout');

      const op = async.getOperation('fetchUsers');
      expect(op!.status).toBe('error');
      expect(op!.error).toBe('Network timeout');
      expect(op!.completedAt).toBeGreaterThan(0);
    });

    it('reset removes operation', () => {
      const { async } = setup();
      async.start('fetchUsers');
      async.success('fetchUsers', { done: true });
      async.reset('fetchUsers');

      expect(async.getOperation('fetchUsers')).toBeUndefined();
    });
  });

  // ── query ───────────────────────────────────────────────────────────

  describe('query', () => {
    it('getOperation returns undefined for unknown', () => {
      const { async } = setup();
      expect(async.getOperation('nonexistent')).toBeUndefined();
    });

    it('getStatus returns idle for unknown', () => {
      const { async } = setup();
      expect(async.getStatus('nonexistent')).toBe('idle');
    });

    it('isLoading returns correct status', () => {
      const { async } = setup();
      expect(async.isLoading('fetchUsers')).toBe(false);

      async.start('fetchUsers');
      expect(async.isLoading('fetchUsers')).toBe(true);

      async.success('fetchUsers');
      expect(async.isLoading('fetchUsers')).toBe(false);
    });

    it('isAnyLoading checks all operations', () => {
      const { async } = setup();
      expect(async.isAnyLoading()).toBe(false);

      async.start('op1');
      expect(async.isAnyLoading()).toBe(true);

      async.success('op1');
      expect(async.isAnyLoading()).toBe(false);

      async.start('op2');
      async.start('op3');
      expect(async.isAnyLoading()).toBe(true);

      async.success('op2');
      expect(async.isAnyLoading()).toBe(true); // op3 still loading

      async.error('op3', 'fail');
      expect(async.isAnyLoading()).toBe(false);
    });
  });

  // ── isolation ───────────────────────────────────────────────────────

  describe('isolation', () => {
    it('multiple operations tracked independently', () => {
      const { async } = setup();
      async.start('op1');
      async.start('op2');
      async.success('op1', 'data1');

      expect(async.getStatus('op1')).toBe('success');
      expect(async.getStatus('op2')).toBe('loading');
    });

    it('timestamps tracked (startedAt, completedAt)', () => {
      const { async } = setup();
      const before = Date.now();

      async.start('op1');
      const op1 = async.getOperation('op1');
      expect(op1!.startedAt).toBeGreaterThanOrEqual(before);
      expect(op1!.completedAt).toBe(null);

      async.success('op1', 'done');
      const op1Done = async.getOperation('op1');
      expect(op1Done!.completedAt).toBeGreaterThanOrEqual(before);
    });
  });

  // ── events ──────────────────────────────────────────────────────────

  describe('events', () => {
    it('events dispatched for all transitions', () => {
      const { runtime, async } = setup();

      async.start('op1');
      async.success('op1', 'data');
      async.start('op2');
      async.error('op2', 'fail');
      async.reset('op2');

      const history = runtime.bus.getHistory();
      const types = history.map((e) => e.type);

      expect(types).toContain('ASYNC_START');
      expect(types).toContain('ASYNC_SUCCESS');
      expect(types).toContain('ASYNC_ERROR');
      expect(types).toContain('ASYNC_RESET');
    });
  });

  // ── governance ──────────────────────────────────────────────────────

  describe('governance', () => {
    it('audit tracks async events', () => {
      const audit = createAuditTrail({ maxEntries: 100 });
      const runtime = createInteractionRuntime({
        modules: [createAsyncModule()],
      });
      runtime.scheduler.use(createAuditMiddleware(audit, runtime.store));

      const async = runtime.modules.async as AsyncController;
      async.start('fetch');
      async.success('fetch', { ok: true });

      const entries = audit.getEntries();
      expect(entries.length).toBeGreaterThan(0);
    });
  });

  // ── file isolation ──────────────────────────────────────────────────

  describe('file isolation', () => {
    it('has no React/DOM imports', async () => {
      const fs = await import('node:fs');
      const path = await import('node:path');
      const filePath = path.resolve(__dirname, 'async-module.ts');
      const source = fs.readFileSync(filePath, 'utf-8');

      expect(source).not.toMatch(/from ['"]react['"]/);
      expect(source).not.toMatch(/from ['"]react-dom['"]/);
      expect(source).not.toMatch(/document\./);
      expect(source).not.toMatch(/window\./);
    });
  });
});
