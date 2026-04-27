import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { RadioGroup } from './RadioGroup';
import { Radio } from './Radio';
import { Field } from '../Field';

/**
 * Radio + RadioGroup · Control Surface · C-2 Abstract family.
 *
 * Design reference: `@/devdocs/components/Radio/design.md` v0.2.
 *
 * Storybook organization mirrors the design invariants (R-1 ~ R-11 + RG-*)
 * so reviewers can visually confirm each contract layer:
 *
 *   1. Default / Playground   — basic RadioGroup uncontrolled
 *   2. Sizes / Colors          — 5-tier Size System + color axes (R-8)
 *   3. Orientation             — horizontal vs vertical (R-10)
 *   4. Disabled / Loading      — group-level propagation + per-item override
 *   5. Controlled              — value / onValueChange round-trip (R-2)
 *   6. Standalone Radio        — no group context (P0-1 A fallback)
 *   7. Field integration       — invalid × focus + Field.Label delegation (P0-2 A)
 *   8. Feedback opt-out        — group-level `feedbacks={[]}` (§5.4)
 *   9. Focus mode-B demo       — halo (mouse) vs ring (keyboard)
 *  10. Custom radius           — `radius='full'` default vs `sm` / `md`
 */
const meta = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    color: {
      control: 'select',
      options: [
        'primary',
        'secondary',
        'info',
        'success',
        'warning',
        'error',
        'neutral',
      ],
    },
    orientation: {
      control: 'radio',
      options: ['horizontal', 'vertical'],
    },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    loop: { control: 'boolean' },
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

// Reusable inline-label helper — Radio has no built-in label slot per R-1a.
const InlineLabel: React.FC<{
  children: React.ReactNode;
  value: string;
  disabled?: boolean;
}> = ({ children, value, disabled }) => (
  <label
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.6 : 1,
    }}
  >
    <Radio value={value} disabled={disabled} />
    <span>{children}</span>
  </label>
);

// ── 1 · Default — bare-minimum render ────────────────────────────────────
export const Default: Story = {
  args: {
    defaultValue: 'medium',
  },
  render: (args) => (
    <RadioGroup {...args}>
      <InlineLabel value="small">Small</InlineLabel>
      <InlineLabel value="medium">Medium</InlineLabel>
      <InlineLabel value="large">Large</InlineLabel>
    </RadioGroup>
  ),
};

// ── 2 · Playground — every knob exposed ─────────────────────────────────
export const Playground: Story = {
  args: {
    size: 'md',
    color: 'primary',
    orientation: 'vertical',
    disabled: false,
    loop: true,
    defaultValue: 'b',
  },
  render: (args) => (
    <RadioGroup {...args}>
      <InlineLabel value="a">Option A</InlineLabel>
      <InlineLabel value="b">Option B</InlineLabel>
      <InlineLabel value="c">Option C</InlineLabel>
    </RadioGroup>
  ),
};

// ── 3 · All Sizes — 5-tier Size System v3 ───────────────────────────────
export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <RadioGroup
          key={size}
          size={size}
          defaultValue="b"
          orientation="horizontal"
        >
          <InlineLabel value="a">{size.toUpperCase()} · A</InlineLabel>
          <InlineLabel value="b">{size.toUpperCase()} · B</InlineLabel>
          <InlineLabel value="c">{size.toUpperCase()} · C</InlineLabel>
        </RadioGroup>
      ))}
    </div>
  ),
};

// ── 4 · All Colors — full ThemeColor enum (7-tier) per Checkbox parity ──────
// Each row is a RadioGroup with a different `color`, demonstrating that the
// child Radios inherit the color token from the group (R-9 child-explicit-
// wins · group inheritance).
export const AllColors: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: 20,
        fontFamily: 'sans-serif',
      }}
    >
      {(
        [
          'primary',
          'secondary',
          'info',
          'success',
          'warning',
          'error',
          'neutral',
        ] as const
      ).map((color) => (
        <div
          key={color}
          style={{ display: 'flex', alignItems: 'center', gap: 12 }}
        >
          <span
            style={{
              fontSize: 11,
              color: '#637381',
              width: 80,
              flexShrink: 0,
            }}
          >
            {color}
          </span>
          <RadioGroup color={color} defaultValue="b" orientation="horizontal">
            <InlineLabel value="a">A</InlineLabel>
            <InlineLabel value="b">B</InlineLabel>
            <InlineLabel value="c">C</InlineLabel>
          </RadioGroup>
        </div>
      ))}
    </div>
  ),
};

// ── 5 · Horizontal orientation ──────────────────────────────────────────
export const Horizontal: Story = {
  args: {
    orientation: 'horizontal',
    defaultValue: 'm',
  },
  render: (args) => (
    <RadioGroup {...args}>
      <InlineLabel value="s">Small</InlineLabel>
      <InlineLabel value="m">Medium</InlineLabel>
      <InlineLabel value="l">Large</InlineLabel>
    </RadioGroup>
  ),
};

// ── 6 · Disabled — group-level + per-item ────────────────────────────────
export const Disabled: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <div style={{ marginBottom: 8, fontSize: 12, opacity: 0.7 }}>
          group-level disabled (all children frozen)
        </div>
        <RadioGroup disabled defaultValue="b">
          <InlineLabel value="a">A</InlineLabel>
          <InlineLabel value="b">B</InlineLabel>
          <InlineLabel value="c">C</InlineLabel>
        </RadioGroup>
      </div>
      <div>
        <div style={{ marginBottom: 8, fontSize: 12, opacity: 0.7 }}>
          per-item disabled (arrow-key navigation skips)
        </div>
        <RadioGroup defaultValue="a">
          <InlineLabel value="a">Enabled</InlineLabel>
          <InlineLabel value="b" disabled>
            Disabled
          </InlineLabel>
          <InlineLabel value="c">Enabled</InlineLabel>
        </RadioGroup>
      </div>
    </div>
  ),
};

// ── 7 · Controlled — explicit value + onValueChange ──────────────────────
export const Controlled: Story = {
  render: () => {
    const [value, setValue] = React.useState('b');
    return (
      <div>
        <RadioGroup value={value} onValueChange={setValue}>
          <InlineLabel value="a">A</InlineLabel>
          <InlineLabel value="b">B</InlineLabel>
          <InlineLabel value="c">C</InlineLabel>
        </RadioGroup>
        <p style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}>
          Current value: <strong>{value}</strong>
        </p>
      </div>
    );
  },
};

// ── 8 · Standalone Radio (P0-1 A fallback · no RadioGroup parent) ────────
export const Standalone: Story = {
  render: () => {
    const [checked, setChecked] = React.useState(false);
    return (
      <label
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer',
        }}
      >
        <Radio checked={checked} onCheckedChange={setChecked} />
        <span>Standalone · {checked ? 'on' : 'off'}</span>
      </label>
    );
  },
};

// ── 9 · Field integration — invalid × focus + label delegation (P0-2 A) ─
export const FieldIntegration: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Field required>
        <Field.Label>Pick a plan</Field.Label>
        <RadioGroup defaultValue="free">
          <InlineLabel value="free">Free</InlineLabel>
          <InlineLabel value="pro">Pro</InlineLabel>
          <InlineLabel value="team">Team</InlineLabel>
        </RadioGroup>
        <Field.Description>
          Clicking the label focuses + selects the first enabled Radio.
        </Field.Description>
      </Field>
      <Field invalid>
        <Field.Label>Invalid group</Field.Label>
        <RadioGroup>
          <InlineLabel value="a">A</InlineLabel>
          <InlineLabel value="b">B</InlineLabel>
        </RadioGroup>
        <Field.Error>Please make a selection.</Field.Error>
      </Field>
    </div>
  ),
};

// ── 10 · Feedback opt-out — group-level `feedbacks={[]}` ────────────────
export const FeedbackOptOut: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <div style={{ marginBottom: 8, fontSize: 12, opacity: 0.7 }}>
          Default (ripple + glow feedback active)
        </div>
        <RadioGroup defaultValue="b">
          <InlineLabel value="a">A</InlineLabel>
          <InlineLabel value="b">B</InlineLabel>
        </RadioGroup>
      </div>
      <div>
        <div style={{ marginBottom: 8, fontSize: 12, opacity: 0.7 }}>
          Opt-out (no ripple, no glow · pipeline still works)
        </div>
        <RadioGroup defaultValue="b" feedbacks={[]}>
          <InlineLabel value="a">A</InlineLabel>
          <InlineLabel value="b">B</InlineLabel>
        </RadioGroup>
      </div>
    </div>
  ),
};

// ── 11 · Loop navigation — arrow-key wrap-around ────────────────────────
export const LoopNavigation: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <div style={{ marginBottom: 8, fontSize: 12, opacity: 0.7 }}>
          loop (default) — ArrowDown at last wraps to first
        </div>
        <RadioGroup loop defaultValue="a">
          <InlineLabel value="a">A</InlineLabel>
          <InlineLabel value="b">B</InlineLabel>
          <InlineLabel value="c">C</InlineLabel>
        </RadioGroup>
      </div>
      <div>
        <div style={{ marginBottom: 8, fontSize: 12, opacity: 0.7 }}>
          loop={false} — ArrowDown at last stays at last
        </div>
        <RadioGroup loop={false} defaultValue="a">
          <InlineLabel value="a">A</InlineLabel>
          <InlineLabel value="b">B</InlineLabel>
          <InlineLabel value="c">C</InlineLabel>
        </RadioGroup>
      </div>
    </div>
  ),
};
