import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PrismuiProvider } from '../../core/PrismuiProvider/PrismuiProvider';
import { ButtonGroup } from './ButtonGroup';
import { Button } from './Button';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderWithProvider(ui: React.ReactElement) {
  return render(<PrismuiProvider>{ui}</PrismuiProvider>);
}

function group() {
  return screen.getByRole('group');
}

// ---------------------------------------------------------------------------
// Basic rendering
// ---------------------------------------------------------------------------

describe('ButtonGroup — basic rendering', () => {
  it('renders a div with role="group"', () => {
    renderWithProvider(
      <ButtonGroup>
        <Button>A</Button>
        <Button>B</Button>
      </ButtonGroup>,
    );
    expect(group()).toBeTruthy();
    expect(group().tagName).toBe('DIV');
  });

  it('has correct displayName', () => {
    expect(ButtonGroup.displayName).toBe('@prismui/core/ButtonGroup');
  });

  it('forwards ref', () => {
    const ref = React.createRef<HTMLDivElement>();
    renderWithProvider(
      <ButtonGroup ref={ref}>
        <Button>A</Button>
      </ButtonGroup>,
    );
    expect(ref.current).toBeTruthy();
    expect(ref.current!.tagName).toBe('DIV');
  });

  it('renders children buttons', () => {
    renderWithProvider(
      <ButtonGroup>
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </ButtonGroup>,
    );
    expect(screen.getByText('One')).toBeTruthy();
    expect(screen.getByText('Two')).toBeTruthy();
    expect(screen.getByText('Three')).toBeTruthy();
  });

  it('applies static class name', () => {
    renderWithProvider(
      <ButtonGroup>
        <Button>A</Button>
      </ButtonGroup>,
    );
    expect(group().className).toContain('prismui-ButtonGroup-group');
  });
});

// ---------------------------------------------------------------------------
// Orientation
// ---------------------------------------------------------------------------

describe('ButtonGroup — orientation', () => {
  it('defaults to horizontal (no data-orientation or horizontal)', () => {
    renderWithProvider(
      <ButtonGroup>
        <Button>A</Button>
      </ButtonGroup>,
    );
    expect(group().getAttribute('data-orientation')).toBe('horizontal');
  });

  it('sets data-orientation="vertical"', () => {
    renderWithProvider(
      <ButtonGroup orientation="vertical">
        <Button>A</Button>
      </ButtonGroup>,
    );
    expect(group().getAttribute('data-orientation')).toBe('vertical');
  });
});

// ---------------------------------------------------------------------------
// Variant
// ---------------------------------------------------------------------------

describe('ButtonGroup — variant', () => {
  it('defaults to outlined variant', () => {
    renderWithProvider(
      <ButtonGroup>
        <Button>A</Button>
      </ButtonGroup>,
    );
    expect(group().getAttribute('data-variant')).toBe('outlined');
  });

  it('sets data-variant="solid"', () => {
    renderWithProvider(
      <ButtonGroup variant="solid">
        <Button>A</Button>
      </ButtonGroup>,
    );
    expect(group().getAttribute('data-variant')).toBe('solid');
  });

  it('sets data-variant="soft"', () => {
    renderWithProvider(
      <ButtonGroup variant="soft">
        <Button>A</Button>
      </ButtonGroup>,
    );
    expect(group().getAttribute('data-variant')).toBe('soft');
  });

  it('sets data-variant="plain"', () => {
    renderWithProvider(
      <ButtonGroup variant="plain">
        <Button>A</Button>
      </ButtonGroup>,
    );
    expect(group().getAttribute('data-variant')).toBe('plain');
  });
});

// ---------------------------------------------------------------------------
// Styles API
// ---------------------------------------------------------------------------

describe('ButtonGroup — Styles API', () => {
  it('applies custom className', () => {
    renderWithProvider(
      <ButtonGroup className="my-group">
        <Button>A</Button>
      </ButtonGroup>,
    );
    expect(group().classList.contains('my-group')).toBe(true);
  });

  it('applies custom style', () => {
    renderWithProvider(
      <ButtonGroup style={{ opacity: 0.5 }}>
        <Button>A</Button>
      </ButtonGroup>,
    );
    const style = group().getAttribute('style') || '';
    expect(style).toContain('opacity');
  });
});

// ---------------------------------------------------------------------------
// HTML attributes
// ---------------------------------------------------------------------------

describe('ButtonGroup — HTML attributes', () => {
  it('passes through data-testid', () => {
    renderWithProvider(
      <ButtonGroup data-testid="btn-group">
        <Button>A</Button>
      </ButtonGroup>,
    );
    expect(screen.getByTestId('btn-group')).toBeTruthy();
  });

  it('passes through id', () => {
    renderWithProvider(
      <ButtonGroup id="group-1">
        <Button>A</Button>
      </ButtonGroup>,
    );
    expect(group().id).toBe('group-1');
  });

  it('allows custom role override', () => {
    renderWithProvider(
      <ButtonGroup role="toolbar">
        <Button>A</Button>
      </ButtonGroup>,
    );
    expect(screen.getByRole('toolbar')).toBeTruthy();
  });
});
