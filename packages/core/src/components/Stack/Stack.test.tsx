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
// 3. CSS Variables
// ---------------------------------------------------------------------------

describe('Stack — CSS variables', () => {
  it('sets --stack-gap from gap prop (theme token)', () => {
    const { container } = renderWithProvider(<Stack gap="lg">content</Stack>);
    const style = container.firstElementChild!.getAttribute('style') || '';
    expect(style).toContain('--stack-gap');
    expect(style).toContain('var(--prismui-spacing-lg)');
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

  it('numeric gap uses spacingUnit (number × spacingUnit → rem)', () => {
    // default spacingUnit = 4, so gap={2} → 2×4 = 8px → 0.5rem
    const { container } = renderWithProvider(<Stack gap={2}>content</Stack>);
    const style = container.firstElementChild!.getAttribute('style') || '';
    expect(style).toContain('--stack-gap');
    expect(style).toContain('0.5rem');
  });

  it('gap=0 produces 0rem', () => {
    const { container } = renderWithProvider(<Stack gap={0}>content</Stack>);
    const style = container.firstElementChild!.getAttribute('style') || '';
    expect(style).toContain('--stack-gap: 0rem');
  });

  it('direct CSS string gap is preserved (e.g. "3px")', () => {
    const { container } = renderWithProvider(<Stack gap="3px">content</Stack>);
    const style = container.firstElementChild!.getAttribute('style') || '';
    expect(style).toContain('--stack-gap');
    // 3px → rem conversion: 3/16 = 0.1875rem
    expect(style).toContain('0.1875rem');
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

  it('merges component-level classNames prop', () => {
    const { container } = renderWithProvider(
      <Stack classNames={{ root: 'custom-root' }}>content</Stack>
    );
    const root = container.firstElementChild!;
    expect(root.className).toContain(classes.root);
    expect(root.className).toContain('custom-root');
  });

  it('merges component-level styles prop', () => {
    const { container } = renderWithProvider(
      <Stack styles={{ root: { color: 'red' } }}>content</Stack>
    );
    const style = container.firstElementChild!.getAttribute('style') || '';
    expect(style).toContain('color');
    expect(style).toContain('red');
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
          defaultProps: { gap: 'xs' },
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
    expect(style).toContain('var(--prismui-spacing-xs)');
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
// 7. Responsive props
// ---------------------------------------------------------------------------

describe('Stack — responsive props', () => {
  /** Collect all CSS text from the style-engine element (CSSOM + textContent). */
  function getInjectedCss(): string {
    const el = document.head.querySelector('style[data-prismui-style-engine]') as HTMLStyleElement | null;
    if (!el) return '';
    const fromSheet = el.sheet
      ? Array.from(el.sheet.cssRules).map((r) => r.cssText).join('\n')
      : '';
    return fromSheet + '\n' + (el.textContent || '');
  }

  it('responsive gap: base value injected via CSS class (not inline style)', () => {
    const { container } = renderWithProvider(
      <Stack gap={{ base: 'sm', md: 'lg' }}>content</Stack>
    );
    const root = container.firstElementChild!;
    // Base value should NOT be in inline style (would block @media overrides)
    const style = root.getAttribute('style') || '';
    expect(style).not.toContain('--stack-gap');
    // Should have responsive className
    expect(root.className).toMatch(/prismui-rv-/);
    // Base value should be in injected CSS rules
    const css = getInjectedCss();
    expect(css).toContain('var(--prismui-spacing-sm)');
  });

  it('responsive gap: adds responsive className', () => {
    const { container } = renderWithProvider(
      <Stack gap={{ base: 'sm', md: 'lg' }}>content</Stack>
    );
    const root = container.firstElementChild!;
    expect(root.className).toMatch(/prismui-rv-/);
  });

  it('responsive align: base value injected via CSS class (not inline style)', () => {
    const { container } = renderWithProvider(
      <Stack align={{ base: 'stretch', md: 'center' }}>content</Stack>
    );
    const root = container.firstElementChild!;
    const style = root.getAttribute('style') || '';
    expect(style).not.toContain('--stack-align');
    expect(root.className).toMatch(/prismui-rv-/);
    const css = getInjectedCss();
    expect(css).toContain('--stack-align');
    expect(css).toContain('stretch');
  });

  it('responsive justify: base value injected via CSS class (not inline style)', () => {
    const { container } = renderWithProvider(
      <Stack justify={{ base: 'flex-start', lg: 'center' }}>content</Stack>
    );
    const root = container.firstElementChild!;
    const style = root.getAttribute('style') || '';
    expect(style).not.toContain('--stack-justify');
    expect(root.className).toMatch(/prismui-rv-/);
    const css = getInjectedCss();
    expect(css).toContain('--stack-justify');
    expect(css).toContain('flex-start');
  });

  it('non-responsive gap does not add responsive className', () => {
    const { container } = renderWithProvider(
      <Stack gap="md">content</Stack>
    );
    const root = container.firstElementChild!;
    expect(root.className).not.toMatch(/prismui-rv-/);
  });

  it('responsive gap with numeric values uses spacingUnit', () => {
    const { container } = renderWithProvider(
      <Stack gap={{ base: 1, md: 3 }}>content</Stack>
    );
    const root = container.firstElementChild!;
    // base: 1 × 4 = 4px → 0.25rem — should be in CSS class, not inline
    const style = root.getAttribute('style') || '';
    expect(style).not.toContain('--stack-gap');
    expect(root.className).toMatch(/prismui-rv-/);
    const css = getInjectedCss();
    expect(css).toContain('0.25rem');
  });
});

// ---------------------------------------------------------------------------
// 8. Divider prop
// ---------------------------------------------------------------------------

describe('Stack — divider prop', () => {
  it('inserts divider element between children', () => {
    const { container } = renderWithProvider(
      <Stack divider={<hr data-testid="sep" />}>
        <div>A</div>
        <div>B</div>
        <div>C</div>
      </Stack>
    );
    const dividers = container.querySelectorAll('.prismui-Stack-divider');
    expect(dividers.length).toBe(2);
  });

  it('divider wrapper contains the provided ReactNode', () => {
    const { container } = renderWithProvider(
      <Stack divider={<hr className="my-hr" />}>
        <div>A</div>
        <div>B</div>
      </Stack>
    );
    const wrapper = container.querySelector('.prismui-Stack-divider');
    expect(wrapper).toBeTruthy();
    expect(wrapper!.querySelector('.my-hr')).toBeTruthy();
  });

  it('does not insert divider when only one child', () => {
    const { container } = renderWithProvider(
      <Stack divider={<hr />}>
        <div>Only child</div>
      </Stack>
    );
    const dividers = container.querySelectorAll('.prismui-Stack-divider');
    expect(dividers.length).toBe(0);
  });

  it('does not insert divider when no children', () => {
    const { container } = renderWithProvider(
      <Stack divider={<hr />} />
    );
    const dividers = container.querySelectorAll('.prismui-Stack-divider');
    expect(dividers.length).toBe(0);
  });

  it('renders children without divider wrapper when divider prop is not set', () => {
    const { container } = renderWithProvider(
      <Stack>
        <div>A</div>
        <div>B</div>
      </Stack>
    );
    const dividers = container.querySelectorAll('.prismui-Stack-divider');
    expect(dividers.length).toBe(0);
  });

  it('gap still applies alongside divider', () => {
    const { container } = renderWithProvider(
      <Stack gap="lg" divider={<hr />}>
        <div>A</div>
        <div>B</div>
      </Stack>
    );
    const style = container.firstElementChild!.getAttribute('style') || '';
    expect(style).toContain('--stack-gap');
    expect(style).toContain('var(--prismui-spacing-lg)');
  });

  it('divider with string ReactNode', () => {
    renderWithProvider(
      <Stack divider="---">
        <div>A</div>
        <div>B</div>
      </Stack>
    );
    expect(screen.getByText('---')).toBeInTheDocument();
  });

  it('preserves child order with dividers interleaved', () => {
    const { container } = renderWithProvider(
      <Stack divider={<span data-role="sep">|</span>}>
        <div>First</div>
        <div>Second</div>
        <div>Third</div>
      </Stack>
    );
    const root = container.firstElementChild!;
    const texts = Array.from(root.childNodes).map((n) => n.textContent);
    expect(texts).toEqual(['First', '|', 'Second', '|', 'Third']);
  });
});

// ---------------------------------------------------------------------------
// 9. Provider requirement
// ---------------------------------------------------------------------------

describe('Stack — Provider requirement', () => {
  it('throws when rendered without PrismuiProvider', () => {
    expect(() => render(<Stack>content</Stack>)).toThrow();
  });
});

// ---------------------------------------------------------------------------
// 8. Component.classes and displayName
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
