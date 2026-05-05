/**
 * Stage-15 Phase 1 · Grid primitive · Storybook.
 *
 * Grid is a CSS Grid container (LY-GRID-1). `columns` accepts either a
 * number (1-12, expanded to `repeat(n, minmax(0, 1fr))`) or an arbitrary
 * `grid-template-columns` template string (LY-GRID-2). Gap props are
 * SpacingScale (LY-GRID-3). Responsive object values are rejected at TS
 * level and DEV-warn at runtime (LY-GRID-4).
 *
 * Story topology (8 stories)
 *   1. Default              · 3 equal-width columns · default gap='md'
 *   2. Playground           · argTypes-driven · columns × gap × rowGap × columnGap
 *   3. NumberColumns        · 1-12 range · visualised per row
 *   4. StringTemplates      · "200px 1fr auto" style custom templates
 *   5. GapAxes              · gap vs rowGap+columnGap independent override
 *   6. ComposedWithBox      · <Box padding="lg"><Grid>…</Grid></Box>
 *   7. CardGallery          · realistic usage · responsive-like via string template
 *   8. ResponsiveAdvisory   · DEV warn demo for object columns (console output)
 */
import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { Grid } from './Grid';
import { Box } from '../Box/Box';
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

function Cell(props: { children?: React.ReactNode; tall?: boolean }) {
  return (
    <div
      style={{
        background: '#14b8a6',
        color: 'white',
        fontFamily: 'ui-monospace, monospace',
        fontSize: 12,
        padding: '10px 12px',
        borderRadius: 2,
        minHeight: props.tall ? 60 : undefined,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {props.children ?? 'cell'}
    </div>
  );
}

const SCALES: SpacingScale[] = ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];

const GRID_BG: React.CSSProperties = {
  background: '#ccfbf1',
  borderRadius: 2,
  padding: 4,
};

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Primitives/Layout/Grid',
  component: Grid,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Grid is the Stage-15 CSS-Grid primitive. `columns` accepts either ' +
          'a number (1-12, expanded to `repeat(n, minmax(0, 1fr))`) or a raw ' +
          '`grid-template-columns` template string. The open-value `columns` ' +
          'prop is delivered via a CSS custom property on the element\'s ' +
          '`style` attribute — the only Stage-15 primitive that does so, ' +
          'necessary because attribute selectors cannot enumerate template ' +
          'values. Responsive object values are rejected in v1 (LY-GRID-4).',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    columns: {
      control: { type: 'number', min: 1, max: 12, step: 1 },
      description: 'Number (1-12) or string template',
    },
    gap: { control: 'select', options: SCALES },
    rowGap: { control: 'select', options: [undefined, ...SCALES] },
    columnGap: { control: 'select', options: [undefined, ...SCALES] },
    component: {
      control: 'select',
      options: ['div', 'section', 'ul', 'ol', 'article'],
    },
  },
} satisfies Meta<typeof Grid>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** 3 equal-width columns · default gap='md'. */
export const Default: Story = {
  render: () => (
    <Frame label="<Grid columns={3}> · default gap='md'" width={500}>
      <Grid columns={3} style={GRID_BG}>
        <Cell>a</Cell>
        <Cell>b</Cell>
        <Cell>c</Cell>
        <Cell>d</Cell>
        <Cell>e</Cell>
        <Cell>f</Cell>
      </Grid>
    </Frame>
  ),
};

/**
 * Interactive playground. Use Controls to exercise columns + three gap
 * surfaces. Inspect the "HTML" panel to see `--prismui-grid-template-columns`
 * flowing through `style`, and data-gap / data-row-gap / data-column-gap
 * appearing on the root.
 */
export const Playground: Story = {
  args: { columns: 4, gap: 'md' },
  render: (args) => (
    <Frame label="Playground" width={560}>
      <Grid {...args} style={GRID_BG}>
        {Array.from({ length: 8 }, (_, i) => (
          <Cell key={i}>{i + 1}</Cell>
        ))}
      </Grid>
    </Frame>
  ),
};

/**
 * Number-form `columns`. Each Grid uses `columns=<n>` which expands to
 * `repeat(<n>, minmax(0, 1fr))`. Same child count (12) across all —
 * the row count depends on columns.
 */
export const NumberColumns: Story = {
  render: () => (
    <Stack gap="md">
      {[1, 2, 3, 4, 6, 12].map((n) => (
        <Frame key={n} label={`columns={${n}}`} width={560}>
          <Grid columns={n} gap="sm" style={GRID_BG}>
            {Array.from({ length: 12 }, (_, i) => (
              <Cell key={i}>{i + 1}</Cell>
            ))}
          </Grid>
        </Frame>
      ))}
    </Stack>
  ),
};

/**
 * String-form `columns`. Arbitrary `grid-template-columns` templates —
 * fixed widths, fr units, `auto`, `minmax()` — all pass through
 * unchanged to the CSS custom property.
 */
export const StringTemplates: Story = {
  render: () => {
    const templates = [
      '200px 1fr auto',
      '1fr 2fr 1fr',
      'repeat(2, minmax(120px, 1fr)) auto',
      'minmax(80px, 200px) 1fr minmax(80px, 200px)',
    ];
    return (
      <Stack gap="md">
        {templates.map((tpl) => (
          <Frame key={tpl} label={`columns="${tpl}"`} width={560}>
            <Grid columns={tpl} gap="sm" style={GRID_BG}>
              <Cell>A</Cell>
              <Cell>B</Cell>
              <Cell>C</Cell>
            </Grid>
          </Frame>
        ))}
      </Stack>
    );
  },
};

/**
 * `gap` vs `rowGap` / `columnGap` demonstrated. `rowGap` / `columnGap`
 * only emit their data-attr when set, and they win over `gap` per CSS
 * cascade order.
 */
export const GapAxes: Story = {
  render: () => (
    <Stack gap="md">
      <Frame label='gap="lg" (uniform)' width={560}>
        <Grid columns={3} gap="lg" style={GRID_BG}>
          {Array.from({ length: 6 }, (_, i) => (
            <Cell key={i}>{i + 1}</Cell>
          ))}
        </Grid>
      </Frame>
      <Frame label='gap="lg" · rowGap="xs" (rows tight · cols wide)' width={560}>
        <Grid columns={3} gap="lg" rowGap="xs" style={GRID_BG}>
          {Array.from({ length: 6 }, (_, i) => (
            <Cell key={i}>{i + 1}</Cell>
          ))}
        </Grid>
      </Frame>
      <Frame label='gap="sm" · columnGap="2xl" (rows tight · cols very wide)' width={560}>
        <Grid columns={3} gap="sm" columnGap="2xl" style={GRID_BG}>
          {Array.from({ length: 6 }, (_, i) => (
            <Cell key={i}>{i + 1}</Cell>
          ))}
        </Grid>
      </Frame>
    </Stack>
  ),
};

/**
 * LY-BOX-3 reverse composition: Grid owns tracks · Box owns inset.
 */
export const ComposedWithBox: Story = {
  render: () => (
    <Stack gap="md">
      <Frame label="bare Grid" width={480}>
        <Grid columns={3} gap="md" style={GRID_BG}>
          {Array.from({ length: 6 }, (_, i) => (
            <Cell key={i}>{i + 1}</Cell>
          ))}
        </Grid>
      </Frame>
      <Frame label='<Box padding="lg"><Grid columns={3}>…</Grid></Box>' width={480}>
        <Box padding="lg" style={GRID_BG}>
          <Grid columns={3} gap="md">
            {Array.from({ length: 6 }, (_, i) => (
              <Cell key={i}>{i + 1}</Cell>
            ))}
          </Grid>
        </Box>
      </Frame>
    </Stack>
  ),
};

/**
 * Realistic usage: a card gallery with 4 columns · gap='lg'. Shows the
 * primitive in a typical application context.
 */
export const CardGallery: Story = {
  render: () => (
    <Frame label='card gallery · columns={4} gap="lg"' width={640}>
      <Grid columns={4} gap="lg" style={GRID_BG}>
        {Array.from({ length: 8 }, (_, i) => (
          <Box key={i} padding="md" style={{ background: 'white', borderRadius: 6, border: '1px solid #e2e8f0' }}>
            <Stack gap="xs">
              <div
                style={{
                  height: 80,
                  background: '#f1f5f9',
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: 11,
                  color: '#64748b',
                }}
              >
                image
              </div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>Card {i + 1}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>description text</div>
            </Stack>
          </Box>
        ))}
      </Grid>
    </Frame>
  ),
};

/**
 * **Open the browser console** — passing a responsive object value to
 * `columns` (simulating `{ base: 1, md: 2 }`) is rejected by TS at
 * compile time, and forced-through values DEV-warn at runtime (LY-GRID-4).
 *
 * The warn message cites LY-GRID-4 / LY-CORE-6 and advises using a
 * single number or string template. Render is NOT blocked — the
 * primitive simply omits the `data-columns` marker and CSS var for
 * invalid inputs, falling back to the default no-columns behaviour.
 *
 * This story uses `as unknown` to bypass the TS guard so you can
 * observe the runtime advisory (do NOT copy this pattern into
 * application code — follow the TS error).
 */
export const ResponsiveAdvisory: Story = {
  render: () => {
    // Simulating a user attempting a responsive value. In real code the
    // TS compiler refuses to accept this shape on `columns`.
    const responsive = { base: 1, md: 2, lg: 3 } as unknown as number;
    return (
      <Frame label="columns={{ base: 1, md: 2, lg: 3 }} · DEV warn in console" width={480}>
        <Grid columns={responsive} gap="sm" style={GRID_BG}>
          <Cell>a</Cell>
          <Cell>b</Cell>
          <Cell>c</Cell>
        </Grid>
      </Frame>
    );
  },
};
