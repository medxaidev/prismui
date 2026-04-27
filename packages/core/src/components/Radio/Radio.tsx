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
import { useRadioGroupContext } from './RadioGroupContext';
import { computeRovingTargetId } from './useRovingFocus';
import {
  warnAriaPressedOnRadio,
  warnAriaSelectedOnRadio,
  warnRadioButtonTypeOverride,
  warnRadioMissingValueInGroup,
} from './radio-invariants';
import classes from './Radio.module.css';

/**
 * Default L4 feedback factories for Radio · `[ripple, glow]` (Phase 6
 * parity with Switch / Checkbox / Button). Ripple paints a focal pulse on
 * press; glow paints a halo on `:focus-visible` (Z-5 keyboard-focus only).
 *
 * Resolution chain (per design.md §5.4):
 *   props.feedbacks  ←  group.feedbacks  ←  theme.components.Radio.defaultFeedbacks  ←  RADIO_DEFAULT_FEEDBACKS
 *
 * Pass `feedbacks={[]}` (per Radio OR per RadioGroup) to opt out. The
 * selection pipeline (R-1 ARIA writes / R-2 group commit / R-6 Field
 * integration) is INDEPENDENT of feedback factories — opting out only
 * suppresses ripple / glow visuals.
 */
export const RADIO_DEFAULT_FEEDBACKS: FeedbackFactory[] = [rippleFeedback, glowFeedback];

/**
 * Radio · Control Surface · C-2 Abstract child of RadioGroup.
 *
 * Design reference: `@/devdocs/components/Radio/design.md` v0.2
 *
 * ── Slot tree ──────────────────────────────────────────────────────────
 *   .root (<button role="radio">)        ← semantic host + ref target
 *     .circle (<span>)                   ← outer ring (border)
 *       .indicator (<span>)              ← inner dot (selected · loading)
 *
 * ── Commit 2 + 3 scope (this file lands group-mode interaction) ─────────
 *   ✅ R-1 · `role="radio"` + `aria-checked` strict binary writes
 *   ✅ R-1a · forbidden ARIA filtered (aria-pressed / aria-selected)
 *   ✅ R-2  · group mode (consumes RadioGroupContext for value / commit)
 *   ✅ R-4  · resolvePolymorphicActionBehavior · click → groupCtx.onSelect
 *   ✅ R-7  · disabled · ownDisabled = props.disabled || groupCtx.disabled
 *   ✅ R-10 · roving tabindex (computeRovingTargetId driven) +
 *            arrow / Home / End navigation with selection-follows-focus
 *   ✅ R-11 · type='button' UNCONDITIONAL on <button> host
 *   ✅ R-2  · standalone fallback (Commit 4)
 *   ✅ R-6  · Field integration via RadioGroup root (Commit 5)
 *   ✅ R-5  · pointer halo / keyboard ring / mode-B 真分轨 (Commit 7)
 *   ✅ L4   · ripple + glow feedback · Phase 6 template (Commit 8)
 *   ⏳ R-1a / R-11 DEV warns (forbidden / type=submit)      — Commit 9
 * ──────────────────────────────────────────────────────────────────── */
const radioSlots = defineSlots({
  root: 'button',
  circle: 'span',
  indicator: 'span',
});

export type RadioStylesNames = SlotNames<typeof radioSlots>;

export interface RadioOwnProps extends PolymorphicSystemProps {
  // ── Identity ─────────────────────────────────────────────────────────
  /**
   * Discriminator inside a RadioGroup. Required when used as a group child
   * (compared against `groupCtx.value` to derive `aria-checked`). In
   * standalone mode (no RadioGroup parent · Commit 4) `value` is optional
   * and serves only as the form submission value (v2).
   */
  value?: string;

  // ── Standalone-only state (Commit 4 wires these · accepted now) ──────
  /** Standalone-only · ignored within a RadioGroup (group owns selection). */
  checked?: boolean;
  /** Standalone-only · ignored within a RadioGroup. */
  defaultChecked?: boolean;
  /** Standalone-only · ignored within a RadioGroup. */
  onCheckedChange?: (checked: boolean) => void;

  // ── Visual / System (group inheritance with child-explicit-wins) ─────
  size?: PrismuiSize;
  color?: ThemeColor;
  disabled?: boolean;
  loading?: boolean;
  /**
   * Border radius. Radio defaults to `'full'` (circle metaphor — aligned
   * with Switch `'full'` and distinct from Checkbox `'sm'`).
   * @default 'full'
   */
  radius?: Radius;

  // ── L4 Feedback (Commit 8 wires · accepted for forward-compat) ───────
  /**
   * L4 feedback factories. Resolution chain (per design.md §5.4):
   *   props.feedbacks ?? group.feedbacks ?? theme.components.Radio.defaultFeedbacks
   *     ?? RADIO_DEFAULT_FEEDBACKS
   * Pass `feedbacks={[]}` to opt out per-instance.
   */
  feedbacks?: FeedbackFactory[];

  // ── Content ──────────────────────────────────────────────────────────
  children?: React.ReactNode;

  // ── Explicitly NOT exposed (R-1a · §2.3 forbidden table) ─────────────
  //   - `aria-pressed`     → R-1a conflict; filtered + DEV warn (Commit 9)
  //   - `aria-selected`    → R-1a conflict; filtered + DEV warn (Commit 9)
  //   - `pressed` / `defaultPressed` / `onPressedChange` → ToggleButton surface
}

export type RadioProps = RadioOwnProps & StylesOverride<RadioStylesNames>;

// ── varsResolver ────────────────────────────────────────────────────────
// Maps public `color` prop to indicator + selected border channels. Geometry
// (circle-size / indicator-size / border-width) is data-size driven inside
// the CSS module — same posture as Switch / Checkbox.
const varsResolver: VarsResolver<RadioOwnProps> = (props) => {
  const color = props.color ?? 'primary';
  return {
    '--radio-radius': resolveRadiusToken(props.radius ?? 'full'),

    // Off / on circle backgrounds + borders · INVERTED ("solid fill") scheme.
    // Off = neutral rim on transparent; On = color-high-bg fill + color-high-
    // bg border (unified so no seam between the fill and the ring), with the
    // indicator painted in the contrast foreground (`high-fg`, typically
    // white in both light + dark schemes per the palette role spec).
    '--radio-circle-bg-off': 'transparent',
    '--radio-circle-bg-on': `var(--prismui-color-${color}-high-bg)`,
    '--radio-circle-border-off': 'var(--prismui-color-neutral-bordered-border)',
    '--radio-circle-border-on': `var(--prismui-color-${color}-high-bg)`,

    // Hover bumps — off uses the neutral hover chip; on bumps to the
    // color-high-hover-bg (same channel Switch's track-on consumes).
    '--radio-circle-bg-off-hover':
      'var(--prismui-color-neutral-bordered-hover-bg)',
    '--radio-circle-bg-on-hover': `var(--prismui-color-${color}-high-hover-bg)`,

    // Indicator (the inner dot) — contrast foreground on the color fill.
    '--radio-indicator-color': `var(--prismui-color-${color}-high-fg)`,

    // Motion
    '--radio-transition-duration': 'var(--prismui-duration-fast)',
    '--radio-transition-easing': 'var(--prismui-ease-out)',
  };
};

const stylesNames = Object.keys(radioSlots) as (keyof typeof radioSlots)[];
const validatedClasses = ensureClasses(stylesNames, classes);

const radioComponentPropKeys = [
  'size',
  'color',
  'disabled',
  'loading',
  'radius',
  'value',
  'checked',
  'defaultChecked',
  'onCheckedChange',
  'feedbacks',
] as const;

export const Radio = factory<RadioOwnProps>(
  {
    displayName: 'Radio',
    componentName: 'Radio',
    defaultElement: 'button',
    slots: radioSlots,
    componentPropKeys: radioComponentPropKeys,
    // size / color are intentionally NOT defaulted here so the render body
    // can detect "user did not pass" and fall back to groupCtx (R-9 child-
    // explicit-wins · §5.2). `radius` default stays — standalone Radios
    // need a stable shape without a parent group.
    defaultProps: {
      radius: 'full',
    } satisfies Partial<RadioOwnProps>,
    systems: [
      // R-9 · variant system enrolled with `vars: false` so `data-color` is
      // emitted (public API) but no `--prismui-variant-*` vars leak into
      // style. Mirror of Switch S-9 / Checkbox CB-9.
      { name: 'variant', vars: false },
      'size',
      // R-4 · Action Strategy second cross-component reuse (after Switch /
      // Checkbox · third Control Surface borrowing the strategy).
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
      value: ownValue,
      checked: standaloneCheckedProp,
      defaultChecked: standaloneDefaultChecked,
      onCheckedChange: standaloneOnChange,
      disabled: propsDisabled,
      loading: propsLoading,
      feedbacks: propsFeedbacks,
      size: ownSize,
      color: ownColor,
    } = componentProps;

    // Generate a stable id for registry keying. Falls back to user-supplied
    // DOM id when present (so the same node carries a single id everywhere).
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const generatedId = React.useId();
    const userId = (domProps as Record<string, unknown>).id as string | undefined;
    const ownId = userId ?? generatedId;

    const groupCtx = useRadioGroupContext();
    const isStandalone = groupCtx === null;

    // ── DEV invariants · R-1a (aria-pressed / aria-selected probed before the
    //    filter-destructure so we still see the keys before they vanish) ───
    if (process.env.NODE_ENV !== 'production') {
      warnAriaPressedOnRadio(domProps as Record<string, unknown>);
      warnAriaSelectedOnRadio(domProps as Record<string, unknown>);
    }

    // ── Standalone state (P0-1 A) ───────────────────────────────────────
    // Always call useControllableState (Rules-of-Hooks). In group mode the
    // returned value is simply unused — the cost is one ref pair, no
    // observable side effects (H-9 short-circuit + no onChange firing
    // unless setStandaloneChecked is called explicitly).
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [standaloneChecked, setStandaloneChecked] = useControllableState<boolean>({
      value: standaloneCheckedProp,
      defaultValue: standaloneDefaultChecked ?? false,
      onChange: standaloneOnChange,
    });

    // ── R-7 · own disabled = OR-merge with group (when present) ────────────
    const ownDisabled =
      (propsDisabled ?? false) || (groupCtx?.disabled ?? false);
    const ownLoading =
      (propsLoading ?? false) || (groupCtx?.loading ?? false);

    const isInteractiveDisabled = resolveInteractive(
      { disabled: ownDisabled, loading: ownLoading },
      'action',
    );

    // ── Phase 6 · Feedback factory list resolution (D-1 · §5.4) ────────
    // Priority chain (highest → lowest):
    //   1. `props.feedbacks`                          — call-site
    //   2. `groupCtx.feedbacks`                       — group-level override
    //   3. `theme.components.Radio.defaultFeedbacks`  — theme override
    //   4. `RADIO_DEFAULT_FEEDBACKS`                  — module default
    //
    // `feedbacks={[]}` is a valid opt-out at any level. `useThemeOptional()`
    // returns the default theme without ThemeProvider, so theme lookup is
    // always safe.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const theme = useThemeOptional();
    const themeFeedbacks =
      (theme.components?.Radio?.defaultFeedbacks as FeedbackFactory[] | undefined);
    const resolvedFeedbacks: FeedbackFactory[] =
      propsFeedbacks ?? groupCtx?.feedbacks ?? themeFeedbacks ?? RADIO_DEFAULT_FEEDBACKS;

    // ── Phase 6 · Feedback wiring (L4 · dual-source) ────────────────────
    // Stable controller across renders (OQ-FB-4). Two ingress adapters:
    //   · `feedback.pressHandlers`  — spread into `usePress({...})` options
    //   · `feedback.focusHandlers`  — chained onto host `onFocus` / `onBlur`
    // Business onClick (the selection pipeline above) is NOT routed through
    // feedback; it goes through actionBehavior via `handleClick`.
    const feedback = useFeedback(resolvedFeedbacks);

    // ── Phase 6 · usePress ingesting feedback.pressHandlers ──────────────
    // Shares the SAME `isInteractiveDisabled` predicate as the Action
    // Behavior — keeping CSS visual state / JS swallow logic / Feedback
    // gating in lock-step. Business onClick is NOT routed through this;
    // usePress observes pointer events purely as a press-feedback ingress.
    const press = usePress({
      isInteractiveDisabled,
      ...feedback.pressHandlers,
    });

    // ── R-1 · derived `aria-checked` (group OR standalone) ──────────────
    const isChecked = isStandalone
      ? standaloneChecked
      : ownValue !== undefined && groupCtx.value === ownValue;
    const checkedAttr: 'true' | 'false' = isChecked ? 'true' : 'false';

    // ── R-10 · tabindex (roving in group · always 0 in standalone) ───────
    let computedTabIndex: -1 | 0;
    if (ownDisabled) {
      computedTabIndex = -1;
    } else if (isStandalone) {
      computedTabIndex = 0;
    } else {
      const items = groupCtx.getItems();
      const rovingTargetId = computeRovingTargetId(items, groupCtx.value);
      computedTabIndex = rovingTargetId === ownId ? 0 : -1;
    }

    // ── Registry registration (group mode only) ─────────────────────────
    // The ref is propagated to the host below. We register the same record
    // object so identity is stable for the unregister fn (defensive delete
    // inside useRovingFocus). Standalone Radio doesn't register — there's
    // no group to coordinate with.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const innerRef = React.useRef<HTMLElement | null>(null);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    // Cache `registerItem` by ref so the registration effect depends on a
    // stable function identity rather than the whole groupCtx object.
    // groupCtx now changes on every registry mutation (registryVersion is
    // baked into the memo deps to drive child re-renders for tabIndex);
    // depending on it here would cause register → bump → re-render →
    // unregister → register → infinite loop.
    const registerItem = groupCtx?.registerItem;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useEffect(() => {
      if (registerItem === undefined) return;
      if (ownValue === undefined) {
        // R-2 · group child without value cannot participate in selection.
        if (process.env.NODE_ENV !== 'production') {
          warnRadioMissingValueInGroup();
        }
        return;
      }
      const unregister = registerItem({
        id: ownId,
        value: ownValue,
        disabled: ownDisabled,
        ref: innerRef,
      });
      return unregister;
    }, [registerItem, ownId, ownValue, ownDisabled]);

    // Combined ref: forward to factory `ref` AND keep our own copy for
    // the registry. We use a callback ref to fan-out cheaply.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const composedRef = React.useCallback(
      (node: HTMLElement | null) => {
        innerRef.current = node;
        if (typeof ref === 'function') ref(node as never);
        else if (ref && typeof ref === 'object') {
          (ref as React.MutableRefObject<unknown>).current = node;
        }
      },
      [ref],
    );

    // ── Destructure DOM props with R-1a / R-11 filtering ──────────────────
    const {
      onClick: userOnClick,
      onKeyDown: userOnKeyDown,
      children: userChildren,
      tabIndex: _userTabIndex, // R-10 forces roving — user value discarded
      type: userType,
      role: _discardedUserRole,                // R-1 forces role="radio"
      'aria-pressed': _discardedAriaPressed,   // R-1a
      'aria-selected': _discardedAriaSelected, // R-1a
      'aria-checked': _discardedAriaChecked,   // R-1 single-writer
      ...passthroughDomProps
    } = domProps as ActionSurfaceDomProps & {
      children?: React.ReactNode;
      'aria-pressed'?: unknown;
      'aria-selected'?: unknown;
      'aria-checked'?: unknown;
      role?: unknown;
    };
    void _userTabIndex;
    void _discardedUserRole;
    void _discardedAriaPressed;
    void _discardedAriaSelected;
    void _discardedAriaChecked;

    // ── handleClick · selection commit (idempotent if already selected) ──
    // useControllableState H-9 guards with Object.is, so re-selecting the
    // same value is a no-op (no setState · no onValueChange). Aligned with
    // Radio single-select semantic: once selected, you can't deselect by
    // clicking the same item — standalone path mirrors this with
    // setStandaloneChecked(true) (true → true is short-circuited too).
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const handleClick = React.useCallback<React.MouseEventHandler>(
      (e) => {
        userOnClick?.(e);
        if (groupCtx !== null) {
          if (ownValue !== undefined) {
            groupCtx.onSelect(ownValue);
          }
        } else {
          setStandaloneChecked(true);
        }
      },
      [userOnClick, groupCtx, ownValue, setStandaloneChecked],
    );

    // ── handleKeyDown · R-10 arrow / Home / End navigation ────────────────
    // Space is already handled via Action Behavior → click(). Enter on
    // <button> host fires native click; non-button hosts don't activate on
    // Enter (consistent with WAI-ARIA and design.md R-10 footnote 🟡).
    //
    // Arrow keys on the OTHER axis are no-op (e.g. ArrowLeft in vertical).
    // selection follows focus is delegated to focusItem → onSelect inside
    // useRovingFocus. preventDefault() stops default page scrolling.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const handleKeyDown = React.useCallback<React.KeyboardEventHandler>(
      (e) => {
        // User chain runs first; preventDefault'd events still reach our
        // navigation step BUT we honor defaultPrevented to opt out.
        userOnKeyDown?.(e);
        if (e.defaultPrevented) return;
        if (isInteractiveDisabled) return;
        // Standalone Radio has no peers — arrow keys + Home/End are no-ops.
        if (groupCtx === null) return;

        const isVertical = groupCtx.orientation === 'vertical';

        let direction: 'next' | 'prev' | 'first' | 'last' | null = null;
        switch (e.key) {
          case 'ArrowDown':
            if (isVertical) direction = 'next';
            break;
          case 'ArrowUp':
            if (isVertical) direction = 'prev';
            break;
          case 'ArrowRight':
            if (!isVertical) direction = 'next';
            break;
          case 'ArrowLeft':
            if (!isVertical) direction = 'prev';
            break;
          case 'Home':
            direction = 'first';
            break;
          case 'End':
            direction = 'last';
            break;
          default:
            return;
        }

        if (direction === null) return;
        e.preventDefault();
        groupCtx.focusItem(direction, ownId);
      },
      [userOnKeyDown, isInteractiveDisabled, groupCtx, ownId],
    );

    // ── Polymorphic Action Behavior (Space activation · pointer / keyboard
    // swallow). Click is wrapped above; we feed `handleClick` in. Our own
    // arrow-key handler chains AFTER actionBehavior so Space (which the
    // hook simulates as a click on non-button hosts) reaches handleClick.
    const actionBehavior = resolvePolymorphicActionBehavior(Element, {
      isInteractiveDisabled,
      onClick: handleClick,
      onKeyDown: handleKeyDown,
      tabIndex: undefined,             // we override below with computedTabIndex
      role: undefined,                 // R-1 forces role="radio"
      href: undefined,
    });

    // ── R-11 · type='button' unconditional on <button> host ───────────────
    // DEV warn if user intended submit / reset — we override but surface the
    // mismatch (silent form-submit bug is the single most dangerous trap).
    if (process.env.NODE_ENV !== 'production') {
      warnRadioButtonTypeOverride(Element, userType);
    }
    const effectiveButtonType: 'button' | string | undefined =
      Element === 'button' ? 'button' : userType;

    // ── Slot rendering ────────────────────────────────────────────────────
    const circleSlotStyles = styles.getStyles('circle');
    const indicatorSlotStyles = styles.getStyles('indicator');

    const rootDataAttrs: Record<string, string> = {
      'data-checked': checkedAttr,
    };
    if (ownLoading) rootDataAttrs['data-loading'] = 'true';
    // R-7 · The factory's `disabilityAttrs` only sees `propsDisabled`. Group-
    // level + Field-level disabled flow in via `groupCtx.disabled`, so we
    // emit `data-disabled` here based on the merged `ownDisabled` to keep
    // CSS state hooks aligned with the actual interactive predicate.
    if (ownDisabled) rootDataAttrs['data-disabled'] = '';

    // ── Phase 6 · handler chaining (feedback-contract §5.2 order) ───────
    // Chain order:
    //   user → press.pressProps  → (onKeyDown only) actionBehavior
    //   user → feedback.focusHandlers (onFocus / onBlur)
    // press.pressProps.onBlur cancels in-flight press if blur arrives mid-
    // press; feedback focus handlers start/finish glow on focus-visible.
    const {
      onPointerDown: userOnPointerDown,
      onPointerEnter: userOnPointerEnter,
      onPointerLeave: userOnPointerLeave,
      onKeyUp: userOnKeyUp,
      onFocus: userOnFocus,
      onBlur: userOnBlur,
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
      // onBlur: user → press.onBlur (L2 press cancel) → feedback.onBlur (glow finish)
      onBlur: chainHandlers<Parameters<React.FocusEventHandler<HTMLElement>>>(
        userOnBlur as React.FocusEventHandler<HTMLElement> | undefined,
        press.pressProps.onBlur as React.FocusEventHandler<HTMLElement> | undefined,
        feedback.focusHandlers.onBlur,
      ),
      // onFocus: user → feedback.onFocus (glow start on focus-visible · Z-5)
      onFocus: chainHandlers<Parameters<React.FocusEventHandler<HTMLElement>>>(
        userOnFocus as React.FocusEventHandler<HTMLElement> | undefined,
        feedback.focusHandlers.onFocus,
      ),
    };

    // Merge press.pressProps.onKeyDown in FRONT of actionBehavior.onKeyDown.
    // actionBehavior owns Space activation (it calls handleClick); we install
    // the press feedback observer in front of it. Our R-10 navigation handler
    // is already inside actionBehavior.onKeyDown via resolvePolymorphicAction-
    // Behavior earlier — chain order preserves that.
    const mergedActionBehavior = {
      ...actionBehavior,
      onKeyDown: chainHandlers<Parameters<React.KeyboardEventHandler>>(
        press.pressProps.onKeyDown,
        actionBehavior.onKeyDown,
      ),
    };

    // ── R-9 · size / color inheritance (child-explicit-wins) ─────────────
    // Resolution chain: own prop → group context → module default. Geometry
    // (size) and identity (color) both follow the same posture so a single
    // `<RadioGroup size="lg" color="success">` propagates uniformly.
    const effectiveSize = ownSize ?? groupCtx?.size ?? 'md';
    const effectiveColor = ownColor ?? groupCtx?.color ?? 'primary';

    // varsResolver was driven by the original (possibly-undefined) prop
    // shape, so when the child relies on group inheritance the resolved
    // CSS vars still point at `--prismui-color-primary-*`. Patch the two
    // color-bearing channels here so the visual reflects the inherited
    // color. Geometry vars are 100% data-attr-driven inside the CSS
    // module, so size inheritance only needs the data-attr override below.
    const rootProps = styles.getRootProps();
    const inheritedStyle: React.CSSProperties = {
      ...(rootProps.style ?? {}),
      // Inverted (solid-fill) scheme: bg + border share the color-high-bg
      // token so there's no seam; indicator paints in the contrast fg.
      ['--radio-circle-bg-on' as string]: `var(--prismui-color-${effectiveColor}-high-bg)`,
      ['--radio-circle-bg-on-hover' as string]: `var(--prismui-color-${effectiveColor}-high-hover-bg)`,
      ['--radio-circle-border-on' as string]: `var(--prismui-color-${effectiveColor}-high-bg)`,
      ['--radio-indicator-color' as string]: `var(--prismui-color-${effectiveColor}-high-fg)`,
    };

    return (
      <Element
        ref={composedRef}
        {...rootProps}
        style={inheritedStyle}
        {...passthroughRest}
        {...chainedPointerHandlers}
        {...mergedActionBehavior}
        tabIndex={computedTabIndex}
        {...(effectiveButtonType !== undefined
          ? { type: effectiveButtonType }
          : {})}
        role="radio"
        aria-checked={checkedAttr}
        id={ownId}
        {...rootDataAttrs}
        {...systemDataAttrs}
        data-size={effectiveSize}
        data-color={effectiveColor}
        {...disabilityAttrs}
        {...(ownLoading ? { 'aria-busy': true } : {})}
      >
        {/* SVG-based visual · MUI-parity vector rendering. The 24-unit
            viewBox + fractional cx/cy guarantees pixel-perfect centering
            at every size tier — no flex / box-model rounding artefacts.
            Slot classes still flow to the inner <circle>s so consumer
            overrides via classes.circle / classes.indicator keep working. */}
        <svg
          aria-hidden="true"
          focusable="false"
          viewBox="0 0 24 24"
          width="100%"
          height="100%"
          style={{ display: 'block', pointerEvents: 'none' }}
          data-prismui-slot-usage
        >
          <circle
            cx={12}
            cy={12}
            r={9}
            className={circleSlotStyles.className}
            style={circleSlotStyles.style}
            data-prismui-slot-usage
          />
          <circle
            cx={12}
            cy={12}
            r={4}
            className={indicatorSlotStyles.className}
            style={indicatorSlotStyles.style}
            data-prismui-slot-usage
          />
        </svg>
        {userChildren}
      </Element>
    );
  },
);

(Radio as React.FC).displayName = 'Radio';
