import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { PrismUIProvider } from '../../core/theme/provider/PrismUIProvider';
import { createTheme } from '../../core/theme/create-theme';

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['filled', 'outlined', 'soft', 'plain'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'info', 'success', 'warning', 'error', 'neutral'],
    },
    disabled: { control: 'boolean' },
    radius: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', 'full'],
    },
    fullWidth: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// 1. Default
export const Default: Story = {
  args: { children: 'Button' },
};

// 2. Playground
export const Playground: Story = {
  args: {
    children: 'Playground',
    variant: 'filled',
    size: 'md',
    color: 'primary',
    disabled: false,
  },
};

// 3. All Variants
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
      <Button variant="filled">Filled</Button>
      <Button variant="outlined">Outlined</Button>
      <Button variant="soft">Soft</Button>
      <Button variant="plain">Plain</Button>
    </div>
  ),
};

// 4. All Sizes
export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <Button size="xs">xs</Button>
      <Button size="sm">sm</Button>
      <Button size="md">md</Button>
      <Button size="lg">lg</Button>
      <Button size="xl">xl</Button>
    </div>
  ),
};

// 5. Variant × Color Matrix
export const ColorMatrix: Story = {
  render: () => {
    const variants = ['filled', 'outlined', 'soft', 'plain'] as const;
    const colors = ['primary', 'secondary', 'info', 'success', 'warning', 'error', 'neutral'] as const;
    return (
      <div style={{ fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {variants.map(v => (
          <div key={v} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: '#637381', width: 64, flexShrink: 0 }}>{v}</span>
            {colors.map(c => (
              <Button key={c} variant={v} color={c}>{c}</Button>
            ))}
          </div>
        ))}
      </div>
    );
  },
};

// 6. Disabled State
export const DisabledState: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
      <Button>Normal</Button>
      <Button disabled>Disabled</Button>
      <Button variant="outlined" disabled>Outlined Disabled</Button>
      <Button variant="soft" disabled>Soft Disabled</Button>
      <Button variant="plain" disabled>Plain Disabled</Button>
    </div>
  ),
};

// 7. Polymorphic — render as different elements
export const Polymorphic: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', fontFamily: 'sans-serif' }}>
      <Button>button (default)</Button>
      <Button component="a" href="#anchor">a href</Button>
      <Button component="div">div</Button>
    </div>
  ),
};

// 8. Focus Ring — keyboard accessibility visualization
export const FocusRing: Story = {
  render: () => (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 560 }}>
      <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700 }}>
        Focus Ring — Stage 3 token: --prismui-focus-ring-*
      </h4>
      <p style={{ margin: '0 0 12px', fontSize: 12, color: '#637381' }}>
        Tab into the buttons below to see the focus ring. Uses{' '}
        <code>--prismui-focus-ring-width</code> (2px),{' '}
        <code>--prismui-focus-ring-offset</code> (2px),{' '}
        <code>--prismui-focus-ring-color</code> (var(--prismui-color-primary)).
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Button variant="filled">Filled</Button>
        <Button variant="outlined">Outlined</Button>
        <Button variant="soft">Soft</Button>
        <Button variant="plain">Plain</Button>
      </div>
      <p style={{ marginTop: 12, fontSize: 11, color: '#919EAB' }}>
        Focus ring is themeable via focusRing token in createTheme().
      </p>
    </div>
  ),
};

// 8.5 FocusFeedback — A/B compare native outline vs glowFeedback (Phase 4.1 visual demo)
export const FocusFeedback: Story = {
  render: () => (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 640 }}>
      <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700 }}>
        Focus Feedback — glowFeedback A/B
      </h4>
      <p style={{ margin: '0 0 12px', fontSize: 12, color: '#637381' }}>
        Tab into each button (do <strong>not</strong> click — <code>:focus-visible</code> only
        triggers on keyboard focus). The left has <code>feedbacks={'{[]}'}</code> — native{' '}
        <code>:focus-visible</code> outline only. The right has the default{' '}
        <code>[rippleFeedback, glowFeedback]</code> — outline plus a soft halo via{' '}
        <code>box-shadow</code> with <code>color-mix(... 32%, transparent)</code>, fading{' '}
        in / out via <code>transition: box-shadow var(--prismui-transition-fast)</code>.
      </p>
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 11, color: '#919EAB' }}>
            feedbacks=[] (native outline only)
          </span>
          <Button feedbacks={[]}>No glow</Button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 11, color: '#919EAB' }}>default (ripple + glow)</span>
          <Button>With glow</Button>
        </div>
      </div>
      <p style={{ marginTop: 16, fontSize: 11, color: '#919EAB' }}>
        DevTools tip: focus the right button and observe the global class{' '}
        <code>prismui-glow-active</code> appear / disappear on the host element. Class
        lifecycle is driven by the <code>FeedbackController</code> (Phase 4.1 Delivered,
        contract v0.6).
      </p>
    </div>
  ),
};

// 9. Three-Channel Overrides (props level)
export const ThreeChannelPropsOverride: Story = {
  render: () => (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 560 }}>
      <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700 }}>
        Three-Channel Override — props level
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#637381', width: 80 }}>classNames</span>
          <style>{`.custom-rounded { border-radius: 999px !important; }`}</style>
          <Button classNames={{ root: 'custom-rounded' }}>Pill shape</Button>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#637381', width: 80 }}>styles</span>
          <Button styles={{ root: { borderRadius: '2px' }, label: { letterSpacing: '2px' } }}>
            Square + spaced
          </Button>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#637381', width: 80 }}>vars</span>
          <Button vars={{ '--button-height': '56px', '--button-font-size': '1.125rem' }}>
            Taller via vars
          </Button>
        </div>
      </div>
    </div>
  ),
};

// 10. theme.components.defaultProps
export const ThemeDefaultProps: Story = {
  render: () => {
    const theme = createTheme({
      components: {
        Button: { defaultProps: { variant: 'soft', color: 'success', size: 'lg' } },
      },
    });
    return (
      <div style={{ fontFamily: 'sans-serif', maxWidth: 560 }}>
        <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700 }}>
          Stage 7 — theme.components.defaultProps
        </h4>
        <p style={{ margin: '0 0 12px', fontSize: 12, color: '#637381' }}>
          Theme sets <code>variant=soft, color=success, size=lg</code> as defaults.
        </p>
        <PrismUIProvider theme={theme}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <Button>No props (soft + success + lg)</Button>
            <Button variant="filled">variant="filled" overrides</Button>
            <Button color="error" size="sm">color + size override</Button>
          </div>
        </PrismUIProvider>
      </div>
    );
  },
};

// 11. theme.components three-channel full demo
export const ThemeThreeChannel: Story = {
  render: () => {
    const theme = createTheme({
      components: {
        Button: {
          classNames: { root: 'theme-btn-shadow' },
          styles: { root: { borderRadius: '12px' } },
          vars: { '--button-height': '52px' },
        },
      },
    });
    return (
      <div style={{ fontFamily: 'sans-serif', maxWidth: 600 }}>
        <style>{`
          .theme-btn-shadow { box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        `}</style>
        <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700 }}>
          Stage 8 — theme.components: all three channels
        </h4>
        <p style={{ margin: '0 0 12px', fontSize: 12, color: '#637381' }}>
          Theme applies: <code>classNames</code> (shadow) + <code>styles</code> (radius 12px) +{' '}
          <code>vars</code> (height 52px). Props-level overrides still win.
        </p>
        <PrismUIProvider theme={theme}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <Button variant="filled">Theme all 3</Button>
            <Button variant="outlined" color="success">Theme all 3</Button>
            <Button
              variant="filled"
              color="error"
              styles={{ root: { borderRadius: '2px' } }}
            >
              + Props override radius
            </Button>
          </div>
        </PrismUIProvider>
      </div>
    );
  },
};

// 11.5 Sections — Issue #1 + Size v3 (slotSize / innerGap)
const IconPlus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const IconChevron = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const WithSections: Story = {
  render: () => (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 600 }}>
      <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700 }}>
        Sections — driven by Size System v3 tokens
      </h4>
      <p style={{ margin: '0 0 12px', fontSize: 12, color: '#637381' }}>
        <code>leftSection</code> / <code>rightSection</code> render as{' '}
        <code>&lt;span data-position&gt;</code> with <code>--prismui-size-slot-size</code>{' '}
        (via <code>--button-slot-size</code>); inner gap from{' '}
        <code>--prismui-size-inner-gap</code>.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <Button leftSection={<IconPlus />}>Add Item</Button>
        <Button rightSection={<IconChevron />}>Menu</Button>
        <Button leftSection={<IconPlus />} rightSection={<IconChevron />}>Both</Button>
        <Button variant="outlined" leftSection={<IconPlus />}>Outlined</Button>
        <Button variant="soft" leftSection={<IconPlus />}>Soft</Button>
      </div>
    </div>
  ),
};

export const SectionsAcrossSizes: Story = {
  render: () => (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 600 }}>
      <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700 }}>
        Sections auto-scale with size (Size v3 §3)
      </h4>
      <p style={{ margin: '0 0 12px', fontSize: 12, color: '#637381' }}>
        Slot square scales: xs=14 → sm=16 → md=18 → lg=20 → xl=22 (step +2).
        Inner gap scales: xs=4 → sm=6 → md=8 → lg=10 → xl=12 (step +2).
      </p>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
          <Button key={s} size={s} leftSection={<IconPlus />} rightSection={<IconChevron />}>
            {s}
          </Button>
        ))}
      </div>
    </div>
  ),
};

// 11.6 Radius scale
export const RadiusScale: Story = {
  render: () => (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 600 }}>
      <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700 }}>Radius scale</h4>
      <p style={{ margin: '0 0 12px', fontSize: 12, color: '#637381' }}>
        Accepts theme scale (<code>xs / sm / md / lg / xl / full</code>) or any CSS length.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {(['xs', 'sm', 'md', 'lg', 'xl', 'full'] as const).map((r) => (
          <Button key={r} radius={r}>{r}</Button>
        ))}
        <Button radius="4px">4px</Button>
        <Button radius="9999px">9999px</Button>
      </div>
    </div>
  ),
};

// 11.7 FullWidth
export const FullWidthDemo: Story = {
  render: () => (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>fullWidth</h4>
      <Button>Natural width</Button>
      <Button fullWidth>Full width</Button>
      <Button fullWidth variant="outlined" leftSection={<IconPlus />}>Full width with section</Button>
    </div>
  ),
};

// 11.8 Loading
export const LoadingStates: Story = {
  render: () => (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 600 }}>
      <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700 }}>Loading</h4>
      <p style={{ margin: '0 0 12px', fontSize: 12, color: '#637381' }}>
        Built-in spinner replaces <code>leftSection</code>; root gets{' '}
        <code>aria-busy="true"</code> + <code>data-loading="true"</code>. Pointer
        events are disabled while loading; combine with <code>disabled</code> to
        also block keyboard activation.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <Button loading>Saving…</Button>
        <Button loading variant="outlined">Outlined</Button>
        <Button loading variant="soft">Soft</Button>
        <Button loading rightSection={<IconChevron />}>With right</Button>
        <Button loading size="xs">xs</Button>
        <Button loading size="xl">xl</Button>
      </div>
    </div>
  ),
};

// 11.9 Reduced Motion (visual — requires OS setting)
export const ReducedMotionHint: Story = {
  render: () => (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 600 }}>
      <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700 }}>prefers-reduced-motion (IV-A5)</h4>
      <p style={{ margin: '0 0 12px', fontSize: 12, color: '#637381' }}>
        Toggle OS "Reduce motion" accessibility setting to verify: transitions
        disappear, ripple feedback is suppressed (FeedbackController matchMedia
        gate), spinner stops rotating.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <Button>Hover / Click me</Button>
        <Button loading>Loading…</Button>
      </div>
    </div>
  ),
};

// 12. Custom focusRing theme
export const CustomFocusRingTheme: Story = {
  render: () => {
    const theme = createTheme({
      focusRing: {
        width: '3px',
        offset: '4px',
        color: '#ff5500',
      },
    });
    return (
      <div style={{ fontFamily: 'sans-serif', maxWidth: 560 }}>
        <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700 }}>
          Custom focusRing token — Stage 3
        </h4>
        <p style={{ margin: '0 0 12px', fontSize: 12, color: '#637381' }}>
          Theme overrides <code>focusRing.width=3px</code>, <code>offset=4px</code>,{' '}
          <code>color=#ff5500</code>. Tab to see the orange ring.
        </p>
        <PrismUIProvider theme={theme}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Button variant="filled">Focus me</Button>
            <Button variant="outlined">Focus me</Button>
            <Button variant="soft">Focus me</Button>
          </div>
        </PrismUIProvider>
      </div>
    );
  },
};
