import { describe, expect, it, vi, beforeEach } from 'vitest';
import { localStorageColorSchemeManager } from './local-storage-color-scheme-manager';
import type { PrismuiColorSchemeManager } from './types';

// ---------------------------------------------------------------------------
// localStorageColorSchemeManager
// ---------------------------------------------------------------------------

describe('localStorageColorSchemeManager', () => {
  let manager: PrismuiColorSchemeManager;

  beforeEach(() => {
    localStorage.clear();
    manager = localStorageColorSchemeManager();
  });

  // ---- get ----------------------------------------------------------------

  describe('get', () => {
    it('returns defaultValue when localStorage is empty', () => {
      expect(manager.get('light')).toBe('light');
    });

    it('returns stored value when it is a valid color scheme', () => {
      localStorage.setItem('prismui-color-scheme', 'dark');
      expect(manager.get('light')).toBe('dark');
    });

    it('returns "auto" when stored', () => {
      localStorage.setItem('prismui-color-scheme', 'auto');
      expect(manager.get('light')).toBe('auto');
    });

    it('returns defaultValue when stored value is invalid', () => {
      localStorage.setItem('prismui-color-scheme', 'invalid');
      expect(manager.get('light')).toBe('light');
    });

    it('uses custom key', () => {
      const custom = localStorageColorSchemeManager({ key: 'my-key' });
      localStorage.setItem('my-key', 'dark');
      expect(custom.get('light')).toBe('dark');
    });
  });

  // ---- set ----------------------------------------------------------------

  describe('set', () => {
    it('persists value to localStorage', () => {
      manager.set('dark');
      expect(localStorage.getItem('prismui-color-scheme')).toBe('dark');
    });

    it('persists "auto"', () => {
      manager.set('auto');
      expect(localStorage.getItem('prismui-color-scheme')).toBe('auto');
    });

    it('uses custom key', () => {
      const custom = localStorageColorSchemeManager({ key: 'my-key' });
      custom.set('dark');
      expect(localStorage.getItem('my-key')).toBe('dark');
    });
  });

  // ---- subscribe ----------------------------------------------------------

  describe('subscribe', () => {
    it('calls onUpdate when storage event fires for the correct key', () => {
      const onUpdate = vi.fn();
      const unsubscribe = manager.subscribe(onUpdate);

      // Simulate a storage event from another tab
      const event = new StorageEvent('storage', {
        key: 'prismui-color-scheme',
        newValue: 'dark',
        storageArea: localStorage,
      });
      window.dispatchEvent(event);

      expect(onUpdate).toHaveBeenCalledWith('dark');
      unsubscribe();
    });

    it('does not call onUpdate for a different key', () => {
      const onUpdate = vi.fn();
      const unsubscribe = manager.subscribe(onUpdate);

      const event = new StorageEvent('storage', {
        key: 'other-key',
        newValue: 'dark',
        storageArea: localStorage,
      });
      window.dispatchEvent(event);

      expect(onUpdate).not.toHaveBeenCalled();
      unsubscribe();
    });

    it('does not call onUpdate for invalid values', () => {
      const onUpdate = vi.fn();
      const unsubscribe = manager.subscribe(onUpdate);

      const event = new StorageEvent('storage', {
        key: 'prismui-color-scheme',
        newValue: 'invalid',
        storageArea: localStorage,
      });
      window.dispatchEvent(event);

      expect(onUpdate).not.toHaveBeenCalled();
      unsubscribe();
    });

    it('unsubscribe stops listening', () => {
      const onUpdate = vi.fn();
      const unsubscribe = manager.subscribe(onUpdate);
      unsubscribe();

      const event = new StorageEvent('storage', {
        key: 'prismui-color-scheme',
        newValue: 'dark',
        storageArea: localStorage,
      });
      window.dispatchEvent(event);

      expect(onUpdate).not.toHaveBeenCalled();
    });

    it('handles "auto" value in storage event', () => {
      const onUpdate = vi.fn();
      const unsubscribe = manager.subscribe(onUpdate);

      const event = new StorageEvent('storage', {
        key: 'prismui-color-scheme',
        newValue: 'auto',
        storageArea: localStorage,
      });
      window.dispatchEvent(event);

      expect(onUpdate).toHaveBeenCalledWith('auto');
      unsubscribe();
    });
  });
});
