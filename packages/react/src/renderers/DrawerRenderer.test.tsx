// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import {
  createInteractionRuntime,
  createDrawerModule,
  type DrawerController,
  type DrawerAnchor,
} from '@prismui/core';
import { PrismUIProvider } from '../provider';
import { DrawerRenderer } from './DrawerRenderer';

function setup(props?: Partial<React.ComponentProps<typeof DrawerRenderer>>) {
  const runtime = createInteractionRuntime({ modules: [createDrawerModule()] });
  const drawer = runtime.modules.drawer as DrawerController;

  const renderContent = props?.children ?? ((id: string, anchor: DrawerAnchor, close: () => void) => (
    <div data-testid={`drawer-content-${id}`}>
      <span>Drawer: {id} ({anchor})</span>
      <button data-testid={`close-btn-${id}`} onClick={close}>Close</button>
    </div>
  ));

  const result = render(
    <PrismUIProvider runtime={runtime}>
      <DrawerRenderer {...props} children={renderContent} />
    </PrismUIProvider>,
  );

  return { runtime, drawer, result };
}

describe('DrawerRenderer', () => {
  // ── rendering ───────────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders nothing when drawer stack is empty', () => {
      setup();
      expect(screen.queryByTestId(/drawer-overlay/)).toBeNull();
    });

    it('renders drawer when opened', () => {
      const { drawer } = setup();
      act(() => drawer.open('nav'));
      expect(screen.getByTestId('drawer-overlay-nav')).toBeDefined();
      expect(screen.getByTestId('drawer-content-nav')).toBeDefined();
    });

    it('renders multiple stacked drawers', () => {
      const { drawer } = setup();
      act(() => {
        drawer.open('nav', 'left');
        drawer.open('settings', 'right');
      });
      expect(screen.getByTestId('drawer-overlay-nav')).toBeDefined();
      expect(screen.getByTestId('drawer-overlay-settings')).toBeDefined();
    });

    it('removes drawer from DOM when closed', () => {
      const { drawer } = setup();
      act(() => drawer.open('temp'));
      expect(screen.getByTestId('drawer-overlay-temp')).toBeDefined();
      act(() => drawer.close('temp'));
      expect(screen.queryByTestId('drawer-overlay-temp')).toBeNull();
    });

    it('renders into a portal (document.body)', () => {
      const { drawer } = setup();
      act(() => drawer.open('portal-test'));
      const overlay = screen.getByTestId('drawer-overlay-portal-test');
      expect(overlay.parentElement).toBe(document.body);
    });
  });

  // ── anchor positioning ──────────────────────────────────────────────────

  describe('anchor positioning', () => {
    it('renders with left anchor by default', () => {
      const { drawer } = setup();
      act(() => drawer.open('left-drawer'));
      const panel = screen.getByTestId('drawer-panel-left-drawer');
      expect(panel.getAttribute('data-anchor')).toBe('left');
    });

    it('renders with right anchor', () => {
      const { drawer } = setup();
      act(() => drawer.open('right-drawer', 'right'));
      const panel = screen.getByTestId('drawer-panel-right-drawer');
      expect(panel.getAttribute('data-anchor')).toBe('right');
    });

    it('renders with top anchor', () => {
      const { drawer } = setup();
      act(() => drawer.open('top-drawer', 'top'));
      const panel = screen.getByTestId('drawer-panel-top-drawer');
      expect(panel.getAttribute('data-anchor')).toBe('top');
    });

    it('renders with bottom anchor', () => {
      const { drawer } = setup();
      act(() => drawer.open('bottom-drawer', 'bottom'));
      const panel = screen.getByTestId('drawer-panel-bottom-drawer');
      expect(panel.getAttribute('data-anchor')).toBe('bottom');
    });
  });

  // ── accessibility ───────────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has role="complementary" on panel', () => {
      const { drawer } = setup();
      act(() => drawer.open('a11y'));
      const panel = screen.getByTestId('drawer-panel-a11y');
      expect(panel.getAttribute('role')).toBe('complementary');
    });
  });

  // ── backdrop ────────────────────────────────────────────────────────────

  describe('backdrop', () => {
    it('closes specific drawer on backdrop click', () => {
      const { drawer } = setup();
      act(() => drawer.open('backdrop-test'));
      fireEvent.click(screen.getByTestId('drawer-backdrop-backdrop-test'));
      expect(screen.queryByTestId('drawer-overlay-backdrop-test')).toBeNull();
    });

    it('does not close when backdropClose is false', () => {
      const { drawer } = setup({ backdropClose: false });
      act(() => drawer.open('no-close'));
      fireEvent.click(screen.getByTestId('drawer-backdrop-no-close'));
      expect(screen.getByTestId('drawer-overlay-no-close')).toBeDefined();
    });
  });

  // ── escape key ──────────────────────────────────────────────────────────

  describe('escape key', () => {
    it('closes top drawer on Escape', () => {
      const { drawer } = setup();
      act(() => {
        drawer.open('first', 'left');
        drawer.open('second', 'right');
      });
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.queryByTestId('drawer-overlay-second')).toBeNull();
      expect(screen.getByTestId('drawer-overlay-first')).toBeDefined();
    });

    it('does not close when escapeClose is false', () => {
      const { drawer } = setup({ escapeClose: false });
      act(() => drawer.open('no-escape'));
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.getByTestId('drawer-overlay-no-escape')).toBeDefined();
    });
  });

  // ── close callback ─────────────────────────────────────────────────────

  describe('close callback', () => {
    it('close function from render prop works', () => {
      const { drawer } = setup();
      act(() => drawer.open('callback'));
      fireEvent.click(screen.getByTestId('close-btn-callback'));
      expect(screen.queryByTestId('drawer-overlay-callback')).toBeNull();
    });
  });
});
