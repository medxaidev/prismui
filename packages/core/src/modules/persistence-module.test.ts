import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createInteractionRuntime } from '../index';
import { createPageModule, type PageController } from './page-module';
import {
  createPersistenceModule,
  type PersistenceController,
  type PersistenceAdapter,
} from './persistence-module';

/** In-memory adapter for testing. */
function createTestAdapter(): PersistenceAdapter & { store: Map<string, string> } {
  const store = new Map<string, string>();
  return {
    store,
    getItem(key: string): string | null {
      return store.get(key) ?? null;
    },
    setItem(key: string, value: string): void {
      store.set(key, value);
    },
    removeItem(key: string): void {
      store.delete(key);
    },
  };
}

function setup(options?: { include?: string[]; debounceMs?: number; preload?: Record<string, unknown> }) {
  const adapter = createTestAdapter();

  // Pre-populate storage if needed
  if (options?.preload) {
    adapter.setItem('prismui-state', JSON.stringify(options.preload));
  }

  const runtime = createInteractionRuntime({
    modules: [
      createPageModule(),
      createPersistenceModule({
        include: options?.include ?? ['currentPage', 'mountedPages'],
        debounceMs: options?.debounceMs ?? 0, // immediate for tests
        adapter,
      }),
    ],
  });
  const persistence = runtime.modules.persistence as PersistenceController;
  const page = runtime.modules.page as PageController;
  return { runtime, persistence, page, adapter };
}

describe('Persistence Module', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  // ── creation ──────────────────────────────────────────────────────────

  describe('creation', () => {
    it('createPersistenceModule returns valid RuntimeModule', () => {
      const mod = createPersistenceModule();
      expect(mod.name).toBe('persistence');
      expect(mod.initialState).toBeDefined();
      expect(mod.reducers).toBeDefined();
      expect(mod.createController).toBeDefined();
    });

    it('hasSavedState returns false when nothing saved', () => {
      const { persistence } = setup();
      expect(persistence.hasSavedState()).toBe(false);
    });
  });

  // ── save ──────────────────────────────────────────────────────────────

  describe('save', () => {
    it('save persists whitelisted state keys', () => {
      const { page, persistence, adapter } = setup();
      page.mount('Dashboard');
      persistence.save();
      const raw = adapter.store.get('prismui-state');
      expect(raw).toBeDefined();
      const parsed = JSON.parse(raw!);
      expect(parsed.currentPage).toBe('Dashboard');
      expect(parsed.mountedPages).toEqual(['Dashboard']);
    });

    it('save does not persist non-whitelisted keys', () => {
      const { page, persistence, adapter } = setup({ include: ['currentPage'] });
      page.mount('Dashboard');
      persistence.save();
      const parsed = JSON.parse(adapter.store.get('prismui-state')!);
      expect(parsed.currentPage).toBe('Dashboard');
      expect(parsed.mountedPages).toBeUndefined();
    });

    it('hasSavedState returns true after save', () => {
      const { page, persistence } = setup();
      page.mount('Dashboard');
      persistence.save();
      expect(persistence.hasSavedState()).toBe(true);
    });

    it('getSavedState returns parsed data', () => {
      const { page, persistence } = setup();
      page.mount('Dashboard');
      persistence.save();
      const saved = persistence.getSavedState();
      expect(saved).not.toBeNull();
      expect(saved!.currentPage).toBe('Dashboard');
    });
  });

  // ── restore ───────────────────────────────────────────────────────────

  describe('restore', () => {
    it('restore loads state from storage', () => {
      const { runtime, persistence, adapter } = setup();
      // Manually save some state
      adapter.setItem('prismui-state', JSON.stringify({
        currentPage: 'Settings',
        mountedPages: ['Settings'],
      }));
      persistence.restore();
      expect(runtime.getState().currentPage).toBe('Settings');
      expect(runtime.getState().mountedPages).toEqual(['Settings']);
    });

    it('restore is no-op when nothing in storage', () => {
      const { runtime, persistence } = setup();
      const stateBefore = runtime.getState();
      persistence.restore();
      // State should not change
      expect(runtime.getState().currentPage).toBe(stateBefore.currentPage);
    });
  });

  // ── auto-restore on init ──────────────────────────────────────────────

  describe('auto-restore on init', () => {
    it('restores persisted state on module init', () => {
      const { runtime } = setup({
        preload: { currentPage: 'Dashboard', mountedPages: ['Dashboard'] },
      });
      expect(runtime.getState().currentPage).toBe('Dashboard');
      expect(runtime.getState().mountedPages).toEqual(['Dashboard']);
    });
  });

  // ── clear ─────────────────────────────────────────────────────────────

  describe('clear', () => {
    it('clear removes persisted state', () => {
      const { page, persistence } = setup();
      page.mount('Dashboard');
      persistence.save();
      expect(persistence.hasSavedState()).toBe(true);
      persistence.clear();
      expect(persistence.hasSavedState()).toBe(false);
    });
  });

  // ── auto-save (debounced) ─────────────────────────────────────────────

  describe('auto-save', () => {
    it('auto-saves after state change with debounce', () => {
      const { page, adapter } = setup({ debounceMs: 100 });
      page.mount('Dashboard');
      expect(adapter.store.has('prismui-state')).toBe(false);
      vi.advanceTimersByTime(150);
      expect(adapter.store.has('prismui-state')).toBe(true);
      const parsed = JSON.parse(adapter.store.get('prismui-state')!);
      expect(parsed.currentPage).toBe('Dashboard');
    });

    it('debounce resets on rapid changes', () => {
      const { page, adapter } = setup({ debounceMs: 100 });
      page.mount('Page1');
      vi.advanceTimersByTime(50);
      page.mount('Page2');
      vi.advanceTimersByTime(50);
      page.mount('Page3');
      // Not yet saved
      expect(adapter.store.has('prismui-state')).toBe(false);
      vi.advanceTimersByTime(150);
      // Now saved with final state
      const parsed = JSON.parse(adapter.store.get('prismui-state')!);
      expect(parsed.currentPage).toBe('Page3');
    });
  });

  // ── events ────────────────────────────────────────────────────────────

  describe('events', () => {
    it('save dispatches PERSISTENCE_SAVE event', () => {
      const { runtime, page, persistence } = setup();
      page.mount('Dashboard');
      persistence.save();
      const history = runtime.bus.getHistory();
      expect(history.some((e) => e.type === 'persistence/save')).toBe(true);
    });

    it('restore dispatches PERSISTENCE_RESTORE event', () => {
      const { runtime, persistence, adapter } = setup();
      adapter.setItem('prismui-state', JSON.stringify({ currentPage: 'X' }));
      persistence.restore();
      const history = runtime.bus.getHistory();
      expect(history.some((e) => e.type === 'persistence/restore')).toBe(true);
    });

    it('clear dispatches PERSISTENCE_CLEAR event', () => {
      const { runtime, persistence } = setup();
      persistence.clear();
      const history = runtime.bus.getHistory();
      expect(history.some((e) => e.type === 'persistence/clear')).toBe(true);
    });
  });
});
