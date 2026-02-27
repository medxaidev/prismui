import { describe, it, expect } from 'vitest';
import { createInteractionRuntime } from '../index';
import { createModalModule, type ModalController } from './modal-module';

function setup() {
  const runtime = createInteractionRuntime({ modules: [createModalModule()] });
  const modal = runtime.modules.modal as ModalController;
  return { runtime, modal };
}

describe('Modal Module', () => {
  // ── creation ──────────────────────────────────────────────────────────

  describe('creation', () => {
    it('createModalModule returns valid RuntimeModule', () => {
      const mod = createModalModule();
      expect(mod.name).toBe('modal');
      expect(mod.initialState).toBeDefined();
      expect(mod.reducers).toBeDefined();
      expect(mod.createController).toBeDefined();
    });

    it('modal module contributes initialState', () => {
      const { runtime } = setup();
      expect(runtime.getState().modalStack).toEqual([]);
    });
  });

  // ── modal ─────────────────────────────────────────────────────────────

  describe('modal', () => {
    it('open adds to modalStack', () => {
      const { modal } = setup();
      modal.open('confirm');
      expect(modal.getStack()).toEqual(['confirm']);
    });

    it('close removes from modalStack', () => {
      const { modal } = setup();
      modal.open('confirm');
      modal.open('alert');
      modal.close('confirm');
      expect(modal.getStack()).toEqual(['alert']);
    });

    it('close without id removes top of stack', () => {
      const { modal } = setup();
      modal.open('first');
      modal.open('second');
      modal.close();
      expect(modal.getStack()).toEqual(['first']);
    });

    it('closeAll empties modalStack', () => {
      const { modal } = setup();
      modal.open('a');
      modal.open('b');
      modal.open('c');
      modal.closeAll();
      expect(modal.getStack()).toEqual([]);
    });

    it('isOpen returns correct status', () => {
      const { modal } = setup();
      expect(modal.isOpen('confirm')).toBe(false);
      modal.open('confirm');
      expect(modal.isOpen('confirm')).toBe(true);
      modal.close('confirm');
      expect(modal.isOpen('confirm')).toBe(false);
    });

    it('getStack returns current modal stack', () => {
      const { modal } = setup();
      modal.open('a');
      modal.open('b');
      expect(modal.getStack()).toEqual(['a', 'b']);
    });
  });

  // ── isolation ─────────────────────────────────────────────────────────

  describe('isolation', () => {
    it('modules have no React/DOM imports', async () => {
      const fs = await import('node:fs');
      const path = await import('node:path');

      const files = ['page-module.ts', 'modal-module.ts'];
      for (const file of files) {
        const filePath = path.resolve(__dirname, file);
        const source = fs.readFileSync(filePath, 'utf-8');

        expect(source).not.toMatch(/from\s+['"]react['"]/);
        expect(source).not.toMatch(/from\s+['"]react-dom['"]/);
        expect(source).not.toMatch(/\bdocument\b/);
        expect(source).not.toMatch(/\bwindow\b/);
        expect(source).not.toMatch(/\bHTMLElement\b/);
      }
    });
  });
});
