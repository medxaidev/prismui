import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Button } from './Button';
import { PrismUIProvider } from '../../core/theme/provider/PrismUIProvider';
import { createTheme } from '../../core/theme/create-theme';

function renderWithTheme(theme: ReturnType<typeof createTheme>, ui: React.ReactElement) {
  return render(<PrismUIProvider theme={theme}>{ui}</PrismUIProvider>);
}

describe('Button', () => {
  describe('Basic Rendering', () => {
    it('renders children correctly', () => {
      const { getByText } = render(<Button>Click me</Button>);
      expect(getByText('Click me')).toBeInTheDocument();
    });

    it('renders as button by default', () => {
      const { container } = render(<Button>Click me</Button>);
      expect(container.querySelector('button')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('renders filled variant (default)', () => {
      const { container } = render(<Button>Filled</Button>);
      expect(container.querySelector('button')).toBeInTheDocument();
    });

    it('renders outlined variant', () => {
      const { container } = render(<Button variant="outlined">Outlined</Button>);
      expect(container.querySelector('button')).toBeInTheDocument();
    });

    it('renders soft variant', () => {
      const { container } = render(<Button variant="soft">Soft</Button>);
      expect(container.querySelector('button')).toBeInTheDocument();
    });

    it('renders plain variant', () => {
      const { container } = render(<Button variant="plain">Plain</Button>);
      expect(container.querySelector('button')).toBeInTheDocument();
    });

    it('outlined variant injects bordered CSS vars', () => {
      const { container } = render(<Button variant="outlined">Outlined</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveStyle({
        '--prismui-variant-border': 'var(--prismui-color-primary-bordered-border)',
      });
    });

    it('soft variant injects low-emphasis CSS vars', () => {
      const { container } = render(<Button variant="soft">Soft</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveStyle({
        '--prismui-variant-bg': 'var(--prismui-color-primary-low-bg)',
      });
    });

    it('plain variant injects minimal CSS vars', () => {
      const { container } = render(<Button variant="plain">Plain</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveStyle({
        '--prismui-variant-fg': 'var(--prismui-color-primary-minimal-fg)',
      });
    });
  });

  describe('Sizes', () => {
    it('renders xs size', () => {
      const { container } = render(<Button size="xs">XS</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveStyle({ '--button-height': 'var(--prismui-size-height)' });
      expect(button).toHaveStyle({ '--prismui-size-height': '24px' });
    });

    it('renders sm size', () => {
      const { container } = render(<Button size="sm">SM</Button>);
      expect(container.querySelector('button')).toHaveStyle({ '--prismui-size-height': '30px' });
    });

    it('renders md size (default)', () => {
      const { container } = render(<Button>MD</Button>);
      expect(container.querySelector('button')).toHaveStyle({ '--prismui-size-height': '36px' });
    });

    it('renders lg size', () => {
      const { container } = render(<Button size="lg">LG</Button>);
      expect(container.querySelector('button')).toHaveStyle({ '--prismui-size-height': '42px' });
    });

    it('renders xl size', () => {
      const { container } = render(<Button size="xl">XL</Button>);
      expect(container.querySelector('button')).toHaveStyle({ '--prismui-size-height': '48px' });
    });

    it('injects font-size CSS variable from Size System', () => {
      const { container } = render(<Button>M</Button>);
      expect(container.querySelector('button')).toHaveStyle({ '--button-font-size': 'var(--prismui-size-font-size)' });
    });

    it('Size System injects --prismui-size-font-size per tier', () => {
      const { container: xs } = render(<Button size="xs">X</Button>);
      expect(xs.querySelector('button')).toHaveStyle({ '--prismui-size-font-size': '12px' });

      const { container: md } = render(<Button>M</Button>);
      expect(md.querySelector('button')).toHaveStyle({ '--prismui-size-font-size': '14px' });

      const { container: xl } = render(<Button size="xl">X</Button>);
      expect(xl.querySelector('button')).toHaveStyle({ '--prismui-size-font-size': '16px' });
    });
  });

  describe('Colors', () => {
    it('renders primary color (default) — injects --prismui-variant-* system vars', () => {
      const { container } = render(<Button>Primary</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveStyle({ '--prismui-variant-bg': 'var(--prismui-color-primary-high-bg)' });
      expect(button).toHaveStyle({ '--prismui-variant-fg': 'var(--prismui-color-primary-high-fg)' });
    });

    it('renders secondary color', () => {
      const { container } = render(<Button color="secondary">Secondary</Button>);
      expect(container.querySelector('button')).toHaveStyle({
        '--prismui-variant-bg': 'var(--prismui-color-secondary-high-bg)',
      });
    });

    it('renders error color', () => {
      const { container } = render(<Button color="error">Error</Button>);
      expect(container.querySelector('button')).toHaveStyle({
        '--prismui-variant-bg': 'var(--prismui-color-error-high-bg)',
      });
    });

    it('renders success color', () => {
      const { container } = render(<Button color="success">Success</Button>);
      expect(container.querySelector('button')).toHaveStyle({
        '--prismui-variant-bg': 'var(--prismui-color-success-high-bg)',
      });
    });
  });

  describe('Disabled State', () => {
    it('applies disabled attribute', () => {
      const { container } = render(<Button disabled>Disabled</Button>);
      expect(container.querySelector('button')).toBeDisabled();
    });

    it('injects --prismui-state-opacity-disabled', () => {
      const { container } = render(<Button>State</Button>);
      expect(container.querySelector('button')).toHaveStyle({
        '--prismui-state-opacity-disabled': '0.5',
      });
    });

    it('injects --prismui-state-cursor-disabled', () => {
      const { container } = render(<Button>State</Button>);
      expect(container.querySelector('button')).toHaveStyle({
        '--prismui-state-cursor-disabled': 'not-allowed',
      });
    });
  });

  describe('Polymorphic Behavior', () => {
    it('renders as anchor when component="a"', () => {
      const { container } = render(
        <Button component="a" href="/test">Link</Button>,
      );
      const anchor = container.querySelector('a');
      expect(anchor).toBeInTheDocument();
      expect(anchor).toHaveAttribute('href', '/test');
    });
  });

  describe('Prop Isolation (componentPropKeys)', () => {
    it('variant does NOT appear as DOM attribute', () => {
      const { container } = render(<Button variant="outlined">Button</Button>);
      expect(container.querySelector('button')).not.toHaveAttribute('variant');
    });

    it('color does NOT appear as DOM attribute', () => {
      const { container } = render(<Button color="error">Button</Button>);
      expect(container.querySelector('button')).not.toHaveAttribute('color');
    });

    it('size does NOT appear as DOM attribute', () => {
      const { container } = render(<Button size="lg">Button</Button>);
      expect(container.querySelector('button')).not.toHaveAttribute('size');
    });

    it('disabled IS present on button DOM', () => {
      const { container } = render(<Button disabled>Button</Button>);
      expect(container.querySelector('button')).toBeDisabled();
    });
  });

  describe('Styling Overrides - classNames', () => {
    it('accepts classNames override for root', () => {
      const { container } = render(
        <Button classNames={{ root: 'custom-root' }}>Button</Button>,
      );
      expect(container.querySelector('button')).toHaveClass('custom-root');
    });

    it('accepts classNames override for label', () => {
      const { container } = render(
        <Button classNames={{ label: 'custom-label' }}>Button</Button>,
      );
      expect(container.querySelector('.custom-label')).toBeInTheDocument();
    });

    it('accepts all slots classNames', () => {
      const { container } = render(
        <Button classNames={{ root: 'c-root', inner: 'c-inner', label: 'c-label' }}>Button</Button>,
      );
      expect(container.querySelector('.c-root')).toBeInTheDocument();
      expect(container.querySelector('.c-inner')).toBeInTheDocument();
      expect(container.querySelector('.c-label')).toBeInTheDocument();
    });
  });

  describe('Styling Overrides - styles', () => {
    it('accepts styles override for root', () => {
      const { container } = render(
        <Button styles={{ root: { borderRadius: '20px' } }}>Button</Button>,
      );
      expect(container.querySelector('button')).toHaveStyle({ borderRadius: '20px' });
    });

    it('accepts styles override for label', () => {
      const { container } = render(
        <Button styles={{ label: { fontWeight: 'bold' } }}>Button</Button>,
      );
      expect(container.querySelector('span > span')).toHaveStyle({ fontWeight: 'bold' });
    });
  });

  describe('Styling Overrides - vars', () => {
    it('accepts vars override', () => {
      const { container } = render(
        <Button vars={{ '--button-height': '60px' }}>Button</Button>,
      );
      expect(container.querySelector('button')).toHaveStyle({ '--button-height': '60px' });
    });

    it('vars override has higher priority than varsResolver', () => {
      const { container } = render(
        <Button size="sm" vars={{ '--button-height': '100px' }}>Button</Button>,
      );
      expect(container.querySelector('button')).toHaveStyle({ '--button-height': '100px' });
    });
  });

  describe('Combined Overrides', () => {
    it('combines classNames, styles, and vars', () => {
      const { container } = render(
        <Button
          classNames={{ root: 'custom-root' }}
          styles={{ root: { borderRadius: '20px' } }}
          vars={{ '--button-height': '60px' }}
        >
          Button
        </Button>,
      );
      const button = container.querySelector('button');
      expect(button).toHaveClass('custom-root');
      expect(button).toHaveStyle({ borderRadius: '20px', '--button-height': '60px' });
    });
  });

  describe('theme.components integration', () => {
    describe('defaultProps', () => {
      it('theme defaultProps size fills missing prop', () => {
        const theme = createTheme({ components: { Button: { defaultProps: { size: 'xl' } } } });
        const { container } = renderWithTheme(theme, <Button>B</Button>);
        expect(container.querySelector('button')).toHaveStyle({ '--prismui-size-height': '48px' });
      });

      it('props size overrides theme defaultProps size', () => {
        const theme = createTheme({ components: { Button: { defaultProps: { size: 'xl' } } } });
        const { container } = renderWithTheme(theme, <Button size="sm">B</Button>);
        expect(container.querySelector('button')).toHaveStyle({ '--prismui-size-height': '30px' });
      });
    });

    describe('classNames', () => {
      it('theme classNames.root injected onto root element', () => {
        const theme = createTheme({ components: { Button: { classNames: { root: 'theme-btn' } } } });
        const { container } = renderWithTheme(theme, <Button>B</Button>);
        expect(container.querySelector('button')).toHaveClass('theme-btn');
      });

      it('theme + props classNames same slot → cx-merged', () => {
        const theme = createTheme({ components: { Button: { classNames: { root: 'theme-btn' } } } });
        const { container } = renderWithTheme(
          theme,
          <Button classNames={{ root: 'props-btn' }}>B</Button>,
        );
        const button = container.querySelector('button');
        expect(button).toHaveClass('theme-btn');
        expect(button).toHaveClass('props-btn');
      });
    });

    describe('styles', () => {
      it('theme styles.root injected as inline style', () => {
        const theme = createTheme({
          components: { Button: { styles: { root: { borderRadius: '99px' } } } },
        });
        const { container } = renderWithTheme(theme, <Button>B</Button>);
        expect(container.querySelector('button')).toHaveStyle({ borderRadius: '99px' });
      });

      it('props styles.root overrides theme styles.root', () => {
        const theme = createTheme({
          components: { Button: { styles: { root: { borderRadius: '4px' } } } },
        });
        const { container } = renderWithTheme(
          theme,
          <Button styles={{ root: { borderRadius: '20px' } }}>B</Button>,
        );
        expect(container.querySelector('button')).toHaveStyle({ borderRadius: '20px' });
      });

      it('props style prop overrides theme styles (highest priority)', () => {
        const theme = createTheme({
          components: { Button: { styles: { root: { borderRadius: '4px' } } } },
        });
        const { container } = renderWithTheme(
          theme,
          <Button style={{ borderRadius: '50%' }}>B</Button>,
        );
        expect(container.querySelector('button')).toHaveStyle({ borderRadius: '50%' });
      });
    });

    describe('vars', () => {
      it('theme vars injected CSS Variable on root element', () => {
        const theme = createTheme({
          components: { Button: { vars: { '--button-height': '80px' } } },
        });
        const { container } = renderWithTheme(theme, <Button>B</Button>);
        expect(container.querySelector('button')).toHaveStyle({ '--button-height': '80px' });
      });

      it('props vars override theme vars', () => {
        const theme = createTheme({
          components: { Button: { vars: { '--button-height': '80px' } } },
        });
        const { container } = renderWithTheme(
          theme,
          <Button vars={{ '--button-height': '100px' }}>B</Button>,
        );
        expect(container.querySelector('button')).toHaveStyle({ '--button-height': '100px' });
      });

      it('props style CSS var overrides props vars (style > vars priority)', () => {
        const theme = createTheme({
          components: { Button: { vars: { '--button-height': '80px' } } },
        });
        const { container } = renderWithTheme(
          theme,
          <Button
            vars={{ '--button-height': '100px' }}
            style={{ '--button-height': '120px' } as React.CSSProperties}
          >
            B
          </Button>,
        );
        expect(container.querySelector('button')).toHaveStyle({ '--button-height': '120px' });
      });
    });
  });
});
