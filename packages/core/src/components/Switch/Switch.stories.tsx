import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from './Switch';
import { Field } from '../Field';

/**
 * Switch · Control Surface · C-2 Abstract.
 *
 * Design reference: `@/devdocs/components/Switch/design.md` v1.0.
 *
 * Storybook is organized to mirror the design invariants (S-1 ~ S-11) so
 * reviewers can visually confirm each contract layer:
 *
 *   1. Default / Playground   — basic + every arg wired
 *   2. Sizes / Colors / Radius — visual system axes (S-8 namespace, S-9 no variant)
 *   3. States                  — disabled / loading / invalid (S-7 freeze)
 *   4. Field integration       — S-6 / FCP-1~6 end-to-end
 *   5. Label click delegation  — S-6a compensated label→button click forwarding
 *   6. Focus mode B demo       — S-5 halo vs ring (mouse vs keyboard · pattern B真分轨)
 *   7. Silent bug guards       — S-1a (aria-pressed filter) · S-11 (type=button force)
 */
const meta = {
  title: 'Components/Switch',
  component: Switch,
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
    radius: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', 'full'],
    },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    required: { control: 'boolean' },
    defaultChecked: { control: 'boolean' },
    checked: {
      control: 'radio',
      options: [undefined, false, true],
    },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── 1 · Default — bare-minimum render. Uncontrolled, starts at off. ──────
export const Default: Story = {
  args: {},
};

// ── 2 · Playground — every knob exposed for manual exploration. ──────────
export const Playground: Story = {
  args: {
    size: 'md',
    color: 'primary',
    radius: 'full',
    disabled: false,
    loading: false,
    required: false,
    defaultChecked: false,
  },
};

// ── 3 · All Sizes — 5-tier Size System v3 (xs / sm / md / lg / xl) ───────
export const AllSizes: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        fontFamily: 'sans-serif',
      }}
    >
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
        <div
          key={s}
          style={{ display: 'flex', alignItems: 'center', gap: 12 }}
        >
          <span
            style={{
              fontSize: 11,
              color: '#637381',
              width: 36,
              flexShrink: 0,
            }}
          >
            {s}
          </span>
          <Switch size={s} defaultChecked={false} />
          <Switch size={s} defaultChecked />
        </div>
      ))}
    </div>
  ),
};

// ── 4 · All Colors — drives the ON-track fill via `color` prop. ──────────
export const AllColors: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
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
      ).map((c) => (
        <div
          key={c}
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
            {c}
          </span>
          <Switch color={c} defaultChecked />
        </div>
      ))}
    </div>
  ),
};

// ── 5 · Radius — default is `'full'` (physical-switch metaphor) ──────────
export const RadiusScale: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        fontFamily: 'sans-serif',
      }}
    >
      {(['xs', 'sm', 'md', 'lg', 'xl', 'full'] as const).map((r) => (
        <div
          key={r}
          style={{ display: 'flex', alignItems: 'center', gap: 12 }}
        >
          <span
            style={{
              fontSize: 11,
              color: '#637381',
              width: 48,
              flexShrink: 0,
            }}
          >
            {r}
          </span>
          <Switch radius={r} defaultChecked />
        </div>
      ))}
    </div>
  ),
};

// ── 6 · States — disabled / loading / invalid (S-7 freeze observable) ────
export const States: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 11, color: '#637381', width: 120 }}>
          disabled (off)
        </span>
        <Switch disabled />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 11, color: '#637381', width: 120 }}>
          disabled (on · S-7 freeze)
        </span>
        <Switch disabled defaultChecked />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 11, color: '#637381', width: 120 }}>
          loading (off)
        </span>
        <Switch loading />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 11, color: '#637381', width: 120 }}>
          loading (on · spinner)
        </span>
        <Switch loading defaultChecked />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 11, color: '#637381', width: 120 }}>
          aria-invalid (off)
        </span>
        <Switch aria-invalid="true" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 11, color: '#637381', width: 120 }}>
          aria-invalid (on)
        </span>
        <Switch aria-invalid="true" defaultChecked />
      </div>
    </div>
  ),
};

// ── 7 · Controlled · onCheckedChange back-channel ─────────────────────────
export const Controlled: Story = {
  render: () => {
    const [checked, setChecked] = React.useState(false);
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontFamily: 'sans-serif',
        }}
      >
        <Switch checked={checked} onCheckedChange={setChecked} />
        <span style={{ fontSize: 12, color: '#637381' }}>
          checked = <code>{String(checked)}</code>
        </span>
      </div>
    );
  },
};

// ── 8 · Field integration — FCP-1~6 end-to-end (S-6) ─────────────────────
// Demonstrates:
//   · id auto-injected from Field (FCP-1)
//   · aria-describedby aggregates descriptionId + errorId (FCP-4)
//   · aria-required projected from Field.required (FCP-2)
//   · aria-invalid driven by Field.invalid (FCP-5)
//   · label delegation toggles Switch on click (S-6a)
export const WithField: Story = {
  render: () => {
    const [checked, setChecked] = React.useState(true);
    return (
      <Field style={{ maxWidth: 360, display: 'grid', gap: 6 }}>
        <Field.Label
          style={{ fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
        >
          Enable email notifications
        </Field.Label>
        <Field.Description style={{ fontSize: 12, color: '#637381' }}>
          We&apos;ll only email you about security alerts and product updates.
        </Field.Description>
        <Switch
          checked={checked}
          onCheckedChange={setChecked}
          style={{ marginTop: 4 }}
        />
      </Field>
    );
  },
};

// ── 9 · Field · required + invalid (FE-3 + FCP-5 crossing) ───────────────
export const WithFieldRequired: Story = {
  render: () => (
    <Field required style={{ maxWidth: 360, display: 'grid', gap: 6 }}>
      <Field.Label
        style={{ fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
      >
        I accept the terms
      </Field.Label>
      <Switch style={{ marginTop: 4 }} />
    </Field>
  ),
};

export const WithFieldInvalid: Story = {
  render: () => (
    <Field
      invalid
      style={{ maxWidth: 360, display: 'grid', gap: 6 }}
    >
      <Field.Label
        style={{ fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
      >
        Error-state illustration
      </Field.Label>
      <Switch style={{ marginTop: 4 }} />
      <Field.Error style={{ fontSize: 12, color: '#d32f2f' }}>
        This switch must be turned on.
      </Field.Error>
    </Field>
  ),
};

// ── 10 · Field label click delegation (S-6a) ─────────────────────────────
// Click anywhere on the label text → Switch toggles. This bypasses the
// browser-dependent native `<label for="id">` forwarding behavior (which
// is inconsistent across Chrome / Firefox / Safari for role-driven targets)
// and dispatches the click through Field.Label's onClick delegation layer.
export const LabelClickDelegation: Story = {
  render: () => {
    const [checked, setChecked] = React.useState(false);
    return (
      <Field style={{ maxWidth: 360, display: 'grid', gap: 6 }}>
        <Field.Label
          style={{
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          Click this label to toggle the switch →
        </Field.Label>
        <Switch
          checked={checked}
          onCheckedChange={setChecked}
          style={{ marginTop: 4 }}
        />
        <div style={{ fontSize: 12, color: '#637381' }}>
          Internal state: <code>{String(checked)}</code>
        </div>
      </Field>
    );
  },
};

// ── 11 · Focus mode B demo (S-5 · halo + ring real两分轨) ─────────────────
// Instruction in the story body because Storybook cannot simulate the
// UA heuristic that drives `:focus-visible`:
//   · Click the switch with a mouse   → weak halo (box-shadow) appears
//   · Tab into the switch from keyboard → strong outline ring appears
//   · The two channels NEVER co-fire (CSS selectors are mutually exclusive
//     by specification — FE-2 anti-duplicate-signal guaranteed)
export const FocusModeBDemo: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        alignItems: 'flex-start',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: '#637381',
          maxWidth: 420,
          lineHeight: 1.5,
        }}
      >
        <strong>S-5 Focus mode B demo.</strong> Switch is the only PrismUI
        component whose focus contract genuinely supports two channels (halo
        + ring):
        <ul style={{ marginTop: 6, paddingLeft: 20 }}>
          <li>
            <strong>Mouse click</strong> the switch → weak{' '}
            <code>box-shadow</code> halo
          </li>
          <li>
            <strong>Tab</strong> from another element → strong{' '}
            <code>outline</code> ring
          </li>
        </ul>
        The two channels are mutually exclusive by CSS spec (
        <code>:focus:not(:focus-visible)</code> and{' '}
        <code>:focus-visible</code> cannot both match) — FE-2 guarantee.
      </div>
      <button
        type="button"
        style={{
          padding: '6px 12px',
          fontSize: 12,
          border: '1px solid #d0d5dd',
          borderRadius: 4,
          background: 'white',
          cursor: 'pointer',
        }}
      >
        (focus sink — click here first, then Tab / click the switch below)
      </button>
      <Switch defaultChecked={false} size="lg" />
    </div>
  ),
};

// ── 11.5 · FocusFeedback — L4 glow + ripple A/B (Phase 6) ──────────────
// Tab through (keyboard focus) to see the L4 glow halo layer coexist with
// the native :focus-visible outline (ring + halo · Button v0.6.1 parity).
// Mouse-click triggers the CSS-only S-5 mode-B pointer halo (independent
// channel · glow does NOT activate because focusVisible === false).
// Pressing the Switch activates the ripple — clipped to the pill boundary.
export const FocusFeedback: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        fontFamily: 'sans-serif',
        maxWidth: 720,
      }}
    >
      <h4 style={{ margin: '0', fontSize: 14, fontWeight: 700 }}>
        Focus Feedback — glow + ripple A/B (Phase 6)
      </h4>
      <p style={{ margin: '0', fontSize: 12, color: '#637381' }}>
        Tab into each Switch (keyboard). The default gets the outline + soft
        halo (ring + halo). <code>feedbacks={'{[]}'}</code> keeps the native
        outline + mode-B halo only. Pointer-click triggers ripple + mode-B
        halo on both — ripple is clipped to the pill boundary by{' '}
        <code>overflow: hidden</code>.
      </p>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 11, color: '#919EAB' }}>
            feedbacks=[] (native outline + mode-B halo only)
          </span>
          <Switch feedbacks={[]} size="lg" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 11, color: '#919EAB' }}>
            default (ripple + glow, Phase 6)
          </span>
          <Switch size="lg" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 11, color: '#919EAB' }}>
            defaultChecked=true · default feedbacks
          </span>
          <Switch defaultChecked size="lg" />
        </div>
      </div>
      <p style={{ marginTop: 8, fontSize: 11, color: '#919EAB' }}>
        DevTools tip: focus the third Switch and observe{' '}
        <code>data-checked='true'</code> AND class{' '}
        <code>prismui-glow-active</code> coexist on the button. Phase 6 invariant:
        S-2 checked pipeline and feedback factories operate on disjoint
        rendering channels (bg-fill vs box-shadow halo).
      </p>
    </div>
  ),
};

// ── 12 · Silent bug defense triplet (S-1a / S-11) ─────────────────────────
// Visually identical to Default + Label delegation stories above, but the
// underlying invariants (S-1a aria-pressed filter · S-11 type="button"
// force override) are verified in the test suite. This story simply notes
// that Switch inside <form onSubmit> does NOT submit on click.
export const SilentBugDefense: Story = {
  render: () => {
    const [count, setCount] = React.useState(0);
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 12, color: '#637381', maxWidth: 420 }}>
          S-11 · <strong>type=&quot;submit&quot; silent-bug guard.</strong>{' '}
          This Switch is wrapped in a <code>&lt;form&gt;</code> that
          increments on submit. Even though we pass{' '}
          <code>type=&quot;submit&quot;</code>, the component overrides to{' '}
          <code>type=&quot;button&quot;</code> → clicks do NOT submit the
          form → counter stays at 0.
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setCount((c) => c + 1);
          }}
          style={{ display: 'flex', alignItems: 'center', gap: 12 }}
        >
          <Switch
            {...({ type: 'submit' } as { type: 'submit' })}
            defaultChecked={false}
          />
          <span style={{ fontSize: 12, color: '#637381' }}>
            form submits: <code>{count}</code> (stays at 0)
          </span>
        </form>
      </div>
    );
  },
};

// ── 13 · Polymorphic — component="div" (S-10 keyboard contract ≥ Space) ──
export const PolymorphicDiv: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ fontSize: 12, color: '#637381', maxWidth: 420 }}>
        Polymorphic <code>&lt;div role=&quot;switch&quot;&gt;</code>. Space
        activates (S-10 contract); Enter is supported via the Action
        Behavior hook but NOT part of the keyboard contract (only{' '}
        <code>&lt;button&gt;</code> hosts inherit it natively).
      </div>
      <Switch component="div" tabIndex={0} />
    </div>
  ),
};
