// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import {
  createInteractionRuntime,
  createNotificationModule,
  type NotificationController,
} from '@prismui/core';
import { PrismUIProvider } from '../provider';
import { NotificationRenderer } from './NotificationRenderer';
import type { NotificationRendererProps } from './NotificationRenderer';

function setup(props?: Partial<NotificationRendererProps>) {
  const runtime = createInteractionRuntime({
    modules: [createNotificationModule({ maxNotifications: 50 })],
  });
  const notification = runtime.modules.notification as NotificationController;

  const result = render(
    <PrismUIProvider runtime={runtime}>
      <NotificationRenderer {...props} />
    </PrismUIProvider>,
  );

  return { runtime, notification, result };
}

describe('NotificationRenderer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── rendering ───────────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders nothing when no notifications', () => {
      setup();
      expect(screen.queryByTestId('notification-container')).toBeNull();
    });

    it('renders notification when shown', () => {
      const { notification } = setup();
      act(() => notification.show({ type: 'info', message: 'Hello' }));
      expect(screen.getByTestId('notification-container')).toBeDefined();
      expect(screen.getByText('Hello')).toBeDefined();
    });

    it('renders multiple notifications', () => {
      const { notification } = setup();
      act(() => {
        notification.show({ type: 'info', message: 'First' });
        notification.show({ type: 'success', message: 'Second' });
      });
      expect(screen.getByText('First')).toBeDefined();
      expect(screen.getByText('Second')).toBeDefined();
    });

    it('removes notification from DOM when dismissed', () => {
      const { notification } = setup();
      let id: string;
      act(() => { id = notification.show({ type: 'info', message: 'Temp' }); });
      expect(screen.getByText('Temp')).toBeDefined();
      act(() => notification.dismiss(id!));
      expect(screen.queryByText('Temp')).toBeNull();
    });

    it('renders into a portal (document.body)', () => {
      const { notification } = setup();
      act(() => notification.show({ type: 'info', message: 'Portal' }));
      const container = screen.getByTestId('notification-container');
      expect(container.parentElement).toBe(document.body);
    });
  });

  // ── notification types ──────────────────────────────────────────────────

  describe('notification types', () => {
    it('renders info notification with alert role', () => {
      const { notification } = setup();
      let id: string;
      act(() => { id = notification.show({ type: 'info', message: 'Info msg' }); });
      const toast = screen.getByTestId(`notification-toast-${id!}`);
      expect(toast.getAttribute('role')).toBe('alert');
    });

    it('renders success notification', () => {
      const { notification } = setup();
      act(() => notification.show({ type: 'success', message: 'Success msg' }));
      expect(screen.getByText('Success msg')).toBeDefined();
      expect(screen.getByText('✓')).toBeDefined();
    });

    it('renders warning notification', () => {
      const { notification } = setup();
      act(() => notification.show({ type: 'warning', message: 'Warning msg' }));
      expect(screen.getByText('Warning msg')).toBeDefined();
      expect(screen.getByText('⚠')).toBeDefined();
    });

    it('renders error notification', () => {
      const { notification } = setup();
      act(() => notification.show({ type: 'error', message: 'Error msg' }));
      expect(screen.getByText('Error msg')).toBeDefined();
      expect(screen.getByText('✕')).toBeDefined();
    });
  });

  // ── dismiss button ──────────────────────────────────────────────────────

  describe('dismiss button', () => {
    it('dismiss button removes notification', () => {
      const { notification } = setup();
      let id: string;
      act(() => { id = notification.show({ type: 'info', message: 'Dismissable' }); });
      fireEvent.click(screen.getByTestId(`notification-dismiss-${id!}`));
      expect(screen.queryByText('Dismissable')).toBeNull();
    });
  });

  // ── auto dismiss ────────────────────────────────────────────────────────

  describe('auto dismiss', () => {
    it('auto-dismisses after autoDismissMs', () => {
      const { notification } = setup();
      act(() => notification.show({ type: 'info', message: 'Auto', autoDismissMs: 3000 }));
      expect(screen.getByText('Auto')).toBeDefined();
      act(() => vi.advanceTimersByTime(3000));
      expect(screen.queryByText('Auto')).toBeNull();
    });

    it('does not auto-dismiss without autoDismissMs', () => {
      const { notification } = setup();
      act(() => notification.show({ type: 'info', message: 'Persistent' }));
      act(() => vi.advanceTimersByTime(10000));
      expect(screen.getByText('Persistent')).toBeDefined();
    });
  });

  // ── position ────────────────────────────────────────────────────────────

  describe('position', () => {
    it('defaults to top-right', () => {
      const { notification } = setup();
      act(() => notification.show({ type: 'info', message: 'Pos' }));
      const container = screen.getByTestId('notification-container');
      expect(container.getAttribute('data-position')).toBe('top-right');
    });

    it('supports bottom-left position', () => {
      const { notification } = setup({ position: 'bottom-left' });
      act(() => notification.show({ type: 'info', message: 'BL' }));
      const container = screen.getByTestId('notification-container');
      expect(container.getAttribute('data-position')).toBe('bottom-left');
    });
  });

  // ── custom render ───────────────────────────────────────────────────────

  describe('custom render', () => {
    it('uses custom renderNotification when provided', () => {
      const customRender = (entry: any, dismiss: () => void) => (
        <div data-testid="custom-toast">
          <span>{entry.message}</span>
          <button data-testid="custom-dismiss" onClick={dismiss}>X</button>
        </div>
      );
      const { notification } = setup({ renderNotification: customRender });
      act(() => notification.show({ type: 'info', message: 'Custom' }));
      expect(screen.getByTestId('custom-toast')).toBeDefined();
      expect(screen.getByText('Custom')).toBeDefined();
    });

    it('custom dismiss function works', () => {
      const customRender = (entry: any, dismiss: () => void) => (
        <div data-testid="custom-toast">
          <button data-testid="custom-dismiss" onClick={dismiss}>X</button>
        </div>
      );
      const { notification } = setup({ renderNotification: customRender });
      act(() => notification.show({ type: 'info', message: 'Custom dismiss' }));
      fireEvent.click(screen.getByTestId('custom-dismiss'));
      expect(screen.queryByTestId('custom-toast')).toBeNull();
    });
  });
});
