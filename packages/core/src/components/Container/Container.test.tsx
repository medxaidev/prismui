import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PrismuiProvider } from '../../core/PrismuiProvider/PrismuiProvider';
import { Container } from './Container';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderWithProvider(ui: React.ReactElement) {
  return render(<PrismuiProvider>{ui}</PrismuiProvider>);
}

function root(container: HTMLElement) {
  return container.firstElementChild as HTMLElement;
}

// ---------------------------------------------------------------------------
// Basic rendering
// ---------------------------------------------------------------------------

describe('Container — basic rendering', () => {
  it('renders children', () => {
    const { container } = renderWithProvider(
      <Container>Hello</Container>,
    );
    expect(root(container).textContent).toBe('Hello');
  });

  it('has correct displayName', () => {
    expect(Container.displayName).toBe('@prismui/core/Container');
  });

  it('forwards ref', () => {
    const ref = React.createRef<HTMLDivElement>();
    renderWithProvider(<Container ref={ref}>test</Container>);
    expect(ref.current).toBeTruthy();
    expect(ref.current!.tagName).toBe('DIV');
  });

  it('renders with root class', () => {
    const { container } = renderWithProvider(<Container>test</Container>);
    expect(root(container).className).toContain('root');
  });
});

// ---------------------------------------------------------------------------
// Size
// ---------------------------------------------------------------------------

describe('Container — size', () => {
  it('sets --container-size for named size', () => {
    const { container } = renderWithProvider(
      <Container size="sm">test</Container>,
    );
    expect(root(container).style.getPropertyValue('--container-size')).toBe(
      'var(--container-size-sm)',
    );
  });

  it('sets --container-size for xl', () => {
    const { container } = renderWithProvider(
      <Container size="xl">test</Container>,
    );
    expect(root(container).style.getPropertyValue('--container-size')).toBe(
      'var(--container-size-xl)',
    );
  });

  it('does not set --container-size when fluid', () => {
    const { container } = renderWithProvider(
      <Container fluid size="sm">test</Container>,
    );
    const val = root(container).style.getPropertyValue('--container-size');
    expect(val).toBe('');
  });
});

// ---------------------------------------------------------------------------
// fluid
// ---------------------------------------------------------------------------

describe('Container — fluid', () => {
  it('sets data-fluid when fluid is true', () => {
    const { container } = renderWithProvider(
      <Container fluid>test</Container>,
    );
    expect(root(container).hasAttribute('data-fluid')).toBe(true);
  });

  it('does not set data-fluid by default', () => {
    const { container } = renderWithProvider(
      <Container>test</Container>,
    );
    expect(root(container).hasAttribute('data-fluid')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// disableGutters (MUI)
// ---------------------------------------------------------------------------

describe('Container — disableGutters', () => {
  it('sets data-disable-gutters when disableGutters is true', () => {
    const { container } = renderWithProvider(
      <Container disableGutters>test</Container>,
    );
    expect(root(container).hasAttribute('data-disable-gutters')).toBe(true);
  });

  it('does not set data-disable-gutters by default', () => {
    const { container } = renderWithProvider(
      <Container>test</Container>,
    );
    expect(root(container).hasAttribute('data-disable-gutters')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// fixed (MUI)
// ---------------------------------------------------------------------------

describe('Container — fixed', () => {
  it('sets data-fixed when fixed is true', () => {
    const { container } = renderWithProvider(
      <Container fixed>test</Container>,
    );
    expect(root(container).hasAttribute('data-fixed')).toBe(true);
  });

  it('does not set data-fixed by default', () => {
    const { container } = renderWithProvider(
      <Container>test</Container>,
    );
    expect(root(container).hasAttribute('data-fixed')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Styles API
// ---------------------------------------------------------------------------

describe('Container — Styles API', () => {
  it('applies custom className', () => {
    const { container } = renderWithProvider(
      <Container className="my-container">test</Container>,
    );
    expect(root(container).classList.contains('my-container')).toBe(true);
  });

  it('applies custom style', () => {
    const { container } = renderWithProvider(
      <Container style={{ background: 'red' }}>test</Container>,
    );
    expect(root(container).style.background).toBe('red');
  });
});

// ---------------------------------------------------------------------------
// HTML attributes
// ---------------------------------------------------------------------------

describe('Container — HTML attributes', () => {
  it('passes through data-testid', () => {
    const { container } = renderWithProvider(
      <Container data-testid="my-container">test</Container>,
    );
    expect(root(container).getAttribute('data-testid')).toBe('my-container');
  });

  it('passes through id', () => {
    const { container } = renderWithProvider(
      <Container id="container-1">test</Container>,
    );
    expect(root(container).id).toBe('container-1');
  });
});
