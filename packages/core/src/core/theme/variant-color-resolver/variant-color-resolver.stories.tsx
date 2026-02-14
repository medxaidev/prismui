import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PrismuiProvider } from '../../PrismuiProvider/PrismuiProvider';
import { createTheme } from '../create-theme';
import { defaultVariantColorsResolver } from './default-variant-colors-resolver';
import { getThemeColor } from '../get-theme-color';
import { getSize } from '../get-size';
import { getFontSize } from '../get-font-size';
import type { PrismuiTheme } from '../types';
import type { VariantColorResolverInput, VariantColorsResult } from './variant-color-resolver';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const theme = createTheme() as PrismuiTheme;

const VARIANTS = ['solid', 'outlined', 'soft', 'plain'] as const;
const COLORS = ['inherit', 'primary', 'secondary', 'info', 'success', 'warning', 'error', 'neutral', 'blue', 'red', 'black', 'white'] as const;

function resolve(variant: string, color: string, scheme: 'light' | 'dark' = 'light'): VariantColorsResult {
  return defaultVariantColorsResolver({
    variant: variant as VariantColorResolverInput['variant'],
    color,
    theme,
    scheme,
  });
}

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

const table: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 12,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
};

const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '6px 8px',
  borderBottom: '2px solid #e5e7eb',
  fontSize: 11,
  fontWeight: 600,
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const td: React.CSSProperties = {
  padding: '6px 8px',
  borderBottom: '1px solid #f3f4f6',
  maxWidth: 280,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const truncate = (s: string, max = 60) => s.length > max ? s.slice(0, max) + '…' : s;

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta = {
  title: 'Theme/VariantColorResolver',
};

export default meta;
type Story = StoryObj;

// ---------------------------------------------------------------------------
// Story 1: Full Variant × Color Matrix (Light)
// ---------------------------------------------------------------------------

export const VariantColorMatrix: Story = {
  name: 'Variant × Color Matrix (Light)',
  render: () => (
    <PrismuiProvider>
      <div style={card}>
        <h3 style={{ margin: '0 0 12px' }}>defaultVariantColorsResolver — Light Scheme</h3>
        <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 16px' }}>
          4 variants × 12 color types. Each cell shows the resolved CSS values.
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Color</th>
                <th style={th}>Variant</th>
                <th style={th}>background</th>
                <th style={th}>color</th>
                <th style={th}>border</th>
                <th style={th}>hoverBg</th>
                <th style={th}>hoverShadow</th>
              </tr>
            </thead>
            <tbody>
              {COLORS.map((color) =>
                VARIANTS.map((variant, vi) => {
                  const r = resolve(variant, color);
                  return (
                    <tr key={`${color}-${variant}`} style={vi === 0 ? { borderTop: '2px solid #e5e7eb' } : undefined}>
                      {vi === 0 && (
                        <td style={{ ...td, fontWeight: 700, verticalAlign: 'top' }} rowSpan={4}>
                          {color}
                        </td>
                      )}
                      <td style={{ ...td, fontWeight: 600 }}>{variant}</td>
                      <td style={td} title={r.background}>{truncate(r.background)}</td>
                      <td style={td} title={r.color}>{truncate(r.color)}</td>
                      <td style={td} title={r.border}>{truncate(r.border, 40)}</td>
                      <td style={td} title={r.hoverBackground}>{truncate(r.hoverBackground)}</td>
                      <td style={td} title={r.hoverShadow}>{truncate(r.hoverShadow, 40)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PrismuiProvider>
  ),
};

// ---------------------------------------------------------------------------
// Story 2: Dark Scheme Comparison
// ---------------------------------------------------------------------------

export const DarkSchemeComparison: Story = {
  name: 'Light vs Dark Scheme',
  render: () => {
    const colors = ['primary', 'blue', 'black', 'white'] as const;
    return (
      <PrismuiProvider>
        <div style={card}>
          <h3 style={{ margin: '0 0 12px' }}>Light vs Dark — Solid Variant</h3>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 16px' }}>
            Shows how shade selection differs between light (center=5) and dark (center=6) schemes.
          </p>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Color</th>
                <th style={th}>Scheme</th>
                <th style={th}>background</th>
                <th style={th}>hoverBackground</th>
                <th style={th}>hoverShadow</th>
              </tr>
            </thead>
            <tbody>
              {colors.map((color) =>
                (['light', 'dark'] as const).map((scheme, si) => {
                  const r = resolve('solid', color, scheme);
                  return (
                    <tr key={`${color}-${scheme}`} style={si === 0 ? { borderTop: '2px solid #e5e7eb' } : undefined}>
                      {si === 0 && (
                        <td style={{ ...td, fontWeight: 700, verticalAlign: 'top' }} rowSpan={2}>{color}</td>
                      )}
                      <td style={{ ...td, fontWeight: 600 }}>{scheme}</td>
                      <td style={td}>{truncate(r.background)}</td>
                      <td style={td}>{truncate(r.hoverBackground)}</td>
                      <td style={td}>{truncate(r.hoverShadow, 40)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </PrismuiProvider>
    );
  },
};

// ---------------------------------------------------------------------------
// Story 3: Visual Preview (Simulated Buttons)
// ---------------------------------------------------------------------------

export const VisualPreview: Story = {
  name: 'Visual Preview (Simulated)',
  render: () => {
    const previewColors = ['primary', 'secondary', 'success', 'error', 'warning', 'info'] as const;
    return (
      <PrismuiProvider>
        <div style={card}>
          <h3 style={{ margin: '0 0 16px' }}>Visual Preview — Simulated Buttons</h3>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 16px' }}>
            Each row shows a simulated button using resolved variant colors.
            Note: these use hardcoded palette values, not CSS variables (for Storybook preview only).
          </p>
          {VARIANTS.map((variant) => (
            <div key={variant} style={{ marginBottom: 16 }}>
              <h4 style={{ margin: '0 0 8px', fontSize: 13, color: '#374151', textTransform: 'capitalize' }}>
                {variant}
              </h4>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {previewColors.map((color) => {
                  const r = resolve(variant, color);
                  const bg = r.background.startsWith('var(') ? getPreviewColor(variant, color) : r.background;
                  const fg = r.color.startsWith('var(') ? getPreviewTextColor(variant, color) : r.color;
                  const border = r.border === 'none' ? 'none' : `1px solid ${fg}`;
                  return (
                    <button
                      key={color}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 6,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: bg,
                        color: fg,
                        border,
                        opacity: bg === 'transparent' ? 1 : undefined,
                      }}
                    >
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </PrismuiProvider>
    );
  },
};

function getPreviewColor(variant: string, color: string): string {
  const colorMap: Record<string, string> = {
    primary: '#0C68E9', secondary: '#8E33FF', success: '#22C55E',
    error: '#FF5630', warning: '#FFAB00', info: '#00B8D9',
  };
  const base = colorMap[color] || '#0C68E9';
  if (variant === 'solid') return base;
  if (variant === 'soft') return base + '26'; // ~15% opacity
  return 'transparent';
}

function getPreviewTextColor(variant: string, color: string): string {
  const colorMap: Record<string, string> = {
    primary: '#0C68E9', secondary: '#8E33FF', success: '#22C55E',
    error: '#FF5630', warning: '#FFAB00', info: '#00B8D9',
  };
  if (variant === 'solid') return '#FFFFFF';
  return colorMap[color] || '#0C68E9';
}

// ---------------------------------------------------------------------------
// Story 4: Custom variantColorResolver
// ---------------------------------------------------------------------------

export const CustomResolver: Story = {
  name: 'Custom variantColorResolver',
  render: () => {
    const customResolver = (input: VariantColorResolverInput): VariantColorsResult => {
      if (input.variant === 'solid' && input.color === 'primary') {
        return {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#FFFFFF',
          border: 'none',
          hoverBackground: 'linear-gradient(135deg, #5a6fd6 0%, #6a4294 100%)',
          hoverColor: '',
          hoverBorder: '',
          hoverShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
        };
      }
      return defaultVariantColorsResolver(input);
    };

    const customTheme = createTheme({ variantColorResolver: customResolver }) as PrismuiTheme;
    const result = customTheme.variantColorResolver({
      variant: 'solid', color: 'primary', theme: customTheme, scheme: 'light',
    });
    const fallback = customTheme.variantColorResolver({
      variant: 'outlined', color: 'primary', theme: customTheme, scheme: 'light',
    });

    return (
      <PrismuiProvider>
        <div style={card}>
          <h3 style={{ margin: '0 0 12px' }}>Custom variantColorResolver</h3>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 16px' }}>
            Override <code>solid + primary</code> with a gradient, while other combinations fall back to default.
          </p>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <button style={{
              padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600,
              cursor: 'pointer', background: result.background, color: result.color, border: 'none',
            }}>
              Gradient Primary (custom)
            </button>
            <button style={{
              padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600,
              cursor: 'pointer', background: 'transparent', color: '#0C68E9',
              border: '1px solid #0C68E9',
            }}>
              Outlined Primary (default fallback)
            </button>
          </div>
          <pre style={{ fontSize: 11, background: '#f9fafb', padding: 12, borderRadius: 6, overflow: 'auto' }}>
            {JSON.stringify({ custom: result, fallback }, null, 2)}
          </pre>
        </div>
      </PrismuiProvider>
    );
  },
};

// ---------------------------------------------------------------------------
// Story 5: getThemeColor
// ---------------------------------------------------------------------------

export const GetThemeColorDemo: Story = {
  name: 'getThemeColor',
  render: () => {
    const examples = [
      { input: 'primary', expected: 'var(--prismui-primary-main)' },
      { input: 'primary.dark', expected: 'var(--prismui-primary-dark)' },
      { input: 'primary.mainChannel', expected: 'var(--prismui-primary-mainChannel)' },
      { input: 'blue.500', expected: 'var(--prismui-color-blue-500)' },
      { input: 'blue', expected: 'var(--prismui-color-blue-500)' },
      { input: 'text.primary', expected: 'var(--prismui-text-primary)' },
      { input: 'background.paper', expected: 'var(--prismui-background-paper)' },
      { input: 'common.black', expected: 'var(--prismui-common-black)' },
      { input: 'divider', expected: 'var(--prismui-divider)' },
      { input: '#ff0000', expected: '#ff0000' },
      { input: 'rgb(255, 0, 0)', expected: 'rgb(255, 0, 0)' },
      { input: 'transparent', expected: 'transparent' },
      { input: 'inherit', expected: 'inherit' },
    ];

    return (
      <PrismuiProvider>
        <div style={card}>
          <h3 style={{ margin: '0 0 12px' }}>getThemeColor</h3>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 16px' }}>
            Resolves color strings to CSS variable references or passes through raw CSS values.
          </p>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Input</th>
                <th style={th}>Output</th>
                <th style={th}>Match?</th>
              </tr>
            </thead>
            <tbody>
              {examples.map(({ input, expected }) => {
                const actual = getThemeColor(input, theme);
                const match = actual === expected;
                return (
                  <tr key={input}>
                    <td style={{ ...td, fontWeight: 600 }}>{input}</td>
                    <td style={td}>{actual}</td>
                    <td style={{ ...td, color: match ? '#16a34a' : '#dc2626' }}>{match ? '✅' : `❌ expected: ${expected}`}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </PrismuiProvider>
    );
  },
};

// ---------------------------------------------------------------------------
// Story 6: getSize / getFontSize
// ---------------------------------------------------------------------------

export const GetSizeDemo: Story = {
  name: 'getSize / getFontSize',
  render: () => {
    const sizeExamples = [
      { fn: 'getSize', input: "'xs', 'button-height'", result: getSize('xs', 'button-height') },
      { fn: 'getSize', input: "'md', 'button-height'", result: getSize('md', 'button-height') },
      { fn: 'getSize', input: "'xl', 'container-size'", result: getSize('xl', 'container-size') },
      { fn: 'getSize', input: "42, 'button-height'", result: getSize(42, 'button-height') },
      { fn: 'getSize', input: "'36px', 'button-height'", result: getSize('36px', 'button-height') },
      { fn: 'getSize', input: "undefined, 'button-height'", result: String(getSize(undefined, 'button-height')) },
      { fn: 'getFontSize', input: "'xs'", result: getFontSize('xs') },
      { fn: 'getFontSize', input: "'md'", result: getFontSize('md') },
      { fn: 'getFontSize', input: "'xl'", result: getFontSize('xl') },
      { fn: 'getFontSize', input: '14', result: getFontSize(14) },
      { fn: 'getFontSize', input: "'16px'", result: getFontSize('16px') },
    ];

    return (
      <PrismuiProvider>
        <div style={card}>
          <h3 style={{ margin: '0 0 12px' }}>getSize / getFontSize</h3>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 16px' }}>
            Resolve size tokens to CSS variable references. Named keys → <code>var(--prefix-key)</code>, numbers/strings → <code>rem()</code>.
          </p>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Function</th>
                <th style={th}>Input</th>
                <th style={th}>Output</th>
              </tr>
            </thead>
            <tbody>
              {sizeExamples.map(({ fn, input, result }, i) => (
                <tr key={i}>
                  <td style={{ ...td, fontWeight: 600 }}>{fn}</td>
                  <td style={td}>{input}</td>
                  <td style={td}>{result ?? 'undefined'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PrismuiProvider>
    );
  },
};

// ---------------------------------------------------------------------------
// Story 7: Headless Mode
// ---------------------------------------------------------------------------

export const HeadlessMode: Story = {
  name: 'Headless Mode',
  render: () => (
    <div style={card}>
      <h3 style={{ margin: '0 0 12px' }}>Headless Mode</h3>
      <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 16px' }}>
        <code>{'<PrismuiProvider headless>'}</code> sets global headless mode.
        All components skip CSS Module classes. <code>useIsHeadless(unstyled?)</code> returns
        <code> true</code> when either provider-level <code>headless</code> or component-level <code>unstyled</code> is true.
      </p>
      <div style={{ display: 'flex', gap: 24 }}>
        <div>
          <h4 style={{ margin: '0 0 8px', fontSize: 13 }}>Normal Mode</h4>
          <PrismuiProvider>
            <div style={{ padding: 12, background: '#f0fdf4', borderRadius: 6, fontSize: 13 }}>
              Components render with full CSS Module classes + static classes.
            </div>
          </PrismuiProvider>
        </div>
        <div>
          <h4 style={{ margin: '0 0 8px', fontSize: 13 }}>Headless Mode</h4>
          <PrismuiProvider headless>
            <div style={{ padding: 12, background: '#fef2f2', borderRadius: 6, fontSize: 13 }}>
              Components render without CSS Module classes. Only static classes + user className remain.
            </div>
          </PrismuiProvider>
        </div>
      </div>
      <div style={{ marginTop: 16, padding: 12, background: '#f9fafb', borderRadius: 6 }}>
        <h4 style={{ margin: '0 0 8px', fontSize: 13 }}>Architecture</h4>
        <pre style={{ fontSize: 11, margin: 0 }}>{`// Provider level
<PrismuiProvider headless>  // sets context.headless = true

// Component level
const isHeadless = useIsHeadless(props.unstyled);
// true if provider headless=true OR component unstyled=true

// In useStyles
// When headless: getSelectorClassName() returns undefined
//                getVariantClassName() returns undefined
//                Static classes (prismui-Button-root) preserved`}</pre>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 8: Opacity CSS Variables
// ---------------------------------------------------------------------------

export const OpacityVariables: Story = {
  name: 'Variant Opacity Variables',
  render: () => {
    const opacityVars = [
      { name: '--prismui-opacity-solid-commonHoverBg', value: '0.72', usage: 'solid black/white hover background' },
      { name: '--prismui-opacity-outlined-border', value: '0.48', usage: 'outlined border opacity via color-mix' },
      { name: '--prismui-opacity-soft-bg', value: '0.16', usage: 'soft variant background' },
      { name: '--prismui-opacity-soft-hoverBg', value: '0.32', usage: 'soft variant hover background' },
      { name: '--prismui-opacity-soft-commonBg', value: '0.08', usage: 'soft black/white background' },
      { name: '--prismui-opacity-soft-commonHoverBg', value: '0.16', usage: 'soft black/white hover background' },
      { name: '--prismui-opacity-soft-border', value: '0.24', usage: 'soft variant border (if needed)' },
    ];

    const channelVars = [
      { name: '--prismui-common-blackChannel', value: '0 0 0', usage: 'rgba() for black with opacity' },
      { name: '--prismui-common-whiteChannel', value: '255 255 255', usage: 'rgba() for white with opacity' },
      { name: '--prismui-color-gray-500Channel', value: '145 158 171', usage: 'inherit variant borders/backgrounds' },
    ];

    return (
      <PrismuiProvider>
        <div style={card}>
          <h3 style={{ margin: '0 0 12px' }}>Variant Opacity CSS Variables</h3>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 16px' }}>
            These CSS variables control opacity values used by the variant color system.
            Users can override them in <code>createTheme()</code> via <code>palette.variantOpacity</code>.
          </p>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>CSS Variable</th>
                <th style={th}>Default</th>
                <th style={th}>Usage</th>
              </tr>
            </thead>
            <tbody>
              {opacityVars.map(({ name, value, usage }) => (
                <tr key={name}>
                  <td style={{ ...td, fontWeight: 600, fontSize: 11 }}>{name}</td>
                  <td style={td}>{value}</td>
                  <td style={{ ...td, color: '#6b7280' }}>{usage}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h4 style={{ margin: '16px 0 8px', fontSize: 13 }}>Channel Variables</h4>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>CSS Variable</th>
                <th style={th}>Default</th>
                <th style={th}>Usage</th>
              </tr>
            </thead>
            <tbody>
              {channelVars.map(({ name, value, usage }) => (
                <tr key={name}>
                  <td style={{ ...td, fontWeight: 600, fontSize: 11 }}>{name}</td>
                  <td style={td}>{value}</td>
                  <td style={{ ...td, color: '#6b7280' }}>{usage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PrismuiProvider>
    );
  },
};
