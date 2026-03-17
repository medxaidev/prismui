// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import {
  createInteractionRuntime,
  createModalModule,
  type ModalController,
} from '@prismui/core';
import { PrismUIProvider } from '../provider';
import { ModalRenderer } from './ModalRenderer';

function setup(props?: Partial<React.ComponentProps<typeof ModalRenderer>>) {
  const runtime = createInteractionRuntime({ modules: [createModalModule()] });
  const modal = runtime.modules.modal as ModalController;

  const renderContent = props?.children ?? ((id: string, close: () => void) => (
    <div data-testid={`modal-content-${id}`}>
      <span>Modal: {id}</span>
      <button data-testid={`close-btn-${id}`} onClick={close}>Close</button>
    </div>
  ));

  const result = render(
    <PrismUIProvider runtime={runtime}>
      <ModalRenderer {...props} children={renderContent} />
    </PrismUIProvider>,
  );

  return { runtime, modal, result };
}

describe('ModalRenderer', () => {
  // ── rendering ───────────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders nothing when modal stack is empty', () => {
      setup();
      expect(screen.queryByTestId(/modal-overlay/)).toBeNull();
    });

    it('renders modal when opened', () => {
      const { modal } = setup();
      act(() => modal.open('confirm'));
      expect(screen.getByTestId('modal-overlay-confirm')).toBeDefined();
      expect(screen.getByTestId('modal-content-confirm')).toBeDefined();
    });

    it('renders multiple stacked modals', () => {
      const { modal } = setup();
      act(() => {
        modal.open('first');
        modal.open('second');
      });
      expect(screen.getByTestId('modal-overlay-first')).toBeDefined();
      expect(screen.getByTestId('modal-overlay-second')).toBeDefined();
    });

    it('removes modal from DOM when closed', () => {
      const { modal } = setup();
      act(() => modal.open('temp'));
      expect(screen.getByTestId('modal-overlay-temp')).toBeDefined();
      act(() => modal.close('temp'));
      expect(screen.queryByTestId('modal-overlay-temp')).toBeNull();
    });

    it('renders into a portal (document.body)', () => {
      const { modal } = setup();
      act(() => modal.open('portal-test'));
      const overlay = screen.getByTestId('modal-overlay-portal-test');
      expect(overlay.parentElement).toBe(document.body);
    });
  });

  // ── accessibility ───────────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has role="dialog" and aria-modal="true"', () => {
      const { modal } = setup();
      act(() => modal.open('a11y'));
      const overlay = screen.getByTestId('modal-overlay-a11y');
      expect(overlay.getAttribute('role')).toBe('dialog');
      expect(overlay.getAttribute('aria-modal')).toBe('true');
    });
  });

  // ── backdrop ────────────────────────────────────────────────────────────

  describe('backdrop', () => {
    it('closes specific modal on backdrop click', () => {
      const { modal } = setup();
      act(() => modal.open('backdrop-test'));
      fireEvent.click(screen.getByTestId('modal-backdrop-backdrop-test'));
      expect(screen.queryByTestId('modal-overlay-backdrop-test')).toBeNull();
    });

    it('does not close when backdropClose is false', () => {
      const { modal } = setup({ backdropClose: false });
      act(() => modal.open('no-close'));
      fireEvent.click(screen.getByTestId('modal-backdrop-no-close'));
      expect(screen.getByTestId('modal-overlay-no-close')).toBeDefined();
    });
  });

  // ── escape key ──────────────────────────────────────────────────────────

  describe('escape key', () => {
    it('closes top modal on Escape', () => {
      const { modal } = setup();
      act(() => {
        modal.open('first');
        modal.open('second');
      });
      fireEvent.keyDown(document, { key: 'Escape' });
      // Top of stack (second) should be closed
      expect(screen.queryByTestId('modal-overlay-second')).toBeNull();
      expect(screen.getByTestId('modal-overlay-first')).toBeDefined();
    });

    it('does not close when escapeClose is false', () => {
      const { modal } = setup({ escapeClose: false });
      act(() => modal.open('no-escape'));
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.getByTestId('modal-overlay-no-escape')).toBeDefined();
    });
  });

  // ── close callback ─────────────────────────────────────────────────────

  describe('close callback', () => {
    it('close function from render prop works', () => {
      const { modal } = setup();
      act(() => modal.open('callback'));
      fireEvent.click(screen.getByTestId('close-btn-callback'));
      expect(screen.queryByTestId('modal-overlay-callback')).toBeNull();
    });
  });

  // ── z-index stacking ───────────────────────────────────────────────────

  describe('stacking', () => {
    it('assigns increasing z-index to stacked modals', () => {
      const { modal } = setup();
      act(() => {
        modal.open('z1');
        modal.open('z2');
      });
      const z1 = screen.getByTestId('modal-overlay-z1');
      const z2 = screen.getByTestId('modal-overlay-z2');
      const zIndex1 = parseInt(z1.style.zIndex, 10);
      const zIndex2 = parseInt(z2.style.zIndex, 10);
      expect(zIndex2).toBeGreaterThan(zIndex1);
    });
  });
});
