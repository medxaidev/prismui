// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Badge } from './Badge';
import { PrismUIProvider } from '../../core/theme/provider/PrismUIProvider';
import { createTheme } from '../../core/theme/create-theme';

function renderWithTheme(theme: ReturnType<typeof createTheme>, ui: React.ReactElement) {
  return render(<PrismUIProvider theme={theme}>{ui}</PrismUIProvider>);
}

describe('Badge', () => {
  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<Badge>New</Badge>);
      expect(container.querySelector('span')).toBeInTheDocument();
    });

    it('renders children', () => {
      const { getByText } = render(<Badge>Hello</Badge>);
      expect(getByText('Hello')).toBeInTheDocument();
    });

    it('renders as span by default', () => {
      const { container } = render(<Badge>Default</Badge>);
      expect(container.querySelector('span')).toBeInTheDocument();
      expect(container.querySelector('div')).not.toBeInTheDocument();
    });
  });

  describe('Variant System', () => {
    it('injects --prismui-variant-bg for filled (default)', () => {
      const { container } = render(<Badge>Filled</Badge>);
      const el = container.querySelector('span');
      expect(el).toHaveStyle({ '--prismui-variant-bg': 'var(--prismui-color-primary-high-bg)' });
    });

    it('injects --prismui-variant-fg', () => {
      const { container } = render(<Badge>Filled</Badge>);
      const el = container.querySelector('span');
      expect(el).toHaveStyle({ '--prismui-variant-fg': 'var(--prismui-color-primary-high-fg)' });
    });

    it('injects --prismui-variant-border (transparent for filled)', () => {
      const { container } = render(<Badge>Filled</Badge>);
      const el = container.querySelector('span');
      expect(el).toHaveStyle({ '--prismui-variant-border': 'transparent' });
    });

    it('outlined variant injects bordered-role vars (bg=transparent)', () => {
      const { container } = render(<Badge variant="outlined">Outlined</Badge>);
      const el = container.querySelector('span');
      expect(el).toHaveStyle({ '--prismui-variant-bg': 'transparent' });
      expect(el).toHaveStyle({ '--prismui-variant-border': 'var(--prismui-color-primary-bordered-border)' });
    });

    it('secondary color injects correct vars', () => {
      const { container } = render(<Badge color="secondary">Secondary</Badge>);
      const el = container.querySelector('span');
      expect(el).toHaveStyle({ '--prismui-variant-bg': 'var(--prismui-color-secondary-high-bg)' });
    });

    it('error color injects correct vars', () => {
      const { container } = render(<Badge color="error">Error</Badge>);
      const el = container.querySelector('span');
      expect(el).toHaveStyle({ '--prismui-variant-bg': 'var(--prismui-color-error-high-bg)' });
    });
  });

  describe('Size System', () => {
    it('injects --prismui-size-height for xs', () => {
      const { container } = render(<Badge size="xs">XS</Badge>);
      const el = container.querySelector('span');
      expect(el).toHaveStyle({ '--prismui-size-height': '24px' });
    });

    it('injects --prismui-size-height for sm', () => {
      const { container } = render(<Badge size="sm">SM</Badge>);
      const el = container.querySelector('span');
      expect(el).toHaveStyle({ '--prismui-size-height': '32px' });
    });

    it('injects --prismui-size-height for md (default)', () => {
      const { container } = render(<Badge>MD</Badge>);
      const el = container.querySelector('span');
      expect(el).toHaveStyle({ '--prismui-size-height': '40px' });
    });

    it('injects --prismui-size-height for lg', () => {
      const { container } = render(<Badge size="lg">LG</Badge>);
      const el = container.querySelector('span');
      expect(el).toHaveStyle({ '--prismui-size-height': '48px' });
    });

    it('injects --prismui-size-height for xl', () => {
      const { container } = render(<Badge size="xl">XL</Badge>);
      const el = container.querySelector('span');
      expect(el).toHaveStyle({ '--prismui-size-height': '56px' });
    });

    it('injects --prismui-size-padding-x for md', () => {
      const { container } = render(<Badge>MD</Badge>);
      const el = container.querySelector('span');
      expect(el).toHaveStyle({ '--prismui-size-padding-x': '16px' });
    });

    it('all 5 sizes inject different height values', () => {
      const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
      const heights = sizes.map((size) => {
        const { container } = render(<Badge size={size}>X</Badge>);
        const el = container.querySelector('span')!;
        return el.style.getPropertyValue('--prismui-size-height');
      });
      const unique = new Set(heights);
      expect(unique.size).toBe(5);
    });
  });

  describe('State System', () => {
    it('injects --prismui-state-opacity-disabled', () => {
      const { container } = render(<Badge>State</Badge>);
      const el = container.querySelector('span');
      expect(el).toHaveStyle({ '--prismui-state-opacity-disabled': '0.5' });
    });

    it('injects --prismui-state-cursor-disabled', () => {
      const { container } = render(<Badge>State</Badge>);
      const el = container.querySelector('span');
      expect(el).toHaveStyle({ '--prismui-state-cursor-disabled': 'not-allowed' });
    });

    it('disabled prop is filtered from DOM (span is not a form element)', () => {
      const { container } = render(<Badge disabled>Disabled</Badge>);
      const el = container.querySelector('span');
      // disabled is in componentPropKeys → filtered from DOM on non-form elements
      // The state system still injects --prismui-state-* vars regardless
      expect(el).not.toHaveAttribute('disabled');
    });
  });

  describe('Polymorphic', () => {
    it('renders as <a> when component="a"', () => {
      const { container } = render(
        <Badge component="a" href="/test">Link Badge</Badge>
      );
      expect(container.querySelector('a')).toBeInTheDocument();
      expect(container.querySelector('span')).not.toBeInTheDocument();
    });

    it('renders as <div> when component="div"', () => {
      const { container } = render(<Badge component="div">Div Badge</Badge>);
      expect(container.querySelector('div')).toBeInTheDocument();
    });
  });

  describe('Styling Overrides', () => {
    it('accepts classNames override for root', () => {
      const { container } = render(
        <Badge classNames={{ root: 'custom-badge' }}>Badge</Badge>
      );
      const el = container.querySelector('span');
      expect(el?.className).toContain('custom-badge');
    });

    it('accepts styles override for root', () => {
      const { container } = render(
        <Badge styles={{ root: { padding: '99px' } }}>Badge</Badge>
      );
      const el = container.querySelector('span');
      expect(el).toHaveStyle({ padding: '99px' });
    });
  });

  describe('Blueprint Checklist — componentPropKeys leak prevention', () => {
    it('variant does NOT appear as DOM attribute', () => {
      const { container } = render(<Badge variant="outline">Badge</Badge>);
      const el = container.querySelector('span');
      expect(el).not.toHaveAttribute('variant');
    });

    it('color does NOT appear as DOM attribute', () => {
      const { container } = render(<Badge color="error">Badge</Badge>);
      const el = container.querySelector('span');
      expect(el).not.toHaveAttribute('color');
    });

    it('size does NOT appear as DOM attribute', () => {
      const { container } = render(<Badge size="lg">Badge</Badge>);
      const el = container.querySelector('span');
      expect(el).not.toHaveAttribute('size');
    });
  });

  describe('theme.components integration', () => {
    describe('defaultProps', () => {
      it('theme defaultProps variant fills missing prop → variant-bg is transparent (outline role)', () => {
        const theme = createTheme({ components: { Badge: { defaultProps: { variant: 'outline' } } } });
        const { container } = renderWithTheme(theme, <Badge>N</Badge>);
        const el = container.querySelector('span');
        expect(el).toHaveStyle({ '--prismui-variant-bg': 'transparent' });
      });

      it('props variant overrides theme defaultProps variant', () => {
        const theme = createTheme({ components: { Badge: { defaultProps: { variant: 'outline' } } } });
        const { container } = renderWithTheme(theme, <Badge variant="filled">N</Badge>);
        const el = container.querySelector('span');
        expect(el).toHaveStyle({ '--prismui-variant-bg': 'var(--prismui-color-primary-high-bg)' });
      });
    });

    describe('classNames', () => {
      it('theme classNames.root → injected onto root element', () => {
        const theme = createTheme({ components: { Badge: { classNames: { root: 'theme-badge' } } } });
        const { container } = renderWithTheme(theme, <Badge>N</Badge>);
        expect(container.querySelector('span')).toHaveClass('theme-badge');
      });

      it('theme + props classNames same slot → cx-merged (both classes present)', () => {
        const theme = createTheme({ components: { Badge: { classNames: { root: 'theme-badge' } } } });
        const { container } = renderWithTheme(
          theme,
          <Badge classNames={{ root: 'props-badge' }}>N</Badge>,
        );
        const el = container.querySelector('span');
        expect(el).toHaveClass('theme-badge');
        expect(el).toHaveClass('props-badge');
      });
    });

    describe('styles', () => {
      it('theme styles.root → injected as inline style', () => {
        const theme = createTheme({ components: { Badge: { styles: { root: { borderRadius: '2px' } } } } });
        const { container } = renderWithTheme(theme, <Badge>N</Badge>);
        expect(container.querySelector('span')).toHaveStyle({ borderRadius: '2px' });
      });

      it('props styles.root overrides theme styles.root (same property)', () => {
        const theme = createTheme({ components: { Badge: { styles: { root: { borderRadius: '2px' } } } } });
        const { container } = renderWithTheme(
          theme,
          <Badge styles={{ root: { borderRadius: '50%' } }}>N</Badge>,
        );
        expect(container.querySelector('span')).toHaveStyle({ borderRadius: '50%' });
      });
    });

    describe('vars', () => {
      it('theme vars → injected CSS Variable on root element', () => {
        const theme = createTheme({ components: { Badge: { vars: { '--badge-radius': '4px' } } } });
        const { container } = renderWithTheme(theme, <Badge>N</Badge>);
        expect(container.querySelector('span')).toHaveStyle({ '--badge-radius': '4px' });
      });

      it('props vars override theme vars (props > theme priority)', () => {
        const theme = createTheme({ components: { Badge: { vars: { '--badge-radius': '4px' } } } });
        const { container } = renderWithTheme(
          theme,
          <Badge vars={{ '--badge-radius': '99px' }}>N</Badge>,
        );
        expect(container.querySelector('span')).toHaveStyle({ '--badge-radius': '99px' });
      });
    });
  });
});
