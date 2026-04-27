import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from '../Switch';
import { Checkbox } from '../Checkbox';
import { Radio } from './Radio';
import { RadioGroup } from './RadioGroup';

/**
 * Cross-C-2 · Visual Regression — Switch + Checkbox + Radio side-by-side.
 *
 * Purpose:
 *   - Pin the **C-2 Abstract family** visual harmony invariants:
 *       1. Host height + indicator-area dimensions across the 5-tier size system
 *          (xs / sm / md / lg / xl) match for Checkbox + Radio (per Radio v1.0
 *          IMPL-3 Cross-C-2 collapse · see `devdocs/components/Radio/design.md`
 *          §12.2 v1.0 Audit Log).
 *       2. Selected-state colour scheme is **inverted solid-fill** for all three
 *          (color-high-bg fill + white indicator) — Switch v1.0 / Checkbox v1.0
 *          / Radio v1.0 IMPL-2.
 *       3. The 7-color theme axis (primary / secondary / info / success /
 *          warning / error / neutral) drives the same pixel paint on all three
 *          components.
 *       4. Radius defaults differ by metaphor (Switch `'full'` · Checkbox `'sm'`
 *          · Radio `'full'` circular) — verified visually here.
 *
 * Reviewers: this is **not** a behaviour story. There are no controllers or
 * arg knobs. It exists to visually catch regressions when any single component
 * changes its size tier, colour token, or selected paint algorithm.
 */

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
const COLORS = [
  'primary',
  'secondary',
  'info',
  'success',
  'warning',
  'error',
  'neutral',
] as const;

const cellStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 56,
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  color: 'var(--prismui-color-text-secondary, #666)',
  textAlign: 'center',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
};

const headerCell: React.CSSProperties = {
  ...labelStyle,
  fontWeight: 600,
  paddingBottom: 8,
};

const meta = {
  title: 'Components/Cross-C-2 · Visual Regression',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Side-by-side rendering of Switch + Checkbox + Radio in the OFF and ON state across all 5 sizes and all 7 theme colors. Used to catch visual drift between the three C-2 Abstract family members. See `devdocs/components/Radio/v1-summary.md` §3 for the Cross-C-2 collapse rationale.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ── 1 · Size matrix · all 5 sizes × {off, on} for the three components ───
//
// Verifies IMPL-3 Cross-C-2 size + indicator-ratio collapse: each row pins one
// size tier; within a row Switch / Checkbox / Radio host heights should be
// visually consistent (Checkbox & Radio share an exact host box; Switch host
// is taller by design — its track metaphor — but their vertical centroids
// align).
export const SizeMatrix: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto repeat(6, 1fr)',
        gap: 12,
        alignItems: 'center',
        padding: 24,
      }}
    >
      <div />
      <div style={headerCell}>Switch · OFF</div>
      <div style={headerCell}>Switch · ON</div>
      <div style={headerCell}>Checkbox · OFF</div>
      <div style={headerCell}>Checkbox · ON</div>
      <div style={headerCell}>Radio · OFF</div>
      <div style={headerCell}>Radio · ON</div>

      {SIZES.map((size) => (
        <React.Fragment key={size}>
          <div style={labelStyle}>{size}</div>
          <div style={cellStyle}>
            <Switch size={size} defaultChecked={false} />
          </div>
          <div style={cellStyle}>
            <Switch size={size} defaultChecked />
          </div>
          <div style={cellStyle}>
            <Checkbox size={size} defaultChecked={false} />
          </div>
          <div style={cellStyle}>
            <Checkbox size={size} defaultChecked />
          </div>
          <div style={cellStyle}>
            <RadioGroup size={size} value="off">
              <Radio value="on" />
            </RadioGroup>
          </div>
          <div style={cellStyle}>
            <RadioGroup size={size} value="on">
              <Radio value="on" />
            </RadioGroup>
          </div>
        </React.Fragment>
      ))}
    </div>
  ),
};

// ── 2 · Color matrix · all 7 theme colours, ON state, three components ───
//
// Verifies IMPL-2 inverted solid-fill: the selected paint should match exactly
// across Switch track / Checkbox box / Radio outer circle for every colour.
// White indicators (Switch knob · Checkbox check · Radio inner dot) ride on
// top in all rows.
export const ColorMatrix: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto repeat(3, 1fr)',
        gap: 16,
        alignItems: 'center',
        padding: 24,
      }}
    >
      <div />
      <div style={headerCell}>Switch (md · ON)</div>
      <div style={headerCell}>Checkbox (md · ON)</div>
      <div style={headerCell}>Radio (md · ON)</div>

      {COLORS.map((color) => (
        <React.Fragment key={color}>
          <div style={labelStyle}>{color}</div>
          <div style={cellStyle}>
            <Switch color={color} defaultChecked />
          </div>
          <div style={cellStyle}>
            <Checkbox color={color} defaultChecked />
          </div>
          <div style={cellStyle}>
            <RadioGroup color={color} value="on">
              <Radio value="on" />
            </RadioGroup>
          </div>
        </React.Fragment>
      ))}
    </div>
  ),
};

// ── 3 · State matrix · OFF / disabled / loading / invalid (visual diff) ──
//
// Verifies state-system parity: disabled dims (opacity), loading swaps the
// indicator for a spinner (Switch S-7 · Checkbox CB-7 · Radio R-7), invalid
// surfaces only when the consumer wires Field-injected aria-invalid. This is
// the cross-family freeze-not-reset state contract visualised.
export const StateMatrix: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto repeat(3, 1fr)',
        gap: 16,
        alignItems: 'center',
        padding: 24,
      }}
    >
      <div />
      <div style={headerCell}>Switch</div>
      <div style={headerCell}>Checkbox</div>
      <div style={headerCell}>Radio</div>

      <div style={labelStyle}>OFF</div>
      <div style={cellStyle}>
        <Switch />
      </div>
      <div style={cellStyle}>
        <Checkbox />
      </div>
      <div style={cellStyle}>
        <RadioGroup value="">
          <Radio value="on" />
        </RadioGroup>
      </div>

      <div style={labelStyle}>ON</div>
      <div style={cellStyle}>
        <Switch defaultChecked />
      </div>
      <div style={cellStyle}>
        <Checkbox defaultChecked />
      </div>
      <div style={cellStyle}>
        <RadioGroup value="on">
          <Radio value="on" />
        </RadioGroup>
      </div>

      <div style={labelStyle}>disabled · OFF</div>
      <div style={cellStyle}>
        <Switch disabled />
      </div>
      <div style={cellStyle}>
        <Checkbox disabled />
      </div>
      <div style={cellStyle}>
        <RadioGroup value="" disabled>
          <Radio value="on" />
        </RadioGroup>
      </div>

      <div style={labelStyle}>disabled · ON</div>
      <div style={cellStyle}>
        <Switch disabled defaultChecked />
      </div>
      <div style={cellStyle}>
        <Checkbox disabled defaultChecked />
      </div>
      <div style={cellStyle}>
        <RadioGroup value="on" disabled>
          <Radio value="on" />
        </RadioGroup>
      </div>

      <div style={labelStyle}>loading · ON</div>
      <div style={cellStyle}>
        <Switch loading defaultChecked />
      </div>
      <div style={cellStyle}>
        <Checkbox loading defaultChecked />
      </div>
      <div style={cellStyle}>
        <RadioGroup value="on">
          <Radio value="on" loading />
        </RadioGroup>
      </div>
    </div>
  ),
};
