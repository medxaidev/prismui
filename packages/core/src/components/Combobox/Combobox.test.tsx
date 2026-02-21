import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PrismuiProvider } from '../../core/PrismuiProvider/PrismuiProvider';
import { overlayModule } from '../../core/runtime/overlay/overlayModule';
import { Combobox } from './Combobox';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const FRUITS = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'];

const OBJECT_DATA = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry', disabled: true },
];

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <PrismuiProvider withCssVars={false} withCssBaseline={false} modules={[overlayModule()]}>
      {children}
    </PrismuiProvider>
  );
}

function renderCombobox(props: Partial<React.ComponentProps<typeof Combobox>> = {}) {
  return render(<Combobox data={FRUITS} placeholder="Pick one" {...props} />, { wrapper: Wrapper });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Combobox', () => {
  describe('Rendering', () => {
    it('renders a trigger input', () => {
      renderCombobox();
      expect(screen.getByPlaceholderText('Pick one')).toBeDefined();
    });

    it('renders label when provided', () => {
      renderCombobox({ label: 'Fruit' });
      expect(screen.getByText('Fruit')).toBeDefined();
    });

    it('renders description when provided', () => {
      renderCombobox({ description: 'Choose your favorite' });
      expect(screen.getByText('Choose your favorite')).toBeDefined();
    });

    it('renders error message when provided', () => {
      renderCombobox({ error: 'Required field' });
      expect(screen.getByText('Required field')).toBeDefined();
    });
  });

  describe('Dropdown behavior', () => {
    it('opens dropdown on click', () => {
      renderCombobox();
      fireEvent.click(screen.getByPlaceholderText('Pick one'));
      expect(screen.getByRole('listbox')).toBeDefined();
    });

    it('shows search input in dropdown', () => {
      renderCombobox();
      fireEvent.click(screen.getByPlaceholderText('Pick one'));
      expect(screen.getByRole('searchbox')).toBeDefined();
    });

    it('shows all options when opened without search', () => {
      renderCombobox();
      fireEvent.click(screen.getByPlaceholderText('Pick one'));
      for (const fruit of FRUITS) {
        expect(screen.getByText(fruit)).toBeDefined();
      }
    });
  });

  describe('Search filtering', () => {
    it('filters options based on search input', () => {
      renderCombobox();
      fireEvent.click(screen.getByPlaceholderText('Pick one'));
      const searchInput = screen.getByRole('searchbox');
      fireEvent.change(searchInput, { target: { value: 'ban' } });
      expect(screen.getByText('Banana')).toBeDefined();
      expect(screen.queryByText('Apple')).toBeNull();
      expect(screen.queryByText('Cherry')).toBeNull();
    });

    it('shows nothing found message when no options match', () => {
      renderCombobox({ nothingFoundMessage: 'No matches' });
      fireEvent.click(screen.getByPlaceholderText('Pick one'));
      const searchInput = screen.getByRole('searchbox');
      fireEvent.change(searchInput, { target: { value: 'zzzzz' } });
      expect(screen.getByText('No matches')).toBeDefined();
    });

    it('uses custom filter function', () => {
      const filter = vi.fn((opt: { value: string; label?: string }, search: string) => {
        return opt.value.startsWith(search);
      });
      render(<Combobox data={OBJECT_DATA} placeholder="Pick" filter={filter} />, { wrapper: Wrapper });
      fireEvent.click(screen.getByPlaceholderText('Pick'));
      const searchInput = screen.getByRole('searchbox');
      fireEvent.change(searchInput, { target: { value: 'b' } });
      expect(filter).toHaveBeenCalled();
      expect(screen.getByText('Banana')).toBeDefined();
    });

    it('calls onSearchChange when search value changes', () => {
      const onSearchChange = vi.fn();
      renderCombobox({ onSearchChange });
      fireEvent.click(screen.getByPlaceholderText('Pick one'));
      const searchInput = screen.getByRole('searchbox');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      expect(onSearchChange).toHaveBeenCalledWith('test');
    });
  });

  describe('Selection', () => {
    it('calls onChange when an option is clicked', () => {
      const onChange = vi.fn();
      renderCombobox({ onChange });
      fireEvent.click(screen.getByPlaceholderText('Pick one'));
      fireEvent.click(screen.getByText('Banana'));
      expect(onChange).toHaveBeenCalledWith('Banana');
    });

    it('displays selected value in trigger', () => {
      renderCombobox({ value: 'Cherry' });
      expect((screen.getByPlaceholderText('Pick one') as HTMLInputElement).value).toBe('Cherry');
    });

    it('closes dropdown after selection', () => {
      renderCombobox();
      fireEvent.click(screen.getByPlaceholderText('Pick one'));
      expect(screen.getByRole('listbox')).toBeDefined();
      fireEvent.click(screen.getByText('Apple'));
      expect(screen.queryByRole('listbox')).toBeNull();
    });
  });

  describe('Clearable', () => {
    it('shows clear button when clearable and value is set', () => {
      renderCombobox({ clearable: true, value: 'Apple' });
      expect(screen.getByLabelText('Clear selection')).toBeDefined();
    });

    it('calls onChange with null when clear is clicked', () => {
      const onChange = vi.fn();
      renderCombobox({ clearable: true, value: 'Apple', onChange });
      fireEvent.click(screen.getByLabelText('Clear selection'));
      expect(onChange).toHaveBeenCalledWith(null);
    });
  });

  describe('Disabled state', () => {
    it('disables the trigger input', () => {
      renderCombobox({ disabled: true });
      expect((screen.getByPlaceholderText('Pick one') as HTMLInputElement).disabled).toBe(true);
    });
  });

  describe('ARIA attributes', () => {
    it('sets role="combobox" on trigger', () => {
      renderCombobox();
      expect(screen.getByRole('combobox')).toBeDefined();
    });

    it('sets aria-expanded when opened', () => {
      renderCombobox();
      fireEvent.click(screen.getByPlaceholderText('Pick one'));
      expect(screen.getByRole('combobox').getAttribute('aria-expanded')).toBe('true');
    });

    it('search input has aria-autocomplete="list"', () => {
      renderCombobox();
      fireEvent.click(screen.getByPlaceholderText('Pick one'));
      expect(screen.getByRole('searchbox').getAttribute('aria-autocomplete')).toBe('list');
    });
  });

  describe('Keyboard navigation', () => {
    it('opens dropdown on ArrowDown', () => {
      renderCombobox();
      const trigger = screen.getByPlaceholderText('Pick one');
      fireEvent.keyDown(trigger, { key: 'ArrowDown' });
      expect(screen.getByRole('listbox')).toBeDefined();
    });

    it('closes dropdown on Escape', () => {
      renderCombobox();
      fireEvent.click(screen.getByPlaceholderText('Pick one'));
      expect(screen.getByRole('listbox')).toBeDefined();
      const searchInput = screen.getByRole('searchbox');
      fireEvent.keyDown(searchInput, { key: 'Escape' });
      expect(screen.queryByRole('listbox')).toBeNull();
    });
  });

  describe('Search placeholder', () => {
    it('uses default search placeholder', () => {
      renderCombobox();
      fireEvent.click(screen.getByPlaceholderText('Pick one'));
      expect(screen.getByPlaceholderText('Search...')).toBeDefined();
    });

    it('uses custom search placeholder', () => {
      renderCombobox({ searchPlaceholder: 'Type to filter...' });
      fireEvent.click(screen.getByPlaceholderText('Pick one'));
      expect(screen.getByPlaceholderText('Type to filter...')).toBeDefined();
    });
  });
});
