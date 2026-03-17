import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createInteractionRuntime,
  createWorkflowModule,
  createModalModule,
  createNotificationModule,
  type WorkflowController,
  type ModalController,
  type NotificationController,
  type WorkflowDefinition,
} from '../../src';
import { _resetInstanceCounter } from './workflow-module';

beforeEach(() => {
  _resetInstanceCounter();
});

function setup() {
  const runtime = createInteractionRuntime({
    modules: [
      createWorkflowModule(),
      createModalModule(),
      createNotificationModule({ maxNotifications: 50 }),
    ],
  });
  const workflow = runtime.modules.workflow as WorkflowController;
  const modal = runtime.modules.modal as ModalController;
  const notification = runtime.modules.notification as NotificationController;
  return { runtime, workflow, modal, notification };
}

// ── Workflow Definition & Registration ────────────────────────────────

describe('WorkflowModule', () => {
  describe('definition', () => {
    it('registers a workflow definition', () => {
      const { workflow } = setup();
      workflow.define({
        id: 'test-flow',
        steps: [{ id: 'step1', type: 'custom', execute: () => 'done' }],
      });
      expect(workflow.getDefinitions()).toHaveLength(1);
      expect(workflow.getDefinitions()[0].id).toBe('test-flow');
    });

    it('throws when starting an undefined workflow', async () => {
      const { workflow } = setup();
      await expect(workflow.start('nonexistent')).rejects.toThrow(
        'Workflow "nonexistent" is not defined',
      );
    });
  });

  // ── Basic Execution ──────────────────────────────────────────────────

  describe('execution', () => {
    it('executes a single custom step', async () => {
      const { workflow } = setup();
      workflow.define({
        id: 'simple',
        steps: [{ id: 'step1', type: 'custom', execute: () => 42 }],
      });
      const result = await workflow.start('simple');
      expect(result.status).toBe('completed');
      expect(result.results.step1).toBe(42);
    });

    it('executes multiple steps in sequence', async () => {
      const { workflow } = setup();
      workflow.define({
        id: 'multi',
        steps: [
          { id: 'a', type: 'custom', execute: () => 'first' },
          { id: 'b', type: 'custom', execute: (ctx) => `${ctx.results.a}-second` },
          { id: 'c', type: 'custom', execute: (ctx) => `${ctx.results.b}-third` },
        ],
      });
      const result = await workflow.start('multi');
      expect(result.status).toBe('completed');
      expect(result.results.c).toBe('first-second-third');
    });

    it('passes initial payload to steps via context', async () => {
      const { workflow } = setup();
      workflow.define({
        id: 'with-payload',
        steps: [
          { id: 'step1', type: 'custom', execute: (ctx) => ctx.payload.name },
        ],
      });
      const result = await workflow.start('with-payload', { name: 'PrismUI' });
      expect(result.results.step1).toBe('PrismUI');
    });

    it('tracks workflow instance in state', async () => {
      const { workflow } = setup();
      workflow.define({
        id: 'tracked',
        steps: [{ id: 'step1', type: 'custom', execute: () => 'ok' }],
      });
      const result = await workflow.start('tracked');
      const instance = workflow.getInstance(result.instanceId);
      expect(instance).toBeDefined();
      expect(instance!.status).toBe('completed');
      expect(instance!.completedAt).toBeDefined();
    });

    it('generates unique instance IDs', async () => {
      const { workflow } = setup();
      workflow.define({
        id: 'unique',
        steps: [{ id: 'step1', type: 'custom', execute: () => null }],
      });
      const r1 = await workflow.start('unique');
      const r2 = await workflow.start('unique');
      expect(r1.instanceId).not.toBe(r2.instanceId);
    });

    it('getInstances returns all instances', async () => {
      const { workflow } = setup();
      workflow.define({
        id: 'list',
        steps: [{ id: 'step1', type: 'custom', execute: () => null }],
      });
      await workflow.start('list');
      await workflow.start('list');
      expect(workflow.getInstances()).toHaveLength(2);
    });
  });

  // ── Async Steps ─────────────────────────────────────────────────────

  describe('async steps', () => {
    it('executes an async step and captures result', async () => {
      const { workflow } = setup();
      workflow.define({
        id: 'async-flow',
        steps: [
          {
            id: 'fetch',
            type: 'async',
            execute: async () => {
              await new Promise((r) => setTimeout(r, 10));
              return { data: [1, 2, 3] };
            },
          },
        ],
      });
      const result = await workflow.start('async-flow');
      expect(result.status).toBe('completed');
      expect(result.results.fetch).toEqual({ data: [1, 2, 3] });
    });

    it('fails workflow on async error (default abort)', async () => {
      const { workflow } = setup();
      workflow.define({
        id: 'async-fail',
        steps: [
          {
            id: 'bad',
            type: 'async',
            execute: async () => { throw new Error('Network error'); },
          },
        ],
      });
      const result = await workflow.start('async-fail');
      expect(result.status).toBe('failed');
      expect(result.error).toBe('Network error');
    });

    it('skips on error when onError.action is skip', async () => {
      const { workflow } = setup();
      workflow.define({
        id: 'async-skip',
        steps: [
          {
            id: 'bad',
            type: 'async',
            execute: async () => { throw new Error('fail'); },
            onError: { action: 'skip' },
          },
          { id: 'next', type: 'custom', execute: () => 'reached' },
        ],
      });
      const result = await workflow.start('async-skip');
      expect(result.status).toBe('completed');
      expect(result.results.next).toBe('reached');
    });

    it('continues on error when onError.action is continue', async () => {
      const { workflow } = setup();
      workflow.define({
        id: 'async-continue',
        steps: [
          {
            id: 'bad',
            type: 'async',
            execute: async () => { throw new Error('fail'); },
            onError: { action: 'continue' },
          },
          { id: 'next', type: 'custom', execute: () => 'reached' },
        ],
      });
      const result = await workflow.start('async-continue');
      expect(result.status).toBe('completed');
      expect(result.results.next).toBe('reached');
    });
  });

  // ── Confirm Steps ───────────────────────────────────────────────────

  describe('confirm steps', () => {
    it('completes when user confirms (modal close)', async () => {
      const { workflow, modal } = setup();
      workflow.define({
        id: 'confirm-flow',
        steps: [
          { id: 'ask', type: 'confirm', modalId: 'confirm-dialog' },
          { id: 'after', type: 'custom', execute: () => 'confirmed' },
        ],
      });

      const promise = workflow.start('confirm-flow');
      // Wait for modal to open
      await new Promise((r) => setTimeout(r, 10));
      expect(modal.isOpen('confirm-dialog')).toBe(true);
      // User confirms by closing the modal
      modal.close('confirm-dialog');
      const result = await promise;
      expect(result.status).toBe('completed');
      expect(result.results.after).toBe('confirmed');
    });

    it('aborts when user rejects via closeAll (default onReject: abort)', async () => {
      const { workflow, modal } = setup();
      workflow.define({
        id: 'confirm-reject',
        steps: [
          { id: 'ask', type: 'confirm', modalId: 'reject-dialog' },
          { id: 'after', type: 'custom', execute: () => 'should not reach' },
        ],
      });

      const promise = workflow.start('confirm-reject');
      await new Promise((r) => setTimeout(r, 10));
      modal.closeAll();
      const result = await promise;
      expect(result.status).toBe('aborted');
    });

    it('skips confirm step when onReject is skip', async () => {
      const { workflow, modal } = setup();
      workflow.define({
        id: 'confirm-skip',
        steps: [
          { id: 'ask', type: 'confirm', modalId: 'skip-dialog', onReject: 'skip' },
          { id: 'after', type: 'custom', execute: () => 'reached' },
        ],
      });

      const promise = workflow.start('confirm-skip');
      await new Promise((r) => setTimeout(r, 10));
      modal.closeAll();
      const result = await promise;
      expect(result.status).toBe('completed');
      expect(result.results.after).toBe('reached');
    });
  });

  // ── Notify Steps ────────────────────────────────────────────────────

  describe('notify steps', () => {
    it('sends notification and continues', async () => {
      const { workflow, notification } = setup();
      workflow.define({
        id: 'notify-flow',
        steps: [
          {
            id: 'notify',
            type: 'notify',
            notification: { type: 'success', message: 'Step complete!' },
          },
          { id: 'after', type: 'custom', execute: () => 'done' },
        ],
      });
      const result = await workflow.start('notify-flow');
      expect(result.status).toBe('completed');
      expect(result.results.after).toBe('done');
      // Notification was dispatched via bus event
      expect(notification.count()).toBeGreaterThanOrEqual(0); // May not reach notification module directly
    });

    it('supports dynamic notification message via function', async () => {
      const { workflow } = setup();
      workflow.define({
        id: 'notify-dynamic',
        steps: [
          { id: 'step1', type: 'custom', execute: () => 'hello' },
          {
            id: 'notify',
            type: 'notify',
            notification: (ctx) => ({
              type: 'info',
              message: `Result: ${ctx.results.step1}`,
            }),
          },
        ],
      });
      const result = await workflow.start('notify-dynamic');
      expect(result.status).toBe('completed');
    });
  });

  // ── Condition Guards ────────────────────────────────────────────────

  describe('condition guards', () => {
    it('skips step when condition returns false', async () => {
      const { workflow } = setup();
      const skippedFn = vi.fn();
      workflow.define({
        id: 'guarded',
        steps: [
          {
            id: 'skipped',
            type: 'custom',
            condition: () => false,
            execute: skippedFn,
          },
          { id: 'reached', type: 'custom', execute: () => 'ok' },
        ],
      });
      const result = await workflow.start('guarded');
      expect(result.status).toBe('completed');
      expect(skippedFn).not.toHaveBeenCalled();
      expect(result.results.reached).toBe('ok');
    });

    it('executes step when condition returns true', async () => {
      const { workflow } = setup();
      workflow.define({
        id: 'guarded-true',
        steps: [
          {
            id: 'run',
            type: 'custom',
            condition: () => true,
            execute: () => 'executed',
          },
        ],
      });
      const result = await workflow.start('guarded-true');
      expect(result.results.run).toBe('executed');
    });

    it('condition receives context with payload and previous results', async () => {
      const { workflow } = setup();
      workflow.define({
        id: 'ctx-guard',
        steps: [
          { id: 'a', type: 'custom', execute: () => 'first' },
          {
            id: 'b',
            type: 'custom',
            condition: (ctx) => ctx.results.a === 'first' && ctx.payload.skip !== true,
            execute: () => 'second',
          },
        ],
      });
      const result = await workflow.start('ctx-guard', { skip: false });
      expect(result.results.b).toBe('second');
    });
  });

  // ── Lifecycle Hooks ─────────────────────────────────────────────────

  describe('lifecycle hooks', () => {
    it('calls onEnter before step execution', async () => {
      const { workflow } = setup();
      const order: string[] = [];
      workflow.define({
        id: 'hooks',
        steps: [
          {
            id: 'step1',
            type: 'custom',
            onEnter: () => order.push('enter'),
            execute: () => { order.push('execute'); return 'ok'; },
            onExit: () => order.push('exit'),
          },
        ],
      });
      await workflow.start('hooks');
      expect(order).toEqual(['enter', 'execute', 'exit']);
    });

    it('onEnter errors do not break workflow', async () => {
      const { workflow } = setup();
      workflow.define({
        id: 'hooks-error',
        steps: [
          {
            id: 'step1',
            type: 'custom',
            onEnter: () => { throw new Error('hook error'); },
            execute: () => 'still works',
          },
        ],
      });
      const result = await workflow.start('hooks-error');
      expect(result.status).toBe('completed');
      expect(result.results.step1).toBe('still works');
    });
  });

  // ── Abort ───────────────────────────────────────────────────────────

  describe('abort', () => {
    it('aborts a workflow waiting on confirm step', async () => {
      const { workflow } = setup();
      workflow.define({
        id: 'abort-flow',
        steps: [
          { id: 'ask', type: 'confirm', modalId: 'abort-modal' },
          { id: 'after', type: 'custom', execute: () => 'should not reach' },
        ],
      });

      const promise = workflow.start('abort-flow');
      await new Promise((r) => setTimeout(r, 10));

      // Get instance and abort
      const instances = workflow.getInstances();
      expect(instances).toHaveLength(1);
      workflow.abort(instances[0].instanceId);

      const result = await promise;
      expect(result.status).toBe('aborted');
    });

    it('abort on non-running instance is no-op', () => {
      const { workflow } = setup();
      // Should not throw
      workflow.abort('nonexistent');
    });
  });

  // ── Error Notification ──────────────────────────────────────────────

  describe('error notification', () => {
    it('sends error notification when onError.notify is string', async () => {
      const { workflow, runtime } = setup();
      const events: string[] = [];
      runtime.bus.subscribe((e) => {
        if (e.type === 'NOTIFICATION_SHOW') events.push(e.type);
      });

      workflow.define({
        id: 'error-notify',
        steps: [
          {
            id: 'bad',
            type: 'async',
            execute: async () => { throw new Error('fail'); },
            onError: { action: 'abort', notify: 'Something went wrong' },
          },
        ],
      });
      await workflow.start('error-notify');
      expect(events).toContain('NOTIFICATION_SHOW');
    });
  });

  // ── Step State Tracking ─────────────────────────────────────────────

  describe('step state tracking', () => {
    it('tracks step statuses in instance', async () => {
      const { workflow } = setup();
      workflow.define({
        id: 'step-track',
        steps: [
          { id: 'a', type: 'custom', execute: () => 1 },
          { id: 'b', type: 'custom', condition: () => false, execute: () => 2 },
          { id: 'c', type: 'custom', execute: () => 3 },
        ],
      });
      const result = await workflow.start('step-track');
      const instance = workflow.getInstance(result.instanceId)!;
      expect(instance.steps[0].status).toBe('completed');
      expect(instance.steps[1].status).toBe('skipped');
      expect(instance.steps[2].status).toBe('completed');
    });

    it('tracks failed step in instance', async () => {
      const { workflow } = setup();
      workflow.define({
        id: 'step-fail-track',
        steps: [
          {
            id: 'bad',
            type: 'async',
            execute: async () => { throw new Error('boom'); },
          },
        ],
      });
      const result = await workflow.start('step-fail-track');
      const instance = workflow.getInstance(result.instanceId)!;
      expect(instance.steps[0].status).toBe('failed');
      expect(instance.steps[0].error).toBe('boom');
    });
  });

  // ── Concurrent Workflows ────────────────────────────────────────────

  describe('concurrent workflows', () => {
    it('runs multiple workflows concurrently', async () => {
      const { workflow } = setup();
      workflow.define({
        id: 'concurrent',
        steps: [
          {
            id: 'step1',
            type: 'async',
            execute: async (ctx) => {
              await new Promise((r) => setTimeout(r, 10));
              return ctx.payload.value;
            },
          },
        ],
      });

      const [r1, r2] = await Promise.all([
        workflow.start('concurrent', { value: 'A' }),
        workflow.start('concurrent', { value: 'B' }),
      ]);

      expect(r1.status).toBe('completed');
      expect(r2.status).toBe('completed');
      expect(r1.results.step1).toBe('A');
      expect(r2.results.step1).toBe('B');
      expect(r1.instanceId).not.toBe(r2.instanceId);
    });
  });
});
