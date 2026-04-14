import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';
import { PrismUIProvider } from '../../core/theme/provider/PrismUIProvider';
import { createTheme } from '../../core/theme/create-theme';

const meta = {
  title: 'Components/Badge',
  component: Badge,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['filled', 'outline', 'subtle', 'transparent'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'error', 'success', 'warning'],
    },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

// 1. Default
export const Default: Story = {
  args: { children: 'Badge' },
};

// 2. All Variants
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
      <Badge variant="filled">Filled</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="subtle">Subtle</Badge>
      <Badge variant="transparent">Transparent</Badge>
    </div>
  ),
};

// 3. All Sizes
export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <Badge size="xs">xs</Badge>
      <Badge size="sm">sm</Badge>
      <Badge size="md">md</Badge>
      <Badge size="lg">lg</Badge>
      <Badge size="xl">xl</Badge>
    </div>
  ),
};

// 4. All Colors × Variants
export const ColorMatrix: Story = {
  render: () => {
    const variants = ['filled', 'outline', 'subtle'] as const;
    const colors = ['primary', 'secondary', 'error', 'success', 'warning'] as const;
    return (
      <div style={{ fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {variants.map(v => (
          <div key={v} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: '#637381', width: 80, flexShrink: 0 }}>{v}</span>
            {colors.map(c => (
              <Badge key={c} variant={v} color={c as any}>{c}</Badge>
            ))}
          </div>
        ))}
      </div>
    );
  },
};

// 5. Disabled State
export const DisabledState: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
      <Badge>Normal</Badge>
      <Badge disabled>Disabled</Badge>
      <Badge variant="outline" disabled>Outline Disabled</Badge>
      <Badge variant="subtle" disabled>Subtle Disabled</Badge>
    </div>
  ),
};

// 6. Polymorphic — render as different elements
export const Polymorphic: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', fontFamily: 'sans-serif' }}>
      <Badge>span (default)</Badge>
      <Badge component="div">div</Badge>
      <Badge component="a" href="#badge">a href</Badge>
    </div>
  ),
};

// ── Stage 1–2: Component Model ─────────────────────────────────────────────

// 7. Single Slot — Blueprint Minimal pattern
export const MinimalBlueprint: Story = {
  render: () => (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 560 }}>
      <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700 }}>
        Stage 6 — Minimal Blueprint: single slot (root only)
      </h4>
      <p style={{ margin: '0 0 12px', fontSize: 12, color: '#637381' }}>
        Badge is a Minimal component: no VarsResolver, one slot (<code>root</code>).
        The factory default render path produces <code>&lt;span .root&gt;</code> directly — no custom render function.
        Contrast with Button's Extended pattern (3 slots + custom render).
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Badge variant="filled" color="primary">New</Badge>
        <Badge variant="outline" color="success">Live</Badge>
        <Badge variant="subtle" color="warning">Beta</Badge>
        <Badge variant="filled" color="error">Hot</Badge>
      </div>
      <p style={{ marginTop: 12, fontSize: 11, color: '#919EAB' }}>
        Stage 6 — ensureClasses(['root'], classes). One class, one slot, minimal overhead.
      </p>
    </div>
  ),
};

// 8. classNames override
export const ClassNamesOverride: Story = {
  render: () => (
    <div style={{ fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <style>{`
        .badge-pulse { animation: pulse 1.5s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .badge-large-text { font-size: 14px; font-weight: 700; letter-spacing: 1px; }
      `}</style>
      <Badge classNames={{ root: 'badge-pulse' }}>Pulsing Badge</Badge>
      <Badge classNames={{ root: 'badge-large-text' }}>Large Text</Badge>
    </div>
  ),
};

// 9. styles + vars override
export const StylesVarsOverride: Story = {
  render: () => (
    <div style={{ fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Badge styles={{ root: { borderRadius: '4px', padding: '4px 10px' } }}>
        Rectangular (styles)
      </Badge>
      <Badge vars={{ '--prismui-size-height': '28px' }}>
        Taller via vars
      </Badge>
      <Badge style={{ transform: 'scale(1.2)', transformOrigin: 'left' }}>
        Scaled via style prop
      </Badge>
    </div>
  ),
};

// ── Stage 7–8: theme.components Three-Channel ─────────────────────────────

// 10. theme.components.defaultProps
export const ThemeDefaultProps: Story = {
  render: () => {
    const theme = createTheme({
      components: { Badge: { defaultProps: { variant: 'outline', color: 'error' } } },
    });
    return (
      <div style={{ fontFamily: 'sans-serif', maxWidth: 560 }}>
        <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700 }}>
          Stage 7–8 — Badge theme.components.defaultProps
        </h4>
        <p style={{ margin: '0 0 12px', fontSize: 12, color: '#637381' }}>
          Theme sets <code>variant=outline, color=error</code> as defaults for all Badges.
        </p>
        <PrismUIProvider theme={theme}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Badge>No props (outline + error)</Badge>
            <Badge variant="filled">variant="filled" overrides</Badge>
            <Badge color="success">color="success" overrides</Badge>
          </div>
        </PrismUIProvider>
        <p style={{ marginTop: 12, fontSize: 11, color: '#919EAB' }}>
          Stage 7 — useComponentDefaultProps: undefined = theme default, explicit prop = override.
        </p>
      </div>
    );
  },
};

// 11. theme.components.classNames + styles + vars — full three-channel demo
export const ThemeThreeChannel: Story = {
  render: () => {
    const theme = createTheme({
      components: {
        Badge: {
          classNames: { root: 'theme-badge-ring' },
          styles: { root: { borderRadius: '6px', padding: '3px 10px' } },
          vars: { '--prismui-size-height': '26px' },
        },
      },
    });
    return (
      <div style={{ fontFamily: 'sans-serif', maxWidth: 560 }}>
        <style>{`
          .theme-badge-ring { outline: 2px solid currentColor; outline-offset: 2px; }
        `}</style>
        <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700 }}>
          Stage 8 — Badge theme.components: all three channels active
        </h4>
        <p style={{ margin: '0 0 12px', fontSize: 12, color: '#637381' }}>
          Theme applies: <code>classNames.root</code> (ring outline) +{' '}
          <code>styles.root</code> (rectangular shape) + <code>vars</code> (height=26px).
        </p>
        <PrismUIProvider theme={theme}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Badge variant="filled" color="primary">Theme all 3</Badge>
            <Badge variant="outline" color="success">Theme all 3</Badge>
            <Badge
              variant="filled"
              classNames={{ root: 'extra-local' }}
              styles={{ root: { borderRadius: '50px' } }}
            >
              + Props override
            </Badge>
          </div>
        </PrismUIProvider>
        <p style={{ marginTop: 12, fontSize: 11, color: '#919EAB' }}>
          Stage 8 — three-channel priority: theme &lt; props for all channels.
        </p>
      </div>
    );
  },
};

// 12. Playground
export const Playground: Story = {
  args: {
    children: 'Playground',
    variant: 'filled',
    size: 'md',
    color: 'primary',
    disabled: false,
  },
};
