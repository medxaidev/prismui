// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import React from 'react';
import {
  createInteractionRuntime,
  createModalModule,
  createDrawerModule,
  createNotificationModule,
  type ModalController,
  type DrawerController,
  type NotificationController,
  type DrawerAnchor,
} from '@prismui/core';
import { PrismUIProvider } from '../provider';
import { PrismUIRootRenderer } from './PrismUIRootRenderer';

function setup() {
  const runtime = createInteractionRuntime({
    modules: [
      createModalModule(),
      createDrawerModule(),
      createNotificationModule({ maxNotifications: 50 }),
    ],
  });
  const modal = runtime.modules.modal as ModalController;
  const drawer = runtime.modules.drawer as DrawerController;
  const notification = runtime.modules.notification as NotificationController;

  const result = render(
    <PrismUIProvider runtime={runtime}>
      <PrismUIRootRenderer
        modal={{
          children: (id: string, close: () => void) => (
            <div data-testid={`root-modal-${id}`}>
              <button data-testid={`root-modal-close-${id}`} onClick={close}>Close</button>
            </div>
          ),
        }}
        drawer={{
          children: (id: string, anchor: DrawerAnchor, close: () => void) => (
            <div data-testid={`root-drawer-${id}`}>
              <span>{anchor}</span>
              <button data-testid={`root-drawer-close-${id}`} onClick={close}>Close</button>
            </div>
          ),
        }}
        notification={{ position: 'bottom-right' }}
      />
    </PrismUIProvider>,
  );

  return { runtime, modal, drawer, notification, result };
}

describe('PrismUIRootRenderer', () => {
  it('renders nothing when all stacks are empty', () => {
    setup();
    expect(screen.queryByTestId(/root-modal/)).toBeNull();
    expect(screen.queryByTestId(/root-drawer/)).toBeNull();
    expect(screen.queryByTestId('notification-container')).toBeNull();
  });

  it('renders modals when opened', () => {
    const { modal } = setup();
    act(() => modal.open('test'));
    expect(screen.getByTestId('root-modal-test')).toBeDefined();
  });

  it('renders drawers when opened', () => {
    const { drawer } = setup();
    act(() => drawer.open('nav', 'left'));
    expect(screen.getByTestId('root-drawer-nav')).toBeDefined();
  });

  it('renders notifications when shown', () => {
    const { notification } = setup();
    act(() => notification.show({ type: 'success', message: 'All good!' }));
    expect(screen.getByText('All good!')).toBeDefined();
    const container = screen.getByTestId('notification-container');
    expect(container.getAttribute('data-position')).toBe('bottom-right');
  });

  it('renders all three simultaneously', () => {
    const { modal, drawer, notification } = setup();
    act(() => {
      modal.open('confirm');
      drawer.open('settings', 'right');
      notification.show({ type: 'info', message: 'Hello!' });
    });
    expect(screen.getByTestId('root-modal-confirm')).toBeDefined();
    expect(screen.getByTestId('root-drawer-settings')).toBeDefined();
    expect(screen.getByText('Hello!')).toBeDefined();
  });
});
