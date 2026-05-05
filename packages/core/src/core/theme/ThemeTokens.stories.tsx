import type { Meta, StoryObj } from '@storybook/react';
import React, { useEffect, useState } from 'react';
import { PrismUIProvider } from './provider';
import { defaultTheme } from './default-theme';

const meta = {
  title: 'Theme/TokensVisualizer',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Shared helpers ────────────────────────────────────────────────────────────

function useCSSVar(name: string): string {
  const [val, setVal] = useState('');
  useEffect(() => {
    setVal(getComputedStyle(document.documentElement).getPropertyValue(name).trim());
  }, [name]);
  return val;
}

export function _ColorSwatch({ varName, label }: { varName: string; label: string }) {
  const value = useCSSVar(varName);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 6,
          background: `var(${varName})`,
          border: '1px solid rgba(0,0,0,0.08)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      />
      <span style={{ fontSize: 10, color: '#637381', textAlign: 'center', maxWidth: 80 }}>{label}</span>
      <span style={{ fontSize: 10, color: '#919EAB', fontFamily: 'monospace' }}>{value}</span>
    </div>
  );
}

const sectionStyle: React.CSSProperties = {
  fontFamily: '"Public Sans Variable", -apple-system, sans-serif',
  padding: '24px',
};

const headingStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#454F5B',
  marginBottom: 16,
  marginTop: 0,
};

// ── Story 1: Color Palette ────────────────────────────────────────────────────

const semanticNames = ['primary', 'secondary', 'info', 'success', 'warning', 'error', 'neutral'] as const;

const roleGroups = [
  { label: 'base', vars: (n: string) => [`--prismui-color-${n}`, `--prismui-color-${n}-hover`, `--prismui-color-${n}-active`], keys: ['base', 'hover', 'active'] },
  { label: 'high', vars: (n: string) => [`--prismui-color-${n}-high-bg`, `--prismui-color-${n}-high-hover-bg`, `--prismui-color-${n}-high-fg`], keys: ['high-bg', 'high-hbg', 'high-fg'] },
  { label: 'low', vars: (n: string) => [`--prismui-color-${n}-low-bg`, `--prismui-color-${n}-low-hover-bg`, `--prismui-color-${n}-low-fg`], keys: ['low-bg', 'low-hbg', 'low-fg'] },
  { label: 'bordered', vars: (n: string) => [`--prismui-color-${n}-bordered-border`, `--prismui-color-${n}-bordered-fg`, `--prismui-color-${n}-bordered-hover-bg`], keys: ['bdr-border', 'bdr-fg', 'bdr-hbg'] },
  { label: 'minimal', vars: (n: string) => [`--prismui-color-${n}-minimal-fg`, `--prismui-color-${n}-minimal-hover-bg`], keys: ['min-fg', 'min-hbg'] },
];

function ColorPaletteGrid() {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', fontSize: 12, width: '100%' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '4px 12px', color: '#637381', fontWeight: 600 }}>Semantic</th>
            {roleGroups.flatMap(g => g.keys.map(k => (
              <th key={`${g.label}-${k}`} style={{ padding: '4px 6px', color: '#919EAB', fontWeight: 400, fontSize: 11, textAlign: 'center' }}>{k}</th>
            )))}
          </tr>
        </thead>
        <tbody>
          {semanticNames.map(name => (
            <tr key={name}>
              <td style={{ padding: '6px 12px', fontWeight: 600, color: '#454F5B', fontSize: 13 }}>{name}</td>
              {roleGroups.flatMap(g =>
                g.vars(name).map((varName, _i) => (
                  <td key={varName} style={{ padding: '4px 6px', textAlign: 'center' }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 4,
                      background: `var(${varName})`,
                      border: '1px solid rgba(0,0,0,0.08)',
                      margin: 'auto',
                    }} title={varName} />
                  </td>
                ))
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ fontSize: 11, color: '#919EAB', marginTop: 12, padding: '0 12px' }}>
        Hover each swatch to see the CSS variable name. warning high-fg should be dark (gray.800 = #1C252E).
      </p>
    </div>
  );
}

export const ColorPalette: Story = {
  render: () => (
    <PrismUIProvider>
      <div style={sectionStyle}>
        <p style={headingStyle}>Semantic Color Palette — Light Mode</p>
        <ColorPaletteGrid />
      </div>
    </PrismUIProvider>
  ),
};

// ── Story 2: Color Families ───────────────────────────────────────────────────

const colorFamilies = ['blue', 'cyan', 'green', 'yellow', 'violet', 'red', 'indigo', 'purple', 'pink', 'orange', 'teal', 'gray'] as const;
const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

function ColorFamiliesGrid() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {colorFamilies.map(family => (
        <div key={family} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 12, color: '#637381', width: 52, flexShrink: 0, fontWeight: 600 }}>{family}</span>
          {shades.map(shade => {
            const hex = (defaultTheme.colors as any)[family]?.[shade] ?? 'transparent';
            return (
              <div key={shade} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div
                  title={`${family}.${shade} = ${hex}`}
                  style={{
                    width: 40, height: 32, borderRadius: 4,
                    background: hex,
                    border: '1px solid rgba(0,0,0,0.06)',
                  }}
                />
                <span style={{ fontSize: 9, color: '#919EAB' }}>{shade}</span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export const ColorFamilies: Story = {
  render: () => (
    <PrismUIProvider>
      <div style={sectionStyle}>
        <p style={headingStyle}>Color Families — 12 families × 10 shades (from defaultTheme.colors)</p>
        <ColorFamiliesGrid />
      </div>
    </PrismUIProvider>
  ),
};

// ── Story 3: Spacing Scale ────────────────────────────────────────────────────

const spacingScales = ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;
const spacingValues: Record<string, string> = {
  none: '0px (0px)',
  xs: '0.25rem (4px)',
  sm: '0.5rem (8px)',
  md: '1rem (16px)',
  lg: '1.5rem (24px)',
  xl: '2rem (32px)',
  '2xl': '2.5rem (40px)',
  '3xl': '3rem (48px)',
};

export const SpacingScale: Story = {
  render: () => (
    <PrismUIProvider>
      <div style={sectionStyle}>
        <p style={headingStyle}>Spacing Scale — var(--prismui-spacing-*)</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {spacingScales.map(scale => (
            <div key={scale} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#637381', width: 24 }}>{scale}</span>
              <div style={{
                height: 28,
                width: `var(--prismui-spacing-${scale})`,
                background: '#0C68E9',
                borderRadius: 4,
                minWidth: 4,
              }} />
              <span style={{ fontSize: 11, color: '#919EAB' }}>{spacingValues[scale]} → var(--prismui-spacing-{scale})</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 11, color: '#919EAB', marginTop: 16 }}>
          Bar width driven by CSS variable. 8px base unit aligns with MUI spacing system.
        </p>
      </div>
    </PrismUIProvider>
  ),
};

// ── Story 4: Shadow Scale ─────────────────────────────────────────────────────

const shadowScales = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
const shadowDescriptions: Record<string, string> = {
  xs: 'Subtle lift — card subtle, badge',
  sm: 'Small float — tooltip, chip',
  md: 'Card shadow — panels, cards (gray-tinted)',
  lg: 'Popover layer — dropdowns (gray-tinted)',
  xl: 'Dialog layer — modals (black, strong isolation)',
};

export const ShadowScale: Story = {
  render: () => (
    <PrismUIProvider>
      <div style={{ ...sectionStyle, background: '#F4F6F8', minHeight: '100vh' }}>
        <p style={headingStyle}>Shadow Scale — var(--prismui-shadow-*)</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
          {shadowScales.map(scale => (
            <div
              key={scale}
              style={{
                background: '#fff',
                borderRadius: 12,
                padding: 24,
                width: 160,
                boxShadow: `var(--prismui-shadow-${scale})`,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1C252E', marginBottom: 4 }}>{scale}</div>
              <div style={{ fontSize: 11, color: '#637381' }}>{shadowDescriptions[scale]}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 11, color: '#919EAB', marginTop: 24 }}>
          xs–lg use MUI-style gray.500 tinted shadows (rgba 145,158,171). xl uses pure black for modal-level isolation.
        </p>
      </div>
    </PrismUIProvider>
  ),
};

// ── Story 5: Typography Scale ─────────────────────────────────────────────────

const fontWeightScales: Array<{ scale: string; weight: number }> = [
  { scale: 'extrabold', weight: 800 },
  { scale: 'bold', weight: 700 },
  { scale: 'semibold', weight: 600 },
  { scale: 'medium', weight: 500 },
  { scale: 'regular', weight: 400 },
];

const fontSizeScales: Array<{ scale: string; size: string }> = [
  { scale: 'xl', size: '1.25rem' },
  { scale: 'lg', size: '1.125rem' },
  { scale: 'md', size: '1rem' },
  { scale: 'sm', size: '0.875rem' },
  { scale: 'xs', size: '0.75rem' },
];

export const TypographyScale: Story = {
  render: () => (
    <PrismUIProvider>
      <div style={sectionStyle}>
        <p style={headingStyle}>Font Weight Scale — var(--prismui-font-weight-*)</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
          {fontWeightScales.map(({ scale, weight }) => (
            <div key={scale} style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
              <span style={{ fontSize: 11, color: '#919EAB', width: 72, flexShrink: 0, fontFamily: 'monospace' }}>
                {scale} ({weight})
              </span>
              <span style={{
                fontWeight: `var(--prismui-font-weight-${scale})` as any,
                fontSize: 20,
                color: '#1C252E',
                fontFamily: 'var(--prismui-font-family)',
              }}>
                The quick brown fox jumps over the lazy dog
              </span>
            </div>
          ))}
        </div>

        <p style={headingStyle}>Font Size Scale — var(--prismui-font-size-*)</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
          {fontSizeScales.map(({ scale, size }) => (
            <div key={scale} style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
              <span style={{ fontSize: 11, color: '#919EAB', width: 72, flexShrink: 0, fontFamily: 'monospace' }}>
                {scale} ({size})
              </span>
              <span style={{
                fontSize: `var(--prismui-font-size-${scale})` as any,
                color: '#1C252E',
                fontFamily: 'var(--prismui-font-family)',
                fontWeight: 400,
              }}>
                PrismUI Design System
              </span>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 11, color: '#919EAB' }}>
          extrabold (800) is new in Step 3.5. fontFamily = "Public Sans Variable" + system fallback.
          lineHeight.xs changed to 1.25 (was 1.4) to align with MUI heading line height.
        </p>
      </div>
    </PrismUIProvider>
  ),
};

// ── Story 6: Stage-14 Typography Family Layer (SZ-TYPE-2 v1.0) ────────────────

const familySchema = [
  {
    family: 'body',
    label: 'Body — running text · regular weight',
    weight: 400,
    samples: [
      { size: 'sm', spec: '13/20', sample: 'Body small — caption, footnote, dense table cell text.' },
      { size: 'md', spec: '14/20', sample: 'Body medium — primary paragraph copy. Stage-14 §3.6 anchor.' },
      { size: 'lg', spec: '16/24', sample: 'Body large — long-form reading, marketing pages.' },
    ],
  },
  {
    family: 'title',
    label: 'Title — headings · semibold weight',
    weight: 600,
    samples: [
      { size: 'sm', spec: '16/24', sample: 'Title small (h4 / subtitle)' },
      { size: 'md', spec: '20/28', sample: 'Title medium (Modal Header · §3.7.1)' },
      { size: 'lg', spec: '24/32', sample: 'Title large (h1 / display)' },
    ],
  },
  {
    family: 'label',
    label: 'Label — UI text · medium weight',
    weight: 500,
    samples: [
      { size: 'sm', spec: '12/16', sample: 'Label small — chip, badge, dense UI label' },
      { size: 'md', spec: '14/20', sample: 'Label medium — Button, Field, Tab. OQ-SZ-1=B anchor.' },
      { size: 'lg', spec: '16/24', sample: 'Label large — large button text' },
    ],
  },
] as const;

export const TypographyFamilies: Story = {
  render: () => (
    <PrismUIProvider>
      <div style={sectionStyle}>
        <p style={headingStyle}>
          Stage-14 SZ-TYPE-2 Family Layer — var(--prismui-typography-{'{family}'}-{'{size}'}-*)
        </p>
        <p style={{ fontSize: 11, color: '#637381', marginBottom: 24, lineHeight: 1.5 }}>
          Three semantic families × three sizes = 9 tokens. Each token carries
          <code style={{ margin: '0 4px', padding: '1px 4px', background: '#F4F6F8', borderRadius: 3 }}>
            (fontSize, lineHeight, fontWeight)
          </code>
          per <strong>SZ-TYPE-3</strong> single-declaration rule. Every lineHeight is a px integer
          divisible by 4 per <strong>SZ-TYPE-1</strong> (% 4 === 0). Horizontal guide lines below
          visualize lineHeight grid alignment (R-6 守护：preview without lineHeight visualization
          would let SZ-TYPE-1 silently drift).
        </p>

        {familySchema.map(({ family, label, weight, samples }) => (
          <div key={family} style={{ marginBottom: 36 }}>
            <p style={{ ...headingStyle, color: '#0C68E9', marginBottom: 12 }}>
              {label} (default fontWeight: {weight})
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {samples.map(({ size, spec, sample }) => (
                <div
                  key={size}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '120px 1fr',
                    alignItems: 'flex-start',
                    gap: 16,
                  }}
                >
                  <div style={{ fontSize: 11, color: '#919EAB', fontFamily: 'monospace', paddingTop: 6 }}>
                    <div style={{ fontWeight: 600, color: '#454F5B' }}>{family}.{size}</div>
                    <div>{spec}</div>
                  </div>
                  {/* lineHeight grid visualization: dashed top/bottom borders show
                      that text vertical extent matches the px lineHeight exactly. */}
                  <div
                    style={{
                      borderTop: '1px dashed #DFE3E8',
                      borderBottom: '1px dashed #DFE3E8',
                      padding: 0,
                      // Box height = lineHeight token to make the grid visually verifiable
                      lineHeight: `var(--prismui-typography-${family}-${size}-line-height)`,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--prismui-font-family)',
                        fontSize: `var(--prismui-typography-${family}-${size}-font-size)` as any,
                        lineHeight: `var(--prismui-typography-${family}-${size}-line-height)`,
                        fontWeight: `var(--prismui-typography-${family}-${size}-font-weight)` as any,
                        color: '#1C252E',
                      }}
                    >
                      {sample}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <p style={{ fontSize: 11, color: '#919EAB', marginTop: 24 }}>
          Anchors: <code>body.md</code> = 14/20 (§3.6) · <code>title.md</code> = 20/28 (§3.7.1
          Section <code>titleSize</code>) · <code>label.md</code> = 14/20 (OQ-SZ-1=B Button label).
        </p>
      </div>
    </PrismUIProvider>
  ),
};

// ─────────────────────────────────────────────────────────────────────────────
// Stage-14 Phase 4 · Section Layout (SZ-SEC-1 / SZ-SEC-2)
//
// Renders the canonical Header / Content / Footer three-band layout using
// ONLY the `--prismui-section-*` CSS variables — no hardcoded padding, gap,
// align-items, or justify-content values. This is exactly the consumption
// pattern Modal Round 0 (Stage-11 Phase 7) will use, so the story doubles
// as a visual contract specification.
//
// Each band is annotated with the var name(s) that drive its layout so the
// audit trail from `theme.layout.section.*` → CSS var → rendered geometry
// is self-evident in Storybook.
// ─────────────────────────────────────────────────────────────────────────────
export const SectionLayout: Story = {
  render: () => (
    <PrismUIProvider>
      <div style={sectionStyle}>
        <h2 style={headingStyle}>Stage-14 Section Layout (SZ-SEC-1 / SZ-SEC-2)</h2>
        <p style={{ fontSize: 13, color: '#637381', marginBottom: 24, lineHeight: 1.5 }}>
          Single source of truth: <code>theme.layout.section.*</code> · 8 type fields → 10
          CSS variables (3 spacing + 3 resolved typography + 4 alignment). Container
          components (Modal · Drawer · Toast · Dialog · Card) consume these vars
          directly — never hardcode padding / gap / justify-content.
        </p>

        {/* Outer card — emulates a Modal/Dialog container */}
        <div
          style={{
            border: '1px solid #DFE3E8',
            borderRadius: 8,
            background: '#FFFFFF',
            boxShadow: '0 12px 24px -4px rgba(145, 158, 171, 0.12)',
            // Section flex column · gap drives Header↔Content↔Footer separation
            // (v1.1 default = 0 · each band owns its own paddingY now)
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--prismui-section-gap)',
            // v1.1 · padding-y is per-band (see each section below)
          }}
        >
          {/* Header band */}
          <div
            style={{
              display: 'flex',
              alignItems: 'var(--prismui-section-header-align)' as React.CSSProperties['alignItems'],
              justifyContent: 'var(--prismui-section-header-justify)' as React.CSSProperties['justifyContent'],
              paddingLeft: 'var(--prismui-section-padding-x)',
              paddingRight: 'var(--prismui-section-padding-x)',
              paddingTop: 'var(--prismui-section-header-padding-y)',
              paddingBottom: 'var(--prismui-section-header-padding-y)',
            }}
          >
            <div
              style={{
                fontSize: 'var(--prismui-section-title-font-size)' as React.CSSProperties['fontSize'],
                lineHeight: 'var(--prismui-section-title-line-height)' as React.CSSProperties['lineHeight'],
                fontWeight: 'var(--prismui-section-title-font-weight)' as React.CSSProperties['fontWeight'],
                color: '#1C252E',
              }}
            >
              Section Title
            </div>
            <button
              type="button"
              aria-label="Close"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: 18,
                lineHeight: 1,
                color: '#919EAB',
                padding: 4,
              }}
            >
              ×
            </button>
          </div>

          {/* Content band */}
          <div
            style={{
              paddingLeft: 'var(--prismui-section-padding-x)',
              paddingRight: 'var(--prismui-section-padding-x)',
              paddingTop: 'var(--prismui-section-content-padding-y)',
              paddingBottom: 'var(--prismui-section-content-padding-y)',
              overflowY: 'var(--prismui-section-content-scroll)' as React.CSSProperties['overflowY'],
              fontSize: 14,
              lineHeight: '20px',
              color: '#454F5B',
            }}
          >
            <p style={{ margin: 0 }}>
              Content band uses <code>--prismui-section-padding-x</code> for horizontal
              padding and <code>--prismui-section-content-scroll</code> for overflow handling.
              Long content scrolls within this band rather than the whole modal.
            </p>
          </div>

          {/* Footer band */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              justifyContent: 'var(--prismui-section-footer-justify)' as React.CSSProperties['justifyContent'],
              paddingLeft: 'var(--prismui-section-padding-x)',
              paddingRight: 'var(--prismui-section-padding-x)',
              paddingTop: 'var(--prismui-section-footer-padding-y)',
              paddingBottom: 'var(--prismui-section-footer-padding-y)',
            }}
          >
            <button
              type="button"
              style={{
                padding: '6px 14px',
                border: '1px solid #DFE3E8',
                borderRadius: 6,
                background: '#FFFFFF',
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              style={{
                padding: '6px 14px',
                border: '1px solid #0C68E9',
                borderRadius: 6,
                background: '#0C68E9',
                color: '#FFFFFF',
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              Confirm
            </button>
          </div>
        </div>

        {/* Variable audit table */}
        <div style={{ marginTop: 24, fontSize: 11, fontFamily: 'monospace', color: '#637381' }}>
          <p style={{ ...headingStyle, fontSize: 13, fontFamily: 'system-ui', color: '#212B36' }}>
            CSS variables driving this layout
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #DFE3E8' }}>
                <th style={{ padding: 6, color: '#454F5B' }}>Variable</th>
                <th style={{ padding: 6, color: '#454F5B' }}>Default</th>
                <th style={{ padding: 6, color: '#454F5B' }}>Source</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['--prismui-section-padding-x',          '1.5rem (24px)',  'spacing.lg'],
                ['--prismui-section-gap',                '0px',            'spacing.none (v1.1 default)'],
                ['--prismui-section-header-padding-y',   '1.5rem (24px)',  'spacing.lg (v1.1 · per-band)'],
                ['--prismui-section-content-padding-y',  '0px',            'spacing.none (v1.1 · per-band)'],
                ['--prismui-section-footer-padding-y',   '1.5rem (24px)',  'spacing.lg (v1.1 · per-band)'],
                ['--prismui-section-title-font-size',    '20px',           'typography.title.md'],
                ['--prismui-section-title-line-height',  '28px',           'typography.title.md'],
                ['--prismui-section-title-font-weight',  '600',            'typography.title.md'],
                ['--prismui-section-header-align',       'center',         'D-3 literal union'],
                ['--prismui-section-header-justify',     'space-between',  'D-3 literal union'],
                ['--prismui-section-footer-justify',     'flex-end',       'D-3 literal union'],
                ['--prismui-section-content-scroll',     'auto',           'D-3 literal union'],
              ].map(([name, def, src]) => (
                <tr key={name} style={{ borderBottom: '1px solid #F4F6F8' }}>
                  <td style={{ padding: 6, color: '#1C252E' }}>{name}</td>
                  <td style={{ padding: 6, color: '#454F5B' }}>{def}</td>
                  <td style={{ padding: 6, color: '#919EAB' }}>{src}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PrismUIProvider>
  ),
};
