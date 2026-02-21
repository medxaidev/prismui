import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InputBase, InputWrapper } from './InputBase';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderInput(props: React.ComponentProps<typeof InputBase> = {}) {
  return render(<InputBase placeholder="Type here" {...props} />);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('InputBase', () => {
  describe('Rendering', () => {
    it('renders a native input element', () => {
      renderInput();
      expect(screen.getByRole('textbox')).toBeDefined();
    });

    it('renders label when provided', () => {
      renderInput({ label: 'Full Name' });
      expect(screen.getByText('Full Name')).toBeDefined();
    });

    it('renders description when provided', () => {
      renderInput({ description: 'Enter your full name' });
      expect(screen.getByText('Enter your full name')).toBeDefined();
    });

    it('renders error message when string', () => {
      renderInput({ error: 'This field is required' });
      expect(screen.getByText('This field is required')).toBeDefined();
    });

    it('renders required asterisk with required prop', () => {
      renderInput({ label: 'Name', required: true });
      expect(screen.getByText('*')).toBeDefined();
    });

    it('renders required asterisk with withAsterisk prop', () => {
      renderInput({ label: 'Name', withAsterisk: true });
      expect(screen.getByText('*')).toBeDefined();
    });

    it('renders leftSection when provided', () => {
      renderInput({ leftSection: <span data-testid="left-icon">L</span> });
      expect(screen.getByTestId('left-icon')).toBeDefined();
    });

    it('renders rightSection when provided', () => {
      renderInput({ rightSection: <span data-testid="right-icon">R</span> });
      expect(screen.getByTestId('right-icon')).toBeDefined();
    });

    it('renders placeholder text', () => {
      renderInput({ placeholder: 'Enter value' });
      expect(screen.getByPlaceholderText('Enter value')).toBeDefined();
    });

    it('does not render InputWrapper when no label/description/error', () => {
      const { container } = renderInput();
      // Should not have the root wrapper div with label
      expect(container.querySelector('label')).toBeNull();
    });

    it('renders InputWrapper when label is provided', () => {
      const { container } = renderInput({ label: 'Email' });
      expect(container.querySelector('label')).not.toBeNull();
    });
  });

  describe('State attributes', () => {
    it('sets data-focused on focus and removes on blur', () => {
      renderInput();
      const input = screen.getByRole('textbox');
      const wrapper = input.closest('[data-variant]') as HTMLElement;

      fireEvent.focus(input);
      expect(wrapper.hasAttribute('data-focused')).toBe(true);

      fireEvent.blur(input);
      expect(wrapper.hasAttribute('data-focused')).toBe(false);
    });

    it('sets data-error when error is a string', () => {
      renderInput({ error: 'Error!' });
      const input = screen.getByRole('textbox');
      const wrapper = input.closest('[data-variant]') as HTMLElement;
      expect(wrapper.hasAttribute('data-error')).toBe(true);
    });

    it('sets data-error when error is true', () => {
      renderInput({ error: true });
      const input = screen.getByRole('textbox');
      const wrapper = input.closest('[data-variant]') as HTMLElement;
      expect(wrapper.hasAttribute('data-error')).toBe(true);
    });

    it('sets data-disabled when disabled', () => {
      renderInput({ disabled: true });
      const input = screen.getByRole('textbox');
      const wrapper = input.closest('[data-variant]') as HTMLElement;
      expect(wrapper.hasAttribute('data-disabled')).toBe(true);
    });

    it('sets data-with-left-section when leftSection provided', () => {
      renderInput({ leftSection: <span>L</span> });
      const input = screen.getByRole('textbox');
      const wrapper = input.closest('[data-variant]') as HTMLElement;
      expect(wrapper.hasAttribute('data-with-left-section')).toBe(true);
    });

    it('sets data-with-right-section when rightSection provided', () => {
      renderInput({ rightSection: <span>R</span> });
      const input = screen.getByRole('textbox');
      const wrapper = input.closest('[data-variant]') as HTMLElement;
      expect(wrapper.hasAttribute('data-with-right-section')).toBe(true);
    });
  });

  describe('Variants', () => {
    it('defaults to data-variant="outlined"', () => {
      renderInput();
      const input = screen.getByRole('textbox');
      const wrapper = input.closest('[data-variant]') as HTMLElement;
      expect(wrapper.getAttribute('data-variant')).toBe('outlined');
    });

    it('renders outlined variant', () => {
      renderInput({ variant: 'outlined' });
      const input = screen.getByRole('textbox');
      const wrapper = input.closest('[data-variant]') as HTMLElement;
      expect(wrapper.getAttribute('data-variant')).toBe('outlined');
    });

    it('renders soft variant', () => {
      renderInput({ variant: 'soft' });
      const input = screen.getByRole('textbox');
      const wrapper = input.closest('[data-variant]') as HTMLElement;
      expect(wrapper.getAttribute('data-variant')).toBe('soft');
    });

    it('renders plain variant', () => {
      renderInput({ variant: 'plain' });
      const input = screen.getByRole('textbox');
      const wrapper = input.closest('[data-variant]') as HTMLElement;
      expect(wrapper.getAttribute('data-variant')).toBe('plain');
    });
  });

  describe('Sizes', () => {
    it('defaults to data-size="sm"', () => {
      renderInput();
      const input = screen.getByRole('textbox');
      const wrapper = input.closest('[data-variant]') as HTMLElement;
      expect(wrapper.getAttribute('data-size')).toBe('sm');
    });

    it.each(['sm', 'md', 'lg'] as const)('sets data-size="%s"', (size) => {
      renderInput({ size });
      const input = screen.getByRole('textbox');
      const wrapper = input.closest('[data-variant]') as HTMLElement;
      expect(wrapper.getAttribute('data-size')).toBe(size);
    });
  });

  describe('InputWrapper standalone', () => {
    it('renders label and children', () => {
      render(
        <InputWrapper label="Email" labelFor="email-input">
          <input id="email-input" />
        </InputWrapper>,
      );
      expect(screen.getByText('Email')).toBeDefined();
      expect(screen.getByRole('textbox')).toBeDefined();
    });

    it('renders error message', () => {
      render(
        <InputWrapper error="Invalid email">
          <input />
        </InputWrapper>,
      );
      expect(screen.getByText('Invalid email')).toBeDefined();
    });

    it('renders description', () => {
      render(
        <InputWrapper description="We will never share your email">
          <input />
        </InputWrapper>,
      );
      expect(screen.getByText('We will never share your email')).toBeDefined();
    });

    it('renders elements in custom inputWrapperOrder', () => {
      const { container } = render(
        <InputWrapper
          label="Name"
          description="Your name"
          error="Required"
          inputWrapperOrder={['error', 'label', 'input', 'description']}
        >
          <input />
        </InputWrapper>,
      );
      const root = container.firstChild as HTMLElement;
      const children = Array.from(root.childNodes);
      // error should come before label
      const errorIndex = children.findIndex(
        (n) => (n as HTMLElement).textContent === 'Required',
      );
      const labelIndex = children.findIndex(
        (n) => (n as HTMLElement).tagName === 'LABEL',
      );
      expect(errorIndex).toBeLessThan(labelIndex);
    });

    it('sets data-full-width when fullWidth is true', () => {
      const { container } = render(
        <InputWrapper fullWidth>
          <input />
        </InputWrapper>,
      );
      expect((container.firstChild as HTMLElement).hasAttribute('data-full-width')).toBe(true);
    });
  });

  describe('Ref forwarding', () => {
    it('forwards ref to native input', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<InputBase ref={ref} />);
      expect(ref.current).toBeDefined();
      expect(ref.current?.tagName).toBe('INPUT');
    });
  });

  describe('Native props', () => {
    it('passes placeholder to native input', () => {
      renderInput({ placeholder: 'Search...' });
      expect(screen.getByPlaceholderText('Search...')).toBeDefined();
    });

    it('calls onChange when input changes', () => {
      const onChange = vi.fn();
      renderInput({ onChange });
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'hello' } });
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('calls onFocus when input is focused', () => {
      const onFocus = vi.fn();
      renderInput({ onFocus });
      fireEvent.focus(screen.getByRole('textbox'));
      expect(onFocus).toHaveBeenCalledTimes(1);
    });

    it('calls onBlur when input is blurred', () => {
      const onBlur = vi.fn();
      renderInput({ onBlur });
      fireEvent.blur(screen.getByRole('textbox'));
      expect(onBlur).toHaveBeenCalledTimes(1);
    });

    it('sets disabled on native input', () => {
      renderInput({ disabled: true });
      expect((screen.getByRole('textbox') as HTMLInputElement).disabled).toBe(true);
    });

    it('sets data-pointer when pointer prop is true', () => {
      renderInput({ pointer: true });
      expect(screen.getByRole('textbox').hasAttribute('data-pointer')).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('label htmlFor matches input id', () => {
      renderInput({ label: 'Name', id: 'name-input' });
      const label = screen.getByText('Name').closest('label');
      expect(label?.getAttribute('for')).toBe('name-input');
    });

    it('sets aria-required when required', () => {
      renderInput({ required: true });
      expect(screen.getByRole('textbox').getAttribute('aria-required')).toBe('true');
    });

    it('sets aria-required when withAsterisk', () => {
      renderInput({ withAsterisk: true });
      expect(screen.getByRole('textbox').getAttribute('aria-required')).toBe('true');
    });

    it('sets aria-invalid when error is truthy', () => {
      renderInput({ error: 'Required' });
      expect(screen.getByRole('textbox').getAttribute('aria-invalid')).toBe('true');
    });

    it('sets aria-describedby when description provided', () => {
      renderInput({ description: 'Helper text' });
      const input = screen.getByRole('textbox');
      expect(input.getAttribute('aria-describedby')).toBeTruthy();
    });

    it('sets aria-errormessage when error string provided', () => {
      renderInput({ error: 'Error message' });
      const input = screen.getByRole('textbox');
      expect(input.getAttribute('aria-errormessage')).toBeTruthy();
    });

    it('does not set aria-errormessage when error is boolean true', () => {
      renderInput({ error: true });
      const input = screen.getByRole('textbox');
      expect(input.getAttribute('aria-errormessage')).toBeNull();
    });
  });
});
