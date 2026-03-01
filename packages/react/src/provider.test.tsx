// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import {
  createInteractionRuntime,
  createPageModule,
  createModalModule,
  type InteractionRuntime,
  type PageController,
} from '@prismui/core';
import { PrismUIProvider } from './provider';
import { useRuntime } from './use-runtime';
import { useRuntimeState } from './use-runtime-state';

function createTestRuntime() {
  return createInteractionRuntime({
    modules: [createPageModule(), createModalModule()],
  });
}

describe('PrismUIProvider', () => {
  // ── provider ──────────────────────────────────────────────────────────

  describe('provider', () => {
    it('PrismUIProvider renders children', () => {
      const runtime = createTestRuntime();
      render(
        <PrismUIProvider runtime={runtime}>
          <div data-testid="child">Hello</div>
        </PrismUIProvider>,
      );
      expect(screen.getByTestId('child')).toBeDefined();
      expect(screen.getByTestId('child').textContent).toBe('Hello');
    });

    it('PrismUIProvider provides runtime via context', () => {
      const runtime = createTestRuntime();
      let received: InteractionRuntime | null = null;

      function Consumer() {
        received = useRuntime();
        return null;
      }

      render(
        <PrismUIProvider runtime={runtime}>
          <Consumer />
        </PrismUIProvider>,
      );

      expect(received).toBe(runtime);
    });

    it('provider does not create runtime internally', () => {
      const runtime = createTestRuntime();
      const spy = vi.spyOn(runtime, 'getState');

      render(
        <PrismUIProvider runtime={runtime}>
          <div />
        </PrismUIProvider>,
      );

      // Provider itself doesn't call getState — it just passes the runtime through
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });

    it('provider accepts different runtime instances', () => {
      const r1 = createTestRuntime();
      const r2 = createTestRuntime();
      let received: InteractionRuntime | null = null;

      function Consumer() {
        received = useRuntime();
        return null;
      }

      const { rerender } = render(
        <PrismUIProvider runtime={r1}>
          <Consumer />
        </PrismUIProvider>,
      );
      expect(received).toBe(r1);

      rerender(
        <PrismUIProvider runtime={r2}>
          <Consumer />
        </PrismUIProvider>,
      );
      expect(received).toBe(r2);
    });
  });

  // ── useRuntime ────────────────────────────────────────────────────────

  describe('useRuntime', () => {
    it('useRuntime returns runtime instance', () => {
      const runtime = createTestRuntime();
      let received: InteractionRuntime | null = null;

      function Consumer() {
        received = useRuntime();
        return null;
      }

      render(
        <PrismUIProvider runtime={runtime}>
          <Consumer />
        </PrismUIProvider>,
      );

      expect(received).toBe(runtime);
    });

    it('useRuntime throws outside provider', () => {
      function BadConsumer() {
        useRuntime();
        return null;
      }

      // Suppress React error boundary console output
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<BadConsumer />);
      }).toThrow('[PrismUI] useRuntime must be used within a PrismUIProvider');

      consoleSpy.mockRestore();
    });

    it('useRuntime returns stable reference across renders', () => {
      const runtime = createTestRuntime();
      const refs: InteractionRuntime[] = [];

      function Consumer() {
        refs.push(useRuntime());
        return null;
      }

      const { rerender } = render(
        <PrismUIProvider runtime={runtime}>
          <Consumer />
        </PrismUIProvider>,
      );

      rerender(
        <PrismUIProvider runtime={runtime}>
          <Consumer />
        </PrismUIProvider>,
      );

      expect(refs).toHaveLength(2);
      expect(refs[0]).toBe(refs[1]);
    });
  });

  // ── useRuntimeState ───────────────────────────────────────────────────

  describe('useRuntimeState', () => {
    it('useRuntimeState returns current state', () => {
      const runtime = createTestRuntime();
      let state: unknown = null;

      function Consumer() {
        state = useRuntimeState();
        return null;
      }

      render(
        <PrismUIProvider runtime={runtime}>
          <Consumer />
        </PrismUIProvider>,
      );

      expect(state).toBeDefined();
      expect((state as { version: number }).version).toBe(0);
    });

    it('useRuntimeState re-renders on state change', () => {
      const runtime = createTestRuntime();
      const page = runtime.modules.page as PageController;
      let renderCount = 0;

      function Consumer() {
        const s = useRuntimeState();
        renderCount++;
        return <div data-testid="version">{s.version}</div>;
      }

      render(
        <PrismUIProvider runtime={runtime}>
          <Consumer />
        </PrismUIProvider>,
      );

      expect(renderCount).toBe(1);
      expect(screen.getByTestId('version').textContent).toBe('0');

      act(() => {
        page.mount('Dashboard');
      });

      expect(renderCount).toBe(2);
    });

    it('useRuntimeState returns readonly state', () => {
      const runtime = createTestRuntime();
      let state: unknown = null;

      function Consumer() {
        state = useRuntimeState();
        return null;
      }

      render(
        <PrismUIProvider runtime={runtime}>
          <Consumer />
        </PrismUIProvider>,
      );

      // State should be the same reference as store.getState() (readonly)
      expect(state).toBe(runtime.store.getState());
    });

    it('useRuntimeState updates when page transitions', () => {
      const runtime = createTestRuntime();
      const page = runtime.modules.page as PageController;

      function Consumer() {
        const s = useRuntimeState();
        return <div data-testid="page">{String(s.currentPage)}</div>;
      }

      render(
        <PrismUIProvider runtime={runtime}>
          <Consumer />
        </PrismUIProvider>,
      );

      expect(screen.getByTestId('page').textContent).toBe('null');

      act(() => {
        page.mount('Dashboard');
        page.mount('Settings');
      });

      act(() => {
        page.transition('Dashboard');
      });

      expect(screen.getByTestId('page').textContent).toBe('Dashboard');
    });

    it('useRuntimeState updates when page is locked', () => {
      const runtime = createTestRuntime();
      const page = runtime.modules.page as PageController;

      function Consumer() {
        const s = useRuntimeState();
        return <div data-testid="locked">{String(s.locked)}</div>;
      }

      render(
        <PrismUIProvider runtime={runtime}>
          <Consumer />
        </PrismUIProvider>,
      );

      expect(screen.getByTestId('locked').textContent).toBe('false');

      act(() => {
        page.lock();
      });

      expect(screen.getByTestId('locked').textContent).toBe('true');
    });

    it('useRuntimeState cleans up subscription on unmount', () => {
      const runtime = createTestRuntime();
      const subscribeSpy = vi.spyOn(runtime.store, 'subscribe');

      function Consumer() {
        useRuntimeState();
        return null;
      }

      const { unmount } = render(
        <PrismUIProvider runtime={runtime}>
          <Consumer />
        </PrismUIProvider>,
      );

      // useSyncExternalStore calls subscribe
      expect(subscribeSpy).toHaveBeenCalled();

      // Unmount should call the unsubscribe function
      unmount();

      // After unmount, dispatching should not cause errors
      expect(() => {
        runtime.dispatch({ type: 'TEST' });
      }).not.toThrow();

      subscribeSpy.mockRestore();
    });

    it('multiple useRuntimeState hooks receive same state', () => {
      const runtime = createTestRuntime();
      const states: unknown[] = [];

      function Consumer1() {
        states.push(useRuntimeState());
        return null;
      }
      function Consumer2() {
        states.push(useRuntimeState());
        return null;
      }

      render(
        <PrismUIProvider runtime={runtime}>
          <Consumer1 />
          <Consumer2 />
        </PrismUIProvider>,
      );

      expect(states).toHaveLength(2);
      expect(states[0]).toBe(states[1]);
    });
  });

  // ── isolation ─────────────────────────────────────────────────────────

  describe('isolation', () => {
    it('hooks contain no business logic', async () => {
      const fs = await import('node:fs');
      const path = await import('node:path');

      const files = ['use-runtime.ts', 'use-runtime-state.ts'];
      for (const file of files) {
        const filePath = path.resolve(__dirname, file);
        const source = fs.readFileSync(filePath, 'utf-8');

        // Hooks should not contain business logic patterns
        expect(source).not.toMatch(/dispatch\s*\(/); // no dispatching
        expect(source).not.toMatch(/PAGE_/); // no page event types
        expect(source).not.toMatch(/MODAL_/); // no modal event types
      }
    });
  });
});
