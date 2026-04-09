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

function ColorSwatch({ varName, label }: { varName: string; label: string }) {
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
                g.vars(name).map((varName, i) => (
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

const spacingScales = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
const spacingValues: Record<string, string> = {
  xs: '0.25rem (4px)', sm: '0.5rem (8px)', md: '1rem (16px)', lg: '1.5rem (24px)', xl: '2rem (32px)',
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
