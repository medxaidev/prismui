import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PrismuiProvider } from '../../core/PrismuiProvider/PrismuiProvider';
import { TextField } from './TextField';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof TextField> = {
  title: 'Components/TextField',
  component: TextField,
  decorators: [
    (Story) => (
      <PrismuiProvider>
        <Story />
      </PrismuiProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TextField>;

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
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 24,
};

const stack: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
};

// ---------------------------------------------------------------------------
// Icons (inline SVG)
// ---------------------------------------------------------------------------

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M13 13L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 5L10 11L17 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="4" y="9" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 9V7C6 4.79 7.79 3 10 3C12.21 3 14 4.79 14 7V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ cursor: 'pointer' }}>
      <path d="M2 10C2 10 5 4 10 4C15 4 18 10 18 10C18 10 15 16 10 16C5 16 2 10 2 10Z" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Story 1: All Three Variants
// ---------------------------------------------------------------------------

export const AllVariants: Story = {
  name: '1. All Variants (outlined / filled / standard)',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>TextField Variants</h3>
      <p style={subtitle}>
        <strong>outlined</strong> — border with label notch.{' '}
        <strong>filled</strong> — gray background with underline.{' '}
        <strong>standard</strong> — underline only.
      </p>
      <div style={grid}>
        <TextField label="Outlined" variant="outlined" />
        <TextField label="Filled" variant="filled" />
        <TextField label="Standard" variant="standard" />
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 2: Floating Label Behavior
// ---------------------------------------------------------------------------

function FloatingLabelDemo() {
  const [value1, setValue1] = useState('');
  const [value2, setValue2] = useState('');
  const [value3, setValue3] = useState('');

  return (
    <div style={card}>
      <h3 style={sectionTitle}>Floating Label</h3>
      <p style={subtitle}>
        Click to focus — the label floats up and shrinks. Type a value — the label stays shrunk after blur.
      </p>
      <div style={grid}>
        <TextField
          label="Outlined"
          variant="outlined"
          value={value1}
          onChange={(e) => setValue1(e.target.value)}
        />
        <TextField
          label="Filled"
          variant="filled"
          value={value2}
          onChange={(e) => setValue2(e.target.value)}
        />
        <TextField
          label="Standard"
          variant="standard"
          value={value3}
          onChange={(e) => setValue3(e.target.value)}
        />
      </div>
      <div style={{ marginTop: 16, fontSize: 13, color: '#6b7280' }}>
        Values: outlined=&quot;{value1}&quot;, filled=&quot;{value2}&quot;, standard=&quot;{value3}&quot;
      </div>
    </div>
  );
}

export const FloatingLabel: Story = {
  name: '2. Floating Label Behavior',
  render: () => <FloatingLabelDemo />,
};

// ---------------------------------------------------------------------------
// Story 3: Sizes
// ---------------------------------------------------------------------------

export const AllSizes: Story = {
  name: '3. Sizes (sm / md)',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Sizes</h3>
      <p style={subtitle}>
        <strong>sm</strong> — 40px height, 14px font.{' '}
        <strong>md</strong> — 56px height, 16px font (default).
      </p>
      <div style={stack}>
        <div style={grid}>
          <TextField label="Outlined sm" variant="outlined" size="sm" />
          <TextField label="Filled sm" variant="filled" size="sm" />
          <TextField label="Standard sm" variant="standard" size="sm" />
        </div>
        <div style={grid}>
          <TextField label="Outlined md" variant="outlined" size="md" />
          <TextField label="Filled md" variant="filled" size="md" />
          <TextField label="Standard md" variant="standard" size="md" />
        </div>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 4: With Sections (Icons)
// ---------------------------------------------------------------------------

export const WithSections: Story = {
  name: '4. With Sections (Icons)',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Left & Right Sections</h3>
      <p style={subtitle}>Icons placed inside the input field, similar to MUI InputAdornment.</p>
      <div style={stack}>
        <div style={grid}>
          <TextField label="Search" variant="outlined" leftSection={<SearchIcon />} />
          <TextField label="Search" variant="filled" leftSection={<SearchIcon />} />
          <TextField label="Search" variant="standard" leftSection={<SearchIcon />} />
        </div>
        <div style={grid}>
          <TextField
            label="Email"
            variant="outlined"
            leftSection={<MailIcon />}
            placeholder="you@example.com"
          />
          <TextField
            label="Password"
            variant="outlined"
            type="password"
            leftSection={<LockIcon />}
            rightSection={<EyeIcon />}
            rightSectionPointerEvents="all"
          />
          <TextField
            label="Amount"
            variant="outlined"
            leftSection={<span style={{ fontSize: 16, color: '#9ca3af' }}>$</span>}
            rightSection={<span style={{ fontSize: 12, color: '#9ca3af' }}>USD</span>}
          />
        </div>
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
      <p style={subtitle}>Red border/underline + red label + error message in helperText area.</p>
      <div style={grid}>
        <TextField
          label="Email"
          variant="outlined"
          error="Invalid email address"
          defaultValue="bad-email"
        />
        <TextField
          label="Email"
          variant="filled"
          error="Invalid email address"
          defaultValue="bad-email"
        />
        <TextField
          label="Email"
          variant="standard"
          error="Invalid email address"
          defaultValue="bad-email"
        />
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
      <p style={subtitle}>Muted colors and not-allowed cursor across all variants.</p>
      <div style={grid}>
        <TextField label="Outlined" variant="outlined" disabled defaultValue="Disabled" />
        <TextField label="Filled" variant="filled" disabled defaultValue="Disabled" />
        <TextField label="Standard" variant="standard" disabled defaultValue="Disabled" />
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 7: Helper Text
// ---------------------------------------------------------------------------

export const HelperText: Story = {
  name: '7. Helper Text',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Helper Text</h3>
      <p style={subtitle}>Contextual help displayed below the input.</p>
      <div style={grid}>
        <TextField
          label="Password"
          variant="outlined"
          type="password"
          helperText="Must be at least 8 characters"
        />
        <TextField
          label="Username"
          variant="filled"
          helperText="Only letters and numbers"
        />
        <TextField
          label="Bio"
          variant="standard"
          helperText="Brief description about yourself"
        />
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 8: Required
// ---------------------------------------------------------------------------

export const Required: Story = {
  name: '8. Required',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Required Field</h3>
      <p style={subtitle}>Asterisk appended to the floating label.</p>
      <div style={grid}>
        <TextField label="Full Name" variant="outlined" required />
        <TextField label="Full Name" variant="filled" required />
        <TextField label="Full Name" variant="standard" required />
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 9: Multiline (Textarea)
// ---------------------------------------------------------------------------

export const Multiline: Story = {
  name: '9. Multiline (Textarea)',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Multiline</h3>
      <p style={subtitle}>Renders a textarea element with the same floating label behavior.</p>
      <div style={grid}>
        <TextField label="Description" variant="outlined" multiline rows={4} />
        <TextField label="Description" variant="filled" multiline rows={4} />
        <TextField label="Description" variant="standard" multiline rows={4} />
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 10: Force Shrink
// ---------------------------------------------------------------------------

export const ForceShrink: Story = {
  name: '10. Force Shrink',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Force Shrink</h3>
      <p style={subtitle}>
        Use <code>shrink</code> prop to force the label into shrunk state. Useful for date/time inputs.
      </p>
      <div style={grid}>
        <TextField label="Date" variant="outlined" type="date" shrink />
        <TextField label="Time" variant="filled" type="time" shrink />
        <TextField label="Datetime" variant="standard" type="datetime-local" shrink />
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 11: Controlled
// ---------------------------------------------------------------------------

function ControlledDemo() {
  const [value, setValue] = useState('');
  return (
    <div style={card}>
      <h3 style={sectionTitle}>Controlled TextField</h3>
      <p style={subtitle}>Value managed externally via React state.</p>
      <div style={{ maxWidth: 400 }}>
        <TextField
          label="Controlled"
          variant="outlined"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          helperText={`${value.length} characters`}
        />
        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => setValue('Hello World')}
            style={{
              padding: '6px 12px',
              fontSize: 13,
              border: '1px solid #e5e7eb',
              borderRadius: 4,
              background: '#fff',
              cursor: 'pointer',
            }}
          >
            Set &quot;Hello World&quot;
          </button>
          <button
            type="button"
            onClick={() => setValue('')}
            style={{
              padding: '6px 12px',
              fontSize: 13,
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
      </div>
    </div>
  );
}

export const Controlled: Story = {
  name: '11. Controlled',
  render: () => <ControlledDemo />,
};

// ---------------------------------------------------------------------------
// Story 12: Full Form Example
// ---------------------------------------------------------------------------

function FormDemo() {
  return (
    <div style={card}>
      <h3 style={sectionTitle}>Full Form Example</h3>
      <p style={subtitle}>A realistic form layout using TextField components.</p>
      <div style={{ maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <TextField label="First Name" variant="outlined" required />
          <TextField label="Last Name" variant="outlined" required />
        </div>
        <TextField label="Email Address" variant="outlined" type="email" required leftSection={<MailIcon />} />
        <TextField label="Password" variant="outlined" type="password" required leftSection={<LockIcon />} rightSection={<EyeIcon />} rightSectionPointerEvents="all" helperText="Must be at least 8 characters" />
        <TextField label="Bio" variant="outlined" multiline rows={3} helperText="Tell us about yourself" />
        <button
          type="button"
          style={{
            padding: '10px 24px',
            fontSize: 14,
            fontWeight: 600,
            border: 'none',
            borderRadius: 8,
            background: '#1C252E',
            color: '#fff',
            cursor: 'pointer',
            alignSelf: 'flex-start',
          }}
        >
          Submit
        </button>
      </div>
    </div>
  );
}

export const FullForm: Story = {
  name: '12. Full Form Example',
  render: () => <FormDemo />,
};
