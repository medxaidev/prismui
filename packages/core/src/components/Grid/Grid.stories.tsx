import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PrismuiProvider } from '../../core/PrismuiProvider/PrismuiProvider';
import { Grid } from './Grid';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof Grid> = {
  title: 'Components/Grid',
  component: Grid,
  decorators: [
    (Story) => (
      <PrismuiProvider>
        <Story />
      </PrismuiProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Grid>;

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

const colBox: React.CSSProperties = {
  background: '#eff6ff',
  border: '1px solid #93c5fd',
  borderRadius: 4,
  padding: '8px 12px',
  fontSize: 12,
  textAlign: 'center',
  fontWeight: 500,
};

const colBoxAlt: React.CSSProperties = {
  ...colBox,
  background: '#f0fdf4',
  border: '1px solid #86efac',
};

// ---------------------------------------------------------------------------
// Story 1: Basic 12-Column
// ---------------------------------------------------------------------------

export const Basic: Story = {
  name: '1. Basic 12-Column',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Basic 12-Column Grid</h3>
      <p style={note}>Default: 12 columns, md gutter.</p>
      <Grid>
        <Grid.Col span={12}><div style={colBox}>span=12</div></Grid.Col>
        <Grid.Col span={6}><div style={colBox}>span=6</div></Grid.Col>
        <Grid.Col span={6}><div style={colBoxAlt}>span=6</div></Grid.Col>
        <Grid.Col span={4}><div style={colBox}>span=4</div></Grid.Col>
        <Grid.Col span={4}><div style={colBoxAlt}>span=4</div></Grid.Col>
        <Grid.Col span={4}><div style={colBox}>span=4</div></Grid.Col>
        <Grid.Col span={3}><div style={colBox}>span=3</div></Grid.Col>
        <Grid.Col span={3}><div style={colBoxAlt}>span=3</div></Grid.Col>
        <Grid.Col span={3}><div style={colBox}>span=3</div></Grid.Col>
        <Grid.Col span={3}><div style={colBoxAlt}>span=3</div></Grid.Col>
      </Grid>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 2: Gutter
// ---------------------------------------------------------------------------

export const Gutter: Story = {
  name: '2. Gutter',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Gutter</h3>
      <p style={note}>Spacing between columns. Named tokens or numeric values.</p>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((g) => (
        <div key={g} style={{ marginBottom: 16 }}>
          <h4 style={subTitle}>{g}</h4>
          <Grid gutter={g}>
            <Grid.Col span={4}><div style={colBox}>4</div></Grid.Col>
            <Grid.Col span={4}><div style={colBoxAlt}>4</div></Grid.Col>
            <Grid.Col span={4}><div style={colBox}>4</div></Grid.Col>
          </Grid>
        </div>
      ))}
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 3: Offset
// ---------------------------------------------------------------------------

export const Offset: Story = {
  name: '3. Offset',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Column Offset</h3>
      <p style={note}>Push columns to the right by a number of grid columns.</p>
      <Grid>
        <Grid.Col span={4}><div style={colBox}>span=4</div></Grid.Col>
        <Grid.Col span={4} offset={4}><div style={colBoxAlt}>span=4, offset=4</div></Grid.Col>
        <Grid.Col span={3} offset={3}><div style={colBox}>span=3, offset=3</div></Grid.Col>
        <Grid.Col span={3} offset={3}><div style={colBoxAlt}>span=3, offset=3</div></Grid.Col>
      </Grid>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 4: Order
// ---------------------------------------------------------------------------

export const Order: Story = {
  name: '4. Order',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Column Order</h3>
      <p style={note}>Reorder columns visually without changing DOM order.</p>
      <Grid>
        <Grid.Col span={4} order={3}><div style={colBox}>1st in DOM, order=3</div></Grid.Col>
        <Grid.Col span={4} order={1}><div style={colBoxAlt}>2nd in DOM, order=1</div></Grid.Col>
        <Grid.Col span={4} order={2}><div style={colBox}>3rd in DOM, order=2</div></Grid.Col>
      </Grid>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 5: Grow
// ---------------------------------------------------------------------------

export const Grow: Story = {
  name: '5. Grow',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Grow</h3>
      <p style={note}>
        When <code>grow</code> is set, columns in the last row expand to fill remaining space.
      </p>
      <h4 style={subTitle}>grow=true</h4>
      <Grid grow>
        <Grid.Col span={4}><div style={colBox}>4</div></Grid.Col>
        <Grid.Col span={4}><div style={colBoxAlt}>4</div></Grid.Col>
        <Grid.Col span={4}><div style={colBox}>4</div></Grid.Col>
        <Grid.Col span={4}><div style={colBoxAlt}>4 (grows)</div></Grid.Col>
        <Grid.Col span={4}><div style={colBox}>4 (grows)</div></Grid.Col>
      </Grid>
      <h4 style={subTitle}>grow=false (default)</h4>
      <Grid>
        <Grid.Col span={4}><div style={colBox}>4</div></Grid.Col>
        <Grid.Col span={4}><div style={colBoxAlt}>4</div></Grid.Col>
        <Grid.Col span={4}><div style={colBox}>4</div></Grid.Col>
        <Grid.Col span={4}><div style={colBoxAlt}>4</div></Grid.Col>
        <Grid.Col span={4}><div style={colBox}>4</div></Grid.Col>
      </Grid>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 6: Auto & Content Span
// ---------------------------------------------------------------------------

export const AutoAndContent: Story = {
  name: '6. Auto & Content Span',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Auto & Content Span</h3>
      <p style={note}>
        <code>span="auto"</code> fills remaining space.
        <code> span="content"</code> sizes to content.
      </p>
      <h4 style={subTitle}>span="auto"</h4>
      <Grid>
        <Grid.Col span={4}><div style={colBox}>span=4</div></Grid.Col>
        <Grid.Col span="auto"><div style={colBoxAlt}>span="auto" (fills rest)</div></Grid.Col>
      </Grid>
      <h4 style={subTitle}>span="content"</h4>
      <Grid>
        <Grid.Col span="content"><div style={colBox}>Content-sized</div></Grid.Col>
        <Grid.Col span="auto"><div style={colBoxAlt}>Auto (fills rest)</div></Grid.Col>
      </Grid>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 7: Custom Columns
// ---------------------------------------------------------------------------

export const CustomColumns: Story = {
  name: '7. Custom Columns',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Custom Column Count</h3>
      <p style={note}>Override the default 12-column grid.</p>
      <h4 style={subTitle}>24 columns</h4>
      <Grid columns={24}>
        <Grid.Col span={8}><div style={colBox}>8/24</div></Grid.Col>
        <Grid.Col span={8}><div style={colBoxAlt}>8/24</div></Grid.Col>
        <Grid.Col span={8}><div style={colBox}>8/24</div></Grid.Col>
      </Grid>
      <h4 style={subTitle}>5 columns</h4>
      <Grid columns={5}>
        <Grid.Col span={1}><div style={colBox}>1/5</div></Grid.Col>
        <Grid.Col span={1}><div style={colBoxAlt}>1/5</div></Grid.Col>
        <Grid.Col span={1}><div style={colBox}>1/5</div></Grid.Col>
        <Grid.Col span={1}><div style={colBoxAlt}>1/5</div></Grid.Col>
        <Grid.Col span={1}><div style={colBox}>1/5</div></Grid.Col>
      </Grid>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 8: Justify & Align
// ---------------------------------------------------------------------------

export const JustifyAndAlign: Story = {
  name: '8. Justify & Align',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Justify & Align</h3>
      <h4 style={subTitle}>justify="center"</h4>
      <Grid justify="center">
        <Grid.Col span={3}><div style={colBox}>3</div></Grid.Col>
        <Grid.Col span={3}><div style={colBoxAlt}>3</div></Grid.Col>
      </Grid>
      <h4 style={subTitle}>justify="flex-end"</h4>
      <Grid justify="flex-end">
        <Grid.Col span={3}><div style={colBox}>3</div></Grid.Col>
        <Grid.Col span={3}><div style={colBoxAlt}>3</div></Grid.Col>
      </Grid>
      <h4 style={subTitle}>align="center" (different height children)</h4>
      <Grid align="center">
        <Grid.Col span={4}><div style={{ ...colBox, height: 80 }}>Tall</div></Grid.Col>
        <Grid.Col span={4}><div style={colBoxAlt}>Short</div></Grid.Col>
        <Grid.Col span={4}><div style={{ ...colBox, height: 60 }}>Medium</div></Grid.Col>
      </Grid>
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
      <h3 style={sectionTitle}>Grid API Reference</h3>
      <h4 style={subTitle}>Grid Props</h4>
      <table style={{ borderCollapse: 'collapse', fontSize: 13, width: '100%', marginBottom: 24 }}>
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
            ['gutter', 'PrismuiSpacing', "'md'", 'Gap between columns'],
            ['columns', 'number', '12', 'Number of columns per row'],
            ['grow', 'boolean', 'false', 'Last row columns expand'],
            ['justify', 'CSSProperties[justifyContent]', "'flex-start'", 'justify-content'],
            ['align', 'CSSProperties[alignItems]', "'stretch'", 'align-items'],
            ['overflow', 'CSSProperties[overflow]', "'visible'", 'overflow on root'],
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
      <h4 style={subTitle}>Grid.Col Props</h4>
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
            ['span', "number | 'auto' | 'content'", '12', 'Column span'],
            ['offset', 'number', '—', 'Left offset in columns'],
            ['order', 'number', '—', 'Visual order'],
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
