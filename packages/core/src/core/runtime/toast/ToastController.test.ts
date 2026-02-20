import { describe, it, expect, vi } from 'vitest';
import { createToastController } from './ToastController';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createController() {
  return createToastController();
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ToastController', () => {
  // ---- Creation ----

  it('creates a controller with empty toast list', () => {
    const c = createController();
    expect(c.getToasts()).toEqual([]);
  });

  // ---- show / hide ----

  it('show() adds a toast and returns an id', () => {
    const c = createController();
    const id = c.show({ title: 'Hello' });
    expect(typeof id).toBe('string');
    expect(c.getToasts()).toHaveLength(1);
    expect(c.getToasts()[0].options.title).toBe('Hello');
  });

  it('show() sets default duration=4000 and dismissible=true', () => {
    const c = createController();
    c.show({ title: 'Test' });
    const toast = c.getToasts()[0];
    expect(toast.options.duration).toBe(4000);
    expect(toast.options.dismissible).toBe(true);
  });

  it('show() preserves custom options', () => {
    const c = createController();
    c.show({ title: 'Custom', duration: 8000, dismissible: false, severity: 'error' });
    const toast = c.getToasts()[0];
    expect(toast.options.duration).toBe(8000);
    expect(toast.options.dismissible).toBe(false);
    expect(toast.options.severity).toBe('error');
  });

  it('show() sets createdAt timestamp', () => {
    const c = createController();
    const before = Date.now();
    c.show({ title: 'Timed' });
    const after = Date.now();
    const toast = c.getToasts()[0];
    expect(toast.createdAt).toBeGreaterThanOrEqual(before);
    expect(toast.createdAt).toBeLessThanOrEqual(after);
  });

  it('hide() removes a toast by id', () => {
    const c = createController();
    const id = c.show({ title: 'Remove me' });
    expect(c.getToasts()).toHaveLength(1);
    c.hide(id);
    expect(c.getToasts()).toHaveLength(0);
  });

  it('hide() calls onClose callback', () => {
    const onClose = vi.fn();
    const c = createController();
    const id = c.show({ title: 'Close', onClose });
    c.hide(id);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('hide() does nothing for unknown id', () => {
    const c = createController();
    c.show({ title: 'Stay' });
    c.hide('nonexistent');
    expect(c.getToasts()).toHaveLength(1);
  });

  it('hideAll() removes all toasts', () => {
    const c = createController();
    c.show({ title: 'A' });
    c.show({ title: 'B' });
    c.show({ title: 'C' });
    expect(c.getToasts()).toHaveLength(3);
    c.hideAll();
    expect(c.getToasts()).toHaveLength(0);
  });

  it('hideAll() calls onClose for each toast', () => {
    const onClose1 = vi.fn();
    const onClose2 = vi.fn();
    const c = createController();
    c.show({ title: 'A', onClose: onClose1 });
    c.show({ title: 'B', onClose: onClose2 });
    c.hideAll();
    expect(onClose1).toHaveBeenCalledTimes(1);
    expect(onClose2).toHaveBeenCalledTimes(1);
  });

  it('hideAll() does nothing when empty', () => {
    const listener = vi.fn();
    const c = createController();
    c.subscribe(listener);
    c.hideAll();
    expect(listener).not.toHaveBeenCalled();
  });

  // ---- Shorthand methods ----

  it('success() creates a toast with severity=success', () => {
    const c = createController();
    c.success('Done');
    const toast = c.getToasts()[0];
    expect(toast.options.title).toBe('Done');
    expect(toast.options.severity).toBe('success');
  });

  it('error() creates a toast with severity=error', () => {
    const c = createController();
    c.error('Failed');
    expect(c.getToasts()[0].options.severity).toBe('error');
  });

  it('warning() creates a toast with severity=warning', () => {
    const c = createController();
    c.warning('Careful');
    expect(c.getToasts()[0].options.severity).toBe('warning');
  });

  it('info() creates a toast with severity=info', () => {
    const c = createController();
    c.info('FYI');
    expect(c.getToasts()[0].options.severity).toBe('info');
  });

  it('shorthand methods merge extra options', () => {
    const c = createController();
    c.success('OK', { description: 'All good', duration: 2000 });
    const toast = c.getToasts()[0];
    expect(toast.options.description).toBe('All good');
    expect(toast.options.duration).toBe(2000);
    expect(toast.options.severity).toBe('success');
  });

  // ---- update ----

  it('update() modifies an existing toast', () => {
    const c = createController();
    const id = c.show({ title: 'Original' });
    c.update(id, { title: 'Updated', severity: 'success' });
    const toast = c.getToasts()[0];
    expect(toast.options.title).toBe('Updated');
    expect(toast.options.severity).toBe('success');
  });

  it('update() does nothing for unknown id', () => {
    const c = createController();
    c.show({ title: 'Stay' });
    c.update('nonexistent', { title: 'Nope' });
    expect(c.getToasts()[0].options.title).toBe('Stay');
  });

  // ---- subscribe ----

  it('subscribe() notifies on show', () => {
    const listener = vi.fn();
    const c = createController();
    c.subscribe(listener);
    c.show({ title: 'New' });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ options: expect.objectContaining({ title: 'New' }) }),
      ]),
    );
  });

  it('subscribe() notifies on hide', () => {
    const listener = vi.fn();
    const c = createController();
    const id = c.show({ title: 'Remove' });
    c.subscribe(listener);
    c.hide(id);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith([]);
  });

  it('subscribe() notifies on update', () => {
    const listener = vi.fn();
    const c = createController();
    const id = c.show({ title: 'Before' });
    c.subscribe(listener);
    c.update(id, { title: 'After' });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('unsubscribe stops notifications', () => {
    const listener = vi.fn();
    const c = createController();
    const unsub = c.subscribe(listener);
    unsub();
    c.show({ title: 'Silent' });
    expect(listener).not.toHaveBeenCalled();
  });

  it('multiple subscribers all notified', () => {
    const l1 = vi.fn();
    const l2 = vi.fn();
    const c = createController();
    c.subscribe(l1);
    c.subscribe(l2);
    c.show({ title: 'Both' });
    expect(l1).toHaveBeenCalledTimes(1);
    expect(l2).toHaveBeenCalledTimes(1);
  });

  // ---- promise ----

  it('promise() starts in loading state', () => {
    const c = createController();
    const p = new Promise<string>(() => { }); // never resolves
    c.promise(p, {
      loading: { title: 'Loading...' },
      success: { title: 'Done' },
      error: { title: 'Failed' },
    });
    const toast = c.getToasts()[0];
    expect(toast.promiseState).toBe('loading');
    expect(toast.loading).toBe(true);
    expect(toast.options.title).toBe('Loading...');
    expect(toast.options.severity).toBe('info'); // white bg with neutral icon
    expect(toast.options.duration).toBe(0); // no auto-dismiss during loading
    expect(toast.options.dismissible).toBe(false);
  });

  it('promise() transitions to success on resolve', async () => {
    const c = createController();
    const listener = vi.fn();
    c.subscribe(listener);

    let resolve!: (val: string) => void;
    const p = new Promise<string>((r) => { resolve = r; });

    c.promise(p, {
      loading: { title: 'Loading...' },
      success: { title: 'Done!' },
      error: { title: 'Failed' },
    });

    resolve('ok');
    await p;
    // Wait for microtask
    await new Promise((r) => setTimeout(r, 0));

    const toast = c.getToasts()[0];
    expect(toast.promiseState).toBe('success');
    expect(toast.loading).toBe(false);
    expect(toast.options.title).toBe('Done!');
    expect(toast.options.severity).toBe('success');
    expect(toast.options.duration).toBe(4000);
    expect(toast.options.dismissible).toBe(true);
  });

  it('promise() transitions to error on reject', async () => {
    const c = createController();

    let reject!: (err: Error) => void;
    const p = new Promise<string>((_, r) => { reject = r; });

    c.promise(p, {
      loading: { title: 'Loading...' },
      success: { title: 'Done!' },
      error: { title: 'Oops' },
    });

    reject(new Error('fail'));
    try { await p; } catch { /* expected */ }
    await new Promise((r) => setTimeout(r, 0));

    const toast = c.getToasts()[0];
    expect(toast.promiseState).toBe('error');
    expect(toast.loading).toBe(false);
    expect(toast.options.title).toBe('Oops');
    expect(toast.options.severity).toBe('error');
  });

  it('promise() supports function-based success/error options', async () => {
    const c = createController();

    let resolve!: (val: string) => void;
    const p = new Promise<string>((r) => { resolve = r; });

    c.promise(p, {
      loading: { title: 'Loading...' },
      success: (data) => ({ title: `Got: ${data}` }),
      error: (err) => ({ title: `Error: ${(err as Error).message}` }),
    });

    resolve('hello');
    await p;
    await new Promise((r) => setTimeout(r, 0));

    expect(c.getToasts()[0].options.title).toBe('Got: hello');
  });

  it('promise() accepts a function that returns a promise', async () => {
    const c = createController();

    c.promise(
      () => Promise.resolve('data'),
      {
        loading: { title: 'Loading...' },
        success: { title: 'Done' },
        error: { title: 'Failed' },
      },
    );

    await new Promise((r) => setTimeout(r, 10));

    const toast = c.getToasts()[0];
    expect(toast.promiseState).toBe('success');
    expect(toast.options.title).toBe('Done');
  });

  it('promise() uses custom duration for success/error', async () => {
    const c = createController();

    c.promise(
      () => Promise.resolve('ok'),
      {
        loading: { title: 'Loading...' },
        success: { title: 'Done' },
        error: { title: 'Failed' },
        duration: 8000,
      },
    );

    await new Promise((r) => setTimeout(r, 10));

    expect(c.getToasts()[0].options.duration).toBe(8000);
  });

  // ---- Multiple toasts ----

  it('maintains multiple toasts in order', () => {
    const c = createController();
    c.show({ title: 'First' });
    c.show({ title: 'Second' });
    c.show({ title: 'Third' });
    const toasts = c.getToasts();
    expect(toasts).toHaveLength(3);
    expect(toasts[0].options.title).toBe('First');
    expect(toasts[1].options.title).toBe('Second');
    expect(toasts[2].options.title).toBe('Third');
  });

  it('each toast gets a unique id', () => {
    const c = createController();
    const id1 = c.show({ title: 'A' });
    const id2 = c.show({ title: 'B' });
    const id3 = c.show({ title: 'C' });
    expect(new Set([id1, id2, id3]).size).toBe(3);
  });
});
