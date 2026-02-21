import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PrismuiProvider } from '../../core/PrismuiProvider/PrismuiProvider';
import { overlayModule } from '../../core/runtime/overlay/overlayModule';
import { Select } from './Select';
import type { SelectOption } from './Select';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
  decorators: [
    (Story) => (
      <PrismuiProvider modules={[overlayModule()]}>
        <Story />
      </PrismuiProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Select>;

// ---------------------------------------------------------------------------
// Shared data
// ---------------------------------------------------------------------------

const FRUITS = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry', 'Fig', 'Grape'];

const FRAMEWORKS: SelectOption[] = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'angular', label: 'Angular' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'solid', label: 'SolidJS' },
];

const GROUPED_DATA: SelectOption[] = [
  { value: 'react', label: 'React', group: 'JavaScript' },
  { value: 'vue', label: 'Vue', group: 'JavaScript' },
  { value: 'angular', label: 'Angular', group: 'JavaScript' },
  { value: 'django', label: 'Django', group: 'Python' },
  { value: 'flask', label: 'Flask', group: 'Python' },
  { value: 'rails', label: 'Rails', group: 'Ruby' },
];

const WITH_DISABLED: SelectOption[] = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'angular', label: 'Angular', disabled: true },
  { value: 'svelte', label: 'Svelte' },
  { value: 'ember', label: 'Ember', disabled: true },
];

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

const grid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
  gap: 16,
};

const stack: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
};

// ---------------------------------------------------------------------------
// Story 1: Basic Select
// ---------------------------------------------------------------------------

export const Basic: Story = {
  name: '1. Basic Select',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Basic Select</h3>
      <p style={subtitle}>Simple dropdown picker with string data.</p>
      <div style={{ maxWidth: 300 }}>
        <Select data={FRUITS} label="Favorite fruit" placeholder="Pick one" />
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
      <h3 style={sectionTitle}>Clearable Select</h3>
      <p style={subtitle}>Shows a clear button when a value is selected.</p>
      <div style={{ maxWidth: 300 }}>
        <Select
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
// Story 3: Grouped Options
// ---------------------------------------------------------------------------

export const GroupedOptions: Story = {
  name: '3. Grouped Options',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Grouped Options</h3>
      <p style={subtitle}>Options organized under group headers.</p>
      <div style={{ maxWidth: 300 }}>
        <Select data={GROUPED_DATA} label="Framework" placeholder="Pick a framework" />
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 4: Custom renderOption
// ---------------------------------------------------------------------------

export const CustomRenderOption: Story = {
  name: '4. Custom renderOption',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Custom Option Rendering</h3>
      <p style={subtitle}>Custom render function with checkmark for selected option.</p>
      <div style={{ maxWidth: 300 }}>
        <Select
          data={FRAMEWORKS}
          label="Framework"
          placeholder="Pick a framework"
          value="react"
          renderOption={(opt, { selected }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 16, textAlign: 'center', color: selected ? '#16a34a' : 'transparent' }}>✓</span>
              <span>{opt.label}</span>
            </div>
          )}
        />
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 5: All Sizes
// ---------------------------------------------------------------------------

export const AllSizes: Story = {
  name: '5. All Sizes',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Sizes</h3>
      <p style={subtitle}>Three size variants: sm, md, lg.</p>
      <div style={stack}>
        <Select data={FRUITS} label="Small (sm)" size="sm" placeholder="Pick one" />
        <Select data={FRUITS} label="Medium (md)" size="md" placeholder="Pick one" />
        <Select data={FRUITS} label="Large (lg)" size="lg" placeholder="Pick one" />
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 6: Disabled Options
// ---------------------------------------------------------------------------

export const DisabledOptions: Story = {
  name: '6. Disabled Options',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Disabled Options</h3>
      <p style={subtitle}>Angular and Ember are disabled and cannot be selected.</p>
      <div style={{ maxWidth: 300 }}>
        <Select data={WITH_DISABLED} label="Framework" placeholder="Pick a framework" />
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 7: Nothing Found
// ---------------------------------------------------------------------------

export const NothingFound: Story = {
  name: '7. Nothing Found',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Empty State</h3>
      <p style={subtitle}>Custom message when no options are available.</p>
      <div style={{ maxWidth: 300 }}>
        <Select data={[]} label="Framework" placeholder="Pick a framework" nothingFoundMessage="No frameworks available" />
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 8: Controlled
// ---------------------------------------------------------------------------

function ControlledDemo() {
  const [value, setValue] = useState<string | null>(null);
  return (
    <div style={card}>
      <h3 style={sectionTitle}>Controlled Select</h3>
      <p style={subtitle}>Value managed externally via React state.</p>
      <div style={{ maxWidth: 300 }}>
        <Select
          data={FRAMEWORKS}
          label="Framework"
          placeholder="Pick a framework"
          value={value}
          onChange={setValue}
        />
        <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {FRAMEWORKS.map((fw) => (
            <button
              key={fw.value}
              type="button"
              onClick={() => setValue(fw.value)}
              style={{
                padding: '4px 10px',
                fontSize: 12,
                border: '1px solid #e5e7eb',
                borderRadius: 4,
                background: value === fw.value ? '#eff6ff' : '#fff',
                cursor: 'pointer',
              }}
            >
              {fw.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setValue(null)}
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
            Clear
          </button>
        </div>
        <div style={{ marginTop: 8, fontSize: 13, color: '#6b7280' }}>
          Selected: <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: 4 }}>{value ?? '(none)'}</code>
        </div>
      </div>
    </div>
  );
}

export const Controlled: Story = {
  name: '8. Controlled',
  render: () => <ControlledDemo />,
};
