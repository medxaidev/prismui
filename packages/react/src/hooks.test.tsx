// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import {
  createInteractionRuntime,
  createPageModule,
  createModalModule,
  createDrawerModule,
  createNotificationModule,
  createFormModule,
  createAsyncModule,
  createSelector,
  type PageController,
  type ModalController,
  type DrawerController,
  type NotificationController,
  type FormController,
  type AsyncController,
  type StateSelector,
} from '@prismui/core';
import { PrismUIProvider } from './provider';
import { usePage } from './use-page';
import { useModal } from './use-modal';
import { useDrawer } from './use-drawer';
import { useNotification } from './use-notification';
import { useSelector } from './use-selector';
import { useForm } from './use-form';
import { useAsync } from './use-async';

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

  // ── useDrawer ────────────────────────────────────────────────────────

  describe('useDrawer', () => {
    function createDrawerRuntime() {
      return createInteractionRuntime({
        modules: [createDrawerModule()],
      });
    }

    it('useDrawer returns empty drawer stack', () => {
      const runtime = createDrawerRuntime();

      function Consumer() {
        const { drawerStack } = useDrawer();
        return <span data-testid="stack">{drawerStack.length}</span>;
      }

      render(
        <PrismUIProvider runtime={runtime}>
          <Consumer />
        </PrismUIProvider>,
      );

      expect(screen.getByTestId('stack').textContent).toBe('0');
    });

    it('useDrawer.open adds to drawerStack', () => {
      const runtime = createDrawerRuntime();

      function Consumer() {
        const { drawerStack, open } = useDrawer();
        return (
          <div>
            <span data-testid="count">{drawerStack.length}</span>
            <button data-testid="open" onClick={() => open('nav')}>Open</button>
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

      expect(screen.getByTestId('count').textContent).toBe('1');
    });

    it('useDrawer.open with custom anchor', () => {
      const runtime = createDrawerRuntime();

      function Consumer() {
        const { drawerStack, open } = useDrawer();
        return (
          <div>
            <span data-testid="anchor">{drawerStack[0]?.anchor ?? 'none'}</span>
            <button data-testid="open" onClick={() => open('details', 'right')}>Open</button>
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

      expect(screen.getByTestId('anchor').textContent).toBe('right');
    });

    it('useDrawer.close removes from drawerStack', () => {
      const runtime = createDrawerRuntime();
      const drawer = runtime.modules.drawer as DrawerController;

      function Consumer() {
        const { drawerStack, close } = useDrawer();
        return (
          <div>
            <span data-testid="count">{drawerStack.length}</span>
            <button data-testid="close" onClick={() => close('nav')}>Close</button>
          </div>
        );
      }

      render(
        <PrismUIProvider runtime={runtime}>
          <Consumer />
        </PrismUIProvider>,
      );

      act(() => {
        drawer.open('nav');
        drawer.open('settings', 'right');
      });

      expect(screen.getByTestId('count').textContent).toBe('2');

      act(() => {
        screen.getByTestId('close').click();
      });

      expect(screen.getByTestId('count').textContent).toBe('1');
    });

    it('useDrawer.closeAll empties drawerStack', () => {
      const runtime = createDrawerRuntime();
      const drawer = runtime.modules.drawer as DrawerController;

      function Consumer() {
        const { drawerStack, closeAll } = useDrawer();
        return (
          <div>
            <span data-testid="count">{drawerStack.length}</span>
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
        drawer.open('a');
        drawer.open('b', 'right');
      });

      expect(screen.getByTestId('count').textContent).toBe('2');

      act(() => {
        screen.getByTestId('closeAll').click();
      });

      expect(screen.getByTestId('count').textContent).toBe('0');
    });

    it('useDrawer.isOpen returns correct status', () => {
      const runtime = createDrawerRuntime();
      const drawer = runtime.modules.drawer as DrawerController;

      function Consumer() {
        const { isOpen } = useDrawer();
        return (
          <span data-testid="open">{String(isOpen('nav'))}</span>
        );
      }

      render(
        <PrismUIProvider runtime={runtime}>
          <Consumer />
        </PrismUIProvider>,
      );

      expect(screen.getByTestId('open').textContent).toBe('false');

      act(() => {
        drawer.open('nav');
      });

      expect(screen.getByTestId('open').textContent).toBe('true');
    });

    it('useDrawer.getAnchor returns anchor', () => {
      const runtime = createDrawerRuntime();
      const drawer = runtime.modules.drawer as DrawerController;

      function Consumer() {
        const { getAnchor } = useDrawer();
        return (
          <span data-testid="anchor">{getAnchor('nav') ?? 'none'}</span>
        );
      }

      render(
        <PrismUIProvider runtime={runtime}>
          <Consumer />
        </PrismUIProvider>,
      );

      expect(screen.getByTestId('anchor').textContent).toBe('none');

      act(() => {
        drawer.open('nav', 'right');
      });

      expect(screen.getByTestId('anchor').textContent).toBe('right');
    });
  });

  // ── useNotification ─────────────────────────────────────────────────

  describe('useNotification', () => {
    function createNotifRuntime() {
      return createInteractionRuntime({
        modules: [createNotificationModule()],
      });
    }

    it('useNotification returns empty notifications', () => {
      const runtime = createNotifRuntime();

      function Consumer() {
        const { count } = useNotification();
        return <span data-testid="count">{count}</span>;
      }

      render(
        <PrismUIProvider runtime={runtime}>
          <Consumer />
        </PrismUIProvider>,
      );

      expect(screen.getByTestId('count').textContent).toBe('0');
    });

    it('useNotification.show adds notification', () => {
      const runtime = createNotifRuntime();

      function Consumer() {
        const { count, show } = useNotification();
        return (
          <div>
            <span data-testid="count">{count}</span>
            <button data-testid="show" onClick={() => show({ type: 'info', message: 'Hello' })}>Show</button>
          </div>
        );
      }

      render(
        <PrismUIProvider runtime={runtime}>
          <Consumer />
        </PrismUIProvider>,
      );

      act(() => {
        screen.getByTestId('show').click();
      });

      expect(screen.getByTestId('count').textContent).toBe('1');
    });

    it('useNotification.dismiss removes notification', () => {
      const runtime = createNotifRuntime();
      const notif = runtime.modules.notification as NotificationController;

      let dismissId = '';

      function Consumer() {
        const { count, notifications, dismiss } = useNotification();
        return (
          <div>
            <span data-testid="count">{count}</span>
            <button data-testid="dismiss" onClick={() => dismiss(dismissId)}>Dismiss</button>
          </div>
        );
      }

      render(
        <PrismUIProvider runtime={runtime}>
          <Consumer />
        </PrismUIProvider>,
      );

      act(() => {
        dismissId = notif.show({ type: 'info', message: 'A' });
        notif.show({ type: 'error', message: 'B' });
      });

      expect(screen.getByTestId('count').textContent).toBe('2');

      act(() => {
        screen.getByTestId('dismiss').click();
      });

      expect(screen.getByTestId('count').textContent).toBe('1');
    });

    it('useNotification.dismissAll clears all', () => {
      const runtime = createNotifRuntime();
      const notif = runtime.modules.notification as NotificationController;

      function Consumer() {
        const { count, dismissAll } = useNotification();
        return (
          <div>
            <span data-testid="count">{count}</span>
            <button data-testid="dismissAll" onClick={dismissAll}>Dismiss All</button>
          </div>
        );
      }

      render(
        <PrismUIProvider runtime={runtime}>
          <Consumer />
        </PrismUIProvider>,
      );

      act(() => {
        notif.show({ type: 'info', message: 'A' });
        notif.show({ type: 'error', message: 'B' });
      });

      expect(screen.getByTestId('count').textContent).toBe('2');

      act(() => {
        screen.getByTestId('dismissAll').click();
      });

      expect(screen.getByTestId('count').textContent).toBe('0');
    });

    it('useNotification.getById finds notification', () => {
      const runtime = createNotifRuntime();
      const notif = runtime.modules.notification as NotificationController;

      let targetId = '';

      function Consumer() {
        const { getById } = useNotification();
        const found = getById(targetId);
        return (
          <span data-testid="msg">{found?.message ?? 'none'}</span>
        );
      }

      render(
        <PrismUIProvider runtime={runtime}>
          <Consumer />
        </PrismUIProvider>,
      );

      expect(screen.getByTestId('msg').textContent).toBe('none');

      act(() => {
        targetId = notif.show({ type: 'info', message: 'Found me' });
      });

      expect(screen.getByTestId('msg').textContent).toBe('Found me');
    });

    it('useNotification.notifications shows message content', () => {
      const runtime = createNotifRuntime();
      const notif = runtime.modules.notification as NotificationController;

      function Consumer() {
        const { notifications } = useNotification();
        return (
          <span data-testid="msgs">{notifications.map((n) => n.message).join(',')}</span>
        );
      }

      render(
        <PrismUIProvider runtime={runtime}>
          <Consumer />
        </PrismUIProvider>,
      );

      act(() => {
        notif.show({ type: 'info', message: 'First' });
        notif.show({ type: 'error', message: 'Second' });
      });

      expect(screen.getByTestId('msgs').textContent).toBe('First,Second');
    });
  });

  // ── useSelector ─────────────────────────────────────────────────────

  describe('useSelector', () => {
    it('returns selected slice', () => {
      const runtime = createInteractionRuntime({
        modules: [createPageModule(), createModalModule()],
      });

      function Consumer() {
        const version = useSelector((s) => s.version);
        return <span data-testid="version">{version}</span>;
      }

      render(
        <PrismUIProvider runtime={runtime}>
          <Consumer />
        </PrismUIProvider>,
      );

      expect(screen.getByTestId('version').textContent).toBe('0');
    });

    it('re-renders on relevant change', () => {
      const runtime = createInteractionRuntime({
        modules: [createPageModule(), createModalModule()],
      });
      const modal = runtime.modules.modal as ModalController;

      function Consumer() {
        const stack = useSelector((s) => s.modalStack as string[]);
        return <span data-testid="count">{stack.length}</span>;
      }

      render(
        <PrismUIProvider runtime={runtime}>
          <Consumer />
        </PrismUIProvider>,
      );

      expect(screen.getByTestId('count').textContent).toBe('0');

      act(() => {
        modal.open('test');
      });

      expect(screen.getByTestId('count').textContent).toBe('1');
    });

    it('skips re-render on irrelevant change', () => {
      const runtime = createInteractionRuntime({
        modules: [createPageModule(), createModalModule()],
      });
      const page = runtime.modules.page as PageController;
      let renderCount = 0;

      function Consumer() {
        const stack = useSelector((s) => s.modalStack as string[]);
        renderCount++;
        return <span data-testid="count">{stack.length}</span>;
      }

      render(
        <PrismUIProvider runtime={runtime}>
          <Consumer />
        </PrismUIProvider>,
      );

      const initialRenders = renderCount;

      // Change page state — should not trigger re-render in modal selector
      act(() => {
        page.mount('Dashboard');
      });

      expect(renderCount).toBe(initialRenders);
    });

    it('works with createSelector', () => {
      const runtime = createInteractionRuntime({
        modules: [createPageModule(), createModalModule()],
      });
      const modal = runtime.modules.modal as ModalController;

      const selectModalCount: StateSelector<number> = createSelector(
        [(s) => s.modalStack as string[]],
        (stack) => stack.length,
      );

      function Consumer() {
        const count = useSelector(selectModalCount);
        return <span data-testid="count">{count}</span>;
      }

      render(
        <PrismUIProvider runtime={runtime}>
          <Consumer />
        </PrismUIProvider>,
      );

      expect(screen.getByTestId('count').textContent).toBe('0');

      act(() => {
        modal.open('a');
        modal.open('b');
      });

      expect(screen.getByTestId('count').textContent).toBe('2');
    });

    it('multiple useSelector hooks independent', () => {
      const runtime = createInteractionRuntime({
        modules: [createPageModule(), createModalModule()],
      });
      const modal = runtime.modules.modal as ModalController;
      const page = runtime.modules.page as PageController;

      function Consumer() {
        const modalCount = useSelector((s) => (s.modalStack as string[]).length);
        const currentPage = useSelector((s) => s.currentPage as string | null);
        return (
          <div>
            <span data-testid="modals">{modalCount}</span>
            <span data-testid="page">{String(currentPage)}</span>
          </div>
        );
      }

      render(
        <PrismUIProvider runtime={runtime}>
          <Consumer />
        </PrismUIProvider>,
      );

      act(() => {
        modal.open('test');
        page.mount('Home');
        page.transition('Home');
      });

      expect(screen.getByTestId('modals').textContent).toBe('1');
      expect(screen.getByTestId('page').textContent).toBe('Home');
    });
  });

  // ── useForm ──────────────────────────────────────────────────────────

  describe('useForm', () => {
    function createFormRuntime() {
      return createInteractionRuntime({
        modules: [createPageModule(), createModalModule(), createFormModule()],
      });
    }

    it('returns form state', () => {
      const runtime = createFormRuntime();

      function Consumer() {
        const form = useForm();
        return (
          <div>
            <span data-testid="submitting">{String(form.isSubmitting)}</span>
            <span data-testid="count">{form.submitCount}</span>
          </div>
        );
      }

      render(
        <PrismUIProvider runtime={runtime}>
          <Consumer />
        </PrismUIProvider>,
      );

      expect(screen.getByTestId('submitting').textContent).toBe('false');
      expect(screen.getByTestId('count').textContent).toBe('0');
    });

    it('registerField adds field reactively', () => {
      const runtime = createFormRuntime();
      const form = runtime.modules.form as FormController;

      function Consumer() {
        const { fields } = useForm();
        const fieldNames = Object.keys(fields);
        return <span data-testid="fields">{fieldNames.join(',') || 'empty'}</span>;
      }

      render(
        <PrismUIProvider runtime={runtime}>
          <Consumer />
        </PrismUIProvider>,
      );

      expect(screen.getByTestId('fields').textContent).toBe('empty');

      act(() => {
        form.registerField('email', 'test@example.com');
      });

      expect(screen.getByTestId('fields').textContent).toBe('email');
    });

    it('setValue updates field value', () => {
      const runtime = createFormRuntime();
      const form = runtime.modules.form as FormController;

      function Consumer() {
        const { fields } = useForm();
        const emailValue = fields.email?.value ?? 'none';
        return <span data-testid="email">{String(emailValue)}</span>;
      }

      render(
        <PrismUIProvider runtime={runtime}>
          <Consumer />
        </PrismUIProvider>,
      );

      act(() => {
        form.registerField('email', '');
      });

      act(() => {
        form.setValue('email', 'updated@test.com');
      });

      expect(screen.getByTestId('email').textContent).toBe('updated@test.com');
    });

    it('submitStart/submitSuccess flow', () => {
      const runtime = createFormRuntime();
      const form = runtime.modules.form as FormController;

      function Consumer() {
        const { isSubmitting, submitCount } = useForm();
        return (
          <div>
            <span data-testid="submitting">{String(isSubmitting)}</span>
            <span data-testid="count">{submitCount}</span>
          </div>
        );
      }

      render(
        <PrismUIProvider runtime={runtime}>
          <Consumer />
        </PrismUIProvider>,
      );

      act(() => {
        form.submitStart();
      });

      expect(screen.getByTestId('submitting').textContent).toBe('true');

      act(() => {
        form.submitSuccess();
      });

      expect(screen.getByTestId('submitting').textContent).toBe('false');
      expect(screen.getByTestId('count').textContent).toBe('1');
    });
  });

  // ── useAsync ─────────────────────────────────────────────────────────

  describe('useAsync', () => {
    function createAsyncRuntime() {
      return createInteractionRuntime({
        modules: [createPageModule(), createModalModule(), createAsyncModule()],
      });
    }

    it('returns operations state', () => {
      const runtime = createAsyncRuntime();

      function Consumer() {
        const { operations } = useAsync();
        return <span data-testid="ops">{Object.keys(operations).length}</span>;
      }

      render(
        <PrismUIProvider runtime={runtime}>
          <Consumer />
        </PrismUIProvider>,
      );

      expect(screen.getByTestId('ops').textContent).toBe('0');
    });

    it('start/success updates status', () => {
      const runtime = createAsyncRuntime();
      const async = runtime.modules.async as AsyncController;

      function Consumer() {
        const { operations } = useAsync();
        const status = operations.fetchUsers?.status ?? 'idle';
        return <span data-testid="status">{status}</span>;
      }

      render(
        <PrismUIProvider runtime={runtime}>
          <Consumer />
        </PrismUIProvider>,
      );

      expect(screen.getByTestId('status').textContent).toBe('idle');

      act(() => {
        async.start('fetchUsers');
      });

      expect(screen.getByTestId('status').textContent).toBe('loading');

      act(() => {
        async.success('fetchUsers', [1, 2, 3]);
      });

      expect(screen.getByTestId('status').textContent).toBe('success');
    });

    it('error sets error message', () => {
      const runtime = createAsyncRuntime();
      const async = runtime.modules.async as AsyncController;

      function Consumer() {
        const { operations } = useAsync();
        const error = operations.op1?.error ?? 'none';
        return <span data-testid="error">{error}</span>;
      }

      render(
        <PrismUIProvider runtime={runtime}>
          <Consumer />
        </PrismUIProvider>,
      );

      act(() => {
        async.start('op1');
      });

      act(() => {
        async.error('op1', 'Network failed');
      });

      expect(screen.getByTestId('error').textContent).toBe('Network failed');
    });

    it('isLoading reflects status', () => {
      const runtime = createAsyncRuntime();
      const asyncCtrl = runtime.modules.async as AsyncController;

      function Consumer() {
        const { isAnyLoading } = useAsync();
        return <span data-testid="loading">{String(isAnyLoading())}</span>;
      }

      render(
        <PrismUIProvider runtime={runtime}>
          <Consumer />
        </PrismUIProvider>,
      );

      expect(screen.getByTestId('loading').textContent).toBe('false');

      act(() => {
        asyncCtrl.start('op1');
      });

      expect(screen.getByTestId('loading').textContent).toBe('true');

      act(() => {
        asyncCtrl.success('op1');
      });

      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
  });

  // ── isolation ─────────────────────────────────────────────────────────

  describe('isolation', () => {
    it('hooks are thin wrappers (no business logic)', async () => {
      const fs = await import('node:fs');
      const path = await import('node:path');

      const files = ['use-page.ts', 'use-modal.ts', 'use-drawer.ts', 'use-notification.ts', 'use-selector.ts', 'use-form.ts', 'use-async.ts'];
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
