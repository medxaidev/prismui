import { describe, expect, it, vi } from 'vitest';
import { createPopoverController } from './PopoverController';

// ---------------------------------------------------------------------------
// PopoverController — creation
// ---------------------------------------------------------------------------

describe('PopoverController — creation', () => {
  it('creates a controller with all methods', () => {
    const controller = createPopoverController();
    expect(typeof controller.open).toBe('function');
    expect(typeof controller.close).toBe('function');
    expect(typeof controller.closeAll).toBe('function');
    expect(typeof controller.getPopovers).toBe('function');
    expect(typeof controller.subscribe).toBe('function');
  });

  it('starts with no popovers', () => {
    const controller = createPopoverController();
    expect(controller.getPopovers()).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// PopoverController — open / close
// ---------------------------------------------------------------------------

describe('PopoverController — open / close', () => {
  it('open() returns a unique id', () => {
    const controller = createPopoverController();
    const target = document.createElement('button');
    const id = controller.open({ target, content: 'Hello' });
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('open() adds a popover to the list', () => {
    const controller = createPopoverController();
    const target = document.createElement('button');
    controller.open({ target, content: 'Hello' });
    expect(controller.getPopovers()).toHaveLength(1);
  });

  it('open() generates unique IDs', () => {
    const controller = createPopoverController();
    const target = document.createElement('button');
    const id1 = controller.open({ target, content: 'A' });
    const id2 = controller.open({ target, content: 'B' });
    expect(id1).not.toBe(id2);
  });

  it('close() removes a popover by id', () => {
    const controller = createPopoverController();
    const target = document.createElement('button');
    const id = controller.open({ target, content: 'Hello' });
    expect(controller.getPopovers()).toHaveLength(1);
    controller.close(id);
    expect(controller.getPopovers()).toHaveLength(0);
  });

  it('close() is a no-op for unknown id', () => {
    const controller = createPopoverController();
    const target = document.createElement('button');
    controller.open({ target, content: 'Hello' });
    controller.close('unknown-id');
    expect(controller.getPopovers()).toHaveLength(1);
  });

  it('closeAll() removes all popovers', () => {
    const controller = createPopoverController();
    const target = document.createElement('button');
    controller.open({ target, content: 'A' });
    controller.open({ target, content: 'B' });
    controller.open({ target, content: 'C' });
    expect(controller.getPopovers()).toHaveLength(3);
    controller.closeAll();
    expect(controller.getPopovers()).toHaveLength(0);
  });

  it('closeAll() is a no-op when empty', () => {
    const controller = createPopoverController();
    // Should not throw
    controller.closeAll();
    expect(controller.getPopovers()).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// PopoverController — subscribe
// ---------------------------------------------------------------------------

describe('PopoverController — subscribe', () => {
  it('notifies listener on open', () => {
    const controller = createPopoverController();
    const listener = vi.fn();
    controller.subscribe(listener);

    const target = document.createElement('button');
    controller.open({ target, content: 'Hello' });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ options: expect.objectContaining({ content: 'Hello' }) }),
      ]),
    );
  });

  it('notifies listener on close', () => {
    const controller = createPopoverController();
    const listener = vi.fn();

    const target = document.createElement('button');
    const id = controller.open({ target, content: 'Hello' });

    controller.subscribe(listener);
    controller.close(id);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith([]);
  });

  it('notifies listener on closeAll', () => {
    const controller = createPopoverController();
    const listener = vi.fn();

    const target = document.createElement('button');
    controller.open({ target, content: 'A' });
    controller.open({ target, content: 'B' });

    controller.subscribe(listener);
    controller.closeAll();

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith([]);
  });

  it('unsubscribe stops notifications', () => {
    const controller = createPopoverController();
    const listener = vi.fn();
    const unsubscribe = controller.subscribe(listener);

    const target = document.createElement('button');
    controller.open({ target, content: 'A' });
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    controller.open({ target, content: 'B' });
    expect(listener).toHaveBeenCalledTimes(1); // no new call
  });
});

// ---------------------------------------------------------------------------
// PopoverController — options preservation
// ---------------------------------------------------------------------------

describe('PopoverController — options preservation', () => {
  it('preserves all options on the instance', () => {
    const controller = createPopoverController();
    const target = document.createElement('button');
    const id = controller.open({
      target,
      content: 'Hello',
      position: 'top-start',
      withArrow: true,
      offset: 12,
      closeOnClickOutside: false,
      closeOnEscape: false,
      width: 300,
      className: 'custom',
    });

    const instance = controller.getPopovers().find((p) => p.id === id);
    expect(instance).toBeDefined();
    expect(instance!.options.position).toBe('top-start');
    expect(instance!.options.withArrow).toBe(true);
    expect(instance!.options.offset).toBe(12);
    expect(instance!.options.closeOnClickOutside).toBe(false);
    expect(instance!.options.closeOnEscape).toBe(false);
    expect(instance!.options.width).toBe(300);
    expect(instance!.options.className).toBe('custom');
  });

  it('getPopovers returns a snapshot (not live reference)', () => {
    const controller = createPopoverController();
    const target = document.createElement('button');
    const snapshot1 = controller.getPopovers();
    controller.open({ target, content: 'A' });
    const snapshot2 = controller.getPopovers();
    expect(snapshot1).toHaveLength(0);
    expect(snapshot2).toHaveLength(1);
  });
});
