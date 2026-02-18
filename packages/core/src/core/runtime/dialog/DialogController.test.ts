import { describe, expect, it, vi } from 'vitest';
import { createDialogController } from './DialogController';
import type { DialogController } from './types';

// ---------------------------------------------------------------------------
// createDialogController — basics
// ---------------------------------------------------------------------------

describe('createDialogController', () => {
  it('creates a controller instance', () => {
    const controller = createDialogController();
    expect(controller).toBeDefined();
    expect(typeof controller.open).toBe('function');
    expect(typeof controller.close).toBe('function');
    expect(typeof controller.closeAll).toBe('function');
    expect(typeof controller.confirm).toBe('function');
    expect(typeof controller.alert).toBe('function');
    expect(typeof controller.getDialogs).toBe('function');
    expect(typeof controller.subscribe).toBe('function');
  });

  it('starts with no dialogs', () => {
    const controller = createDialogController();
    expect(controller.getDialogs()).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// open / close
// ---------------------------------------------------------------------------

describe('open / close', () => {
  let controller: DialogController;

  it('opens a dialog and returns an id', () => {
    controller = createDialogController();
    const id = controller.open({ title: 'Test' });
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
    expect(controller.getDialogs()).toHaveLength(1);
    expect(controller.getDialogs()[0].id).toBe(id);
    expect(controller.getDialogs()[0].options.title).toBe('Test');
  });

  it('opens multiple dialogs', () => {
    controller = createDialogController();
    controller.open({ title: 'A' });
    controller.open({ title: 'B' });
    controller.open({ title: 'C' });
    expect(controller.getDialogs()).toHaveLength(3);
  });

  it('generates unique ids', () => {
    controller = createDialogController();
    const id1 = controller.open({ title: 'A' });
    const id2 = controller.open({ title: 'B' });
    expect(id1).not.toBe(id2);
  });

  it('closes a dialog by id', () => {
    controller = createDialogController();
    const id = controller.open({ title: 'Test' });
    expect(controller.getDialogs()).toHaveLength(1);
    controller.close(id);
    expect(controller.getDialogs()).toHaveLength(0);
  });

  it('close is a no-op for unknown id', () => {
    controller = createDialogController();
    controller.open({ title: 'Test' });
    controller.close('nonexistent');
    expect(controller.getDialogs()).toHaveLength(1);
  });

  it('closeAll removes all dialogs', () => {
    controller = createDialogController();
    controller.open({ title: 'A' });
    controller.open({ title: 'B' });
    controller.open({ title: 'C' });
    expect(controller.getDialogs()).toHaveLength(3);
    controller.closeAll();
    expect(controller.getDialogs()).toHaveLength(0);
  });

  it('closeAll is a no-op when empty', () => {
    controller = createDialogController();
    expect(() => controller.closeAll()).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// subscribe
// ---------------------------------------------------------------------------

describe('subscribe', () => {
  it('notifies listener on open', () => {
    const controller = createDialogController();
    const listener = vi.fn();
    controller.subscribe(listener);

    controller.open({ title: 'Test' });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith([
      expect.objectContaining({ options: { title: 'Test' } }),
    ]);
  });

  it('notifies listener on close', () => {
    const controller = createDialogController();
    const listener = vi.fn();

    const id = controller.open({ title: 'Test' });
    controller.subscribe(listener);
    controller.close(id);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith([]);
  });

  it('notifies listener on closeAll', () => {
    const controller = createDialogController();
    const listener = vi.fn();

    controller.open({ title: 'A' });
    controller.open({ title: 'B' });
    controller.subscribe(listener);
    controller.closeAll();

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith([]);
  });

  it('does not notify after unsubscribe', () => {
    const controller = createDialogController();
    const listener = vi.fn();
    const unsubscribe = controller.subscribe(listener);

    controller.open({ title: 'A' });
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    controller.open({ title: 'B' });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('does not notify on close of unknown id', () => {
    const controller = createDialogController();
    const listener = vi.fn();
    controller.subscribe(listener);

    controller.close('nonexistent');
    expect(listener).not.toHaveBeenCalled();
  });

  it('does not notify on closeAll when empty', () => {
    const controller = createDialogController();
    const listener = vi.fn();
    controller.subscribe(listener);

    controller.closeAll();
    expect(listener).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// confirm
// ---------------------------------------------------------------------------

describe('confirm', () => {
  it('resolves true when onConfirm is called', async () => {
    const controller = createDialogController();
    const promise = controller.confirm({ title: 'Sure?' });

    // Simulate user confirming
    const dialogs = controller.getDialogs();
    expect(dialogs).toHaveLength(1);
    await dialogs[0].options.onConfirm?.();

    const result = await promise;
    expect(result).toBe(true);
    expect(controller.getDialogs()).toHaveLength(0);
  });

  it('resolves false when onCancel is called', async () => {
    const controller = createDialogController();
    const promise = controller.confirm({ title: 'Sure?' });

    const dialogs = controller.getDialogs();
    dialogs[0].options.onCancel?.();

    const result = await promise;
    expect(result).toBe(false);
    expect(controller.getDialogs()).toHaveLength(0);
  });

  it('calls original onConfirm callback', async () => {
    const controller = createDialogController();
    const onConfirm = vi.fn();
    const promise = controller.confirm({ title: 'Sure?', onConfirm });

    const dialogs = controller.getDialogs();
    await dialogs[0].options.onConfirm?.();

    await promise;
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls original onCancel callback', async () => {
    const controller = createDialogController();
    const onCancel = vi.fn();
    const promise = controller.confirm({ title: 'Sure?', onCancel });

    const dialogs = controller.getDialogs();
    dialogs[0].options.onCancel?.();

    await promise;
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('preserves other options', () => {
    const controller = createDialogController();
    controller.confirm({ title: 'Sure?', confirmText: 'Yes', cancelText: 'No', size: 500 });

    const dialogs = controller.getDialogs();
    expect(dialogs[0].options.title).toBe('Sure?');
    expect(dialogs[0].options.confirmText).toBe('Yes');
    expect(dialogs[0].options.cancelText).toBe('No');
    expect(dialogs[0].options.size).toBe(500);
  });
});

// ---------------------------------------------------------------------------
// alert
// ---------------------------------------------------------------------------

describe('alert', () => {
  it('resolves when onConfirm is called', async () => {
    const controller = createDialogController();
    const promise = controller.alert({ title: 'Notice' });

    const dialogs = controller.getDialogs();
    expect(dialogs).toHaveLength(1);
    await dialogs[0].options.onConfirm?.();

    await promise;
    expect(controller.getDialogs()).toHaveLength(0);
  });

  it('calls original onConfirm callback', async () => {
    const controller = createDialogController();
    const onConfirm = vi.fn();
    const promise = controller.alert({ title: 'Notice', onConfirm });

    const dialogs = controller.getDialogs();
    await dialogs[0].options.onConfirm?.();

    await promise;
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('does not have onCancel', () => {
    const controller = createDialogController();
    controller.alert({ title: 'Notice' });

    const dialogs = controller.getDialogs();
    expect(dialogs[0].options.onCancel).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// getDialogs snapshot
// ---------------------------------------------------------------------------

describe('getDialogs', () => {
  it('returns a new array each time', () => {
    const controller = createDialogController();
    controller.open({ title: 'A' });
    const snap1 = controller.getDialogs();
    const snap2 = controller.getDialogs();
    expect(snap1).not.toBe(snap2);
    expect(snap1).toEqual(snap2);
  });
});
