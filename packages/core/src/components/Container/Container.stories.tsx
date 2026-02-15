import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PrismuiProvider } from '../../core/PrismuiProvider/PrismuiProvider';
import { Container } from './Container';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof Container> = {
  title: 'Components/Container',
  component: Container,
  decorators: [
    (Story) => (
      <PrismuiProvider>
        <Story />
      </PrismuiProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Container>;

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

const inner: React.CSSProperties = {
  background: '#eff6ff',
  border: '1px dashed #93c5fd',
  borderRadius: 6,
  padding: 16,
  fontSize: 13,
  textAlign: 'center',
};

// ---------------------------------------------------------------------------
// Story 1: Basic
// ---------------------------------------------------------------------------

export const Basic: Story = {
  name: '1. Basic',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Basic Container</h3>
      <p style={note}>
        Centers content with max-width. Default size is <code>lg</code> (1200px).
      </p>
      <div style={{ background: '#f9fafb', padding: 8 }}>
        <Container>
          <div style={inner}>Container content (max-width: lg = 1200px)</div>
        </Container>
      </div>
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
      <h3 style={sectionTitle}>Container Sizes</h3>
      <p style={note}>
        xs=444px, sm=600px, md=900px, lg=1200px, xl=1536px (MUI-inspired breakpoints).
      </p>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <div key={size} style={{ marginBottom: 12 }}>
          <h4 style={subTitle}>{size}</h4>
          <div style={{ background: '#f9fafb', padding: 4 }}>
            <Container size={size}>
              <div style={inner}>{size}</div>
            </Container>
          </div>
        </div>
      ))}
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 3: Fluid
// ---------------------------------------------------------------------------

export const Fluid: Story = {
  name: '3. Fluid',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Fluid Container</h3>
      <p style={note}>
        <code>fluid</code> makes the container take 100% width, ignoring <code>size</code>.
      </p>
      <div style={{ background: '#f9fafb', padding: 4 }}>
        <Container fluid>
          <div style={inner}>Fluid — 100% width</div>
        </Container>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 4: disableGutters (MUI)
// ---------------------------------------------------------------------------

export const DisableGutters: Story = {
  name: '4. disableGutters (MUI)',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>disableGutters</h3>
      <p style={note}>
        MUI pattern: removes left/right padding.
      </p>
      <h4 style={subTitle}>With gutters (default)</h4>
      <div style={{ background: '#f9fafb', padding: 4 }}>
        <Container size="sm">
          <div style={inner}>With gutters</div>
        </Container>
      </div>
      <h4 style={subTitle}>Without gutters</h4>
      <div style={{ background: '#f9fafb', padding: 4 }}>
        <Container size="sm" disableGutters>
          <div style={inner}>No gutters</div>
        </Container>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 5: Fixed (MUI)
// ---------------------------------------------------------------------------

export const Fixed: Story = {
  name: '5. Fixed (MUI)',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Fixed Container</h3>
      <p style={note}>
        MUI pattern: sets both <code>max-width</code> and <code>width</code> to the size value.
      </p>
      <div style={{ background: '#f9fafb', padding: 4 }}>
        <Container size="sm" fixed>
          <div style={inner}>Fixed width: sm (600px)</div>
        </Container>
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
      <h3 style={sectionTitle}>Container API Reference</h3>
      <table style={{ borderCollapse: 'collapse', fontSize: 13, width: '100%' }}>
        <thead>
          <tr>
            <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb', color: '#6b7280' }}>Prop</th>
            <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb', color: '#6b7280' }}>Type</th>
            <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb', color: '#6b7280' }}>Default</th>
            <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb', color: '#6b7280' }}>Source</th>
            <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb', color: '#6b7280' }}>Description</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['size', "PrismuiSize | number | string", "'lg'", 'Both', 'max-width of container'],
            ['fluid', 'boolean', 'false', 'Mantine', '100% width, ignores size'],
            ['disableGutters', 'boolean', 'false', 'MUI', 'Remove horizontal padding'],
            ['fixed', 'boolean', 'false', 'MUI', 'Set width = max-width'],
          ].map(([prop, type, def, source, desc], i) => (
            <tr key={i}>
              <td style={{ padding: '6px 12px', borderBottom: '1px solid #f3f4f6', fontWeight: 600, fontFamily: 'monospace', fontSize: 12 }}>{prop}</td>
              <td style={{ padding: '6px 12px', borderBottom: '1px solid #f3f4f6', fontFamily: 'monospace', fontSize: 11, color: '#6b7280' }}>{type}</td>
              <td style={{ padding: '6px 12px', borderBottom: '1px solid #f3f4f6', fontFamily: 'monospace', fontSize: 12 }}>{def}</td>
              <td style={{ padding: '6px 12px', borderBottom: '1px solid #f3f4f6', fontSize: 12 }}>{source}</td>
              <td style={{ padding: '6px 12px', borderBottom: '1px solid #f3f4f6', fontSize: 12 }}>{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
};
