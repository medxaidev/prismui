import { describe, expect, it, vi } from 'vitest';
import { createOverlayManager } from './OverlayManager';
import type { OverlayManager, OverlayInstanceOptions } from './types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeInstance(id: string, overrides?: Partial<OverlayInstanceOptions>): OverlayInstanceOptions {
  return {
    id,
    trapFocus: true,
    closeOnEscape: true,
    lockScroll: true,
    onClose: vi.fn(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// createOverlayManager — basics
// ---------------------------------------------------------------------------

describe('createOverlayManager', () => {
  it('creates a manager instance', () => {
    const manager = createOverlayManager();
    expect(manager).toBeDefined();
    expect(typeof manager.register).toBe('function');
    expect(typeof manager.unregister).toBe('function');
    expect(typeof manager.getStack).toBe('function');
    expect(typeof manager.getActive).toBe('function');
    expect(typeof manager.getZIndex).toBe('function');
    expect(typeof manager.handleEscape).toBe('function');
    expect(typeof manager.shouldLockScroll).toBe('function');
    expect(typeof manager.getStackSize).toBe('function');
  });

  it('starts with empty stack', () => {
    const manager = createOverlayManager();
    expect(manager.getStack()).toEqual([]);
    expect(manager.getActive()).toBeUndefined();
    expect(manager.getStackSize()).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Stack management
// ---------------------------------------------------------------------------

describe('Stack management', () => {
  let manager: OverlayManager;

  it('registers an overlay onto the stack', () => {
    manager = createOverlayManager();
    manager.register(makeInstance('a'));
    expect(manager.getStackSize()).toBe(1);
    expect(manager.getStack()[0].id).toBe('a');
  });

  it('registers multiple overlays in order', () => {
    manager = createOverlayManager();
    manager.register(makeInstance('a'));
    manager.register(makeInstance('b'));
    manager.register(makeInstance('c'));
    expect(manager.getStackSize()).toBe(3);
    expect(manager.getStack().map((i) => i.id)).toEqual(['a', 'b', 'c']);
  });

  it('prevents duplicate registration', () => {
    manager = createOverlayManager();
    manager.register(makeInstance('a'));
    manager.register(makeInstance('a'));
    expect(manager.getStackSize()).toBe(1);
  });

  it('unregisters an overlay by id', () => {
    manager = createOverlayManager();
    manager.register(makeInstance('a'));
    manager.register(makeInstance('b'));
    manager.unregister('a');
    expect(manager.getStackSize()).toBe(1);
    expect(manager.getStack()[0].id).toBe('b');
  });

  it('unregister is a no-op for unknown id', () => {
    manager = createOverlayManager();
    manager.register(makeInstance('a'));
    manager.unregister('nonexistent');
    expect(manager.getStackSize()).toBe(1);
  });

  it('getActive returns the topmost overlay', () => {
    manager = createOverlayManager();
    manager.register(makeInstance('a'));
    manager.register(makeInstance('b'));
    expect(manager.getActive()?.id).toBe('b');
  });

  it('getActive returns undefined for empty stack', () => {
    manager = createOverlayManager();
    expect(manager.getActive()).toBeUndefined();
  });

  it('getStack returns a shallow copy', () => {
    manager = createOverlayManager();
    manager.register(makeInstance('a'));
    const stack1 = manager.getStack();
    const stack2 = manager.getStack();
    expect(stack1).not.toBe(stack2);
    expect(stack1).toEqual(stack2);
  });
});

// ---------------------------------------------------------------------------
// Z-index allocation
// ---------------------------------------------------------------------------

describe('Z-index allocation', () => {
  it('allocates z-index starting from baseZIndex (default 1000)', () => {
    const manager = createOverlayManager();
    manager.register(makeInstance('a'));
    expect(manager.getZIndex('a')).toBe(1000);
  });

  it('allocates z-index with +10 increments', () => {
    const manager = createOverlayManager();
    manager.register(makeInstance('a'));
    manager.register(makeInstance('b'));
    manager.register(makeInstance('c'));
    expect(manager.getZIndex('a')).toBe(1000);
    expect(manager.getZIndex('b')).toBe(1010);
    expect(manager.getZIndex('c')).toBe(1020);
  });

  it('uses custom baseZIndex', () => {
    const manager = createOverlayManager({ baseZIndex: 2000 });
    manager.register(makeInstance('a'));
    manager.register(makeInstance('b'));
    expect(manager.getZIndex('a')).toBe(2000);
    expect(manager.getZIndex('b')).toBe(2010);
  });

  it('returns baseZIndex for unknown id', () => {
    const manager = createOverlayManager();
    expect(manager.getZIndex('nonexistent')).toBe(1000);
  });

  it('re-allocates z-indices after unregister', () => {
    const manager = createOverlayManager();
    manager.register(makeInstance('a'));
    manager.register(makeInstance('b'));
    manager.register(makeInstance('c'));
    manager.unregister('a');
    // b is now index 0, c is index 1
    expect(manager.getZIndex('b')).toBe(1000);
    expect(manager.getZIndex('c')).toBe(1010);
  });
});

// ---------------------------------------------------------------------------
// Escape handling
// ---------------------------------------------------------------------------

describe('Escape handling', () => {
  it('calls onClose on the topmost overlay with closeOnEscape', () => {
    const manager = createOverlayManager();
    const onCloseA = vi.fn();
    const onCloseB = vi.fn();
    manager.register(makeInstance('a', { onClose: onCloseA }));
    manager.register(makeInstance('b', { onClose: onCloseB }));

    manager.handleEscape();

    expect(onCloseB).toHaveBeenCalledTimes(1);
    expect(onCloseA).not.toHaveBeenCalled();
  });

  it('skips overlays with closeOnEscape: false', () => {
    const manager = createOverlayManager();
    const onCloseA = vi.fn();
    const onCloseB = vi.fn();
    manager.register(makeInstance('a', { onClose: onCloseA, closeOnEscape: true }));
    manager.register(makeInstance('b', { onClose: onCloseB, closeOnEscape: false }));

    manager.handleEscape();

    expect(onCloseB).not.toHaveBeenCalled();
    expect(onCloseA).toHaveBeenCalledTimes(1);
  });

  it('does nothing when stack is empty', () => {
    const manager = createOverlayManager();
    expect(() => manager.handleEscape()).not.toThrow();
  });

  it('does nothing when no overlay has closeOnEscape', () => {
    const manager = createOverlayManager();
    const onClose = vi.fn();
    manager.register(makeInstance('a', { onClose, closeOnEscape: false }));

    manager.handleEscape();

    expect(onClose).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Scroll lock coordination
// ---------------------------------------------------------------------------

describe('Scroll lock coordination', () => {
  it('returns false when stack is empty', () => {
    const manager = createOverlayManager();
    expect(manager.shouldLockScroll()).toBe(false);
  });

  it('returns true when any overlay has lockScroll', () => {
    const manager = createOverlayManager();
    manager.register(makeInstance('a', { lockScroll: false }));
    manager.register(makeInstance('b', { lockScroll: true }));
    expect(manager.shouldLockScroll()).toBe(true);
  });

  it('returns false when no overlay has lockScroll', () => {
    const manager = createOverlayManager();
    manager.register(makeInstance('a', { lockScroll: false }));
    manager.register(makeInstance('b', { lockScroll: false }));
    expect(manager.shouldLockScroll()).toBe(false);
  });

  it('updates after unregister', () => {
    const manager = createOverlayManager();
    manager.register(makeInstance('a', { lockScroll: true }));
    expect(manager.shouldLockScroll()).toBe(true);
    manager.unregister('a');
    expect(manager.shouldLockScroll()).toBe(false);
  });
});
