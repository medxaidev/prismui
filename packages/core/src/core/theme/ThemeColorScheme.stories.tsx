import type { Meta, StoryObj } from '@storybook/react';
import React, { useEffect, useRef, useState } from 'react';
import { PrismUIProvider } from './provider';

const meta = {
  title: 'Theme/ColorScheme',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Shared helpers ────────────────────────────────────────────────────────────

const semanticNames = ['primary', 'secondary', 'info', 'success', 'warning', 'error', 'neutral'] as const;

interface SwatchRowProps {
  name: string;
  /** root element that CSS variables are injected into (default: document.documentElement) */
  root?: HTMLElement | null;
}

function SwatchRow({ name, root }: SwatchRowProps) {
  const el = root ?? (typeof document !== 'undefined' ? document.documentElement : null);
  const [vars, setVars] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!el) return;
    const read = () => {
      const cs = getComputedStyle(el);
      setVars({
        base: cs.getPropertyValue(`--prismui-color-${name}`).trim(),
        hover: cs.getPropertyValue(`--prismui-color-${name}-hover`).trim(),
        highBg: cs.getPropertyValue(`--prismui-color-${name}-high-bg`).trim(),
        highFg: cs.getPropertyValue(`--prismui-color-${name}-high-fg`).trim(),
        lowBg: cs.getPropertyValue(`--prismui-color-${name}-low-bg`).trim(),
      });
    };
    // Small delay to ensure PrismUIProvider has injected vars
    const timer = setTimeout(read, 50);
    return () => clearTimeout(timer);
  }, [name, el]);

  const swatches: Array<{ key: string; cssVar: string }> = [
    { key: 'base', cssVar: `--prismui-color-${name}` },
    { key: 'hover', cssVar: `--prismui-color-${name}-hover` },
    { key: 'high-bg', cssVar: `--prismui-color-${name}-high-bg` },
    { key: 'high-fg', cssVar: `--prismui-color-${name}-high-fg` },
    { key: 'low-bg', cssVar: `--prismui-color-${name}-low-bg` },
    { key: 'low-fg', cssVar: `--prismui-color-${name}-low-fg` },
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#454F5B', width: 76, flexShrink: 0 }}>{name}</span>
      {swatches.map(({ key, cssVar }) => (
        <div key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <div
            title={cssVar}
            style={{
              width: 36,
              height: 36,
              borderRadius: 6,
              background: `var(${cssVar})`,
              border: '1px solid rgba(0,0,0,0.1)',
            }}
          />
          <span style={{ fontSize: 9, color: '#919EAB', textAlign: 'center', lineHeight: 1.2 }}>{key}</span>
        </div>
      ))}
    </div>
  );
}

function PaletteDisplay({ root }: { root?: HTMLElement | null }) {
  return (
    <div>
      {semanticNames.map(name => (
        <SwatchRow key={name} name={name} root={root} />
      ))}
    </div>
  );
}

// ── Story 1: Light Mode ───────────────────────────────────────────────────────

export const LightMode: Story = {
  render: () => (
    <PrismUIProvider colorScheme="light">
      <div style={{ padding: 24, background: '#FFFFFF', minHeight: '100vh', fontFamily: '"Public Sans Variable", sans-serif' }}>
        <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: '#1C252E' }}>Light Mode</h3>
        <p style={{ margin: '0 0 20px', fontSize: 12, color: '#637381' }}>
          colorScheme="light" — primary.base = blue.500 (#0C68E9), warning.high-fg = gray.800 (#1C252E)
        </p>
        <PaletteDisplay />
      </div>
    </PrismUIProvider>
  ),
};

// ── Story 2: Dark Mode ────────────────────────────────────────────────────────

export const DarkMode: Story = {
  render: () => (
    <PrismUIProvider colorScheme="dark">
      <div style={{ padding: 24, background: '#141A21', minHeight: '100vh', fontFamily: '"Public Sans Variable", sans-serif' }}>
        <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: '#FFFFFF' }}>Dark Mode</h3>
        <p style={{ margin: '0 0 20px', fontSize: 12, color: '#919EAB' }}>
          colorScheme="dark" — primary.base = blue.400 (#4594F1), lighter shades for dark backgrounds
        </p>
        <PaletteDisplay />
      </div>
    </PrismUIProvider>
  ),
};

// ── Story 3: Side By Side (dual Provider with target isolation) ───────────────

function ScopedPalettePanel({
  scheme,
  label,
  description,
  bg,
  textColor,
}: {
  scheme: 'light' | 'dark';
  label: string;
  description: string;
  bg: string;
  textColor: string;
}) {
  const [containerEl, setContainerEl] = useState<HTMLElement | null>(null);

  return (
    <div
      ref={(el) => setContainerEl(el)}
      style={{
        flex: 1,
        padding: 20,
        background: bg,
        borderRadius: 12,
        border: '1px solid rgba(0,0,0,0.08)',
        minWidth: 0,
      }}
    >
      {containerEl && (
        <PrismUIProvider colorScheme={scheme} target={containerEl}>
          <h4 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: textColor }}>{label}</h4>
          <p style={{ margin: '0 0 16px', fontSize: 11, color: textColor, opacity: 0.6 }}>{description}</p>
          <PaletteDisplay root={containerEl} />
        </PrismUIProvider>
      )}
    </div>
  );
}

export const SideBySide: Story = {
  render: () => (
    <div style={{ padding: 24, fontFamily: '"Public Sans Variable", sans-serif' }}>
      <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: '#1C252E' }}>
        Side-by-Side: Dual Provider with target Isolation
      </h3>
      <p style={{ margin: '0 0 20px', fontSize: 12, color: '#637381' }}>
        Two PrismUIProviders with independent CSS Variable scopes via the <code>target</code> prop.
        Each injects variables only into its own container element.
      </p>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <ScopedPalettePanel
          scheme="light"
          label="Light Mode"
          description="primary.base → blue.500 (#0C68E9)"
          bg="#FFFFFF"
          textColor="#1C252E"
        />
        <ScopedPalettePanel
          scheme="dark"
          label="Dark Mode"
          description="primary.base → blue.400 (#4594F1)"
          bg="#1C252E"
          textColor="#FFFFFF"
        />
      </div>
    </div>
  ),
};
