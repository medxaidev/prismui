/**
 * Stage-15 Phase 1 · Center primitive · Storybook.
 *
 * Center is the simplest Layout primitive — a flex container that centers
 * its (single) child on both axes (LY-CENTER-1). It does NOT accept `gap` /
 * `padding` / `margin`. For multiple items, use `<Stack>` or `<Inline>`.
 *
 * The DEV multi-child warning (LY-CENTER-2) only fires in dev builds; you
 * can observe it in the browser console while running Storybook.
 *
 * Story topology (6 stories)
 *   1. Default              · single child centred in a fixed-size container
 *   2. Polymorphic          · `component="section" / "main" / "a"`
 *   3. ContainerSizes       · same Center · different parent sizes (proves
 *                              centering is relative to the Center's box)
 *   4. ComposedWithBox      · <Box padding="lg"><Center>…</Center></Box>
 *   5. SingleChildVariety   · text / image / form / icon — all single-child
 *   6. MultiChildAdvisory   · DEV warn demonstration · open browser console
 */
import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { Center } from './Center';
import { Box } from '../Box/Box';

// ── Visual helpers (local · not exported) ─────────────────────────────────────

function Frame(props: { children: React.ReactNode; label?: string; width?: number | string; height?: number | string }) {
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
      <div style={{ width: '100%', height: props.height }}>{props.children}</div>
    </div>
  );
}

function Pill(props: { children?: React.ReactNode }) {
  return (
    <div
      style={{
        background: '#a855f7',
        color: 'white',
        fontFamily: 'ui-monospace, monospace',
        fontSize: 12,
        padding: '8px 14px',
        borderRadius: 999,
      }}
    >
      {props.children ?? 'centred'}
    </div>
  );
}

// Center has no default visual — provide a tinted background via `style`
// (LY-CORE-7 passthrough) so its bounds are visible. CSS file untouched.
const CENTER_BG: React.CSSProperties = {
  background: '#fae8ff',
  borderRadius: 2,
};

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Primitives/Layout/Center',
  component: Center,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Center is the simplest Stage-15 Layout primitive: a flex ' +
          'container that centers a single child on both axes ' +
          '(`align-items: center; justify-content: center`). It accepts no ' +
          'spacing props (LY-BOX-3 · use `<Box>` for inset). In DEV, ' +
          'rendering more than one child emits a one-time `console.warn` ' +
          'advising migration to `<Stack>` / `<Inline>` (LY-CENTER-2 · ' +
          'render is not blocked).',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    component: {
      control: 'select',
      options: ['div', 'section', 'main', 'article', 'aside', 'a'],
    },
  },
} satisfies Meta<typeof Center>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** Single child centred in a 320×120 box. */
export const Default: Story = {
  render: () => (
    <Frame label="<Center> · 320×120" width={320} height={120}>
      <Center style={{ ...CENTER_BG, height: '100%' }}>
        <Pill>centred</Pill>
      </Center>
    </Frame>
  ),
};

/**
 * Polymorphic rendering. The host element changes — the centring
 * contract stays. Inspect the "HTML" panel to verify the tag.
 */
export const Polymorphic: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <Frame label='component="div"' width={200} height={100}>
        <Center style={{ ...CENTER_BG, height: '100%' }}>
          <Pill>div</Pill>
        </Center>
      </Frame>
      <Frame label='component="section"' width={200} height={100}>
        <Center component="section" style={{ ...CENTER_BG, height: '100%' }}>
          <Pill>section</Pill>
        </Center>
      </Frame>
      <Frame label='component="main"' width={200} height={100}>
        <Center component="main" style={{ ...CENTER_BG, height: '100%' }}>
          <Pill>main</Pill>
        </Center>
      </Frame>
      <Frame label='component="a"' width={200} height={100}>
        <Center
          component="a"
          href="https://example.com"
          style={{ ...CENTER_BG, height: '100%', textDecoration: 'none' }}
        >
          <Pill>{'<a href="…">'}</Pill>
        </Center>
      </Frame>
    </div>
  ),
};

/**
 * Same Center · varying parent dimensions. Demonstrates that Center's
 * centering is relative to **its own** flex container, which fills
 * whatever bounds the parent provides.
 */
export const ContainerSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
      <Frame label="120×120 (square)" width={120} height={120}>
        <Center style={{ ...CENTER_BG, height: '100%' }}>
          <Pill>·</Pill>
        </Center>
      </Frame>
      <Frame label="240×80 (wide)" width={240} height={80}>
        <Center style={{ ...CENTER_BG, height: '100%' }}>
          <Pill>·</Pill>
        </Center>
      </Frame>
      <Frame label="120×200 (tall)" width={120} height={200}>
        <Center style={{ ...CENTER_BG, height: '100%' }}>
          <Pill>·</Pill>
        </Center>
      </Frame>
      <Frame label="320×140 (default)" width={320} height={140}>
        <Center style={{ ...CENTER_BG, height: '100%' }}>
          <Pill>·</Pill>
        </Center>
      </Frame>
    </div>
  ),
};

/**
 * LY-BOX-3 reverse composition — Center owns geometry only. To add inset
 * around the centred child, wrap with `<Box padding="…">`. (Note: padding
 * sits *outside* the centring frame — try toggling between the two boxes
 * to feel the difference.)
 */
export const ComposedWithBox: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      <Frame label="bare <Center>" width={240} height={120}>
        <Center style={{ ...CENTER_BG, height: '100%' }}>
          <Pill>centred</Pill>
        </Center>
      </Frame>
      <Frame label='<Box padding="lg"><Center>…</Center></Box>' width={240} height={120}>
        <Box padding="lg" style={{ ...CENTER_BG, height: '100%' }}>
          <Center style={{ height: '100%' }}>
            <Pill>centred + padded</Pill>
          </Center>
        </Box>
      </Frame>
    </div>
  ),
};

/**
 * Different "single child" payloads — text, image, form input, icon —
 * all valid uses of Center. Each Center receives exactly one child, so no
 * DEV warning fires.
 */
export const SingleChildVariety: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <Frame label="text node" width={180} height={80}>
        <Center style={{ ...CENTER_BG, height: '100%', fontFamily: 'ui-monospace, monospace' }}>
          plain text
        </Center>
      </Frame>
      <Frame label="<img>" width={180} height={120}>
        <Center style={{ ...CENTER_BG, height: '100%' }}>
          <img
            alt="placeholder"
            width={64}
            height={64}
            src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='32' r='28' fill='%23a855f7'/></svg>"
          />
        </Center>
      </Frame>
      <Frame label="<input>" width={220} height={80}>
        <Center style={{ ...CENTER_BG, height: '100%' }}>
          <input
            type="text"
            placeholder="type here…"
            style={{ padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: 4 }}
          />
        </Center>
      </Frame>
      <Frame label="emoji icon" width={160} height={80}>
        <Center style={{ ...CENTER_BG, height: '100%', fontSize: 32 }}>
          <span role="img" aria-label="rocket">🚀</span>
        </Center>
      </Frame>
    </div>
  ),
};

/**
 * **Open the browser console** — when a Center receives more than one
 * child, a one-time `console.warn` is emitted advising `<Stack>` /
 * `<Inline>`. Render is NOT blocked (centering still works on the flex
 * container as a whole), but this is no longer the primitive's
 * intended use.
 *
 * The warning fires **once per Center instance**: re-renders of the
 * same instance with multi-child content do NOT spam the console.
 */
export const MultiChildAdvisory: Story = {
  render: () => (
    <Frame label="<Center> with 3 children · check console for DEV warn" width={360} height={120}>
      <Center style={{ ...CENTER_BG, height: '100%' }}>
        <Pill>one</Pill>
        <Pill>two</Pill>
        <Pill>three</Pill>
      </Center>
    </Frame>
  ),
};
