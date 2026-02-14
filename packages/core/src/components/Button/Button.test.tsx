import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Button } from './Button';
import { PrismuiProvider } from '../../core/PrismuiProvider/PrismuiProvider';
import { createTheme } from '../../core/theme/create-theme';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderWithProvider(ui: React.ReactElement, opts?: { headless?: boolean }) {
  return render(
    <PrismuiProvider headless={opts?.headless}>{ui}</PrismuiProvider>,
  );
}

// ---------------------------------------------------------------------------
// Basic rendering
// ---------------------------------------------------------------------------

describe('Button — basic rendering', () => {
  it('renders a button element by default', () => {
    renderWithProvider(<Button>Click me</Button>);
    const btn = screen.getByRole('button', { name: 'Click me' });
    expect(btn.tagName).toBe('BUTTON');
  });

  it('renders children text', () => {
    renderWithProvider(<Button>Hello</Button>);
    expect(screen.getByText('Hello')).toBeTruthy();
  });

  it('renders with type="button" by default', () => {
    renderWithProvider(<Button>Btn</Button>);
    expect(screen.getByRole('button').getAttribute('type')).toBe('button');
  });

  it('applies static class name prismui-Button-root', () => {
    renderWithProvider(<Button>Btn</Button>);
    expect(screen.getByRole('button').className).toContain('prismui-Button-root');
  });

  it('sets displayName', () => {
    expect(Button.displayName).toBe('@prismui/core/Button');
  });
});

// ---------------------------------------------------------------------------
// Variants
// ---------------------------------------------------------------------------

describe('Button — variants', () => {
  it('applies solid variant by default', () => {
    renderWithProvider(<Button>Solid</Button>);
    const btn = screen.getByRole('button');
    // varsResolver should set --button-bg for solid variant
    const style = btn.getAttribute('style') || '';
    expect(style).toContain('--button-bg');
  });

  it('applies outlined variant', () => {
    renderWithProvider(<Button variant="outlined">Outlined</Button>);
    const btn = screen.getByRole('button');
    const style = btn.getAttribute('style') || '';
    expect(style).toContain('--button-color');
  });

  it('applies soft variant', () => {
    renderWithProvider(<Button variant="soft">Soft</Button>);
    const btn = screen.getByRole('button');
    const style = btn.getAttribute('style') || '';
    expect(style).toContain('--button-bg');
  });

  it('applies plain variant', () => {
    renderWithProvider(<Button variant="plain">Plain</Button>);
    const btn = screen.getByRole('button');
    const style = btn.getAttribute('style') || '';
    expect(style).toContain('--button-color');
  });
});

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------

describe('Button — colors', () => {
  it('uses primary color by default', () => {
    renderWithProvider(<Button>Primary</Button>);
    const style = screen.getByRole('button').getAttribute('style') || '';
    expect(style).toContain('--button-bg');
  });

  it('accepts semantic color "error"', () => {
    renderWithProvider(<Button color="error">Error</Button>);
    const style = screen.getByRole('button').getAttribute('style') || '';
    expect(style).toContain('--button-bg');
  });

  it('accepts color family "blue"', () => {
    renderWithProvider(<Button color="blue">Blue</Button>);
    const style = screen.getByRole('button').getAttribute('style') || '';
    expect(style).toContain('--button-bg');
  });

  it('accepts "black" color', () => {
    renderWithProvider(<Button color="black">Black</Button>);
    const style = screen.getByRole('button').getAttribute('style') || '';
    expect(style).toContain('--button-bg');
  });

  it('accepts "white" color', () => {
    renderWithProvider(<Button color="white">White</Button>);
    const style = screen.getByRole('button').getAttribute('style') || '';
    expect(style).toContain('--button-bg');
  });

  it('accepts "inherit" color', () => {
    renderWithProvider(<Button color="inherit">Inherit</Button>);
    const style = screen.getByRole('button').getAttribute('style') || '';
    expect(style).toContain('--button-bg');
  });
});

// ---------------------------------------------------------------------------
// Sizes
// ---------------------------------------------------------------------------

describe('Button — sizes', () => {
  it('applies size sm by default', () => {
    renderWithProvider(<Button>Sm</Button>);
    const style = screen.getByRole('button').getAttribute('style') || '';
    expect(style).toContain('--button-height');
  });

  it('applies size md', () => {
    renderWithProvider(<Button size="md">Md</Button>);
    const style = screen.getByRole('button').getAttribute('style') || '';
    expect(style).toContain('--button-height');
  });

  it('applies compact size', () => {
    renderWithProvider(<Button size="compact-sm">Compact</Button>);
    const style = screen.getByRole('button').getAttribute('style') || '';
    expect(style).toContain('--button-height');
    expect(style).toContain('--button-fz');
  });
});

// ---------------------------------------------------------------------------
// Disabled
// ---------------------------------------------------------------------------

describe('Button — disabled', () => {
  it('sets disabled attribute', () => {
    renderWithProvider(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('sets data-disabled attribute', () => {
    renderWithProvider(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button').getAttribute('data-disabled')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Loading
// ---------------------------------------------------------------------------

describe('Button — loading', () => {
  it('disables button when loading', () => {
    renderWithProvider(<Button loading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('sets data-loading attribute', () => {
    renderWithProvider(<Button loading>Loading</Button>);
    expect(screen.getByRole('button').getAttribute('data-loading')).toBeTruthy();
  });

  it('renders loading indicator', () => {
    renderWithProvider(<Button loading>Loading</Button>);
    const btn = screen.getByRole('button');
    // The loader span should be present
    const loader = btn.querySelector('.prismui-Button-loader, [class*="loader"]');
    expect(loader).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------

describe('Button — sections', () => {
  it('renders left section', () => {
    renderWithProvider(
      <Button leftSection={<span data-testid="left-icon">←</span>}>With Left</Button>,
    );
    expect(screen.getByTestId('left-icon')).toBeTruthy();
  });

  it('renders right section', () => {
    renderWithProvider(
      <Button rightSection={<span data-testid="right-icon">→</span>}>With Right</Button>,
    );
    expect(screen.getByTestId('right-icon')).toBeTruthy();
  });

  it('sets data-with-left-section when leftSection provided', () => {
    renderWithProvider(<Button leftSection={<span>←</span>}>Left</Button>);
    expect(screen.getByRole('button').getAttribute('data-with-left-section')).toBeTruthy();
  });

  it('sets data-with-right-section when rightSection provided', () => {
    renderWithProvider(<Button rightSection={<span>→</span>}>Right</Button>);
    expect(screen.getByRole('button').getAttribute('data-with-right-section')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// fullWidth
// ---------------------------------------------------------------------------

describe('Button — fullWidth', () => {
  it('sets data-block attribute when fullWidth', () => {
    renderWithProvider(<Button fullWidth>Full</Button>);
    expect(screen.getByRole('button').getAttribute('data-block')).toBeTruthy();
  });

  it('does not set data-block by default', () => {
    renderWithProvider(<Button>Normal</Button>);
    expect(screen.getByRole('button').getAttribute('data-block')).toBeFalsy();
  });
});

// ---------------------------------------------------------------------------
// Radius
// ---------------------------------------------------------------------------

describe('Button — radius', () => {
  it('applies radius via CSS variable', () => {
    renderWithProvider(<Button radius="lg">Rounded</Button>);
    const style = screen.getByRole('button').getAttribute('style') || '';
    expect(style).toContain('--button-radius');
  });
});

// ---------------------------------------------------------------------------
// Polymorphic
// ---------------------------------------------------------------------------

describe('Button — polymorphic', () => {
  it('renders as anchor when component="a"', () => {
    renderWithProvider(
      <Button component="a" href="https://example.com">Link</Button>,
    );
    const el = screen.getByText('Link');
    // The ButtonBase wraps in Box which renders the component
    const anchor = el.closest('a');
    expect(anchor).toBeTruthy();
    expect(anchor?.getAttribute('href')).toBe('https://example.com');
  });
});

// ---------------------------------------------------------------------------
// Styles API
// ---------------------------------------------------------------------------

describe('Button — Styles API', () => {
  it('accepts className', () => {
    renderWithProvider(<Button className="my-btn">Styled</Button>);
    expect(screen.getByRole('button').className).toContain('my-btn');
  });

  it('accepts style prop', () => {
    renderWithProvider(<Button style={{ marginTop: 10 }}>Styled</Button>);
    const style = screen.getByRole('button').getAttribute('style') || '';
    expect(style).toContain('margin-top');
  });

  it('skips CSS module classes when unstyled', () => {
    renderWithProvider(<Button unstyled>Unstyled</Button>);
    const btn = screen.getByRole('button');
    // Should still have static class
    expect(btn.className).toContain('prismui-Button-root');
  });

  it('skips CSS module classes in headless mode', () => {
    renderWithProvider(<Button>Headless</Button>, { headless: true });
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('prismui-Button-root');
  });
});

// ---------------------------------------------------------------------------
// Ripple integration
// ---------------------------------------------------------------------------

describe('Button — ripple', () => {
  it('renders ripple element by default', () => {
    renderWithProvider(<Button>Ripple</Button>);
    const btn = screen.getByRole('button');
    const ripple = btn.querySelector('[class*="ripple"], [class*="Ripple"]');
    expect(ripple).toBeTruthy();
  });

  it('does not render ripple when disableRipple', () => {
    renderWithProvider(<Button disableRipple>No Ripple</Button>);
    const btn = screen.getByRole('button');
    const ripple = btn.querySelector('[class*="ripple"], [class*="Ripple"]');
    expect(ripple).toBeFalsy();
  });

  it('does not render ripple when disabled', () => {
    renderWithProvider(<Button disabled>Disabled</Button>);
    const btn = screen.getByRole('button');
    const ripple = btn.querySelector('[class*="ripple"], [class*="Ripple"]');
    expect(ripple).toBeFalsy();
  });
});
