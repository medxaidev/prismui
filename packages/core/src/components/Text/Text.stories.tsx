import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PrismuiProvider } from '../../core/PrismuiProvider/PrismuiProvider';
import { Text } from './Text';
import type { TextVariant } from './Text';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof Text> = {
  title: 'Components/Text',
  component: Text,
  decorators: [
    (Story) => (
      <PrismuiProvider>
        <Story />
      </PrismuiProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Text>;

// ---------------------------------------------------------------------------
// Shared constants
// ---------------------------------------------------------------------------

const HEADING_VARIANTS: TextVariant[] = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
const BODY_VARIANTS: TextVariant[] = ['subtitle1', 'subtitle2', 'body1', 'body2', 'caption', 'overline'];
const ALL_VARIANTS: TextVariant[] = [...HEADING_VARIANTS, ...BODY_VARIANTS];

const SEMANTIC_COLORS = [
  'primary', 'secondary', 'info', 'success', 'warning', 'error',
] as const;

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
// 1. All Variants
// ---------------------------------------------------------------------------

export const AllVariants: Story = {
  name: '1. All Variants',
  render: () => (
    <div style={{ maxWidth: 900 }}>
      <div style={card}>
        <h3 style={sectionTitle}>Heading Variants (responsive)</h3>
        {HEADING_VARIANTS.map((v) => (
          <div key={v} style={row}>
            <div style={label}>{v}</div>
            <Text variant={v}>
              {v.toUpperCase()}: The quick brown fox jumps over the lazy dog
            </Text>
          </div>
        ))}
      </div>

      <div style={card}>
        <h3 style={sectionTitle}>Body Variants</h3>
        {BODY_VARIANTS.map((v) => (
          <div key={v} style={row}>
            <div style={label}>{v}</div>
            <Text variant={v}>
              {v}: The quick brown fox jumps over the lazy dog
            </Text>
          </div>
        ))}
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 2. Typography Reference Table
// ---------------------------------------------------------------------------

export const TypographyReference: Story = {
  name: '2. Typography Reference',
  render: () => {
    const specs: Record<TextVariant, { fz: string; fw: number; lh: string; el: string }> = {
      h1: { fz: '2.5rem (40px)', fw: 800, lh: '1.25', el: 'h1' },
      h2: { fz: '2rem (32px)', fw: 800, lh: '1.33', el: 'h2' },
      h3: { fz: '1.5rem (24px)', fw: 700, lh: '1.5', el: 'h3' },
      h4: { fz: '1.25rem (20px)', fw: 700, lh: '1.5', el: 'h4' },
      h5: { fz: '1.125rem (18px)', fw: 700, lh: '1.5', el: 'h5' },
      h6: { fz: '1.0625rem (17px)', fw: 600, lh: '1.56', el: 'h6' },
      subtitle1: { fz: '1rem (16px)', fw: 600, lh: '1.5', el: 'p' },
      subtitle2: { fz: '0.875rem (14px)', fw: 600, lh: '1.57', el: 'p' },
      body1: { fz: '1rem (16px)', fw: 400, lh: '1.5', el: 'p' },
      body2: { fz: '0.875rem (14px)', fw: 400, lh: '1.57', el: 'p' },
      caption: { fz: '0.75rem (12px)', fw: 400, lh: '1.5', el: 'span' },
      overline: { fz: '0.75rem (12px)', fw: 700, lh: '1.5', el: 'span' },
    };

    return (
      <div style={{ maxWidth: 900 }}>
        <div style={card}>
          <h3 style={sectionTitle}>Typography Specification</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
                <th style={{ padding: '8px 12px' }}>Variant</th>
                <th style={{ padding: '8px 12px' }}>Element</th>
                <th style={{ padding: '8px 12px' }}>Font Size</th>
                <th style={{ padding: '8px 12px' }}>Weight</th>
                <th style={{ padding: '8px 12px' }}>Line Height</th>
                <th style={{ padding: '8px 12px' }}>Sample</th>
              </tr>
            </thead>
            <tbody>
              {ALL_VARIANTS.map((v) => (
                <tr key={v} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontWeight: 600 }}>{v}</td>
                  <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: '#6b7280' }}>&lt;{specs[v].el}&gt;</td>
                  <td style={{ padding: '8px 12px' }}>{specs[v].fz}</td>
                  <td style={{ padding: '8px 12px' }}>{specs[v].fw}</td>
                  <td style={{ padding: '8px 12px' }}>{specs[v].lh}</td>
                  <td style={{ padding: '8px 12px' }}>
                    <Text variant={v}>Sample</Text>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// 3. Colors
// ---------------------------------------------------------------------------

export const Colors: Story = {
  name: '3. Colors',
  render: () => (
    <div style={{ maxWidth: 900 }}>
      <div style={card}>
        <h3 style={sectionTitle}>Semantic Colors</h3>
        {SEMANTIC_COLORS.map((c) => (
          <div key={c} style={{ marginBottom: 4 }}>
            <Text variant="body1" color={c}>
              color=&quot;{c}&quot; — The quick brown fox jumps over the lazy dog
            </Text>
          </div>
        ))}
      </div>

      <div style={card}>
        <h3 style={sectionTitle}>Palette Tokens</h3>
        <Text variant="body1" color="text.primary" gutterBottom>
          color=&quot;text.primary&quot; — Primary text color
        </Text>
        <Text variant="body1" color="text.secondary" gutterBottom>
          color=&quot;text.secondary&quot; — Secondary text color
        </Text>
        <Text variant="body1" color="text.disabled">
          color=&quot;text.disabled&quot; — Disabled text color
        </Text>
      </div>

      <div style={darkCard}>
        <h3 style={sectionTitle}>On Dark Background</h3>
        <Text variant="h4" color="#fff" gutterBottom>
          White heading on dark
        </Text>
        <Text variant="body1" color="primary">
          Primary color text on dark
        </Text>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 4. Truncate & Line Clamp
// ---------------------------------------------------------------------------

export const TruncateAndLineClamp: Story = {
  name: '4. Truncate & Line Clamp',
  render: () => {
    const longText =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.';

    return (
      <div style={{ maxWidth: 600 }}>
        <div style={card}>
          <h3 style={sectionTitle}>truncate (single line)</h3>
          <Text truncate gutterBottom>{longText}</Text>

          <h3 style={{ ...sectionTitle, marginTop: 16 }}>truncate=&quot;start&quot;</h3>
          <Text truncate="start" gutterBottom>{longText}</Text>

          <h3 style={{ ...sectionTitle, marginTop: 16 }}>lineClamp=&#123;2&#125;</h3>
          <Text lineClamp={2} gutterBottom>{longText}</Text>

          <h3 style={{ ...sectionTitle, marginTop: 16 }}>lineClamp=&#123;3&#125;</h3>
          <Text lineClamp={3}>{longText}</Text>
        </div>
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// 5. Gradient Text
// ---------------------------------------------------------------------------

export const GradientText: Story = {
  name: '5. Gradient Text',
  render: () => (
    <div style={{ maxWidth: 900 }}>
      <div style={card}>
        <h3 style={sectionTitle}>Gradient Text</h3>
        <Text variant="h2" gradient={{ from: '#667eea', to: '#764ba2' }} gutterBottom>
          Purple to Indigo Gradient
        </Text>
        <Text variant="h3" gradient={{ from: '#f093fb', to: '#f5576c' }} gutterBottom>
          Pink to Red Gradient
        </Text>
        <Text variant="h4" gradient={{ from: '#4facfe', to: '#00f2fe', deg: 45 }} gutterBottom>
          Blue Gradient (45°)
        </Text>
        <Text variant="body1" gradient={{ from: '#43e97b', to: '#38f9d7' }}>
          Green gradient body text
        </Text>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 6. Gutter Bottom
// ---------------------------------------------------------------------------

export const GutterBottom: Story = {
  name: '6. Gutter Bottom',
  render: () => (
    <div style={{ maxWidth: 600 }}>
      <div style={card}>
        <h3 style={sectionTitle}>gutterBottom adds margin-bottom: 0.35em</h3>
        <Text variant="h3" gutterBottom>Heading with gutter</Text>
        <Text variant="body1" gutterBottom>First paragraph with gutter bottom.</Text>
        <Text variant="body1" gutterBottom>Second paragraph with gutter bottom.</Text>
        <Text variant="body1">Third paragraph without gutter.</Text>
      </div>

      <div style={card}>
        <h3 style={sectionTitle}>Without gutterBottom</h3>
        <Text variant="h3">Heading without gutter</Text>
        <Text variant="body1">First paragraph.</Text>
        <Text variant="body1">Second paragraph.</Text>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 7. Inline & Inherit
// ---------------------------------------------------------------------------

export const InlineAndInherit: Story = {
  name: '7. Inline & Inherit',
  render: () => (
    <div style={{ maxWidth: 600 }}>
      <div style={card}>
        <h3 style={sectionTitle}>inline (line-height: 1)</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px dashed #d1d5db', padding: 8 }}>
          <Text inline variant="h4">Inline H4</Text>
          <Text inline variant="body2">next to body2</Text>
        </div>
      </div>

      <div style={card}>
        <h3 style={sectionTitle}>inherit (inherits parent font)</h3>
        <div style={{ fontSize: 24, fontWeight: 300, color: 'purple' }}>
          Parent div (24px, 300, purple):
          <Text inherit> This Text inherits parent styles</Text>
        </div>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 8. Span Shorthand
// ---------------------------------------------------------------------------

export const SpanShorthand: Story = {
  name: '8. Span Shorthand',
  render: () => (
    <div style={{ maxWidth: 600 }}>
      <div style={card}>
        <h3 style={sectionTitle}>span prop renders &lt;span&gt;</h3>
        <Text variant="body1">
          This is a paragraph with{' '}
          <Text span variant="body1" color="primary">
            inline primary text
          </Text>{' '}
          and{' '}
          <Text span variant="body1" color="error">
            inline error text
          </Text>{' '}
          inside it.
        </Text>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 9. Polymorphic
// ---------------------------------------------------------------------------

export const Polymorphic: Story = {
  name: '9. Polymorphic',
  render: () => (
    <div style={{ maxWidth: 600 }}>
      <div style={card}>
        <h3 style={sectionTitle}>component prop overrides element</h3>
        <div style={row}>
          <div style={label}>variant=&quot;h1&quot; component=&quot;div&quot;</div>
          <Text variant="h1" component="div">H1 styled div</Text>
        </div>
        <div style={row}>
          <div style={label}>variant=&quot;body1&quot; component=&quot;a&quot;</div>
          <Text variant="body1" component="a" href="https://example.com" color="primary">
            Body1 styled link
          </Text>
        </div>
        <div style={row}>
          <div style={label}>variant=&quot;caption&quot; component=&quot;label&quot;</div>
          <Text variant="caption" component="label">Caption styled label</Text>
        </div>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 10. Responsive Headings
// ---------------------------------------------------------------------------

export const ResponsiveHeadings: Story = {
  name: '10. Responsive Headings',
  render: () => (
    <div style={{ maxWidth: 900 }}>
      <div style={card}>
        <h3 style={sectionTitle}>Resize the browser to see responsive font sizes</h3>
        <div style={{ marginBottom: 8 }}>
          <div style={label}>h1: 40px → 52px (600px) → 58px (900px) → 64px (1200px)</div>
          <Text variant="h1" gutterBottom>Responsive H1</Text>
        </div>
        <div style={{ marginBottom: 8 }}>
          <div style={label}>h2: 32px → 40px (600px) → 44px (900px) → 48px (1200px)</div>
          <Text variant="h2" gutterBottom>Responsive H2</Text>
        </div>
        <div style={{ marginBottom: 8 }}>
          <div style={label}>h3: 24px → 26px (600px) → 30px (900px) → 32px (1200px)</div>
          <Text variant="h3" gutterBottom>Responsive H3</Text>
        </div>
        <div style={{ marginBottom: 8 }}>
          <div style={label}>h4: 20px → 24px (900px)</div>
          <Text variant="h4" gutterBottom>Responsive H4</Text>
        </div>
        <div style={{ marginBottom: 8 }}>
          <div style={label}>h5: 18px → 19px (600px)</div>
          <Text variant="h5" gutterBottom>Responsive H5</Text>
        </div>
        <div style={{ marginBottom: 8 }}>
          <div style={label}>h6: 17px → 18px (600px)</div>
          <Text variant="h6">Responsive H6</Text>
        </div>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 11. Text Transform
// ---------------------------------------------------------------------------

export const TextTransform: Story = {
  name: '11. Text Transform',
  render: () => (
    <div style={{ maxWidth: 600 }}>
      <div style={card}>
        <h3 style={sectionTitle}>textTransform prop</h3>
        <Text variant="body1" textTransform="uppercase" gutterBottom>
          uppercase text
        </Text>
        <Text variant="body1" textTransform="capitalize" gutterBottom>
          capitalized text example
        </Text>
        <Text variant="body1" textTransform="lowercase" gutterBottom>
          LOWERCASE TEXT
        </Text>
        <div style={{ marginTop: 16 }}>
          <div style={label}>overline variant (auto uppercase + letter-spacing)</div>
          <Text variant="overline">overline has built-in uppercase</Text>
        </div>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 12. Combined Example
// ---------------------------------------------------------------------------

export const CombinedExample: Story = {
  name: '12. Combined Example',
  render: () => (
    <div style={{ maxWidth: 700 }}>
      <div style={card}>
        <Text variant="overline" color="primary" gutterBottom>
          Featured Article
        </Text>
        <Text variant="h3" gutterBottom>
          Building a Design System with PrismUI
        </Text>
        <Text variant="subtitle1" color="text.secondary" gutterBottom>
          A comprehensive guide to creating consistent, reusable components
        </Text>
        <Text variant="body1" gutterBottom>
          Design systems help teams build better products faster by providing a shared
          language and set of reusable components. PrismUI combines the best of Mantine&apos;s
          architecture with MUI&apos;s visual design philosophy.
        </Text>
        <Text variant="body2" color="text.secondary" gutterBottom>
          Published on February 16, 2026 · 5 min read
        </Text>
        <Text variant="caption" color="text.disabled">
          Last updated: 2 hours ago
        </Text>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 13. API Reference
// ---------------------------------------------------------------------------

export const APIReference: Story = {
  name: '13. API Reference',
  render: () => (
    <div style={{ maxWidth: 900 }}>
      <div style={card}>
        <h3 style={sectionTitle}>Text API Reference</h3>
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
              ['variant', 'TextVariant', "'body1'", 'Typography variant (h1-h6, subtitle1/2, body1/2, caption, overline)'],
              ['color', 'string', '—', 'Theme color, palette token, or CSS color'],
              ['align', 'CSSProperties["textAlign"]', '—', 'Text alignment'],
              ['truncate', "boolean | 'end' | 'start'", '—', 'Truncate with ellipsis'],
              ['lineClamp', 'number', '—', 'Multi-line truncation'],
              ['inline', 'boolean', 'false', 'Sets line-height: 1'],
              ['inherit', 'boolean', 'false', 'Inherit parent font properties'],
              ['gutterBottom', 'boolean', 'false', 'Adds margin-bottom: 0.35em'],
              ['textTransform', 'CSSProperties["textTransform"]', '—', 'CSS text-transform'],
              ['gradient', '{ from, to, deg? }', '—', 'Gradient text'],
              ['span', 'boolean', 'false', 'Shorthand for component="span"'],
              ['component', 'ElementType', 'auto', 'Override rendered element'],
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
