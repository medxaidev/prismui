import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { PrismuiProvider } from '../../core/PrismuiProvider/PrismuiProvider';
import { overlayModule } from '../../core/runtime/overlay/overlayModule';
import { PopoverBase } from './PopoverBase';
import { PopoverBaseTarget } from './PopoverBaseTarget';
import { PopoverBaseDropdown } from './PopoverBaseDropdown';
import { usePopoverBaseContext } from './PopoverBase.context';

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

interface TestPopoverProps {
  opened?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
  onChange?: (opened: boolean) => void;
  position?: any;
  withArrow?: boolean;
  offset?: number;
  disabled?: boolean;
  closeOnClickOutside?: boolean;
  closeOnEscape?: boolean;
  withinPortal?: boolean;
  transitionDuration?: number;
  dropdownClassName?: string;
  dropdownStyle?: React.CSSProperties;
}

function TestPopover({
  opened,
  onClose,
  onOpen,
  onChange,
  position,
  withArrow,
  offset,
  disabled,
  closeOnClickOutside,
  closeOnEscape,
  withinPortal = false,
  transitionDuration = 0,
  dropdownClassName,
  dropdownStyle,
}: TestPopoverProps = {}) {
  return (
    <Wrapper>
      <PopoverBase
        opened={opened}
        onClose={onClose}
        onOpen={onOpen}
        onChange={onChange}
        position={position}
        withArrow={withArrow}
        offset={offset}
        disabled={disabled}
        closeOnClickOutside={closeOnClickOutside}
        closeOnEscape={closeOnEscape}
        withinPortal={withinPortal}
        transitionDuration={transitionDuration}
      >
        <PopoverBaseTarget>
          <button>Toggle</button>
        </PopoverBaseTarget>
        <PopoverBaseDropdown className={dropdownClassName} style={dropdownStyle}>
          <div data-testid="dropdown-content">Dropdown content</div>
        </PopoverBaseDropdown>
      </PopoverBase>
    </Wrapper>
  );
}

function ContextConsumer({ onCapture }: { onCapture: (ctx: any) => void }) {
  const ctx = usePopoverBaseContext();
  onCapture(ctx);
  return <div data-testid="ctx-consumer">context</div>;
}

// ---------------------------------------------------------------------------
// PopoverBase — rendering
// ---------------------------------------------------------------------------

describe('PopoverBase — rendering', () => {
  it('renders target button', () => {
    render(<TestPopover />);
    expect(screen.getByText('Toggle')).toBeInTheDocument();
  });

  it('does not render dropdown when closed (uncontrolled)', () => {
    render(<TestPopover />);
    expect(screen.queryByTestId('dropdown-content')).not.toBeInTheDocument();
  });

  it('renders dropdown when controlled opened=true', () => {
    render(<TestPopover opened onClose={vi.fn()} />);
    expect(screen.getByTestId('dropdown-content')).toBeInTheDocument();
  });

  it('renders dropdown with role=dialog', () => {
    render(<TestPopover opened onClose={vi.fn()} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('sets data-position attribute on dropdown', () => {
    render(<TestPopover opened onClose={vi.fn()} position="top-start" />);
    expect(screen.getByRole('dialog')).toHaveAttribute('data-position', 'top-start');
  });

  it('uses default position=bottom', () => {
    render(<TestPopover opened onClose={vi.fn()} />);
    expect(screen.getByRole('dialog')).toHaveAttribute('data-position', 'bottom');
  });
});

// ---------------------------------------------------------------------------
// PopoverBase — uncontrolled toggle
// ---------------------------------------------------------------------------

describe('PopoverBase — uncontrolled toggle', () => {
  it('opens dropdown on target click', () => {
    render(<TestPopover />);
    fireEvent.click(screen.getByText('Toggle'));
    expect(screen.getByTestId('dropdown-content')).toBeInTheDocument();
  });

  it('closes dropdown on second target click', () => {
    render(<TestPopover />);
    const btn = screen.getByText('Toggle');
    fireEvent.click(btn);
    expect(screen.getByTestId('dropdown-content')).toBeInTheDocument();
    fireEvent.click(btn);
    expect(screen.queryByTestId('dropdown-content')).not.toBeInTheDocument();
  });

  it('does not open when disabled', () => {
    render(<TestPopover disabled />);
    fireEvent.click(screen.getByText('Toggle'));
    expect(screen.queryByTestId('dropdown-content')).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// PopoverBase — controlled mode
// ---------------------------------------------------------------------------

describe('PopoverBase — controlled mode', () => {
  it('shows dropdown when opened is true', () => {
    render(<TestPopover opened onClose={vi.fn()} />);
    expect(screen.getByTestId('dropdown-content')).toBeInTheDocument();
  });

  it('hides dropdown when opened is false', () => {
    render(<TestPopover opened={false} onClose={vi.fn()} />);
    expect(screen.queryByTestId('dropdown-content')).not.toBeInTheDocument();
  });

  it('calls onClose when target is clicked while open', () => {
    const onClose = vi.fn();
    render(<TestPopover opened onClose={onClose} />);
    fireEvent.click(screen.getByText('Toggle'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onOpen when target is clicked while closed', () => {
    const onOpen = vi.fn();
    render(<TestPopover opened={false} onOpen={onOpen} onClose={vi.fn()} />);
    fireEvent.click(screen.getByText('Toggle'));
    expect(onOpen).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// PopoverBase — click outside
// ---------------------------------------------------------------------------

describe('PopoverBase — click outside', () => {
  it('closes on click outside by default', async () => {
    const { container } = render(<TestPopover />);
    fireEvent.click(screen.getByText('Toggle'));
    expect(screen.getByTestId('dropdown-content')).toBeInTheDocument();

    // Wait for the setTimeout in click-outside listener
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      expect(screen.queryByTestId('dropdown-content')).not.toBeInTheDocument();
    });
  });

  it('does not close on click outside when closeOnClickOutside=false', async () => {
    render(<TestPopover closeOnClickOutside={false} />);
    fireEvent.click(screen.getByText('Toggle'));
    expect(screen.getByTestId('dropdown-content')).toBeInTheDocument();

    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    fireEvent.mouseDown(document.body);

    // Should still be open
    expect(screen.getByTestId('dropdown-content')).toBeInTheDocument();
  });

  it('does not close when clicking inside dropdown', async () => {
    render(<TestPopover />);
    fireEvent.click(screen.getByText('Toggle'));
    expect(screen.getByTestId('dropdown-content')).toBeInTheDocument();

    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    fireEvent.mouseDown(screen.getByTestId('dropdown-content'));

    expect(screen.getByTestId('dropdown-content')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// PopoverBase — escape key
// ---------------------------------------------------------------------------

describe('PopoverBase — escape key', () => {
  it('closes on Escape by default', async () => {
    render(<TestPopover />);
    fireEvent.click(screen.getByText('Toggle'));
    expect(screen.getByTestId('dropdown-content')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByTestId('dropdown-content')).not.toBeInTheDocument();
    });
  });
});

// ---------------------------------------------------------------------------
// PopoverBase — accessibility
// ---------------------------------------------------------------------------

describe('PopoverBase — accessibility', () => {
  it('target has aria-haspopup', () => {
    render(<TestPopover />);
    expect(screen.getByText('Toggle')).toHaveAttribute('aria-haspopup', 'true');
  });

  it('target has aria-expanded=false when closed', () => {
    render(<TestPopover />);
    expect(screen.getByText('Toggle')).toHaveAttribute('aria-expanded', 'false');
  });

  it('target has aria-expanded=true when open', () => {
    render(<TestPopover opened onClose={vi.fn()} />);
    expect(screen.getByText('Toggle')).toHaveAttribute('aria-expanded', 'true');
  });

  it('target has aria-controls pointing to dropdown id when open', () => {
    render(<TestPopover opened onClose={vi.fn()} />);
    const btn = screen.getByText('Toggle');
    const dropdown = screen.getByRole('dialog');
    expect(btn.getAttribute('aria-controls')).toBe(dropdown.id);
  });

  it('target does not have aria-controls when closed', () => {
    render(<TestPopover />);
    expect(screen.getByText('Toggle')).not.toHaveAttribute('aria-controls');
  });
});

// ---------------------------------------------------------------------------
// PopoverBase — context
// ---------------------------------------------------------------------------

describe('PopoverBase — context', () => {
  it('provides context to children', () => {
    let ctx: any = null;

    render(
      <Wrapper>
        <PopoverBase opened onClose={vi.fn()} withinPortal={false} transitionDuration={0}>
          <ContextConsumer onCapture={(c) => { ctx = c; }} />
        </PopoverBase>
      </Wrapper>,
    );

    expect(ctx).not.toBeNull();
    expect(ctx.opened).toBe(true);
    expect(typeof ctx.onClose).toBe('function');
    expect(typeof ctx.onOpen).toBe('function');
    expect(typeof ctx.onToggle).toBe('function');
    expect(ctx.position).toBe('bottom');
  });

  it('usePopoverBaseContext throws outside PopoverBase', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(
        <Wrapper>
          <ContextConsumer onCapture={() => {}} />
        </Wrapper>,
      );
    }).toThrow('usePopoverBaseContext must be used within a <PopoverBase>');

    spy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// PopoverBase — arrow
// ---------------------------------------------------------------------------

describe('PopoverBase — arrow', () => {
  it('does not render arrow by default (withArrow=false)', () => {
    render(<TestPopover opened onClose={vi.fn()} />);
    const dropdown = screen.getByRole('dialog');
    // Arrow has no role, check by class
    expect(dropdown.querySelector('[class*="arrow"]')).not.toBeInTheDocument();
  });

  it('renders arrow when withArrow=true', () => {
    render(<TestPopover opened onClose={vi.fn()} withArrow />);
    const dropdown = screen.getByRole('dialog');
    expect(dropdown.querySelector('[class*="arrow"]')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// PopoverBase — styling
// ---------------------------------------------------------------------------

describe('PopoverBase — styling', () => {
  it('applies custom className to dropdown', () => {
    render(<TestPopover opened onClose={vi.fn()} dropdownClassName="my-custom" />);
    expect(screen.getByRole('dialog').className).toContain('my-custom');
  });

  it('applies custom style to dropdown', () => {
    render(<TestPopover opened onClose={vi.fn()} dropdownStyle={{ maxWidth: 300 }} />);
    expect(screen.getByRole('dialog').style.maxWidth).toBe('300px');
  });
});

// ---------------------------------------------------------------------------
// PopoverBase — positions
// ---------------------------------------------------------------------------

describe('PopoverBase — positions', () => {
  const positions = [
    'top', 'top-start', 'top-end',
    'bottom', 'bottom-start', 'bottom-end',
    'left', 'left-start', 'left-end',
    'right', 'right-start', 'right-end',
  ] as const;

  positions.forEach((pos) => {
    it(`supports position=${pos}`, () => {
      render(<TestPopover opened onClose={vi.fn()} position={pos} />);
      expect(screen.getByRole('dialog')).toHaveAttribute('data-position', pos);
    });
  });
});
