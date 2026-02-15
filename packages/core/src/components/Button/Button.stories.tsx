import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PrismuiProvider } from '../../core/PrismuiProvider/PrismuiProvider';
import { Button } from './Button';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  decorators: [
    (Story) => (
      <PrismuiProvider>
        <Story />
      </PrismuiProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Button>;

// ---------------------------------------------------------------------------
// Shared constants
// ---------------------------------------------------------------------------

const VARIANTS = ['solid', 'outlined', 'soft', 'plain'] as const;

const SEMANTIC_COLORS = [
  'primary', 'secondary', 'info', 'success', 'warning', 'error', 'neutral',
] as const;

const FAMILY_COLORS = ['blue', 'red', 'green', 'purple', 'orange'] as const;

const ALL_COLORS = [
  'inherit',
  ...SEMANTIC_COLORS,
  ...FAMILY_COLORS,
  'white',
  'black',
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

const variantTitle: React.CSSProperties = {
  margin: '16px 0 8px',
  fontSize: 13,
  fontWeight: 600,
  textTransform: 'capitalize' as const,
  color: '#6b7280',
};

const row: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap',
  alignItems: 'center',
  marginBottom: 8,
};

const label: React.CSSProperties = {
  fontSize: 11,
  color: '#9ca3af',
  width: 70,
  textAlign: 'right',
  flexShrink: 0,
};

// ---------------------------------------------------------------------------
// Story 1: Solid Variant — All Colors
// ---------------------------------------------------------------------------

export const SolidVariant: Story = {
  name: '1. Solid — All Colors',
  render: () => (
    <PrismuiProvider>
      <div style={card}>
        <h3 style={sectionTitle}>Solid Variant</h3>
        <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 16px' }}>
          Filled background with contrast text. Hover darkens background and adds shadow.
        </p>

        <h4 style={variantTitle}>inherit</h4>
        <div style={row}>
          <Button variant="solid" color="inherit">inherit</Button>
        </div>

        <h4 style={variantTitle}>Semantic Colors</h4>
        <div style={row}>
          {SEMANTIC_COLORS.map((c) => (
            <Button key={c} variant="solid" color={c}>{c}</Button>
          ))}
        </div>

        <h4 style={variantTitle}>Color Families</h4>
        <div style={row}>
          {FAMILY_COLORS.map((c) => (
            <Button key={c} variant="solid" color={c}>{c}</Button>
          ))}
        </div>

        <h4 style={variantTitle}>black / white</h4>
        <div style={row}>
          <Button variant="solid" color="black">black</Button>
          <Button variant="solid" color="white">white</Button>
        </div>
      </div>
    </PrismuiProvider>
  ),
};

// ---------------------------------------------------------------------------
// Story 2: Outlined Variant — All Colors
// ---------------------------------------------------------------------------

export const OutlinedVariant: Story = {
  name: '2. Outlined — All Colors',
  render: () => (
    <PrismuiProvider>
      <div style={card}>
        <h3 style={sectionTitle}>Outlined Variant</h3>
        <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 16px' }}>
          Transparent background with colored border and text. Hover thickens border via box-shadow.
        </p>

        <h4 style={variantTitle}>inherit</h4>
        <div style={row}>
          <Button variant="outlined" color="inherit">inherit</Button>
        </div>

        <h4 style={variantTitle}>Semantic Colors</h4>
        <div style={row}>
          {SEMANTIC_COLORS.map((c) => (
            <Button key={c} variant="outlined" color={c}>{c}</Button>
          ))}
        </div>

        <h4 style={variantTitle}>Color Families</h4>
        <div style={row}>
          {FAMILY_COLORS.map((c) => (
            <Button key={c} variant="outlined" color={c}>{c}</Button>
          ))}
        </div>

        <h4 style={variantTitle}>black / white</h4>
        <div style={row}>
          <Button variant="outlined" color="black">black</Button>
          <span style={{ background: '#1C252E', padding: '4px 8px', borderRadius: 6 }}>
            <Button variant="outlined" color="white">white</Button>
          </span>
        </div>
      </div>
    </PrismuiProvider>
  ),
};

// ---------------------------------------------------------------------------
// Story 3: Soft Variant — All Colors
// ---------------------------------------------------------------------------

export const SoftVariant: Story = {
  name: '3. Soft — All Colors',
  render: () => (
    <PrismuiProvider>
      <div style={card}>
        <h3 style={sectionTitle}>Soft Variant</h3>
        <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 16px' }}>
          Light tinted background with darker text. Hover deepens the background.
        </p>

        <h4 style={variantTitle}>inherit</h4>
        <div style={row}>
          <Button variant="soft" color="inherit">inherit</Button>
        </div>

        <h4 style={variantTitle}>Semantic Colors</h4>
        <div style={row}>
          {SEMANTIC_COLORS.map((c) => (
            <Button key={c} variant="soft" color={c}>{c}</Button>
          ))}
        </div>

        <h4 style={variantTitle}>Color Families</h4>
        <div style={row}>
          {FAMILY_COLORS.map((c) => (
            <Button key={c} variant="soft" color={c}>{c}</Button>
          ))}
        </div>

        <h4 style={variantTitle}>black / white</h4>
        <div style={row}>
          <Button variant="soft" color="black">black</Button>
          <span style={{ background: '#1C252E', padding: '4px 8px', borderRadius: 6 }}>
            <Button variant="soft" color="white">white</Button>
          </span>
        </div>
      </div>
    </PrismuiProvider>
  ),
};

// ---------------------------------------------------------------------------
// Story 4: Plain Variant — All Colors
// ---------------------------------------------------------------------------

export const PlainVariant: Story = {
  name: '4. Plain — All Colors',
  render: () => (
    <PrismuiProvider>
      <div style={card}>
        <h3 style={sectionTitle}>Plain Variant</h3>
        <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 16px' }}>
          No background or border. Text only. Hover shows subtle background.
        </p>

        <h4 style={variantTitle}>inherit</h4>
        <div style={row}>
          <Button variant="plain" color="inherit">inherit</Button>
        </div>

        <h4 style={variantTitle}>Semantic Colors</h4>
        <div style={row}>
          {SEMANTIC_COLORS.map((c) => (
            <Button key={c} variant="plain" color={c}>{c}</Button>
          ))}
        </div>

        <h4 style={variantTitle}>Color Families</h4>
        <div style={row}>
          {FAMILY_COLORS.map((c) => (
            <Button key={c} variant="plain" color={c}>{c}</Button>
          ))}
        </div>

        <h4 style={variantTitle}>black / white</h4>
        <div style={row}>
          <Button variant="plain" color="black">black</Button>
          <span style={{ background: '#1C252E', padding: '4px 8px', borderRadius: 6 }}>
            <Button variant="plain" color="white">white</Button>
          </span>
        </div>
      </div>
    </PrismuiProvider>
  ),
};

// ---------------------------------------------------------------------------
// Story 5: Light vs Dark Scheme
// ---------------------------------------------------------------------------

export const LightVsDark: Story = {
  name: '5. Light vs Dark Scheme',
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      {/* Light */}
      <div style={{ flex: 1 }}>
        <PrismuiProvider defaultColorScheme="light" forceColorScheme="light">
          <div style={card}>
            <h3 style={sectionTitle}>Light Scheme</h3>
            {VARIANTS.map((variant) => (
              <div key={variant}>
                <h4 style={variantTitle}>{variant}</h4>
                <div style={row}>
                  {(['primary', 'error', 'blue', 'inherit', 'black', 'white'] as const).map((c) => (
                    <Button key={c} variant={variant} color={c} size="sm">{c}</Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </PrismuiProvider>
      </div>

      {/* Dark */}
      <div style={{ flex: 1 }}>
        <PrismuiProvider defaultColorScheme="dark" forceColorScheme="dark">
          <div style={darkCard}>
            <h3 style={sectionTitle}>Dark Scheme</h3>
            {VARIANTS.map((variant) => (
              <div key={variant}>
                <h4 style={{ ...variantTitle, color: '#9ca3af' }}>{variant}</h4>
                <div style={row}>
                  {(['primary', 'error', 'blue', 'inherit', 'black', 'white'] as const).map((c) => (
                    <Button key={c} variant={variant} color={c} size="sm">{c}</Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </PrismuiProvider>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 6: Full Matrix (All Variants × All Colors)
// ---------------------------------------------------------------------------

export const FullMatrix: Story = {
  name: '6. Full Matrix',
  render: () => (
    <PrismuiProvider>
      <div style={card}>
        <h3 style={sectionTitle}>Full Variant × Color Matrix</h3>
        <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 16px' }}>
          4 variants × {ALL_COLORS.length} colors = {4 * ALL_COLORS.length} combinations
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>
                <th style={{ padding: '6px 12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb', fontSize: 11, color: '#6b7280' }}>
                  Color
                </th>
                {VARIANTS.map((v) => (
                  <th key={v} style={{ padding: '6px 12px', textAlign: 'center', borderBottom: '2px solid #e5e7eb', fontSize: 11, color: '#6b7280', textTransform: 'capitalize' }}>
                    {v}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ALL_COLORS.map((color) => (
                <tr key={color}>
                  <td style={{ padding: '8px 12px', borderBottom: '1px solid #f3f4f6', fontWeight: 600, fontSize: 12 }}>
                    {color}
                  </td>
                  {VARIANTS.map((variant) => (
                    <td key={variant} style={{ padding: '8px 12px', borderBottom: '1px solid #f3f4f6', textAlign: 'center' }}>
                      {color === 'white' ? (
                        <span style={{ background: '#1C252E', padding: '4px 8px', borderRadius: 4, display: 'inline-block' }}>
                          <Button variant={variant} color={color} size="sm">{color}</Button>
                        </span>
                      ) : (
                        <Button variant={variant} color={color} size="sm">{color}</Button>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PrismuiProvider>
  ),
};

// ---------------------------------------------------------------------------
// Story 7: Sizes
// ---------------------------------------------------------------------------

export const Sizes: Story = {
  name: '7. Sizes',
  render: () => (
    <PrismuiProvider>
      <div style={card}>
        <h3 style={sectionTitle}>Button Sizes</h3>

        <h4 style={variantTitle}>Standard Sizes (ADR-009: 32/36/42/48)</h4>
        <div style={{ ...row, alignItems: 'flex-end' }}>
          {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
            <Button key={size} size={size}>{size}</Button>
          ))}
        </div>

        <h4 style={variantTitle}>Compact Sizes (26/30/36/42)</h4>
        <div style={{ ...row, alignItems: 'flex-end' }}>
          {(['compact-sm', 'compact-md', 'compact-lg', 'compact-xl'] as const).map((size) => (
            <Button key={size} size={size}>{size}</Button>
          ))}
        </div>
      </div>
    </PrismuiProvider>
  ),
};

// ---------------------------------------------------------------------------
// Story 8: Sections (leftSection / rightSection)
// ---------------------------------------------------------------------------

export const Sections: Story = {
  name: '8. Sections',
  render: () => (
    <PrismuiProvider>
      <div style={card}>
        <h3 style={sectionTitle}>Left & Right Sections</h3>
        <div style={row}>
          <Button leftSection={<span>←</span>}>Left Icon</Button>
          <Button rightSection={<span>→</span>}>Right Icon</Button>
          <Button leftSection={<span>🔍</span>} rightSection={<span>↵</span>}>Both</Button>
        </div>

        <h4 style={variantTitle}>With Variants</h4>
        <div style={row}>
          <Button variant="solid" leftSection={<span>✓</span>}>Solid</Button>
          <Button variant="outlined" leftSection={<span>✓</span>}>Outlined</Button>
          <Button variant="soft" leftSection={<span>✓</span>}>Soft</Button>
          <Button variant="plain" leftSection={<span>✓</span>}>Plain</Button>
        </div>
      </div>
    </PrismuiProvider>
  ),
};

// ---------------------------------------------------------------------------
// Story 9: States (disabled, loading, fullWidth)
// ---------------------------------------------------------------------------

export const States: Story = {
  name: '9. States',
  render: () => (
    <PrismuiProvider>
      <div style={card}>
        <h3 style={sectionTitle}>Button States</h3>

        <h4 style={variantTitle}>Disabled (per-variant styling)</h4>
        <div style={row}>
          <Button disabled>Solid</Button>
          <Button variant="soft" disabled>Soft</Button>
          <Button variant="outlined" disabled>Outlined</Button>
          <Button variant="plain" disabled>Plain</Button>
        </div>
        <p style={{ fontSize: 11, color: '#9ca3af', margin: '4px 0 0' }}>
          solid/soft: disabledBackground + disabledColor &nbsp;|&nbsp;
          outlined: disabledBackground border + disabledColor &nbsp;|&nbsp;
          plain: disabledColor only
        </p>

        <h4 style={variantTitle}>Loading</h4>
        <div style={row}>
          <Button loading>Loading Solid</Button>
          <Button variant="outlined" loading>Loading Outlined</Button>
          <Button variant="soft" loading>Loading Soft</Button>
          <Button variant="plain" loading>Loading Plain</Button>
        </div>

        <h4 style={variantTitle}>Full Width</h4>
        <div style={{ maxWidth: 400 }}>
          <Button fullWidth style={{ marginBottom: 8 }}>Full Width Solid</Button>
          <Button variant="outlined" fullWidth>Full Width Outlined</Button>
        </div>
      </div>
    </PrismuiProvider>
  ),
};

// ---------------------------------------------------------------------------
// Story 10: Radius
// ---------------------------------------------------------------------------

export const Radius: Story = {
  name: '10. Radius',
  render: () => (
    <PrismuiProvider>
      <div style={card}>
        <h3 style={sectionTitle}>Border Radius</h3>
        <div style={row}>
          {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((r) => (
            <Button key={r} radius={r}>radius={r}</Button>
          ))}
        </div>
      </div>
    </PrismuiProvider>
  ),
};

// ---------------------------------------------------------------------------
// Story 11: Polymorphic (as anchor)
// ---------------------------------------------------------------------------

export const Polymorphic: Story = {
  name: '11. Polymorphic',
  render: () => (
    <PrismuiProvider>
      <div style={card}>
        <h3 style={sectionTitle}>Polymorphic Rendering</h3>
        <div style={row}>
          <Button>Default (button)</Button>
          <Button component="a" href="https://example.com">As Anchor</Button>
          <Button component="div">As Div</Button>
        </div>
      </div>
    </PrismuiProvider>
  ),
};

// ---------------------------------------------------------------------------
// Story 12: Dark Scheme Full Matrix
// ---------------------------------------------------------------------------

export const DarkSchemeFullMatrix: Story = {
  name: '12. Dark Scheme — Full Matrix',
  render: () => (
    <PrismuiProvider defaultColorScheme="dark" forceColorScheme="dark">
      <div style={darkCard}>
        <h3 style={sectionTitle}>Dark Scheme — Full Variant × Color Matrix</h3>
        <p style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 16px' }}>
          Same matrix as Story 6 but rendered in dark scheme (center shade = 6).
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>
                <th style={{ padding: '6px 12px', textAlign: 'left', borderBottom: '2px solid #454F5B', fontSize: 11, color: '#9ca3af' }}>
                  Color
                </th>
                {VARIANTS.map((v) => (
                  <th key={v} style={{ padding: '6px 12px', textAlign: 'center', borderBottom: '2px solid #454F5B', fontSize: 11, color: '#9ca3af', textTransform: 'capitalize' }}>
                    {v}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ALL_COLORS.map((color) => (
                <tr key={color}>
                  <td style={{ padding: '8px 12px', borderBottom: '1px solid #32383E', fontWeight: 600, fontSize: 12, color: '#F9FAFB' }}>
                    {color}
                  </td>
                  {VARIANTS.map((variant) => (
                    <td key={variant} style={{ padding: '8px 12px', borderBottom: '1px solid #32383E', textAlign: 'center' }}>
                      <Button variant={variant} color={color} size="sm">{color}</Button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PrismuiProvider>
  ),
};

// ---------------------------------------------------------------------------
// Story 13: Ripple
// ---------------------------------------------------------------------------

export const Ripple: Story = {
  name: '13. Ripple',
  render: () => (
    <PrismuiProvider>
      <div style={card}>
        <h3 style={sectionTitle}>Ripple Effect (from ButtonBase)</h3>
        <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 16px' }}>
          Click/tap to see the ripple animation. Inherited from ButtonBase.
        </p>
        <div style={row}>
          <Button>Default Ripple</Button>
          <Button centerRipple>Center Ripple</Button>
          <Button disableRipple>No Ripple</Button>
        </div>
        <div style={row}>
          <Button variant="outlined">Outlined Ripple</Button>
          <Button variant="soft">Soft Ripple</Button>
          <Button variant="plain">Plain Ripple</Button>
        </div>
      </div>
    </PrismuiProvider>
  ),
};
