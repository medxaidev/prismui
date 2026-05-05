/**
 * Stage-15 Phase 1 · Divider primitive · Storybook.
 *
 * Divider is the last of the six Layout primitives. It renders `<hr>`
 * by default (native `role="separator"`), supports `orientation`
 * (horizontal default / vertical), and does NOT own spacing — adjacent
 * spacing is the parent's responsibility via `<Stack gap>` / `<Inline
 * gap>` (LY-DIV-2 + LY-BOX-3 reverse).
 *
 * The LY-DIV-1 "honest a11y default" refinement (Round 1 Insight 1) is
 * visible in the DOM: user `role` / `aria-orientation` are NEVER
 * overwritten.
 *
 * Story topology (6 stories)
 *   1. Default              · <hr> · horizontal · inside a Stack
 *   2. Orientations         · horizontal + vertical side-by-side
 *   3. InStackContext       · 3 items separated by Dividers (Stack parent)
 *   4. InInlineContext      · 3 items separated by vertical Dividers (Inline parent)
 *   5. Polymorphic          · component="div" + a11y auto-augmentation · user role override
 *   6. ComposedWithBox      · <Box padding="lg"> adds the inset Divider forbids
 */
import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { Divider } from './Divider';
import { Stack } from '../Stack/Stack';
import { Inline } from '../Inline/Inline';
import { Box } from '../Box/Box';

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

function Item(props: { children?: React.ReactNode }) {
  return (
    <div
      style={{
        background: '#f97316',
        color: 'white',
        fontFamily: 'ui-monospace, monospace',
        fontSize: 12,
        padding: '6px 10px',
        borderRadius: 2,
      }}
    >
      {props.children ?? 'item'}
    </div>
  );
}

// Divider uses currentColor — give the Frame a darker text colour so
// the divider is visible on screen. This is purely for the stories;
// real apps inherit their own text colour.
const SURFACE_STYLE: React.CSSProperties = {
  color: '#0f172a',
  background: '#f8fafc',
  padding: 8,
  borderRadius: 2,
};

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Primitives/Layout/Divider',
  component: Divider,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Divider renders `<hr>` by default (native `role="separator"`). ' +
          'The `orientation` prop chooses `border-top` (horizontal · ' +
          'default) or `border-left` (vertical). Divider does NOT own ' +
          '`margin` — surround with `<Stack gap>` / `<Inline gap>` for ' +
          'spacing (LY-DIV-2 + LY-BOX-3 reverse). User `role` / ' +
          '`aria-orientation` are NEVER overwritten (LY-DIV-1 · Round 1 ' +
          'Insight 1 honest default).',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: { control: 'radio', options: ['horizontal', 'vertical'] },
    component: {
      control: 'select',
      options: ['hr', 'div', 'span', 'li'],
    },
  },
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * Default — renders as `<hr>`, horizontal orientation. Inspect the
 * "HTML" panel to verify: `role` attribute is absent (native `<hr>`
 * carries implicit `role="separator"`), `aria-orientation="horizontal"`
 * is explicit, and `data-orientation="horizontal"` drives the CSS.
 */
export const Default: Story = {
  render: () => (
    <Frame label="<Divider /> · default <hr>" width={360}>
      <div style={SURFACE_STYLE}>
        <Stack gap="md">
          <div>Above the divider</div>
          <Divider />
          <div>Below the divider</div>
        </Stack>
      </div>
    </Frame>
  ),
};

/**
 * Horizontal vs vertical orientation. Vertical dividers stretch to
 * match the cross-axis of their flex parent (`align-self: stretch` in
 * `Divider.module.css`).
 */
export const Orientations: Story = {
  render: () => (
    <Inline gap="lg" align="start">
      <Frame label='orientation="horizontal" (default)' width={320}>
        <div style={SURFACE_STYLE}>
          <Stack gap="sm">
            <div>top</div>
            <Divider orientation="horizontal" />
            <div>bottom</div>
          </Stack>
        </div>
      </Frame>
      <Frame label='orientation="vertical"' width={260}>
        <div style={{ ...SURFACE_STYLE, height: 100 }}>
          <Inline gap="md" style={{ height: '100%' }}>
            <div>left</div>
            <Divider orientation="vertical" />
            <div>middle</div>
            <Divider orientation="vertical" />
            <div>right</div>
          </Inline>
        </div>
      </Frame>
    </Inline>
  ),
};

/**
 * Realistic Stack usage — list sections separated by horizontal dividers.
 * Note the outer `<Stack gap="md">` owns the spacing around each
 * divider (LY-DIV-2: Divider has no margin of its own).
 */
export const InStackContext: Story = {
  render: () => (
    <Frame label='<Stack gap="md"> · 3 items + 2 dividers' width={360}>
      <div style={SURFACE_STYLE}>
        <Stack gap="md">
          <Item>section one</Item>
          <Divider />
          <Item>section two</Item>
          <Divider />
          <Item>section three</Item>
        </Stack>
      </div>
    </Frame>
  ),
};

/**
 * Realistic Inline usage — toolbar items separated by vertical
 * dividers. Same spacing-ownership rule: outer `<Inline gap>` owns the
 * gap; each Divider is just a thin line.
 */
export const InInlineContext: Story = {
  render: () => (
    <Frame label='<Inline gap="md"> · 3 items + 2 vertical dividers' width={440}>
      <div style={{ ...SURFACE_STYLE, height: 52, display: 'flex', alignItems: 'center' }}>
        <Inline gap="md" style={{ height: '100%' }}>
          <Item>file</Item>
          <Divider orientation="vertical" />
          <Item>edit</Item>
          <Divider orientation="vertical" />
          <Item>view</Item>
        </Inline>
      </div>
    </Frame>
  ),
};

/**
 * Polymorphic rendering + LY-DIV-1 honest a11y.
 *
 *   - `component="div"` (no user role) → Divider auto-adds
 *     `role="separator"` so screen readers still announce the divider.
 *   - `component="div" role="presentation"` → Divider forwards the user
 *     role unchanged (Round 1 Insight 1 · NEVER re-override). Verify in
 *     the "HTML" panel that role stays `presentation`.
 *   - `component="hr"` with explicit `role="none"` → user wins. `<hr>`
 *     normally has implicit `role="separator"`; passing `role="none"`
 *     defuses that.
 */
export const Polymorphic: Story = {
  render: () => (
    <Stack gap="md">
      <Frame label='component="div" · auto role="separator"' width={400}>
        <div style={SURFACE_STYLE}>
          <Stack gap="sm">
            <div>above</div>
            <Divider component="div" />
            <div>below</div>
          </Stack>
        </div>
      </Frame>
      <Frame label='component="div" role="presentation" · user wins' width={400}>
        <div style={SURFACE_STYLE}>
          <Stack gap="sm">
            <div>above</div>
            <Divider component="div" role="presentation" />
            <div>below</div>
          </Stack>
        </div>
      </Frame>
      <Frame label='<hr> role="none" · defuses native separator semantics' width={400}>
        <div style={SURFACE_STYLE}>
          <Stack gap="sm">
            <div>above</div>
            <Divider role="none" />
            <div>below</div>
          </Stack>
        </div>
      </Frame>
    </Stack>
  ),
};

/**
 * LY-BOX-3 reverse composition. Divider itself has no `padding` /
 * `margin`. If a consumer wants inset around a divider-containing
 * section, wrap with `<Box padding="…">` (same pattern as Stack /
 * Inline / Grid).
 */
export const ComposedWithBox: Story = {
  render: () => (
    <Inline gap="lg" align="start">
      <Frame label="bare · Divider has no margin" width={300}>
        <div style={SURFACE_STYLE}>
          <Stack gap="md">
            <div>item</div>
            <Divider />
            <div>item</div>
          </Stack>
        </div>
      </Frame>
      <Frame label='<Box padding="lg"> wraps the Stack+Divider' width={300}>
        <Box padding="lg" style={SURFACE_STYLE}>
          <Stack gap="md">
            <div>item</div>
            <Divider />
            <div>item</div>
          </Stack>
        </Box>
      </Frame>
    </Inline>
  ),
};
