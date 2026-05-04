/**
 * Stage-15 Phase 1 · Inline primitive · Storybook.
 *
 * Inline is horizontal flex (LY-INLINE-1) — row direction is hard-locked.
 * For vertical layouts use `<Stack>`. Inline does NOT accept `padding` /
 * `margin` (LY-BOX-3 reverse). Default `align: center` (note: differs
 * from Stack's `stretch`).
 *
 * Story topology (8 stories)
 *   1. Default              · 4 children · default gap='md', align='center'
 *   2. Playground           · argTypes-driven · gap × align × justify × wrap × component
 *   3. GapScaleGallery      · 8 SpacingScale keys side-by-side
 *   4. AlignShowcase        · 5 align literals · varied child heights
 *   5. JustifyShowcase      · 6 justify literals · fixed container width
 *   6. WrapBehaviour        · wrap=false (overflow) vs wrap=true (multi-line)
 *   7. Polymorphic          · component="nav" / "ul" / "header" / "section"
 *   8. SymmetryWithStack    · LY-INLINE-3 demoted observation · same shape ⊥ direction
 */
import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { Inline } from './Inline';
import { Stack } from '../Stack/Stack';
import type { SpacingScale } from '../../../core/theme/types/token-scale.types';

// ── Visual helpers (local · not exported) ─────────────────────────────────────

function Frame(props: { children: React.ReactNode; label?: string; width?: number | string }) {
  return (
    <div
      style={{
        display: 'inline-block',
        verticalAlign: 'top',
        border: '1px dashed #94a3b8',
        borderRadius: 4,
        padding: 4,
        width: props.width,
      }}
    >
      {props.label ? (
        <div
          style={{
            fontSize: 11,
            color: '#64748b',
            marginBottom: 4,
            fontFamily: 'ui-monospace, monospace',
          }}
        >
          {props.label}
        </div>
      ) : null}
      {props.children}
    </div>
  );
}

function Item(props: { children?: React.ReactNode; height?: number | string; width?: number | string }) {
  return (
    <div
      style={{
        background: '#0ea5e9',
        color: 'white',
        fontFamily: 'ui-monospace, monospace',
        fontSize: 12,
        padding: '6px 10px',
        borderRadius: 2,
        whiteSpace: 'nowrap',
        height: props.height,
        width: props.width,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {props.children ?? 'item'}
    </div>
  );
}

const SCALES: SpacingScale[] = ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];
const ALIGNS = ['start', 'center', 'end', 'stretch', 'baseline'] as const;
const JUSTIFIES = ['start', 'center', 'end', 'between', 'around', 'evenly'] as const;

const INLINE_BG: React.CSSProperties = {
  background: '#e0f2fe',
  borderRadius: 2,
  padding: 4,
};

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Primitives/Layout/Inline',
  component: Inline,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Inline is the Stage-15 horizontal-flex primitive. It locks ' +
          '`flex-direction: row` (use `<Stack>` for column), defaults ' +
          '`align-items: center` (vs Stack\'s `stretch`), and adds a `wrap` ' +
          'boolean toggle on top of Stack\'s shape. Same `gap` / `align` / ' +
          '`justify` surfaces as Stack — see LY-INLINE-3 (demoted to a ' +
          'design-algebra observation in Round 1).',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    gap: { control: 'select', options: SCALES },
    align: { control: 'select', options: [undefined, ...ALIGNS] },
    justify: { control: 'select', options: [undefined, ...JUSTIFIES] },
    wrap: { control: 'boolean' },
    component: {
      control: 'select',
      options: ['div', 'nav', 'ul', 'ol', 'header', 'footer', 'section'],
    },
  },
} satisfies Meta<typeof Inline>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** Bare Inline with four children. Default gap = `md`, align = `center`. */
export const Default: Story = {
  render: () => (
    <Frame label="<Inline> · default gap='md' align='center'" width={420}>
      <Inline style={INLINE_BG}>
        <Item>one</Item>
        <Item>two</Item>
        <Item>three</Item>
        <Item>four</Item>
      </Inline>
    </Frame>
  ),
};

/**
 * Interactive playground. Use Controls to toggle every prop. Open the
 * "HTML" panel to verify `data-gap` is always present, `data-wrap` is
 * a *valueless* boolean attribute (presence-only · matches `<input
 * disabled>`), and align/justify only appear when set.
 */
export const Playground: Story = {
  args: { gap: 'md', wrap: false, component: 'div' },
  render: (args) => (
    <Frame label="Playground" width={520}>
      <Inline {...args} style={{ ...INLINE_BG, minHeight: 80 }}>
        <Item>alpha</Item>
        <Item>beta</Item>
        <Item>gamma</Item>
        <Item>delta</Item>
        <Item>epsilon</Item>
      </Inline>
    </Frame>
  ),
};

/**
 * Full SpacingScale ladder (none → 3xl) — same as Stack's gallery, but
 * laid out horizontally. Shows the symmetry of the gap surface.
 */
export const GapScaleGallery: Story = {
  render: () => (
    <Stack gap="md">
      {SCALES.map((scale) => (
        <Frame key={scale} label={`gap="${scale}"`} width={520}>
          <Inline gap={scale} style={INLINE_BG}>
            <Item>1</Item>
            <Item>2</Item>
            <Item>3</Item>
            <Item>4</Item>
            <Item>5</Item>
          </Inline>
        </Frame>
      ))}
    </Stack>
  ),
};

/**
 * 5-literal `align` surface. Children have varied heights so the
 * cross-axis alignment is visually distinct. `baseline` is observable
 * because Items contain text — switching to baseline aligns the text
 * baselines rather than the boxes.
 */
export const AlignShowcase: Story = {
  render: () => (
    <Stack gap="sm">
      {ALIGNS.map((align) => (
        <Frame key={align} label={`align="${align}"`} width={520}>
          <Inline align={align} gap="sm" style={{ ...INLINE_BG, minHeight: 80 }}>
            <Item height={20}>20px</Item>
            <Item height={50}>50px</Item>
            <Item height={32}>32px</Item>
            <Item height={64}>64px</Item>
          </Inline>
        </Frame>
      ))}
    </Stack>
  ),
};

/**
 * 6-literal `justify` surface. Each Inline has a fixed container width
 * so `justify-content` has free space to distribute. `between` /
 * `around` / `evenly` differ only in distribution algorithm.
 */
export const JustifyShowcase: Story = {
  render: () => (
    <Stack gap="sm">
      {JUSTIFIES.map((justify) => (
        <Frame key={justify} label={`justify="${justify}"`} width={520}>
          <Inline justify={justify} gap="none" style={INLINE_BG}>
            <Item width={60}>1</Item>
            <Item width={60}>2</Item>
            <Item width={60}>3</Item>
          </Inline>
        </Frame>
      ))}
    </Stack>
  ),
};

/**
 * `wrap` boolean toggle. With `wrap=false` (default), children are
 * forced onto one line and may overflow the container. With `wrap=true`,
 * children flow onto additional lines as needed.
 *
 * Inspect the DOM: `wrap=true` adds a *valueless* `data-wrap` attribute
 * (no `"true"` / `"false"` string), which matches the native HTML
 * boolean-attribute idiom.
 */
export const WrapBehaviour: Story = {
  render: () => (
    <Stack gap="md">
      <Frame label="wrap=false (default · single line · may overflow)" width={360}>
        <Inline gap="sm" style={{ ...INLINE_BG, overflow: 'hidden' }}>
          {Array.from({ length: 8 }, (_, i) => (
            <Item key={i} width={60}>{`it-${i + 1}`}</Item>
          ))}
        </Inline>
      </Frame>
      <Frame label="wrap=true (multi-line · valueless data-wrap attr)" width={360}>
        <Inline wrap gap="sm" style={INLINE_BG}>
          {Array.from({ length: 8 }, (_, i) => (
            <Item key={i} width={60}>{`it-${i + 1}`}</Item>
          ))}
        </Inline>
      </Frame>
    </Stack>
  ),
};

/**
 * Polymorphic rendering. Inspect the "HTML" panel — host element changes
 * but Inline's contract (horizontal flex + gap + align center default)
 * stays identical. `component="nav"` pairs naturally with `aria-label`.
 */
export const Polymorphic: Story = {
  render: () => (
    <Stack gap="sm">
      <Frame label='component="div"' width={420}>
        <Inline gap="sm" style={INLINE_BG}>
          <Item>div · 1</Item>
          <Item>div · 2</Item>
          <Item>div · 3</Item>
        </Inline>
      </Frame>
      <Frame label='component="nav" aria-label="primary"' width={420}>
        <Inline component="nav" aria-label="primary" gap="sm" style={INLINE_BG}>
          <Item>home</Item>
          <Item>about</Item>
          <Item>contact</Item>
        </Inline>
      </Frame>
      <Frame label='component="ul"' width={420}>
        <Inline
          component="ul"
          gap="sm"
          style={{ ...INLINE_BG, listStyle: 'none', margin: 0, padding: 4 }}
        >
          <Item>li 1</Item>
          <Item>li 2</Item>
        </Inline>
      </Frame>
      <Frame label='component="header"' width={420}>
        <Inline component="header" justify="between" gap="md" style={INLINE_BG}>
          <Item>logo</Item>
          <Item>account ▾</Item>
        </Inline>
      </Frame>
    </Stack>
  ),
};

/**
 * Demonstrates the design-algebra observation captured as
 * §10.2 LY-INLINE-3 (demoted from invariant in Round 1):
 *   **Inline ↔ Stack are mirror primitives — same prop surface
 *   except `wrap`, only the direction differs.**
 *
 * Visualises that mirror by rendering identical content in both, side
 * by side. Note: this is not a *guarded* invariant (no lint channel) —
 * it's a deliberate API-design choice that consumers can rely on.
 */
export const SymmetryWithStack: Story = {
  render: () => (
    <Inline gap="lg" align="start">
      <Frame label='<Stack gap="md">' width={160}>
        <Stack gap="md" style={INLINE_BG}>
          <Item>α</Item>
          <Item>β</Item>
          <Item>γ</Item>
        </Stack>
      </Frame>
      <Frame label='<Inline gap="md">' width={300}>
        <Inline gap="md" style={INLINE_BG}>
          <Item>α</Item>
          <Item>β</Item>
          <Item>γ</Item>
        </Inline>
      </Frame>
    </Inline>
  ),
};
