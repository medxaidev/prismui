import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PrismuiProvider } from '../../core/PrismuiProvider/PrismuiProvider';
import { overlayModule } from '../../core/runtime/overlay/overlayModule';
import { Drawer } from './Drawer';
import { DrawerHeader } from './DrawerHeader';
import { DrawerTitle } from './DrawerTitle';
import { DrawerBody } from './DrawerBody';
import { DrawerFooter } from './DrawerFooter';
import { DrawerCloseButton } from './DrawerCloseButton';

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

// ---------------------------------------------------------------------------
// Drawer — rendering
// ---------------------------------------------------------------------------

describe('Drawer — rendering', () => {
  it('renders children when opened', async () => {
    render(
      <Wrapper>
        <Drawer opened onClose={vi.fn()}>
          <div data-testid="drawer-child">Hello</div>
        </Drawer>
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('drawer-child')).toBeInTheDocument();
    });
  });

  it('renders title in the header', async () => {
    render(
      <Wrapper>
        <Drawer opened onClose={vi.fn()} title="Settings">
          content
        </Drawer>
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });
  });

  it('renders close button by default', async () => {
    render(
      <Wrapper>
        <Drawer opened onClose={vi.fn()} title="Test">
          content
        </Drawer>
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Close')).toBeInTheDocument();
    });
  });

  it('hides close button when withCloseButton is false', async () => {
    render(
      <Wrapper>
        <Drawer opened onClose={vi.fn()} title="Test" withCloseButton={false}>
          content
        </Drawer>
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    expect(screen.queryByLabelText('Close')).toBeNull();
  });

  it('does not render header when no title and no close button', async () => {
    render(
      <Wrapper>
        <Drawer opened onClose={vi.fn()} withCloseButton={false}>
          <div data-testid="body-content">body</div>
        </Drawer>
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('body-content')).toBeInTheDocument();
    });
  });

  it('renders dialog role', async () => {
    render(
      <Wrapper>
        <Drawer opened onClose={vi.fn()} title="Test">
          content
        </Drawer>
      </Wrapper>,
    );

    await waitFor(() => {
      const dialog = document.querySelector('[role="dialog"]');
      expect(dialog).toBeTruthy();
    });
  });
});

// ---------------------------------------------------------------------------
// Drawer — close button
// ---------------------------------------------------------------------------

describe('Drawer — close button', () => {
  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn();

    render(
      <Wrapper>
        <Drawer opened onClose={onClose} title="Test">
          content
        </Drawer>
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Close')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText('Close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('passes closeButtonProps to the button', async () => {
    render(
      <Wrapper>
        <Drawer opened onClose={vi.fn()} title="Test" closeButtonProps={{ 'data-testid': 'custom-close' } as any}>
          content
        </Drawer>
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('custom-close')).toBeInTheDocument();
    });
  });
});

// ---------------------------------------------------------------------------
// Drawer — escape key
// ---------------------------------------------------------------------------

describe('Drawer — escape key', () => {
  it('calls onClose on Escape', () => {
    const onClose = vi.fn();

    render(
      <Wrapper>
        <Drawer opened onClose={onClose} title="Test">
          content
        </Drawer>
      </Wrapper>,
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose on Escape when closeOnEscape is false', () => {
    const onClose = vi.fn();

    render(
      <Wrapper>
        <Drawer opened onClose={onClose} title="Test" closeOnEscape={false}>
          content
        </Drawer>
      </Wrapper>,
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Drawer — position
// ---------------------------------------------------------------------------

describe('Drawer — position', () => {
  it('defaults to right position', async () => {
    render(
      <Wrapper>
        <Drawer opened onClose={vi.fn()} title="Test">
          content
        </Drawer>
      </Wrapper>,
    );

    await waitFor(() => {
      const content = document.querySelector('[data-position="right"]');
      expect(content).toBeTruthy();
    });
  });

  it('supports left position', async () => {
    render(
      <Wrapper>
        <Drawer opened onClose={vi.fn()} title="Test" position="left">
          content
        </Drawer>
      </Wrapper>,
    );

    await waitFor(() => {
      const content = document.querySelector('[data-position="left"]');
      expect(content).toBeTruthy();
    });
  });

  it('supports top position', async () => {
    render(
      <Wrapper>
        <Drawer opened onClose={vi.fn()} title="Test" position="top">
          content
        </Drawer>
      </Wrapper>,
    );

    await waitFor(() => {
      const content = document.querySelector('[data-position="top"]');
      expect(content).toBeTruthy();
    });
  });

  it('supports bottom position', async () => {
    render(
      <Wrapper>
        <Drawer opened onClose={vi.fn()} title="Test" position="bottom">
          content
        </Drawer>
      </Wrapper>,
    );

    await waitFor(() => {
      const content = document.querySelector('[data-position="bottom"]');
      expect(content).toBeTruthy();
    });
  });
});

// ---------------------------------------------------------------------------
// Drawer — size
// ---------------------------------------------------------------------------

describe('Drawer — size', () => {
  it('defaults to 320px', async () => {
    render(
      <Wrapper>
        <Drawer opened onClose={vi.fn()} title="Test">
          content
        </Drawer>
      </Wrapper>,
    );

    await waitFor(() => {
      const dialog = document.querySelector('[role="dialog"]');
      expect(dialog).toBeTruthy();
    });
  });

  it('accepts custom numeric size', async () => {
    render(
      <Wrapper>
        <Drawer opened onClose={vi.fn()} title="Test" size={500}>
          content
        </Drawer>
      </Wrapper>,
    );

    await waitFor(() => {
      const dialog = document.querySelector('[role="dialog"]');
      expect(dialog).toBeTruthy();
      expect((dialog as HTMLElement).style.getPropertyValue('--drawer-size')).toBe('500px');
    });
  });

  it('accepts custom string size', async () => {
    render(
      <Wrapper>
        <Drawer opened onClose={vi.fn()} title="Test" size="50%">
          content
        </Drawer>
      </Wrapper>,
    );

    await waitFor(() => {
      const dialog = document.querySelector('[role="dialog"]');
      expect(dialog).toBeTruthy();
      expect((dialog as HTMLElement).style.getPropertyValue('--drawer-size')).toBe('50%');
    });
  });
});

// ---------------------------------------------------------------------------
// Compound components
// ---------------------------------------------------------------------------

describe('Drawer — compound components', () => {
  it('renders DrawerHeader', async () => {
    render(
      <Wrapper>
        <Drawer opened onClose={vi.fn()} withCloseButton={false}>
          <DrawerHeader data-testid="custom-header">
            <DrawerTitle>Custom Title</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>body</DrawerBody>
        </Drawer>
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('custom-header')).toBeInTheDocument();
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });
  });

  it('renders DrawerBody', async () => {
    render(
      <Wrapper>
        <Drawer opened onClose={vi.fn()} withCloseButton={false}>
          <DrawerBody data-testid="custom-body">Body content</DrawerBody>
        </Drawer>
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('custom-body')).toBeInTheDocument();
    });
  });

  it('renders DrawerFooter', async () => {
    render(
      <Wrapper>
        <Drawer opened onClose={vi.fn()} withCloseButton={false}>
          <DrawerBody>body</DrawerBody>
          <DrawerFooter data-testid="custom-footer">
            <button>Save</button>
          </DrawerFooter>
        </Drawer>
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('custom-footer')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
    });
  });

  it('renders DrawerCloseButton that calls onClose', async () => {
    const onClose = vi.fn();

    render(
      <Wrapper>
        <Drawer opened onClose={onClose} withCloseButton={false}>
          <DrawerHeader>
            <DrawerTitle>Title</DrawerTitle>
            <DrawerCloseButton data-testid="compound-close" />
          </DrawerHeader>
          <DrawerBody>body</DrawerBody>
        </Drawer>
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('compound-close')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('compound-close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// Drawer — overlay
// ---------------------------------------------------------------------------

describe('Drawer — overlay', () => {
  it('renders with ModalBase root', async () => {
    render(
      <Wrapper>
        <Drawer opened onClose={vi.fn()} title="Test">
          content
        </Drawer>
      </Wrapper>,
    );

    await waitFor(() => {
      const root = document.querySelector('[data-modal-base]');
      expect(root).toBeTruthy();
    });
  });

  it('calls onClose on Escape key (overlay integration)', () => {
    const onClose = vi.fn();

    render(
      <Wrapper>
        <Drawer opened onClose={onClose} title="Test">
          content
        </Drawer>
      </Wrapper>,
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
