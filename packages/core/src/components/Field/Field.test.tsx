import * as React from 'react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, renderHook } from '@testing-library/react';
import { Field } from './Field';
import { FieldLabel } from './FieldLabel';
import { FieldDescription } from './FieldDescription';
import { FieldError } from './FieldError';
import { useFieldContext } from './FieldContext';
import { useFieldControlProps } from './useFieldControlProps';

describe('Field', () => {
  describe('Basic Rendering', () => {
    it('renders as <div> by default', () => {
      const { container } = render(<Field>content</Field>);
      expect(container.querySelector('div')).toBeInTheDocument();
    });

    it('renders children', () => {
      const { getByText } = render(<Field>hello</Field>);
      expect(getByText('hello')).toBeInTheDocument();
    });

    it('does NOT set data-disabled on root (Field root is not in state system)', () => {
      const { container } = render(<Field disabled>x</Field>);
      const root = container.firstElementChild as HTMLElement;
      // Field root must not expose state via data-disabled — would break Headless positioning.
      expect(root.hasAttribute('data-disabled')).toBe(false);
    });

    it('does NOT accept label/description/error props (Headless)', () => {
      // Type-level constraint: if these ever re-appear on FieldOwnProps, it's a regression.
      // Runtime: any unknown prop would leak to DOM; verify no such props exist.
      const { container } = render(<Field>x</Field>);
      const root = container.firstElementChild as HTMLElement;
      expect(root.getAttribute('label')).toBeNull();
      expect(root.getAttribute('error')).toBeNull();
    });
  });

  describe('ID System', () => {
    it('generates stable baseId via useId when id prop is omitted', () => {
      function Probe() {
        const ctx = useFieldContext();
        return <span data-testid="probe">{ctx?.baseId}</span>;
      }
      const { getByTestId, rerender } = render(
        <Field>
          <Probe />
        </Field>,
      );
      const first = getByTestId('probe').textContent;
      rerender(
        <Field>
          <Probe />
        </Field>,
      );
      const second = getByTestId('probe').textContent;
      expect(first).toBeTruthy();
      expect(first).toBe(second);
    });

    it('respects user-provided id as baseId', () => {
      function Probe() {
        const ctx = useFieldContext();
        return (
          <span data-testid="probe">
            {JSON.stringify({
              base: ctx?.baseId,
              input: ctx?.inputId,
              label: ctx?.labelId,
              desc: ctx?.descriptionId,
              err: ctx?.errorId,
            })}
          </span>
        );
      }
      const { getByTestId } = render(
        <Field id="myfield">
          <Probe />
        </Field>,
      );
      const parsed = JSON.parse(getByTestId('probe').textContent!);
      expect(parsed.base).toBe('myfield');
      expect(parsed.input).toBe('myfield-input');
      expect(parsed.label).toBe('myfield-label');
      expect(parsed.desc).toBe('myfield-description');
      expect(parsed.err).toBe('myfield-error');
    });
  });

  describe('Compound Components', () => {
    it('connects <label htmlFor> to the input id when id is provided', () => {
      const { container } = render(
        <Field id="email">
          <Field.Label>Email</Field.Label>
          <input />
        </Field>,
      );
      const label = container.querySelector('label');
      expect(label?.getAttribute('for')).toBe('email-input');
      expect(label?.id).toBe('email-label');
    });

    it('sets Description id to {baseId}-description', () => {
      const { container } = render(
        <Field id="foo">
          <Field.Description>hint</Field.Description>
        </Field>,
      );
      const p = container.querySelector('p');
      expect(p?.id).toBe('foo-description');
    });

    it('sets Error id to {baseId}-error', () => {
      const { container } = render(
        <Field id="foo">
          <Field.Error>bad</Field.Error>
        </Field>,
      );
      const p = container.querySelector('p');
      expect(p?.id).toBe('foo-error');
    });

    it('Field.Label gets data-required when Field.required=true', () => {
      const { container } = render(
        <Field required>
          <Field.Label>Email</Field.Label>
        </Field>,
      );
      expect(container.querySelector('label')?.hasAttribute('data-required')).toBe(true);
    });

    it('Field.Label gets data-disabled when Field.disabled=true', () => {
      const { container } = render(
        <Field disabled>
          <Field.Label>Email</Field.Label>
        </Field>,
      );
      expect(container.querySelector('label')?.hasAttribute('data-disabled')).toBe(true);
    });

    it('Field.Description does NOT render required marker', () => {
      const { container } = render(
        <Field required>
          <Field.Description>d</Field.Description>
        </Field>,
      );
      expect(container.querySelector('p')?.hasAttribute('data-required')).toBe(false);
    });

    it('Compound components render without Field (no throw, no ids injected)', () => {
      const { container } = render(<FieldLabel>standalone</FieldLabel>);
      const label = container.querySelector('label');
      expect(label).toBeInTheDocument();
      expect(label?.getAttribute('for')).toBeNull();
      expect(label?.id).toBe('');
    });
  });

  describe('useFieldContext', () => {
    it('returns null outside Field (does NOT throw)', () => {
      const { result } = renderHook(() => useFieldContext());
      expect(result.current).toBeNull();
    });

    it('returns context value inside Field', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Field id="x" invalid required disabled readOnly>
          {children}
        </Field>
      );
      const { result } = renderHook(() => useFieldContext(), { wrapper });
      expect(result.current).toEqual(
        expect.objectContaining({
          baseId: 'x',
          inputId: 'x-input',
          labelId: 'x-label',
          descriptionId: 'x-description',
          errorId: 'x-error',
          invalid: true,
          required: true,
          disabled: true,
          readOnly: true,
        }),
      );
    });
  });

  describe('useFieldControlProps', () => {
    function TestInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
      const merged = useFieldControlProps(props);
      return <input {...merged} data-testid="control" />;
    }

    it('injects inputId when Control has no id', () => {
      const { getByTestId } = render(
        <Field id="foo">
          <TestInput />
        </Field>,
      );
      expect(getByTestId('control').id).toBe('foo-input');
    });

    it('Control props (id) override Field inputId', () => {
      const { getByTestId } = render(
        <Field id="foo">
          <TestInput id="mine" />
        </Field>,
      );
      expect(getByTestId('control').id).toBe('mine');
    });

    it('propagates disabled / readOnly from Field to Control', () => {
      const { getByTestId } = render(
        <Field disabled readOnly>
          <TestInput />
        </Field>,
      );
      const input = getByTestId('control') as HTMLInputElement;
      expect(input.disabled).toBe(true);
      expect(input.readOnly).toBe(true);
    });

    it('injects aria-required / aria-invalid from Field state', () => {
      const { getByTestId } = render(
        <Field required invalid>
          <TestInput />
        </Field>,
      );
      const input = getByTestId('control');
      expect(input.getAttribute('aria-required')).toBe('true');
      expect(input.getAttribute('aria-invalid')).toBe('true');
    });

    it('aria-describedby always contains descriptionId + errorId (even if components absent)', () => {
      const { getByTestId } = render(
        <Field id="foo">
          <TestInput />
        </Field>,
      );
      const describedby = getByTestId('control').getAttribute('aria-describedby')!;
      expect(describedby.split(/\s+/)).toEqual(
        expect.arrayContaining(['foo-description', 'foo-error']),
      );
    });

    it('merges user aria-describedby with Field IDs (dedup, preserve order)', () => {
      const { getByTestId } = render(
        <Field id="foo">
          <TestInput aria-describedby="extra foo-description" />
        </Field>,
      );
      const describedby = getByTestId('control').getAttribute('aria-describedby')!;
      const ids = describedby.split(/\s+/);
      expect(ids).toEqual(['extra', 'foo-description', 'foo-error']);
    });

    it('passes props through untouched when Field is absent', () => {
      const { getByTestId } = render(<TestInput id="standalone" />);
      const input = getByTestId('control');
      expect(input.id).toBe('standalone');
      expect(input.getAttribute('aria-describedby')).toBeNull();
    });

    it('does NOT derive invalid from <Field.Error> existence', () => {
      // Field.Error rendered but invalid=false → aria-invalid must NOT be set.
      const { getByTestId } = render(
        <Field id="foo">
          <TestInput />
          <Field.Error>error text</Field.Error>
        </Field>,
      );
      expect(getByTestId('control').getAttribute('aria-invalid')).toBeNull();
    });

    it('status priority: disabled + invalid both reflected in DOM', () => {
      const { getByTestId } = render(
        <Field disabled invalid>
          <TestInput />
        </Field>,
      );
      const input = getByTestId('control') as HTMLInputElement;
      expect(input.disabled).toBe(true);
      expect(input.getAttribute('aria-invalid')).toBe('true');
    });

    it('works with Control nested deeper (no children scanning)', () => {
      const { getByTestId } = render(
        <Field id="nested">
          <div>
            <div>
              <TestInput />
            </div>
          </div>
        </Field>,
      );
      expect(getByTestId('control').id).toBe('nested-input');
    });
  });

  describe('Context stability', () => {
    it('FieldContextValue reference is stable across re-renders with same props', () => {
      let captured: unknown[] = [];
      function Probe() {
        const ctx = useFieldContext();
        captured.push(ctx);
        return null;
      }
      const { rerender } = render(
        <Field id="s" invalid>
          <Probe />
        </Field>,
      );
      rerender(
        <Field id="s" invalid>
          <Probe />
        </Field>,
      );
      expect(captured[0]).toBe(captured[1]);
    });

    it('new FieldContextValue when props change', () => {
      let captured: unknown[] = [];
      function Probe() {
        const ctx = useFieldContext();
        captured.push(ctx);
        return null;
      }
      const { rerender } = render(
        <Field id="s">
          <Probe />
        </Field>,
      );
      rerender(
        <Field id="s" invalid>
          <Probe />
        </Field>,
      );
      expect(captured[0]).not.toBe(captured[1]);
    });
  });

  describe('Compound component attachment', () => {
    it('exposes Label / Description / Error as static properties', () => {
      expect(Field.Label).toBe(FieldLabel);
      expect(Field.Description).toBe(FieldDescription);
      expect(Field.Error).toBe(FieldError);
    });
  });
});
