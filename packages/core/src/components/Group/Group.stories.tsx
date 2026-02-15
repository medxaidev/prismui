import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PrismuiProvider } from '../../core/PrismuiProvider/PrismuiProvider';
import { Group } from './Group';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof Group> = {
  title: 'Components/Group',
  component: Group,
  decorators: [
    (Story) => (
      <PrismuiProvider>
        <Story />
      </PrismuiProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Group>;

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

const chip: React.CSSProperties = {
  padding: '6px 16px',
  borderRadius: 6,
  background: '#f3f4f6',
  fontSize: 13,
  fontWeight: 500,
};

// ---------------------------------------------------------------------------
// Story 1: Basic
// ---------------------------------------------------------------------------

export const Basic: Story = {
  name: '1. Basic',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Basic Group</h3>
      <p style={note}>Horizontal flex layout with gap, wrapping, and centering by default.</p>
      <Group>
        <span style={chip}>Item 1</span>
        <span style={chip}>Item 2</span>
        <span style={chip}>Item 3</span>
      </Group>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 2: Gap
// ---------------------------------------------------------------------------

export const Gap: Story = {
  name: '2. Gap',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Gap</h3>
      <p style={note}>Named spacing tokens (xs–xl) or numeric values.</p>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((gap) => (
        <div key={gap} style={{ marginBottom: 12 }}>
          <h4 style={subTitle}>{gap}</h4>
          <Group gap={gap}>
            <span style={chip}>A</span>
            <span style={chip}>B</span>
            <span style={chip}>C</span>
          </Group>
        </div>
      ))}
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 3: Justify
// ---------------------------------------------------------------------------

export const Justify: Story = {
  name: '3. Justify',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Justify</h3>
      {(['flex-start', 'center', 'flex-end', 'space-between', 'space-around'] as const).map((j) => (
        <div key={j} style={{ marginBottom: 12 }}>
          <h4 style={subTitle}>{j}</h4>
          <Group justify={j}>
            <span style={chip}>A</span>
            <span style={chip}>B</span>
            <span style={chip}>C</span>
          </Group>
        </div>
      ))}
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 4: Grow
// ---------------------------------------------------------------------------

export const Grow: Story = {
  name: '4. Grow',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Grow</h3>
      <p style={note}>
        When <code>grow</code> is set, children expand equally.
        <code> preventGrowOverflow</code> (default true) limits each child's max-width.
      </p>
      <h4 style={subTitle}>grow=true</h4>
      <Group grow>
        <span style={chip}>Short</span>
        <span style={chip}>Medium text</span>
        <span style={chip}>A longer piece of text</span>
      </Group>
      <h4 style={subTitle}>grow=false (default)</h4>
      <Group>
        <span style={chip}>Short</span>
        <span style={chip}>Medium text</span>
        <span style={chip}>A longer piece of text</span>
      </Group>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 5: Wrap
// ---------------------------------------------------------------------------

export const Wrap: Story = {
  name: '5. Wrap',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Wrap</h3>
      <h4 style={subTitle}>wrap="wrap" (default)</h4>
      <div style={{ width: 300, border: '1px dashed #d1d5db', padding: 8 }}>
        <Group>
          {Array.from({ length: 8 }, (_, i) => (
            <span key={i} style={chip}>Item {i + 1}</span>
          ))}
        </Group>
      </div>
      <h4 style={subTitle}>wrap="nowrap"</h4>
      <div style={{ width: 300, border: '1px dashed #d1d5db', padding: 8, overflow: 'auto' }}>
        <Group wrap="nowrap">
          {Array.from({ length: 8 }, (_, i) => (
            <span key={i} style={chip}>Item {i + 1}</span>
          ))}
        </Group>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 6: Falsy Children
// ---------------------------------------------------------------------------

export const FalsyChildren: Story = {
  name: '6. Falsy Children',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Falsy Children Filtering</h3>
      <p style={note}>null, undefined, and false children are automatically filtered out.</p>
      <Group>
        {null}
        <span style={chip}>Visible 1</span>
        {undefined}
        <span style={chip}>Visible 2</span>
        {false}
        <span style={chip}>Visible 3</span>
      </Group>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 7: API Reference
// ---------------------------------------------------------------------------

export const ApiReference: Story = {
  name: '7. API Reference',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Group API Reference</h3>
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
            ['gap', 'PrismuiSpacing', "'md'", 'Gap between children'],
            ['justify', 'CSSProperties[justifyContent]', "'flex-start'", 'justify-content'],
            ['align', 'CSSProperties[alignItems]', "'center'", 'align-items'],
            ['wrap', 'CSSProperties[flexWrap]', "'wrap'", 'flex-wrap'],
            ['grow', 'boolean', 'false', 'Children expand equally'],
            ['preventGrowOverflow', 'boolean', 'true', 'Limit child max-width when grow'],
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
    </div>
  ),
};
