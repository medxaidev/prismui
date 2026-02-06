import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { PrismuiProvider } from './PrismuiProvider';
import { PrismuiThemeProvider } from './PrismuiThemeProvider';
import { usePrismuiTheme, useTheme, useColorScheme } from './prismui-theme-context';
import { createStyleRegistry, __resetInsertedCacheForTesting } from '../style-engine';

// ---------------------------------------------------------------------------
// Helper: renders a hook consumer and returns captured values
// ---------------------------------------------------------------------------

function ThemeConsumer({ onCapture }: { onCapture: (ctx: ReturnType<typeof usePrismuiTheme>) => void }) {
  const ctx = usePrismuiTheme();
  onCapture(ctx);
  return <div data-testid="scheme">{ctx.colorScheme}</div>;
}

// ---------------------------------------------------------------------------
// PrismuiThemeProvider
// ---------------------------------------------------------------------------

describe('PrismuiThemeProvider', () => {
  it('provides a resolved theme to children', () => {
    let captured: ReturnType<typeof usePrismuiTheme> | null = null;

    render(
      <PrismuiThemeProvider>
        <ThemeConsumer onCapture={(ctx) => { captured = ctx; }} />
      </PrismuiThemeProvider>,
    );

    expect(captured).not.toBeNull();
    expect(captured!.theme).toBeDefined();
    expect(captured!.theme.colorFamilies).toBeDefined();
    expect(captured!.theme.colorSchemes.light).toBeDefined();
    expect(captured!.theme.colorSchemes.dark).toBeDefined();
  });

  it('defaults to light color scheme', () => {
    let scheme: string = '';

    render(
      <PrismuiThemeProvider>
        <ThemeConsumer onCapture={(ctx) => { scheme = ctx.colorScheme; }} />
      </PrismuiThemeProvider>,
    );

    expect(scheme).toBe('light');
  });

  it('respects defaultColorScheme prop', () => {
    let scheme: string = '';

    render(
      <PrismuiThemeProvider defaultColorScheme="dark">
        <ThemeConsumer onCapture={(ctx) => { scheme = ctx.colorScheme; }} />
      </PrismuiThemeProvider>,
    );

    expect(scheme).toBe('dark');
  });

  it('respects forceColorScheme prop', () => {
    let scheme: string = '';

    render(
      <PrismuiThemeProvider defaultColorScheme="light" forceColorScheme="dark">
        <ThemeConsumer onCapture={(ctx) => { scheme = ctx.colorScheme; }} />
      </PrismuiThemeProvider>,
    );

    expect(scheme).toBe('dark');
  });

  it('applies theme overrides', () => {
    let primaryColor: string = '';

    render(
      <PrismuiThemeProvider theme={{ primaryColor: 'indigo' }}>
        <ThemeConsumer onCapture={(ctx) => { primaryColor = ctx.theme.primaryColor; }} />
      </PrismuiThemeProvider>,
    );

    expect(primaryColor).toBe('indigo');
  });

  it('does not resolve semantic palette colors (deferred to CSS vars)', () => {
    let hasPrimary = false;

    render(
      <PrismuiThemeProvider>
        <ThemeConsumer onCapture={(ctx) => {
          hasPrimary = !!ctx.theme.colorSchemes.light.palette.primary?.main;
        }} />
      </PrismuiThemeProvider>,
    );

    expect(hasPrimary).toBe(false);
  });

  it('setColorScheme toggles scheme', () => {
    let setScheme: ((s: 'light' | 'dark' | 'auto') => void) | null = null;
    const schemes: string[] = [];

    function Consumer() {
      const ctx = usePrismuiTheme();
      setScheme = ctx.setColorScheme;
      schemes.push(ctx.colorScheme);
      return null;
    }

    render(
      <PrismuiThemeProvider defaultColorScheme="light">
        <Consumer />
      </PrismuiThemeProvider>,
    );

    expect(schemes[schemes.length - 1]).toBe('light');

    act(() => {
      setScheme!('dark');
    });

    expect(schemes[schemes.length - 1]).toBe('dark');
  });

  it('setColorScheme is ignored when forceColorScheme is set', () => {
    let setScheme: ((s: 'light' | 'dark' | 'auto') => void) | null = null;
    const schemes: string[] = [];

    function Consumer() {
      const ctx = usePrismuiTheme();
      setScheme = ctx.setColorScheme;
      schemes.push(ctx.colorScheme);
      return null;
    }

    render(
      <PrismuiThemeProvider forceColorScheme="light">
        <Consumer />
      </PrismuiThemeProvider>,
    );

    act(() => {
      setScheme!('dark');
    });

    expect(schemes[schemes.length - 1]).toBe('light');
  });
});

// ---------------------------------------------------------------------------
// useTheme / useColorScheme hooks
// ---------------------------------------------------------------------------

describe('useTheme', () => {
  it('returns the resolved theme object', () => {
    let theme: ReturnType<typeof useTheme> | null = null;

    function Consumer() {
      theme = useTheme();
      return null;
    }

    render(
      <PrismuiThemeProvider>
        <Consumer />
      </PrismuiThemeProvider>,
    );

    expect(theme).not.toBeNull();
    expect(theme!.primaryColor).toBe('blue');
  });
});

describe('useColorScheme', () => {
  it('returns [scheme, setter] tuple', () => {
    let result: ReturnType<typeof useColorScheme> | null = null;

    function Consumer() {
      result = useColorScheme();
      return null;
    }

    render(
      <PrismuiThemeProvider>
        <Consumer />
      </PrismuiThemeProvider>,
    );

    expect(result).not.toBeNull();
    expect(result![0]).toBe('light');
    expect(typeof result![1]).toBe('function');
  });
});

// ---------------------------------------------------------------------------
// usePrismuiTheme — error without provider
// ---------------------------------------------------------------------------

describe('usePrismuiTheme (no provider)', () => {
  it('throws when used outside a provider', () => {
    function BadConsumer() {
      usePrismuiTheme();
      return null;
    }

    // Suppress React error boundary console output
    const spy = vi.spyOn(console, 'error').mockImplementation(() => { });

    expect(() => {
      render(<BadConsumer />);
    }).toThrow('usePrismuiTheme must be used within');

    spy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// PrismuiProvider (all-in-one)
// ---------------------------------------------------------------------------

describe('PrismuiProvider', () => {
  beforeEach(() => {
    document.head.querySelectorAll('style').forEach((el) => el.remove());
    __resetInsertedCacheForTesting();
  });

  it('provides theme context to children', () => {
    let hasTheme = false;

    render(
      <PrismuiProvider>
        <ThemeConsumer onCapture={(ctx) => { hasTheme = !!ctx.theme; }} />
      </PrismuiProvider>,
    );

    expect(hasTheme).toBe(true);
  });

  it('injects CSS variables when withCssVars is true', async () => {
    await act(async () => {
      render(
        <PrismuiProvider withCssVars={true} withCssBaseline={false}>
          <div />
        </PrismuiProvider>,
      );
    });

    const themeVarsEl = document.head.querySelector('style[data-prismui-theme-vars]');
    expect(themeVarsEl).not.toBeNull();
    expect(themeVarsEl?.textContent).toContain('--prismui-palette-primary-main');
  });

  it('does not inject CSS variables when withCssVars is false', () => {
    render(
      <PrismuiProvider withCssVars={false} withCssBaseline={false}>
        <div />
      </PrismuiProvider>,
    );

    const themeVarsEl = document.head.querySelector('style[data-prismui-theme-vars]');
    expect(themeVarsEl).toBeNull();
  });

  it('injects baseline CSS when withCssBaseline is true', async () => {
    await act(async () => {
      render(
        <PrismuiProvider withCssVars={false} withCssBaseline={true}>
          <div />
        </PrismuiProvider>,
      );
    });

    const engineEl = document.head.querySelector('style[data-prismui-style-engine]') as HTMLStyleElement | null;
    expect(engineEl).not.toBeNull();
    // Baseline should contain box-sizing rule
    const hasBaseline =
      (engineEl?.sheet && Array.from(engineEl.sheet.cssRules).some((r: CSSRule) =>
        r.cssText.includes('box-sizing'),
      )) ||
      engineEl?.textContent?.includes('box-sizing');
    expect(hasBaseline).toBe(true);
  });

  it('wraps with StyleRegistryProvider when registry is provided', () => {
    const registry = createStyleRegistry();

    let hasTheme = false;

    render(
      <PrismuiProvider registry={registry}>
        <ThemeConsumer onCapture={(ctx) => { hasTheme = !!ctx.theme; }} />
      </PrismuiProvider>,
    );

    expect(hasTheme).toBe(true);
  });

  it('passes theme overrides through', () => {
    let primaryColor = '';

    render(
      <PrismuiProvider theme={{ primaryColor: 'red' }}>
        <ThemeConsumer onCapture={(ctx) => { primaryColor = ctx.theme.primaryColor; }} />
      </PrismuiProvider>,
    );

    expect(primaryColor).toBe('red');
  });
});
