import { describe, expect, it, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { PrismuiProvider } from '../../PrismuiProvider/PrismuiProvider';
import { overlayModule } from './overlayModule';
import { useOverlay } from './useOverlay';
import { useOverlayManager } from './useOverlayManager';
import type { UseOverlayReturn } from './useOverlay';
import type { OverlayManager } from './types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function OverlayProvider({ children }: { children: React.ReactNode }) {
  return (
    <PrismuiProvider withCssVars={false} withCssBaseline={false} modules={[overlayModule()]}>
      {children}
    </PrismuiProvider>
  );
}

function OverlayConsumer({
  opened,
  onClose,
  onCapture,
  trapFocus,
  closeOnEscape,
  lockScroll,
}: {
  opened: boolean;
  onClose: () => void;
  onCapture: (r: UseOverlayReturn) => void;
  trapFocus?: boolean;
  closeOnEscape?: boolean;
  lockScroll?: boolean;
}) {
  const result = useOverlay({ opened, onClose, trapFocus, closeOnEscape, lockScroll });
  onCapture(result);
  return <div data-testid="overlay">{opened ? 'open' : 'closed'}</div>;
}

function ManagerInspector({ onCapture }: { onCapture: (m: OverlayManager) => void }) {
  const manager = useOverlayManager();
  onCapture(manager);
  return null;
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

describe('useOverlay — registration', () => {
  it('registers overlay when opened is true', () => {
    let manager: OverlayManager | null = null;

    render(
      <OverlayProvider>
        <OverlayConsumer opened={true} onClose={vi.fn()} onCapture={() => { }} />
        <ManagerInspector onCapture={(m) => { manager = m; }} />
      </OverlayProvider>,
    );

    expect(manager!.getStackSize()).toBe(1);
  });

  it('does not register when opened is false', () => {
    let manager: OverlayManager | null = null;

    render(
      <OverlayProvider>
        <OverlayConsumer opened={false} onClose={vi.fn()} onCapture={() => { }} />
        <ManagerInspector onCapture={(m) => { manager = m; }} />
      </OverlayProvider>,
    );

    expect(manager!.getStackSize()).toBe(0);
  });

  it('unregisters on unmount', () => {
    let manager: OverlayManager | null = null;

    const { unmount } = render(
      <OverlayProvider>
        <OverlayConsumer opened={true} onClose={vi.fn()} onCapture={() => { }} />
        <ManagerInspector onCapture={(m) => { manager = m; }} />
      </OverlayProvider>,
    );

    expect(manager!.getStackSize()).toBe(1);
    unmount();
    // After unmount, the overlay module itself is torn down, stack is gone
  });

  it('returns a unique overlayId', () => {
    let id1 = '';
    let id2 = '';

    render(
      <OverlayProvider>
        <OverlayConsumer opened={true} onClose={vi.fn()} onCapture={(r) => { id1 = r.overlayId; }} />
        <OverlayConsumer opened={true} onClose={vi.fn()} onCapture={(r) => { id2 = r.overlayId; }} />
      </OverlayProvider>,
    );

    expect(id1).toBeTruthy();
    expect(id2).toBeTruthy();
    expect(id1).not.toBe(id2);
  });
});

// ---------------------------------------------------------------------------
// Z-index
// ---------------------------------------------------------------------------

describe('useOverlay — z-index', () => {
  it('allocates z-index for opened overlay', () => {
    let result: UseOverlayReturn | null = null;

    render(
      <OverlayProvider>
        <OverlayConsumer opened={true} onClose={vi.fn()} onCapture={(r) => { result = r; }} />
      </OverlayProvider>,
    );

    expect(result!.zIndex).toBeGreaterThanOrEqual(1000);
  });

  it('returns 0 z-index when not opened', () => {
    let result: UseOverlayReturn | null = null;

    render(
      <OverlayProvider>
        <OverlayConsumer opened={false} onClose={vi.fn()} onCapture={(r) => { result = r; }} />
      </OverlayProvider>,
    );

    expect(result!.zIndex).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Active state
// ---------------------------------------------------------------------------

describe('useOverlay — active state', () => {
  it('topmost overlay is active', () => {
    let result2: UseOverlayReturn | null = null;

    render(
      <OverlayProvider>
        <OverlayConsumer opened={true} onClose={vi.fn()} onCapture={() => { }} />
        <OverlayConsumer opened={true} onClose={vi.fn()} onCapture={(r) => { result2 = r; }} />
      </OverlayProvider>,
    );

    // The second overlay should be active (topmost)
    expect(result2!.isActive).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Escape key integration
// ---------------------------------------------------------------------------

describe('useOverlay — escape key', () => {
  it('closes overlay on Escape when closeOnEscape is true', () => {
    const onClose = vi.fn();

    render(
      <OverlayProvider>
        <OverlayConsumer opened={true} onClose={onClose} closeOnEscape={true} onCapture={() => { }} />
      </OverlayProvider>,
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close overlay on Escape when closeOnEscape is false', () => {
    const onClose = vi.fn();

    render(
      <OverlayProvider>
        <OverlayConsumer opened={true} onClose={onClose} closeOnEscape={false} onCapture={() => { }} />
      </OverlayProvider>,
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('only closes topmost overlay on Escape', () => {
    const onClose1 = vi.fn();
    const onClose2 = vi.fn();

    render(
      <OverlayProvider>
        <OverlayConsumer opened={true} onClose={onClose1} onCapture={() => { }} />
        <OverlayConsumer opened={true} onClose={onClose2} onCapture={() => { }} />
      </OverlayProvider>,
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose2).toHaveBeenCalledTimes(1);
    expect(onClose1).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Default options
// ---------------------------------------------------------------------------

describe('useOverlay — defaults', () => {
  it('defaults trapFocus to true', () => {
    let manager: OverlayManager | null = null;

    render(
      <OverlayProvider>
        <OverlayConsumer opened={true} onClose={vi.fn()} onCapture={() => { }} />
        <ManagerInspector onCapture={(m) => { manager = m; }} />
      </OverlayProvider>,
    );

    const stack = manager!.getStack();
    expect(stack[0]?.trapFocus).toBe(true);
  });

  it('defaults closeOnEscape to true', () => {
    let manager: OverlayManager | null = null;

    render(
      <OverlayProvider>
        <OverlayConsumer opened={true} onClose={vi.fn()} onCapture={() => { }} />
        <ManagerInspector onCapture={(m) => { manager = m; }} />
      </OverlayProvider>,
    );

    const stack = manager!.getStack();
    expect(stack[0]?.closeOnEscape).toBe(true);
  });

  it('defaults lockScroll to true', () => {
    let manager: OverlayManager | null = null;

    render(
      <OverlayProvider>
        <OverlayConsumer opened={true} onClose={vi.fn()} onCapture={() => { }} />
        <ManagerInspector onCapture={(m) => { manager = m; }} />
      </OverlayProvider>,
    );

    const stack = manager!.getStack();
    expect(stack[0]?.lockScroll).toBe(true);
  });

  it('respects custom option overrides', () => {
    let manager: OverlayManager | null = null;

    render(
      <OverlayProvider>
        <OverlayConsumer
          opened={true}
          onClose={vi.fn()}
          trapFocus={false}
          closeOnEscape={false}
          lockScroll={false}
          onCapture={() => { }}
        />
        <ManagerInspector onCapture={(m) => { manager = m; }} />
      </OverlayProvider>,
    );

    const stack = manager!.getStack();
    expect(stack[0]?.trapFocus).toBe(false);
    expect(stack[0]?.closeOnEscape).toBe(false);
    expect(stack[0]?.lockScroll).toBe(false);
  });
});
