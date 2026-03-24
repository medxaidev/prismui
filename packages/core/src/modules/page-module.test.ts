import { describe, it, expect } from 'vitest';
import { createInteractionRuntime } from '../index';
import { createPageModule, type PageController } from './page-module';

function setup() {
  const runtime = createInteractionRuntime({ modules: [createPageModule()] });
  const page = runtime.modules.page as PageController;
  return { runtime, page };
}

describe('Page Module', () => {
  // ── creation ──────────────────────────────────────────────────────────

  describe('creation', () => {
    it('createPageModule returns valid RuntimeModule', () => {
      const mod = createPageModule();
      expect(mod.name).toBe('page');
      expect(mod.initialState).toBeDefined();
      expect(mod.reducers).toBeDefined();
      expect(mod.createController).toBeDefined();
    });

    it('page module contributes initialState', () => {
      const { runtime } = setup();
      const state = runtime.getState();
      expect(state.currentPage).toBe(null);
      expect(state.mountedPages).toEqual([]);
      expect(state.locked).toBe(false);
    });
  });

  // ── mount ─────────────────────────────────────────────────────────────

  describe('mount', () => {
    it('mount adds page to mountedPages', () => {
      const { page } = setup();
      page.mount('Dashboard');
      expect(page.getMounted()).toContain('Dashboard');
    });

    it('mount sets page as currentPage', () => {
      const { page } = setup();
      page.mount('Dashboard');
      expect(page.getCurrent()).toBe('Dashboard');
    });

    it('mount dispatches page/mount event', () => {
      const { runtime, page } = setup();
      page.mount('Dashboard');
      const history = runtime.bus.getHistory();
      const mountEvent = history.find((e) => e.type === 'page/mount');
      expect(mountEvent).toBeDefined();
      expect((mountEvent!.payload as { pageId: string }).pageId).toBe('Dashboard');
    });
  });

  // ── unmount ───────────────────────────────────────────────────────────

  describe('unmount', () => {
    it('unmount removes page from mountedPages', () => {
      const { page } = setup();
      page.mount('Dashboard');
      page.mount('Settings');
      page.unmount('Dashboard');
      expect(page.getMounted()).not.toContain('Dashboard');
      expect(page.getMounted()).toContain('Settings');
    });

    it('unmount clears currentPage if it was current', () => {
      const { page } = setup();
      page.mount('Dashboard');
      expect(page.getCurrent()).toBe('Dashboard');
      page.unmount('Dashboard');
      expect(page.getCurrent()).toBe(null);
    });
  });

  // ── transition ────────────────────────────────────────────────────────

  describe('transition', () => {
    it('transition changes currentPage', () => {
      const { page } = setup();
      page.mount('Dashboard');
      page.mount('Settings');
      page.transition('Dashboard');
      expect(page.getCurrent()).toBe('Dashboard');
    });

    it('transition only works for mounted pages', () => {
      const { page } = setup();
      page.mount('Dashboard');
      page.transition('NotMounted');
      // currentPage should remain Dashboard (last mounted)
      expect(page.getCurrent()).toBe('Dashboard');
    });

    it('transition is blocked when locked', () => {
      const { page } = setup();
      page.mount('Dashboard');
      page.mount('Settings');
      page.lock();
      page.transition('Dashboard');
      // currentPage should remain Settings (last mounted before lock)
      expect(page.getCurrent()).toBe('Settings');
    });
  });

  // ── lock ──────────────────────────────────────────────────────────────

  describe('lock', () => {
    it('lock sets locked to true', () => {
      const { page } = setup();
      page.lock();
      expect(page.isLocked()).toBe(true);
    });
  });

  // ── unlock ────────────────────────────────────────────────────────────

  describe('unlock', () => {
    it('unlock sets locked to false', () => {
      const { page } = setup();
      page.lock();
      expect(page.isLocked()).toBe(true);
      page.unlock();
      expect(page.isLocked()).toBe(false);
    });
  });
});
