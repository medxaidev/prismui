import { describe, it, expect } from 'vitest';
import { createInteractionRuntime } from '../index';
import {
  createNotificationModule,
  type NotificationController,
} from './notification-module';
import { createModalModule, type ModalController } from './modal-module';
import {
  createAuditTrail,
  createAuditMiddleware,
  createPolicyEngine,
  createPolicyMiddleware,
} from '../governance';

function setup(options?: { maxNotifications?: number }) {
  const runtime = createInteractionRuntime({
    modules: [createNotificationModule(options)],
  });
  const notification = runtime.modules.notification as NotificationController;
  return { runtime, notification };
}

describe('Notification Module', () => {
  // ── creation ──────────────────────────────────────────────────────────

  describe('creation', () => {
    it('createNotificationModule returns valid RuntimeModule', () => {
      const mod = createNotificationModule();
      expect(mod.name).toBe('notification');
      expect(mod.initialState).toBeDefined();
      expect(mod.reducers).toBeDefined();
      expect(mod.createController).toBeDefined();
    });

    it('contributes initialState with empty notifications', () => {
      const { runtime } = setup();
      expect(runtime.getState().notifications).toEqual([]);
    });
  });

  // ── show ───────────────────────────────────────────────────────────────

  describe('show', () => {
    it('show adds notification with auto id', () => {
      const { notification } = setup();
      const id = notification.show({ type: 'info', message: 'Hello' });
      expect(typeof id).toBe('string');
      expect(id.startsWith('notif-')).toBe(true);
      expect(notification.count()).toBe(1);
    });

    it('show with info type', () => {
      const { notification } = setup();
      notification.show({ type: 'info', message: 'Info message' });
      const all = notification.getAll();
      expect(all[0].type).toBe('info');
      expect(all[0].message).toBe('Info message');
    });

    it('show with success type', () => {
      const { notification } = setup();
      notification.show({ type: 'success', message: 'Done' });
      expect(notification.getAll()[0].type).toBe('success');
    });

    it('show with warning type', () => {
      const { notification } = setup();
      notification.show({ type: 'warning', message: 'Watch out' });
      expect(notification.getAll()[0].type).toBe('warning');
    });

    it('show with error type', () => {
      const { notification } = setup();
      notification.show({ type: 'error', message: 'Failed' });
      expect(notification.getAll()[0].type).toBe('error');
    });

    it('show respects maxNotifications limit', () => {
      const { notification } = setup({ maxNotifications: 3 });
      notification.show({ type: 'info', message: 'First' });
      notification.show({ type: 'info', message: 'Second' });
      notification.show({ type: 'info', message: 'Third' });
      notification.show({ type: 'info', message: 'Fourth' });
      expect(notification.count()).toBe(3);
      // Oldest (First) should be evicted
      const all = notification.getAll();
      expect(all[0].message).toBe('Second');
      expect(all[2].message).toBe('Fourth');
    });
  });

  // ── dismiss ────────────────────────────────────────────────────────────

  describe('dismiss', () => {
    it('dismiss removes specific notification', () => {
      const { notification } = setup();
      const id = notification.show({ type: 'info', message: 'To remove' });
      notification.show({ type: 'info', message: 'To keep' });
      notification.dismiss(id);
      expect(notification.count()).toBe(1);
      expect(notification.getAll()[0].message).toBe('To keep');
    });

    it('dismiss non-existent is no-op', () => {
      const { notification } = setup();
      notification.show({ type: 'info', message: 'Exists' });
      notification.dismiss('nonexistent-id');
      expect(notification.count()).toBe(1);
    });

    it('dismissAll clears all notifications', () => {
      const { notification } = setup();
      notification.show({ type: 'info', message: 'A' });
      notification.show({ type: 'error', message: 'B' });
      notification.show({ type: 'success', message: 'C' });
      notification.dismissAll();
      expect(notification.count()).toBe(0);
      expect(notification.getAll()).toEqual([]);
    });
  });

  // ── query ──────────────────────────────────────────────────────────────

  describe('query', () => {
    it('getAll returns current notifications', () => {
      const { notification } = setup();
      notification.show({ type: 'info', message: 'A' });
      notification.show({ type: 'error', message: 'B' });
      const all = notification.getAll();
      expect(all).toHaveLength(2);
      expect(all[0].message).toBe('A');
      expect(all[1].message).toBe('B');
    });

    it('getById returns specific notification', () => {
      const { notification } = setup();
      const id = notification.show({ type: 'info', message: 'Find me' });
      const found = notification.getById(id);
      expect(found).toBeDefined();
      expect(found!.message).toBe('Find me');
      expect(found!.id).toBe(id);
    });

    it('getById returns undefined for missing', () => {
      const { notification } = setup();
      expect(notification.getById('nonexistent')).toBeUndefined();
    });

    it('count returns notification count', () => {
      const { notification } = setup();
      expect(notification.count()).toBe(0);
      notification.show({ type: 'info', message: 'One' });
      expect(notification.count()).toBe(1);
      notification.show({ type: 'info', message: 'Two' });
      expect(notification.count()).toBe(2);
    });
  });

  // ── order ──────────────────────────────────────────────────────────────

  describe('order', () => {
    it('notifications maintain insertion order', () => {
      const { notification } = setup();
      notification.show({ type: 'info', message: 'First' });
      notification.show({ type: 'warning', message: 'Second' });
      notification.show({ type: 'error', message: 'Third' });
      const all = notification.getAll();
      expect(all[0].message).toBe('First');
      expect(all[1].message).toBe('Second');
      expect(all[2].message).toBe('Third');
    });

    it('oldest evicted when maxNotifications exceeded', () => {
      const { notification } = setup({ maxNotifications: 2 });
      notification.show({ type: 'info', message: 'A' });
      notification.show({ type: 'info', message: 'B' });
      notification.show({ type: 'info', message: 'C' });
      expect(notification.count()).toBe(2);
      const all = notification.getAll();
      expect(all[0].message).toBe('B');
      expect(all[1].message).toBe('C');
    });
  });

  // ── autoDismiss ────────────────────────────────────────────────────────

  describe('autoDismiss', () => {
    it('autoDismissMs stored in entry', () => {
      const { notification } = setup();
      notification.show({ type: 'info', message: 'Auto', autoDismissMs: 3000 });
      const entry = notification.getAll()[0];
      expect(entry.autoDismissMs).toBe(3000);
    });

    it('autoDismissMs undefined for persistent', () => {
      const { notification } = setup();
      notification.show({ type: 'info', message: 'Persistent' });
      const entry = notification.getAll()[0];
      expect(entry.autoDismissMs).toBeUndefined();
    });

    it('timestamp is set on show', () => {
      const { notification } = setup();
      const before = Date.now();
      notification.show({ type: 'info', message: 'Timestamped' });
      const after = Date.now();
      const entry = notification.getAll()[0];
      expect(entry.timestamp).toBeGreaterThanOrEqual(before);
      expect(entry.timestamp).toBeLessThanOrEqual(after);
    });
  });

  // ── isolation ──────────────────────────────────────────────────────────

  describe('isolation', () => {
    it('notification + modal independent', () => {
      const runtime = createInteractionRuntime({
        modules: [createNotificationModule(), createModalModule()],
      });
      const notification = runtime.modules.notification as NotificationController;
      const modal = runtime.modules.modal as ModalController;

      notification.show({ type: 'info', message: 'Hello' });
      modal.open('confirm');

      expect(notification.count()).toBe(1);
      expect(modal.getStack()).toEqual(['confirm']);

      notification.dismissAll();
      expect(notification.count()).toBe(0);
      expect(modal.getStack()).toEqual(['confirm']); // modal unaffected
    });

    it('has no React/DOM imports', async () => {
      const fs = await import('node:fs');
      const path = await import('node:path');
      const filePath = path.resolve(__dirname, 'notification-module.ts');
      const source = fs.readFileSync(filePath, 'utf-8');

      expect(source).not.toMatch(/from\s+['"]react['"]/);
      expect(source).not.toMatch(/from\s+['"]react-dom['"]/);
      expect(source).not.toMatch(/\bdocument\b/);
      expect(source).not.toMatch(/\bwindow\./);
      expect(source).not.toMatch(/\bHTMLElement\b/);
    });
  });

  // ── governance ─────────────────────────────────────────────────────────

  describe('governance', () => {
    it('notification events tracked by audit', () => {
      const audit = createAuditTrail();
      const runtime = createInteractionRuntime({
        modules: [createNotificationModule()],
      });
      runtime.scheduler.use(createAuditMiddleware(audit, runtime.store));

      const notification = runtime.modules.notification as NotificationController;
      const id = notification.show({ type: 'error', message: 'Alert' });
      notification.dismiss(id);

      const entries = audit.getEntries();
      expect(entries.some((e) => e.event.type === 'notification/show')).toBe(true);
      expect(entries.some((e) => e.event.type === 'notification/dismiss')).toBe(true);
    });

    it('notification events subject to policy', () => {
      const policy = createPolicyEngine();
      const audit = createAuditTrail();
      const runtime = createInteractionRuntime({
        modules: [createNotificationModule()],
      });
      runtime.scheduler.use(createPolicyMiddleware(policy, runtime.store, audit));

      // Block error notifications
      policy.addRule({
        name: 'block-errors',
        eventTypes: ['notification/show'],
        evaluate: (event) => {
          const payload = event.payload as { type?: string };
          if (payload?.type === 'error') {
            return { verdict: 'deny' as const, reason: 'Error notifications disabled' };
          }
          return { verdict: 'allow' as const };
        },
      });

      const notification = runtime.modules.notification as NotificationController;
      notification.show({ type: 'info', message: 'Allowed' });
      notification.show({ type: 'error', message: 'Blocked' });
      expect(notification.count()).toBe(1); // only info got through
      expect(notification.getAll()[0].message).toBe('Allowed');
    });
  });
});
