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
  warnIndeterminate,
} from './switch-invariants';
import classes from './Switch.module.css';

// Stage 10 · Phase 6 Feedback integration · dual-source default (mirrors Button
// v0.6 / IconButton / ToggleButton). Switch is PrismUI's first Control Surface
// to adopt the L4 Feedback system — proving COMPONENT_DEFAULT_FEEDBACKS is
// reusable beyond Action Surface (Button family). Key architectural finding:
// Switch's `.root (<button role="switch">)` geometry is IDENTICAL to `.track`
// (`.track { inset: 0; width/height: 100% }`), so the feedback host MAY sit
// on `.root` — no need to extend contract §11.4 with non-root-slot rules.
//
// Resolution priority (D-1 replacement semantics):
//   props.feedbacks  ←  theme.components.Switch.defaultFeedbacks
//                    ←  SWITCH_DEFAULT_FEEDBACKS
// Pass `feedbacks={[]}` to opt out; the toggle pipeline (S-1 ARIA writes /
// checked-state flip / Field integration) is INDEPENDENT of feedback factories.
//
// Coexistence with Switch's mode-B two-channel focus (S-5):
//   · `:focus:not(:focus-visible)` pointer halo (box-shadow, Switch-native) —
//     glow NEVER activates here (glowFeedback gates on focusVisible=true).
//   · `:focus-visible` outline (native) + `.prismui-glow-active` box-shadow
//     halo (Phase 6) — keyboard focus gets the "ring + halo" Button v0.6.1
//     visual.
// Selectors are mutually exclusive by spec (FE-2 anti-duplicate-signal), so
// the two halo layers never coexist.
export const SWITCH_DEFAULT_FEEDBACKS: FeedbackFactory[] = [rippleFeedback, glowFeedback];

/**
 * Switch · Control Surface · C-2 Abstract · persistent checked state.
 *
 * Design reference: `@/devdocs/components/Switch/design.md` v0.1.2 Round 3.1
 * Contract references:
 *   - `component-contract.md` SR-1~9 + §3.7 Action Behavior
 *   - `control-surface.md` §2.3 C-2 + §四 FCP-1~6 + §五 FI-0~5
 *   - `focus-behavior.md` v1.1 §4.3 C-2 mode-B variant
 *
 * ── Slot tree ──────────────────────────────────────────────────────────
 *   .root (<button role="switch">)          ← semantic host + ref target
 *     .track (<span>)                       ← background rail
 *       .thumb (<span>)                     ← sliding knob
 *
 * ── Key architectural decisions (see design.md §1 invariants) ──────────
 *   S-1 · `role="switch"` + `aria-checked` always written on root
 *          (`data-checked` mirrors aria-checked as CSS hook — SR-7
 *          single-writer is this file).
 *   S-1a · `aria-pressed` filtered out of domProps + DEV warn
 *          (switch-invariants.ts).
 *   S-2 · checked / defaultChecked / onCheckedChange routed through
 *          `useControllableState` (second production consumer).
 *   S-3 · 3 slots only — label is a Field.Label concern, not ours.
 *   S-4 · Zero new Action concerns — `resolvePolymorphicActionBehavior`
 *          handles pointer / keyboard swallow + activation + tabIndex;
 *          the ONLY component addition is a 3-line `handleClick` wrapper
 *          that flips `checked` AFTER the user onClick runs.
 *   S-5 · Focus mode B真分轨 — Switch is PrismUI's ONLY carrier of the
 *          halo + ring two-channel contract (enforced in CSS module).
 *   S-6 / S-6a · Field integration via `useFieldControlProps` +
 *          `useFieldDataAttrs`; `Field.Label` delegation is compensated
 *          in `FieldLabel.tsx` (OQ-S-11 path B).
 *   S-7 · disabled / loading FREEZE visual; only swallow interaction.
 *   S-9 · No `variant` prop in v1 — no variant system, no data-variant.
 *   S-10 · Contract keyboard key = Space only (Enter is inherited from
 *           the `<button>` host but not contract-guaranteed).
 *   S-11 · 🔴 `type="button"` UNCONDITIONALLY forced on `<button>` host
 *           — users who pass `type="submit"` get their value overridden
 *           + DEV warn. Prevents silent form-submit bug.
 * ──────────────────────────────────────────────────────────────────── */
const switchSlots = defineSlots({
  root: 'button',
  track: 'span',
  thumb: 'span',
});

export type SwitchStylesNames = SlotNames<typeof switchSlots>;

export interface SwitchOwnProps extends PolymorphicSystemProps {
  // ── Checked state (S-2) ───────────────────────────────────────────────
  /**
   * Controlled checked state. When provided (not `undefined`), the parent
   * owns the value — `onCheckedChange` is the only back-channel. Strictly
   * binary (S-1: no `'mixed'` / indeterminate).
   */
  checked?: boolean;
  /**
   * Uncontrolled initial checked. Ignored when `checked` is provided.
   * @default false
   */
  defaultChecked?: boolean;
  /**
   * Fires after each click / Space activation (and Enter as the
   * `<button>` host's inherited behavior — S-10 does NOT contractually
   * guarantee Enter across polymorphic hosts).
   */
  onCheckedChange?: (checked: boolean) => void;

  // ── Visual / System ───────────────────────────────────────────────────
  size?: PrismuiSize;
  color?: ThemeColor;
  disabled?: boolean;
  loading?: boolean;
  /**
   * Border radius. Switch defaults to `'full'` (physical-switch metaphor;
   * aligned with iOS / Material / MUI / Mantine).
   * @default 'full'
   */
  radius?: Radius;

  // ── Field integration (S-6) ───────────────────────────────────────────
  /**
   * Semantic required marker. Flows to `aria-required`. Under a `<Field>`
   * this merges with `Field.required` (Control-explicit wins per FCP-2).
   */
  required?: boolean;

  /**
   * Form field name (v1 does NOT render a hidden `<input>`; value is
   * surfaced to AT via `aria-checked` only — see design.md §3.3 / OQ-S-3).
   * v2 will optionally render `<input type="hidden">` when `name` is set.
   */
  name?: string;
  /** Paired with `name`; v2 only. @default 'on' */
  value?: string;

  // ── L4 Feedback (Phase 6 · D-1 replacement semantics) ───────────────
  /**
   * L4 Feedback factory list (mirrors Button / IconButton / ToggleButton).
   *
   * Resolution priority (highest first):
   *   1. this prop (`feedbacks={[...]}`) — full substitution
   *   2. `theme.components.Switch.defaultFeedbacks` — theme override
   *   3. `SWITCH_DEFAULT_FEEDBACKS` — `[rippleFeedback, glowFeedback]`
   *
   * Pass `feedbacks={[]}` to opt out of all visual feedback. The toggle
   * pipeline (S-1 ARIA writes / S-2 useControllableState flip / Field
   * integration) is independent of feedback factories — opting out only
   * suppresses ripple / glow visuals.
   *
   * NOTE: Mode-B halo (S-5 `:focus:not(:focus-visible)`) is a CSS-native
   * Switch feature and is NOT affected by this prop; feedbacks only govern
   * the L4 ripple (press source) and glow (keyboard-focus source) channels.
   */
  feedbacks?: FeedbackFactory[];

  // ── Content ───────────────────────────────────────────────────────────
  children?: React.ReactNode;

  // ── Explicitly NOT exposed (see design.md §2.2 forbidden table) ───────
  //   - `invalid`            → FCP-5 forbids; use `aria-invalid` passthrough
  //   - `indeterminate`      → S-1 strict binary; tri-state is Checkbox
  //   - `aria-pressed`       → S-1a conflict; filtered + DEV warn
  //   - `pressed` / `onPressedChange` → ToggleButton surface, not ours
}

export type SwitchProps = SwitchOwnProps & StylesOverride<SwitchStylesNames>;

// ── varsResolver ────────────────────────────────────────────────────────
// Maps public `color` prop to the `--switch-track-bg-on` channel (and the
// hover bump). The `off` channel is neutral-family so it reads as "empty"
// across all themes. `thumb-bg` is the high-contrast neutral surface,
// matching iOS / Material design intuition where the thumb is typically
// white against any track color.
//
// Geometry (track-height / track-width / thumb-size / thumb-translate) is
// NOT resolved here — it's data-size-attribute driven inside the CSS
// module. This keeps the resolver lean and allows theme overrides to
// target individual size tiers via `[data-size='xs']` selectors.
const varsResolver: VarsResolver<SwitchOwnProps> = (props) => {
  const color = props.color ?? 'primary';
  const vars: Record<string, string> = {
    // Radius (Radius System). Default 'full' comes from payload.defaultProps.
    '--switch-track-radius': resolveRadiusToken(props.radius ?? 'full'),
    '--switch-thumb-radius': 'var(--prismui-radius-full)',

    // Track — off / on / hover backgrounds
    '--switch-track-bg-off':
      'var(--prismui-color-neutral-bordered-bg)',
    '--switch-track-bg-on':
      `var(--prismui-color-${color}-high-bg)`,
    '--switch-track-bg-off-hover':
      'var(--prismui-color-neutral-bordered-hover-bg)',
    '--switch-track-bg-on-hover':
      `var(--prismui-color-${color}-high-hover-bg)`,

    // Track — borders (subtle rim on off; transparent on on since the
    // filled surface already carries the color identity)
    '--switch-track-border-off':
      'var(--prismui-color-neutral-bordered-border)',
    '--switch-track-border-on': 'transparent',

    // Thumb — high-contrast surface + subtle lift shadow
    '--switch-thumb-bg':
      'var(--prismui-color-neutral-high-fg)',
    '--switch-thumb-shadow':
      '0 1px 2px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.04)',

    // Motion tokens (theme-provided)
    '--switch-transition-duration':
      'var(--prismui-duration-fast)',
    '--switch-transition-easing':
      'var(--prismui-ease-out)',
  };

  return vars;
};

const stylesNames = Object.keys(switchSlots) as (keyof typeof switchSlots)[];
const validatedClasses = ensureClasses(stylesNames, classes);

const switchComponentPropKeys = [
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

export const Switch = factory<SwitchOwnProps>(
  {
    displayName: 'Switch',
    componentName: 'Switch',
    defaultElement: 'button',
    slots: switchSlots,
    componentPropKeys: switchComponentPropKeys,
    // Single-writer defaults (SR-7) — factory surfaces data-size / data-color
    // on the root for a bare `<Switch />`, and radius resolves to 'full' (S-3
    // / OQ-S-4 signoff A). No `variant` default because S-9 keeps Switch out
    // of the variant system in v1.
    defaultProps: {
      color: 'primary',
      size: 'md',
      radius: 'full',
    } satisfies Partial<SwitchOwnProps>,
    systems: [
      // SR-7.1 Key Ownership: the variant system is the sole legitimate
      // writer of `data-variant` and `data-color`. Switch has NO variant
      // vocabulary (S-9 · design.md §2.5 · visual driven by track-bg-off
      // / track-bg-on, not by `--prismui-variant-*`). We still enrol in
      // the variant system with `vars: false` so:
      //   - `data-color` IS emitted (color prop is part of public API)
      //   - `data-variant` is emitted only when user explicitly sets
      //     `variant`, which Switch's typed props forbid; unknown
      //     `variant` via `as any` yields `undefined` → attribute omitted
      //   - `--prismui-variant-*` tokens are NOT injected into style,
      //     because Switch CSS only consumes `--switch-*` alias layer
      //     (SR-8 · design.md §7 / §8.1 SR-8)
      { name: 'variant', vars: false },
      // Switch has size tiers (xs/sm/md/lg/xl) from the Size System v3.
      'size',
      // Surface ≠ Strategy (§5.1). Switch is Control Surface but has no
      // readOnly semantic — it borrows the Action Strategy from the state
      // system to get `data-interactive-disabled = disabled || loading`.
      // This is the first component proving the orthogonality (Input uses
      // 'control', Switch uses 'action', both are Control Surface).
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
    //   1. `props.feedbacks`                          — call-site
    //   2. `theme.components.Switch.defaultFeedbacks` — theme override
    //   3. `SWITCH_DEFAULT_FEEDBACKS`                 — module default
    //
    // `feedbacks={[]}` is a valid opt-out. `useThemeOptional()` returns the
    // default theme without ThemeProvider, so theme lookup is always safe.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const theme = useThemeOptional();
    const themeFeedbacks =
      (theme.components?.Switch?.defaultFeedbacks as FeedbackFactory[] | undefined);
    const resolvedFeedbacks: FeedbackFactory[] =
      propsFeedbacks ?? themeFeedbacks ?? SWITCH_DEFAULT_FEEDBACKS;

    // ── Phase 6 · Feedback wiring (L4 · dual-source) ────────────────────
    // Stable controller across renders (OQ-FB-4). Two ingress adapters:
    //   · `feedback.pressHandlers`  — spread into `usePress({...})` options
    //   · `feedback.focusHandlers`  — chained onto host `onFocus`/`onBlur`
    // Business onClick (the toggle pipeline below) is NOT routed through
    // feedback; it goes through actionBehavior via `handleClick`.
    const feedback = useFeedback(resolvedFeedbacks);

    // ── DEV invariants (S-1a / S-10 / S-10a / S-11) ───────────────────
    // All short-circuit in production builds inside the helper module. We
    // probe domProps BEFORE the destructure so filtered keys (aria-pressed)
    // are still detected.
    const rawHref = (domProps as Record<string, unknown>).href;
    if (process.env.NODE_ENV !== 'production') {
      warnAriaPressedOverride(domProps as Record<string, unknown>);
      warnIndeterminate(domProps as Record<string, unknown>);
      warnAHrefHost(Element, rawHref !== undefined);
      // S-11 warn is deferred below so it can use the EffectiveElement
      // after the S-10a fallback resolves (same pattern as Checkbox).
    }

    // ── S-10a · Host whitelist + blacklist (🔴 Round 1 audit closure) ─────
    // `<a href>` combination is the ONLY blacklisted polymorphic form.
    // Fallback strategy A (mirrors Checkbox CB-10 / OQ-CB-12): silently
    // switch to <button>, strip href. All other hosts (button / a without
    // href / div / span / custom) pass through unchanged. The DEV warn
    // has already fired above.
    const shouldFallbackToButton = Element === 'a' && rawHref !== undefined;
    // JSX convention requires capitalized identifiers for dynamic element
    // types — lower-case `element` would be parsed as a DOM tag literal.
    const EffectiveElement: React.ElementType = shouldFallbackToButton
      ? 'button'
      : Element;

    // ── Checked state (S-2) ──────────────────────────────────────────────
    // Strictly binary `boolean` generic (no 'mixed') — differentiates Switch
    // from ToggleButton. `useControllableState` still routes controlled vs
    // uncontrolled and emits H-6 mode-switch warnings via the shared hook.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [checked, setChecked] = useControllableState<boolean>({
      value: checkedProp,
      defaultValue: defaultChecked ?? false,
      onChange: onCheckedChange,
    });

    // ── Action Surface interactive predicate (Action Strategy) ───────────
    // Single source of truth for "non-interactive" — mirrors what the state
    // system writes as `data-interactive-disabled`. Loading participates
    // because a loading Switch should not double-toggle under rapid clicks.
    const isInteractiveDisabled = resolveInteractive(
      { disabled, loading },
      'action',
    );

    // ── Destructure DOM props ────────────────────────────────
    // Shape matches ActionSurfaceDomProps plus the keys we filter:
    //   - `aria-pressed`    — S-1a: semantic conflict, discarded
    //   - `indeterminate`   — S-1:  binary only, discarded (DEV warn above)
    //   - `role`            — component forces `role="switch"`
    //   - `href`            — S-10a fallback: discarded when Element was 'a'
    //
    // Spread order at render bottom: passthrough → actionBehavior → our
    // own role / aria-checked / type → field-derived attrs → data-attrs.
    // This preserves "component > user" for the S-1 / S-1a / S-10a / S-11 quartet.
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

    // S-11 DEV warn uses the post-fallback element (if a user passed
    // component="a" + href AND type="submit", both warnings should fire).
    if (process.env.NODE_ENV !== 'production') {
      warnButtonTypeOverride(EffectiveElement, userType);
    }

    // S-10a fallback: when falling back from 'a' to 'button', we must NOT
    // re-inject href (stripped above). When the user supplied component="a"
    // WITHOUT href, userHref is undefined and we pass the original 'a' host
    // through. Non-fallback hosts carry userHref in their passthrough.
    const shouldPreserveHref = !shouldFallbackToButton && userHref !== undefined;

    // ── handleClick · the ONLY component-layer extension to Action Behavior
    // Ordering (load-bearing):
    //   1. user onClick runs first (original synthetic event · may call
    //      preventDefault() — noted that React synthetic preventDefault does
    //      NOT cancel JS control flow after onClick returns; to cancel a
    //      toggle the parent must use controlled mode and decline the update)
    //   2. setChecked flips to next state (simple `!prev` — S-1 forbids mixed)
    //   3. useControllableState invokes onCheckedChange (H-4: only when
    //      the value actually changed per shouldUpdate)
    //
    // Uses the functional setter form so the closure doesn't capture stale
    // `checked` when multiple clicks fire in the same frame.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const handleClick = React.useCallback<React.MouseEventHandler>(
      (e) => {
        userOnClick?.(e);
        setChecked((prev) => !prev);
      },
      [userOnClick, setChecked],
    );

    // ── Merge Field context (FCP-1 · useFieldControlProps) ──────────────
    // Switch consumes Field via the hook layer — FCP-6 forbids direct
    // `useContext(FieldContext)`. The hook injects `id` from Field (if
    // Switch didn't supply one), merges `aria-describedby` with Field's
    // descriptionId + errorId, and projects `aria-required` / `aria-invalid`
    // from Field state. `aria-labelledby` is NOT auto-injected — v1 keeps
    // the default Label→Control association on `htmlFor` + `id` per
    // `useFieldControlProps.ts:53-55`.
    //
    // We pass ONLY the field-relevant subset — not full domProps — because
    // the hook's input type only reads id / disabled / readOnly / aria-*
    // keys. `required` is a component prop that maps into aria-required,
    // so we include it below after reading the merge result.
    // `aria-required` fallback chain (documented so FCP-2 priority is
    // legible at a glance):
    //   1. domProps['aria-required']  — user-explicit, wins over everything
    //   2. props.required              — Switch-public prop mapping (filled
    //                                    in here for the standalone / no-
    //                                    Field scenario; under <Field> the
    //                                    same value also reaches ctx via
    //                                    the Field's own `required` prop,
    //                                    so Field + standalone agree).
    //   3. FieldContext.required       — injected by useFieldControlProps
    //                                    when neither of the above is set.
    const ariaRequiredPassthrough = (domProps as Record<string, unknown>)[
      'aria-required'
    ] as boolean | 'true' | 'false' | undefined;
    const ariaRequiredFromProp: boolean | undefined =
      required === true ? true : undefined;

    const fieldMergeInput = {
      id: (domProps as Record<string, unknown>).id as string | undefined,
      disabled,
      // Switch has no readOnly semantic — but if a parent Field sets
      // readOnly, useFieldControlProps will still try to read it. Passing
      // `undefined` lets the hook write Field's readOnly into the merge,
      // which is then ignored by Switch's CSS / behavior (Action strategy
      // doesn't branch on readOnly). Field-scoped consistency > suppression.
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
    // Spread AFTER systemDataAttrs so Field's disabled / readOnly override
    // the pre-merge system-layer view. Action Strategy here mirrors the
    // `state` system declaration above — SAME predicate, SAME source of
    // truth, no drift between visual CSS gate and JS event gate.
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
    // injection (which we override to 'switch' in the spread below).
    const actionBehavior = resolvePolymorphicActionBehavior(EffectiveElement, {
      isInteractiveDisabled,
      onClick: handleClick,
      onKeyDown: userOnKeyDown,
      tabIndex: userTabIndex,
      // User `role` was discarded above — Switch always emits role="switch".
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

    // ── S-11 · type="button" UNCONDITIONAL override on <button> host ─────
    // Even if userType === 'submit' / 'reset', we override to 'button'.
    // The DEV warn above (warnButtonTypeOverride) already flagged the
    // intent mismatch; here we quietly prevent the bug. Uses the
    // EffectiveElement (post S-10a fallback) so a fell-back <a href>
    // also enforces type="button".
    //
    // Polymorphic non-button hosts don't receive `type` at all — `<div>`
    // and `<a>` (without href) either ignore or conflict with it.
    const effectiveButtonType =
      EffectiveElement === 'button' ? 'button' : userType;

    // ── S-1 · aria-checked / data-checked serialization ──────────────────
    // Always a concrete string — never undefined, never empty, never
    // 'mixed' (S-1). Writes both aria-checked and data-checked from the
    // same source so no drift is possible (SR-7 single-writer).
    const checkedAttr: 'true' | 'false' = checked ? 'true' : 'false';

    const rootDataAttrs: Record<string, string> = {
      'data-checked': checkedAttr,
    };
    if (loading) rootDataAttrs['data-loading'] = 'true';

    // ── Loading spinner rendered in thumb (OQ-S-9 pick A) ────────────────
    const thumbSlotStyles = styles.getStyles('thumb');
    const trackSlotStyles = styles.getStyles('track');

    // Build field-derived aria props bag. We only surface keys the hook
    // actually populated — spreading undefined keys would let React drop
    // them (which is fine) but leaves the contract ambiguous. Explicit
    // inclusion documents intent.
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
    //   5. effective type              — S-11 forced 'button' on <button>
    //   6. `role="switch"`             — S-1 · always wins (user role discarded)
    //   7. aria-checked + rootDataAttrs — S-1 / SR-7 single writer
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
        role="switch"
        aria-checked={checkedAttr}
        {...rootDataAttrs}
        {...fieldAriaProps}
        {...systemDataAttrs}
        {...fieldAwareStateAttrs}
        {...disabilityAttrs}
        {...(loading ? { 'aria-busy': true } : {})}
      >
        <span
          className={trackSlotStyles.className}
          style={trackSlotStyles.style}
          data-prismui-slot-usage
        >
          <span
            className={thumbSlotStyles.className}
            style={thumbSlotStyles.style}
            data-prismui-slot-usage
            {...(loading ? { 'data-loader': 'true' } : {})}
          >
            {loading ? <BuiltInSpinner /> : null}
          </span>
        </span>
        {/* userChildren rendered OUTSIDE the track/thumb so custom content
            (e.g. inline label overrides for standalone Switch) doesn't
            collide with the sliding knob. In Field scenarios children
            should be empty — labels belong to Field.Label. */}
        {userChildren}
      </EffectiveElement>
    );
  },
);

(Switch as React.FC).displayName = 'Switch';

/**
 * Built-in loading spinner — scoped SVG identical in shape to the Button /
 * IconButton / ToggleButton spinners so the loading motion reads as one
 * family across the design system. `aria-hidden='true'` because the root
 * carries `aria-busy='true'` already.
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
