import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PrismuiProvider } from '../../core/PrismuiProvider/PrismuiProvider';
import { createTheme } from '../../core/theme/create-theme';
import { Stack } from './Stack';

const meta: Meta<typeof Stack> = {
  title: 'Components/Stack',
  component: Stack,
  decorators: [
    (Story) => (
      <PrismuiProvider>
        <Story />
      </PrismuiProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Stack>;

// ---------------------------------------------------------------------------
// Helper: colored box for visual clarity
// ---------------------------------------------------------------------------

function ColorBox({ children, color = '#228be6' }: { children: React.ReactNode; color?: string }) {
  return (
    <div
      style={{
        padding: '12px 16px',
        background: color,
        color: '#fff',
        borderRadius: 4,
        fontFamily: 'sans-serif',
        fontSize: 14,
      }}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 1. Basic usage — default gap, align, justify
// ---------------------------------------------------------------------------

export const Basic: Story = {
  render: () => (
    <div style={{ padding: 40 }}>
      <h3 style={{ fontFamily: 'sans-serif', marginBottom: 16 }}>Stack — Basic (gap: md)</h3>
      <Stack>
        <ColorBox>Item 1</ColorBox>
        <ColorBox>Item 2</ColorBox>
        <ColorBox>Item 3</ColorBox>
      </Stack>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 2. Custom gap
// ---------------------------------------------------------------------------

export const CustomGap: Story = {
  render: () => (
    <div style={{ padding: 40 }}>
      <h3 style={{ fontFamily: 'sans-serif', marginBottom: 16 }}>Stack — Custom Gaps</h3>
      <div style={{ display: 'flex', gap: 40 }}>
        <div>
          <p style={{ fontFamily: 'sans-serif', fontSize: 12, color: '#666' }}>gap=&quot;0px&quot;</p>
          <Stack gap="0px">
            <ColorBox color="#e64980">A</ColorBox>
            <ColorBox color="#e64980">B</ColorBox>
            <ColorBox color="#e64980">C</ColorBox>
          </Stack>
        </div>
        <div>
          <p style={{ fontFamily: 'sans-serif', fontSize: 12, color: '#666' }}>gap=&quot;sm&quot;</p>
          <Stack gap="sm">
            <ColorBox color="#7950f2">A</ColorBox>
            <ColorBox color="#7950f2">B</ColorBox>
            <ColorBox color="#7950f2">C</ColorBox>
          </Stack>
        </div>
        <div>
          <p style={{ fontFamily: 'sans-serif', fontSize: 12, color: '#666' }}>gap={'{32}'}</p>
          <Stack gap={32}>
            <ColorBox color="#40c057">A</ColorBox>
            <ColorBox color="#40c057">B</ColorBox>
            <ColorBox color="#40c057">C</ColorBox>
          </Stack>
        </div>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 3. Align and Justify
// ---------------------------------------------------------------------------

export const AlignAndJustify: Story = {
  render: () => (
    <div style={{ padding: 40 }}>
      <h3 style={{ fontFamily: 'sans-serif', marginBottom: 16 }}>Stack — Align &amp; Justify</h3>
      <div style={{ display: 'flex', gap: 40 }}>
        <div>
          <p style={{ fontFamily: 'sans-serif', fontSize: 12, color: '#666' }}>align=&quot;center&quot;</p>
          <Stack align="center" style={{ border: '1px dashed #ccc', padding: 8, width: 200 }}>
            <ColorBox color="#fd7e14">Short</ColorBox>
            <ColorBox color="#fd7e14">A longer item</ColorBox>
            <ColorBox color="#fd7e14">Med</ColorBox>
          </Stack>
        </div>
        <div>
          <p style={{ fontFamily: 'sans-serif', fontSize: 12, color: '#666' }}>align=&quot;flex-end&quot;</p>
          <Stack align="flex-end" style={{ border: '1px dashed #ccc', padding: 8, width: 200 }}>
            <ColorBox color="#15aabf">Short</ColorBox>
            <ColorBox color="#15aabf">A longer item</ColorBox>
            <ColorBox color="#15aabf">Med</ColorBox>
          </Stack>
        </div>
        <div>
          <p style={{ fontFamily: 'sans-serif', fontSize: 12, color: '#666' }}>justify=&quot;center&quot; (h=300)</p>
          <Stack justify="center" style={{ border: '1px dashed #ccc', padding: 8, height: 300 }}>
            <ColorBox color="#be4bdb">A</ColorBox>
            <ColorBox color="#be4bdb">B</ColorBox>
          </Stack>
        </div>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 4. CSS Variables inspection
// ---------------------------------------------------------------------------

export const CSSVariables: Story = {
  render: () => (
    <div style={{ padding: 40 }}>
      <h3 style={{ fontFamily: 'sans-serif', marginBottom: 16 }}>Stack — CSS Variables (inspect element)</h3>
      <p style={{ fontFamily: 'sans-serif', fontSize: 13, color: '#666', marginBottom: 12 }}>
        Open DevTools → inspect the Stack div → check inline style for --stack-gap, --stack-align, --stack-justify
      </p>
      <Stack gap="24px" align="center" justify="space-around" style={{ border: '2px solid #228be6', padding: 16, height: 250 }}>
        <ColorBox>Check my CSS vars</ColorBox>
        <ColorBox>in DevTools</ColorBox>
      </Stack>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 5. Unstyled mode
// ---------------------------------------------------------------------------

export const Unstyled: Story = {
  render: () => (
    <div style={{ padding: 40 }}>
      <h3 style={{ fontFamily: 'sans-serif', marginBottom: 16 }}>Stack — unstyled=true</h3>
      <div style={{ display: 'flex', gap: 40 }}>
        <div>
          <p style={{ fontFamily: 'sans-serif', fontSize: 12, color: '#666' }}>Normal</p>
          <Stack gap="sm">
            <ColorBox color="#228be6">A</ColorBox>
            <ColorBox color="#228be6">B</ColorBox>
          </Stack>
        </div>
        <div>
          <p style={{ fontFamily: 'sans-serif', fontSize: 12, color: '#666' }}>unstyled (no flex, no gap)</p>
          <Stack unstyled gap="sm">
            <ColorBox color="#868e96">A</ColorBox>
            <ColorBox color="#868e96">B</ColorBox>
          </Stack>
        </div>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 6. Theme customization
// ---------------------------------------------------------------------------

const customTheme = createTheme({
  components: {
    Stack: {
      defaultProps: { gap: '4px' },
      classNames: { root: 'theme-custom-stack' },
      styles: { root: { border: '2px dashed #fa5252', borderRadius: 8, padding: 12 } },
    },
  },
});

export const ThemeCustomization: Story = {
  render: () => (
    <PrismuiProvider theme={customTheme}>
      <div style={{ padding: 40 }}>
        <h3 style={{ fontFamily: 'sans-serif', marginBottom: 16 }}>Stack — Theme Customization</h3>
        <p style={{ fontFamily: 'sans-serif', fontSize: 13, color: '#666', marginBottom: 12 }}>
          Theme sets: gap=4px, dashed red border, padding 12px, custom className
        </p>
        <Stack>
          <ColorBox color="#fa5252">Themed A</ColorBox>
          <ColorBox color="#fa5252">Themed B</ColorBox>
          <ColorBox color="#fa5252">Themed C</ColorBox>
        </Stack>
      </div>
    </PrismuiProvider>
  ),
};

// ---------------------------------------------------------------------------
// 7. Per-instance classNames/styles override
// ---------------------------------------------------------------------------

export const PerInstanceOverride: Story = {
  render: () => (
    <div style={{ padding: 40 }}>
      <h3 style={{ fontFamily: 'sans-serif', marginBottom: 16 }}>Stack — Per-Instance Override</h3>
      <Stack
        classNames={{ root: 'my-custom-stack' }}
        styles={{ root: { background: '#f8f9fa', padding: 16, borderRadius: 8 } }}
        gap="lg"
      >
        <ColorBox color="#339af0">With custom classNames</ColorBox>
        <ColorBox color="#339af0">and styles override</ColorBox>
        <ColorBox color="#339af0">on this instance</ColorBox>
      </Stack>
    </div>
  ),
};
