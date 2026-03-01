// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import {
  createInteractionRuntime,
  createPageModule,
  createModalModule,
  type PageController,
  type ModalController,
} from '@prismui/core';
import { PrismUIProvider } from './provider';
import { usePage } from './use-page';
import { useModal } from './use-modal';

function createTestRuntime() {
  return createInteractionRuntime({
    modules: [createPageModule(), createModalModule()],
  });
}

describe('Convenience Hooks', () => {
  // ── usePage ───────────────────────────────────────────────────────────

  describe('usePage', () => {
    it('usePage returns current page state', () => {
      const runtime = createTestRuntime();

      function Consumer() {
        const { currentPage, mountedPages, isLocked } = usePage();
        return (
          <div>
            <span data-testid="current">{String(currentPage)}</span>
            <span data-testid="mounted">{mountedPages.length}</span>
            <span data-testid="locked">{String(isLocked)}</span>
          </div>
        );
      }

      render(
        <PrismUIProvider runtime={runtime}>
          <Consumer />
        </PrismUIProvider>,
      );

      expect(screen.getByTestId('current').textContent).toBe('null');
      expect(screen.getByTestId('mounted').textContent).toBe('0');
      expect(screen.getByTestId('locked').textContent).toBe('false');
    });

    it('usePage.transition updates currentPage', () => {
      const runtime = createTestRuntime();
      const page = runtime.modules.page as PageController;

      function Consumer() {
        const { currentPage, transition } = usePage();
        return (
          <div>
            <span data-testid="current">{String(currentPage)}</span>
            <button data-testid="go" onClick={() => transition('Dashboard')}>Go</button>
          </div>
        );
      }

      render(
        <PrismUIProvider runtime={runtime}>
          <Consumer />
        </PrismUIProvider>,
      );

      // Mount pages first via controller
      act(() => {
        page.mount('Dashboard');
        page.mount('Settings');
      });

      act(() => {
        screen.getByTestId('go').click();
      });

      expect(screen.getByTestId('current').textContent).toBe('Dashboard');
    });

    it('usePage.lock sets isLocked', () => {
      const runtime = createTestRuntime();

      function Consumer() {
        const { isLocked, lock } = usePage();
        return (
          <div>
            <span data-testid="locked">{String(isLocked)}</span>
            <button data-testid="lock" onClick={lock}>Lock</button>
          </div>
        );
      }

      render(
        <PrismUIProvider runtime={runtime}>
          <Consumer />
        </PrismUIProvider>,
      );

      expect(screen.getByTestId('locked').textContent).toBe('false');

      act(() => {
        screen.getByTestId('lock').click();
      });

      expect(screen.getByTestId('locked').textContent).toBe('true');
    });

    it('usePage.unlock clears isLocked', () => {
      const runtime = createTestRuntime();
      const page = runtime.modules.page as PageController;

      function Consumer() {
        const { isLocked, unlock } = usePage();
        return (
          <div>
            <span data-testid="locked">{String(isLocked)}</span>
            <button data-testid="unlock" onClick={unlock}>Unlock</button>
          </div>
        );
      }

      render(
        <PrismUIProvider runtime={runtime}>
          <Consumer />
        </PrismUIProvider>,
      );

      act(() => { page.lock(); });
      expect(screen.getByTestId('locked').textContent).toBe('true');

      act(() => {
        screen.getByTestId('unlock').click();
      });

      expect(screen.getByTestId('locked').textContent).toBe('false');
    });

    it('usePage.mount adds to mountedPages', () => {
      const runtime = createTestRuntime();

      function Consumer() {
        const { mountedPages, mount } = usePage();
        return (
          <div>
            <span data-testid="count">{mountedPages.length}</span>
            <button data-testid="mount" onClick={() => mount('NewPage')}>Mount</button>
          </div>
        );
      }

      render(
        <PrismUIProvider runtime={runtime}>
          <Consumer />
        </PrismUIProvider>,
      );

      expect(screen.getByTestId('count').textContent).toBe('0');

      act(() => {
        screen.getByTestId('mount').click();
      });

      expect(screen.getByTestId('count').textContent).toBe('1');
    });

    it('usePage.unmount removes from mountedPages', () => {
      const runtime = createTestRuntime();
      const page = runtime.modules.page as PageController;

      function Consumer() {
        const { mountedPages, unmount } = usePage();
        return (
          <div>
            <span data-testid="pages">{mountedPages.join(',')}</span>
            <button data-testid="unmount" onClick={() => unmount('A')}>Unmount</button>
          </div>
        );
      }

      render(
        <PrismUIProvider runtime={runtime}>
          <Consumer />
        </PrismUIProvider>,
      );

      act(() => {
        page.mount('A');
        page.mount('B');
      });

      expect(screen.getByTestId('pages').textContent).toBe('A,B');

      act(() => {
        screen.getByTestId('unmount').click();
      });

      expect(screen.getByTestId('pages').textContent).toBe('B');
    });
  });

  // ── useModal ──────────────────────────────────────────────────────────

  describe('useModal', () => {
    it('useModal returns modal stack', () => {
      const runtime = createTestRuntime();

      function Consumer() {
        const { modalStack } = useModal();
        return <span data-testid="stack">{modalStack.length}</span>;
      }

      render(
        <PrismUIProvider runtime={runtime}>
          <Consumer />
        </PrismUIProvider>,
      );

      expect(screen.getByTestId('stack').textContent).toBe('0');
    });

    it('useModal.open adds to modalStack', () => {
      const runtime = createTestRuntime();

      function Consumer() {
        const { modalStack, open } = useModal();
        return (
          <div>
            <span data-testid="stack">{modalStack.join(',')}</span>
            <button data-testid="open" onClick={() => open('confirm')}>Open</button>
          </div>
        );
      }

      render(
        <PrismUIProvider runtime={runtime}>
          <Consumer />
        </PrismUIProvider>,
      );

      act(() => {
        screen.getByTestId('open').click();
      });

      expect(screen.getByTestId('stack').textContent).toBe('confirm');
    });

    it('useModal.close removes from modalStack', () => {
      const runtime = createTestRuntime();
      const modal = runtime.modules.modal as ModalController;

      function Consumer() {
        const { modalStack, close } = useModal();
        return (
          <div>
            <span data-testid="stack">{modalStack.join(',')}</span>
            <button data-testid="close" onClick={() => close('confirm')}>Close</button>
          </div>
        );
      }

      render(
        <PrismUIProvider runtime={runtime}>
          <Consumer />
        </PrismUIProvider>,
      );

      act(() => {
        modal.open('confirm');
        modal.open('alert');
      });

      expect(screen.getByTestId('stack').textContent).toBe('confirm,alert');

      act(() => {
        screen.getByTestId('close').click();
      });

      expect(screen.getByTestId('stack').textContent).toBe('alert');
    });

    it('useModal.closeAll empties modalStack', () => {
      const runtime = createTestRuntime();
      const modal = runtime.modules.modal as ModalController;

      function Consumer() {
        const { modalStack, closeAll } = useModal();
        return (
          <div>
            <span data-testid="stack">{modalStack.length}</span>
            <button data-testid="closeAll" onClick={closeAll}>Close All</button>
          </div>
        );
      }

      render(
        <PrismUIProvider runtime={runtime}>
          <Consumer />
        </PrismUIProvider>,
      );

      act(() => {
        modal.open('a');
        modal.open('b');
        modal.open('c');
      });

      expect(screen.getByTestId('stack').textContent).toBe('3');

      act(() => {
        screen.getByTestId('closeAll').click();
      });

      expect(screen.getByTestId('stack').textContent).toBe('0');
    });

    it('useModal.isOpen returns correct status', () => {
      const runtime = createTestRuntime();
      const modal = runtime.modules.modal as ModalController;

      function Consumer() {
        const { isOpen } = useModal();
        return (
          <span data-testid="open">{String(isOpen('confirm'))}</span>
        );
      }

      render(
        <PrismUIProvider runtime={runtime}>
          <Consumer />
        </PrismUIProvider>,
      );

      expect(screen.getByTestId('open').textContent).toBe('false');

      act(() => {
        modal.open('confirm');
      });

      expect(screen.getByTestId('open').textContent).toBe('true');
    });
  });

  // ── isolation ─────────────────────────────────────────────────────────

  describe('isolation', () => {
    it('hooks are thin wrappers (no business logic)', async () => {
      const fs = await import('node:fs');
      const path = await import('node:path');

      const files = ['use-page.ts', 'use-modal.ts'];
      for (const file of files) {
        const filePath = path.resolve(__dirname, file);
        const source = fs.readFileSync(filePath, 'utf-8');

        // Should not contain reducer logic, event type constants, or direct state manipulation
        expect(source).not.toMatch(/ReducerCommitResult/);
        expect(source).not.toMatch(/store\.setState/);
        expect(source).not.toMatch(/SYSTEM_ERROR/);
      }
    });
  });
});
