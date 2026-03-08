import { describe, it, expect } from 'vitest';
import { createInteractionRuntime } from './runtime';
import { createPageModule } from './modules/page-module';
import { createModalModule, type ModalController } from './modules/modal-module';
import { createDrawerModule, type DrawerController } from './modules/drawer-module';
import { createNotificationModule, type NotificationController } from './modules/notification-module';
import { createFormModule, type FormController } from './modules/form-module';
import { createAsyncModule, type AsyncController } from './modules/async-module';
import { createInteractionDSL, type InteractionDSL } from './interaction-dsl';

function setup() {
  const runtime = createInteractionRuntime({
    modules: [
      createPageModule(),
      createModalModule(),
      createDrawerModule(),
      createNotificationModule({ maxNotifications: 20 }),
      createFormModule(),
      createAsyncModule(),
    ],
  });
  const ui = createInteractionDSL(runtime);
  return { runtime, ui };
}

describe('Interaction DSL', () => {
  // ── basic ───────────────────────────────────────────────────────────

  describe('basic', () => {
    it('createInteractionDSL returns DSL object', () => {
      const { ui } = setup();
      expect(ui).toBeDefined();
      expect(ui.modal).toBeDefined();
      expect(ui.confirm).toBeTypeOf('function');
      expect(ui.drawer).toBeDefined();
      expect(ui.notify).toBeDefined();
      expect(ui.form).toBeDefined();
      expect(ui.async).toBeDefined();
    });
  });

  // ── modal ───────────────────────────────────────────────────────────

  describe('modal', () => {
    it('ui.modal.open delegates to ModalController', () => {
      const { runtime, ui } = setup();
      ui.modal.open('confirm');
      const modal = runtime.modules.modal as ModalController;
      expect(modal.isOpen('confirm')).toBe(true);
    });

    it('ui.modal.close delegates to ModalController', () => {
      const { runtime, ui } = setup();
      ui.modal.open('confirm');
      ui.modal.close('confirm');
      const modal = runtime.modules.modal as ModalController;
      expect(modal.isOpen('confirm')).toBe(false);
    });

    it('ui.modal.closeAll delegates', () => {
      const { runtime, ui } = setup();
      ui.modal.open('a');
      ui.modal.open('b');
      ui.modal.closeAll();
      const modal = runtime.modules.modal as ModalController;
      expect(modal.getStack()).toEqual([]);
    });

    it('ui.modal.isOpen delegates', () => {
      const { ui } = setup();
      expect(ui.modal.isOpen('test')).toBe(false);
      ui.modal.open('test');
      expect(ui.modal.isOpen('test')).toBe(true);
    });
  });

  // ── confirm ─────────────────────────────────────────────────────────

  describe('confirm', () => {
    it('ui.confirm resolves true on close', async () => {
      const { ui } = setup();
      const promise = ui.confirm('dialog');

      // Modal should now be open
      expect(ui.modal.isOpen('dialog')).toBe(true);

      // Close the specific modal
      ui.modal.close('dialog');

      const result = await promise;
      expect(result).toBe(true);
    });

    it('ui.confirm resolves false on closeAll', async () => {
      const { ui } = setup();
      const promise = ui.confirm('dialog');

      expect(ui.modal.isOpen('dialog')).toBe(true);

      ui.modal.closeAll();

      const result = await promise;
      expect(result).toBe(false);
    });
  });

  // ── drawer ──────────────────────────────────────────────────────────

  describe('drawer', () => {
    it('ui.drawer.open delegates to DrawerController', () => {
      const { runtime, ui } = setup();
      ui.drawer.open('sidebar', 'left');
      const drawer = runtime.modules.drawer as DrawerController;
      expect(drawer.isOpen('sidebar')).toBe(true);
      expect(drawer.getAnchor('sidebar')).toBe('left');
    });

    it('ui.drawer.close delegates', () => {
      const { ui } = setup();
      ui.drawer.open('sidebar');
      ui.drawer.close('sidebar');
      expect(ui.drawer.isOpen('sidebar')).toBe(false);
    });

    it('ui.drawer.closeAll delegates', () => {
      const { ui } = setup();
      ui.drawer.open('a');
      ui.drawer.open('b');
      ui.drawer.closeAll();
      expect(ui.drawer.isOpen('a')).toBe(false);
      expect(ui.drawer.isOpen('b')).toBe(false);
    });

    it('ui.drawer.isOpen delegates', () => {
      const { ui } = setup();
      expect(ui.drawer.isOpen('panel')).toBe(false);
      ui.drawer.open('panel');
      expect(ui.drawer.isOpen('panel')).toBe(true);
    });
  });

  // ── notify ──────────────────────────────────────────────────────────

  describe('notify', () => {
    it('ui.notify.info dispatches notification', () => {
      const { runtime, ui } = setup();
      const id = ui.notify.info('Hello');
      expect(id).toBeTruthy();
      const notif = runtime.modules.notification as NotificationController;
      const entry = notif.getById(id);
      expect(entry?.type).toBe('info');
      expect(entry?.message).toBe('Hello');
    });

    it('ui.notify.success dispatches notification', () => {
      const { runtime, ui } = setup();
      const id = ui.notify.success('Saved');
      const notif = runtime.modules.notification as NotificationController;
      expect(notif.getById(id)?.type).toBe('success');
    });

    it('ui.notify.warning dispatches notification', () => {
      const { runtime, ui } = setup();
      const id = ui.notify.warning('Caution');
      const notif = runtime.modules.notification as NotificationController;
      expect(notif.getById(id)?.type).toBe('warning');
    });

    it('ui.notify.error dispatches notification', () => {
      const { runtime, ui } = setup();
      const id = ui.notify.error('Failed');
      const notif = runtime.modules.notification as NotificationController;
      expect(notif.getById(id)?.type).toBe('error');
    });

    it('ui.notify.dismiss delegates', () => {
      const { runtime, ui } = setup();
      const id = ui.notify.info('temp');
      ui.notify.dismiss(id);
      const notif = runtime.modules.notification as NotificationController;
      expect(notif.getById(id)).toBeUndefined();
    });

    it('ui.notify.dismissAll delegates', () => {
      const { runtime, ui } = setup();
      ui.notify.info('a');
      ui.notify.info('b');
      ui.notify.dismissAll();
      const notif = runtime.modules.notification as NotificationController;
      expect(notif.count()).toBe(0);
    });

    it('ui.notify with autoDismissMs option', () => {
      const { runtime, ui } = setup();
      const id = ui.notify.info('auto', { autoDismissMs: 3000 });
      const notif = runtime.modules.notification as NotificationController;
      expect(notif.getById(id)?.autoDismissMs).toBe(3000);
    });
  });

  // ── form ────────────────────────────────────────────────────────────

  describe('form', () => {
    it('ui.form.register delegates', () => {
      const { runtime, ui } = setup();
      ui.form.register('email', 'test@example.com');
      const form = runtime.modules.form as FormController;
      expect(form.getField('email')?.value).toBe('test@example.com');
    });

    it('ui.form.set delegates', () => {
      const { ui } = setup();
      ui.form.register('name');
      ui.form.set('name', 'Alice');
      expect(ui.form.values()).toEqual({ name: 'Alice' });
    });

    it('ui.form.validate delegates', () => {
      const { ui } = setup();
      ui.form.register('email');
      const isValid = ui.form.validate((fields) => ({
        email: fields.email?.value === '' ? 'Required' : null,
      }));
      expect(isValid).toBe(false);
      expect(ui.form.errors().email).toBe('Required');
    });

    it('ui.form.submit/submitDone/submitFail delegates', () => {
      const { runtime, ui } = setup();
      ui.form.submit();
      expect(runtime.getState().formIsSubmitting).toBe(true);

      ui.form.submitDone();
      expect(runtime.getState().formIsSubmitting).toBe(false);
      expect(runtime.getState().formSubmitCount).toBe(1);
    });

    it('ui.form.reset delegates', () => {
      const { ui } = setup();
      ui.form.register('name', 'default');
      ui.form.set('name', 'changed');
      ui.form.reset();
      expect(ui.form.values()).toEqual({ name: 'default' });
    });

    it('ui.form.values/errors/isValid/isDirty delegates', () => {
      const { ui } = setup();
      ui.form.register('email', '');
      expect(ui.form.values()).toEqual({ email: '' });
      expect(ui.form.errors()).toEqual({ email: null });
      expect(ui.form.isValid()).toBe(true);
      expect(ui.form.isDirty()).toBe(false);

      ui.form.set('email', 'test');
      expect(ui.form.isDirty()).toBe(true);
    });
  });

  // ── async ───────────────────────────────────────────────────────────

  describe('async', () => {
    it('ui.async.start delegates', () => {
      const { runtime, ui } = setup();
      ui.async.start('fetchUsers');
      const async = runtime.modules.async as AsyncController;
      expect(async.getStatus('fetchUsers')).toBe('loading');
    });

    it('ui.async.done delegates', () => {
      const { runtime, ui } = setup();
      ui.async.start('op');
      ui.async.done('op', { result: 42 });
      const async = runtime.modules.async as AsyncController;
      expect(async.getStatus('op')).toBe('success');
      expect(async.getOperation('op')?.data).toEqual({ result: 42 });
    });

    it('ui.async.fail delegates', () => {
      const { runtime, ui } = setup();
      ui.async.start('op');
      ui.async.fail('op', 'Timeout');
      const async = runtime.modules.async as AsyncController;
      expect(async.getStatus('op')).toBe('error');
      expect(async.getOperation('op')?.error).toBe('Timeout');
    });

    it('ui.async.reset delegates', () => {
      const { runtime, ui } = setup();
      ui.async.start('op');
      ui.async.done('op');
      ui.async.reset('op');
      const async = runtime.modules.async as AsyncController;
      expect(async.getOperation('op')).toBeUndefined();
    });

    it('ui.async.isLoading delegates', () => {
      const { ui } = setup();
      expect(ui.async.isLoading('op')).toBe(false);
      ui.async.start('op');
      expect(ui.async.isLoading('op')).toBe(true);
    });

    it('ui.async.isAnyLoading delegates', () => {
      const { ui } = setup();
      expect(ui.async.isAnyLoading()).toBe(false);
      ui.async.start('a');
      expect(ui.async.isAnyLoading()).toBe(true);
      ui.async.done('a');
      expect(ui.async.isAnyLoading()).toBe(false);
    });
  });

  // ── isolation ───────────────────────────────────────────────────────

  describe('isolation', () => {
    it('has no React/DOM imports', async () => {
      const fs = await import('node:fs');
      const path = await import('node:path');
      const filePath = path.resolve(__dirname, 'interaction-dsl.ts');
      const source = fs.readFileSync(filePath, 'utf-8');

      expect(source).not.toMatch(/from ['"]react['"]/);
      expect(source).not.toMatch(/from ['"]react-dom['"]/);
      expect(source).not.toMatch(/document\./);
      expect(source).not.toMatch(/window\./);
    });
  });
});
