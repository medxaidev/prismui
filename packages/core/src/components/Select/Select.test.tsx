import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PrismuiProvider } from '../../core/PrismuiProvider/PrismuiProvider';
import { overlayModule } from '../../core/runtime/overlay/overlayModule';
import { Select } from './Select';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const FRUITS = ['Apple', 'Banana', 'Cherry', 'Date'];

const OBJECT_DATA = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry', disabled: true },
];

const GROUPED_DATA = [
  { value: 'apple', label: 'Apple', group: 'Fruits' },
  { value: 'banana', label: 'Banana', group: 'Fruits' },
  { value: 'carrot', label: 'Carrot', group: 'Vegetables' },
];

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <PrismuiProvider withCssVars={false} withCssBaseline={false} modules={[overlayModule()]}>
      {children}
    </PrismuiProvider>
  );
}

function renderSelect(props: Partial<React.ComponentProps<typeof Select>> = {}) {
  return render(
    <Select
      data={FRUITS}
      placeholder="Pick one"
      withinPortal={false}
      transitionDuration={0}
      {...props}
    />,
    { wrapper: Wrapper },
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Select', () => {
  describe('Rendering', () => {
    it('renders a trigger input', () => {
      renderSelect();
      expect(screen.getByPlaceholderText('Pick one')).toBeDefined();
    });

    it('renders label when provided', () => {
      renderSelect({ label: 'Fruit' });
      expect(screen.getByText('Fruit')).toBeDefined();
    });

    it('renders description when provided', () => {
      renderSelect({ description: 'Choose your favorite' });
      expect(screen.getByText('Choose your favorite')).toBeDefined();
    });

    it('renders error message when provided', () => {
      renderSelect({ error: 'Required field' });
      expect(screen.getByText('Required field')).toBeDefined();
    });

    it('renders with object data', () => {
      render(<Select data={OBJECT_DATA} placeholder="Pick" withinPortal={false} transitionDuration={0} />, { wrapper: Wrapper });
      expect(screen.getByPlaceholderText('Pick')).toBeDefined();
    });
  });

  describe('Dropdown behavior', () => {
    it('opens dropdown on click', () => {
      renderSelect();
      const trigger = screen.getByPlaceholderText('Pick one');
      fireEvent.click(trigger);
      expect(screen.getByRole('listbox')).toBeDefined();
    });

    it('shows all options when opened', () => {
      renderSelect();
      fireEvent.click(screen.getByPlaceholderText('Pick one'));
      for (const fruit of FRUITS) {
        expect(screen.getByText(fruit)).toBeDefined();
      }
    });

    it('shows options from object data', () => {
      render(<Select data={OBJECT_DATA} placeholder="Pick" withinPortal={false} transitionDuration={0} />, { wrapper: Wrapper });
      fireEvent.click(screen.getByPlaceholderText('Pick'));
      expect(screen.getByText('Apple')).toBeDefined();
      expect(screen.getByText('Banana')).toBeDefined();
    });
  });

  describe('Selection', () => {
    it('calls onChange when an option is clicked', () => {
      const onChange = vi.fn();
      renderSelect({ onChange });
      fireEvent.click(screen.getByPlaceholderText('Pick one'));
      fireEvent.click(screen.getByText('Banana'));
      expect(onChange).toHaveBeenCalledWith('Banana');
    });

    it('displays selected value in trigger', () => {
      renderSelect({ value: 'Cherry' });
      expect((screen.getByPlaceholderText('Pick one') as HTMLInputElement).value).toBe('Cherry');
    });

    it('displays label for object data selection', () => {
      render(<Select data={OBJECT_DATA} value="banana" placeholder="Pick" withinPortal={false} transitionDuration={0} />, { wrapper: Wrapper });
      expect((screen.getByPlaceholderText('Pick') as HTMLInputElement).value).toBe('Banana');
    });

    it('closes dropdown after selection', () => {
      renderSelect();
      fireEvent.click(screen.getByPlaceholderText('Pick one'));
      expect(screen.getByRole('listbox')).toBeDefined();
      fireEvent.click(screen.getByText('Apple'));
      expect(screen.queryByRole('listbox')).toBeNull();
    });
  });

  describe('Clearable', () => {
    it('shows clear button when clearable and value is set', () => {
      renderSelect({ clearable: true, value: 'Apple' });
      expect(screen.getByLabelText('Clear selection')).toBeDefined();
    });

    it('does not show clear button when no value', () => {
      renderSelect({ clearable: true });
      expect(screen.queryByLabelText('Clear selection')).toBeNull();
    });

    it('calls onChange with null when clear is clicked', () => {
      const onChange = vi.fn();
      renderSelect({ clearable: true, value: 'Apple', onChange });
      fireEvent.click(screen.getByLabelText('Clear selection'));
      expect(onChange).toHaveBeenCalledWith(null);
    });

    it('does not show clear button when disabled', () => {
      renderSelect({ clearable: true, value: 'Apple', disabled: true });
      expect(screen.queryByLabelText('Clear selection')).toBeNull();
    });
  });

  describe('Grouped options', () => {
    it('renders group labels', () => {
      render(<Select data={GROUPED_DATA} placeholder="Pick" withinPortal={false} transitionDuration={0} />, { wrapper: Wrapper });
      fireEvent.click(screen.getByPlaceholderText('Pick'));
      expect(screen.getByText('Fruits')).toBeDefined();
      expect(screen.getByText('Vegetables')).toBeDefined();
    });
  });

  describe('Disabled options', () => {
    it('renders disabled options with data-combobox-disabled', () => {
      render(<Select data={OBJECT_DATA} placeholder="Pick" withinPortal={false} transitionDuration={0} />, { wrapper: Wrapper });
      fireEvent.click(screen.getByPlaceholderText('Pick'));
      const cherryOption = screen.getByText('Cherry');
      expect(cherryOption.closest('[data-combobox-disabled]')).not.toBeNull();
    });
  });

  describe('Empty state', () => {
    it('shows nothing found message when data is empty', () => {
      render(<Select data={[]} placeholder="Pick" nothingFoundMessage="No items" withinPortal={false} transitionDuration={0} />, { wrapper: Wrapper });
      fireEvent.click(screen.getByPlaceholderText('Pick'));
      expect(screen.getByText('No items')).toBeDefined();
    });
  });

  describe('Disabled state', () => {
    it('disables the trigger input', () => {
      renderSelect({ disabled: true });
      expect((screen.getByPlaceholderText('Pick one') as HTMLInputElement).disabled).toBe(true);
    });
  });

  describe('ARIA attributes', () => {
    it('sets role="combobox" on trigger', () => {
      renderSelect();
      expect(screen.getByRole('combobox')).toBeDefined();
    });

    it('sets aria-expanded=false when closed', () => {
      renderSelect();
      expect(screen.getByRole('combobox').getAttribute('aria-expanded')).toBe('false');
    });

    it('sets aria-expanded=true when opened', () => {
      renderSelect();
      fireEvent.click(screen.getByPlaceholderText('Pick one'));
      expect(screen.getByRole('combobox').getAttribute('aria-expanded')).toBe('true');
    });

    it('sets aria-haspopup="listbox"', () => {
      renderSelect();
      expect(screen.getByRole('combobox').getAttribute('aria-haspopup')).toBe('listbox');
    });
  });

  describe('Keyboard navigation', () => {
    it('opens dropdown on ArrowDown', () => {
      renderSelect();
      const trigger = screen.getByPlaceholderText('Pick one');
      fireEvent.keyDown(trigger, { key: 'ArrowDown', code: 'ArrowDown' });
      expect(screen.getByRole('listbox')).toBeDefined();
    });

    it('opens dropdown on Space (button target)', () => {
      renderSelect();
      const trigger = screen.getByPlaceholderText('Pick one');
      fireEvent.keyDown(trigger, { key: ' ', code: 'Space' });
      expect(screen.getByRole('listbox')).toBeDefined();
    });

    it('closes dropdown on Escape', () => {
      renderSelect();
      const trigger = screen.getByPlaceholderText('Pick one');
      fireEvent.click(trigger);
      expect(screen.getByRole('listbox')).toBeDefined();
      fireEvent.keyDown(trigger, { key: 'Escape' });
      expect(screen.queryByRole('listbox')).toBeNull();
    });
  });

  describe('Custom render', () => {
    it('uses renderOption when provided', () => {
      render(
        <Select
          data={OBJECT_DATA}
          placeholder="Pick"
          withinPortal={false}
          transitionDuration={0}
          renderOption={(opt, { selected }) => (
            <span data-testid={`custom-${opt.value}`}>
              {selected ? '✓ ' : ''}{opt.label}
            </span>
          )}
        />,
        { wrapper: Wrapper },
      );
      fireEvent.click(screen.getByPlaceholderText('Pick'));
      expect(screen.getByTestId('custom-apple')).toBeDefined();
      expect(screen.getByTestId('custom-banana')).toBeDefined();
    });
  });
});
