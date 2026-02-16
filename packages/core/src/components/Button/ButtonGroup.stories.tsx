import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PrismuiProvider } from '../../core/PrismuiProvider/PrismuiProvider';
import { Button } from './index';


// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof Button.Group> = {
  title: 'Components/ButtonGroup',
  component: Button.Group,
  decorators: [
    (Story) => (
      <PrismuiProvider>
        <Story />
      </PrismuiProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Button.Group>;

// ---------------------------------------------------------------------------
// Styles
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

const note: React.CSSProperties = {
  fontSize: 13,
  color: '#6b7280',
  margin: '0 0 16px',
};

const subTitle: React.CSSProperties = {
  margin: '16px 0 8px',
  fontSize: 13,
  fontWeight: 600,
  color: '#6b7280',
};

const row: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  flexWrap: 'wrap',
  marginBottom: 12,
};

const col: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
};

// ---------------------------------------------------------------------------
// Story 1: Outlined (default)
// ---------------------------------------------------------------------------

export const Outlined: Story = {
  name: '1. Outlined (Default)',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Outlined Button.Group</h3>
      <p style={note}>Default variant. Borders overlap to avoid double-width.</p>
      <div style={row}>
        <Button.Group>
          <Button variant="outlined">One</Button>
          <Button variant="outlined">Two</Button>
          <Button variant="outlined">Three</Button>
        </Button.Group>
      </div>
      <h4 style={subTitle}>With colors</h4>
      <div style={row}>
        <Button.Group>
          <Button variant="outlined" color="primary">Primary</Button>
          <Button variant="outlined" color="primary">Two</Button>
          <Button variant="outlined" color="primary">Three</Button>
        </Button.Group>
        <Button.Group>
          <Button variant="outlined" color="error">Error</Button>
          <Button variant="outlined" color="error">Two</Button>
          <Button variant="outlined" color="error">Three</Button>
        </Button.Group>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 2: Solid
// ---------------------------------------------------------------------------

export const Solid: Story = {
  name: '2. Solid',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Solid Button.Group</h3>
      <p style={note}>Solid variant. Right borders removed between siblings.</p>
      <div style={row}>
        <Button.Group variant="solid">
          <Button variant="solid">One</Button>
          <Button variant="solid">Two</Button>
          <Button variant="solid">Three</Button>
        </Button.Group>
      </div>
      <h4 style={subTitle}>With colors</h4>
      <div style={row}>
        <Button.Group variant="solid">
          <Button variant="solid" color="success">Success</Button>
          <Button variant="solid" color="success">Two</Button>
          <Button variant="solid" color="success">Three</Button>
        </Button.Group>
        <Button.Group variant="solid">
          <Button variant="solid" color="warning">Warning</Button>
          <Button variant="solid" color="warning">Two</Button>
          <Button variant="solid" color="warning">Three</Button>
        </Button.Group>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 3: Soft
// ---------------------------------------------------------------------------

export const Soft: Story = {
  name: '3. Soft',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Soft Button.Group</h3>
      <p style={note}>Soft variant. Right borders removed between siblings.</p>
      <div style={row}>
        <Button.Group variant="soft">
          <Button variant="soft">One</Button>
          <Button variant="soft">Two</Button>
          <Button variant="soft">Three</Button>
        </Button.Group>
      </div>
      <h4 style={subTitle}>With colors</h4>
      <div style={row}>
        <Button.Group variant="soft">
          <Button variant="soft" color="info">Info</Button>
          <Button variant="soft" color="info">Two</Button>
          <Button variant="soft" color="info">Three</Button>
        </Button.Group>
        <Button.Group variant="soft">
          <Button variant="soft" color="secondary">Secondary</Button>
          <Button variant="soft" color="secondary">Two</Button>
          <Button variant="soft" color="secondary">Three</Button>
        </Button.Group>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 4: Plain
// ---------------------------------------------------------------------------

export const Plain: Story = {
  name: '4. Plain',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Plain Button.Group</h3>
      <p style={note}>Plain variant. Subtle separator between buttons.</p>
      <div style={row}>
        <Button.Group variant="plain">
          <Button variant="plain">One</Button>
          <Button variant="plain">Two</Button>
          <Button variant="plain">Three</Button>
        </Button.Group>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 5: Vertical
// ---------------------------------------------------------------------------

export const Vertical: Story = {
  name: '5. Vertical',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Vertical Button.Group</h3>
      <p style={note}>Vertical orientation. Border radius adjusted for top/bottom edges.</p>
      <div style={row}>
        <Button.Group orientation="vertical">
          <Button variant="outlined">One</Button>
          <Button variant="outlined">Two</Button>
          <Button variant="outlined">Three</Button>
        </Button.Group>
        <Button.Group orientation="vertical" variant="solid">
          <Button variant="solid">One</Button>
          <Button variant="solid">Two</Button>
          <Button variant="solid">Three</Button>
        </Button.Group>
        <Button.Group orientation="vertical" variant="soft">
          <Button variant="soft" color="info">One</Button>
          <Button variant="soft" color="info">Two</Button>
          <Button variant="soft" color="info">Three</Button>
        </Button.Group>
        <Button.Group orientation="vertical" variant="plain">
          <Button variant="plain">One</Button>
          <Button variant="plain">Two</Button>
          <Button variant="plain">Three</Button>
        </Button.Group>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 6: Sizes
// ---------------------------------------------------------------------------

export const Sizes: Story = {
  name: '6. Sizes',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Sizes</h3>
      <p style={note}>Button.Group inherits size from child Buttons.</p>
      <div style={col}>
        {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
          <div key={size} style={row}>
            <span style={{ fontSize: 12, color: '#9ca3af', width: 24 }}>{size}</span>
            <Button.Group>
              <Button variant="outlined" size={size}>One</Button>
              <Button variant="outlined" size={size}>Two</Button>
              <Button variant="outlined" size={size}>Three</Button>
            </Button.Group>
          </div>
        ))}
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 7: Disabled
// ---------------------------------------------------------------------------

export const Disabled: Story = {
  name: '7. Disabled',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Disabled States</h3>
      <p style={note}>Per-variant disabled styling using palette action tokens.</p>
      <div style={col}>
        <div style={row}>
          <span style={{ fontSize: 12, color: '#9ca3af', width: 60 }}>solid</span>
          <Button.Group variant="solid">
            <Button variant="solid" disabled>One</Button>
            <Button variant="solid" disabled>Two</Button>
            <Button variant="solid" disabled>Three</Button>
          </Button.Group>
        </div>
        <div style={row}>
          <span style={{ fontSize: 12, color: '#9ca3af', width: 60 }}>outlined</span>
          <Button.Group>
            <Button variant="outlined" disabled>One</Button>
            <Button variant="outlined" disabled>Two</Button>
            <Button variant="outlined" disabled>Three</Button>
          </Button.Group>
        </div>
        <div style={row}>
          <span style={{ fontSize: 12, color: '#9ca3af', width: 60 }}>soft</span>
          <Button.Group variant="soft">
            <Button variant="soft" disabled>One</Button>
            <Button variant="soft" disabled>Two</Button>
            <Button variant="soft" disabled>Three</Button>
          </Button.Group>
        </div>
        <div style={row}>
          <span style={{ fontSize: 12, color: '#9ca3af', width: 60 }}>plain</span>
          <Button.Group variant="plain">
            <Button variant="plain" disabled>One</Button>
            <Button variant="plain" disabled>Two</Button>
            <Button variant="plain" disabled>Three</Button>
          </Button.Group>
        </div>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 8: Loading
// ---------------------------------------------------------------------------

export const Loading: Story = {
  name: '8. Loading',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Loading in Button.Group</h3>
      <p style={note}>Individual buttons can show loading state using the Loader component.</p>
      <div style={row}>
        <Button.Group>
          <Button variant="outlined">Submit</Button>
          <Button variant="outlined">Fetch data</Button>
          <Button variant="outlined" loading>Saving…</Button>
        </Button.Group>
      </div>
      <div style={row}>
        <Button.Group variant="solid">
          <Button variant="solid">Submit</Button>
          <Button variant="solid" loading>Loading</Button>
          <Button variant="solid">Cancel</Button>
        </Button.Group>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 9: API Reference
// ---------------------------------------------------------------------------

export const ApiReference: Story = {
  name: '9. API Reference',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Button.Group API Reference</h3>
      <table style={{ borderCollapse: 'collapse', fontSize: 13, width: '100%' }}>
        <thead>
          <tr>
            <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb', color: '#6b7280' }}>Prop</th>
            <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb', color: '#6b7280' }}>Type</th>
            <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb', color: '#6b7280' }}>Default</th>
            <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb', color: '#6b7280' }}>Description</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['orientation', "'horizontal' | 'vertical'", "'horizontal'", 'Flex direction of the group'],
            ['variant', "'solid' | 'outlined' | 'soft' | 'plain'", "'outlined'", 'Controls border handling between children'],
          ].map(([prop, type, def, desc], i) => (
            <tr key={i}>
              <td style={{ padding: '6px 12px', borderBottom: '1px solid #f3f4f6', fontWeight: 600, fontFamily: 'monospace', fontSize: 12 }}>{prop}</td>
              <td style={{ padding: '6px 12px', borderBottom: '1px solid #f3f4f6', fontFamily: 'monospace', fontSize: 11, color: '#6b7280' }}>{type}</td>
              <td style={{ padding: '6px 12px', borderBottom: '1px solid #f3f4f6', fontFamily: 'monospace', fontSize: 12 }}>{def}</td>
              <td style={{ padding: '6px 12px', borderBottom: '1px solid #f3f4f6', fontSize: 12 }}>{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h4 style={subTitle}>Border Handling per Variant</h4>
      <ul style={{ fontSize: 13, lineHeight: 1.8, paddingLeft: 20 }}>
        <li><strong>solid / soft</strong>: Right border removed between siblings</li>
        <li><strong>outlined</strong>: Negative margin to overlap borders (avoid double-width)</li>
        <li><strong>plain</strong>: Subtle divider separator between buttons</li>
      </ul>
      <h4 style={subTitle}>Styles API Selectors</h4>
      <p style={{ fontSize: 13, fontFamily: 'monospace' }}>group</p>
    </div>
  ),
};
