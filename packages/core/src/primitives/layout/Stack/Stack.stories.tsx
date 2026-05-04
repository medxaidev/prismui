/**
 * Stage-15 Phase 1 · Stack primitive · Storybook.
 *
 * Stack is vertical flex (LY-STACK-1) — column direction is hard-locked.
 * For horizontal layouts use the upcoming `<Inline>` primitive (Phase 1
 * iteration #3). Stack does NOT accept `padding` / `margin` (LY-BOX-3
 * reverse): wrap it with `<Box padding="md">` to add inset spacing.
 *
 * Visual helpers (local · same shape as Box.stories.tsx)
 *   - `<Frame>`  — dashed outer wrapper · provides bounds for visual scale
 *   - `<Item>`   — coloured child block · makes gap / align observable
 *
 * Story topology (8 stories)
 *   1. Default              · 3 children · default gap='md' · default align/justify
 *   2. Playground           · argTypes-driven · gap × align × justify × component
 *   3. GapScaleGallery      · one Stack per SpacingScale key (none → 3xl)
 *   4. AlignShowcase        · 5 align literals side by side
 *   5. JustifyShowcase      · 6 justify literals (requires fixed height)
 *   6. ComposedWithBox      · <Box padding="lg"><Stack>…</Stack></Box> — LY-BOX-3 split
 *   7. Polymorphic          · component="ul" / "ol" / "section" / "nav"
 *   8. ZeroRuntimeProof     · default Stack DOM inspection · `data-gap="md"` only
 */
import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { Stack } from './Stack';
import { Box } from '../Box/Box';
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

function Item(props: { children?: React.ReactNode; width?: number | string }) {
  return (
    <div
      style={{
        background: '#6366f1',
        color: 'white',
        fontFamily: 'ui-monospace, monospace',
        fontSize: 12,
        padding: '6px 10px',
        borderRadius: 2,
        width: props.width,
      }}
    >
      {props.children ?? 'item'}
    </div>
  );
}

const SCALES: SpacingScale[] = ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];
const ALIGNS = ['start', 'center', 'end', 'stretch', 'baseline'] as const;
const JUSTIFIES = ['start', 'center', 'end', 'between', 'around', 'evenly'] as const;

// Background tint makes Stack's bounding box visible (Stack itself has no
// default background — LY-STACK-1 is geometry only). Forwarded via `style`
// (LY-CORE-7), Stack.module.css stays untouched.
const STACK_BG: React.CSSProperties = {
  background: '#e0e7ff',
  borderRadius: 2,
  padding: 4, // tiny inset so users can see Stack's edge vs Frame's edge
};

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Primitives/Layout/Stack',
  component: Stack,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Stack is the Stage-15 vertical-flex primitive. It locks ' +
          '`flex-direction: column` (use `<Inline>` for row), accepts only ' +
          '`SpacingScale` for `gap` (default `"md"`), and exposes literal-union ' +
          '`align` / `justify` surfaces. Stack does NOT take `padding` / ' +
          '`margin` — wrap with `<Box padding="…">` instead (LY-BOX-3).',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    gap: { control: 'select', options: SCALES },
    align: { control: 'select', options: [undefined, ...ALIGNS] },
    justify: { control: 'select', options: [undefined, ...JUSTIFIES] },
    component: {
      control: 'select',
      options: ['div', 'section', 'article', 'ul', 'ol', 'nav', 'main'],
    },
  },
} satisfies Meta<typeof Stack>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** Bare Stack with three children. Default gap = `md`. */
export const Default: Story = {
  render: () => (
    <Frame label="<Stack> · default gap='md'" width={240}>
      <Stack style={STACK_BG}>
        <Item>first</Item>
        <Item>second</Item>
        <Item>third</Item>
      </Stack>
    </Frame>
  ),
};

/**
 * Interactive playground. Use the Controls panel to drive every prop —
 * inspect the resulting DOM under "HTML" to see `data-gap`, `data-align`,
 * `data-justify` flip in real time.
 */
export const Playground: Story = {
  args: { gap: 'md', component: 'div' },
  render: (args) => (
    <Frame label="Playground" width={280}>
      <Stack {...args} style={{ ...STACK_BG, minHeight: 200 }}>
        <Item>alpha</Item>
        <Item>beta</Item>
        <Item width={100}>gamma</Item>
      </Stack>
    </Frame>
  ),
};

/**
 * One Stack per `SpacingScale` key — visualises the full token ladder
 * (none → 3xl) on a single screen.
 */
export const GapScaleGallery: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start' }}>
      {SCALES.map((scale) => (
        <Frame key={scale} label={`gap="${scale}"`} width={140}>
          <Stack gap={scale} style={STACK_BG}>
            <Item>1</Item>
            <Item>2</Item>
            <Item>3</Item>
          </Stack>
        </Frame>
      ))}
    </div>
  ),
};

/**
 * 5-literal `align` surface. Each Stack has the same width so the
 * cross-axis (horizontal) alignment difference is obvious. Children have
 * varied widths so `stretch` looks distinct from `start`.
 */
export const AlignShowcase: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start' }}>
      {ALIGNS.map((align) => (
        <Frame key={align} label={`align="${align}"`} width={180}>
          <Stack align={align} gap="sm" style={STACK_BG}>
            <Item width={60}>short</Item>
            <Item width={120}>medium width</Item>
            <Item width={90}>middle</Item>
          </Stack>
        </Frame>
      ))}
    </div>
  ),
};

/**
 * 6-literal `justify` surface. Each Stack is given a fixed `minHeight` so
 * `justify-content` (which only affects free space along the main axis)
 * has room to demonstrate its effect. `between` / `around` / `evenly`
 * differ only in the distribution algorithm — read DevTools to confirm.
 */
export const JustifyShowcase: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start' }}>
      {JUSTIFIES.map((justify) => (
        <Frame key={justify} label={`justify="${justify}"`} width={160}>
          <Stack justify={justify} gap="none" style={{ ...STACK_BG, minHeight: 220 }}>
            <Item>1</Item>
            <Item>2</Item>
            <Item>3</Item>
          </Stack>
        </Frame>
      ))}
    </div>
  ),
};

/**
 * Composition pattern that ADR-006 decision 10 (LY-BOX-3 reverse)
 * promotes: **Box owns padding · Stack owns gap**. This story makes the
 * split explicit — same Stack, with and without an outer `<Box>` adding
 * inset spacing.
 */
export const ComposedWithBox: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <Frame label="bare Stack (no outer padding)" width={220}>
        <Stack gap="md" style={STACK_BG}>
          <Item>a</Item>
          <Item>b</Item>
          <Item>c</Item>
        </Stack>
      </Frame>
      <Frame label='<Box padding="lg"><Stack gap="md">…</Stack></Box>' width={260}>
        <Box padding="lg" style={STACK_BG}>
          <Stack gap="md">
            <Item>a</Item>
            <Item>b</Item>
            <Item>c</Item>
          </Stack>
        </Box>
      </Frame>
    </div>
  ),
};

/**
 * Polymorphic rendering. Inspect "HTML" panel — the host element changes
 * (ul / ol / section / nav) but the Stack contract (vertical flex + gap)
 * stays identical.
 */
export const Polymorphic: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <Frame label='component="div"' width={160}>
        <Stack gap="sm" style={STACK_BG}>
          <Item>div · 1</Item>
          <Item>div · 2</Item>
        </Stack>
      </Frame>
      <Frame label='component="ul"' width={160}>
        <Stack component="ul" gap="sm" style={{ ...STACK_BG, listStyle: 'none', margin: 0 }}>
          <Item>ul li 1</Item>
          <Item>ul li 2</Item>
        </Stack>
      </Frame>
      <Frame label='component="nav"' width={180}>
        <Stack component="nav" gap="xs" aria-label="primary" style={STACK_BG}>
          <Item>nav 1</Item>
          <Item>nav 2</Item>
          <Item>nav 3</Item>
        </Stack>
      </Frame>
      <Frame label='component="section"' width={180}>
        <Stack component="section" gap="md" style={STACK_BG}>
          <Item>section · α</Item>
          <Item>section · β</Item>
        </Stack>
      </Frame>
    </div>
  ),
};

/**
 * Zero-runtime + honest-default proof. Default Stack emits exactly ONE
 * data-attr (`data-gap="md"`) and ZERO inline styles. align / justify are
 * absent because the default values come from `.root` CSS — no attribute
 * pollution at the default state.
 *
 * Open the "HTML" panel to verify.
 */
export const ZeroRuntimeProof: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <Frame label="default Stack · data-gap='md' only" width={220}>
        <Stack style={STACK_BG}>
          <Item>i</Item>
          <Item>ii</Item>
        </Stack>
      </Frame>
      <Frame label="full overrides · 3 data-attrs" width={220}>
        <Stack gap="lg" align="center" justify="between" style={{ ...STACK_BG, minHeight: 160 }}>
          <Item>i</Item>
          <Item>ii</Item>
        </Stack>
      </Frame>
    </div>
  ),
};
