import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Button } from './Button';
import { PrismUIProvider } from '../../core/theme/provider';
import { defaultTheme } from '../../core/theme/default-theme';
import { defaultLightPalette, defaultDarkPalette } from '../../core/theme/default-palette';
import type { PrismUITheme } from '../../core/theme/types';

const meta = {
  title: 'Components/ButtonWithTheme',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const containerStyle: React.CSSProperties = {
  padding: 24,
  fontFamily: '"Public Sans Variable", -apple-system, sans-serif',
  minHeight: '100vh',
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  color: '#919EAB',
  marginBottom: 8,
  display: 'block',
};

const noteStyle: React.CSSProperties = {
  marginTop: 16,
  padding: '10px 14px',
  background: '#F4F6F8',
  borderRadius: 6,
  fontSize: 11,
  color: '#637381',
  lineHeight: 1.6,
};

// ── Story 1: Current State ────────────────────────────────────────────────────
// Shows that current Button uses hardcoded hex colors, not CSS Variables.
// Changing PrismUIProvider theme has NO effect on button color.

export const CurrentState: Story = {
  render: () => (
    <PrismUIProvider colorScheme="light">
      <div style={containerStyle}>
        <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: '#1C252E' }}>
          Current State — Hardcoded Colors
        </h3>
        <p style={{ margin: '0 0 20px', fontSize: 12, color: '#637381' }}>
          Button's <code>varsResolver</code> uses hardcoded hex values, not <code>--prismui-color-*</code>.
          Changing the theme has no effect on button colors. This is by design — Stage 4 Step 4.2 will fix this.
        </p>

        <span style={labelStyle}>color="primary" → hardcoded #3b82f6 (not theme blue #0C68E9)</span>
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <Button color="primary" variant="filled">Primary Filled</Button>
          <Button color="primary" variant="outline">Primary Outline</Button>
          <Button color="primary" variant="subtle">Primary Subtle</Button>
        </div>

        <span style={labelStyle}>color="secondary" → hardcoded #6b7280 (not theme violet #8E33FF)</span>
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <Button color="secondary" variant="filled">Secondary Filled</Button>
          <Button color="secondary" variant="outline">Secondary Outline</Button>
        </div>

        <div style={noteStyle}>
          <strong>Architecture gap:</strong> <code>varsResolver</code> in <code>Button.tsx</code> uses a
          hardcoded <code>colorMap</code> dict. The <code>theme</code> param in{' '}
          <code>VarsResolver&lt;Props&gt;</code> is not yet consumed.
          This will be resolved in <strong>Stage 4 Step 4.2</strong> (variantColorResolver).
        </div>
      </div>
    </PrismUIProvider>
  ),
};

// ── Story 2: ThemeAwarePreview ────────────────────────────────────────────────
// Manual vars override to consume CSS Variables — preview of Stage 4 ideal state.

export const ThemeAwarePreview: Story = {
  render: () => (
    <PrismUIProvider colorScheme="light">
      <div style={containerStyle}>
        <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: '#1C252E' }}>
          Theme-Aware Preview (via vars override)
        </h3>
        <p style={{ margin: '0 0 20px', fontSize: 12, color: '#637381' }}>
          Manually passing <code>--prismui-color-*</code> through the <code>vars</code> prop to simulate
          what Stage 4 Step 4.2 will do automatically.
        </p>

        <span style={labelStyle}>filled — consumes --prismui-color-primary-high-bg/fg</span>
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <Button vars={{ '--button-bg': 'var(--prismui-color-primary-high-bg)', '--button-color': 'var(--prismui-color-primary-high-fg)', '--button-border': 'none' }}>
            Primary Filled
          </Button>
          <Button vars={{ '--button-bg': 'var(--prismui-color-secondary-high-bg)', '--button-color': 'var(--prismui-color-secondary-high-fg)', '--button-border': 'none' }}>
            Secondary Filled
          </Button>
          <Button vars={{ '--button-bg': 'var(--prismui-color-success-high-bg)', '--button-color': 'var(--prismui-color-success-high-fg)', '--button-border': 'none' }}>
            Success Filled
          </Button>
          <Button vars={{ '--button-bg': 'var(--prismui-color-warning-high-bg)', '--button-color': 'var(--prismui-color-warning-high-fg)', '--button-border': 'none' }}>
            Warning Filled
          </Button>
          <Button vars={{ '--button-bg': 'var(--prismui-color-error-high-bg)', '--button-color': 'var(--prismui-color-error-high-fg)', '--button-border': 'none' }}>
            Error Filled
          </Button>
        </div>

        <span style={labelStyle}>soft — consumes --prismui-color-primary-low-bg/fg</span>
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <Button vars={{ '--button-bg': 'var(--prismui-color-primary-low-bg)', '--button-color': 'var(--prismui-color-primary-low-fg)', '--button-border': 'none' }}>
            Primary Soft
          </Button>
          <Button vars={{ '--button-bg': 'var(--prismui-color-secondary-low-bg)', '--button-color': 'var(--prismui-color-secondary-low-fg)', '--button-border': 'none' }}>
            Secondary Soft
          </Button>
          <Button vars={{ '--button-bg': 'var(--prismui-color-success-low-bg)', '--button-color': 'var(--prismui-color-success-low-fg)', '--button-border': 'none' }}>
            Success Soft
          </Button>
        </div>

        <span style={labelStyle}>outlined — consumes --prismui-color-primary-bordered-*</span>
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <Button vars={{ '--button-bg': 'transparent', '--button-color': 'var(--prismui-color-primary-bordered-fg)', '--button-border': '1px solid var(--prismui-color-primary-bordered-border)' }}>
            Primary Outlined
          </Button>
          <Button vars={{ '--button-bg': 'transparent', '--button-color': 'var(--prismui-color-error-bordered-fg)', '--button-border': '1px solid var(--prismui-color-error-bordered-border)' }}>
            Error Outlined
          </Button>
        </div>

        <div style={noteStyle}>
          <strong>Stage 4 preview:</strong> In Step 4.2, <code>varsResolver</code> will receive{' '}
          <code>theme</code> as a second param and resolve color roles automatically.
          No more hardcoded hex. This demo proves the CSS Variables plumbing is already fully wired.
        </div>
      </div>
    </PrismUIProvider>
  ),
};

// ── Story 3: Light/Dark Theme Switch ─────────────────────────────────────────

export const LightDarkThemeSwitch: Story = {
  render: () => {
    const [scheme, setScheme] = useState<'light' | 'dark'>('light');
    const isDark = scheme === 'dark';

    return (
      <PrismUIProvider colorScheme={scheme}>
        <div style={{
          ...containerStyle,
          background: isDark ? '#141A21' : '#FFFFFF',
          transition: 'background 0.3s ease',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: isDark ? '#fff' : '#1C252E' }}>
              Light / Dark Switch
            </h3>
            <button
              onClick={() => setScheme(s => s === 'light' ? 'dark' : 'light')}
              style={{
                padding: '6px 16px',
                borderRadius: 6,
                border: '1px solid rgba(145,158,171,0.3)',
                background: isDark ? '#1C252E' : '#F4F6F8',
                color: isDark ? '#fff' : '#1C252E',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Switch to {isDark ? 'Light' : 'Dark'}
            </button>
          </div>

          <p style={{ margin: '0 0 20px', fontSize: 12, color: isDark ? '#919EAB' : '#637381' }}>
            Buttons below use <code>vars</code> override to consume CSS Variables.
            Toggle the scheme — CSS Variables update via <code>applyDiffCSSVariables</code> diff,
            only changed variables trigger <code>setProperty</code>.
          </p>

          <span style={{ ...labelStyle, color: isDark ? '#637381' : '#919EAB' }}>filled (high emphasis)</span>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            {(['primary', 'secondary', 'success', 'warning', 'error'] as const).map(color => (
              <Button
                key={color}
                vars={{
                  '--button-bg': `var(--prismui-color-${color}-high-bg)`,
                  '--button-color': `var(--prismui-color-${color}-high-fg)`,
                  '--button-border': 'none',
                }}
              >
                {color}
              </Button>
            ))}
          </div>

          <span style={{ ...labelStyle, color: isDark ? '#637381' : '#919EAB' }}>soft (low emphasis)</span>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            {(['primary', 'secondary', 'success', 'warning', 'error'] as const).map(color => (
              <Button
                key={color}
                vars={{
                  '--button-bg': `var(--prismui-color-${color}-low-bg)`,
                  '--button-color': `var(--prismui-color-${color}-low-fg)`,
                  '--button-border': 'none',
                }}
              >
                {color}
              </Button>
            ))}
          </div>
        </div>
      </PrismUIProvider>
    );
  },
};

// ── Story 4: Custom Theme ─────────────────────────────────────────────────────

const customTheme: PrismUITheme = {
  ...defaultTheme,
  palette: {
    light: {
      ...defaultLightPalette,
      primary: {
        ...defaultLightPalette.primary,
        base: 'colors.violet.500',
        hover: 'colors.violet.600',
        active: 'colors.violet.700',
        high: { bg: 'colors.violet.500', hoverBg: 'colors.violet.600', fg: 'colors.gray.50' },
        low: { bg: 'colors.violet.50', hoverBg: 'colors.violet.100', fg: 'colors.violet.700' },
        bordered: { border: 'colors.violet.300', fg: 'colors.violet.600', hoverBg: 'colors.violet.50' },
        minimal: { fg: 'colors.violet.600', hoverBg: 'colors.violet.50' },
      },
    },
    dark: defaultDarkPalette,
  },
};

export const CustomTheme: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 0, fontFamily: '"Public Sans Variable", sans-serif' }}>
      <div style={{ flex: 1, padding: 24, background: '#fff', borderRight: '1px solid #DFE3E8' }}>
        <h4 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: '#1C252E' }}>Default Theme</h4>
        <p style={{ margin: '0 0 16px', fontSize: 11, color: '#637381' }}>primary = blue family</p>
        <PrismUIProvider theme={defaultTheme} colorScheme="light">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Button vars={{ '--button-bg': 'var(--prismui-color-primary-high-bg)', '--button-color': 'var(--prismui-color-primary-high-fg)', '--button-border': 'none' }}>
              Primary Filled
            </Button>
            <Button vars={{ '--button-bg': 'var(--prismui-color-primary-low-bg)', '--button-color': 'var(--prismui-color-primary-low-fg)', '--button-border': 'none' }}>
              Primary Soft
            </Button>
            <Button vars={{ '--button-bg': 'transparent', '--button-color': 'var(--prismui-color-primary-bordered-fg)', '--button-border': '1px solid var(--prismui-color-primary-bordered-border)' }}>
              Primary Outlined
            </Button>
          </div>
        </PrismUIProvider>
      </div>

      <div style={{ flex: 1, padding: 24, background: '#fff' }}>
        <h4 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: '#1C252E' }}>Custom Theme</h4>
        <p style={{ margin: '0 0 16px', fontSize: 11, color: '#637381' }}>primary overridden → violet family</p>
        <PrismUIProvider theme={customTheme} colorScheme="light">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Button vars={{ '--button-bg': 'var(--prismui-color-primary-high-bg)', '--button-color': 'var(--prismui-color-primary-high-fg)', '--button-border': 'none' }}>
              Primary Filled
            </Button>
            <Button vars={{ '--button-bg': 'var(--prismui-color-primary-low-bg)', '--button-color': 'var(--prismui-color-primary-low-fg)', '--button-border': 'none' }}>
              Primary Soft
            </Button>
            <Button vars={{ '--button-bg': 'transparent', '--button-color': 'var(--prismui-color-primary-bordered-fg)', '--button-border': '1px solid var(--prismui-color-primary-bordered-border)' }}>
              Primary Outlined
            </Button>
          </div>
        </PrismUIProvider>
      </div>

      <div style={{ padding: 24, background: '#F4F6F8', maxWidth: 240 }}>
        <h4 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: '#454F5B' }}>What this proves</h4>
        <ul style={{ margin: 0, padding: '0 0 0 16px', fontSize: 11, color: '#637381', lineHeight: 1.8 }}>
          <li>PrismUITheme is fully replaceable (no merge)</li>
          <li>Two PrismUIProviders coexist on the same page</li>
          <li>CSS Variables inject to :root globally — the last one wins</li>
          <li>For true isolation, use the <code>target</code> prop (see SideBySide story)</li>
        </ul>
        <div style={{ marginTop: 12, padding: '8px 10px', background: '#FFE9D5', borderRadius: 6, fontSize: 11, color: '#B71D18' }}>
          ⚠️ Note: Both providers inject to :root here, so the custom theme (rendered last) will overwrite the default theme's CSS variables globally. Use <code>target</code> for true isolation.
        </div>
      </div>
    </div>
  ),
};
