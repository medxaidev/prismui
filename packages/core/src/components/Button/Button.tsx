import * as React from 'react';
import { factory, ensureClasses, defineSlots } from '../../core/component';
import { resolveInteractive } from '../../core/state';
import { resolveRadiusToken, type Radius } from '../../core/radius';
import {
  resolvePolymorphicActionBehavior,
  type ActionSurfaceDomProps,
} from '../../core/action';
import { usePress } from '../../core/interaction-events';
import { useFeedback, type FeedbackFactory } from '../../core/feedback';
import { useThemeOptional } from '../../core/theme';
import { chainHandlers } from '../../core/utils';
import { rippleFeedback } from '../../feedbacks/ripple';
import { glowFeedback } from '../../feedbacks/glow';
import type { SlotNames } from '../../core/component';
import type { VarsResolver, StylesOverride } from '../../core/styles';
import type { PolymorphicSystemProps } from '../../core/props';
import classes from './Button.module.css';

// Stage 10 · Phase 4.1 Feedback integration · dual-source default.
//
// Module-level constant keeps the array identity stable across every
// `<Button>` render, which is what `useFeedback` wants (see
// `@/devdocs/system/feedback-contract.md` §6.6 + OQ-FB-4: stable
// controller via useRef + updateFactories).
//
// v0.5 Phase 4.1 D-1 / D-3 decisions: the default ships BOTH ripple
// (press source) and glow (focus source) so out-of-the-box `<Button>`
// gets the dual-source treatment. Resolution priority (D-1):
//   props.feedbacks  ←  theme.components.Button.defaultFeedbacks
//                    ←  BUTTON_DEFAULT_FEEDBACKS
// Replacement semantics — passing a `feedbacks={[...]}` prop fully
// substitutes the default (no merge / no concat). Passing `feedbacks={[]}`
// is the explicit opt-out path (no visual feedback at all).
//
// Naming: `BUTTON_DEFAULT_FEEDBACKS` (UPPER_SNAKE_CASE module constant)
// is the source-of-truth identifier the contract Audit Log v0.5 cites;
// it stays distinct from `theme.components.Button.defaultFeedbacks` (the
// theme path), so we never collide with the theme key.
export const BUTTON_DEFAULT_FEEDBACKS: FeedbackFactory[] = [rippleFeedback, glowFeedback];

// Stage 9: Slot System — structure declaration as source of truth
// `section` is a multi-instance slot: rendered twice (left / right) and
// discriminated by `data-position`. Follows Input's pattern — the auto-generated
// `Button.Section` compound is intentionally not used (single-instance only).
const buttonSlots = defineSlots({
  root: 'button',
  inner: 'span',
  section: 'span',
  label: 'span',
});

export type ButtonStylesNames = SlotNames<typeof buttonSlots>;

export interface ButtonOwnProps extends PolymorphicSystemProps {
  /**
   * Content rendered in the left section slot, typically an icon or spinner.
   * Size driven by `--prismui-size-slot-size` (Size System v3).
   * When `loading` is true, the built-in spinner replaces this slot.
   */
  leftSection?: React.ReactNode;
  /**
   * Content rendered in the right section slot, typically an icon, chevron, or badge.
   * Size driven by `--prismui-size-slot-size` (Size System v3).
   */
  rightSection?: React.ReactNode;
  /**
   * Border radius. Accepts theme scale keys or any CSS length.
   * @default 'md'
   * @see Radius System — `core/radius`
   */
  radius?: Radius;
  /**
   * Stretches the button to fill its container horizontally.
   * @default false
   */
  fullWidth?: boolean;
  /**
   * Shows a spinner (in the left section) and sets `aria-busy`.
   * Does NOT auto-disable the button — combine with `disabled` if needed.
   * @default false
   */
  loading?: boolean;
  /**
   * L4 Feedback factory list (v0.5 Phase 4.1 · D-1 replacement semantics).
   *
   * Resolution priority (highest first):
   *   1. this prop (`feedbacks={[...]}`) — full substitution
   *   2. `theme.components.Button.defaultFeedbacks` — theme override
   *   3. `BUTTON_DEFAULT_FEEDBACKS` — `[rippleFeedback, glowFeedback]`
   *
   * Pass `feedbacks={[]}` to opt out of all visual feedback (e.g. for
   * tests / SSR-frame placeholders). Pass `undefined` (or omit) to fall
   * through to the theme / module default.
   *
   * NOTE: array identity matters less than its contents; `useFeedback`
   * sees factory list updates via `updateFactories` (§6.6 OQ-FB-12 policy).
   * For maximum stability, hoist your override array to a module constant.
   */
  feedbacks?: FeedbackFactory[];
  children?: React.ReactNode;
}

export type ButtonProps = ButtonOwnProps & StylesOverride<ButtonStylesNames>;

const varsResolver: VarsResolver<ButtonOwnProps> = (props) => ({
  // External box sizing (height / padding-x / font-size) — component aliases
  // pointing to Size System tokens. Naming "external" because these drive the
  // button's outer bounding box and typographic metric, independent of the
  // internal left/right section scaling handled below.
  '--button-height':      'var(--prismui-size-height)',
  '--button-padding-x':   'var(--prismui-size-padding-x)',
  '--button-font-size':   'var(--prismui-size-font-size)',
  // Internal layout (Size System v3 slot scaling) — component aliases pointing
  // to the shared slot-sizing tokens so leftSection / rightSection icons stay
  // visually proportional to the button across all 5 sizes.
  '--button-slot-size':   'var(--prismui-size-slot-size)',
  '--button-inner-gap':   'var(--prismui-size-inner-gap)',
  // Radius — resolved via Radius System (`core/radius`). Default 'md' for
  // Button comes from `payload.defaultProps.radius`, so `props.radius` is
  // always defined at this point; `?? 'md'` is a belt-and-suspenders fallback.
  '--button-radius':      resolveRadiusToken(props.radius ?? 'md'),
});

// stylesNames derived from slots for ensureClasses (compile-time validation)
const stylesNames = Object.keys(buttonSlots) as (keyof typeof buttonSlots)[];

const validatedClasses = ensureClasses(stylesNames, classes);

export const Button = factory<ButtonOwnProps>(
  {
    displayName: 'Button',
    componentName: 'Button',
    defaultElement: 'button',
    slots: buttonSlots,
    componentPropKeys: [
      'size',
      'variant',
      'color',
      'disabled',
      'leftSection',
      'rightSection',
      'radius',
      'fullWidth',
      'loading',
      'feedbacks',
    ] as const,
    // Step 10 · A-2 · single-writer hierarchy for data-attrs:
    // declaring defaults here (instead of render-body destructuring or hidden
    // inside `withVariantColors`) lets factory's systemDataAttrs see them,
    // so `<Button>` with no props still emits data-variant="filled" /
    // data-color="primary" / data-size="md" on root. `radius` is a CSS-var
    // only default (no corresponding data-attr in v1).
    defaultProps: {
      variant: 'filled',
      color: 'primary',
      size: 'md',
      radius: 'md',
    } satisfies Partial<ButtonOwnProps>,
    systems: [
      'variant',
      'size',
      // Step 10 §2.7: Action Surface — disabled || loading drives data-interactive-disabled.
      { name: 'state', options: { interactiveStrategy: 'action' } },
    ],
    styling: {
      structure: {
        stylesNames,
      },
      resources: {
        classes: validatedClasses,
      },
      logic: {
        varsResolver,
      },
    },
  },
  ({ Element, ref, domProps, componentProps, styles, systemDataAttrs, disabilityAttrs }) => {
    // B-3 · `factory<ButtonOwnProps>` above types `componentProps` directly;
    // no cast required.
    const {
      leftSection,
      rightSection,
      fullWidth,
      loading,
      disabled,
      feedbacks: propsFeedbacks,
    } = componentProps;

    // ── Stage 10 · Phase 4.1 · Feedback factory list resolution (D-1) ───
    // Priority chain (highest → lowest):
    //   1. `props.feedbacks`                                — call-site
    //   2. `theme.components.Button.defaultFeedbacks`       — theme override
    //   3. `BUTTON_DEFAULT_FEEDBACKS`                       — module default
    //
    // Replacement semantics (D-1, not merge): the first defined value wins
    // outright. `feedbacks={[]}` is a valid explicit opt-out that still
    // short-circuits the theme/module defaults (empty !== undefined).
    //
    // `useThemeOptional()` returns the default theme when no ThemeProvider
    // is present, so `theme.components` may be `undefined` in that case —
    // handled via optional chaining.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const theme = useThemeOptional();
    const themeFeedbacks =
      (theme.components?.Button?.defaultFeedbacks as FeedbackFactory[] | undefined);
    const resolvedFeedbacks: FeedbackFactory[] =
      propsFeedbacks ?? themeFeedbacks ?? BUTTON_DEFAULT_FEEDBACKS;

    // ── Phase 4.1 · Feedback wiring (L4 · dual-source) ──────────────────
    // Stable controller across renders (OQ-FB-4). Two ingress adapters:
    //   · `feedback.pressHandlers`  — spread into `usePress({...})` options
    //                                 (press source · L2 FSM)
    //   · `feedback.focusHandlers`  — chained onto host `onFocus`/`onBlur`
    //                                 (focus source · React synthetic)
    // We do NOT route business `onClick` through either — that would
    // collide with the L3 Action Behavior contract which already wraps
    // `onClick` / Enter-Space activation / interactive-disabled swallow.
    // `usePress` + the focus ingress serve exclusively as feedback ingresses.
    const feedback = useFeedback(resolvedFeedbacks);
    // Multi-instance slot: raw span + data-position (mirrors Input pattern).
    // Button.Section compound is intentionally NOT used (single-instance only).
    const sectionSlot = styles.getStyles('section');

    // Root-level data-attrs managed by the component (NOT system-managed).
    // The 7 system keys (data-variant / data-size / data-color / data-disabled
    // / data-loading / data-readonly / data-interactive-disabled) are produced
    // by factory via systemDataAttrs and MUST NOT appear here (SR-7, §6.2).
    // `aria-busy` / native `disabled` / `aria-disabled` come via disabilityAttrs.
    const rootDataAttrs: Record<string, string> = {};
    if (fullWidth) rootDataAttrs['data-full-width'] = 'true';

    // ── Step 10 §2.4 R-D4 · Action Surface polymorphic behavior ────────────
    // A-3 · shared predicate: `resolveInteractive('action')` is the exact
    // function the state system uses to derive `data-interactive-disabled`,
    // so CSS visual state and JS event behavior stay in lock-step.
    //
    // `loading` enters the predicate per Action strategy — a loading button
    // must not double-click while async is in flight.
    const isInteractiveDisabled = resolveInteractive(
      { disabled, loading },
      'action',
    );

    // B-4 · single destructure for every domProp the component overrides or
    // re-routes. The remainder (`passthroughDomProps`) is spread onto the root
    // element unchanged.
    //
    // `children` is extracted separately (never forwarded to the Action
    // Surface inputs) to avoid the React footgun where `...domProps` silently
    // overrides JSX children (we place `userChildren` explicitly inside
    // `<Button.Label>`).
    //
    // `type` is destructured here — NOT passed to the Action Surface hook.
    // Rationale: `type="button"` default is a static HTML attribute concern
    // with zero dependency on the Action predicate or event handlers, so it
    // stays at the component layer (see Audit Log 2026-04-18 v0.6).
    //
    // `href` is READ-ONLY — forwarded to the hook so it can classify `<a href>`
    // as a genuine link (no role="button" injection); we still let it flow
    // through `passthroughDomProps` onto the `<a>` element.
    //
    // Shape: `ActionSurfaceDomProps` (from `core/action`) captures every DOM
    // field the Action Behavior model reads/wraps — shared with IconButton /
    // ToggleButton / Menu.Item / etc. `children` is picked off separately
    // because it is a render concern, not an Action Surface one.
    const {
      onClick: userOnClick,
      onKeyDown: userOnKeyDown,
      children: userChildren,
      tabIndex: userTabIndex,
      type: userType,
      role: userRole,
      // ── Phase 3/4.1 · feedback-layer event handlers pulled out for chaining ──
      // Press-layer events (Phase 3) + Focus-layer events (Phase 4.1). We
      // pluck any user-supplied versions so we can deterministically chain
      // `user → press → focus` (user first → feedback observation after),
      // matching the contract §5.2 recipe order.
      //
      // `onBlur` participates in BOTH chains — blur during press triggers
      // L2 press cancel (ripple), and blur on the focused element finishes
      // the focus glow. The chain is user → press.onBlur → focus.onBlur so
      // neither feedback overrides the other.
      onPointerDown: userOnPointerDown,
      onPointerEnter: userOnPointerEnter,
      onPointerLeave: userOnPointerLeave,
      onKeyUp: userOnKeyUp,
      onFocus: userOnFocus,
      onBlur: userOnBlur,
      ...passthroughDomProps
    } = domProps as ActionSurfaceDomProps & {
      children?: React.ReactNode;
      onPointerDown?: React.PointerEventHandler;
      onPointerEnter?: React.PointerEventHandler;
      onPointerLeave?: React.PointerEventHandler;
      onKeyUp?: React.KeyboardEventHandler;
      onFocus?: React.FocusEventHandler<HTMLElement>;
      onBlur?: React.FocusEventHandler<HTMLElement>;
    };

    // ── A-2 · Action Surface behavior (delegated to core/action) ──────────
    // Four BEHAVIORAL concerns (Action Behavior model, post-F-1 v0.7) — all
    // coupled to the event handlers the hook installs:
    //   1. Pointer swallow (click blocked when interactive-disabled)
    //   2. Keyboard — two-sided:
    //        (2a) Enter/Space swallow when interactive-disabled
    //        (2b) Enter/Space → `.click()` activation on polymorphic non-native
    //             elements (F-1 · honors the role="button" contract from (4))
    //   3. Tab-focus parity (tabIndex=-1 on polymorphic non-disableable)
    //   4. role="button" injection (B-2 · a11y contract tied to (2b))
    //
    // `type="button"` default (B-1) is NOT here — see `effectiveButtonType`
    // below. It is a pure HTML attribute default with no state coupling.
    //
    // Design choice — user-supplied `tabIndex` is deliberately overridden on
    // the polymorphic + interactive-disabled branch. Rationale lives in
    // `resolvePolymorphicActionBehavior`'s docstring. Accepting a user
    // tabIndex there would reintroduce the "focusable but key events
    // swallowed" dead-end we are trying to eliminate.
    //
    // Polymorphic-detection caveat (unchanged from §2.4 R-D4 note): custom
    // React components (`component={CustomLink}`) can't be introspected and
    // default to conservative polymorphic handling. Semantics are judged by
    // the tag name passed to `component`.
    const actionBehavior = resolvePolymorphicActionBehavior(Element, {
      isInteractiveDisabled,
      onClick: userOnClick,
      onKeyDown: userOnKeyDown,
      tabIndex: userTabIndex,
      role: userRole,
      href: passthroughDomProps.href as string | undefined,
    });

    // ── Phase 3 · usePress ingesting feedback.pressHandlers ──────────────
    // `usePress` shares the SAME `isInteractiveDisabled` predicate as the
    // Action Behavior above — keeping CSS visual state / JS swallow logic /
    // Feedback gating in lock-step. On flip `false → true` mid-press the
    // L2 FSM cancels every live pointerId synchronously (C-2), which
    // propagates through `feedback.pressHandlers.onPressCancel` into every
    // active ripple as an immediate `cancel()` (C-F2).
    const press = usePress({
      isInteractiveDisabled,
      ...feedback.pressHandlers,
    });

    // ── Phase 3 · handler chaining (contract §5.2 order) ────────────────
    // Pointer + keyup + blur: user first → press second. No visual-state
    // handler on the user side exists yet, but the chain keeps user intent
    // authoritative if someone needs pointerdown analytics etc.
    const chainedPointerHandlers = {
      onPointerDown: chainHandlers<Parameters<React.PointerEventHandler>>(
        userOnPointerDown,
        press.pressProps.onPointerDown,
      ),
      onPointerEnter: chainHandlers<Parameters<React.PointerEventHandler>>(
        userOnPointerEnter,
        press.pressProps.onPointerEnter,
      ),
      onPointerLeave: chainHandlers<Parameters<React.PointerEventHandler>>(
        userOnPointerLeave,
        press.pressProps.onPointerLeave,
      ),
      onKeyUp: chainHandlers<Parameters<React.KeyboardEventHandler>>(
        userOnKeyUp,
        press.pressProps.onKeyUp,
      ),
      // onBlur: user → press.onBlur (L2 press cancel if live) → focus.onBlur
      // (Phase 4.1 · finish glow). `chainHandlers` runs all three in order;
      // first throw propagates (contract §5.3 semantics).
      onBlur: chainHandlers<Parameters<React.FocusEventHandler<HTMLElement>>>(
        userOnBlur,
        press.pressProps.onBlur as React.FocusEventHandler<HTMLElement> | undefined,
        feedback.focusHandlers.onBlur,
      ),
      // onFocus: user → focus.onFocus (Phase 4.1 · glow start).
      onFocus: chainHandlers<Parameters<React.FocusEventHandler<HTMLElement>>>(
        userOnFocus,
        feedback.focusHandlers.onFocus,
      ),
    };

    // Keyboard activation: press (visual) first → actionBehavior (semantic
    // activation) second. `actionBehavior.onKeyDown` already internally
    // wraps `userOnKeyDown` (swallow on interactive-disabled, pass-through
    // on non-activation keys, `.click()` on polymorphic activation keys),
    // so chaining press + actionBehavior keeps the Action Surface contract
    // untouched while adding the visual press feedback in front of it.
    const mergedActionBehavior = {
      ...actionBehavior,
      onKeyDown: chainHandlers<Parameters<React.KeyboardEventHandler>>(
        press.pressProps.onKeyDown,
        actionBehavior.onKeyDown,
      ),
    };

    // ── B-1 · default `type="button"` on native <button> ────────────────
    // A bare `<button>` nested in a `<form>` defaults to `type="submit"` per
    // HTML spec — a classic footgun: `<Button onClick={openModal}>` inside a
    // form will submit the form. Every major design system (Mantine / Radix
    // / Ariakit / Ark) defaults `type="button"` to neutralize this. We only
    // inject the default when:
    //   (a) the resolved Element is the literal `'button'` tag, AND
    //   (b) the user did not pass an explicit `type`.
    // Polymorphic `<a>` / `<div>` / custom components do not get a type
    // attribute — it would either be meaningless (`<a type="button">`) or
    // collide with unrelated semantics (`<input type="...">`).
    //
    // Layering rationale: this lives in the component — NOT in
    // `resolvePolymorphicActionBehavior` — because `type` is a pure HTML
    // attribute default with zero coupling to the Action predicate or event
    // handlers. A hook named `*Behavior` must not silently mutate unrelated
    // HTML semantics. See Audit Log 2026-04-18 v0.6.
    const effectiveButtonType =
      Element === 'button' && userType === undefined ? 'button' : userType;

    // ── a11y DEV warning · icon-only button must have accessible name ──────
    // Once-per-mount warn when the button has NO text children and the user
    // did not provide `aria-label` / `aria-labelledby`. Screen readers would
    // otherwise announce a bare "button" with no semantics. The warning is
    // advisory (not blocking): some use cases legitimately rely on parent
    // context (e.g. a button inside a labelled toolbar).
    if (process.env.NODE_ENV !== 'production') {
      const hasText =
        userChildren != null &&
        userChildren !== false &&
        userChildren !== '' &&
        !(Array.isArray(userChildren) && userChildren.length === 0);
      const hasAriaName =
        !!(passthroughDomProps['aria-label']) ||
        !!(passthroughDomProps['aria-labelledby']) ||
        !!(passthroughDomProps['title']);
      if (!hasText && !hasAriaName) {
        warnIconOnlyButtonOnce();
      }
    }

    // When loading: render built-in spinner instead of leftSection.
    // BuiltInSpinner's <svg aria-hidden="true"> carries its own a11y boundary
    // + the root element already has aria-busy='true' announcing the loading
    // state. We therefore do NOT put `aria-hidden` on the outer section span
    // itself — doing so would silently hide any future sibling content (e.g.
    // if a user overlays extra visual elements inside a customized section).
    const isBuiltInSpinner = !!loading;
    const leftContent = isBuiltInSpinner ? <BuiltInSpinner /> : leftSection;
    // ── B-7 · Root spread ordering contract ────────────────────────
    // JSX spread precedence is "later wins." The order below encodes the
    // deliberate layering that makes user ≺ component ≺ system true.
    // Changing it silently breaks a11y / behavior.
    //
    // Phase 3 note: the original single `actionBehavior` spread has been
    // split into `chainedPointerHandlers` + `mergedActionBehavior` to
    // compose L2 `usePress` (Feedback ingress) with L3 Action Surface
    // without collapsing either contract into the other. See the handler
    // chaining block above for the merge rationale.
    //
    //   1. `ref`                       — non-spread, set first so all spread
    //                                    layers cannot clobber it.
    //   2. `styles.getRootProps()`     — theme / vars / root className baseline.
    //   3. `passthroughDomProps`       — user's arbitrary props (`aria-*`,
    //                                    `data-*`, event handlers we don't
    //                                    wrap). MAY override theme className
    //                                    via `className=` (intentional escape
    //                                    hatch; theme is a default, not a law).
    //   4. `chainedPointerHandlers`    — Phase 3 press chain +
    //                                    Phase 4.1 focus chain:
    //                                      onPointerDown/Enter/Leave/KeyUp:
    //                                        user → press.X (§5.2 order)
    //                                      onBlur:
    //                                        user → press.onBlur → focus.onBlur
    //                                      onFocus:
    //                                        user → focus.onFocus
    //                                    User runs first → feedback ingress
    //                                    runs after (contract §5.2). MUST win
    //                                    over (3) because passthroughDomProps
    //                                    still carries any user-supplied
    //                                    handler that was already chained into
    //                                    this object.
    //   5. `mergedActionBehavior`      — Action Surface onClick / onKeyDown
    //                                    (chained with press.onKeyDown) /
    //                                    tabIndex / role from the hook.
    //                                    MUST win over (3)+(4): the press
    //                                    layer observes, the Action Surface
    //                                    activates — keeping swallow logic
    //                                    in lock-step with CSS visual state.
    //   6. `type` default              — only when Element === 'button' AND
    //                                    user didn't pass one (B-1).
    //   7. `rootDataAttrs`             — component-local data-attrs
    //                                    (`data-full-width`).
    //   8. `systemDataAttrs`           — the 7 system-owned data-attrs
    //                                    (SR-7 single-writer chain). MUST win
    //                                    over everything: users / themes must
    //                                    not be able to fake `data-variant`.
    //   9. `disabilityAttrs`           — native `disabled` / `aria-disabled` /
    //                                    `aria-busy`. Last because these are
    //                                    the load-bearing a11y contract.
    //
    // The rule of thumb: user ≺ press ≺ action ≺ component ≺ system.
    return (
      <Element
        ref={ref}
        {...styles.getRootProps()}
        {...passthroughDomProps}
        {...chainedPointerHandlers}
        {...mergedActionBehavior}
        {...(effectiveButtonType !== undefined ? { type: effectiveButtonType } : {})}
        {...rootDataAttrs}
        {...systemDataAttrs}
        {...disabilityAttrs}
      >
        <Button.Inner data-prismui-slot-usage {...styles.getStyles('inner')}>
          {leftContent != null && (
            <span
              className={sectionSlot.className}
              style={sectionSlot.style}
              data-position="left"
              {...(isBuiltInSpinner ? { 'data-loader': 'true' } : {})}
            >
              {leftContent}
            </span>
          )}
          <Button.Label data-prismui-slot-usage {...styles.getStyles('label')}>{userChildren}</Button.Label>
          {rightSection != null && (
            <span
              className={sectionSlot.className}
              style={sectionSlot.style}
              data-position="right"
            >
              {rightSection}
            </span>
          )}
        </Button.Inner>
      </Element>
    );
  },
);

// ── DEV: icon-only button a11y advisory ────────────────────────────────────
// Once-per-process warning. We avoid per-instance spam; the first violating
// render prints, then the flag latches. Not gated per componentName because
// Button is a single concrete component (unlike the SR-7.1 factory warn which
// tracks (component × attr) pairs).
const _warnedIconOnly = process.env.NODE_ENV !== 'production' ? { seen: false } : null;
function warnIconOnlyButtonOnce(): void {
  if (process.env.NODE_ENV === 'production') return;
  if (_warnedIconOnly!.seen) return;
  _warnedIconOnly!.seen = true;
  console.warn(
    '[PrismUI] <Button> renders with no text children and no `aria-label` / ' +
    '`aria-labelledby` / `title`. Icon-only buttons MUST carry an accessible ' +
    'name — screen readers will otherwise announce a bare "button". Provide ' +
    'one via `aria-label="Save"` (or equivalent) on the Button. This warning ' +
    'is shown once per process.',
  );
}

/**
 * DEV / test-only: reset the icon-only warning latch. Exported for tests so
 * they can assert warn firing behavior without leaking across cases.
 */
export function __resetButtonIconOnlyWarning(): void {
  if (process.env.NODE_ENV === 'production') return;
  if (_warnedIconOnly) _warnedIconOnly.seen = false;
}

// Built-in spinner — CSS-animated SVG. Inherits size from `.section`
// (--button-slot-size) and rotation from the `[data-loader="true"]` selector
// in Button.module.css.
function BuiltInSpinner() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <path d="M12 3a9 9 0 0 1 9 9" opacity="1" />
      <path d="M21 12a9 9 0 1 1-9-9" opacity="0.25" />
    </svg>
  );
}

Button.displayName = 'Button';
