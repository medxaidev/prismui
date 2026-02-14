import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PrismuiProvider } from '../../core/PrismuiProvider/PrismuiProvider';
import { Divider } from './Divider';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof Divider> = {
  title: 'Components/Divider',
  component: Divider,
  decorators: [
    (Story) => (
      <PrismuiProvider>
        <Story />
      </PrismuiProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Divider>;

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

const textBlock: React.CSSProperties = {
  fontSize: 14,
  color: '#374151',
  lineHeight: 1.6,
};

// ---------------------------------------------------------------------------
// Story 1: Basic Horizontal
// ---------------------------------------------------------------------------

export const BasicHorizontal: Story = {
  name: '1. Basic Horizontal',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Basic Horizontal Divider</h3>
      <p style={note}>
        Default color: <code>rgba(var(--prismui-color-gray-500Channel) / 0.2)</code> — 
        equivalent to <code>rgba(145 158 171 / 20%)</code>.
      </p>
      <p style={textBlock}>Content above the divider</p>
      <Divider />
      <p style={textBlock}>Content below the divider</p>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 2: Vertical
// ---------------------------------------------------------------------------

export const Vertical: Story = {
  name: '2. Vertical',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Vertical Divider</h3>
      <p style={note}>
        Use <code>orientation="vertical"</code> inside a flex container.
        Add <code>flexItem</code> for correct height in flex layouts (MUI pattern).
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, height: 40 }}>
        <span style={{ fontSize: 14 }}>Home</span>
        <Divider orientation="vertical" flexItem />
        <span style={{ fontSize: 14 }}>About</span>
        <Divider orientation="vertical" flexItem />
        <span style={{ fontSize: 14 }}>Contact</span>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 3: Border Styles
// ---------------------------------------------------------------------------

export const BorderStyles: Story = {
  name: '3. Border Styles',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Border Styles</h3>
      <p style={note}>
        <code>borderStyle</code> controls the line style: solid, dashed, dotted.
      </p>

      <h4 style={subTitle}>solid (default)</h4>
      <Divider borderStyle="solid" />

      <h4 style={subTitle}>dashed</h4>
      <Divider borderStyle="dashed" />

      <h4 style={subTitle}>dotted</h4>
      <Divider borderStyle="dotted" />
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 4: Sizes
// ---------------------------------------------------------------------------

export const Sizes: Story = {
  name: '4. Sizes',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Divider Sizes</h3>
      <p style={note}>
        Size controls border width: xs (1px), sm (2px), md (3px), lg (4px), xl (5px).
      </p>

      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <div key={size}>
          <h4 style={subTitle}>{size}</h4>
          <Divider size={size} />
        </div>
      ))}
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 5: With Label
// ---------------------------------------------------------------------------

export const WithLabel: Story = {
  name: '5. With Label',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Divider with Label</h3>
      <p style={note}>
        Labels are only visible on horizontal dividers. Lines are drawn using
        <code> ::before</code> and <code>::after</code> pseudo-elements.
      </p>

      <h4 style={subTitle}>Center (default)</h4>
      <Divider label="OR" />

      <h4 style={subTitle}>Left</h4>
      <Divider label="Section" labelPosition="left" />

      <h4 style={subTitle}>Right</h4>
      <Divider label="End" labelPosition="right" />

      <h4 style={subTitle}>ReactNode label</h4>
      <Divider label={<span style={{ color: '#3b82f6', fontWeight: 600 }}>★ Featured</span>} />

      <h4 style={subTitle}>Label with dashed style</h4>
      <Divider label="Dashed" borderStyle="dashed" />
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 6: textAlign (MUI pattern)
// ---------------------------------------------------------------------------

export const TextAlign: Story = {
  name: '6. textAlign (MUI)',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>textAlign (MUI pattern)</h3>
      <p style={note}>
        MUI uses <code>textAlign</code> for label positioning. PrismUI supports both
        <code> textAlign</code> and <code>labelPosition</code> — the latter takes priority.
      </p>

      <h4 style={subTitle}>textAlign="left"</h4>
      <Divider label="Left via textAlign" textAlign="left" />

      <h4 style={subTitle}>textAlign="right"</h4>
      <Divider label="Right via textAlign" textAlign="right" />

      <h4 style={subTitle}>textAlign="center"</h4>
      <Divider label="Center via textAlign" textAlign="center" />
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 7: Variants (MUI: fullWidth / inset / middle)
// ---------------------------------------------------------------------------

export const Variants: Story = {
  name: '7. Variants (MUI)',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Variants (MUI pattern)</h3>
      <p style={note}>
        MUI-style variants control margin/inset behavior.
      </p>

      <h4 style={subTitle}>fullWidth (default)</h4>
      <div style={{ background: '#f9fafb', padding: 16, borderRadius: 6 }}>
        <p style={{ margin: '0 0 8px', fontSize: 13 }}>Item 1</p>
        <Divider variant="fullWidth" />
        <p style={{ margin: '8px 0 0', fontSize: 13 }}>Item 2</p>
      </div>

      <h4 style={subTitle}>inset (left margin 72px)</h4>
      <div style={{ background: '#f9fafb', padding: 16, borderRadius: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#dbeafe', flexShrink: 0 }} />
          <span style={{ fontSize: 13 }}>User with avatar</span>
        </div>
        <Divider variant="inset" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#dcfce7', flexShrink: 0 }} />
          <span style={{ fontSize: 13 }}>Another user</span>
        </div>
      </div>

      <h4 style={subTitle}>middle (horizontal margin 16px)</h4>
      <div style={{ background: '#f9fafb', padding: 16, borderRadius: 6 }}>
        <p style={{ margin: '0 0 8px', fontSize: 13 }}>Item 1</p>
        <Divider variant="middle" />
        <p style={{ margin: '8px 0 0', fontSize: 13 }}>Item 2</p>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 8: Custom Colors
// ---------------------------------------------------------------------------

export const CustomColors: Story = {
  name: '8. Custom Colors',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Custom Colors</h3>
      <p style={note}>
        Pass a semantic color name, color family, or any CSS color value.
      </p>

      <h4 style={subTitle}>Default (gray-500 @ 20% opacity)</h4>
      <Divider />

      <h4 style={subTitle}>primary</h4>
      <Divider color="primary" />

      <h4 style={subTitle}>error</h4>
      <Divider color="error" />

      <h4 style={subTitle}>blue (color family)</h4>
      <Divider color="blue" />

      <h4 style={subTitle}>CSS hex (#22c55e)</h4>
      <Divider color="#22c55e" />

      <h4 style={subTitle}>CSS rgba</h4>
      <Divider color="rgba(255, 0, 0, 0.5)" />
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 9: In List Context
// ---------------------------------------------------------------------------

export const InListContext: Story = {
  name: '9. In List Context',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Divider in List Context</h3>
      <p style={note}>
        Common use case: separating list items.
      </p>
      <div style={{ background: '#f9fafb', borderRadius: 8, overflow: 'hidden' }}>
        {['Inbox', 'Starred', 'Sent', 'Drafts', 'Trash'].map((item, i, arr) => (
          <React.Fragment key={item}>
            <div style={{ padding: '12px 16px', fontSize: 14 }}>{item}</div>
            {i < arr.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 10: Combined Features
// ---------------------------------------------------------------------------

export const CombinedFeatures: Story = {
  name: '10. Combined Features',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Combined Features</h3>

      <h4 style={subTitle}>Dashed + Label + Color + Size</h4>
      <Divider
        label="Custom Section"
        labelPosition="left"
        borderStyle="dashed"
        color="primary"
        size="sm"
      />

      <h4 style={subTitle}>Vertical in toolbar</h4>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 12px',
        background: '#f9fafb',
        borderRadius: 6,
      }}>
        <button style={{ padding: '4px 8px', fontSize: 13, border: '1px solid #d1d5db', borderRadius: 4, background: '#fff', cursor: 'pointer' }}>Bold</button>
        <button style={{ padding: '4px 8px', fontSize: 13, border: '1px solid #d1d5db', borderRadius: 4, background: '#fff', cursor: 'pointer' }}>Italic</button>
        <Divider orientation="vertical" flexItem />
        <button style={{ padding: '4px 8px', fontSize: 13, border: '1px solid #d1d5db', borderRadius: 4, background: '#fff', cursor: 'pointer' }}>Left</button>
        <button style={{ padding: '4px 8px', fontSize: 13, border: '1px solid #d1d5db', borderRadius: 4, background: '#fff', cursor: 'pointer' }}>Center</button>
        <button style={{ padding: '4px 8px', fontSize: 13, border: '1px solid #d1d5db', borderRadius: 4, background: '#fff', cursor: 'pointer' }}>Right</button>
        <Divider orientation="vertical" flexItem />
        <button style={{ padding: '4px 8px', fontSize: 13, border: '1px solid #d1d5db', borderRadius: 4, background: '#fff', cursor: 'pointer' }}>Link</button>
      </div>

      <h4 style={subTitle}>Dark background context</h4>
      <div style={{ background: '#1C252E', padding: 20, borderRadius: 8 }}>
        <p style={{ color: '#F9FAFB', fontSize: 14, margin: '0 0 12px' }}>Dark section above</p>
        <Divider />
        <p style={{ color: '#F9FAFB', fontSize: 14, margin: '12px 0 0' }}>Dark section below</p>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 11: API Reference
// ---------------------------------------------------------------------------

export const ApiReference: Story = {
  name: '11. API Reference',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Divider API Reference</h3>
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
            ['orientation', "'horizontal' | 'vertical'", "'horizontal'", 'Both', 'Divider direction'],
            ['color', 'string', 'gray-500 @ 20%', 'Mantine', 'Border color (theme key or CSS)'],
            ['size', "PrismuiSize | number | string", "'xs' (1px)", 'Mantine', 'Border width'],
            ['borderStyle', "'solid' | 'dashed' | 'dotted'", "'solid'", 'Mantine', 'Border line style'],
            ['label', 'ReactNode', '—', 'Mantine', 'Label text (horizontal only)'],
            ['labelPosition', "'left' | 'center' | 'right'", "'center'", 'Mantine', 'Label alignment'],
            ['textAlign', "'left' | 'center' | 'right'", "'center'", 'MUI', 'Alternative to labelPosition'],
            ['variant', "'fullWidth' | 'inset' | 'middle'", '—', 'MUI', 'Margin/inset variant'],
            ['flexItem', 'boolean', 'false', 'MUI', 'Correct height in flex containers'],
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
