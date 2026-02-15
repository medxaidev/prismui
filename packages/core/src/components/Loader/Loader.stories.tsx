import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PrismuiProvider } from '../../core/PrismuiProvider/PrismuiProvider';
import { Loader } from './Loader';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof Loader> = {
  title: 'Components/Loader',
  component: Loader,
  decorators: [
    (Story) => (
      <PrismuiProvider>
        <Story />
      </PrismuiProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Loader>;

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
  gap: 24,
  flexWrap: 'wrap',
};

// ---------------------------------------------------------------------------
// Story 1: Basic
// ---------------------------------------------------------------------------

export const Basic: Story = {
  name: '1. Basic',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Basic Loader</h3>
      <p style={note}>
        Circular spinner with a "chasing tail" dash animation (Minimals / MUI CircularProgress style).
        Default size is <code>md</code> (36px), color is <code>currentColor</code>.
      </p>
      <Loader />
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 2: Sizes
// ---------------------------------------------------------------------------

export const Sizes: Story = {
  name: '2. Sizes',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Sizes</h3>
      <p style={note}>Named size tokens: xs (18px), sm (22px), md (36px), lg (44px), xl (58px).</p>
      <div style={row}>
        {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
          <div key={size} style={{ textAlign: 'center' }}>
            <Loader size={size} />
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>{size}</div>
          </div>
        ))}
      </div>
      <h4 style={subTitle}>Custom numeric size (64px)</h4>
      <Loader size={64} />
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 3: Colors
// ---------------------------------------------------------------------------

export const Colors: Story = {
  name: '3. Colors',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Colors</h3>
      <p style={note}>Any CSS color or theme color key.</p>
      <div style={row}>
        {[
          { label: 'Default (currentColor)', color: undefined },
          { label: '#1976d2 (blue)', color: '#1976d2' },
          { label: '#2e7d32 (green)', color: '#2e7d32' },
          { label: '#ed6c02 (orange)', color: '#ed6c02' },
          { label: '#d32f2f (red)', color: '#d32f2f' },
          { label: '#9c27b0 (purple)', color: '#9c27b0' },
          { label: 'primary', color: 'primary' },
          { label: 'secondary', color: 'secondary' },
          { label: 'success', color: 'success' },
          { label: 'warning', color: 'warning' },
          { label: 'error', color: 'error' },
          { label: 'neutral', color: 'neutral' }
        ].map(({ label, color }) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <Loader color={color} size="lg" />
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 4: In Button Context
// ---------------------------------------------------------------------------

export const InButtonContext: Story = {
  name: '4. In Button Context',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>In Button Context</h3>
      <p style={note}>
        Loader inherits <code>currentColor</code> from its parent, making it work naturally inside buttons.
      </p>
      <div style={row}>
        <button
          disabled
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 20px',
            borderRadius: 8,
            border: 'none',
            background: '#1976d2',
            color: '#fff',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'not-allowed',
            opacity: 0.8,
          }}
        >
          <Loader size="xs" />
          Loading…
        </button>
        <button
          disabled
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 20px',
            borderRadius: 8,
            border: '1px solid #d1d5db',
            background: '#fff',
            color: '#374151',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'not-allowed',
            opacity: 0.8,
          }}
        >
          <Loader size="xs" />
          Submitting
        </button>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 5: On Dark Background
// ---------------------------------------------------------------------------

export const OnDarkBackground: Story = {
  name: '5. On Dark Background',
  render: () => (
    <div style={{ ...card, background: '#1e293b', color: '#fff' }}>
      <h3 style={{ ...sectionTitle, color: '#fff' }}>On Dark Background</h3>
      <p style={{ ...note, color: '#94a3b8' }}>
        Using <code>currentColor</code> default, the loader adapts to its parent's text color.
      </p>
      <div style={row}>
        <Loader size="sm" />
        <Loader size="md" />
        <Loader size="lg" />
        <Loader size="xl" color="#38bdf8" />
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 6: API Reference
// ---------------------------------------------------------------------------

export const ApiReference: Story = {
  name: '6. API Reference',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Loader API Reference</h3>
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
            ['size', "PrismuiSize | number | string", "'md'", 'Width & height of the loader'],
            ['color', 'string', "'currentColor'", 'Spinner stroke color'],
            ['aria-label', 'string', "'Loading'", 'Accessible label'],
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
      <h4 style={subTitle}>Animation Details</h4>
      <p style={{ fontSize: 13, lineHeight: 1.6 }}>
        The spinner uses a two-layer animation inspired by Minimals / MUI CircularProgress:<br />
        <strong>1. Rotation:</strong> SVG container rotates 360° in 1.4s (linear, infinite).<br />
        <strong>2. Dash chase:</strong> Circle stroke-dasharray and stroke-dashoffset animate in 1.4s (ease-in-out, infinite),
        creating the "growing and shrinking arc" effect.
      </p>
      <h4 style={subTitle}>Styles API Selectors</h4>
      <p style={{ fontSize: 13, fontFamily: 'monospace' }}>root · spinner · circle</p>
    </div>
  ),
};
