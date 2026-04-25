import * as React from 'react';
import { factory, ensureClasses, defineSlots } from '../../core/component';
import type { SlotNames } from '../../core/component';
import type { VarsResolver, StylesOverride } from '../../core/styles';
import type { PolymorphicSystemProps } from '../../core/props';
import type { PrismuiSize } from '../../core/size';
import { resolveRadiusToken, type Radius } from '../../core/radius';
import type { ThemeColor } from '../../core/variant';
import {
  resolvePolymorphicActionBehavior,
  type ActionSurfaceDomProps,
} from '../../core/action';
import { resolveInteractive } from '../../core/state';
import { usePress } from '../../core/interaction-events';
import { useFeedback, type FeedbackFactory } from '../../core/feedback';
import { useThemeOptional } from '../../core/theme';
import { chainHandlers } from '../../core/utils';
import { rippleFeedback } from '../../feedbacks/ripple';
import { glowFeedback } from '../../feedbacks/glow';
import { useControllableState } from '../../hooks';
import { useFieldControlProps } from '../Field/useFieldControlProps';
import { useFieldDataAttrs } from '../Field/useFieldDataAttrs';
import {
  warnAHrefHost,
  warnAriaPressedOverride,
  warnButtonTypeOverride,
  warnDefaultCheckedMixed,
} from './checkbox-invariants';
import classes from './Checkbox.module.css';

// Stage 10 · Phase 6 Feedback integration · dual-source default (mirrors
// Switch v0.1 · Button v0.6 · IconButton / ToggleButton Phase 5). Checkbox
// is the second Control Surface to adopt the L4 Feedback system — proving
// COMPONENT_DEFAULT_FEEDBACKS reusability across BOTH Control Surface
// components. Key architectural finding (same as Switch): Checkbox's
// `.root (<button role="checkbox">)` geometry is IDENTICAL to `.box`
// (`.box { inset: 0; width/height: 100% }`), so the feedback host sits
// on `.root` — no extension to contract §11.4 needed.
//
// Resolution priority (D-1 replacement semantics):
//   props.feedbacks  ←  theme.components.Checkbox.defaultFeedbacks
//                    ←  CHECKBOX_DEFAULT_FEEDBACKS
// Pass `feedbacks={[]}` to opt out; the tri-state toggle pipeline (CB-1
// ARIA / CB-2 checked cycle / Field integration) is INDEPENDENT of
// feedback factories.
//
// Coexistence with Checkbox's mode-B two-channel focus (CB-5):
//   · `:focus:not(:focus-visible)` pointer halo (box-shadow, Checkbox-native) —
//     glow NEVER activates here (glowFeedback gates on focusVisible=true).
//   · `:focus-visible` outline (native) + `.prismui-glow-active` box-shadow
//     halo (Phase 6) — keyboard focus gets the "ring + halo" Button v0.6.1
//     visual.
//
// Tri-state coexistence (Checkbox-unique · vs Switch binary):
//   · `data-checked='mixed'` + glow — cleanly coexist. Box fills from
//     `--checkbox-box-bg-on`, indicator renders the minus glyph, glow halo
//     sits OUTSIDE the border box. No specificity conflict (background vs
//     box-shadow are different CSS properties).
export const CHECKBOX_DEFAULT_FEEDBACKS: FeedbackFactory[] = [rippleFeedback, glowFeedback];

/**
 * Three-state checked value · carries WAI-ARIA semantic
 * (`"mixed"` = indeterminate · typical case: "select all" header row).
 * Exported so consumers can type their handler signatures.
 */
export type CheckboxCheckedState = boolean | 'mixed';

/**
 * Checkbox · Control Surface · C-2 Abstract · three-state checked.
 *
 * Design reference: `@/devdocs/components/Checkbox/design.md` v0.1.1 (Round 1
 * Pre-impl 签字版)
 * Contract references:
 *   - `component-contract.md` SR-1~9 + §3.7 Action Behavior
 *   - `control-surface.md` §2.3 C-2 + §四 FCP-1~6 + §五 FI-0~5
 *   - `focus-behavior.md` v1.2 §4.3 C-2 mode-B variant
 *
 * ── Slot tree ──────────────────────────────────────────────────────────
 *   .root (<button role="checkbox">)        ← semantic host + ref target
 *     .box (<span>)                         ← outer frame (bg + border)
 *       .indicator (<span>)                 ← check / minus / spinner
 *
 * ── Key architectural decisions (see design.md §1 invariants) ──────────
 *   CB-1 · `role="checkbox"` + `aria-checked` always written on root
 *          (`data-checked` mirrors aria-checked as CSS hook — SR-7
 *          single-writer is this file). Supports tri-state `'mixed'`
 *          (differentiator from Switch S-1 strict binary).
 *   CB-1a · `aria-pressed` filtered out of domProps + DEV warn
 *          (checkbox-invariants.ts).
 *   CB-2 · checked / defaultChecked / onCheckedChange routed through
 *          `useControllableState<boolean | 'mixed'>` (third production
 *          consumer · first in tri-state generic · ToggleButton T-8
 *          deadlock carry: defaultChecked accepts only boolean).
 *   CB-3 · 3 slots only — label is a Field.Label concern, not ours.
 *   CB-4 · Zero new Action concerns — `resolvePolymorphicActionBehavior`
 *          handles pointer / keyboard swallow + activation + tabIndex;
 *          the ONLY component addition is a 3-line `handleClick` wrapper
 *          that flips `checked` AFTER the user onClick runs. Tri-state
 *          semantic: `'mixed' → true` per WAI-ARIA (§4.2).
 *   CB-5 · Focus mode B真分轨 second carrier (after Switch). Checkbox
 *          consumes the SAME `theme.focusPointerHalo` tokens Switch
 *          v1.0.1 registered — cross-component consistency.
 *   CB-6 / CB-6a · Field integration via `useFieldControlProps` +
 *          `useFieldDataAttrs`; `Field.Label` delegation is shared with
 *          Switch v1.0 — zero Checkbox-specific upstream code. CB-6a
 *          guarantee has a known system-level limitation: `<Field disabled>
 *          <Checkbox disabled={false}>` does NOT toggle via label click
 *          path (delegation gate reads ctx.disabled). Direct click path
 *          still toggles. See design.md §8.2 FCP-2 † / §8.2a C-B.
 *   CB-7 · disabled / loading FREEZE visual; only swallow interaction.
 *          Preserves `'mixed'` visual when disabled.
 *   CB-9 · No `variant` prop in v1 — no variant system, no data-variant.
 *   CB-10 · Contract keyboard key = Space only. HOST WHITELIST:
 *          `<button>` (default) / `<a>` without href / `<div>` / `<span>` /
 *          custom component. 🔴 HOST BLACKLIST: `component="a"` + `href`
 *          (Round 1 P0-1) — resolvePolymorphicActionBehavior treats
 *          `<a href>` as native activating and does NOT simulate Space
 *          click, which would silently break the Space contract.
 *          Fallback strategy A (OQ-CB-12): fall back to `<button>` host,
 *          strip `href`, emit `role="checkbox"` + DEV warn.
 *   CB-11 · 🔴 `type="button"` UNCONDITIONALLY forced on `<button>` host
 *          — users who pass `type="submit"` get their value overridden
 *          + DEV warn. Prevents silent form-submit bug (especially
 *          critical since forms are Checkbox's most common habitat).
 * ──────────────────────────────────────────────────────────────────── */
const checkboxSlots = defineSlots({
  root: 'button',
  box: 'span',
  indicator: 'span',
});

export type CheckboxStylesNames = SlotNames<typeof checkboxSlots>;

export interface CheckboxOwnProps extends PolymorphicSystemProps {
  // ── Checked state (CB-2 · tri-state generic) ─────────────────────────
  /**
   * Controlled checked state. When provided (not `undefined`), the parent
   * owns the value — `onCheckedChange` is the only back-channel. Accepts
   * `boolean | 'mixed'` (CB-1 three-state: WAI-ARIA indeterminate).
   */
  checked?: CheckboxCheckedState;
  /**
   * Uncontrolled initial checked. Accepts ONLY `boolean` — `'mixed'` is
   * rejected with a DEV warn + fallback to `false` (CB-2 T-8 carry-over:
   * starting uncontrolled in `'mixed'` would deadlock since toggle only
   * cycles `true ⇄ false`).
   * @default false
   */
  defaultChecked?: boolean;
  /**
   * Fires after each click / Space activation. Next value follows the
   * WAI-ARIA three-state cycle: `false → true`, `true → false`,
   * `'mixed' → true`.
   */
  onCheckedChange?: (checked: CheckboxCheckedState) => void;

  // ── Visual / System ───────────────────────────────────────────────────
  size?: PrismuiSize;
  color?: ThemeColor;
  disabled?: boolean;
  loading?: boolean;
  /**
   * Border radius. Checkbox defaults to `'sm'` (small rounded square —
   * aligned with iOS / Material / Radix / MUI checkbox visual family). To
   * get a perfectly square checkbox, pass `radius="0"`.
   * @default 'sm'
   */
  radius?: Radius;

  // ── Field integration (CB-6) ──────────────────────────────────────────
  /**
   * Semantic required marker. Flows to `aria-required`. Under a `<Field>`
   * this merges with `Field.required` (Control-explicit wins per FCP-2).
   */
  required?: boolean;

  /**
   * Form field name. v1 does NOT render a hidden `<input>`; value is
   * surfaced to AT via `aria-checked` only — see design.md §3.3 / OQ-CB-6.
   * v2 will optionally render `<input type="hidden">` when `name` is set.
   */
  name?: string;
  /** Paired with `name`; v2 only. @default 'on' */
  value?: string;

  // ── L4 Feedback (Phase 6 · D-1 replacement semantics) ───────────────
  /**
   * L4 Feedback factory list (mirrors Switch / Button / IconButton / ToggleButton).
   *
   * Resolution priority (highest first):
   *   1. this prop (`feedbacks={[...]}`) — full substitution
   *   2. `theme.components.Checkbox.defaultFeedbacks` — theme override
   *   3. `CHECKBOX_DEFAULT_FEEDBACKS` — `[rippleFeedback, glowFeedback]`
   *
   * Pass `feedbacks={[]}` to opt out of all visual feedback. The tri-state
   * toggle pipeline (CB-1 ARIA / CB-2 checked cycle / Field integration)
   * is independent of feedback factories — opting out only suppresses
   * ripple / glow visuals.
   *
   * NOTE: Mode-B halo (CB-5 `:focus:not(:focus-visible)`) is a CSS-native
   * Checkbox feature (shared with Switch via `theme.focusPointerHalo`) and
   * is NOT affected by this prop; feedbacks only govern the L4 ripple
   * (press source) and glow (keyboard-focus source) channels.
   */
  feedbacks?: FeedbackFactory[];

  // ── Content ───────────────────────────────────────────────────────────
  children?: React.ReactNode;

  // ── Explicitly NOT exposed (see design.md §2.2 forbidden table) ───────
  //   - `invalid`              → FCP-5 forbids; use `aria-invalid` passthrough
  //   - `indeterminate`        → use `checked="mixed"` instead
  //   - `aria-pressed`         → CB-1a conflict; filtered + DEV warn
  //   - `pressed` / `onPressedChange` → ToggleButton surface, not ours
}

export type CheckboxProps =
  & CheckboxOwnProps
  & StylesOverride<CheckboxStylesNames>;

// ── varsResolver ────────────────────────────────────────────────────────
// Maps public `color` prop to the `--checkbox-box-bg-on` / border channels
// (and hover bumps). `off` channel is neutral so it reads as "empty" against
// any theme. `indicator-color` is the high-contrast neutral foreground (the
// check glyph rides on the color-prop-driven box-bg in on/mixed states).
//
// Geometry (box-size / indicator-size / border-width / stroke) is NOT
// resolved here — it's data-size-attribute driven inside the CSS module to
// preserve per-tier pixel fidelity (OQ-CB-4 strategy A).
const varsResolver: VarsResolver<CheckboxOwnProps> = (props) => {
  const color = props.color ?? 'primary';
  const vars: Record<string, string> = {
    // Radius (Radius System). Default 'sm' comes from payload.defaultProps.
    '--checkbox-box-radius': resolveRadiusToken(props.radius ?? 'sm'),

    // Box — off / on / hover backgrounds + borders
    '--checkbox-box-bg-off': 'transparent',
    '--checkbox-box-bg-on':
      `var(--prismui-color-${color}-high-bg)`,
    '--checkbox-box-bg-off-hover':
      'var(--prismui-color-neutral-bordered-hover-bg)',
    '--checkbox-box-bg-on-hover':
      `var(--prismui-color-${color}-high-hover-bg)`,

    '--checkbox-box-border-off':
      'var(--prismui-color-neutral-bordered-border)',
    '--checkbox-box-border-on':
      `var(--prismui-color-${color}-high-bg)`,

    // Indicator — high-contrast fg (check / minus glyph color)
    '--checkbox-indicator-color':
      'var(--prismui-color-neutral-high-fg)',

    // Motion tokens (theme-provided)
    '--checkbox-transition-duration':
      'var(--prismui-duration-fast)',
    '--checkbox-transition-easing':
      'var(--prismui-ease-out)',
  };

  return vars;
};

const stylesNames = Object.keys(checkboxSlots) as (keyof typeof checkboxSlots)[];
const validatedClasses = ensureClasses(stylesNames, classes);

const checkboxComponentPropKeys = [
  'size',
  'color',
  'disabled',
  'loading',
  'radius',
  'required',
  'name',
  'value',
  'checked',
  'defaultChecked',
  'onCheckedChange',
  'feedbacks',
] as const;

/**
 * Serialize a tri-state checked value into the `aria-checked` attribute. All
 * three WAI-ARIA string forms are valid (`"true"` / `"false"` / `"mixed"`).
 * Exported for test instrumentation; also used internally as the single
 * writer of both `aria-checked` and `data-checked` (SR-7).
 */
function serializeChecked(checked: CheckboxCheckedState): 'true' | 'false' | 'mixed' {
  if (checked === 'mixed') return 'mixed';
  return checked ? 'true' : 'false';
}

export const Checkbox = factory<CheckboxOwnProps>(
  {
    displayName: 'Checkbox',
    componentName: 'Checkbox',
    defaultElement: 'button',
    slots: checkboxSlots,
    componentPropKeys: checkboxComponentPropKeys,
    // Single-writer defaults (SR-7). Checkbox defaults to small rounded
    // square (`radius='sm'`) — reflects the checkbox visual family across
    // iOS / Material / Radix / MUI. Size / color align with PrismUI Size
    // System v3 + variant color catalogue. No `variant` default because
    // CB-9 keeps Checkbox out of the variant system in v1.
    defaultProps: {
      color: 'primary',
      size: 'md',
      radius: 'sm',
    } satisfies Partial<CheckboxOwnProps>,
    systems: [
      // SR-7.1 Key Ownership: the variant system is the sole legitimate
      // writer of `data-variant` and `data-color`. Checkbox has NO variant
      // vocabulary (CB-9 · design.md §2.5 · visual driven by
      // `--checkbox-box-bg-off` / `-on` + `--checkbox-indicator-color`,
      // not by `--prismui-variant-*`). We still enrol with `vars: false`
      // so:
      //   - `data-color` IS emitted (color prop is part of public API)
      //   - `data-variant` is emitted only when user escapes TypeScript
      //     via `as any`; typed props forbid it
      //   - `--prismui-variant-*` tokens are NOT injected into style,
      //     because Checkbox CSS only consumes `--checkbox-*` alias layer
      //     (SR-8 · design.md §7 / §8.1 SR-8)
      { name: 'variant', vars: false },
      // Checkbox has size tiers (xs/sm/md/lg/xl) from the Size System v3.
      'size',
      // Surface ≠ Strategy (§5.1). Checkbox is Control Surface but has no
      // readOnly semantic — it borrows the Action Strategy from the state
      // system to get `data-interactive-disabled = disabled || loading`.
      // This is the SECOND component proving the orthogonality (after
      // Switch), turning "single case" into "pattern" (§3.7 ROI).
      { name: 'state', options: { interactiveStrategy: 'action' } },
    ],
    styling: {
      structure: { stylesNames },
      resources: { classes: validatedClasses },
      logic: { varsResolver },
    },
  },
  ({
    Element,
    ref,
    componentProps,
    domProps,
    styles,
    systemDataAttrs,
    disabilityAttrs,
  }) => {
    const {
      checked: checkedProp,
      defaultChecked,
      onCheckedChange,
      disabled,
      loading,
      required,
      name,
      value,
      feedbacks: propsFeedbacks,
    } = componentProps;

    // ── Phase 6 · Feedback factory list resolution (D-1) ───────────────
    // Priority chain (highest → lowest):
    //   1. `props.feedbacks`                            — call-site
    //   2. `theme.components.Checkbox.defaultFeedbacks` — theme override
    //   3. `CHECKBOX_DEFAULT_FEEDBACKS`                 — module default
    //
    // `feedbacks={[]}` is a valid opt-out. `useThemeOptional()` returns the
    // default theme without ThemeProvider, so theme lookup is always safe.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const theme = useThemeOptional();
    const themeFeedbacks =
      (theme.components?.Checkbox?.defaultFeedbacks as FeedbackFactory[] | undefined);
    const resolvedFeedbacks: FeedbackFactory[] =
      propsFeedbacks ?? themeFeedbacks ?? CHECKBOX_DEFAULT_FEEDBACKS;

    // ── Phase 6 · Feedback wiring (L4 · dual-source) ────────────────────
    // Stable controller across renders (OQ-FB-4). Two ingress adapters:
    //   · `feedback.pressHandlers`  — spread into `usePress({...})` options
    //   · `feedback.focusHandlers`  — chained onto host `onFocus`/`onBlur`
    // Business onClick (the tri-state toggle pipeline) is NOT routed through
    // feedback; it goes through actionBehavior via `handleClick`.
    const feedback = useFeedback(resolvedFeedbacks);

    // ── DEV invariants (CB-1a / CB-2 / CB-10 / CB-11) ───────────────────
    // All four short-circuit in production builds inside the helper module.
    // We probe domProps BEFORE the destructure so filtered keys
    // (aria-pressed) are still detected.
    const rawHref = (domProps as Record<string, unknown>).href;
    if (process.env.NODE_ENV !== 'production') {
      warnAriaPressedOverride(domProps as Record<string, unknown>);
      warnDefaultCheckedMixed(defaultChecked, checkedProp !== undefined);
      warnAHrefHost(Element, rawHref !== undefined);
      // CB-11 warn is deferred below to use the effective element after
      // CB-10 fallback resolves.
    }

    // ── CB-10 · Host whitelist + blacklist (🔴 Round 1 P0-1) ─────────────
    // `<a href>` combination is the ONLY blacklisted polymorphic form.
    // Fallback strategy A per OQ-CB-12: silently switch to <button>, strip
    // href. All other hosts (button / a without href / div / span /
    // custom) pass through unchanged. The DEV warn has already fired above.
    const shouldFallbackToButton = Element === 'a' && rawHref !== undefined;
    // JSX convention requires capitalized identifiers for dynamic element
    // types — lower-case `element` would be parsed as a DOM tag literal.
    const EffectiveElement: React.ElementType = shouldFallbackToButton
      ? 'button'
      : Element;

    // ── Checked state (CB-2 · tri-state generic `boolean | 'mixed'`) ─────
    // Uncontrolled initial value — sanitize `defaultChecked` escape hatch
    // (`'mixed'` is rejected per T-8 deadlock prevention; the DEV warn fires
    // above, and we fall back to `false` here so the component still renders).
    const sanitizedDefaultChecked: boolean =
      typeof defaultChecked === 'boolean' ? defaultChecked : false;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [checked, setChecked] = useControllableState<CheckboxCheckedState>({
      value: checkedProp,
      defaultValue: sanitizedDefaultChecked,
      onChange: onCheckedChange,
    });

    // ── Action Surface interactive predicate (Action Strategy) ───────────
    // Single source of truth for "non-interactive" — mirrors what the state
    // system writes as `data-interactive-disabled`. Loading participates
    // because a loading Checkbox should not double-toggle under rapid
    // clicks (consistent with Switch / ToggleButton).
    const isInteractiveDisabled = resolveInteractive(
      { disabled, loading },
      'action',
    );

    // ── Destructure DOM props ────────────────────────────────────────────
    // Shape matches ActionSurfaceDomProps plus keys we filter:
    //   - `aria-pressed`    — CB-1a: semantic conflict, discarded
    //   - `indeterminate`   — use `checked="mixed"` instead, discarded
    //   - `role`            — component forces `role="checkbox"`
    //   - `href`            — CB-10 fallback: discarded when Element was 'a'
    //
    // Spread order at render bottom: passthrough → actionBehavior → our
    // own role / aria-checked / type → field-derived attrs → data-attrs.
    // This preserves "component > user" for the CB-1 / CB-1a / CB-11 triad.
    const {
      onClick: userOnClick,
      onKeyDown: userOnKeyDown,
      children: userChildren,
      tabIndex: userTabIndex,
      type: userType,
      href: userHref,
      role: _discardedUserRole,
      'aria-pressed': _discardedAriaPressed,
      indeterminate: _discardedIndeterminate,
      ...passthroughDomProps
    } = domProps as ActionSurfaceDomProps & {
      children?: React.ReactNode;
      'aria-pressed'?: unknown;
      indeterminate?: unknown;
      href?: string;
    };
    void _discardedUserRole;
    void _discardedAriaPressed;
    void _discardedIndeterminate;

    // CB-11 DEV warn uses the post-fallback element (if a user passed
    // component="a" + href AND type="submit", both warnings should fire).
    if (process.env.NODE_ENV !== 'production') {
      warnButtonTypeOverride(EffectiveElement, userType);
    }

    // CB-10 fallback: when falling back from 'a' to 'button', we must NOT
    // re-inject href (stripped above). When the user supplied component="a"
    // WITHOUT href, userHref is undefined and we pass the original 'a' host
    // through. Non-fallback hosts carry userHref in their passthrough.
    const shouldPreserveHref = !shouldFallbackToButton && userHref !== undefined;

    // ── handleClick · the ONLY component-layer extension to Action Behavior
    // Ordering (load-bearing):
    //   1. user onClick runs first (original synthetic event · may call
    //      preventDefault())
    //   2. setChecked transitions per WAI-ARIA three-state rule:
    //        false → true · true → false · 'mixed' → true (CB-4 / §4.2)
    //   3. useControllableState invokes onCheckedChange (H-4: only when
    //      the value actually changed per shouldUpdate)
    //
    // Uses the functional setter form so the closure doesn't capture stale
    // `checked` when multiple clicks fire in the same frame.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const handleClick = React.useCallback<React.MouseEventHandler>(
      (e) => {
        userOnClick?.(e);
        setChecked((prev) => (prev === 'mixed' ? true : !prev));
      },
      [userOnClick, setChecked],
    );

    // ── Merge Field context (FCP-1 · useFieldControlProps) ──────────────
    // Same pattern as Switch — hook layer only, no direct useContext
    // (FCP-6). `aria-required` fallback chain:
    //   1. domProps['aria-required']  — user-explicit, wins over everything
    //   2. props.required              — Checkbox-public prop mapping
    //   3. FieldContext.required       — injected by useFieldControlProps
    const ariaRequiredPassthrough = (domProps as Record<string, unknown>)[
      'aria-required'
    ] as boolean | 'true' | 'false' | undefined;
    const ariaRequiredFromProp: boolean | undefined =
      required === true ? true : undefined;

    const fieldMergeInput = {
      id: (domProps as Record<string, unknown>).id as string | undefined,
      disabled,
      // Checkbox has no readOnly semantic — but if a parent Field sets
      // readOnly, useFieldControlProps still reads it. Passing undefined
      // lets the hook merge Field's readOnly through, which Checkbox's
      // CSS / behavior then ignores (Action strategy doesn't branch on
      // readOnly). Field-scoped consistency > suppression.
      readOnly: (domProps as Record<string, unknown>).readOnly as
        | boolean
        | undefined,
      required,
      'aria-describedby': (domProps as Record<string, unknown>)[
        'aria-describedby'
      ] as string | undefined,
      'aria-labelledby': (domProps as Record<string, unknown>)[
        'aria-labelledby'
      ] as string | undefined,
      'aria-invalid': (domProps as Record<string, unknown>)['aria-invalid'] as
        | boolean
        | 'true'
        | 'false'
        | 'grammar'
        | 'spelling'
        | undefined,
      'aria-required': ariaRequiredPassthrough ?? ariaRequiredFromProp,
    };
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const fieldMerged = useFieldControlProps(fieldMergeInput);

    // ── Field-aware data-attrs overlay (FCP-3 · useFieldDataAttrs) ───────
    // Action Strategy mirrors the `state` system declaration above — SAME
    // predicate, SAME source of truth, no drift between visual CSS gate
    // and JS event gate.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const fieldAwareStateAttrs = useFieldDataAttrs(
      {
        disabled: fieldMerged.disabled,
        readOnly: fieldMerged.readOnly,
        loading,
      },
      { interactiveStrategy: 'action' },
    );

    // ── Polymorphic Action Behavior · 4 concerns (zero new code) ─────────
    // Hook handles pointer swallow, keyboard swallow, keyboard activation
    // (Space on polymorphic non-button), tab-focus parity, and role='button'
    // injection (which we override to 'checkbox' in the spread below).
    //
    // `href` is passed only when we're NOT in the fallback branch. Hook's
    // behavior for `<a>` without href is identical to `<div>` (Space
    // simulation enabled).
    const actionBehavior = resolvePolymorphicActionBehavior(EffectiveElement, {
      isInteractiveDisabled,
      onClick: handleClick,
      onKeyDown: userOnKeyDown,
      tabIndex: userTabIndex,
      // User `role` was discarded above — Checkbox always emits role="checkbox".
      role: undefined,
      // When we fell back, href is already stripped; otherwise pass-through.
      href: shouldPreserveHref ? userHref : undefined,
    });

    // ── Phase 6 · usePress ingesting feedback.pressHandlers ──────────────
    // `usePress` shares the SAME `isInteractiveDisabled` predicate as the
    // Action Behavior above — keeping CSS visual state / JS swallow logic /
    // Feedback gating in lock-step. Business onClick is NOT routed through
    // this; usePress observes pointer events purely as a press-feedback
    // ingress.
    const press = usePress({
      isInteractiveDisabled,
      ...feedback.pressHandlers,
    });

    // ── Phase 6 · handler chaining (contract §5.2 order) ────────────────
    // Pointer + keyup + blur / focus: user first → press second → focus third.
    const {
      onPointerDown: userOnPointerDown,
      onPointerEnter: userOnPointerEnter,
      onPointerLeave: userOnPointerLeave,
      onKeyUp: userOnKeyUp,
      onBlur: userOnBlur,
      onFocus: userOnFocus,
      ...passthroughRest
    } = passthroughDomProps as ActionSurfaceDomProps & Record<string, unknown>;

    const chainedPointerHandlers = {
      onPointerDown: chainHandlers<Parameters<React.PointerEventHandler>>(
        userOnPointerDown as React.PointerEventHandler | undefined,
        press.pressProps.onPointerDown,
      ),
      onPointerEnter: chainHandlers<Parameters<React.PointerEventHandler>>(
        userOnPointerEnter as React.PointerEventHandler | undefined,
        press.pressProps.onPointerEnter,
      ),
      onPointerLeave: chainHandlers<Parameters<React.PointerEventHandler>>(
        userOnPointerLeave as React.PointerEventHandler | undefined,
        press.pressProps.onPointerLeave,
      ),
      onKeyUp: chainHandlers<Parameters<React.KeyboardEventHandler>>(
        userOnKeyUp as React.KeyboardEventHandler | undefined,
        press.pressProps.onKeyUp,
      ),
      // onBlur: user → press.onBlur (L2 press cancel if live) → focus.onBlur
      // (Phase 4.1 · finish glow).
      onBlur: chainHandlers<Parameters<React.FocusEventHandler<HTMLElement>>>(
        userOnBlur as React.FocusEventHandler<HTMLElement> | undefined,
        press.pressProps.onBlur as React.FocusEventHandler<HTMLElement> | undefined,
        feedback.focusHandlers.onBlur,
      ),
      // onFocus: user → focus.onFocus (Phase 4.1 · glow start).
      onFocus: chainHandlers<Parameters<React.FocusEventHandler<HTMLElement>>>(
        userOnFocus as React.FocusEventHandler<HTMLElement> | undefined,
        feedback.focusHandlers.onFocus,
      ),
    };

    // Keyboard activation: press (visual) first → actionBehavior (semantic
    // activation) second. actionBehavior.onKeyDown already wraps userOnKeyDown
    // (swallow on interactive-disabled, pass-through on non-activation keys,
    // .click() on polymorphic activation keys), so chaining press +
    // actionBehavior keeps the Action Surface contract untouched while adding
    // the press feedback observer in front of it.
    const mergedActionBehavior = {
      ...actionBehavior,
      onKeyDown: chainHandlers<Parameters<React.KeyboardEventHandler>>(
        press.pressProps.onKeyDown,
        actionBehavior.onKeyDown,
      ),
    };

    // ── CB-11 · type="button" UNCONDITIONAL override on <button> host ─────
    // Even if userType === 'submit' / 'reset', we override to 'button'.
    // The DEV warn above (warnButtonTypeOverride) already flagged the
    // intent mismatch; here we quietly prevent the bug. Especially critical
    // for Checkbox because forms are the most common habitat.
    //
    // Polymorphic non-button hosts don't receive `type` at all — `<div>`
    // and `<a>` either ignore or conflict with it.
    const effectiveButtonType =
      EffectiveElement === 'button' ? 'button' : userType;

    // ── CB-1 · aria-checked / data-checked serialization ────────────────
    // Always a concrete string — never undefined, never empty. Unlike
    // Switch, this CAN be "mixed" (CB-1 tri-state — differentiator from
    // S-1). Writes both aria-checked and data-checked from the SAME source
    // so no drift is possible (SR-7 single-writer).
    const checkedAttr = serializeChecked(checked);

    const rootDataAttrs: Record<string, string> = {
      'data-checked': checkedAttr,
    };
    if (loading) rootDataAttrs['data-loading'] = 'true';

    // ── Indicator glyph (check / minus / spinner) ────────────────────────
    // CSS drives visibility (via data-checked / data-loading); component
    // always renders the appropriate SVG so transitions have a target. CB-6
    // (OQ-CB-5 strategy A): indicator glyphs are built-in, NOT consumed
    // from children — keeps a11y consistent.
    const indicatorSlotStyles = styles.getStyles('indicator');
    const boxSlotStyles = styles.getStyles('box');

    // Build field-derived aria props bag. Only surface keys the hook
    // actually populated — same pattern as Switch.
    const fieldAriaProps: Record<string, string | boolean | undefined> = {};
    if (fieldMerged.id !== undefined) fieldAriaProps.id = fieldMerged.id;
    if (fieldMerged['aria-describedby'] !== undefined) {
      fieldAriaProps['aria-describedby'] = fieldMerged['aria-describedby'];
    }
    if (fieldMerged['aria-labelledby'] !== undefined) {
      fieldAriaProps['aria-labelledby'] = fieldMerged['aria-labelledby'];
    }
    if (fieldMerged['aria-required'] !== undefined) {
      fieldAriaProps['aria-required'] = fieldMerged['aria-required'];
    }
    if (fieldMerged['aria-invalid'] !== undefined) {
      fieldAriaProps['aria-invalid'] = fieldMerged['aria-invalid'];
    }

    // v1 form integration — we don't render a hidden <input>. `name` /
    // `value` are accepted for API forward-compat (v2 will render the
    // hidden input). Suppress TS unused-var by referencing them here.
    void name;
    void value;

    // ── Root spread ordering (layered by specificity · `...last` wins) ──
    //   1. `ref`                       — non-spread
    //   2. `styles.getRootProps()`     — theme / vars / root className
    //   3. `passthroughDomProps`       — user arbitrary props (aria-*, data-*,
    //                                    event handlers we don't wrap)
    //   4. `actionBehavior`            — Pointer/Keyboard/tabIndex — wins over 3
    //   5. effective type              — CB-11 forced 'button' on <button>
    //   6. `role="checkbox"`           — CB-1 · always wins (user role discarded)
    //   7. aria-checked + rootDataAttrs — CB-1 / SR-7 single writer
    //   8. fieldAriaProps              — Field merge (may include user overrides
    //                                    preserved via FCP-2 Control-explicit-wins)
    //   9. systemDataAttrs             — variant/size/state base attrs
    //  10. fieldAwareStateAttrs        — Field-aware overlay on state attrs
    //  11. disabilityAttrs             — a11y boundary (last)
    return (
      <EffectiveElement
        ref={ref}
        {...styles.getRootProps()}
        {...passthroughRest}
        {...chainedPointerHandlers}
        {...mergedActionBehavior}
        {...(effectiveButtonType !== undefined
          ? { type: effectiveButtonType }
          : {})}
        role="checkbox"
        aria-checked={checkedAttr}
        {...rootDataAttrs}
        {...fieldAriaProps}
        {...systemDataAttrs}
        {...fieldAwareStateAttrs}
        {...disabilityAttrs}
        {...(loading ? { 'aria-busy': true } : {})}
      >
        <span
          className={boxSlotStyles.className}
          style={boxSlotStyles.style}
          data-prismui-slot-usage
        >
          <span
            className={indicatorSlotStyles.className}
            style={indicatorSlotStyles.style}
            data-prismui-slot-usage
          >
            {loading ? (
              <BuiltInSpinner />
            ) : checkedAttr === 'mixed' ? (
              <BuiltInMinusIcon />
            ) : (
              <BuiltInCheckIcon />
            )}
          </span>
        </span>
        {/* userChildren rendered OUTSIDE the box/indicator so custom
            content (e.g. inline label overrides for standalone Checkbox)
            doesn't collide with the built-in glyphs. In Field scenarios
            children should be empty — labels belong to Field.Label. */}
        {userChildren}
      </EffectiveElement>
    );
  },
);

(Checkbox as React.FC).displayName = 'Checkbox';

/**
 * Built-in check icon — scoped SVG tuned to look centered in the indicator
 * slot (~11px on md size). `stroke` follows `currentColor` so the theme-
 * provided `--checkbox-indicator-color` drives the mark. `aria-hidden` is
 * true because the root carries `aria-checked='true'` already — AT does
 * not need to announce the glyph.
 */
function BuiltInCheckIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3.5 8.5 L6.5 11.5 L12.5 4.5" />
    </svg>
  );
}

/**
 * Built-in minus icon — for `aria-checked='mixed'` (the WAI-ARIA
 * indeterminate / "some-selected" state). Same coordinate space as the
 * check icon so indicator transitions don't shift geometry.
 */
function BuiltInMinusIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M4 8 L12 8" />
    </svg>
  );
}

/**
 * Built-in loading spinner — scoped SVG identical in shape to the Button /
 * IconButton / ToggleButton / Switch spinners so the loading motion reads
 * as one family across the design system. `aria-hidden='true'` because the
 * root carries `aria-busy='true'` already.
 */
function BuiltInSpinner() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M12 3a9 9 0 0 1 9 9" opacity="1" />
      <path d="M21 12a9 9 0 1 1-9-9" opacity="0.25" />
    </svg>
  );
}
