import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PrismuiProvider } from '../../core/PrismuiProvider/PrismuiProvider';
import { Anchor } from './Anchor';
import { Text } from '../Text';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof Anchor> = {
  title: 'Components/Anchor',
  component: Anchor,
  decorators: [
    (Story) => (
      <PrismuiProvider>
        <Story />
      </PrismuiProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Anchor>;

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

const darkCard: React.CSSProperties = {
  ...card,
  background: '#1C252E',
  border: '1px solid #454F5B',
  color: '#F9FAFB',
};

const sectionTitle: React.CSSProperties = {
  margin: '0 0 12px',
  fontSize: 15,
  fontWeight: 700,
};

const row: React.CSSProperties = {
  marginBottom: 12,
};

const label: React.CSSProperties = {
  fontSize: 11,
  color: '#9ca3af',
  marginBottom: 2,
  fontFamily: 'monospace',
};

// ---------------------------------------------------------------------------
// 1. Basic Usage
// ---------------------------------------------------------------------------

export const BasicUsage: Story = {
  name: '1. Basic Usage',
  render: () => (
    <div style={{ maxWidth: 600 }}>
      <div style={card}>
        <h3 style={sectionTitle}>Basic Anchor</h3>
        <div style={row}>
          <Anchor href="https://example.com">Default anchor link</Anchor>
        </div>
        <div style={row}>
          <Text variant="body1">
            This is a paragraph with an{' '}
            <Anchor href="https://example.com">inline link</Anchor>{' '}
            inside it.
          </Text>
        </div>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 2. Underline Modes
// ---------------------------------------------------------------------------

export const UnderlineModes: Story = {
  name: '2. Underline Modes',
  render: () => (
    <div style={{ maxWidth: 600 }}>
      <div style={card}>
        <h3 style={sectionTitle}>Underline Modes</h3>
        <div style={row}>
          <div style={label}>underline=&quot;hover&quot; (default)</div>
          <Anchor href="#" underline="hover">Underline on hover</Anchor>
        </div>
        <div style={row}>
          <div style={label}>underline=&quot;always&quot;</div>
          <Anchor href="#" underline="always">Always underlined</Anchor>
        </div>
        <div style={row}>
          <div style={label}>underline=&quot;never&quot;</div>
          <Anchor href="#" underline="never">Never underlined</Anchor>
        </div>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 3. Colors
// ---------------------------------------------------------------------------

export const Colors: Story = {
  name: '3. Colors',
  render: () => {
    const colors = ['primary', 'secondary', 'info', 'success', 'warning', 'error'] as const;
    return (
      <div style={{ maxWidth: 600 }}>
        <div style={card}>
          <h3 style={sectionTitle}>Semantic Colors</h3>
          {colors.map((c) => (
            <div key={c} style={row}>
              <div style={label}>color=&quot;{c}&quot;</div>
              <Anchor href="#" color={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)} colored link
              </Anchor>
            </div>
          ))}
        </div>

        <div style={card}>
          <h3 style={sectionTitle}>CSS Colors</h3>
          <div style={row}>
            <Anchor href="#" color="#e91e63">Custom pink (#e91e63)</Anchor>
          </div>
          <div style={row}>
            <Anchor href="#" color="text.secondary">Palette token (text.secondary)</Anchor>
          </div>
        </div>

        <div style={darkCard}>
          <h3 style={sectionTitle}>On Dark Background</h3>
          <Anchor href="#" color="primary">Primary link on dark</Anchor>
          <br />
          <Anchor href="#" color="info">Info link on dark</Anchor>
        </div>
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// 4. External Links
// ---------------------------------------------------------------------------

export const ExternalLinks: Story = {
  name: '4. External Links',
  render: () => (
    <div style={{ maxWidth: 600 }}>
      <div style={card}>
        <h3 style={sectionTitle}>External Links</h3>
        <div style={row}>
          <div style={label}>external (adds target=&quot;_blank&quot; rel=&quot;noopener noreferrer&quot;)</div>
          <Anchor href="https://github.com" external>
            GitHub (opens in new tab)
          </Anchor>
        </div>
        <div style={row}>
          <div style={label}>without external</div>
          <Anchor href="https://github.com">
            GitHub (same tab)
          </Anchor>
        </div>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 5. Typography Variants
// ---------------------------------------------------------------------------

export const TypographyVariants: Story = {
  name: '5. Typography Variants',
  render: () => (
    <div style={{ maxWidth: 600 }}>
      <div style={card}>
        <h3 style={sectionTitle}>Anchor with Typography Variants</h3>
        <div style={row}>
          <div style={label}>variant=&quot;h4&quot;</div>
          <Anchor href="#" variant="h4">Heading 4 Link</Anchor>
        </div>
        <div style={row}>
          <div style={label}>variant=&quot;subtitle1&quot;</div>
          <Anchor href="#" variant="subtitle1">Subtitle 1 Link</Anchor>
        </div>
        <div style={row}>
          <div style={label}>variant=&quot;body1&quot; (default)</div>
          <Anchor href="#" variant="body1">Body 1 Link</Anchor>
        </div>
        <div style={row}>
          <div style={label}>variant=&quot;body2&quot;</div>
          <Anchor href="#" variant="body2">Body 2 Link</Anchor>
        </div>
        <div style={row}>
          <div style={label}>variant=&quot;caption&quot;</div>
          <Anchor href="#" variant="caption">Caption Link</Anchor>
        </div>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 6. Gradient Anchor
// ---------------------------------------------------------------------------

export const GradientAnchor: Story = {
  name: '6. Gradient Anchor',
  render: () => (
    <div style={{ maxWidth: 600 }}>
      <div style={card}>
        <h3 style={sectionTitle}>Gradient Anchor (no underline)</h3>
        <div style={row}>
          <Anchor
            href="#"
            variant="h3"
            gradient={{ from: '#667eea', to: '#764ba2' }}
          >
            Purple Gradient Link
          </Anchor>
        </div>
        <div style={row}>
          <Anchor
            href="#"
            variant="body1"
            gradient={{ from: '#f093fb', to: '#f5576c' }}
          >
            Pink gradient body link
          </Anchor>
        </div>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 7. In Context
// ---------------------------------------------------------------------------

export const InContext: Story = {
  name: '7. In Context',
  render: () => (
    <div style={{ maxWidth: 700 }}>
      <div style={card}>
        <Text variant="h4" gutterBottom>
          Terms of Service
        </Text>
        <Text variant="body1" gutterBottom>
          By using our service, you agree to our{' '}
          <Anchor href="#" underline="always">Terms of Service</Anchor>{' '}
          and{' '}
          <Anchor href="#" underline="always">Privacy Policy</Anchor>.
          For questions, contact us at{' '}
          <Anchor href="mailto:support@example.com">support@example.com</Anchor>.
        </Text>
        <Text variant="body2" color="text.secondary" gutterBottom>
          Last updated: February 16, 2026. See our{' '}
          <Anchor href="#" color="text.secondary" underline="always">changelog</Anchor>{' '}
          for details.
        </Text>
        <Text variant="caption" color="text.disabled">
          <Anchor href="#" color="text.disabled" external>
            View on GitHub
          </Anchor>
        </Text>
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
        <h3 style={sectionTitle}>Anchor API Reference</h3>
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
              ['href', 'string', '—', 'Link URL'],
              ['underline', "'always' | 'hover' | 'never'", "'hover'", 'When to show underline'],
              ['external', 'boolean', 'false', 'Adds target="_blank" rel="noopener noreferrer"'],
              ['color', 'string', "'primary'", 'Theme color, palette token, or CSS color'],
              ['variant', 'TextVariant', "'body1'", 'Typography variant (h1-h6, subtitle, body, etc.)'],
              ['truncate', "boolean | 'end' | 'start'", '—', 'Truncate with ellipsis'],
              ['lineClamp', 'number', '—', 'Multi-line truncation'],
              ['gradient', '{ from, to, deg? }', '—', 'Gradient text (disables underline)'],
              ['component', 'ElementType', "'a'", 'Override rendered element'],
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
    </div>
  ),
};
