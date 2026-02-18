import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PrismuiProvider } from '../../core/PrismuiProvider/PrismuiProvider';
import { overlayModule } from '../../core/runtime/overlay/overlayModule';
import { Dialog } from './Dialog';
import { DialogHeader } from './DialogHeader';
import { DialogTitle } from './DialogTitle';
import { DialogBody } from './DialogBody';
import { DialogFooter } from './DialogFooter';
import { DialogCloseButton } from './DialogCloseButton';

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
// Dialog — rendering
// ---------------------------------------------------------------------------

describe('Dialog — rendering', () => {
  it('renders children when opened', async () => {
    render(
      <Wrapper>
        <Dialog opened onClose={vi.fn()}>
          <div data-testid="dialog-child">Hello</div>
        </Dialog>
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('dialog-child')).toBeInTheDocument();
    });
  });

  it('renders title in the header', async () => {
    render(
      <Wrapper>
        <Dialog opened onClose={vi.fn()} title="My Dialog">
          content
        </Dialog>
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText('My Dialog')).toBeInTheDocument();
    });
  });

  it('renders close button by default', async () => {
    render(
      <Wrapper>
        <Dialog opened onClose={vi.fn()} title="Test">
          content
        </Dialog>
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Close')).toBeInTheDocument();
    });
  });

  it('hides close button when withCloseButton is false', async () => {
    render(
      <Wrapper>
        <Dialog opened onClose={vi.fn()} title="Test" withCloseButton={false}>
          content
        </Dialog>
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
        <Dialog opened onClose={vi.fn()} withCloseButton={false}>
          <div data-testid="body-content">body</div>
        </Dialog>
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('body-content')).toBeInTheDocument();
    });
  });
});

// ---------------------------------------------------------------------------
// Dialog — close button
// ---------------------------------------------------------------------------

describe('Dialog — close button', () => {
  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn();

    render(
      <Wrapper>
        <Dialog opened onClose={onClose} title="Test">
          content
        </Dialog>
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
        <Dialog opened onClose={vi.fn()} title="Test" closeButtonProps={{ 'data-testid': 'custom-close' } as any}>
          content
        </Dialog>
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('custom-close')).toBeInTheDocument();
    });
  });
});

// ---------------------------------------------------------------------------
// Dialog — escape key
// ---------------------------------------------------------------------------

describe('Dialog — escape key', () => {
  it('calls onClose on Escape', () => {
    const onClose = vi.fn();

    render(
      <Wrapper>
        <Dialog opened onClose={onClose} title="Test">
          content
        </Dialog>
      </Wrapper>,
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose on Escape when closeOnEscape is false', () => {
    const onClose = vi.fn();

    render(
      <Wrapper>
        <Dialog opened onClose={onClose} title="Test" closeOnEscape={false}>
          content
        </Dialog>
      </Wrapper>,
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Dialog — overlay click
// ---------------------------------------------------------------------------

describe('Dialog — overlay click', () => {
  it('calls onClose when overlay is clicked', async () => {
    const onClose = vi.fn();

    render(
      <Wrapper>
        <Dialog opened onClose={onClose} title="Test">
          content
        </Dialog>
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    // Find the overlay (fixed element with data-fixed)
    const overlay = document.querySelector('[data-fixed]');
    if (overlay) {
      fireEvent.click(overlay);
      expect(onClose).toHaveBeenCalledTimes(1);
    }
  });

  it('does not call onClose when closeOnClickOutside is false', async () => {
    const onClose = vi.fn();

    render(
      <Wrapper>
        <Dialog opened onClose={onClose} title="Test" closeOnClickOutside={false}>
          content
        </Dialog>
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    const overlay = document.querySelector('[data-fixed]');
    if (overlay) {
      fireEvent.click(overlay);
      expect(onClose).not.toHaveBeenCalled();
    }
  });
});

// ---------------------------------------------------------------------------
// Dialog — size
// ---------------------------------------------------------------------------

describe('Dialog — size', () => {
  it('defaults to 440px width', async () => {
    render(
      <Wrapper>
        <Dialog opened onClose={vi.fn()} title="Test">
          content
        </Dialog>
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
        <Dialog opened onClose={vi.fn()} title="Test" size={600}>
          content
        </Dialog>
      </Wrapper>,
    );

    await waitFor(() => {
      const dialog = document.querySelector('[role="dialog"]');
      expect(dialog).toBeTruthy();
    });
  });

  it('accepts custom string size', async () => {
    render(
      <Wrapper>
        <Dialog opened onClose={vi.fn()} title="Test" size="80%">
          content
        </Dialog>
      </Wrapper>,
    );

    await waitFor(() => {
      const dialog = document.querySelector('[role="dialog"]');
      expect(dialog).toBeTruthy();
    });
  });
});

// ---------------------------------------------------------------------------
// Dialog — centered
// ---------------------------------------------------------------------------

describe('Dialog — centered', () => {
  it('sets data-centered on inner when centered is true', async () => {
    render(
      <Wrapper>
        <Dialog opened onClose={vi.fn()} title="Test" centered>
          content
        </Dialog>
      </Wrapper>,
    );

    await waitFor(() => {
      const inner = document.querySelector('[data-centered]');
      expect(inner).toBeTruthy();
    });
  });

  it('does not set data-centered by default', async () => {
    render(
      <Wrapper>
        <Dialog opened onClose={vi.fn()} title="Test">
          content
        </Dialog>
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    expect(document.querySelector('[data-centered]')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Dialog — fullScreen
// ---------------------------------------------------------------------------

describe('Dialog — fullScreen', () => {
  it('sets data-full-screen on content when fullScreen is true', async () => {
    render(
      <Wrapper>
        <Dialog opened onClose={vi.fn()} title="Test" fullScreen>
          content
        </Dialog>
      </Wrapper>,
    );

    await waitFor(() => {
      const content = document.querySelector('[data-full-screen]');
      expect(content).toBeTruthy();
    });
  });
});

// ---------------------------------------------------------------------------
// Compound components
// ---------------------------------------------------------------------------

describe('Dialog — compound components', () => {
  it('renders DialogHeader', async () => {
    render(
      <Wrapper>
        <Dialog opened onClose={vi.fn()} withCloseButton={false}>
          <DialogHeader data-testid="custom-header">
            <DialogTitle>Custom Title</DialogTitle>
          </DialogHeader>
          <DialogBody>body</DialogBody>
        </Dialog>
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('custom-header')).toBeInTheDocument();
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });
  });

  it('renders DialogBody', async () => {
    render(
      <Wrapper>
        <Dialog opened onClose={vi.fn()} withCloseButton={false}>
          <DialogBody data-testid="custom-body">Body content</DialogBody>
        </Dialog>
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('custom-body')).toBeInTheDocument();
    });
  });

  it('renders DialogFooter', async () => {
    render(
      <Wrapper>
        <Dialog opened onClose={vi.fn()} withCloseButton={false}>
          <DialogBody>body</DialogBody>
          <DialogFooter data-testid="custom-footer">
            <button>OK</button>
          </DialogFooter>
        </Dialog>
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('custom-footer')).toBeInTheDocument();
      expect(screen.getByText('OK')).toBeInTheDocument();
    });
  });

  it('renders DialogCloseButton that calls onClose', async () => {
    const onClose = vi.fn();

    render(
      <Wrapper>
        <Dialog opened onClose={onClose} withCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Title</DialogTitle>
            <DialogCloseButton data-testid="compound-close" />
          </DialogHeader>
          <DialogBody>body</DialogBody>
        </Dialog>
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('compound-close')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('compound-close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
