import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PrismuiProvider } from '../../core/PrismuiProvider/PrismuiProvider';
import { Overlay } from './Overlay';
import { Button } from '../Button';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof Overlay> = {
  title: 'Components/Overlay',
  component: Overlay,
  decorators: [
    (Story) => (
      <PrismuiProvider>
        <Story />
      </PrismuiProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Overlay>;

// ---------------------------------------------------------------------------
// Shared styles
// ---------------------------------------------------------------------------

const container: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  height: 400,
  border: '2px dashed #e5e7eb',
  borderRadius: 8,
  overflow: 'hidden',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const card: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  padding: 20,
  marginBottom: 16,
};

const sectionTitle: React.CSSProperties = {
  margin: '0 0 16px',
  fontSize: 15,
  fontWeight: 700,
};

const contentBox: React.CSSProperties = {
  background: 'white',
  padding: 32,
  borderRadius: 8,
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  zIndex: 1,
  position: 'relative',
};

// ---------------------------------------------------------------------------
// 1. Basic Overlay
// ---------------------------------------------------------------------------

export const BasicOverlay: Story = {
  name: '1. Basic Overlay',
  render: () => {
    const [visible, setVisible] = useState(false);

    return (
      <div style={{ maxWidth: 800 }}>
        <div style={card}>
          <h3 style={sectionTitle}>Basic Overlay (absolute positioning)</h3>
          <Button onClick={() => setVisible(!visible)}>
            {visible ? 'Hide' : 'Show'} Overlay
          </Button>
          <div style={{ ...container, marginTop: 16 }}>
            <div style={{ color: 'white', fontSize: 24, fontWeight: 700, zIndex: 0 }}>
              Background Content
            </div>
            {visible && <Overlay />}
          </div>
        </div>
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// 2. Fixed Overlay
// ---------------------------------------------------------------------------

export const FixedOverlay: Story = {
  name: '2. Fixed Overlay',
  render: () => {
    const [visible, setVisible] = useState(false);

    return (
      <div style={{ maxWidth: 800 }}>
        <div style={card}>
          <h3 style={sectionTitle}>Fixed Overlay (covers entire viewport)</h3>
          <Button onClick={() => setVisible(!visible)}>
            {visible ? 'Hide' : 'Show'} Fixed Overlay
          </Button>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '12px 0 0' }}>
            The overlay will cover the entire browser viewport with <code>position: fixed</code>
          </p>
        </div>
        {visible && <Overlay fixed />}
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// 3. Background Color & Opacity
// ---------------------------------------------------------------------------

export const BackgroundColorOpacity: Story = {
  name: '3. Background Color & Opacity',
  render: () => (
    <div style={{ maxWidth: 800 }}>
      <div style={card}>
        <h3 style={sectionTitle}>Custom Background Color & Opacity</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 8px' }}>
              Default (black, 0.6 opacity)
            </p>
            <div style={container}>
              <div style={{ color: 'white', fontSize: 18, fontWeight: 600 }}>Content</div>
              <Overlay />
            </div>
          </div>
          <div>
            <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 8px' }}>
              Red, 0.3 opacity
            </p>
            <div style={container}>
              <div style={{ color: 'white', fontSize: 18, fontWeight: 600 }}>Content</div>
              <Overlay color="#ff0000" backgroundOpacity={0.3} />
            </div>
          </div>
          <div>
            <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 8px' }}>
              Blue, 0.8 opacity
            </p>
            <div style={container}>
              <div style={{ color: 'white', fontSize: 18, fontWeight: 600 }}>Content</div>
              <Overlay color="#0066ff" backgroundOpacity={0.8} />
            </div>
          </div>
          <div>
            <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 8px' }}>
              White, 0.5 opacity
            </p>
            <div style={container}>
              <div style={{ color: 'white', fontSize: 18, fontWeight: 600 }}>Content</div>
              <Overlay color="#ffffff" backgroundOpacity={0.5} />
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 4. Gradient Overlay
// ---------------------------------------------------------------------------

export const GradientOverlay: Story = {
  name: '4. Gradient Overlay',
  render: () => (
    <div style={{ maxWidth: 800 }}>
      <div style={card}>
        <h3 style={sectionTitle}>Gradient Overlays</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 8px' }}>
              Top to bottom fade
            </p>
            <div style={container}>
              <div style={{ color: 'white', fontSize: 18, fontWeight: 600 }}>Content</div>
              <Overlay gradient="linear-gradient(to bottom, rgba(0,0,0,0.8), rgba(0,0,0,0.2))" />
            </div>
          </div>
          <div>
            <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 8px' }}>
              Radial gradient
            </p>
            <div style={container}>
              <div style={{ color: 'white', fontSize: 18, fontWeight: 600 }}>Content</div>
              <Overlay gradient="radial-gradient(circle, rgba(0,0,0,0.2), rgba(0,0,0,0.8))" />
            </div>
          </div>
          <div>
            <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 8px' }}>
              Diagonal gradient
            </p>
            <div style={container}>
              <div style={{ color: 'white', fontSize: 18, fontWeight: 600 }}>Content</div>
              <Overlay gradient="linear-gradient(135deg, rgba(255,0,0,0.6), rgba(0,0,255,0.6))" />
            </div>
          </div>
          <div>
            <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 8px' }}>
              Multi-stop gradient
            </p>
            <div style={container}>
              <div style={{ color: 'white', fontSize: 18, fontWeight: 600 }}>Content</div>
              <Overlay gradient="linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.9) 100%)" />
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 5. Blur Effect
// ---------------------------------------------------------------------------

export const BlurEffect: Story = {
  name: '5. Blur Effect',
  render: () => (
    <div style={{ maxWidth: 800 }}>
      <div style={card}>
        <h3 style={sectionTitle}>Backdrop Blur</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 8px' }}>
              No blur
            </p>
            <div style={container}>
              <div style={{ color: 'white', fontSize: 18, fontWeight: 600 }}>Content</div>
              <Overlay backgroundOpacity={0.3} />
            </div>
          </div>
          <div>
            <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 8px' }}>
              Blur 4px
            </p>
            <div style={container}>
              <div style={{ color: 'white', fontSize: 18, fontWeight: 600 }}>Content</div>
              <Overlay backgroundOpacity={0.3} blur={4} />
            </div>
          </div>
          <div>
            <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 8px' }}>
              Blur 8px
            </p>
            <div style={container}>
              <div style={{ color: 'white', fontSize: 18, fontWeight: 600 }}>Content</div>
              <Overlay backgroundOpacity={0.3} blur={8} />
            </div>
          </div>
          <div>
            <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 8px' }}>
              Blur 16px (frosted glass)
            </p>
            <div style={container}>
              <div style={{ color: 'white', fontSize: 18, fontWeight: 600 }}>Content</div>
              <Overlay backgroundOpacity={0.2} blur={16} />
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 6. Centered Content
// ---------------------------------------------------------------------------

export const CenteredContent: Story = {
  name: '6. Centered Content',
  render: () => {
    const [visible, setVisible] = useState(false);

    return (
      <div style={{ maxWidth: 800 }}>
        <div style={card}>
          <h3 style={sectionTitle}>Overlay with Centered Content</h3>
          <Button onClick={() => setVisible(!visible)}>
            {visible ? 'Hide' : 'Show'} Modal
          </Button>
          <div style={{ ...container, marginTop: 16 }}>
            <div style={{ color: 'white', fontSize: 24, fontWeight: 700 }}>
              Background Content
            </div>
            {visible && (
              <Overlay center onClick={() => setVisible(false)}>
                <div style={contentBox}>
                  <h3 style={{ margin: '0 0 12px', fontSize: 18 }}>Modal Dialog</h3>
                  <p style={{ margin: '0 0 16px', color: '#6b7280' }}>
                    Content is centered using flexbox. Click overlay to close.
                  </p>
                  <Button onClick={(e) => { e.stopPropagation(); setVisible(false); }}>
                    Close
                  </Button>
                </div>
              </Overlay>
            )}
          </div>
        </div>
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// 7. Border Radius
// ---------------------------------------------------------------------------

export const BorderRadius: Story = {
  name: '7. Border Radius',
  render: () => (
    <div style={{ maxWidth: 800 }}>
      <div style={card}>
        <h3 style={sectionTitle}>Overlay with Border Radius</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 8px' }}>
              radius="md"
            </p>
            <div style={container}>
              <div style={{ color: 'white', fontSize: 18, fontWeight: 600 }}>Content</div>
              <Overlay radius="md" />
            </div>
          </div>
          <div>
            <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 8px' }}>
              radius="xl"
            </p>
            <div style={container}>
              <div style={{ color: 'white', fontSize: 18, fontWeight: 600 }}>Content</div>
              <Overlay radius="xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 8. API Reference
// ---------------------------------------------------------------------------

export const APIReference: Story = {
  name: '8. API Reference',
  render: () => (
    <div style={{ maxWidth: 900 }}>
      <div style={card}>
        <h3 style={sectionTitle}>Overlay API Reference</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
              <th style={{ padding: '8px 12px' }}>Prop</th>
              <th style={{ padding: '8px 12px' }}>Type</th>
              <th style={{ padding: '8px 12px' }}>Default</th>
              <th style={{ padding: '8px 12px' }}>Description</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['backgroundOpacity', 'number', '0.6', 'Background opacity 0–1, ignored when gradient is set'],
              ['color', 'string', "'#000'", 'Background color'],
              ['blur', 'number | string', '0', 'Backdrop blur amount'],
              ['gradient', 'string', '—', 'CSS gradient, overrides color prop'],
              ['zIndex', 'number | string', '200', 'Overlay z-index'],
              ['radius', 'PrismuiRadius', '0', 'Border radius'],
              ['center', 'boolean', 'false', 'Centers content with flexbox'],
              ['fixed', 'boolean', 'false', 'Changes position to fixed'],
              ['children', 'ReactNode', '—', 'Content inside overlay'],
            ].map(([prop, type, def, desc]) => (
              <tr key={prop} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontWeight: 600 }}>{prop}</td>
                <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: '#6b7280', fontSize: 12 }}>{type}</td>
                <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: '#9ca3af' }}>{def}</td>
                <td style={{ padding: '8px 12px' }}>{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={card}>
        <h3 style={sectionTitle}>CSS Variables</h3>
        <pre style={{ background: '#f8fafc', padding: 12, borderRadius: 6, fontSize: 12, overflow: 'auto' }}>
{`--overlay-bg          — background (color + opacity or gradient)
--overlay-filter      — backdrop-filter blur value
--overlay-radius      — border-radius
--overlay-z-index     — z-index`}
        </pre>
      </div>

      <div style={card}>
        <h3 style={sectionTitle}>Common Use Cases</h3>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, lineHeight: 1.8 }}>
          <li><strong>Modal backdrop:</strong> <code>{'<Overlay fixed center />'}</code></li>
          <li><strong>Image overlay:</strong> <code>{'<Overlay gradient="..." />'}</code></li>
          <li><strong>Frosted glass:</strong> <code>{'<Overlay backgroundOpacity={0.2} blur={16} />'}</code></li>
          <li><strong>Card hover effect:</strong> <code>{'<Overlay radius="md" />'}</code></li>
        </ul>
      </div>
    </div>
  ),
};
