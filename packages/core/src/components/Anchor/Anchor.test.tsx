import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Anchor } from './Anchor';
import { PrismuiProvider } from '../../core/PrismuiProvider/PrismuiProvider';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderWithProvider(ui: React.ReactElement) {
  return render(
    <PrismuiProvider>{ui}</PrismuiProvider>,
  );
}

function getRoot(container: HTMLElement) {
  return container.querySelector('.prismui-Anchor-root')!;
}

// ---------------------------------------------------------------------------
// Basic rendering
// ---------------------------------------------------------------------------

describe('Anchor — basic rendering', () => {
  it('renders an <a> element by default', () => {
    const { container } = renderWithProvider(<Anchor href="#">Link</Anchor>);
    const root = getRoot(container);
    expect(root.tagName).toBe('A');
    expect(root.textContent).toBe('Link');
  });

  it('has correct displayName', () => {
    expect(Anchor.displayName).toBe('@prismui/core/Anchor');
  });

  it('applies prismui-Anchor-root class', () => {
    const { container } = renderWithProvider(<Anchor href="#">Test</Anchor>);
    const root = getRoot(container);
    expect(root.classList.contains('prismui-Anchor-root')).toBe(true);
  });

  it('renders children', () => {
    renderWithProvider(<Anchor href="#">Click here</Anchor>);
    expect(screen.getByText('Click here')).toBeTruthy();
  });

  it('forwards ref', () => {
    const ref = React.createRef<HTMLAnchorElement>();
    renderWithProvider(<Anchor ref={ref} href="#">Ref test</Anchor>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe('A');
  });

  it('passes href attribute', () => {
    const { container } = renderWithProvider(
      <Anchor href="https://example.com">Example</Anchor>,
    );
    expect(getRoot(container).getAttribute('href')).toBe('https://example.com');
  });
});

// ---------------------------------------------------------------------------
// Underline
// ---------------------------------------------------------------------------

describe('Anchor — underline', () => {
  it('sets data-underline="hover" by default', () => {
    const { container } = renderWithProvider(<Anchor href="#">Link</Anchor>);
    expect(getRoot(container).getAttribute('data-underline')).toBe('hover');
  });

  it('sets data-underline="always" when underline="always"', () => {
    const { container } = renderWithProvider(
      <Anchor href="#" underline="always">Link</Anchor>,
    );
    expect(getRoot(container).getAttribute('data-underline')).toBe('always');
  });

  it('sets data-underline="never" when underline="never"', () => {
    const { container } = renderWithProvider(
      <Anchor href="#" underline="never">Link</Anchor>,
    );
    expect(getRoot(container).getAttribute('data-underline')).toBe('never');
  });

  it('sets data-underline="hover" when underline="hover"', () => {
    const { container } = renderWithProvider(
      <Anchor href="#" underline="hover">Link</Anchor>,
    );
    expect(getRoot(container).getAttribute('data-underline')).toBe('hover');
  });
});

// ---------------------------------------------------------------------------
// External
// ---------------------------------------------------------------------------

describe('Anchor — external', () => {
  it('adds target="_blank" when external={true}', () => {
    const { container } = renderWithProvider(
      <Anchor href="https://example.com" external>External</Anchor>,
    );
    expect(getRoot(container).getAttribute('target')).toBe('_blank');
  });

  it('adds rel="noopener noreferrer" when external={true}', () => {
    const { container } = renderWithProvider(
      <Anchor href="https://example.com" external>External</Anchor>,
    );
    expect(getRoot(container).getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('does not add target or rel when external is not set', () => {
    const { container } = renderWithProvider(
      <Anchor href="https://example.com">Internal</Anchor>,
    );
    const root = getRoot(container);
    expect(root.hasAttribute('target')).toBe(false);
    expect(root.hasAttribute('rel')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Color
// ---------------------------------------------------------------------------

describe('Anchor — color', () => {
  it('sets --anchor-color for default "primary"', () => {
    const { container } = renderWithProvider(<Anchor href="#">Link</Anchor>);
    const style = getRoot(container).getAttribute('style') ?? '';
    expect(style).toContain('--anchor-color: var(--prismui-primary-main)');
  });

  it('sets --anchor-color for custom color "error"', () => {
    const { container } = renderWithProvider(
      <Anchor href="#" color="error">Error link</Anchor>,
    );
    const style = getRoot(container).getAttribute('style') ?? '';
    expect(style).toContain('--anchor-color: var(--prismui-error-main)');
  });

  it('sets --anchor-hover-color for primary', () => {
    const { container } = renderWithProvider(<Anchor href="#">Link</Anchor>);
    const style = getRoot(container).getAttribute('style') ?? '';
    expect(style).toContain('--anchor-hover-color: var(--prismui-primary-dark)');
  });

  it('sets --anchor-color for CSS passthrough', () => {
    const { container } = renderWithProvider(
      <Anchor href="#" color="#ff0000">Red link</Anchor>,
    );
    const style = getRoot(container).getAttribute('style') ?? '';
    expect(style).toContain('--anchor-color: #ff0000');
  });
});

// ---------------------------------------------------------------------------
// Typography variant
// ---------------------------------------------------------------------------

describe('Anchor — variant', () => {
  it('applies Text variant CSS variables', () => {
    const { container } = renderWithProvider(
      <Anchor href="#" variant="h3">Heading link</Anchor>,
    );
    const style = getRoot(container).getAttribute('style') ?? '';
    expect(style).toContain('--text-fz: 1.5rem');
    expect(style).toContain('--text-fw: 700');
  });

  it('defaults to body1 variant', () => {
    const { container } = renderWithProvider(<Anchor href="#">Link</Anchor>);
    const style = getRoot(container).getAttribute('style') ?? '';
    expect(style).toContain('--text-fz: 1rem');
    expect(style).toContain('--text-fw: 400');
  });
});

// ---------------------------------------------------------------------------
// Text features inherited
// ---------------------------------------------------------------------------

describe('Anchor — inherited Text features', () => {
  it('supports truncate', () => {
    const { container } = renderWithProvider(
      <Anchor href="#" truncate>Long link text</Anchor>,
    );
    expect(getRoot(container).getAttribute('data-truncate')).toBe('end');
  });

  it('supports lineClamp', () => {
    const { container } = renderWithProvider(
      <Anchor href="#" lineClamp={2}>Clamped link</Anchor>,
    );
    const root = getRoot(container);
    expect(root.hasAttribute('data-line-clamp')).toBe(true);
    const style = root.getAttribute('style') ?? '';
    expect(style).toContain('--text-line-clamp: 2');
  });

  it('supports gutterBottom', () => {
    const { container } = renderWithProvider(
      <Anchor href="#" gutterBottom>Gutter link</Anchor>,
    );
    expect(getRoot(container).hasAttribute('data-gutter-bottom')).toBe(true);
  });

  it('supports gradient', () => {
    const { container } = renderWithProvider(
      <Anchor href="#" gradient={{ from: '#ff0000', to: '#0000ff' }}>Gradient link</Anchor>,
    );
    const root = getRoot(container);
    expect(root.hasAttribute('data-gradient')).toBe(true);
    const style = root.getAttribute('style') ?? '';
    expect(style).toContain('--text-gradient');
  });
});

// ---------------------------------------------------------------------------
// Styles API
// ---------------------------------------------------------------------------

describe('Anchor — Styles API', () => {
  it('supports className prop', () => {
    const { container } = renderWithProvider(
      <Anchor href="#" className="custom-anchor">Styled</Anchor>,
    );
    expect(getRoot(container).classList.contains('custom-anchor')).toBe(true);
  });

  it('supports style prop', () => {
    const { container } = renderWithProvider(
      <Anchor href="#" style={{ marginTop: '10px' }}>Styled</Anchor>,
    );
    const style = getRoot(container).getAttribute('style') ?? '';
    expect(style).toContain('margin-top: 10px');
  });

  it('passes HTML attributes through', () => {
    const { container } = renderWithProvider(
      <Anchor href="#" id="my-anchor" data-testid="anchor-el">Attrs</Anchor>,
    );
    const root = getRoot(container);
    expect(root.getAttribute('id')).toBe('my-anchor');
    expect(root.getAttribute('data-testid')).toBe('anchor-el');
  });
});
