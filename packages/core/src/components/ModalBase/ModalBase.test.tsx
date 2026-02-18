import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PrismuiProvider } from '../../core/PrismuiProvider/PrismuiProvider';
import { overlayModule } from '../../core/runtime/overlay/overlayModule';
import { ModalBase } from './ModalBase';
import { ModalBaseOverlay } from './ModalBaseOverlay';
import { ModalBaseContent } from './ModalBaseContent';
import { useModalBaseContext } from './ModalBase.context';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <PrismuiProvider withCssVars={false} withCssBaseline={false} modules={[overlayModule()]}>
      {children}
    </PrismuiProvider>
  );
}

function ContextConsumer({ onCapture }: { onCapture: (ctx: any) => void }) {
  const ctx = useModalBaseContext();
  onCapture(ctx);
  return <div data-testid="ctx-consumer">context</div>;
}

// ---------------------------------------------------------------------------
// ModalBase — rendering
// ---------------------------------------------------------------------------

describe('ModalBase — rendering', () => {
  it('renders children when opened', () => {
    render(
      <Wrapper>
        <ModalBase opened onClose={vi.fn()}>
          <div data-testid="child">Hello</div>
        </ModalBase>
      </Wrapper>,
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('renders children when closed (always mounted)', () => {
    render(
      <Wrapper>
        <ModalBase opened={false} onClose={vi.fn()}>
          <div data-testid="child">Hello</div>
        </ModalBase>
      </Wrapper>,
    );

    // ModalBase itself is always rendered; subcomponents handle visibility via Transition
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('sets data-modal-base attribute on root', () => {
    render(
      <Wrapper>
        <ModalBase opened onClose={vi.fn()} data-testid="modal-root">
          content
        </ModalBase>
      </Wrapper>,
    );

    expect(screen.getByTestId('modal-root')).toHaveAttribute('data-modal-base');
  });

  it('sets data-active when overlay is active', async () => {
    render(
      <Wrapper>
        <ModalBase opened onClose={vi.fn()} data-testid="modal-root">
          content
        </ModalBase>
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('modal-root')).toHaveAttribute('data-active');
    });
  });

  it('does not set data-active when closed', () => {
    render(
      <Wrapper>
        <ModalBase opened={false} onClose={vi.fn()} data-testid="modal-root">
          content
        </ModalBase>
      </Wrapper>,
    );

    expect(screen.getByTestId('modal-root')).not.toHaveAttribute('data-active');
  });

  it('applies custom className', () => {
    render(
      <Wrapper>
        <ModalBase opened onClose={vi.fn()} className="custom-class" data-testid="modal-root">
          content
        </ModalBase>
      </Wrapper>,
    );

    expect(screen.getByTestId('modal-root').className).toContain('custom-class');
  });

  it('applies custom style', () => {
    render(
      <Wrapper>
        <ModalBase opened onClose={vi.fn()} style={{ backgroundColor: 'red' }} data-testid="modal-root">
          content
        </ModalBase>
      </Wrapper>,
    );

    const el = screen.getByTestId('modal-root');
    expect(el.style.backgroundColor).toBe('red');
  });
});

// ---------------------------------------------------------------------------
// ModalBase — z-index
// ---------------------------------------------------------------------------

describe('ModalBase — z-index', () => {
  it('applies allocated z-index from OverlayManager', async () => {
    render(
      <Wrapper>
        <ModalBase opened onClose={vi.fn()} data-testid="modal-root">
          content
        </ModalBase>
      </Wrapper>,
    );

    await waitFor(() => {
      const style = screen.getByTestId('modal-root').style;
      expect(parseInt(style.zIndex, 10)).toBeGreaterThanOrEqual(1000);
    });
  });

  it('uses custom zIndex prop when provided', () => {
    render(
      <Wrapper>
        <ModalBase opened onClose={vi.fn()} zIndex={9999} data-testid="modal-root">
          content
        </ModalBase>
      </Wrapper>,
    );

    expect(screen.getByTestId('modal-root').style.zIndex).toBe('9999');
  });
});

// ---------------------------------------------------------------------------
// ModalBase — context
// ---------------------------------------------------------------------------

describe('ModalBase — context', () => {
  it('provides context to children', () => {
    let ctx: any = null;

    render(
      <Wrapper>
        <ModalBase opened onClose={vi.fn()}>
          <ContextConsumer onCapture={(c) => { ctx = c; }} />
        </ModalBase>
      </Wrapper>,
    );

    expect(ctx).not.toBeNull();
    expect(ctx.opened).toBe(true);
    expect(typeof ctx.onClose).toBe('function');
    expect(ctx.trapFocus).toBe(true);
    expect(ctx.closeOnClickOutside).toBe(true);
  });

  it('context reflects opened=false', () => {
    let ctx: any = null;

    render(
      <Wrapper>
        <ModalBase opened={false} onClose={vi.fn()}>
          <ContextConsumer onCapture={(c) => { ctx = c; }} />
        </ModalBase>
      </Wrapper>,
    );

    expect(ctx.opened).toBe(false);
  });

  it('context reflects custom options', () => {
    let ctx: any = null;

    render(
      <Wrapper>
        <ModalBase opened onClose={vi.fn()} trapFocus={false} closeOnClickOutside={false}>
          <ContextConsumer onCapture={(c) => { ctx = c; }} />
        </ModalBase>
      </Wrapper>,
    );

    expect(ctx.trapFocus).toBe(false);
    expect(ctx.closeOnClickOutside).toBe(false);
  });

  it('useModalBaseContext throws outside ModalBase', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => { });

    expect(() => {
      render(
        <Wrapper>
          <ContextConsumer onCapture={() => { }} />
        </Wrapper>,
      );
    }).toThrow('useModalBaseContext must be used within a <ModalBase>');

    spy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// ModalBase — escape key
// ---------------------------------------------------------------------------

describe('ModalBase — escape key', () => {
  it('calls onClose on Escape when closeOnEscape is true', () => {
    const onClose = vi.fn();

    render(
      <Wrapper>
        <ModalBase opened onClose={onClose} closeOnEscape>
          content
        </ModalBase>
      </Wrapper>,
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose on Escape when closeOnEscape is false', () => {
    const onClose = vi.fn();

    render(
      <Wrapper>
        <ModalBase opened onClose={onClose} closeOnEscape={false}>
          content
        </ModalBase>
      </Wrapper>,
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// ModalBase — portal
// ---------------------------------------------------------------------------

describe('ModalBase — portal', () => {
  it('renders within portal by default', () => {
    render(
      <Wrapper>
        <div data-testid="parent">
          <ModalBase opened onClose={vi.fn()}>
            <div data-testid="portal-child">content</div>
          </ModalBase>
        </div>
      </Wrapper>,
    );

    // Portal renders outside the parent
    const parent = screen.getByTestId('parent');
    const child = screen.getByTestId('portal-child');
    expect(parent.contains(child)).toBe(false);
  });

  it('renders in-place when withinPortal is false', () => {
    render(
      <Wrapper>
        <div data-testid="parent">
          <ModalBase opened onClose={vi.fn()} withinPortal={false}>
            <div data-testid="inline-child">content</div>
          </ModalBase>
        </div>
      </Wrapper>,
    );

    const parent = screen.getByTestId('parent');
    const child = screen.getByTestId('inline-child');
    expect(parent.contains(child)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// ModalBaseOverlay — subcomponent
// ---------------------------------------------------------------------------

describe('ModalBaseOverlay', () => {
  it('renders when opened', async () => {
    render(
      <Wrapper>
        <ModalBase opened onClose={vi.fn()}>
          <ModalBaseOverlay data-testid="overlay" />
        </ModalBase>
      </Wrapper>,
    );

    // Overlay should be rendered (Transition mounted=true)
    await waitFor(() => {
      expect(screen.getByTestId('overlay')).toBeInTheDocument();
    });
  });

  it('calls onClose when clicked and closeOnClickOutside is true', async () => {
    const onClose = vi.fn();

    render(
      <Wrapper>
        <ModalBase opened onClose={onClose} closeOnClickOutside>
          <ModalBaseOverlay data-testid="overlay-click" />
        </ModalBase>
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('overlay-click')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('overlay-click'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when closeOnClickOutside is false', async () => {
    const onClose = vi.fn();

    render(
      <Wrapper>
        <ModalBase opened onClose={onClose} closeOnClickOutside={false}>
          <ModalBaseOverlay data-testid="overlay-no-close" />
        </ModalBase>
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('overlay-no-close')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('overlay-no-close'));
    expect(onClose).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// ModalBaseContent — subcomponent
// ---------------------------------------------------------------------------

describe('ModalBaseContent', () => {
  it('renders with role="dialog" and aria-modal', async () => {
    render(
      <Wrapper>
        <ModalBase opened onClose={vi.fn()}>
          <ModalBaseContent>Dialog content</ModalBaseContent>
        </ModalBase>
      </Wrapper>,
    );

    await waitFor(() => {
      const dialog = document.querySelector('[role="dialog"]');
      expect(dialog).toBeTruthy();
      expect(dialog).toHaveAttribute('aria-modal');
    });
  });

  it('renders children inside Paper', async () => {
    render(
      <Wrapper>
        <ModalBase opened onClose={vi.fn()}>
          <ModalBaseContent>
            <div data-testid="dialog-child">Hello</div>
          </ModalBaseContent>
        </ModalBase>
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('dialog-child')).toBeInTheDocument();
    });
  });
});

// ---------------------------------------------------------------------------
// ModalBase — defaults
// ---------------------------------------------------------------------------

describe('ModalBase — defaults', () => {
  it('defaults trapFocus to true', () => {
    let ctx: any = null;

    render(
      <Wrapper>
        <ModalBase opened onClose={vi.fn()}>
          <ContextConsumer onCapture={(c) => { ctx = c; }} />
        </ModalBase>
      </Wrapper>,
    );

    expect(ctx.trapFocus).toBe(true);
  });

  it('defaults closeOnClickOutside to true', () => {
    let ctx: any = null;

    render(
      <Wrapper>
        <ModalBase opened onClose={vi.fn()}>
          <ContextConsumer onCapture={(c) => { ctx = c; }} />
        </ModalBase>
      </Wrapper>,
    );

    expect(ctx.closeOnClickOutside).toBe(true);
  });
});
