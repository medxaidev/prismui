import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { useState } from 'react';
import { PrismuiProvider } from './PrismuiProvider';
import { PrismuiThemeProvider } from './PrismuiThemeProvider';
import { usePrismuiTheme, useTheme, useColorScheme } from './prismui-theme-context';
import { localStorageColorSchemeManager } from './color-scheme-manager';
import type { PrismuiColorScheme } from '../theme';
import { getPrismuiThemeCssText } from '../css-vars';

// ---------------------------------------------------------------------------
// Helpers — reusable display components for stories
// ---------------------------------------------------------------------------

function ThemeInfo() {
  const { theme, colorScheme } = usePrismuiTheme();
  return (
    <div style={{ fontFamily: 'monospace', fontSize: 13, lineHeight: 1.8 }}>
      <div><strong>colorScheme:</strong> {colorScheme}</div>
      <div><strong>primaryColor:</strong> {theme.primaryColor}</div>
      <div><strong>secondaryColor:</strong> {theme.secondaryColor}</div>
      <div>
        <strong>data-prismui-color-scheme:</strong>{' '}
        {document.documentElement.getAttribute('data-prismui-color-scheme') ?? '(not set)'}
      </div>
    </div>
  );
}

function ColorSwatches() {
  const swatches = [
    { label: 'primary-main', var: '--prismui-primary-main' },
    { label: 'primary-light', var: '--prismui-primary-light' },
    { label: 'primary-dark', var: '--prismui-primary-dark' },
    { label: 'secondary-main', var: '--prismui-secondary-main' },
    { label: 'info-main', var: '--prismui-info-main' },
    { label: 'success-main', var: '--prismui-success-main' },
    { label: 'warning-main', var: '--prismui-warning-main' },
    { label: 'error-main', var: '--prismui-error-main' },
  ];

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
      {swatches.map((s) => (
        <div key={s.label} style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 8,
              backgroundColor: `var(${s.var})`,
              border: '1px solid #ccc',
            }}
          />
          <div style={{ fontSize: 10, marginTop: 4, fontFamily: 'monospace' }}>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// 1. PrismuiProvider Stories
// ============================================================================

const meta: Meta<typeof PrismuiProvider> = {
  title: 'Core/PrismuiProvider',
  component: PrismuiProvider,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof PrismuiProvider>;

// ---- Default ---------------------------------------------------------------

export const Default: Story = {
  render: () => (
    <PrismuiProvider>
      <h3>Default Provider</h3>
      <ThemeInfo />
      <ColorSwatches />
    </PrismuiProvider>
  ),
};

// ---- CSS Variables Output ---------------------------------------------------

function CssVarsDisplay() {
  const { theme, colorScheme } = usePrismuiTheme();
  const cssText = getPrismuiThemeCssText(theme, colorScheme);

  return (
    <div>
      <h3>CSS Variables Output ({colorScheme})</h3>
      <pre
        style={{
          background: '#1e1e2e',
          color: '#cdd6f4',
          padding: 16,
          borderRadius: 8,
          fontSize: 12,
          lineHeight: 1.6,
          maxHeight: '80vh',
          overflow: 'auto',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
        }}
      >
        {cssText}
      </pre>
    </div>
  );
}

export const CssVariablesOutput: Story = {
  name: 'CSS Variables Output (Light)',
  render: () => (
    <PrismuiProvider>
      <CssVarsDisplay />
    </PrismuiProvider>
  ),
};

export const CssVariablesOutputDark: Story = {
  name: 'CSS Variables Output (Dark)',
  render: () => (
    <PrismuiProvider forceColorScheme="dark">
      <CssVarsDisplay />
    </PrismuiProvider>
  ),
};

// ---- Dark scheme -----------------------------------------------------------

export const DarkScheme: Story = {
  render: () => (
    <PrismuiProvider defaultColorScheme="dark">
      <div
        style={{
          background: '#1a1a2e',
          color: '#eee',
          padding: 16,
          borderRadius: 8,
        }}
      >
        <h3>Dark Scheme</h3>
        <ThemeInfo />
        <ColorSwatches />
      </div>
    </PrismuiProvider>
  ),
};

// ---- Force color scheme ----------------------------------------------------

export const ForceColorScheme: Story = {
  render: () => (
    <PrismuiProvider forceColorScheme="dark">
      <div style={{ background: '#1a1a2e', color: '#eee', padding: 16, borderRadius: 8 }}>
        <h3>Forced Dark (setColorScheme ignored)</h3>
        <ForceDemo />
      </div>
    </PrismuiProvider>
  ),
};

function ForceDemo() {
  const { colorScheme, setColorScheme } = usePrismuiTheme();
  return (
    <div>
      <ThemeInfo />
      <p style={{ marginTop: 8, fontSize: 13 }}>
        Clicking the button calls <code>setColorScheme('light')</code>, but
        it should have no effect because <code>forceColorScheme="dark"</code>.
      </p>
      <button onClick={() => setColorScheme('light')} style={{ marginTop: 8 }}>
        Try switch to light (should be ignored)
      </button>
      <div style={{ marginTop: 8, fontFamily: 'monospace' }}>
        Current: <strong>{colorScheme}</strong>
      </div>
    </div>
  );
}

// ---- Theme overrides -------------------------------------------------------

export const ThemeOverrides: Story = {
  render: () => (
    <PrismuiProvider theme={{ primaryColor: 'indigo', secondaryColor: 'orange' }}>
      <h3>Custom Theme (primaryColor: indigo, secondaryColor: orange)</h3>
      <ThemeInfo />
      <ColorSwatches />
    </PrismuiProvider>
  ),
};

// ---- Without CSS vars / baseline -------------------------------------------

export const WithoutCssVarsAndBaseline: Story = {
  render: () => (
    <PrismuiProvider withCssVars={false} withCssBaseline={false}>
      <h3>No CSS Vars, No Baseline</h3>
      <ThemeInfo />
      <p style={{ fontSize: 13, fontFamily: 'monospace', marginTop: 8 }}>
        CSS variables are <strong>not</strong> injected. Swatches below should
        show no color (transparent / fallback).
      </p>
      <ColorSwatches />
    </PrismuiProvider>
  ),
};

// ============================================================================
// 2. useProviderColorScheme — interactive color scheme toggle stories
// ============================================================================

export const ColorSchemeToggle: Story = {
  render: () => (
    <PrismuiProvider defaultColorScheme="light">
      <ColorSchemeToggleDemo />
    </PrismuiProvider>
  ),
};

function ColorSchemeToggleDemo() {
  const [scheme, setScheme] = useColorScheme();

  return (
    <div
      style={{
        background: scheme === 'dark' ? '#1a1a2e' : '#fff',
        color: scheme === 'dark' ? '#eee' : '#111',
        padding: 16,
        borderRadius: 8,
        transition: 'all 0.3s',
      }}
    >
      <h3>Color Scheme Toggle</h3>
      <ThemeInfo />
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button
          onClick={() => setScheme('light')}
          style={{
            padding: '6px 16px',
            fontWeight: scheme === 'light' ? 'bold' : 'normal',
            border: scheme === 'light' ? '2px solid #1976d2' : '1px solid #ccc',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          ☀️ Light
        </button>
        <button
          onClick={() => setScheme('dark')}
          style={{
            padding: '6px 16px',
            fontWeight: scheme === 'dark' ? 'bold' : 'normal',
            border: scheme === 'dark' ? '2px solid #90caf9' : '1px solid #ccc',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          🌙 Dark
        </button>
        <button
          onClick={() => setScheme('auto')}
          style={{
            padding: '6px 16px',
            border: '1px solid #ccc',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          🖥️ Auto (system)
        </button>
      </div>
      <ColorSwatches />
    </div>
  );
}

// ---- With localStorage manager ---------------------------------------------

export const WithLocalStorageManager: Story = {
  render: () => (
    <PrismuiProvider
      colorSchemeManager={localStorageColorSchemeManager({ key: 'storybook-demo-scheme' })}
      defaultColorScheme="light"
    >
      <LocalStorageDemo />
    </PrismuiProvider>
  ),
};

function LocalStorageDemo() {
  const { colorScheme, setColorScheme, clearColorScheme } = usePrismuiTheme();
  const storageKey = 'storybook-demo-scheme';
  const [storedValue, setStoredValue] = useState(
    () => localStorage.getItem(storageKey) ?? '(empty)',
  );

  const refresh = () => setStoredValue(localStorage.getItem(storageKey) ?? '(empty)');

  return (
    <div
      style={{
        background: colorScheme === 'dark' ? '#1a1a2e' : '#fff',
        color: colorScheme === 'dark' ? '#eee' : '#111',
        padding: 16,
        borderRadius: 8,
        transition: 'all 0.3s',
      }}
    >
      <h3>localStorage Color Scheme Manager</h3>
      <ThemeInfo />

      <div
        style={{
          marginTop: 12,
          padding: 12,
          background: colorScheme === 'dark' ? '#16213e' : '#f5f5f5',
          borderRadius: 6,
          fontFamily: 'monospace',
          fontSize: 13,
        }}
      >
        <div>
          <strong>localStorage['{storageKey}']:</strong> {storedValue}
        </div>
        <button onClick={refresh} style={{ marginTop: 4, fontSize: 12, cursor: 'pointer' }}>
          🔄 Refresh stored value
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button
          onClick={() => { setColorScheme('light'); setTimeout(refresh, 50); }}
          style={{ padding: '6px 16px', borderRadius: 6, cursor: 'pointer' }}
        >
          ☀️ Light
        </button>
        <button
          onClick={() => { setColorScheme('dark'); setTimeout(refresh, 50); }}
          style={{ padding: '6px 16px', borderRadius: 6, cursor: 'pointer' }}
        >
          🌙 Dark
        </button>
        <button
          onClick={() => { setColorScheme('auto'); setTimeout(refresh, 50); }}
          style={{ padding: '6px 16px', borderRadius: 6, cursor: 'pointer' }}
        >
          🖥️ Auto
        </button>
        <button
          onClick={() => { clearColorScheme(); setTimeout(refresh, 50); }}
          style={{ padding: '6px 16px', borderRadius: 6, cursor: 'pointer', color: 'red' }}
        >
          ✕ Clear (reset)
        </button>
      </div>

      <ColorSwatches />
    </div>
  );
}

// ---- clearColorScheme demo -------------------------------------------------

export const ClearColorScheme: Story = {
  render: () => (
    <PrismuiProvider defaultColorScheme="light">
      <ClearDemo />
    </PrismuiProvider>
  ),
};

function ClearDemo() {
  const { colorScheme, setColorScheme, clearColorScheme } = usePrismuiTheme();

  return (
    <div
      style={{
        background: colorScheme === 'dark' ? '#1a1a2e' : '#fff',
        color: colorScheme === 'dark' ? '#eee' : '#111',
        padding: 16,
        borderRadius: 8,
        transition: 'all 0.3s',
      }}
    >
      <h3>clearColorScheme Demo</h3>
      <p style={{ fontSize: 13 }}>
        Switch to dark, then click "Clear" to reset back to the default (light).
      </p>
      <ThemeInfo />
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button
          onClick={() => setColorScheme('dark')}
          style={{ padding: '6px 16px', borderRadius: 6, cursor: 'pointer' }}
        >
          🌙 Switch to Dark
        </button>
        <button
          onClick={() => clearColorScheme()}
          style={{ padding: '6px 16px', borderRadius: 6, cursor: 'pointer', color: 'red' }}
        >
          ✕ Clear (reset to default)
        </button>
      </div>
    </div>
  );
}
