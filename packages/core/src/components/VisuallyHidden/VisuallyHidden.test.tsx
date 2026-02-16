import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { VisuallyHidden } from './VisuallyHidden';
import { PrismuiProvider } from '../../core/PrismuiProvider/PrismuiProvider';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderVH(props: Partial<React.ComponentProps<typeof VisuallyHidden>> = {}) {
  return render(
    <PrismuiProvider>
      <VisuallyHidden data-testid="vh" {...props} />
    </PrismuiProvider>,
  );
}

function vh() {
  return screen.getByTestId('vh');
}

// ---------------------------------------------------------------------------
// Basic rendering
// ---------------------------------------------------------------------------

describe('VisuallyHidden — basic rendering', () => {
  it('renders without crashing', () => {
    renderVH();
    expect(vh()).toBeTruthy();
  });

  it('has correct displayName', () => {
    expect(VisuallyHidden.displayName).toBe('@prismui/core/VisuallyHidden');
  });

  it('renders as span by default', () => {
    renderVH();
    expect(vh().tagName).toBe('SPAN');
  });

  it('renders children', () => {
    renderVH({ children: 'Hidden label' });
    expect(vh().textContent).toBe('Hidden label');
  });
});

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

describe('VisuallyHidden — accessibility', () => {
  it('content is accessible to screen readers', () => {
    render(
      <PrismuiProvider>
        <VisuallyHidden>Skip to content</VisuallyHidden>
      </PrismuiProvider>,
    );
    expect(screen.getByText('Skip to content')).toBeTruthy();
  });

  it('works as a label for inputs', () => {
    render(
      <PrismuiProvider>
        <VisuallyHidden component="label" {...{ htmlFor: 'email' }}>
          Email address
        </VisuallyHidden>
        <input id="email" type="email" />
      </PrismuiProvider>,
    );
    expect(screen.getByLabelText('Email address')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Styles API
// ---------------------------------------------------------------------------

describe('VisuallyHidden — Styles API', () => {
  it('applies custom className', () => {
    renderVH({ className: 'my-vh' });
    expect(vh().classList.contains('my-vh')).toBe(true);
  });

  it('applies custom style', () => {
    renderVH({ style: { color: 'red' } });
    expect(vh().style.color).toBe('red');
  });

  it('forwards ref', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <PrismuiProvider>
        <VisuallyHidden ref={ref} />
      </PrismuiProvider>,
    );
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });
});
