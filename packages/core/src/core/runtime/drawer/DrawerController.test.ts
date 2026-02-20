import { describe, expect, it, vi } from 'vitest';
import { createDrawerController } from './DrawerController';
import type { DrawerController } from './types';

// ---------------------------------------------------------------------------
// createDrawerController — basics
// ---------------------------------------------------------------------------

describe('createDrawerController', () => {
  it('creates a controller instance', () => {
    const controller = createDrawerController();
    expect(controller).toBeDefined();
    expect(typeof controller.open).toBe('function');
    expect(typeof controller.close).toBe('function');
    expect(typeof controller.closeAll).toBe('function');
    expect(typeof controller.getDrawers).toBe('function');
    expect(typeof controller.subscribe).toBe('function');
  });

  it('starts with no drawers', () => {
    const controller = createDrawerController();
    expect(controller.getDrawers()).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// open / close
// ---------------------------------------------------------------------------

describe('open / close', () => {
  let controller: DrawerController;

  it('opens a drawer and returns an id', () => {
    controller = createDrawerController();
    const id = controller.open({ title: 'Settings' });
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
    expect(controller.getDrawers()).toHaveLength(1);
    expect(controller.getDrawers()[0].id).toBe(id);
    expect(controller.getDrawers()[0].options.title).toBe('Settings');
  });

  it('opens multiple drawers', () => {
    controller = createDrawerController();
    controller.open({ title: 'A' });
    controller.open({ title: 'B' });
    controller.open({ title: 'C' });
    expect(controller.getDrawers()).toHaveLength(3);
  });

  it('generates unique ids', () => {
    controller = createDrawerController();
    const id1 = controller.open({ title: 'A' });
    const id2 = controller.open({ title: 'B' });
    expect(id1).not.toBe(id2);
  });

  it('closes a drawer by id', () => {
    controller = createDrawerController();
    const id = controller.open({ title: 'Settings' });
    expect(controller.getDrawers()).toHaveLength(1);
    controller.close(id);
    expect(controller.getDrawers()).toHaveLength(0);
  });

  it('close is a no-op for unknown id', () => {
    controller = createDrawerController();
    controller.open({ title: 'Settings' });
    controller.close('nonexistent');
    expect(controller.getDrawers()).toHaveLength(1);
  });

  it('closeAll removes all drawers', () => {
    controller = createDrawerController();
    controller.open({ title: 'A' });
    controller.open({ title: 'B' });
    controller.open({ title: 'C' });
    expect(controller.getDrawers()).toHaveLength(3);
    controller.closeAll();
    expect(controller.getDrawers()).toHaveLength(0);
  });

  it('closeAll is a no-op when empty', () => {
    controller = createDrawerController();
    expect(() => controller.closeAll()).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// subscribe
// ---------------------------------------------------------------------------

describe('subscribe', () => {
  it('notifies listener on open', () => {
    const controller = createDrawerController();
    const listener = vi.fn();
    controller.subscribe(listener);

    controller.open({ title: 'Settings' });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith([
      expect.objectContaining({ options: { title: 'Settings' } }),
    ]);
  });

  it('notifies listener on close', () => {
    const controller = createDrawerController();
    const listener = vi.fn();

    const id = controller.open({ title: 'Settings' });
    controller.subscribe(listener);
    controller.close(id);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith([]);
  });

  it('notifies listener on closeAll', () => {
    const controller = createDrawerController();
    const listener = vi.fn();

    controller.open({ title: 'A' });
    controller.open({ title: 'B' });
    controller.subscribe(listener);
    controller.closeAll();

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith([]);
  });

  it('does not notify after unsubscribe', () => {
    const controller = createDrawerController();
    const listener = vi.fn();
    const unsubscribe = controller.subscribe(listener);

    controller.open({ title: 'A' });
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    controller.open({ title: 'B' });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('does not notify on close of unknown id', () => {
    const controller = createDrawerController();
    const listener = vi.fn();
    controller.subscribe(listener);

    controller.close('nonexistent');
    expect(listener).not.toHaveBeenCalled();
  });

  it('does not notify on closeAll when empty', () => {
    const controller = createDrawerController();
    const listener = vi.fn();
    controller.subscribe(listener);

    controller.closeAll();
    expect(listener).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// options preservation
// ---------------------------------------------------------------------------

describe('options preservation', () => {
  it('preserves position option', () => {
    const controller = createDrawerController();
    controller.open({ title: 'Left', position: 'left' });

    const drawers = controller.getDrawers();
    expect(drawers[0].options.position).toBe('left');
  });

  it('preserves size option', () => {
    const controller = createDrawerController();
    controller.open({ title: 'Wide', size: 500 });

    const drawers = controller.getDrawers();
    expect(drawers[0].options.size).toBe(500);
  });

  it('preserves all options', () => {
    const controller = createDrawerController();
    const onClose = vi.fn();
    controller.open({
      title: 'Full',
      position: 'bottom',
      size: '50vh',
      closeOnEscape: false,
      closeOnClickOutside: false,
      withCloseButton: false,
      withOverlay: false,
      onClose,
    });

    const drawers = controller.getDrawers();
    const opts = drawers[0].options;
    expect(opts.title).toBe('Full');
    expect(opts.position).toBe('bottom');
    expect(opts.size).toBe('50vh');
    expect(opts.closeOnEscape).toBe(false);
    expect(opts.closeOnClickOutside).toBe(false);
    expect(opts.withCloseButton).toBe(false);
    expect(opts.withOverlay).toBe(false);
    expect(opts.onClose).toBe(onClose);
  });
});

// ---------------------------------------------------------------------------
// getDrawers snapshot
// ---------------------------------------------------------------------------

describe('getDrawers', () => {
  it('returns a new array each time', () => {
    const controller = createDrawerController();
    controller.open({ title: 'A' });
    const snap1 = controller.getDrawers();
    const snap2 = controller.getDrawers();
    expect(snap1).not.toBe(snap2);
    expect(snap1).toEqual(snap2);
  });
});
