import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Stack } from './Stack';
import classes from './Stack.module.css';
import { PrismuiProvider } from '../../core/PrismuiProvider/PrismuiProvider';
import { createTheme } from '../../core/theme/create-theme';

function W({ children }: { children: ReactNode }) {
  return <PrismuiProvider>{children}</PrismuiProvider>;
}

function renderWithProvider(ui: ReactNode) {
  return render(ui, { wrapper: W });
}

// ---------------------------------------------------------------------------
// 1. CSS Module import verification
// ---------------------------------------------------------------------------

describe('Stack — CSS Module import', () => {
  it('imports classes as a Record<string, string>', () => {
    expect(classes).toBeDefined();
    expect(typeof classes).toBe('object');
  });

  it('has a "root" key in the CSS Module', () => {
    expect(classes.root).toBeDefined();
    expect(typeof classes.root).toBe('string');
  });

  it('root class is a non-empty string', () => {
    expect(classes.root.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// 2. Basic rendering with CSS Module class
// ---------------------------------------------------------------------------

describe('Stack — basic rendering', () => {
  it('renders children', () => {
    renderWithProvider(
      <Stack>
        <div>Child 1</div>
        <div>Child 2</div>
      </Stack>
    );
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
  });

  it('applies CSS Module root class', () => {
    const { container } = renderWithProvider(<Stack>content</Stack>);
    const root = container.firstElementChild!;
    expect(root.className).toContain(classes.root);
  });

  it('applies static class prismui-Stack-root', () => {
    const { container } = renderWithProvider(<Stack>content</Stack>);
    const root = container.firstElementChild!;
    expect(root.className).toContain('prismui-Stack-root');
  });

  it('renders as a div element', () => {
    const { container } = renderWithProvider(<Stack>content</Stack>);
    expect(container.firstElementChild!.tagName).toBe('DIV');
  });

  it('forwards ref to the root element', () => {
    const ref = { current: null as HTMLDivElement | null };
    renderWithProvider(<Stack ref={ref}>content</Stack>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

// ---------------------------------------------------------------------------
// 3. CSS Variables via varsResolver
// ---------------------------------------------------------------------------

describe('Stack — CSS variables', () => {
  it('sets --stack-gap from gap prop', () => {
    const { container } = renderWithProvider(<Stack gap="lg">content</Stack>);
    const style = container.firstElementChild!.getAttribute('style') || '';
    expect(style).toContain('--stack-gap');
    expect(style).toContain('lg');
  });

  it('sets --stack-align from align prop', () => {
    const { container } = renderWithProvider(<Stack align="center">content</Stack>);
    const style = container.firstElementChild!.getAttribute('style') || '';
    expect(style).toContain('--stack-align');
    expect(style).toContain('center');
  });

  it('sets --stack-justify from justify prop', () => {
    const { container } = renderWithProvider(<Stack justify="space-between">content</Stack>);
    const style = container.firstElementChild!.getAttribute('style') || '';
    expect(style).toContain('--stack-justify');
    expect(style).toContain('space-between');
  });

  it('converts numeric gap to px', () => {
    const { container } = renderWithProvider(<Stack gap={24}>content</Stack>);
    const style = container.firstElementChild!.getAttribute('style') || '';
    expect(style).toContain('24px');
  });
});

// ---------------------------------------------------------------------------
// 4. unstyled prop — skips CSS Module class
// ---------------------------------------------------------------------------

describe('Stack — unstyled prop', () => {
  it('skips CSS Module class when unstyled=true', () => {
    const { container } = renderWithProvider(<Stack unstyled>content</Stack>);
    const root = container.firstElementChild!;
    expect(root.className).not.toContain(classes.root);
  });

  it('still applies static class when unstyled=true', () => {
    const { container } = renderWithProvider(<Stack unstyled>content</Stack>);
    const root = container.firstElementChild!;
    expect(root.className).toContain('prismui-Stack-root');
  });

  it('still renders children when unstyled=true', () => {
    renderWithProvider(<Stack unstyled>visible</Stack>);
    expect(screen.getByText('visible')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// 5. className and style props
// ---------------------------------------------------------------------------

describe('Stack — className and style props', () => {
  it('merges user className with CSS Module class', () => {
    const { container } = renderWithProvider(<Stack className="my-stack">content</Stack>);
    const root = container.firstElementChild!;
    expect(root.className).toContain(classes.root);
    expect(root.className).toContain('my-stack');
  });

  it('merges user style with CSS variables', () => {
    const { container } = renderWithProvider(
      <Stack style={{ border: '1px solid red' }} gap="sm">content</Stack>
    );
    const style = container.firstElementChild!.getAttribute('style') || '';
    expect(style).toContain('border');
    expect(style).toContain('--stack-gap');
  });

  it('passes extra props to root element', () => {
    const { container } = renderWithProvider(
      <Stack data-testid="stack-root" id="my-stack">content</Stack>
    );
    const root = container.firstElementChild!;
    expect(root.getAttribute('id')).toBe('my-stack');
    expect(root.getAttribute('data-testid')).toBe('stack-root');
  });
});

// ---------------------------------------------------------------------------
// 6. Theme-level customization
// ---------------------------------------------------------------------------

describe('Stack — theme customization', () => {
  it('applies theme defaultProps', () => {
    const theme = createTheme({
      components: {
        Stack: {
          defaultProps: { gap: '0px' },
        },
      },
    });
    const { container } = render(
      <PrismuiProvider theme={theme}>
        <Stack>content</Stack>
      </PrismuiProvider>
    );
    const style = container.querySelector('[class]')!.getAttribute('style') || '';
    expect(style).toContain('--stack-gap');
    expect(style).toContain('0px');
  });

  it('applies theme classNames', () => {
    const theme = createTheme({
      components: {
        Stack: {
          classNames: { root: 'theme-stack-root' },
        },
      },
    });
    const { container } = render(
      <PrismuiProvider theme={theme}>
        <Stack>content</Stack>
      </PrismuiProvider>
    );
    const root = container.firstElementChild!;
    expect(root.className).toContain('theme-stack-root');
  });

  it('applies theme styles', () => {
    const theme = createTheme({
      components: {
        Stack: {
          styles: { root: { backgroundColor: 'pink' } },
        },
      },
    });
    const { container } = render(
      <PrismuiProvider theme={theme}>
        <Stack>content</Stack>
      </PrismuiProvider>
    );
    const style = container.firstElementChild!.getAttribute('style') || '';
    expect(style).toContain('background-color');
    expect(style).toContain('pink');
  });
});

// ---------------------------------------------------------------------------
// 7. Component.classes and displayName
// ---------------------------------------------------------------------------

describe('Stack — static properties', () => {
  it('has .classes static property', () => {
    expect(Stack.classes).toBe(classes);
  });

  it('has correct displayName', () => {
    expect(Stack.displayName).toBe('@prismui/core/Stack');
  });

  it('has .extend static method', () => {
    expect(typeof Stack.extend).toBe('function');
  });
});
