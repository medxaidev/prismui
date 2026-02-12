import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PrismuiProvider } from '../../core/PrismuiProvider/PrismuiProvider';
import { createTheme } from '../../core/theme/create-theme';
import { Paper } from './Paper';

const meta: Meta<typeof Paper> = {
  title: 'Components/Paper',
  component: Paper,
  decorators: [
    (Story) => (
      <PrismuiProvider>
        <Story />
      </PrismuiProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Paper>;

const childStyle = {
  padding: '16px 24px',
  fontFamily: 'sans-serif',
  fontSize: 14,
} as any;

// ---------------------------------------------------------------------------
// 1. Basic
// ---------------------------------------------------------------------------

export const Basic: Story = {
  render: () => (
    <div style={{ padding: 40 }}>
      <h3 style={{ fontFamily: 'sans-serif', marginBottom: 16 }}>Paper — Basic</h3>
      <Paper style={childStyle}>
        Default Paper (no shadow, default radius from CSS variable)
      </Paper>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 2. Shadow levels
// ---------------------------------------------------------------------------

export const Shadows: Story = {
  render: () => (
    <div style={{ padding: 40 }}>
      <h3 style={{ fontFamily: 'sans-serif', marginBottom: 16 }}>Paper — Shadow Levels</h3>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {(['xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as const).map((s) => (
          <Paper key={s} shadow={s} style={{ ...childStyle, width: 140, textAlign: 'center' }}>
            shadow=&quot;{s}&quot;
          </Paper>
        ))}
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 3. Radius levels
// ---------------------------------------------------------------------------

export const RadiusLevels: Story = {
  render: () => (
    <div style={{ padding: 40 }}>
      <h3 style={{ fontFamily: 'sans-serif', marginBottom: 16 }}>Paper — Radius Levels</h3>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((r) => (
          <Paper
            key={r}
            radius={r}
            shadow="sm"
            style={{ ...childStyle, width: 140, textAlign: 'center' }}
          >
            radius=&quot;{r}&quot;
          </Paper>
        ))}
        <Paper
          radius={0}
          shadow="sm"
          style={{ ...childStyle, width: 140, textAlign: 'center' }}
        >
          radius={'{0}'}
        </Paper>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 4. With border
// ---------------------------------------------------------------------------

export const WithBorder: Story = {
  render: () => (
    <div style={{ padding: 40 }}>
      <h3 style={{ fontFamily: 'sans-serif', marginBottom: 16 }}>Paper — With Border</h3>
      <div style={{ display: 'flex', gap: 24 }}>
        <Paper withBorder style={childStyle}>
          withBorder=true
        </Paper>
        <Paper withBorder shadow="sm" style={childStyle}>
          withBorder + shadow
        </Paper>
        <Paper style={childStyle}>
          No border (default)
        </Paper>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 5. Component shadows (card, dialog, dropdown)
// ---------------------------------------------------------------------------

export const ComponentShadows: Story = {
  render: () => (
    <div style={{ padding: 40 }}>
      <h3 style={{ fontFamily: 'sans-serif', marginBottom: 16 }}>
        Paper — Component Shadow Tokens
      </h3>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {(['card', 'dialog', 'dropdown'] as const).map((s) => (
          <Paper key={s} shadow={s} style={{ ...childStyle, width: 160, textAlign: 'center' }}>
            shadow=&quot;{s}&quot;
          </Paper>
        ))}
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 6. Vars override
// ---------------------------------------------------------------------------

export const VarsOverride: Story = {
  render: () => (
    <div style={{ padding: 40 }}>
      <h3 style={{ fontFamily: 'sans-serif', marginBottom: 16 }}>
        Paper — User vars Override
      </h3>
      <Paper
        shadow="md"
        vars={() => ({
          root: {
            '--paper-shadow': '0 0 0 3px #228be6',
            '--paper-radius': '16px',
          },
        })}
        style={childStyle}
      >
        vars override: blue ring shadow + 16px radius
      </Paper>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 7. Theme customization
// ---------------------------------------------------------------------------

const customTheme = createTheme({
  components: {
    Paper: {
      defaultProps: { shadow: 'sm', withBorder: true },
      classNames: { root: 'theme-paper-root' },
      styles: {
        root: {
          borderColor: '#228be6',
        },
      },
    },
  },
});

export const ThemeCustomization: Story = {
  render: () => (
    <PrismuiProvider theme={customTheme}>
      <div style={{ padding: 40 }}>
        <h3 style={{ fontFamily: 'sans-serif', marginBottom: 16 }}>
          Paper — Theme Customization
        </h3>
        <p style={{ fontFamily: 'sans-serif', fontSize: 13, color: '#666', marginBottom: 12 }}>
          Theme sets: shadow=sm, withBorder=true, blue border color
        </p>
        <Paper style={childStyle}>
          Themed Paper (inspect: shadow + blue border from theme)
        </Paper>
      </div>
    </PrismuiProvider>
  ),
};

// ---------------------------------------------------------------------------
// 8. Unstyled
// ---------------------------------------------------------------------------

export const Unstyled: Story = {
  render: () => (
    <div style={{ padding: 40 }}>
      <h3 style={{ fontFamily: 'sans-serif', marginBottom: 16 }}>Paper — Unstyled</h3>
      <div style={{ display: 'flex', gap: 24 }}>
        <div>
          <p style={{ fontFamily: 'sans-serif', fontSize: 12, color: '#666' }}>Normal</p>
          <Paper shadow="md" style={childStyle}>
            Styled Paper
          </Paper>
        </div>
        <div>
          <p style={{ fontFamily: 'sans-serif', fontSize: 12, color: '#666' }}>unstyled=true</p>
          <Paper unstyled shadow="md" style={childStyle}>
            Unstyled (no CSS Module class)
          </Paper>
        </div>
      </div>
    </div>
  ),
};
