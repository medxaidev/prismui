import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox, type CheckboxCheckedState } from './Checkbox';
import { Field } from '../Field';
import { Switch } from '../Switch';

/**
 * Checkbox · Control Surface · C-2 Abstract · three-state checked.
 *
 * Design reference: `@/devdocs/components/Checkbox/design.md` v0.1.1 (Round 1
 * Pre-impl 签字版).
 *
 * Storybook is organized to mirror the design invariants (CB-1 ~ CB-11 plus
 * CB-1a / CB-6a) so reviewers can visually confirm each contract layer:
 *
 *   1. Default / Playground   — basic + every arg wired
 *   2. Sizes / Colors / Radius — visual system axes (CB-8 namespace, CB-9 no variant)
 *   3. Tri-state               — 🔴 Checkbox's differentiator from Switch
 *   4. States                  — disabled / loading / invalid (CB-7 freeze)
 *   5. Field integration       — CB-6 / FCP-1~6 end-to-end (incl. tri-state)
 *   6. Label click delegation  — CB-6a cross-component reuse of Switch v1.0
 *   7. Focus mode B demo       — CB-5 halo vs ring (Switch 的第二载体)
 *   8. Cross-component halo    — 🔴 first time the `theme.focusPointerHalo`
 *                                token is visually verified across two C-2
 *                                carriers in the same page
 *   9. Silent bug guards       — CB-1a (aria-pressed filter) · CB-10
 *                                (`<a href>` fallback) · CB-11 (type=button
 *                                force)
 *  10. P0-2 honesty demo       — FCP-2 opt-out × Label delegation divergence
 *                                (rendered so designers can see the known
 *                                system-level limitation)
 */
const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
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
      options: ['0', 'xs', 'sm', 'md', 'lg', 'xl', 'full'],
    },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    required: { control: 'boolean' },
    defaultChecked: { control: 'boolean' },
    checked: {
      control: 'radio',
      options: [undefined, false, true, 'mixed'],
    },
  },
} satisfies Meta<typeof Checkbox>;

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
    radius: 'sm',
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
          <Checkbox size={s} defaultChecked={false} />
          <Checkbox size={s} defaultChecked />
          <Checkbox size={s} checked="mixed" onCheckedChange={() => {}} />
        </div>
      ))}
    </div>
  ),
};

// ── 4 · All Colors — drives the ON/MIXED-box fill via `color` prop. ──────
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
          <Checkbox color={c} defaultChecked />
          <Checkbox color={c} checked="mixed" onCheckedChange={() => {}} />
        </div>
      ))}
    </div>
  ),
};

// ── 5 · Radius — default is `'sm'` (small rounded square · checkbox
// metaphor · aligned with iOS / Material / Radix / MUI) ─────────────────
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
      {(['0', 'xs', 'sm', 'md', 'lg', 'xl', 'full'] as const).map((r) => (
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
          <Checkbox radius={r} defaultChecked />
        </div>
      ))}
    </div>
  ),
};

// ── 6 · Tri-state (🔴 Checkbox's differentiator from Switch) ─────────────
// WAI-ARIA three-state cycle: false → true → false. `'mixed'` represents
// the "some items selected" state of a header checkbox; clicking it resolves
// to `true` (select all) per WAI-ARIA authoring practices.
export const TriState: Story = {
  render: () => {
    const [c, setC] = React.useState<CheckboxCheckedState>('mixed');
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          fontFamily: 'sans-serif',
          maxWidth: 420,
        }}
      >
        <div style={{ fontSize: 12, color: '#637381', lineHeight: 1.5 }}>
          <strong>CB-1 tri-state.</strong> Unlike Switch (strict binary),
          Checkbox supports <code>checked="mixed"</code> (WAI-ARIA
          indeterminate). Typical use: a header row checkbox reflecting the
          selection state of child rows. Click cycles{' '}
          <code>mixed → true → false → true</code> per WAI-ARIA spec.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Checkbox checked={c} onCheckedChange={setC} />
          <span style={{ fontSize: 12, color: '#637381' }}>
            checked = <code>{String(c)}</code>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={() => setC(false)}>
            Reset to false
          </button>
          <button type="button" onClick={() => setC('mixed')}>
            Set to mixed
          </button>
          <button type="button" onClick={() => setC(true)}>
            Set to true
          </button>
        </div>
      </div>
    );
  },
};

// ── 7 · States — disabled / loading / invalid (CB-7 freeze observable) ───
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
        <span style={{ fontSize: 11, color: '#637381', width: 180 }}>
          disabled (off)
        </span>
        <Checkbox disabled />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 11, color: '#637381', width: 180 }}>
          disabled (on · CB-7 freeze)
        </span>
        <Checkbox disabled defaultChecked />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 11, color: '#637381', width: 180 }}>
          disabled (mixed · CB-7 tri-state freeze)
        </span>
        <Checkbox
          disabled
          checked="mixed"
          onCheckedChange={() => {}}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 11, color: '#637381', width: 180 }}>
          loading (off)
        </span>
        <Checkbox loading />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 11, color: '#637381', width: 180 }}>
          loading (on · spinner in indicator)
        </span>
        <Checkbox loading defaultChecked />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 11, color: '#637381', width: 180 }}>
          aria-invalid (off · FE-3 border danger)
        </span>
        <Checkbox aria-invalid="true" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 11, color: '#637381', width: 180 }}>
          aria-invalid (on · outline swap on focus)
        </span>
        <Checkbox aria-invalid="true" defaultChecked />
      </div>
    </div>
  ),
};

// ── 8 · Controlled · onCheckedChange back-channel ─────────────────────────
export const Controlled: Story = {
  render: () => {
    const [checked, setChecked] = React.useState<CheckboxCheckedState>(false);
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontFamily: 'sans-serif',
        }}
      >
        <Checkbox checked={checked} onCheckedChange={setChecked} />
        <span style={{ fontSize: 12, color: '#637381' }}>
          checked = <code>{String(checked)}</code>
        </span>
      </div>
    );
  },
};

// ── 9 · Field integration — FCP-1~6 end-to-end (CB-6) ────────────────────
// Demonstrates:
//   · id auto-injected from Field (FCP-1)
//   · aria-describedby aggregates descriptionId + errorId (FCP-4)
//   · aria-required projected from Field.required (FCP-2)
//   · aria-invalid driven by Field.invalid (FCP-5)
//   · label delegation toggles Checkbox on click (CB-6a)
export const WithField: Story = {
  render: () => {
    const [checked, setChecked] = React.useState<CheckboxCheckedState>(false);
    return (
      <Field style={{ maxWidth: 360, display: 'grid', gap: 6 }}>
        <Field.Label
          style={{ fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
        >
          I agree to the Terms of Service
        </Field.Label>
        <Field.Description style={{ fontSize: 12, color: '#637381' }}>
          You must accept the terms to continue. Click the label text to
          toggle.
        </Field.Description>
        <Checkbox
          checked={checked}
          onCheckedChange={setChecked}
          style={{ marginTop: 4 }}
        />
      </Field>
    );
  },
};

// ── 10 · Field · tri-state + required + invalid (🔴 first tri-state FCP) ──
export const WithFieldTriStateInvalid: Story = {
  render: () => {
    const [checked, setChecked] = React.useState<CheckboxCheckedState>('mixed');
    return (
      <Field
        invalid
        required
        style={{ maxWidth: 420, display: 'grid', gap: 6 }}
      >
        <Field.Label
          style={{ fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
        >
          Select all rows (3 of 5 selected)
        </Field.Label>
        <Field.Description style={{ fontSize: 12, color: '#637381' }}>
          Tri-state header checkbox · indeterminate + Field.invalid + Field.required
          三层同时出现 · aria-checked="mixed" + aria-invalid="true" +
          aria-required="true" 同时合规（🔴 FCP 首次三态语境验证）
        </Field.Description>
        <Checkbox
          checked={checked}
          onCheckedChange={setChecked}
          style={{ marginTop: 4 }}
        />
        <Field.Error style={{ fontSize: 12, color: '#d32f2f' }}>
          Please resolve the selection before proceeding.
        </Field.Error>
      </Field>
    );
  },
};

// ── 11 · Field label click delegation (CB-6a) ────────────────────────────
// Click anywhere on the label text → Checkbox toggles. This bypasses the
// browser-dependent native `<label for="id">` forwarding behavior (which is
// inconsistent across Chrome / Firefox / Safari for role-driven targets)
// and dispatches the click through Field.Label's onClick delegation layer.
// Checkbox is the SECOND consumer of this delegation (Switch was first)
// — verifies cross-component reuse without any Checkbox-specific upstream
// code.
export const LabelClickDelegation: Story = {
  render: () => {
    const [checked, setChecked] = React.useState<CheckboxCheckedState>(false);
    return (
      <Field style={{ maxWidth: 400, display: 'grid', gap: 6 }}>
        <Field.Label
          style={{
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          Click this label to toggle the checkbox →
        </Field.Label>
        <Checkbox
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

// ── 12 · Focus mode B demo (CB-5 · halo + ring 真分轨 · second carrier) ──
// Instruction in the story body because Storybook cannot simulate the UA
// heuristic that drives `:focus-visible`:
//   · Click the checkbox with a mouse    → weak halo (box-shadow) appears
//   · Tab into the checkbox from keyboard → strong outline ring appears
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
          maxWidth: 480,
          lineHeight: 1.5,
        }}
      >
        <strong>CB-5 · Focus mode B demo.</strong> Checkbox is the SECOND
        PrismUI component (after Switch) whose focus contract genuinely
        supports two channels (halo + ring):
        <ul style={{ marginTop: 6, paddingLeft: 20 }}>
          <li>
            <strong>Mouse click</strong> the checkbox → weak{' '}
            <code>box-shadow</code> halo (consumes{' '}
            <code>theme.focusPointerHalo</code> · registered by Switch v1.0.1)
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
        (focus sink — click here first, then Tab / click the checkbox below)
      </button>
      <Checkbox defaultChecked={false} size="xl" />
    </div>
  ),
};

// ── 13 · Cross-component halo consistency (🔴 CB-5 unique verification) ──
// When Switch and Checkbox are focused via pointer simultaneously, the halo
// must look identical (same color, same width) because both components
// consume the `theme.focusPointerHalo` token registered in Switch v1.0.1.
// This is the FIRST time in PrismUI that a single theme layer-2 token is
// shared across two different components — verifying the cross-component
// consistency contract.
export const CrossComponentHaloConsistency: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        maxWidth: 520,
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ fontSize: 12, color: '#637381', lineHeight: 1.5 }}>
        <strong>CB-5 cross-component halo.</strong> Mouse-click each control
        in turn. The halo (soft box-shadow) should be visually identical on
        Switch and Checkbox — both consume the same{' '}
        <code>--prismui-focus-pointer-halo-*</code> tokens registered in{' '}
        <code>theme.focusPointerHalo</code>. If the halos diverge, either the
        theme token was overridden inconsistently or a component is bypassing
        the token (CB-5 regression).
      </div>
      <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 11, color: '#637381' }}>Switch (lg)</span>
          <Switch size="lg" defaultChecked />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 11, color: '#637381' }}>Checkbox (lg)</span>
          <Checkbox size="lg" defaultChecked />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 11, color: '#637381' }}>
            Checkbox mixed (lg)
          </span>
          <Checkbox size="lg" checked="mixed" onCheckedChange={() => {}} />
        </div>
      </div>
    </div>
  ),
};

// ── 13.5 · FocusFeedback — L4 glow + ripple A/B (Phase 6) ──────────────
// Tab through (keyboard focus) to see the L4 glow halo layer coexist with
// the native :focus-visible outline (ring + halo · Button v0.6.1 parity).
// Mouse-click triggers the CSS-only CB-5 mode-B pointer halo (independent
// channel · glow does NOT activate because focusVisible === false).
// Pressing activates the ripple — clipped to the rounded square boundary.
// Tri-state coexistence: Checkbox is the FIRST L4-integrated component
// with a `mixed` state — verify `data-checked='mixed'` + glow halo render
// on BOTH CSS channels simultaneously without conflict.
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
        Tab into each Checkbox (keyboard). The default gets the outline + soft
        halo (ring + halo). <code>feedbacks={'{[]}'}</code> keeps the native
        outline + mode-B halo only. The <code>checked="mixed"</code> variant
        proves tri-state × glow coexistence (bg fill from{' '}
        <code>--checkbox-box-bg-on</code> + box-shadow halo on different CSS
        channels).
      </p>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 11, color: '#919EAB' }}>
            feedbacks=[] (native outline + mode-B halo only)
          </span>
          <Checkbox feedbacks={[]} size="lg" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 11, color: '#919EAB' }}>
            default (ripple + glow, Phase 6)
          </span>
          <Checkbox size="lg" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 11, color: '#919EAB' }}>
            defaultChecked=true · default feedbacks
          </span>
          <Checkbox defaultChecked size="lg" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 11, color: '#919EAB' }}>
            checked='mixed' · default feedbacks (tri-state × glow)
          </span>
          <Checkbox checked="mixed" onCheckedChange={() => {}} size="lg" />
        </div>
      </div>
      <p style={{ marginTop: 8, fontSize: 11, color: '#919EAB' }}>
        DevTools tip: focus the fourth Checkbox and confirm all THREE
        orthogonal state channels coexist on the button:{' '}
        <code>aria-checked='mixed'</code> (semantic) ·{' '}
        <code>data-checked='mixed'</code> (CSS hook → box fill + minus glyph) ·{' '}
        <code>prismui-glow-active</code> class (feedback → box-shadow halo).
        Phase 6 invariant: CB-1/CB-2 tri-state pipeline and feedback factories
        operate on disjoint rendering channels.
      </p>
    </div>
  ),
};

// ── 14 · Silent bug defense quartet (CB-1a / CB-10 / CB-11) ──────────────
// Visually identical to Default + Label delegation stories above, but the
// underlying invariants (CB-1a aria-pressed filter · CB-10 <a href> fallback
// · CB-11 type="button" force override) are verified in the test suite.
// This story notes that Checkbox inside <form onSubmit> does NOT submit on
// click — the most dangerous silent-bug for a form control.
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
          maxWidth: 480,
        }}
      >
        <div style={{ fontSize: 12, color: '#637381' }}>
          CB-11 · <strong>type=&quot;submit&quot; silent-bug guard.</strong>{' '}
          This Checkbox is wrapped in a <code>&lt;form&gt;</code> that
          increments on submit. Even though we pass{' '}
          <code>type=&quot;submit&quot;</code>, the component overrides to{' '}
          <code>type=&quot;button&quot;</code> → clicks do NOT submit the
          form → counter stays at 0. Forms are the most common habitat for
          Checkbox, which makes this the highest-impact silent-bug guard.
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setCount((c) => c + 1);
          }}
          style={{ display: 'flex', alignItems: 'center', gap: 12 }}
        >
          <Checkbox
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

// ── 15 · Polymorphic — component="div" (CB-10 whitelist · Space works) ───
export const PolymorphicDiv: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        fontFamily: 'sans-serif',
        maxWidth: 480,
      }}
    >
      <div style={{ fontSize: 12, color: '#637381', lineHeight: 1.5 }}>
        Polymorphic <code>&lt;div role=&quot;checkbox&quot;&gt;</code>.
        Space activates (CB-10 contract). Host whitelist:{' '}
        <code>button</code> / <code>a</code> without href / <code>div</code>{' '}
        / <code>span</code> / custom component. Blacklist:{' '}
        <code>component=&quot;a&quot; + href</code> (Round 1 P0-1 收敛).
      </div>
      <Checkbox component="div" tabIndex={0} />
    </div>
  ),
};

// ── 16 · CB-10 <a href> fallback demo (🔴 Round 1 P0-1) ──────────────────
// When user passes `component="a"` + `href`, Checkbox:
//   1. DEV warns once
//   2. Falls back to <button> host (strips href)
//   3. Emits role="checkbox" + works with Space
// This is OQ-CB-12 strategy A. Story renders both valid + fallback cases.
export const AHrefFallback: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        fontFamily: 'sans-serif',
        maxWidth: 480,
      }}
    >
      <div style={{ fontSize: 12, color: '#637381', lineHeight: 1.5 }}>
        <strong>CB-10 · Round 1 P0-1 fallback demo.</strong>
        <ul style={{ marginTop: 6, paddingLeft: 20 }}>
          <li>
            <code>component=&quot;a&quot;</code> (no href) → renders{' '}
            <code>&lt;a role=&quot;checkbox&quot;&gt;</code> ✅
          </li>
          <li>
            <code>component=&quot;a&quot; href=&quot;/x&quot;</code> → DEV
            warn + fallback to <code>&lt;button&gt;</code> (href stripped) ✅
          </li>
        </ul>
        Rationale:{' '}
        <code>resolvePolymorphicActionBehavior</code> treats{' '}
        <code>&lt;a href&gt;</code> as native-activating and does NOT simulate
        Space, which would silently break CB-10&apos;s Space contract.
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 11, color: '#637381', width: 120 }}>
          a (no href) · OK
        </span>
        <Checkbox component="a" tabIndex={0} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 11, color: '#637381', width: 120 }}>
          a + href · fallback
        </span>
        <Checkbox component="a" href="/x" />
      </div>
    </div>
  ),
};

// ── 17 · P0-2 honesty demo (FCP-2 opt-out × Label delegation divergence) ─
// 🔴 Known system-level limitation (NOT a Checkbox-side bug). This story
// exists to make the limitation visible to design reviewers so nobody is
// surprised. The divergence lives in `FieldLabel.tsx:119-122` (delegation
// gate reads `ctx.disabled`, not the merged target disabled).
export const P0TwoFcpOptOutDivergence: Story = {
  render: () => {
    const [directClicks, setDirectClicks] = React.useState(0);
    const [labelClicks, setLabelClicks] = React.useState(0);
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          fontFamily: 'sans-serif',
          maxWidth: 560,
        }}
      >
        <div style={{ fontSize: 12, color: '#637381', lineHeight: 1.5 }}>
          <strong>P0-2 · Known system limitation (NOT a Checkbox bug).</strong>{' '}
          Under <code>&lt;Field disabled&gt;&lt;Checkbox disabled=&#123;false&#125;
          /&gt;&lt;/Field&gt;</code>, the FCP-2 opt-out is honored on the
          direct click path (Checkbox toggles as expected) but NOT on the
          Label delegation path (FieldLabel gate reads <code>ctx.disabled</code>{' '}
          before dispatching). The divergence is documented in design.md §8.2
          FCP-2 † / §8.2a C-B / §11.3. Workaround: remove <code>Field.disabled</code>
          .
        </div>
        <Field
          disabled
          style={{ display: 'grid', gap: 6, padding: 12, border: '1px dashed #d0d5dd' }}
        >
          <Field.Label style={{ fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
            Click label (delegation path — should NOT toggle · ctx.disabled=true)
          </Field.Label>
          <Checkbox
            disabled={false}
            onCheckedChange={() => {
              setLabelClicks((n) => n + 1);
            }}
            onClick={() => {
              setDirectClicks((n) => n + 1);
            }}
          />
          <div style={{ fontSize: 12, color: '#637381' }}>
            direct onClick fires: <code>{directClicks}</code> · onCheckedChange
            fires (label path): <code>{labelClicks}</code>
          </div>
        </Field>
      </div>
    );
  },
};
