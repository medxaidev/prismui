import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PrismuiProvider } from '../../core/PrismuiProvider/PrismuiProvider';
import { Input } from './Input';
import { InputBase, InputWrapper } from '../InputBase/InputBase';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  decorators: [
    (Story) => (
      <PrismuiProvider>
        <Story />
      </PrismuiProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Input>;

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
// Icons (inline SVG)
// ---------------------------------------------------------------------------

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: '#9ca3af' }}>
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: '#9ca3af' }}>
      <rect x="1.5" y="3" width="13" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 4L8 9L14 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: '#9ca3af' }}>
      <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 7V5C5 3.34 6.34 2 8 2C9.66 2 11 3.34 11 5V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Story 1: Basic Input
// ---------------------------------------------------------------------------

export const Basic: Story = {
  name: '1. Basic Input',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Basic Input</h3>
      <p style={subtitle}>Default outlined variant with label, description, and placeholder.</p>
      <div style={{ maxWidth: 360 }}>
        <Input label="Full name" description="Enter your legal name" placeholder="John Doe" />
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 2: All Variants
// ---------------------------------------------------------------------------

export const AllVariants: Story = {
  name: '2. All Variants (outlined / soft / plain)',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Variants</h3>
      <p style={subtitle}>
        <strong>outlined</strong> — border + white bg, focus ring.{' '}
        <strong>soft</strong> — gray fill, no border.{' '}
        <strong>plain</strong> — no border, no bg.
      </p>
      <div style={grid}>
        <Input label="Outlined (default)" variant="outlined" placeholder="outlined" />
        <Input label="Soft" variant="soft" placeholder="soft" />
        <Input label="Plain" variant="plain" placeholder="plain" />
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 3: All Sizes
// ---------------------------------------------------------------------------

export const AllSizes: Story = {
  name: '3. All Sizes (sm / md / lg)',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Sizes</h3>
      <p style={subtitle}>Three size variants controlling height, font size, and padding.</p>
      <div style={stack}>
        <Input label="Small (sm)" size="sm" placeholder="sm — 32px height" />
        <Input label="Medium (md)" size="md" placeholder="md — 36px height" />
        <Input label="Large (lg)" size="lg" placeholder="lg — 42px height" />
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 4: With Sections
// ---------------------------------------------------------------------------

export const WithSections: Story = {
  name: '4. With Sections (left / right)',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Left & Right Sections</h3>
      <p style={subtitle}>Icons or elements placed inside the input field.</p>
      <div style={stack}>
        <Input label="Search" leftSection={<SearchIcon />} placeholder="Search..." />
        <Input label="Email" leftSection={<MailIcon />} placeholder="you@example.com" />
        <Input label="Password" leftSection={<LockIcon />} rightSection={<span style={{ fontSize: 11, color: '#9ca3af', cursor: 'pointer' }}>Show</span>} rightSectionPointerEvents="all" placeholder="••••••••" type="password" />
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 5: Error State
// ---------------------------------------------------------------------------

export const ErrorState: Story = {
  name: '5. Error State',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Error State</h3>
      <p style={subtitle}>Error message displayed below the input with red border.</p>
      <div style={grid}>
        <Input label="Email" placeholder="you@example.com" error="Invalid email address" variant="outlined" />
        <Input label="Email" placeholder="you@example.com" error="Invalid email address" variant="soft" />
        <Input label="Email" placeholder="you@example.com" error="Invalid email address" variant="plain" />
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 6: Disabled State
// ---------------------------------------------------------------------------

export const DisabledState: Story = {
  name: '6. Disabled State',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Disabled State</h3>
      <p style={subtitle}>Disabled inputs across all variants.</p>
      <div style={grid}>
        <Input label="Outlined" variant="outlined" placeholder="Disabled" disabled />
        <Input label="Soft" variant="soft" placeholder="Disabled" disabled />
        <Input label="Plain" variant="plain" placeholder="Disabled" disabled />
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 7: Input.Wrapper Standalone
// ---------------------------------------------------------------------------

export const WrapperStandalone: Story = {
  name: '7. Input.Wrapper Standalone',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Input.Wrapper — Standalone Layout</h3>
      <p style={subtitle}>
        InputWrapper can wrap any custom input element, providing label, description, and error layout.
      </p>
      <div style={{ maxWidth: 360 }}>
        <InputWrapper
          label="Custom input"
          description="This wraps a native textarea"
          error="This field is required"
          required
        >
          <textarea
            placeholder="Type here..."
            style={{
              width: '100%',
              minHeight: 80,
              padding: 8,
              border: '1px solid #e5e7eb',
              borderRadius: 6,
              fontFamily: 'inherit',
              fontSize: 14,
              resize: 'vertical',
            }}
          />
        </InputWrapper>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 8: Controlled
// ---------------------------------------------------------------------------

function ControlledDemo() {
  const [value, setValue] = useState('');
  return (
    <div style={card}>
      <h3 style={sectionTitle}>Controlled Input</h3>
      <p style={subtitle}>Value is managed externally via React state.</p>
      <div style={{ maxWidth: 360 }}>
        <Input
          label="Controlled"
          placeholder="Type something..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <div style={{ marginTop: 12, fontSize: 13, color: '#6b7280' }}>
          Current value: <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: 4 }}>{value || '(empty)'}</code>
        </div>
      </div>
    </div>
  );
}

export const Controlled: Story = {
  name: '8. Controlled',
  render: () => <ControlledDemo />,
};
