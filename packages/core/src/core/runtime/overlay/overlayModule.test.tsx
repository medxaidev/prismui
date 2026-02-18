import { describe, expect, it, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { PrismuiProvider } from '../../PrismuiProvider/PrismuiProvider';
import { overlayModule } from './overlayModule';
import { useOverlayManager } from './useOverlayManager';
import { useRuntimeKernel } from '../RuntimeContext';
import type { OverlayManager } from './types';
import type { RuntimeKernel } from '../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function ManagerConsumer({ onCapture }: { onCapture: (m: OverlayManager) => void }) {
  const manager = useOverlayManager();
  onCapture(manager);
  return <div>consumer</div>;
}

function KernelConsumer({ onCapture }: { onCapture: (k: RuntimeKernel) => void }) {
  const kernel = useRuntimeKernel();
  onCapture(kernel);
  return null;
}

// ---------------------------------------------------------------------------
// overlayModule — setup
// ---------------------------------------------------------------------------

describe('overlayModule — setup', () => {
  it('registers OverlayManager in the kernel', () => {
    let kernel: RuntimeKernel | null = null;

    render(
      <PrismuiProvider withCssVars={false} withCssBaseline={false} modules={[overlayModule()]}>
        <KernelConsumer onCapture={(k) => { kernel = k; }} />
      </PrismuiProvider>,
    );

    expect(kernel).not.toBeNull();
    expect(kernel!.has('overlay')).toBe(true);
  });

  it('registered manager has expected API', () => {
    let manager: OverlayManager | null = null;

    render(
      <PrismuiProvider withCssVars={false} withCssBaseline={false} modules={[overlayModule()]}>
        <ManagerConsumer onCapture={(m) => { manager = m; }} />
      </PrismuiProvider>,
    );

    expect(manager).not.toBeNull();
    expect(typeof manager!.register).toBe('function');
    expect(typeof manager!.unregister).toBe('function');
    expect(typeof manager!.getStack).toBe('function');
    expect(typeof manager!.handleEscape).toBe('function');
  });

  it('accepts custom baseZIndex', () => {
    let manager: OverlayManager | null = null;

    render(
      <PrismuiProvider withCssVars={false} withCssBaseline={false} modules={[overlayModule({ baseZIndex: 5000 })]}>
        <ManagerConsumer onCapture={(m) => { manager = m; }} />
      </PrismuiProvider>,
    );

    manager!.register({ id: 'test', trapFocus: true, closeOnEscape: true, lockScroll: true, onClose: vi.fn() });
    expect(manager!.getZIndex('test')).toBe(5000);
  });
});

// ---------------------------------------------------------------------------
// useOverlayManager hook
// ---------------------------------------------------------------------------

describe('useOverlayManager', () => {
  it('returns the manager when overlayModule is registered', () => {
    let manager: OverlayManager | null = null;

    render(
      <PrismuiProvider withCssVars={false} withCssBaseline={false} modules={[overlayModule()]}>
        <ManagerConsumer onCapture={(m) => { manager = m; }} />
      </PrismuiProvider>,
    );

    expect(manager).not.toBeNull();
  });

  it('throws when overlayModule is not registered', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => { });

    expect(() => {
      render(
        <PrismuiProvider withCssVars={false} withCssBaseline={false}>
          <ManagerConsumer onCapture={() => { }} />
        </PrismuiProvider>,
      );
    }).toThrow('OverlayManager not found');

    spy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// Global escape handler
// ---------------------------------------------------------------------------

describe('Global escape handler', () => {
  it('calls handleEscape on Escape keydown', () => {
    let manager: OverlayManager | null = null;
    const onClose = vi.fn();

    render(
      <PrismuiProvider withCssVars={false} withCssBaseline={false} modules={[overlayModule()]}>
        <ManagerConsumer onCapture={(m) => { manager = m; }} />
      </PrismuiProvider>,
    );

    manager!.register({ id: 'test', trapFocus: true, closeOnEscape: true, lockScroll: true, onClose });

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not react to non-Escape keys', () => {
    let manager: OverlayManager | null = null;
    const onClose = vi.fn();

    render(
      <PrismuiProvider withCssVars={false} withCssBaseline={false} modules={[overlayModule()]}>
        <ManagerConsumer onCapture={(m) => { manager = m; }} />
      </PrismuiProvider>,
    );

    manager!.register({ id: 'test', trapFocus: true, closeOnEscape: true, lockScroll: true, onClose });

    fireEvent.keyDown(document, { key: 'Enter' });
    fireEvent.keyDown(document, { key: 'Tab' });

    expect(onClose).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Teardown / cleanup
// ---------------------------------------------------------------------------

describe('overlayModule — teardown', () => {
  it('removes global keydown listener on unmount', () => {
    const onClose = vi.fn();
    let manager: OverlayManager | null = null;

    const { unmount } = render(
      <PrismuiProvider withCssVars={false} withCssBaseline={false} modules={[overlayModule()]}>
        <ManagerConsumer onCapture={(m) => { manager = m; }} />
      </PrismuiProvider>,
    );

    manager!.register({ id: 'test', trapFocus: true, closeOnEscape: true, lockScroll: true, onClose });

    unmount();

    // After unmount, the global listener should be removed
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });
});
