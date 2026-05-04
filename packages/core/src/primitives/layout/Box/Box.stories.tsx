/**
 * Stage-15 Phase 1 · Box primitive · Storybook.
 *
 * Goal of this file: let a human *see* the data-attr → CSS-var pipeline end to
 * end in a real browser (jsdom can't prove that `--prismui-spacing-md` resolves
 * to `1rem` at paint time — unit tests only check the attribute contract).
 *
 * Visual helpers
 * --------------
 * Box is a pure geometric primitive with **no default visual contract**
 * (no background / border / typography — see LY-BOX-1). To make its bounds
 * visible in stories we wrap assertions in a `<Frame>` + `<Swatch>` pair:
 *
 *   - `<Frame>`  — a dashed outline drawn via inline style on a plain `<div>`
 *                  *outside* Box, so it never touches Box itself.
 *   - `<Swatch>` — coloured content placed *inside* Box to visualize padding.
 *
 * Both helpers are defined locally and deliberately kept un-exported: the
 * primitive's public API stays untouched.
 *
 * Story topology (8 stories)
 *   1. Default             · naked Box (no styling · surface check)
 *   2. Playground          · argTypes-driven · covers all 8 spacing props
 *   3. PaddingScaleGallery · one Box per SpacingScale key (shorthand `padding`)
 *   4. PaddingDirections   · padding / X / Y / Top / Right / Bottom / Left
 *   5. MarginShowcase      · sibling Boxes demonstrating `margin`
 *   6. Polymorphic         · `component` swaps to section / a / button
 *   7. Composition         · `<Box padding="md">` wrapping mixed content
 *   8. ZeroRuntimeProof    · bare Box vs data-attr-driven Box · no inline style
 */
import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { Box } from './Box';
import type { SpacingScale } from '../../../core/theme/types/token-scale.types';

// ── Visual helpers (local · not exported) ─────────────────────────────────────

/**
 * Dashed outer frame. We draw the frame on an outer wrapper, NOT on the Box
 * itself, so the Box under test keeps its zero-style contract (LY-BOX-1).
 * The wrapper adds a tiny fixed padding of its own (4 px) so the Box's edge
 * is clearly visible even when the Box's own padding is `none`.
 */
function Frame(props: { children: React.ReactNode; label?: string }) {
  return (
    <div
      style={{
        display: 'inline-block',
        border: '1px dashed #94a3b8',
        borderRadius: 4,
        padding: 4,
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

/**
 * Filled swatch placed inside a Box. A solid background makes padding visible
 * because the Box's colour shows through wherever the swatch cannot reach.
 */
function Swatch(props: { children?: React.ReactNode; width?: number | string }) {
  return (
    <div
      style={{
        background: '#6366f1',
        color: 'white',
        fontFamily: 'ui-monospace, monospace',
        fontSize: 12,
        padding: '4px 8px',
        borderRadius: 2,
        width: props.width,
      }}
    >
      {props.children ?? 'child'}
    </div>
  );
}

const SCALES: SpacingScale[] = ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];

// A neutral background on Box makes padding "show up" as a coloured border
// around the child swatch. We pass it via `style` on purpose — Box forwards
// arbitrary style through (LY-CORE-7) and this keeps the primitive's own
// CSS completely untouched.
const BOX_BG: React.CSSProperties = {
  background: '#e0e7ff',
  borderRadius: 2,
};

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Primitives/Layout/Box',
  component: Box,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Box is the Stage-15 L0 geometric primitive. It renders `<div>` by ' +
          'default, is polymorphic via the `component` prop, and exclusively owns ' +
          '`padding*` / `margin` props (LY-BOX-3). Every spacing prop is delivered ' +
          'via a `data-*` attribute that the CSS Module resolves to ' +
          '`var(--prismui-spacing-<key>)` at paint time — zero runtime style.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    padding: { control: 'select', options: [undefined, ...SCALES] },
    paddingX: { control: 'select', options: [undefined, ...SCALES] },
    paddingY: { control: 'select', options: [undefined, ...SCALES] },
    paddingTop: { control: 'select', options: [undefined, ...SCALES] },
    paddingRight: { control: 'select', options: [undefined, ...SCALES] },
    paddingBottom: { control: 'select', options: [undefined, ...SCALES] },
    paddingLeft: { control: 'select', options: [undefined, ...SCALES] },
    margin: { control: 'select', options: [undefined, ...SCALES] },
    component: {
      control: 'select',
      options: ['div', 'section', 'article', 'aside', 'main', 'a', 'button', 'span'],
    },
  },
} satisfies Meta<typeof Box>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** Surface check: bare Box renders its children with no injected visual. */
export const Default: Story = {
  render: () => (
    <Frame label="<Box>">
      <Box style={BOX_BG}>
        <Swatch>Box with no props</Swatch>
      </Box>
    </Frame>
  ),
};

/**
 * Interactive playground. Use the Controls panel to exercise every spacing
 * prop and the polymorphic `component` prop at once. The resulting DOM is
 * inspectable in the "HTML" panel — every set control becomes a `data-*`
 * attribute on the rendered element.
 */
export const Playground: Story = {
  args: {
    padding: 'md',
    component: 'div',
  },
  render: (args) => (
    <Frame label="Playground">
      <Box {...args} style={BOX_BG}>
        <Swatch>inspect the DOM · every set prop becomes `data-*`</Swatch>
      </Box>
    </Frame>
  ),
};

/**
 * One Box per `SpacingScale` key using the shorthand `padding` prop.
 * Visualises the full 8-step token ladder (none → 3xl) side by side.
 */
export const PaddingScaleGallery: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
      {SCALES.map((scale) => (
        <Frame key={scale} label={`padding="${scale}"`}>
          <Box padding={scale} style={BOX_BG}>
            <Swatch width={60}>{scale}</Swatch>
          </Box>
        </Frame>
      ))}
    </div>
  ),
};

/**
 * Exercises each of the seven `padding*` directional props independently.
 * Each Box gets a single direction at `lg` so the asymmetric spacing is
 * visually obvious.
 */
export const PaddingDirections: Story = {
  render: () => {
    const directions: Array<{
      label: string;
      prop: Partial<React.ComponentProps<typeof Box>>;
    }> = [
      { label: 'padding="lg"', prop: { padding: 'lg' } },
      { label: 'paddingX="lg"', prop: { paddingX: 'lg' } },
      { label: 'paddingY="lg"', prop: { paddingY: 'lg' } },
      { label: 'paddingTop="lg"', prop: { paddingTop: 'lg' } },
      { label: 'paddingRight="lg"', prop: { paddingRight: 'lg' } },
      { label: 'paddingBottom="lg"', prop: { paddingBottom: 'lg' } },
      { label: 'paddingLeft="lg"', prop: { paddingLeft: 'lg' } },
    ];
    return (
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {directions.map(({ label, prop }) => (
          <Frame key={label} label={label}>
            <Box {...prop} style={BOX_BG}>
              <Swatch width={80}>child</Swatch>
            </Box>
          </Frame>
        ))}
      </div>
    );
  },
};

/**
 * `margin` demonstrated via sibling Boxes. The dashed outer frame is the
 * parent — the gaps between the inner filled Boxes are produced by their own
 * `margin` prop.
 */
export const MarginShowcase: Story = {
  render: () => (
    <Frame label="parent (dashed) · children use margin">
      <div style={{ display: 'flex', flexWrap: 'wrap', background: '#fef3c7', padding: 1 }}>
        {(['none', 'sm', 'md', 'lg', 'xl'] as const).map((scale) => (
          <Box key={scale} margin={scale} style={BOX_BG} padding="sm">
            <Swatch>margin={scale}</Swatch>
          </Box>
        ))}
      </div>
    </Frame>
  ),
};

/**
 * Polymorphic rendering. Every card renders the same logical Box but maps to
 * a different host element — verify in the "HTML" panel. Note: when
 * `component="button"`, Box forwards `onClick` / `type` etc. straight through
 * (LY-CORE-7) without touching them; Box itself stays geometry-only.
 */
export const Polymorphic: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <Frame label='component="div" (default)'>
        <Box padding="md" style={BOX_BG}>
          <Swatch>div</Swatch>
        </Box>
      </Frame>
      <Frame label='component="section"'>
        <Box component="section" padding="md" style={BOX_BG}>
          <Swatch>section</Swatch>
        </Box>
      </Frame>
      <Frame label='component="a"'>
        <Box
          component="a"
          href="https://example.com"
          padding="md"
          style={{ ...BOX_BG, display: 'inline-block', textDecoration: 'none' }}
        >
          <Swatch>{'<a href="…">'}</Swatch>
        </Box>
      </Frame>
      <Frame label='component="button"'>
        <Box
          component="button"
          type="button"
          padding="md"
          onClick={() => {
            // eslint-disable-next-line no-alert
            alert('Box rendered as <button> still receives onClick');
          }}
          style={{
            ...BOX_BG,
            border: 'none',
            font: 'inherit',
            cursor: 'pointer',
          }}
        >
          <Swatch>click me</Swatch>
        </Box>
      </Frame>
    </div>
  ),
};

/**
 * Composition preview — previews how Box will be combined with the other
 * Phase-1 primitives once they land. Today the "Stack" area is a plain flex
 * wrapper; the story makes the split of responsibility explicit: **Box owns
 * padding; Stack/Inline/Grid will own gap** (LY-BOX-3 · ADR-006 decision 10).
 */
export const Composition: Story = {
  render: () => (
    <Frame label="<Box padding='lg'>…</Box>">
      <Box padding="lg" style={BOX_BG}>
        {/* Placeholder Stack — real <Stack> lands next Phase-1 iteration. */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Swatch>first child</Swatch>
          <Swatch>second child</Swatch>
          <Swatch>third child</Swatch>
        </div>
      </Box>
    </Frame>
  ),
};

/**
 * Zero-runtime proof. The left Box has no spacing props → its DOM element
 * has **no** `style=""` attribute and **no** `data-padding-*`. The right Box
 * has `padding="xl"` → the element gets exactly ONE new DOM attribute
 * (`data-padding="xl"`) and the CSS Module's attribute-selector rule takes
 * over. No inline styles are ever produced by Box itself.
 *
 * Open the "HTML" panel to verify.
 */
export const ZeroRuntimeProof: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <Frame label="no props · no data-*">
        <Box style={BOX_BG}>
          <Swatch width={140}>zero attrs</Swatch>
        </Box>
      </Frame>
      <Frame label='padding="xl" · one data-*'>
        <Box padding="xl" style={BOX_BG}>
          <Swatch width={140}>data-padding="xl"</Swatch>
        </Box>
      </Frame>
    </div>
  ),
};
