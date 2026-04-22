import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ToggleButton, type ToggleButtonPressedState } from './ToggleButton';
import { PrismUIProvider } from '../../core/theme/provider/PrismUIProvider';
import { createTheme } from '../../core/theme/create-theme';

// ── Icon fixtures ────────────────────────────────────────────────────────
// Decorative inline SVGs used by demos that include a `leftSection` or
// show mixed-content composition. stroke="currentColor" lets the icon
// follow the ToggleButton variant's foreground — same convention as
// IconButton's stories.
const IconBold = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="1em" height="1em">
    <path d="M6 4h8a4 4 0 0 1 0 8H6zM6 12h9a4 4 0 0 1 0 8H6z" />
  </svg>
);
const IconItalic = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="1em" height="1em">
    <path d="M19 4h-9M14 20H5M15 4 9 20" />
  </svg>
);
const IconUnderline = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="1em" height="1em">
    <path d="M6 4v7a6 6 0 0 0 12 0V4M4 20h16" />
  </svg>
);
const IconStar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="1em" height="1em">
    <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
  </svg>
);
const IconGrid = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="1em" height="1em">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
  </svg>
);
const IconList = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="1em" height="1em">
    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
  </svg>
);

const meta = {
  title: 'Components/ToggleButton',
  component: ToggleButton,
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
    loading: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    radius: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', 'full'],
    },
    defaultPressed: { control: 'boolean' },
    pressed: {
      control: 'radio',
      options: [undefined, false, true, 'mixed'],
    },
  },
} satisfies Meta<typeof ToggleButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── 1 · Default — minimal viable render. No controlled `pressed`, no
//      explicit defaultPressed; the toggle starts at `false` and the user
//      clicks to persist `true`.
export const Default: Story = {
  args: {
    children: 'Bold',
  },
};

// ── 2 · Playground — every major control wired to Storybook's args panel.
//      Leaving `pressed` undefined keeps the button in uncontrolled mode
//      (`defaultPressed` seeds the initial value).
export const Playground: Story = {
  args: {
    children: 'Bold',
    defaultPressed: false,
    variant: 'outlined',
    size: 'md',
    color: 'primary',
    disabled: false,
    loading: false,
    fullWidth: false,
    radius: 'md',
  },
};

// ── 3 · All Variants — each variant rendered TWICE (pressed=false then
//      pressed=true) so reviewers can confirm the pressed-visual channel
//      produces a clearly distinct state per variant (T-3).
export const AllVariants: Story = {
  render: () => {
    const variants = ['filled', 'outlined', 'soft', 'plain'] as const;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontFamily: 'sans-serif' }}>
        {variants.map((v) => (
          <div key={v} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: '#637381', width: 72, flexShrink: 0 }}>{v}</span>
            <ToggleButton variant={v} defaultPressed={false}>Off</ToggleButton>
            <ToggleButton variant={v} defaultPressed={true}>On (pressed)</ToggleButton>
          </div>
        ))}
      </div>
    );
  },
};

// ── 4 · All Sizes — five size tiers scaled via Size System v3 tokens.
//      Size affects height / padding / font-size / slot size / inner gap
//      in one coordinated step (ToggleButton's varsResolver maps all five).
export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
        <ToggleButton key={s} size={s} defaultPressed>{s.toUpperCase()}</ToggleButton>
      ))}
    </div>
  ),
};

// ── 5 · Variant × Color matrix — all four variants × seven theme colors,
//      rendered in the PRESSED state so the pressed fill is visible. Lets
//      reviewers check palette coherence in the active-state fill.
export const PressedColorMatrix: Story = {
  render: () => {
    const variants = ['filled', 'outlined', 'soft', 'plain'] as const;
    const colors = ['primary', 'secondary', 'info', 'success', 'warning', 'error', 'neutral'] as const;
    return (
      <div style={{ fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {variants.map((v) => (
          <div key={v} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: '#637381', width: 64, flexShrink: 0 }}>{v}</span>
            {colors.map((c) => (
              <ToggleButton key={c} variant={v} color={c} defaultPressed>
                {c}
              </ToggleButton>
            ))}
          </div>
        ))}
      </div>
    );
  },
};

// ── 6 · Controlled vs Uncontrolled — side-by-side demo. The left button
//      owns state internally; the right button requires the parent to
//      update `pressed` via `onPressedChange`.
export const ControlledVsUncontrolled: Story = {
  render: () => {
    const [pressed, setPressed] = React.useState(false);
    return (
      <div style={{ fontFamily: 'sans-serif', maxWidth: 640 }}>
        <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700 }}>
          Controlled vs Uncontrolled
        </h4>
        <p style={{ margin: '0 0 12px', fontSize: 12, color: '#637381' }}>
          Left: <code>defaultPressed</code> — component owns state. Right:
          <code> pressed + onPressedChange</code> — parent owns state
          (currently <strong>{String(pressed)}</strong>).
        </p>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, color: '#637381', marginBottom: 4 }}>uncontrolled</div>
            <ToggleButton defaultPressed={false}>Bold</ToggleButton>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#637381', marginBottom: 4 }}>controlled</div>
            <ToggleButton pressed={pressed} onPressedChange={setPressed}>Bold</ToggleButton>
          </div>
        </div>
      </div>
    );
  },
};

// ── 7 · Tri-state · `pressed="mixed"` — WAI-ARIA-compliant indeterminate.
//      Clicking transitions mixed → true (T-8 rule). The dashed border is
//      the built-in visual indicator; consumers can layer additional
//      indicators via `classNames`.
export const MixedTriState: Story = {
  render: () => {
    const [pressed, setPressed] = React.useState<ToggleButtonPressedState>('mixed');
    return (
      <div style={{ fontFamily: 'sans-serif', maxWidth: 640 }}>
        <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700 }}>
          Tri-state · pressed="mixed" (T-8)
        </h4>
        <p style={{ margin: '0 0 12px', fontSize: 12, color: '#637381' }}>
          Current: <strong>{String(pressed)}</strong>. Clicking a mixed
          toggle transitions to <code>true</code> (WAI-ARIA recommendation).
        </p>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <ToggleButton pressed={pressed} onPressedChange={setPressed} leftSection={<IconBold />}>
            Bold
          </ToggleButton>
          <button onClick={() => setPressed('mixed')} style={{ padding: '4px 10px' }}>
            Reset to mixed
          </button>
          <button onClick={() => setPressed(false)} style={{ padding: '4px 10px' }}>
            Reset to false
          </button>
        </div>
      </div>
    );
  },
};

// ── 8 · disabled / loading · pressed is preserved (T-6)
//      Both disabled and loading FREEZE interaction but leave the pressed
//      visual untouched — users can see the state that will be restored.
export const DisabledAndLoading: Story = {
  render: () => (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 640 }}>
      <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700 }}>
        disabled / loading · pressed persists (T-6)
      </h4>
      <p style={{ margin: '0 0 12px', fontSize: 12, color: '#637381' }}>
        Clicks are swallowed, but the pressed fill remains visible (dimmed
        by opacity). Loading shows the built-in spinner in the left slot.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#637381', width: 72 }}>disabled</span>
          <ToggleButton disabled defaultPressed={false}>Off + disabled</ToggleButton>
          <ToggleButton disabled defaultPressed={true}>On + disabled</ToggleButton>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#637381', width: 72 }}>loading</span>
          <ToggleButton loading defaultPressed={false}>Off + loading</ToggleButton>
          <ToggleButton loading defaultPressed={true}>On + loading</ToggleButton>
        </div>
      </div>
    </div>
  ),
};

// ── 9 · Sections — left / right icon slots, same mechanism as Button.
//      `leftSection` is replaced by the built-in spinner while `loading`.
export const Sections: Story = {
  render: () => (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 640 }}>
      <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700 }}>
        leftSection / rightSection
      </h4>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <ToggleButton leftSection={<IconBold />} defaultPressed>Bold</ToggleButton>
        <ToggleButton leftSection={<IconItalic />}>Italic</ToggleButton>
        <ToggleButton leftSection={<IconUnderline />} defaultPressed>Underline</ToggleButton>
        <ToggleButton rightSection={<IconStar />}>Favorite</ToggleButton>
      </div>
    </div>
  ),
};

// ── 10 · fullWidth — stretches to container. Useful inside card footers
//       or settings panels where the toggle communicates a binary choice.
export const FullWidth: Story = {
  render: () => (
    <div style={{ fontFamily: 'sans-serif', width: 420 }}>
      <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700 }}>fullWidth</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <ToggleButton fullWidth defaultPressed={false}>Enable notifications</ToggleButton>
        <ToggleButton fullWidth defaultPressed variant="filled">Subscribed</ToggleButton>
      </div>
    </div>
  ),
};

// ── 11 · Polymorphic — same surface as Button / IconButton. `<a href>`
//       becomes an anchor (no role injection); bare `<div>` receives
//       role="button" + hook-driven Enter/Space activation.
export const Polymorphic: Story = {
  render: () => (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 640 }}>
      <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700 }}>
        Polymorphic
      </h4>
      <p style={{ margin: '0 0 12px', fontSize: 12, color: '#637381' }}>
        Tab-focusable + Enter/Space-activatable across native and polymorphic
        elements. <code>aria-pressed</code> is always present (T-1).
      </p>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <ToggleButton>Native button</ToggleButton>
        <ToggleButton component="a" href="#anchor">Polymorphic anchor</ToggleButton>
        <ToggleButton component="div">Polymorphic div</ToggleButton>
      </div>
    </div>
  ),
};

// ── 12 · Three-channel overrides — classNames / styles / vars. Consistent
//       with Button + IconButton.
export const ThreeChannelPropsOverride: Story = {
  render: () => (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 640 }}>
      <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700 }}>
        Three-Channel Override · props level
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#637381', width: 80 }}>classNames</span>
          <style>{`.custom-ring { box-shadow: 0 0 0 3px #ff5500; }`}</style>
          <ToggleButton classNames={{ root: 'custom-ring' }} defaultPressed>Ringed</ToggleButton>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#637381', width: 80 }}>styles</span>
          <ToggleButton styles={{ root: { borderRadius: '2px' } }}>Square</ToggleButton>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#637381', width: 80 }}>vars</span>
          <ToggleButton vars={{ '--toggle-button-height': '48px', '--toggle-button-padding-x': '20px' }}>
            Custom size
          </ToggleButton>
        </div>
      </div>
    </div>
  ),
};

// ── 13 · Theme defaultProps — the Theme Override Model entry point. All
//       ToggleButtons under the provider inherit defaults; explicit props
//       still win.
export const ThemeDefaultProps: Story = {
  render: () => {
    const theme = createTheme({
      components: {
        ToggleButton: { defaultProps: { variant: 'soft', color: 'success', size: 'lg', radius: 'full' } },
      },
    });
    return (
      <div style={{ fontFamily: 'sans-serif', maxWidth: 640 }}>
        <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700 }}>
          theme.components.ToggleButton.defaultProps
        </h4>
        <p style={{ margin: '0 0 12px', fontSize: 12, color: '#637381' }}>
          Theme sets <code>variant=soft, color=success, size=lg, radius=full</code>.
          Explicit props still win.
        </p>
        <PrismUIProvider theme={theme}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <ToggleButton defaultPressed>Theme default</ToggleButton>
            <ToggleButton defaultPressed variant="filled">Variant override</ToggleButton>
            <ToggleButton defaultPressed color="error">Color override</ToggleButton>
          </div>
        </PrismUIProvider>
      </div>
    );
  },
};

// ── 14 · Toolbar composition — the canonical ToggleButton use case.
//       A rich-text editor's formatting toolbar uses one ToggleButton
//       per format. Each maintains its own pressed state; the parent
//       role="toolbar" provides grouping semantics for AT.
export const EditorToolbar: Story = {
  render: () => {
    const [bold, setBold] = React.useState(false);
    const [italic, setItalic] = React.useState(false);
    const [underline, setUnderline] = React.useState(false);
    const [align, setAlign] = React.useState<'grid' | 'list'>('grid');
    return (
      <div style={{ fontFamily: 'sans-serif', maxWidth: 640 }}>
        <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700 }}>
          Editor toolbar — canonical use case
        </h4>
        <p style={{ margin: '0 0 12px', fontSize: 12, color: '#637381' }}>
          Controlled toggles with independent state, plus a mutually-exclusive
          pair (Grid / List) demonstrating how manual state management gives
          you ToggleGroup-like behavior without a dedicated compound.
        </p>
        <div
          role="toolbar"
          aria-label="Formatting"
          style={{
            display: 'inline-flex',
            gap: 4,
            padding: 6,
            borderRadius: 12,
            background: '#f5f5f5',
          }}
        >
          <ToggleButton pressed={bold} onPressedChange={setBold} leftSection={<IconBold />}>
            Bold
          </ToggleButton>
          <ToggleButton pressed={italic} onPressedChange={setItalic} leftSection={<IconItalic />}>
            Italic
          </ToggleButton>
          <ToggleButton pressed={underline} onPressedChange={setUnderline} leftSection={<IconUnderline />}>
            Underline
          </ToggleButton>
          <span style={{ width: 1, background: '#d4d4d4', margin: '0 4px' }} />
          <ToggleButton pressed={align === 'grid'} onPressedChange={(v: ToggleButtonPressedState) => v && setAlign('grid')} leftSection={<IconGrid />}>
            Grid
          </ToggleButton>
          <ToggleButton pressed={align === 'list'} onPressedChange={(v: ToggleButtonPressedState) => v && setAlign('list')} leftSection={<IconList />}>
            List
          </ToggleButton>
        </div>
      </div>
    );
  },
};

// ── 15 · Pressed visual isolation demo (T-3) — proves :active and
//       data-pressed are independent. Click and hold to see :active fill
//       layered momentarily on top of pressed fill.
export const PressedVsActiveIsolation: Story = {
  render: () => (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 640 }}>
      <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700 }}>
        Pressed vs :active — T-3 dedicated channels
      </h4>
      <p style={{ margin: '0 0 12px', fontSize: 12, color: '#637381' }}>
        Press and hold each toggle: the <code>:active</code> fill briefly
        overlays the pressed visual. Release: pressed visual returns. The
        two channels use DIFFERENT CSS variables (theming one can't affect
        the other).
      </p>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <ToggleButton defaultPressed={false}>Press me (unpressed)</ToggleButton>
        <ToggleButton defaultPressed={true}>Press me (pressed)</ToggleButton>
      </div>
    </div>
  ),
};

// ── 16 · Focus ring — same focusRing tokens as Button / IconButton.
//       Tab through the toggles to verify the ring is consistent.
export const FocusRing: Story = {
  render: () => {
    const theme = createTheme({
      focusRing: {
        width: '3px',
        offset: '3px',
        color: '#ff5500',
      },
    });
    return (
      <div style={{ fontFamily: 'sans-serif', maxWidth: 640 }}>
        <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700 }}>
          Custom focusRing token (shared with Button / IconButton)
        </h4>
        <PrismUIProvider theme={theme}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <ToggleButton variant="filled">Focus 1</ToggleButton>
            <ToggleButton variant="outlined" defaultPressed>Focus 2</ToggleButton>
            <ToggleButton variant="soft">Focus 3</ToggleButton>
            <ToggleButton variant="plain" defaultPressed>Focus 4</ToggleButton>
          </div>
        </PrismUIProvider>
      </div>
    );
  },
};

// ── 17 · Reduced motion — IV-A5 verification: with OS "Reduce motion"
//       enabled, transitions / active-press scale / spinner rotation stop.
export const ReducedMotionHint: Story = {
  render: () => (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 640 }}>
      <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700 }}>prefers-reduced-motion</h4>
      <p style={{ margin: '0 0 12px', fontSize: 12, color: '#637381' }}>
        Toggle your OS "Reduce motion" setting: transitions disappear,
        <code> :active</code> no longer scales, spinner stops rotating.
      </p>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <ToggleButton defaultPressed>Hover/click</ToggleButton>
        <ToggleButton loading>Loading</ToggleButton>
      </div>
    </div>
  ),
};
