import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  describe('Basic Rendering', () => {
    it('renders children correctly', () => {
      const { getByText } = render(<Button>Click me</Button>);
      expect(getByText('Click me')).toBeInTheDocument();
    });

    it('renders as button by default', () => {
      const { container } = render(<Button>Click me</Button>);
      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('renders filled variant (default)', () => {
      const { container } = render(<Button>Filled</Button>);
      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
    });

    it('renders outline variant', () => {
      const { container } = render(<Button variant="outline">Outline</Button>);
      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
    });

    it('renders subtle variant', () => {
      const { container } = render(<Button variant="subtle">Subtle</Button>);
      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
    });

    it('renders transparent variant', () => {
      const { container } = render(<Button variant="transparent">Transparent</Button>);
      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
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
      const button = container.querySelector('button');
      expect(button).toHaveStyle({ '--button-height': 'var(--prismui-size-height)' });
      expect(button).toHaveStyle({ '--prismui-size-height': '32px' });
    });

    it('renders md size (default)', () => {
      const { container } = render(<Button>MD</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveStyle({ '--button-height': 'var(--prismui-size-height)' });
      expect(button).toHaveStyle({ '--prismui-size-height': '40px' });
    });

    it('renders lg size', () => {
      const { container } = render(<Button size="lg">LG</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveStyle({ '--button-height': 'var(--prismui-size-height)' });
      expect(button).toHaveStyle({ '--prismui-size-height': '48px' });
    });

    it('renders xl size', () => {
      const { container } = render(<Button size="xl">XL</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveStyle({ '--button-height': 'var(--prismui-size-height)' });
      expect(button).toHaveStyle({ '--prismui-size-height': '56px' });
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
      const button = container.querySelector('button');
      expect(button).toHaveStyle({ '--prismui-variant-bg': 'var(--prismui-color-secondary-high-bg)' });
    });

    it('renders error color', () => {
      const { container } = render(<Button color="error">Error</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveStyle({ '--prismui-variant-bg': 'var(--prismui-color-error-high-bg)' });
    });

    it('renders success color', () => {
      const { container } = render(<Button color="success">Success</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveStyle({ '--prismui-variant-bg': 'var(--prismui-color-success-high-bg)' });
    });
  });

  describe('Styling Overrides - classNames', () => {
    it('accepts classNames override for root', () => {
      const { container } = render(
        <Button classNames={{ root: 'custom-root' }}>Button</Button>
      );
      const button = container.querySelector('button');
      expect(button).toHaveClass('custom-root');
    });

    it('accepts classNames override for label', () => {
      const { container } = render(
        <Button classNames={{ label: 'custom-label' }}>Button</Button>
      );
      const label = container.querySelector('.custom-label');
      expect(label).toBeInTheDocument();
    });

    it('accepts multiple classNames overrides', () => {
      const { container } = render(
        <Button
          classNames={{
            root: 'custom-root',
            inner: 'custom-inner',
            label: 'custom-label',
          }}
        >
          Button
        </Button>
      );
      expect(container.querySelector('.custom-root')).toBeInTheDocument();
      expect(container.querySelector('.custom-inner')).toBeInTheDocument();
      expect(container.querySelector('.custom-label')).toBeInTheDocument();
    });
  });

  describe('Styling Overrides - styles (REQUIRED for Step 2.8)', () => {
    it('accepts styles override for root', () => {
      const { container } = render(
        <Button styles={{ root: { borderRadius: '20px' } }}>Button</Button>
      );
      const button = container.querySelector('button');
      expect(button).toHaveStyle({ borderRadius: '20px' });
    });

    it('accepts styles override for label', () => {
      const { container } = render(
        <Button styles={{ label: { fontWeight: 'bold' } }}>Button</Button>
      );
      const label = container.querySelector('span > span');
      expect(label).toHaveStyle({ fontWeight: 'bold' });
    });

    it('accepts multiple styles overrides', () => {
      const { container } = render(
        <Button
          styles={{
            root: { borderRadius: '20px' },
            label: { fontWeight: 'bold' },
          }}
        >
          Button
        </Button>
      );
      const button = container.querySelector('button');
      const label = container.querySelector('span > span');
      expect(button).toHaveStyle({ borderRadius: '20px' });
      expect(label).toHaveStyle({ fontWeight: 'bold' });
    });
  });

  describe('Styling Overrides - vars (REQUIRED for Step 2.8)', () => {
    it('accepts vars override', () => {
      const { container } = render(
        <Button vars={{ '--button-height': '60px' }}>Button</Button>
      );
      const button = container.querySelector('button');
      expect(button).toHaveStyle({ '--button-height': '60px' });
    });

    it('vars override has higher priority than varsResolver', () => {
      const { container } = render(
        <Button size="sm" vars={{ '--button-height': '100px' }}>
          Button
        </Button>
      );
      const button = container.querySelector('button');
      // User vars should override system vars
      expect(button).toHaveStyle({ '--button-height': '100px' });
    });

    it('accepts multiple vars overrides', () => {
      const { container } = render(
        <Button
          vars={{
            '--button-height': '60px',
            '--button-bg': '#ff0000',
          }}
        >
          Button
        </Button>
      );
      const button = container.querySelector('button');
      expect(button).toHaveStyle({
        '--button-height': '60px',
        '--button-bg': '#ff0000',
      });
    });
  });

  describe('Polymorphic Behavior', () => {
    it('renders as anchor when component="a"', () => {
      const { container } = render(
        <Button component="a" href="/test">
          Link
        </Button>
      );
      const anchor = container.querySelector('a');
      expect(anchor).toBeInTheDocument();
      expect(anchor).toHaveAttribute('href', '/test');
    });
  });

  describe('Disabled State', () => {
    it('applies disabled attribute', () => {
      const { container } = render(<Button disabled>Disabled</Button>);
      const button = container.querySelector('button');
      expect(button).toBeDisabled();
    });
  });

  describe('State System', () => {
    it('injects --prismui-state-opacity-disabled', () => {
      const { container } = render(<Button>State</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveStyle({ '--prismui-state-opacity-disabled': '0.5' });
    });

    it('injects --prismui-state-cursor-disabled', () => {
      const { container } = render(<Button>State</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveStyle({ '--prismui-state-cursor-disabled': 'not-allowed' });
    });
  });

  describe('Blueprint Checklist — componentPropKeys leak prevention', () => {
    it('variant does NOT appear as DOM attribute', () => {
      const { container } = render(<Button variant="outline">Button</Button>);
      const button = container.querySelector('button');
      expect(button).not.toHaveAttribute('variant');
    });

    it('color does NOT appear as DOM attribute', () => {
      const { container } = render(<Button color="error">Button</Button>);
      const button = container.querySelector('button');
      expect(button).not.toHaveAttribute('color');
    });

    it('size does NOT appear as DOM attribute', () => {
      const { container } = render(<Button size="lg">Button</Button>);
      const button = container.querySelector('button');
      expect(button).not.toHaveAttribute('size');
    });

    it('disabled IS present on button DOM (form element, explicit pass-through)', () => {
      const { container } = render(<Button disabled>Button</Button>);
      const button = container.querySelector('button');
      expect(button).toBeDisabled();
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
        </Button>
      );
      const button = container.querySelector('button');
      expect(button).toHaveClass('custom-root');
      expect(button).toHaveStyle({
        borderRadius: '20px',
        '--button-height': '60px',
      });
    });
  });
});
