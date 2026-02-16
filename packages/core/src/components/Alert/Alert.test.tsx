import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Alert } from './Alert';
import type { AlertVariant, AlertSeverity } from './Alert';
import { PrismuiProvider } from '../../core/PrismuiProvider/PrismuiProvider';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderAlert(props: Partial<React.ComponentProps<typeof Alert>> = {}) {
  return render(
    <PrismuiProvider>
      <Alert data-testid="alert" {...props} />
    </PrismuiProvider>,
  );
}

function getAlert() {
  return screen.getByTestId('alert');
}

// ---------------------------------------------------------------------------
// Basic rendering
// ---------------------------------------------------------------------------

describe('Alert — basic rendering', () => {
  it('renders with role="alert"', () => {
    renderAlert();
    expect(getAlert().getAttribute('role')).toBe('alert');
  });

  it('has correct displayName', () => {
    expect(Alert.displayName).toBe('@prismui/core/Alert');
  });

  it('renders title when provided', () => {
    renderAlert({ title: 'Test Title' });
    expect(screen.getByText('Test Title')).toBeTruthy();
  });

  it('renders description when provided', () => {
    renderAlert({ description: 'Test description text' });
    expect(screen.getByText('Test description text')).toBeTruthy();
  });

  it('renders children as description', () => {
    render(
      <PrismuiProvider>
        <Alert data-testid="alert">
          <span data-testid="child-content">Child content</span>
        </Alert>
      </PrismuiProvider>,
    );
    expect(screen.getByTestId('child-content')).toBeTruthy();
  });

  it('renders both title and description', () => {
    renderAlert({ title: 'Title', description: 'Description' });
    expect(screen.getByText('Title')).toBeTruthy();
    expect(screen.getByText('Description')).toBeTruthy();
  });

  it('renders actions when provided', () => {
    renderAlert({
      title: 'Title',
      actions: <button data-testid="action-btn">Action</button>,
    });
    expect(screen.getByTestId('action-btn')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Severity
// ---------------------------------------------------------------------------

describe('Alert — severity', () => {
  const severities: AlertSeverity[] = ['info', 'success', 'warning', 'error'];

  it('defaults to info severity', () => {
    renderAlert();
    expect(getAlert().getAttribute('data-severity')).toBe('info');
  });

  it.each(severities)('renders with severity="%s"', (severity) => {
    renderAlert({ severity });
    expect(getAlert().getAttribute('data-severity')).toBe(severity);
  });

  it.each(severities)('renders default icon for severity="%s"', (severity) => {
    const { container } = render(<PrismuiProvider><Alert severity={severity} /></PrismuiProvider>);
    // Each severity should render an SVG icon
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('hides icon when icon={false}', () => {
    const { container } = render(<PrismuiProvider><Alert icon={false} /></PrismuiProvider>);
    const svg = container.querySelector('svg');
    expect(svg).toBeNull();
  });

  it('renders custom icon', () => {
    renderAlert({ icon: <span data-testid="custom-icon">!</span> });
    expect(screen.getByTestId('custom-icon')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Variants
// ---------------------------------------------------------------------------

describe('Alert — variants', () => {
  const variants: AlertVariant[] = ['solid', 'soft', 'outlined', 'plain'];

  it('defaults to soft variant', () => {
    renderAlert();
    expect(getAlert().getAttribute('data-variant')).toBe('soft');
  });

  it.each(variants)('renders with variant="%s"', (variant) => {
    renderAlert({ variant });
    expect(getAlert().getAttribute('data-variant')).toBe(variant);
  });
});

// ---------------------------------------------------------------------------
// Color
// ---------------------------------------------------------------------------

describe('Alert — color', () => {
  it('uses severity-derived color by default', () => {
    renderAlert({ severity: 'success' });
    // Should have CSS variables set — just verify it renders without error
    expect(getAlert()).toBeTruthy();
  });

  it('accepts custom color override', () => {
    renderAlert({ color: 'primary' });
    expect(getAlert()).toBeTruthy();
  });

  it('accepts color family name', () => {
    renderAlert({ color: 'blue' });
    expect(getAlert()).toBeTruthy();
  });

  it('accepts CSS color string', () => {
    renderAlert({ color: '#ff5500' });
    expect(getAlert()).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Close button
// ---------------------------------------------------------------------------

describe('Alert — close button', () => {
  it('does not render close button by default', () => {
    const { container } = render(<PrismuiProvider><Alert /></PrismuiProvider>);
    const closeBtn = container.querySelector('[aria-label="Close"]');
    expect(closeBtn).toBeNull();
  });

  it('renders close button when withCloseButton=true', () => {
    const { container } = render(<PrismuiProvider><Alert withCloseButton /></PrismuiProvider>);
    const closeBtn = container.querySelector('[aria-label="Close"]');
    expect(closeBtn).toBeTruthy();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    const { container } = render(<PrismuiProvider><Alert withCloseButton onClose={onClose} /></PrismuiProvider>);
    const closeBtn = container.querySelector('[aria-label="Close"]')!;
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('uses custom closeButtonLabel', () => {
    const { container } = render(
      <PrismuiProvider><Alert withCloseButton closeButtonLabel="Dismiss" /></PrismuiProvider>,
    );
    const closeBtn = container.querySelector('[aria-label="Dismiss"]');
    expect(closeBtn).toBeTruthy();
  });

  it('close button contains an SVG icon', () => {
    const { container } = render(<PrismuiProvider><Alert withCloseButton /></PrismuiProvider>);
    const closeBtn = container.querySelector('[aria-label="Close"]')!;
    const svg = closeBtn.querySelector('svg');
    expect(svg).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Radius
// ---------------------------------------------------------------------------

describe('Alert — radius', () => {
  it('accepts named radius', () => {
    renderAlert({ radius: 'lg' });
    expect(getAlert()).toBeTruthy();
  });

  it('accepts numeric radius', () => {
    renderAlert({ radius: 12 });
    expect(getAlert()).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Title with close button spacing
// ---------------------------------------------------------------------------

describe('Alert — title + close button', () => {
  it('adds data-with-close-button to title when withCloseButton is true', () => {
    const { container } = render(
      <PrismuiProvider><Alert title="Title" withCloseButton /></PrismuiProvider>,
    );
    const titleEl = container.querySelector('[data-with-close-button]');
    expect(titleEl).toBeTruthy();
  });

  it('does not add data-with-close-button when withCloseButton is false', () => {
    const { container } = render(<PrismuiProvider><Alert title="Title" /></PrismuiProvider>);
    const titleEl = container.querySelector('[data-with-close-button]');
    expect(titleEl).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Composition
// ---------------------------------------------------------------------------

describe('Alert — composition', () => {
  it('renders title + description + actions + close together', () => {
    const onClose = vi.fn();
    render(
      <PrismuiProvider>
        <Alert
          data-testid="alert"
          severity="warning"
          variant="outlined"
          title="Warning"
          description="Something happened"
          actions={<button data-testid="undo">Undo</button>}
          withCloseButton
          onClose={onClose}
        />
      </PrismuiProvider>,
    );

    expect(screen.getByText('Warning')).toBeTruthy();
    expect(screen.getByText('Something happened')).toBeTruthy();
    expect(screen.getByTestId('undo')).toBeTruthy();
    expect(getAlert().getAttribute('data-variant')).toBe('outlined');
    expect(getAlert().getAttribute('data-severity')).toBe('warning');
  });

  it('all severity + variant combinations render without error', () => {
    const severities: AlertSeverity[] = ['info', 'success', 'warning', 'error'];
    const variants: AlertVariant[] = ['solid', 'soft', 'outlined', 'plain'];

    for (const severity of severities) {
      for (const variant of variants) {
        const { unmount } = render(
          <PrismuiProvider><Alert severity={severity} variant={variant} title={`${severity}-${variant}`} /></PrismuiProvider>,
        );
        expect(screen.getByText(`${severity}-${variant}`)).toBeTruthy();
        unmount();
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Styles API
// ---------------------------------------------------------------------------

describe('Alert — Styles API', () => {
  it('applies custom className', () => {
    renderAlert({ className: 'my-alert' });
    expect(getAlert().classList.contains('my-alert')).toBe(true);
  });

  it('applies custom style', () => {
    renderAlert({ style: { marginTop: 20 } });
    expect(getAlert().style.marginTop).toBe('20px');
  });

  it('forwards ref', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<PrismuiProvider><Alert ref={ref} /></PrismuiProvider>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
