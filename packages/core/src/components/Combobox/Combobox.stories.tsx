import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PrismuiProvider } from '../../core/PrismuiProvider/PrismuiProvider';
import { overlayModule } from '../../core/runtime/overlay/overlayModule';
import { Combobox } from './Combobox';
import type { SelectOption } from '../Select/Select';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof Combobox> = {
  title: 'Components/Combobox',
  component: Combobox,
  decorators: [
    (Story) => (
      <PrismuiProvider modules={[overlayModule()]}>
        <Story />
      </PrismuiProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Combobox>;

// ---------------------------------------------------------------------------
// Shared data
// ---------------------------------------------------------------------------

const COUNTRIES = [
  'Argentina', 'Australia', 'Brazil', 'Canada', 'China',
  'Denmark', 'Egypt', 'France', 'Germany', 'India',
  'Japan', 'Mexico', 'Norway', 'Portugal', 'Spain',
  'Sweden', 'Switzerland', 'United Kingdom', 'United States',
];

const FRAMEWORKS: SelectOption[] = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'angular', label: 'Angular' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'solid', label: 'SolidJS' },
  { value: 'preact', label: 'Preact' },
  { value: 'lit', label: 'Lit' },
  { value: 'qwik', label: 'Qwik' },
];

const LARGE_DATASET = Array.from({ length: 200 }, (_, i) => `Item ${i + 1}`);

// ---------------------------------------------------------------------------
// Shared styles
// ---------------------------------------------------------------------------

const card: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  padding: 20,
  marginBottom: 16,
};

const sectionTitle: React.CSSProperties = {
  margin: '0 0 12px',
  fontSize: 15,
  fontWeight: 700,
};

const subtitle: React.CSSProperties = {
  fontSize: 13,
  color: '#6b7280',
  margin: '0 0 16px',
};

// ---------------------------------------------------------------------------
// Story 1: Basic Combobox
// ---------------------------------------------------------------------------

export const Basic: Story = {
  name: '1. Basic Combobox',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Basic Combobox</h3>
      <p style={subtitle}>Searchable dropdown with type-to-filter. Click to open, then type in the search input.</p>
      <div style={{ maxWidth: 300 }}>
        <Combobox data={COUNTRIES} label="Country" placeholder="Select a country" />
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 2: Clearable
// ---------------------------------------------------------------------------

function ClearableDemo() {
  const [value, setValue] = useState<string | null>('react');
  return (
    <div style={card}>
      <h3 style={sectionTitle}>Clearable Combobox</h3>
      <p style={subtitle}>Shows a clear button when a value is selected.</p>
      <div style={{ maxWidth: 300 }}>
        <Combobox
          data={FRAMEWORKS}
          label="Framework"
          placeholder="Pick a framework"
          clearable
          value={value}
          onChange={setValue}
        />
        <div style={{ marginTop: 12, fontSize: 13, color: '#6b7280' }}>
          Selected: <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: 4 }}>{value ?? '(none)'}</code>
        </div>
      </div>
    </div>
  );
}

export const Clearable: Story = {
  name: '2. Clearable',
  render: () => <ClearableDemo />,
};

// ---------------------------------------------------------------------------
// Story 3: Custom Filter
// ---------------------------------------------------------------------------

export const CustomFilter: Story = {
  name: '3. Custom Filter',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Custom Filter — Starts With</h3>
      <p style={subtitle}>
        Uses a custom filter that only matches options starting with the search term (instead of the default &quot;includes&quot;).
      </p>
      <div style={{ maxWidth: 300 }}>
        <Combobox
          data={COUNTRIES}
          label="Country"
          placeholder="Type to filter..."
          filter={(opt, search) => {
            const label = (opt.label || opt.value).toLowerCase();
            return label.startsWith(search.toLowerCase().trim());
          }}
        />
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 4: Custom renderOption
// ---------------------------------------------------------------------------

export const CustomRenderOption: Story = {
  name: '4. Custom renderOption',
  render: () => {
    const flagMap: Record<string, string> = {
      react: '⚛️',
      vue: '💚',
      angular: '🅰️',
      svelte: '🔥',
      solid: '💎',
      preact: '⚡',
      lit: '🔦',
      qwik: '⚡',
    };
    return (
      <div style={card}>
        <h3 style={sectionTitle}>Custom Option Rendering</h3>
        <p style={subtitle}>Each option rendered with an emoji icon and selected checkmark.</p>
        <div style={{ maxWidth: 300 }}>
          <Combobox
            data={FRAMEWORKS}
            label="Framework"
            placeholder="Pick a framework"
            value="react"
            renderOption={(opt, { selected }) => (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{flagMap[opt.value] || '📦'}</span>
                <span style={{ flex: 1 }}>{opt.label}</span>
                {selected && <span style={{ color: '#16a34a' }}>✓</span>}
              </div>
            )}
          />
        </div>
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// Story 5: Large Dataset
// ---------------------------------------------------------------------------

export const LargeDataset: Story = {
  name: '5. Large Dataset (200 items)',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Large Dataset</h3>
      <p style={subtitle}>200 items with search filtering. The dropdown scrolls to accommodate all options.</p>
      <div style={{ maxWidth: 300 }}>
        <Combobox data={LARGE_DATASET} label="Item" placeholder="Search 200 items..." />
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 6: Custom Search Placeholder
// ---------------------------------------------------------------------------

export const CustomSearchPlaceholder: Story = {
  name: '6. Custom Search Placeholder',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Custom Search Placeholder</h3>
      <p style={subtitle}>The search input inside the dropdown uses a custom placeholder.</p>
      <div style={{ maxWidth: 300 }}>
        <Combobox
          data={COUNTRIES}
          label="Country"
          placeholder="Select a country"
          searchPlaceholder="🔍 Type to search countries..."
        />
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 7: Controlled Search Value
// ---------------------------------------------------------------------------

function ControlledSearchDemo() {
  const [value, setValue] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  return (
    <div style={card}>
      <h3 style={sectionTitle}>Controlled Search Value</h3>
      <p style={subtitle}>Both value and search are controlled externally.</p>
      <div style={{ maxWidth: 300 }}>
        <Combobox
          data={FRAMEWORKS}
          label="Framework"
          placeholder="Pick a framework"
          value={value}
          onChange={setValue}
          searchValue={search}
          onSearchChange={setSearch}
        />
        <div style={{ marginTop: 12, fontSize: 13, color: '#6b7280', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div>
            Selected: <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: 4 }}>{value ?? '(none)'}</code>
          </div>
          <div>
            Search: <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: 4 }}>{search || '(empty)'}</code>
          </div>
        </div>
        <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => { setValue(null); setSearch(''); }}
            style={{
              padding: '4px 10px',
              fontSize: 12,
              border: '1px solid #fca5a5',
              borderRadius: 4,
              background: '#fef2f2',
              color: '#dc2626',
              cursor: 'pointer',
            }}
          >
            Reset All
          </button>
          <button
            type="button"
            onClick={() => setSearch('re')}
            style={{
              padding: '4px 10px',
              fontSize: 12,
              border: '1px solid #e5e7eb',
              borderRadius: 4,
              background: '#fff',
              cursor: 'pointer',
            }}
          >
            Set search to &quot;re&quot;
          </button>
        </div>
      </div>
    </div>
  );
}

export const ControlledSearch: Story = {
  name: '7. Controlled Search Value',
  render: () => <ControlledSearchDemo />,
};
