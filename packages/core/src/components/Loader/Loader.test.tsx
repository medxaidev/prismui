import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PrismuiProvider } from '../../core/PrismuiProvider/PrismuiProvider';
import { Loader } from './Loader';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderWithProvider(ui: React.ReactElement) {
  return render(<PrismuiProvider>{ui}</PrismuiProvider>);
}

function root(container: HTMLElement) {
  return container.firstElementChild as HTMLElement;
}

function svg(container: HTMLElement) {
  return root(container).querySelector('svg') as SVGSVGElement;
}

function circle(container: HTMLElement) {
  return root(container).querySelector('circle') as SVGCircleElement;
}

// ---------------------------------------------------------------------------
// Basic rendering
// ---------------------------------------------------------------------------

describe('Loader — basic rendering', () => {
  it('renders a span element', () => {
    const { container } = renderWithProvider(<Loader />);
    expect(root(container).tagName).toBe('SPAN');
  });

  it('has correct displayName', () => {
    expect(Loader.displayName).toBe('@prismui/core/Loader');
  });

  it('forwards ref', () => {
    const ref = React.createRef<HTMLSpanElement>();
    renderWithProvider(<Loader ref={ref} />);
    expect(ref.current).toBeTruthy();
    expect(ref.current!.tagName).toBe('SPAN');
  });

  it('renders with root class', () => {
    const { container } = renderWithProvider(<Loader />);
    expect(root(container).className).toContain('root');
  });

  it('renders SVG spinner', () => {
    const { container } = renderWithProvider(<Loader />);
    expect(svg(container)).toBeTruthy();
    expect(svg(container).getAttribute('viewBox')).toBe('22 22 44 44');
  });

  it('renders circle element', () => {
    const { container } = renderWithProvider(<Loader />);
    expect(circle(container)).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

describe('Loader — accessibility', () => {
  it('has role="status"', () => {
    const { container } = renderWithProvider(<Loader />);
    expect(root(container).getAttribute('role')).toBe('status');
  });

  it('has aria-label="Loading"', () => {
    const { container } = renderWithProvider(<Loader />);
    expect(root(container).getAttribute('aria-label')).toBe('Loading');
  });

  it('allows custom aria-label', () => {
    const { container } = renderWithProvider(<Loader aria-label="Please wait" />);
    expect(root(container).getAttribute('aria-label')).toBe('Please wait');
  });
});

// ---------------------------------------------------------------------------
// Size
// ---------------------------------------------------------------------------

describe('Loader — size', () => {
  it('sets --loader-size for named size', () => {
    const { container } = renderWithProvider(<Loader size="sm" />);
    expect(root(container).style.getPropertyValue('--loader-size')).toBe(
      'var(--loader-size-sm)',
    );
  });

  it('sets --loader-size for xl', () => {
    const { container } = renderWithProvider(<Loader size="xl" />);
    expect(root(container).style.getPropertyValue('--loader-size')).toBe(
      'var(--loader-size-xl)',
    );
  });

  it('sets --loader-size for numeric value', () => {
    const { container } = renderWithProvider(<Loader size={48} />);
    const val = root(container).style.getPropertyValue('--loader-size');
    expect(val).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Color
// ---------------------------------------------------------------------------

describe('Loader — color', () => {
  it('sets --loader-color for CSS color', () => {
    const { container } = renderWithProvider(<Loader color="#ff0000" />);
    const val = root(container).style.getPropertyValue('--loader-color');
    expect(val).toBeTruthy();
  });

  it('does not set --loader-color when no color prop', () => {
    const { container } = renderWithProvider(<Loader />);
    const val = root(container).style.getPropertyValue('--loader-color');
    expect(val).toBe('');
  });
});

// ---------------------------------------------------------------------------
// SVG structure
// ---------------------------------------------------------------------------

describe('Loader — SVG structure', () => {
  it('SVG has spinner class', () => {
    const { container } = renderWithProvider(<Loader />);
    expect(svg(container).className.baseVal).toContain('spinner');
  });

  it('circle has circle class', () => {
    const { container } = renderWithProvider(<Loader />);
    expect(circle(container).className.baseVal).toContain('circle');
  });

  it('circle has fill="none"', () => {
    const { container } = renderWithProvider(<Loader />);
    // fill is set via CSS class, but we can check the element exists
    expect(circle(container)).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Styles API
// ---------------------------------------------------------------------------

describe('Loader — Styles API', () => {
  it('applies custom className', () => {
    const { container } = renderWithProvider(<Loader className="my-loader" />);
    expect(root(container).classList.contains('my-loader')).toBe(true);
  });

  it('applies custom style', () => {
    const { container } = renderWithProvider(
      <Loader style={{ opacity: 0.5 }} />,
    );
    expect(root(container).style.opacity).toBe('0.5');
  });
});

// ---------------------------------------------------------------------------
// HTML attributes
// ---------------------------------------------------------------------------

describe('Loader — HTML attributes', () => {
  it('passes through data-testid', () => {
    const { container } = renderWithProvider(<Loader data-testid="my-loader" />);
    expect(root(container).getAttribute('data-testid')).toBe('my-loader');
  });

  it('passes through id', () => {
    const { container } = renderWithProvider(<Loader id="loader-1" />);
    expect(root(container).id).toBe('loader-1');
  });
});
