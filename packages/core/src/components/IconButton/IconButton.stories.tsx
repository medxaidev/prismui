import type { Meta, StoryObj } from '@storybook/react';
import { IconButton } from './IconButton';
import { PrismUIProvider } from '../../core/theme/provider/PrismUIProvider';
import { createTheme } from '../../core/theme/create-theme';

// ── Icon fixtures ─────────────────────────────────────────────────────────
// Decorative inline SVGs sized by `.root > svg { width/height: var(--icon-
// button-icon-size) }`. Authors ship stroke="currentColor" so the icon
// inherits the variant foreground — a common convention (Lucide, Phosphor).
const IconPlus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const IconClose = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);
const IconHeart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);
const IconTrash = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6" />
  </svg>
);
const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const meta = {
  title: 'Components/IconButton',
  component: IconButton,
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
    radius: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', 'full'],
    },
    'aria-label': { control: 'text' },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// 1. Default — minimal viable render. aria-label is MANDATORY (D-3) so
// every story provides one; passing `children` as a single icon satisfies
// the D-7 invariant.
export const Default: Story = {
  args: {
    'aria-label': 'Add item',
    children: <IconPlus />,
  },
};

// 2. Playground — exercises all controls through Storybook's args panel so
// designers can sanity-check combinations without writing a new story.
export const Playground: Story = {
  args: {
    'aria-label': 'Heart',
    children: <IconHeart />,
    variant: 'filled',
    size: 'md',
    color: 'primary',
    disabled: false,
    loading: false,
    radius: 'md',
  },
};

// 3. All Variants — visual parity check: each variant inherits the same
// width/height square from --icon-button-size; only the background / border
// / text-color tokens differ (Variant System outputs).
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <IconButton aria-label="Add (filled)" variant="filled"><IconPlus /></IconButton>
      <IconButton aria-label="Add (outlined)" variant="outlined"><IconPlus /></IconButton>
      <IconButton aria-label="Add (soft)" variant="soft"><IconPlus /></IconButton>
      <IconButton aria-label="Add (plain)" variant="plain"><IconPlus /></IconButton>
    </div>
  ),
};

// 4. All Sizes — D-1 square preserved across the five size tiers. Both the
// outer side length and the inner icon size scale proportionally (Size v3).
export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <IconButton aria-label="xs" size="xs"><IconPlus /></IconButton>
      <IconButton aria-label="sm" size="sm"><IconPlus /></IconButton>
      <IconButton aria-label="md" size="md"><IconPlus /></IconButton>
      <IconButton aria-label="lg" size="lg"><IconPlus /></IconButton>
      <IconButton aria-label="xl" size="xl"><IconPlus /></IconButton>
    </div>
  ),
};

// 5. Variant × Color matrix — mirrors Button's matrix story so reviewers can
// cross-check that both Action surfaces consume the same palette/tokens.
export const ColorMatrix: Story = {
  render: () => {
    const variants = ['filled', 'outlined', 'soft', 'plain'] as const;
    const colors = ['primary', 'secondary', 'info', 'success', 'warning', 'error', 'neutral'] as const;
    return (
      <div style={{ fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {variants.map((v) => (
          <div key={v} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: '#637381', width: 64, flexShrink: 0 }}>{v}</span>
            {colors.map((c) => (
              <IconButton key={c} aria-label={`${v} ${c}`} variant={v} color={c}>
                <IconHeart />
              </IconButton>
            ))}
          </div>
        ))}
      </div>
    );
  },
};

// 6. Disabled state — native <button disabled> + data-disabled attribute,
// both emitted via the shared Action state system.
export const DisabledState: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <IconButton aria-label="Normal"><IconPlus /></IconButton>
      <IconButton aria-label="Disabled filled" disabled><IconPlus /></IconButton>
      <IconButton aria-label="Disabled outlined" variant="outlined" disabled><IconPlus /></IconButton>
      <IconButton aria-label="Disabled soft" variant="soft" disabled><IconPlus /></IconButton>
      <IconButton aria-label="Disabled plain" variant="plain" disabled><IconPlus /></IconButton>
    </div>
  ),
};

// 7. Polymorphic — IconButton supports the same polymorphic surface as
// Button. `<a href>` becomes an anchor with no role injection; bare `<div>`
// receives role="button" (B-2) plus the Action Behavior hook's keyboard
// activation (F-1).
export const Polymorphic: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontFamily: 'sans-serif' }}>
      <IconButton aria-label="Native button"><IconPlus /></IconButton>
      <IconButton aria-label="Link to docs" component="a" href="#anchor"><IconHeart /></IconButton>
      <IconButton aria-label="Custom div"  component="div"><IconSearch /></IconButton>
    </div>
  ),
};

// 8. Loading state — D-8 contract:
//   · children are NOT rendered; the built-in spinner takes the icon slot
//   · spinner width/height === --icon-button-icon-size (zero layout shift)
//   · aria-busy="true" + data-loader="true" on root
//   · click / keyboard activation are swallowed (Action strategy)
export const LoadingStates: Story = {
  render: () => (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 640 }}>
      <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700 }}>Loading · D-8</h4>
      <p style={{ margin: '0 0 12px', fontSize: 12, color: '#637381' }}>
        Spinner replaces the icon at the <em>exact same</em> pixel size —
        toggling <code>loading</code> produces zero layout shift. Root gets{' '}
        <code>aria-busy="true"</code> and <code>data-loader="true"</code>;
        click / Enter / Space are all swallowed while loading.
      </p>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <IconButton aria-label="Saving" loading><IconPlus /></IconButton>
        <IconButton aria-label="Saving outlined" loading variant="outlined"><IconPlus /></IconButton>
        <IconButton aria-label="Saving soft"     loading variant="soft"><IconPlus /></IconButton>
        <IconButton aria-label="Saving xs"       loading size="xs"><IconPlus /></IconButton>
        <IconButton aria-label="Saving xl"       loading size="xl"><IconPlus /></IconButton>
      </div>
    </div>
  ),
};

// 9. Radius scale — including `radius="full"` for the classic circular icon
// button. Because width === height (D-1), 50% radius renders a perfect
// circle without any `shape` prop needed (OQ-IB5 decision).
export const RadiusScale: Story = {
  render: () => (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 640 }}>
      <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700 }}>Radius scale</h4>
      <p style={{ margin: '0 0 12px', fontSize: 12, color: '#637381' }}>
        <code>radius="full"</code> produces a perfect circle — D-1 square
        guarantees <code>50%</code> radius = full roundness without a
        separate <code>shape</code> prop (OQ-IB5).
      </p>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        {(['xs', 'sm', 'md', 'lg', 'xl', 'full'] as const).map((r) => (
          <IconButton key={r} aria-label={`radius ${r}`} radius={r}>
            <IconHeart />
          </IconButton>
        ))}
        <IconButton aria-label="radius 4px" radius="4px"><IconHeart /></IconButton>
      </div>
    </div>
  ),
};

// 10. Circle Button showcase — the canonical "FAB" use case. A filled
// circle IconButton is visually identical to a native FAB; pair with
// neutral/error colors for destructive quick actions.
export const CircleFAB: Story = {
  render: () => (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 640 }}>
      <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700 }}>
        Circle FAB · radius="full" + size="xl"
      </h4>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <IconButton aria-label="Add" radius="full" size="xl" color="primary"><IconPlus /></IconButton>
        <IconButton aria-label="Favorite" radius="full" size="xl" color="error" variant="soft"><IconHeart /></IconButton>
        <IconButton aria-label="Delete"   radius="full" size="lg" color="error" variant="filled"><IconTrash /></IconButton>
        <IconButton aria-label="Search"   radius="full" size="md" color="neutral" variant="plain"><IconSearch /></IconButton>
        <IconButton aria-label="Close"    radius="full" size="sm" color="neutral" variant="soft"><IconClose /></IconButton>
      </div>
    </div>
  ),
};

// 11. Three-channel overrides (props level) — classNames / styles / vars.
// `vars` is a FLAT record on IconButton (same shape as Button), writing
// directly onto the --icon-button-* namespace (SR-5 isolation).
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
          <IconButton aria-label="Ringed" classNames={{ root: 'custom-ring' }}><IconHeart /></IconButton>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#637381', width: 80 }}>styles</span>
          <IconButton aria-label="Square" styles={{ root: { borderRadius: '2px' } }}><IconHeart /></IconButton>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#637381', width: 80 }}>vars</span>
          <IconButton
            aria-label="Custom size"
            vars={{ '--icon-button-size': '56px', '--icon-button-icon-size': '28px' }}
          >
            <IconHeart />
          </IconButton>
        </div>
      </div>
    </div>
  ),
};

// 12. Theme defaultProps — theme.components.IconButton can preset any own
// prop. Explicit props still override. Demonstrates SR-3 registration.
export const ThemeDefaultProps: Story = {
  render: () => {
    const theme = createTheme({
      components: {
        IconButton: { defaultProps: { variant: 'soft', color: 'success', size: 'lg', radius: 'full' } },
      },
    });
    return (
      <div style={{ fontFamily: 'sans-serif', maxWidth: 640 }}>
        <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700 }}>
          theme.components.IconButton.defaultProps
        </h4>
        <p style={{ margin: '0 0 12px', fontSize: 12, color: '#637381' }}>
          Theme sets <code>variant=soft, color=success, size=lg, radius=full</code>.
          Explicit props still win.
        </p>
        <PrismUIProvider theme={theme}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <IconButton aria-label="Theme default"><IconHeart /></IconButton>
            <IconButton aria-label="Variant override" variant="filled"><IconHeart /></IconButton>
            <IconButton aria-label="Color override" color="error" size="sm"><IconTrash /></IconButton>
          </div>
        </PrismUIProvider>
      </div>
    );
  },
};

// 13. Toolbar composition — canonical real-world usage: a row of icon
// buttons sharing a semantic labelled container. Each IconButton still
// needs its own aria-label (parent role="toolbar" gives group semantics,
// but individual buttons are announced via their own label).
export const ToolbarComposition: Story = {
  render: () => (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 640 }}>
      <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700 }}>
        Toolbar composition
      </h4>
      <p style={{ margin: '0 0 12px', fontSize: 12, color: '#637381' }}>
        Typical usage in a toolbar / card header. Each button keeps its own
        <code> aria-label</code> — D-3 does not accept parent role="toolbar"
        as a substitute.
      </p>
      <div
        role="toolbar"
        aria-label="Post actions"
        style={{
          display: 'inline-flex',
          gap: 4,
          padding: 6,
          borderRadius: 12,
          background: '#f5f5f5',
        }}
      >
        <IconButton aria-label="Like"    variant="plain"><IconHeart /></IconButton>
        <IconButton aria-label="Search"  variant="plain"><IconSearch /></IconButton>
        <IconButton aria-label="Add"     variant="plain"><IconPlus /></IconButton>
        <IconButton aria-label="Delete"  variant="plain" color="error"><IconTrash /></IconButton>
        <IconButton aria-label="Dismiss" variant="plain"><IconClose /></IconButton>
      </div>
    </div>
  ),
};

// 14. D-6 stress test — IconButton icon size is driven by width/height NOT
// font-size, so an ambient `.parent { font-size: 40px }` MUST NOT enlarge
// the rendered glyph. This story surfaces the invariant visually: both
// IconButtons below render the same icon size despite the 40px font ancestor.
export const D6TypographyIsolation: Story = {
  render: () => (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 640 }}>
      <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700 }}>
        D-6 · Typography-inheritance isolation
      </h4>
      <p style={{ margin: '0 0 12px', fontSize: 12, color: '#637381' }}>
        Left: normal ancestor. Right: ancestor has{' '}
        <code>font-size: 40px</code>. Both icons must render at the same
        size — IconButton explicitly consumes <code>width</code>/
        <code>height</code> for the glyph, not <code>1em</code> / font-size.
      </p>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 11, color: '#637381', marginBottom: 4 }}>ancestor: default</div>
          <IconButton aria-label="Normal ancestor"><IconHeart /></IconButton>
        </div>
        <div style={{ fontSize: 40 }}>
          <div style={{ fontSize: 11, color: '#637381', marginBottom: 4 }}>ancestor: 40px</div>
          <IconButton aria-label="Large ancestor"><IconHeart /></IconButton>
        </div>
      </div>
    </div>
  ),
};

// 14.5 · FocusFeedback — A/B compare native outline vs glowFeedback (Phase 5)
// `feedbacks={[]}` opt-out leaves only the `:focus-visible` outline; default
// adds the soft halo via `box-shadow color-mix(... 32%, transparent)` plus
// the press source `rippleFeedback`. Tab to compare; do not click — `:focus-
// visible` only triggers on keyboard focus.
export const FocusFeedback: Story = {
  render: () => (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 640 }}>
      <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700 }}>
        Focus Feedback — glowFeedback A/B (Phase 5)
      </h4>
      <p style={{ margin: '0 0 12px', fontSize: 12, color: '#637381' }}>
        Tab into each IconButton (do <strong>not</strong> click — <code>:focus-
        visible</code> only triggers on keyboard focus). The left has{' '}
        <code>feedbacks={'{[]}'}</code> — native <code>:focus-visible</code>{' '}
        outline only. The right has the default{' '}
        <code>[rippleFeedback, glowFeedback]</code> — outline + soft halo via{' '}
        <code>box-shadow</code> with <code>color-mix(... 32%, transparent)</code>,
        fading via <code>transition: box-shadow var(--prismui-transition-fast)</code>.
      </p>
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 11, color: '#919EAB' }}>
            feedbacks=[] (native outline only)
          </span>
          <IconButton aria-label="Heart (no glow)" feedbacks={[]}>
            <IconHeart />
          </IconButton>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 11, color: '#919EAB' }}>default (ripple + glow)</span>
          <IconButton aria-label="Heart (with glow)">
            <IconHeart />
          </IconButton>
        </div>
      </div>
      <p style={{ marginTop: 16, fontSize: 11, color: '#919EAB' }}>
        DevTools tip: focus the right IconButton and observe the global class{' '}
        <code>prismui-glow-active</code> appear / disappear on the host element.
        Class lifecycle is driven by the <code>FeedbackController</code> · Phase 5
        ports the Button v0.6 pattern to IconButton 1:1 (contract v0.6 §11.4).
      </p>
    </div>
  ),
};

// 15. Focus ring — IconButton consumes the same focusRing tokens as Button,
// so theming a custom focus ring affects every Action Surface uniformly.
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
          Custom focusRing token (shared with Button)
        </h4>
        <p style={{ margin: '0 0 12px', fontSize: 12, color: '#637381' }}>
          Tab through the IconButtons to see the custom orange focus ring.
        </p>
        <PrismUIProvider theme={theme}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <IconButton aria-label="Focus 1" variant="filled"><IconHeart /></IconButton>
            <IconButton aria-label="Focus 2" variant="outlined"><IconHeart /></IconButton>
            <IconButton aria-label="Focus 3" variant="soft"><IconHeart /></IconButton>
            <IconButton aria-label="Focus 4" variant="plain"><IconHeart /></IconButton>
          </div>
        </PrismUIProvider>
      </div>
    );
  },
};

// 16. Reduced motion hint — verifies IV-A5 (prefers-reduced-motion):
// toggle the OS setting and confirm transitions + active-press + spinner
// rotation all stop. Shared behavior with Button.
export const ReducedMotionHint: Story = {
  render: () => (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 640 }}>
      <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700 }}>prefers-reduced-motion</h4>
      <p style={{ margin: '0 0 12px', fontSize: 12, color: '#637381' }}>
        Toggle your OS "Reduce motion" accessibility setting: transitions go
        away, <code>:active</code> no longer scales, spinner stops rotating.
      </p>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <IconButton aria-label="Hover/click"><IconHeart /></IconButton>
        <IconButton aria-label="Loading" loading><IconHeart /></IconButton>
      </div>
    </div>
  ),
};
