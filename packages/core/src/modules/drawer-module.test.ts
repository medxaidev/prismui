import { describe, it, expect } from 'vitest';
import { createInteractionRuntime } from '../index';
import { createDrawerModule, type DrawerController } from './drawer-module';
import { createModalModule, type ModalController } from './modal-module';
import {
  createAuditTrail,
  createAuditMiddleware,
  createPolicyEngine,
  createPolicyMiddleware,
} from '../governance';

function setup() {
  const runtime = createInteractionRuntime({ modules: [createDrawerModule()] });
  const drawer = runtime.modules.drawer as DrawerController;
  return { runtime, drawer };
}

describe('Drawer Module', () => {
  // ── creation ──────────────────────────────────────────────────────────

  describe('creation', () => {
    it('createDrawerModule returns valid RuntimeModule', () => {
      const mod = createDrawerModule();
      expect(mod.name).toBe('drawer');
      expect(mod.initialState).toBeDefined();
      expect(mod.reducers).toBeDefined();
      expect(mod.createController).toBeDefined();
    });

    it('contributes initialState with empty drawerStack', () => {
      const { runtime } = setup();
      expect(runtime.getState().drawerStack).toEqual([]);
    });
  });

  // ── open ───────────────────────────────────────────────────────────────

  describe('open', () => {
    it('open adds to drawerStack', () => {
      const { drawer } = setup();
      drawer.open('settings');
      expect(drawer.getStack()).toEqual([{ drawerId: 'settings', anchor: 'left' }]);
    });

    it('open with default anchor (left)', () => {
      const { drawer } = setup();
      drawer.open('nav');
      expect(drawer.getAnchor('nav')).toBe('left');
    });

    it('open with custom anchor', () => {
      const { drawer } = setup();
      drawer.open('details', 'right');
      expect(drawer.getAnchor('details')).toBe('right');
    });

    it('open with top anchor', () => {
      const { drawer } = setup();
      drawer.open('search', 'top');
      expect(drawer.getStack()).toEqual([{ drawerId: 'search', anchor: 'top' }]);
    });

    it('open with bottom anchor', () => {
      const { drawer } = setup();
      drawer.open('sheet', 'bottom');
      expect(drawer.getStack()).toEqual([{ drawerId: 'sheet', anchor: 'bottom' }]);
    });

    it('open duplicate is no-op', () => {
      const { drawer } = setup();
      drawer.open('nav');
      drawer.open('nav');
      expect(drawer.getStack()).toHaveLength(1);
    });
  });

  // ── close ──────────────────────────────────────────────────────────────

  describe('close', () => {
    it('close specific drawer', () => {
      const { drawer } = setup();
      drawer.open('nav');
      drawer.open('settings', 'right');
      drawer.close('nav');
      expect(drawer.getStack()).toEqual([{ drawerId: 'settings', anchor: 'right' }]);
    });

    it('close top of stack', () => {
      const { drawer } = setup();
      drawer.open('first');
      drawer.open('second', 'right');
      drawer.close();
      expect(drawer.getStack()).toEqual([{ drawerId: 'first', anchor: 'left' }]);
    });

    it('close empty stack is no-op', () => {
      const { drawer } = setup();
      drawer.close();
      expect(drawer.getStack()).toEqual([]);
    });

    it('closeAll empties stack', () => {
      const { drawer } = setup();
      drawer.open('a');
      drawer.open('b', 'right');
      drawer.open('c', 'bottom');
      drawer.closeAll();
      expect(drawer.getStack()).toEqual([]);
    });
  });

  // ── query ──────────────────────────────────────────────────────────────

  describe('query', () => {
    it('isOpen returns correct status', () => {
      const { drawer } = setup();
      expect(drawer.isOpen('nav')).toBe(false);
      drawer.open('nav');
      expect(drawer.isOpen('nav')).toBe(true);
      drawer.close('nav');
      expect(drawer.isOpen('nav')).toBe(false);
    });

    it('getStack returns current stack', () => {
      const { drawer } = setup();
      drawer.open('a');
      drawer.open('b', 'right');
      expect(drawer.getStack()).toEqual([
        { drawerId: 'a', anchor: 'left' },
        { drawerId: 'b', anchor: 'right' },
      ]);
    });

    it('getAnchor returns drawer anchor', () => {
      const { drawer } = setup();
      drawer.open('nav', 'right');
      expect(drawer.getAnchor('nav')).toBe('right');
    });

    it('getAnchor returns undefined for closed drawer', () => {
      const { drawer } = setup();
      expect(drawer.getAnchor('nonexistent')).toBeUndefined();
    });
  });

  // ── stack ──────────────────────────────────────────────────────────────

  describe('stack', () => {
    it('multiple drawers coexist', () => {
      const { drawer } = setup();
      drawer.open('left-nav', 'left');
      drawer.open('right-details', 'right');
      drawer.open('bottom-sheet', 'bottom');
      expect(drawer.getStack()).toHaveLength(3);
      expect(drawer.isOpen('left-nav')).toBe(true);
      expect(drawer.isOpen('right-details')).toBe(true);
      expect(drawer.isOpen('bottom-sheet')).toBe(true);
    });
  });

  // ── isolation ──────────────────────────────────────────────────────────

  describe('isolation', () => {
    it('drawer + modal independent', () => {
      const runtime = createInteractionRuntime({
        modules: [createDrawerModule(), createModalModule()],
      });
      const drawer = runtime.modules.drawer as DrawerController;
      const modal = runtime.modules.modal as ModalController;

      drawer.open('nav');
      modal.open('confirm');

      expect(drawer.getStack()).toHaveLength(1);
      expect(modal.getStack()).toEqual(['confirm']);

      drawer.closeAll();
      expect(drawer.getStack()).toHaveLength(0);
      expect(modal.getStack()).toEqual(['confirm']); // modal unaffected
    });

    it('has no React/DOM imports', async () => {
      const fs = await import('node:fs');
      const path = await import('node:path');
      const filePath = path.resolve(__dirname, 'drawer-module.ts');
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
    it('drawer events tracked by audit', () => {
      const audit = createAuditTrail();
      const runtime = createInteractionRuntime({
        modules: [createDrawerModule()],
      });
      runtime.scheduler.use(createAuditMiddleware(audit, runtime.store));

      const drawer = runtime.modules.drawer as DrawerController;
      drawer.open('nav');
      drawer.close('nav');

      const entries = audit.getEntries();
      expect(entries.length).toBeGreaterThanOrEqual(2);
      expect(entries.some((e) => e.event.type === 'drawer/open')).toBe(true);
      expect(entries.some((e) => e.event.type === 'drawer/close')).toBe(true);
    });

    it('drawer events subject to policy', () => {
      const policy = createPolicyEngine();
      const audit = createAuditTrail();
      const runtime = createInteractionRuntime({
        modules: [createDrawerModule()],
      });
      runtime.scheduler.use(createPolicyMiddleware(policy, runtime.store, audit));

      // Block all drawer opens
      policy.addRule({
        name: 'block-drawer',
        eventTypes: ['drawer/open'],
        evaluate: () => ({ verdict: 'deny' as const, reason: 'Drawers disabled' }),
      });

      const drawer = runtime.modules.drawer as DrawerController;
      drawer.open('nav');
      expect(drawer.isOpen('nav')).toBe(false); // blocked by policy
    });
  });
});
