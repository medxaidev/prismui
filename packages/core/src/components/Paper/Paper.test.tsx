import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PrismuiProvider } from '../../core/PrismuiProvider/PrismuiProvider';
import { createTheme } from '../../core/theme/create-theme';
import { Paper } from './Paper';
import classes from './Paper.module.css';

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function renderWithProvider(ui: React.ReactElement) {
  return render(<PrismuiProvider>{ui}</PrismuiProvider>);
}

// ---------------------------------------------------------------------------
// 1. Basic rendering
// ---------------------------------------------------------------------------

describe('Paper — basic rendering', () => {
  it('renders as a div by default', () => {
    const { container } = renderWithProvider(<Paper>Content</Paper>);
    const root = container.firstElementChild!;
    expect(root.tagName).toBe('DIV');
    expect(root.textContent).toBe('Content');
  });

  it('applies CSS Module root class', () => {
    const { container } = renderWithProvider(<Paper>Content</Paper>);
    expect(container.firstElementChild!.classList.contains(classes.root)).toBe(true);
  });

  it('applies static class prismui-Paper-root', () => {
    const { container } = renderWithProvider(<Paper>Content</Paper>);
    expect(container.firstElementChild!.className).toContain('prismui-Paper-root');
  });

  it('forwards ref to the root element', () => {
    const ref = React.createRef<HTMLDivElement>();
    renderWithProvider(<Paper ref={ref}>Content</Paper>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('renders children', () => {
    renderWithProvider(
      <Paper>
        <span data-testid="child">inner</span>
      </Paper>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// 2. Shadow prop
// ---------------------------------------------------------------------------

describe('Paper — shadow prop', () => {
  it('sets --paper-shadow CSS variable for named shadow key', () => {
    const { container } = renderWithProvider(<Paper shadow="md">Content</Paper>);
    const style = container.firstElementChild!.getAttribute('style') || '';
    expect(style).toContain('--paper-shadow');
    expect(style).toContain('var(--prismui-shadow-md)');
  });

  it('sets --paper-shadow for size key "xl"', () => {
    const { container } = renderWithProvider(<Paper shadow="xl">Content</Paper>);
    const style = container.firstElementChild!.getAttribute('style') || '';
    expect(style).toContain('var(--prismui-shadow-xl)');
  });

  it('sets --paper-shadow for component key "card"', () => {
    const { container } = renderWithProvider(<Paper shadow="card">Content</Paper>);
    const style = container.firstElementChild!.getAttribute('style') || '';
    expect(style).toContain('var(--prismui-shadow-card)');
  });

  it('passes through arbitrary CSS shadow string', () => {
    const { container } = renderWithProvider(
      <Paper shadow="0 2px 8px rgba(0,0,0,0.15)">Content</Paper>
    );
    const style = container.firstElementChild!.getAttribute('style') || '';
    expect(style).toContain('--paper-shadow');
    expect(style).toContain('0 2px 8px rgba(0,0,0,0.15)');
  });

  it('sets --paper-shadow to "none" for shadow="none"', () => {
    const { container } = renderWithProvider(<Paper shadow="none">Content</Paper>);
    const style = container.firstElementChild!.getAttribute('style') || '';
    expect(style).toContain('--paper-shadow: none');
  });

  it('does not set --paper-shadow when shadow is undefined', () => {
    const { container } = renderWithProvider(<Paper>Content</Paper>);
    const style = container.firstElementChild!.getAttribute('style') || '';
    expect(style).not.toContain('--paper-shadow');
  });
});

// ---------------------------------------------------------------------------
// 3. Radius prop
// ---------------------------------------------------------------------------

describe('Paper — radius prop', () => {
  it('sets --paper-radius CSS variable for named radius key', () => {
    const { container } = renderWithProvider(<Paper radius="lg">Content</Paper>);
    const style = container.firstElementChild!.getAttribute('style') || '';
    expect(style).toContain('--paper-radius');
    expect(style).toContain('var(--prismui-radius-lg)');
  });

  it('sets --paper-radius for numeric value (converted to rem)', () => {
    const { container } = renderWithProvider(<Paper radius={8}>Content</Paper>);
    const style = container.firstElementChild!.getAttribute('style') || '';
    expect(style).toContain('--paper-radius');
    expect(style).toContain('0.5rem');
  });

  it('sets --paper-radius for CSS string value', () => {
    const { container } = renderWithProvider(<Paper radius="4px">Content</Paper>);
    const style = container.firstElementChild!.getAttribute('style') || '';
    expect(style).toContain('--paper-radius');
    expect(style).toContain('0.25rem');
  });

  it('does not set --paper-radius when radius is undefined (CSS default applies)', () => {
    const { container } = renderWithProvider(<Paper>Content</Paper>);
    const style = container.firstElementChild!.getAttribute('style') || '';
    expect(style).not.toContain('--paper-radius');
  });
});

// ---------------------------------------------------------------------------
// 4. withBorder prop
// ---------------------------------------------------------------------------

describe('Paper — withBorder prop', () => {
  it('sets data-with-border attribute when withBorder=true', () => {
    const { container } = renderWithProvider(<Paper withBorder>Content</Paper>);
    expect(container.firstElementChild!.hasAttribute('data-with-border')).toBe(true);
  });

  it('does not set data-with-border when withBorder is not set', () => {
    const { container } = renderWithProvider(<Paper>Content</Paper>);
    expect(container.firstElementChild!.hasAttribute('data-with-border')).toBe(false);
  });

  it('does not set data-with-border when withBorder=false', () => {
    const { container } = renderWithProvider(<Paper withBorder={false}>Content</Paper>);
    expect(container.firstElementChild!.hasAttribute('data-with-border')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 5. varsResolver
// ---------------------------------------------------------------------------

describe('Paper — varsResolver', () => {
  it('applies both shadow and radius CSS variables together', () => {
    const { container } = renderWithProvider(
      <Paper shadow="sm" radius="xl">Content</Paper>
    );
    const style = container.firstElementChild!.getAttribute('style') || '';
    expect(style).toContain('var(--prismui-shadow-sm)');
    expect(style).toContain('var(--prismui-radius-xl)');
  });
});

// ---------------------------------------------------------------------------
// 6. User vars override
// ---------------------------------------------------------------------------

describe('Paper — vars override', () => {
  it('allows user to override CSS variables via vars prop', () => {
    const { container } = renderWithProvider(
      <Paper
        shadow="md"
        vars={() => ({
          root: {
            '--paper-shadow': '0 0 0 3px red',
            '--paper-radius': '999px',
          },
        })}
      >
        Content
      </Paper>
    );
    const style = container.firstElementChild!.getAttribute('style') || '';
    expect(style).toContain('--paper-shadow: 0 0 0 3px red');
    expect(style).toContain('--paper-radius: 999px');
  });
});

// ---------------------------------------------------------------------------
// 7. Unstyled prop
// ---------------------------------------------------------------------------

describe('Paper — unstyled', () => {
  it('skips CSS Module class when unstyled=true', () => {
    const { container } = renderWithProvider(<Paper unstyled>Content</Paper>);
    expect(container.firstElementChild!.classList.contains(classes.root)).toBe(false);
  });

  it('still applies static class when unstyled=true', () => {
    const { container } = renderWithProvider(<Paper unstyled>Content</Paper>);
    expect(container.firstElementChild!.className).toContain('prismui-Paper-root');
  });
});

// ---------------------------------------------------------------------------
// 8. className and style props
// ---------------------------------------------------------------------------

describe('Paper — className and style props', () => {
  it('merges user className', () => {
    const { container } = renderWithProvider(
      <Paper className="custom-paper">Content</Paper>
    );
    const root = container.firstElementChild!;
    expect(root.className).toContain('custom-paper');
    expect(root.classList.contains(classes.root)).toBe(true);
  });

  it('merges user style', () => {
    const { container } = renderWithProvider(
      <Paper style={{ color: 'red' }}>Content</Paper>
    );
    const style = container.firstElementChild!.getAttribute('style') || '';
    expect(style).toContain('color');
    expect(style).toContain('red');
  });

  it('passes extra props to root element', () => {
    renderWithProvider(
      <Paper data-testid="my-paper" aria-label="card">Content</Paper>
    );
    const el = screen.getByTestId('my-paper');
    expect(el.getAttribute('aria-label')).toBe('card');
  });
});

// ---------------------------------------------------------------------------
// 9. Theme customization
// ---------------------------------------------------------------------------

describe('Paper — theme customization', () => {
  it('applies theme defaultProps', () => {
    const theme = createTheme({
      components: {
        Paper: {
          defaultProps: { shadow: 'lg' },
        },
      },
    });
    const { container } = render(
      <PrismuiProvider theme={theme}>
        <Paper>Content</Paper>
      </PrismuiProvider>
    );
    const style = container.firstElementChild!.getAttribute('style') || '';
    expect(style).toContain('var(--prismui-shadow-lg)');
  });

  it('applies theme classNames', () => {
    const theme = createTheme({
      components: {
        Paper: {
          classNames: { root: 'theme-paper-root' },
        },
      },
    });
    const { container } = render(
      <PrismuiProvider theme={theme}>
        <Paper>Content</Paper>
      </PrismuiProvider>
    );
    expect(container.firstElementChild!.className).toContain('theme-paper-root');
  });

  it('applies theme styles', () => {
    const theme = createTheme({
      components: {
        Paper: {
          styles: { root: { border: '2px solid red' } },
        },
      },
    });
    const { container } = render(
      <PrismuiProvider theme={theme}>
        <Paper>Content</Paper>
      </PrismuiProvider>
    );
    const style = container.firstElementChild!.getAttribute('style') || '';
    expect(style).toContain('border');
  });
});

// ---------------------------------------------------------------------------
// 10. Provider requirement
// ---------------------------------------------------------------------------

describe('Paper — Provider requirement', () => {
  it('throws when rendered without PrismuiProvider', () => {
    expect(() => render(<Paper>Content</Paper>)).toThrow();
  });
});

// ---------------------------------------------------------------------------
// 11. Static properties
// ---------------------------------------------------------------------------

describe('Paper — static properties', () => {
  it('has .classes static property', () => {
    expect(Paper.classes).toBe(classes);
  });

  it('has correct displayName', () => {
    expect(Paper.displayName).toBe('@prismui/core/Paper');
  });

  it('has .extend static method', () => {
    expect(typeof Paper.extend).toBe('function');
  });
});
