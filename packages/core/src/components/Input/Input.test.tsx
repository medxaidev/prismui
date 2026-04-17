import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, fireEvent } from '@testing-library/react';
import { Input } from './Input';
import { Field } from '../Field';

describe('Input', () => {
  describe('Basic Rendering', () => {
    it('renders a native <input> inside a <div> wrapper', () => {
      const { container } = render(<Input placeholder="search" />);
      const root = container.firstElementChild as HTMLElement;
      expect(root.tagName).toBe('DIV');
      const input = root.querySelector('input');
      expect(input).toBeInTheDocument();
      expect(input?.placeholder).toBe('search');
    });

    it('forwards ref to the <input> element (not the wrapper)', () => {
      const ref = React.createRef<HTMLInputElement>();
      const { container } = render(<Input ref={ref} />);
      expect(ref.current?.tagName).toBe('INPUT');
      expect(ref.current).toBe(container.querySelector('input'));
    });

    it('passes user className to the root wrapper', () => {
      const { container } = render(<Input className="my-wrapper" />);
      const root = container.firstElementChild as HTMLElement;
      expect(root.className).toContain('my-wrapper');
    });

    it('outputs data-variant and data-size on the root', () => {
      const { container } = render(<Input size="lg" variant="filled" />);
      const root = container.firstElementChild as HTMLElement;
      expect(root.getAttribute('data-variant')).toBe('filled');
      expect(root.getAttribute('data-size')).toBe('lg');
    });

    it('defaults: variant=outlined, size=md', () => {
      const { container } = render(<Input />);
      const root = container.firstElementChild as HTMLElement;
      expect(root.getAttribute('data-variant')).toBe('outlined');
      expect(root.getAttribute('data-size')).toBe('md');
    });
  });

  describe('Sections', () => {
    it('renders leftSection when provided', () => {
      const { container, getByTestId } = render(
        <Input leftSection={<span data-testid="lhs">L</span>} />,
      );
      expect(getByTestId('lhs')).toBeInTheDocument();
      const section = container.querySelector('[data-position="left"]');
      expect(section).toBeInTheDocument();
    });

    it('renders rightSection when provided', () => {
      const { container, getByTestId } = render(
        <Input rightSection={<span data-testid="rhs">R</span>} />,
      );
      expect(getByTestId('rhs')).toBeInTheDocument();
      expect(container.querySelector('[data-position="right"]')).toBeInTheDocument();
    });

    it('does not render section containers when not provided', () => {
      const { container } = render(<Input />);
      expect(container.querySelector('[data-position="left"]')).toBeNull();
      expect(container.querySelector('[data-position="right"]')).toBeNull();
    });
  });

  describe('HTML props passthrough', () => {
    it('forwards onChange to the input', () => {
      const onChange = vi.fn();
      const { container } = render(<Input onChange={onChange} />);
      const input = container.querySelector('input')!;
      fireEvent.change(input, { target: { value: 'hello' } });
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('supports controlled value', () => {
      const { container, rerender } = render(<Input value="a" onChange={() => {}} />);
      const input = container.querySelector('input') as HTMLInputElement;
      expect(input.value).toBe('a');
      rerender(<Input value="b" onChange={() => {}} />);
      expect(input.value).toBe('b');
    });

    it('forwards type prop to input', () => {
      const { container } = render(<Input type="email" />);
      expect(container.querySelector('input')?.type).toBe('email');
    });
  });

  describe('Standalone usage (no Field)', () => {
    it('does not inject id / aria-describedby / aria-required / aria-invalid', () => {
      const { container } = render(<Input />);
      const input = container.querySelector('input') as HTMLInputElement;
      expect(input.id).toBe('');
      expect(input.getAttribute('aria-describedby')).toBeNull();
      expect(input.getAttribute('aria-required')).toBeNull();
      expect(input.getAttribute('aria-invalid')).toBeNull();
    });

    it('respects user-provided id when used standalone', () => {
      const { container } = render(<Input id="standalone" />);
      expect(container.querySelector('input')?.id).toBe('standalone');
    });
  });

  describe('Field integration', () => {
    it('injects inputId from Field', () => {
      const { container } = render(
        <Field id="email">
          <Input />
        </Field>,
      );
      expect(container.querySelector('input')?.id).toBe('email-input');
    });

    it('Label htmlFor connects to Input id (end-to-end)', () => {
      const { container } = render(
        <Field id="user">
          <Field.Label>Username</Field.Label>
          <Input />
        </Field>,
      );
      const label = container.querySelector('label');
      const input = container.querySelector('input');
      expect(label?.getAttribute('for')).toBe('user-input');
      expect(input?.id).toBe('user-input');
    });

    it('injects aria-describedby with descriptionId and errorId (even without those components)', () => {
      const { container } = render(
        <Field id="foo">
          <Input />
        </Field>,
      );
      const describedby = container.querySelector('input')!.getAttribute('aria-describedby');
      expect(describedby).toContain('foo-description');
      expect(describedby).toContain('foo-error');
    });

    it('injects aria-required from Field.required', () => {
      const { container } = render(
        <Field required>
          <Input />
        </Field>,
      );
      expect(container.querySelector('input')?.getAttribute('aria-required')).toBe('true');
    });

    it('injects aria-invalid from Field.invalid', () => {
      const { container } = render(
        <Field invalid>
          <Input />
        </Field>,
      );
      expect(container.querySelector('input')?.getAttribute('aria-invalid')).toBe('true');
    });

    it('propagates disabled from Field to input and root[data-disabled]', () => {
      const { container } = render(
        <Field disabled>
          <Input />
        </Field>,
      );
      const input = container.querySelector('input') as HTMLInputElement;
      const root = container.querySelector('[data-variant]') as HTMLElement;
      expect(input.disabled).toBe(true);
      expect(root.hasAttribute('data-disabled')).toBe(true);
    });

    it('propagates readOnly from Field to input and root[data-readonly]', () => {
      const { container } = render(
        <Field readOnly>
          <Input />
        </Field>,
      );
      const input = container.querySelector('input') as HTMLInputElement;
      const root = container.querySelector('[data-variant]') as HTMLElement;
      expect(input.readOnly).toBe(true);
      expect(root.hasAttribute('data-readonly')).toBe(true);
    });

    it('Input props override Field context (disabled)', () => {
      const { container } = render(
        <Field disabled>
          <Input disabled={false} />
        </Field>,
      );
      expect((container.querySelector('input') as HTMLInputElement).disabled).toBe(false);
    });

    it('Input props override Field context (id)', () => {
      const { container } = render(
        <Field id="foo">
          <Input id="mine" />
        </Field>,
      );
      expect(container.querySelector('input')?.id).toBe('mine');
    });

    it('does NOT derive aria-invalid from <Field.Error> existence', () => {
      const { container } = render(
        <Field id="x">
          <Input />
          <Field.Error>bad</Field.Error>
        </Field>,
      );
      expect(container.querySelector('input')?.getAttribute('aria-invalid')).toBeNull();
    });
  });

  describe('aria placement', () => {
    it('aria-* attributes go on <input>, not on the wrapper', () => {
      const { container } = render(
        <Field required invalid id="z">
          <Input />
        </Field>,
      );
      const root = container.querySelector('[data-variant]') as HTMLElement;
      const input = container.querySelector('input') as HTMLInputElement;
      expect(root.getAttribute('aria-required')).toBeNull();
      expect(root.getAttribute('aria-invalid')).toBeNull();
      expect(root.getAttribute('aria-describedby')).toBeNull();
      expect(input.getAttribute('aria-required')).toBe('true');
      expect(input.getAttribute('aria-invalid')).toBe('true');
      expect(input.getAttribute('aria-describedby')).toBeTruthy();
    });
  });

  describe('Not-exposed props (regression guard)', () => {
    it('Input does not accept `invalid` prop on type — runtime confirms wrapper renders without invalid attribute on DOM', () => {
      // TypeScript prevents <Input invalid />; runtime check: no stray DOM attr.
      const { container } = render(<Input />);
      const root = container.firstElementChild as HTMLElement;
      expect(root.hasAttribute('invalid')).toBe(false);
    });
  });

  describe('Pointer mode', () => {
    it('renders data-pointer when pointer=true', () => {
      const { container } = render(<Input pointer />);
      expect(container.firstElementChild?.hasAttribute('data-pointer')).toBe(true);
    });
  });

  describe('Vars resolver', () => {
    it('exposes --input-left-section-width CSS var when leftSectionWidth provided', () => {
      const { container } = render(
        <Input leftSection={<span />} leftSectionWidth="40px" />,
      );
      const root = container.firstElementChild as HTMLElement;
      expect(root.style.cssText).toContain('--input-left-section-width');
    });
  });

  // ── Variant Token Layer (variant.md §1.1, IV-1, IV-4) ──────────────────
  describe('Variant Token Layer', () => {
    it('outlined variant injects --prismui-variant-* routed to VariantRole.bordered (neutral)', () => {
      const { container } = render(<Input variant="outlined" />);
      const root = container.firstElementChild as HTMLElement;
      expect(root.style.getPropertyValue('--prismui-variant-bg')).toBe(
        'var(--prismui-color-neutral-bordered-bg)',
      );
      expect(root.style.getPropertyValue('--prismui-variant-border')).toBe(
        'var(--prismui-color-neutral-bordered-border)',
      );
      expect(root.style.getPropertyValue('--prismui-variant-hover-border')).toBe(
        'var(--prismui-color-neutral-bordered-hover-border)',
      );
      expect(root.style.getPropertyValue('--prismui-variant-fg')).toBe(
        'var(--prismui-color-neutral-bordered-fg)',
      );
    });

    it('filled variant injects --prismui-variant-* routed to VariantRole.low (neutral)', () => {
      const { container } = render(<Input variant="filled" />);
      const root = container.firstElementChild as HTMLElement;
      expect(root.style.getPropertyValue('--prismui-variant-bg')).toBe(
        'var(--prismui-color-neutral-low-bg)',
      );
      expect(root.style.getPropertyValue('--prismui-variant-hover-bg')).toBe(
        'var(--prismui-color-neutral-low-hover-bg)',
      );
      // filled → low role has transparent border (per variant-color-resolver)
      expect(root.style.getPropertyValue('--prismui-variant-border')).toBe('transparent');
    });

    it('unstyled variant is token-free: NO --prismui-variant-* injected (IV-4)', () => {
      const { container } = render(<Input variant="unstyled" />);
      const root = container.firstElementChild as HTMLElement;
      expect(root.style.getPropertyValue('--prismui-variant-bg')).toBe('');
      expect(root.style.getPropertyValue('--prismui-variant-border')).toBe('');
      expect(root.style.getPropertyValue('--prismui-variant-hover-bg')).toBe('');
      expect(root.style.getPropertyValue('--prismui-variant-hover-border')).toBe('');
    });

    it('default (no variant prop) equals explicit variant="outlined"', () => {
      const { container: a } = render(<Input />);
      const { container: b } = render(<Input variant="outlined" />);
      const rootA = a.firstElementChild as HTMLElement;
      const rootB = b.firstElementChild as HTMLElement;
      expect(rootA.style.getPropertyValue('--prismui-variant-border')).toBe(
        rootB.style.getPropertyValue('--prismui-variant-border'),
      );
    });
  });
});
