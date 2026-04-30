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
import {
  warnMissingAriaLabel,
  warnChildrenInvariant,
} from './icon-button-invariants';
import classes from './IconButton.module.css';

// Stage 10 · Phase 5 Feedback integration · dual-source default (mirrors Button v0.6).
//
// Module-level constant keeps the array identity stable across every
// `<IconButton>` render, which is what `useFeedback` wants (see
// `@/devdocs/system/feedback-contract.md` §6.6 + OQ-FB-4: stable
// controller via useRef + updateFactories).
//
// Phase 5 D-1 / D-3 decisions: the default ships BOTH ripple (press source)
// and glow (focus source) so out-of-the-box `<IconButton>` gets the dual-
// source treatment, matching `<Button>`. Resolution priority (D-1):
//   props.feedbacks  ←  theme.components.IconButton.defaultFeedbacks
//                    ←  ICON_BUTTON_DEFAULT_FEEDBACKS
// Replacement semantics — passing `feedbacks={[...]}` fully substitutes the
// default (no merge / no concat). `feedbacks={[]}` is the explicit opt-out
// path (no visual feedback at all).
//
// Naming: `ICON_BUTTON_DEFAULT_FEEDBACKS` (UPPER_SNAKE_CASE module constant)
// keeps the `theme.components.IconButton.defaultFeedbacks` theme path distinct
// — see Button.tsx for the same convention.
export const ICON_BUTTON_DEFAULT_FEEDBACKS: FeedbackFactory[] = [rippleFeedback, glowFeedback];

/**
 * IconButton · Action Surface · square / single-icon
 *
 * Design reference: devdocs/components/IconButton/design.md (v0.2)
 * Contract reference: devdocs/system/component-contract.md §3.7 · SR-1~9
 *
 * ── Slot tree — intentionally ONE layer (root only) ────────────────────
 * Unlike Button (root / inner / label / section×2) IconButton does not
 * have leftSection / rightSection / fullWidth / label, so there is no
 * content to gap or wrap. The single child lives directly inside `.root`
 * and is centered by flex. Fewer slots → simpler override API: users only
 * ever need `classNames.root` / `styles.root` / `vars.root`.
 * ──────────────────────────────────────────────────────────────────── */
const iconButtonSlots = defineSlots({
  root: 'button',
  // Stage-14 v1.x · Wave 3 · ripple-host opt-in wrapper. See
  // IconButton.module.css `.rippleHost` and ripple-feedback.ts for the
  // contract. Empty geometric overlay covering `.root`'s border-box; lets
  // Wave 4 SZ-INTERACT-1 hit-target overlays paint outside the border box
  // without being clipped by the ripple-containment overflow.
  rippleHost: 'span',
});

export type IconButtonStylesNames = SlotNames<typeof iconButtonSlots>;

export interface IconButtonOwnProps extends PolymorphicSystemProps {
  /**
   * Border radius. Accepts theme scale keys or any CSS length.
   * `radius="full"` produces a perfectly circular IconButton
   * (width === height makes `50%` a full circle).
   * @default 'md'
   */
  radius?: Radius;
  /**
   * Shows a spinner (in place of the icon child) and sets `aria-busy`.
   * Does NOT auto-disable the button — combine with `disabled` if needed.
   * Per D-8, the spinner renders at the exact `--icon-button-icon-size`,
   * so toggling `loading` produces zero layout shift.
   * @default false
   */
  loading?: boolean;
  /**
   * Exactly one icon element. Validated at DEV time (D-7 invariant):
   *   - count must equal 1
   *   - must not be a string / number (IconButton has zero typography
   *     consumption and will not style text correctly)
   * Violations emit a once-per-process `console.error`; production does
   * not throw (layout degrades gracefully).
   */
  children?: React.ReactNode;
  /**
   * L4 Feedback factory list (Phase 5 · D-1 replacement semantics · mirrors Button).
   *
   * Resolution priority (highest first):
   *   1. this prop (`feedbacks={[...]}`) — full substitution
   *   2. `theme.components.IconButton.defaultFeedbacks` — theme override
   *   3. `ICON_BUTTON_DEFAULT_FEEDBACKS` — `[rippleFeedback, glowFeedback]`
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
}

export type IconButtonProps = IconButtonOwnProps &
  StylesOverride<IconButtonStylesNames>;

/**
 * varsResolver — maps Size System v3 tokens into IconButton's isolated
 * `--icon-button-*` namespace (SR-5 prefix isolation).
 *
 *   --icon-button-size      → outer square side length
 *   --icon-button-icon-size → inner glyph width/height (D-6: driven via
 *                              width/height, NEVER font-size — see CSS)
 *   --icon-button-radius    → corner radius (RadiusSystem alias layer)
 *
 * Size System's `paddingX` / `fontSize` / `innerGap` are deliberately NOT
 * aliased — IconButton's visual contract has no padding, no text, and no
 * multi-child gap. Pulling them in would pollute the component's CSS var
 * surface and invite later "borrowing" that would violate D-6.
 */
const varsResolver: VarsResolver<IconButtonOwnProps> = (props) => ({
  '--icon-button-size':      'var(--prismui-size-height)',
  '--icon-button-icon-size': 'var(--prismui-size-slot-size)',
  '--icon-button-radius':    resolveRadiusToken(props.radius ?? 'md'),
});

const stylesNames = Object.keys(iconButtonSlots) as (keyof typeof iconButtonSlots)[];
const validatedClasses = ensureClasses(stylesNames, classes);

export const IconButton = factory<IconButtonOwnProps>(
  {
    displayName: 'IconButton',
    componentName: 'IconButton',
    defaultElement: 'button',
    slots: iconButtonSlots,
    // Keys the factory should pluck off of props and route into the
    // `componentProps` bag (rather than spreading onto the DOM element).
    // Mirrors Button minus `leftSection / rightSection / fullWidth` —
    // the three props deliberately elided per D-2 (square / single icon).
    componentPropKeys: [
      'size',
      'variant',
      'color',
      'disabled',
      'radius',
      'loading',
      'feedbacks',
    ] as const,
    // SR-7 single-writer chain — factory sees these defaults so a bare
    // `<IconButton />` emits data-variant='filled' / data-color='primary' /
    // data-size='md' on the root. `radius` is CSS-var-only (no data-attr
    // in v1, intentionally matching Button's v1 scope).
    defaultProps: {
      variant: 'filled',
      color: 'primary',
      size: 'md',
      radius: 'md',
    } satisfies Partial<IconButtonOwnProps>,
    systems: [
      'variant',
      'size',
      // Action Surface — disabled || loading drives data-interactive-disabled
      // (identical strategy to Button, so the Action CSS guards match).
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
    const { loading, disabled, feedbacks: propsFeedbacks } = componentProps;

    // ── Phase 5 · Feedback factory list resolution (D-1) ─────────────────
    // Priority chain (highest → lowest):
    //   1. `props.feedbacks`                                   — call-site
    //   2. `theme.components.IconButton.defaultFeedbacks`      — theme override
    //   3. `ICON_BUTTON_DEFAULT_FEEDBACKS`                     — module default
    //
    // Replacement semantics (D-1, not merge): the first defined value wins
    // outright. `feedbacks={[]}` is a valid explicit opt-out that still
    // short-circuits the theme/module defaults (empty !== undefined).
    //
    // `useThemeOptional()` returns the default theme when no ThemeProvider
    // is present, so reading `theme.components?.IconButton?.defaultFeedbacks`
    // is always safe — no provider = `undefined` (handled via optional chaining).
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const theme = useThemeOptional();
    const themeFeedbacks =
      (theme.components?.IconButton?.defaultFeedbacks as FeedbackFactory[] | undefined);
    const resolvedFeedbacks: FeedbackFactory[] =
      propsFeedbacks ?? themeFeedbacks ?? ICON_BUTTON_DEFAULT_FEEDBACKS;

    // ── Phase 5 · Feedback wiring (L4 · dual-source) ─────────────────────
    // Stable controller across renders (OQ-FB-4). Two ingress adapters:
    //   · `feedback.pressHandlers`  — spread into `usePress({...})` options
    //   · `feedback.focusHandlers`  — chained onto host `onFocus`/`onBlur`
    // Business `onClick` is NOT routed through either — that would collide
    // with the L3 Action Behavior contract which already wraps onClick /
    // Enter-Space activation / interactive-disabled swallow. usePress + the
    // focus ingress serve exclusively as feedback ingresses.
    const feedback = useFeedback(resolvedFeedbacks);

    // ── Action Surface interactive predicate ─────────────────────────────
    // `resolveInteractive(..., 'action')` is the SAME predicate the state
    // system uses to emit `data-interactive-disabled`. Re-using it here
    // keeps CSS visual state (hover / active suppression) and JS event
    // behavior (click / key swallow) in lock-step. `loading` participates
    // per Action strategy — a loading IconButton should not double-fire.
    const isInteractiveDisabled = resolveInteractive(
      { disabled, loading },
      'action',
    );

    // ── Destructure DOM props ────────────────────────────────────────────
    // Shape is `ActionSurfaceDomProps` — the shared type exported from
    // core/action that enumerates every DOM field the Action Behavior
    // hook reads or wraps. `children` is picked off separately (render
    // concern, not an Action concern). Everything else flows through to
    // the root element via `passthroughDomProps`.
    //
    // `type` (HTML button type attribute) is extracted here — NOT given to
    // the hook. It has zero coupling to the Action predicate; the default-
    // to-"button" decision lives at the component layer (same rationale as
    // Button, see its B-1 comment).
    const {
      onClick: userOnClick,
      onKeyDown: userOnKeyDown,
      children: userChildren,
      tabIndex: userTabIndex,
      type: userType,
      role: userRole,
      ...passthroughDomProps
    } = domProps as ActionSurfaceDomProps & { children?: React.ReactNode };

    // ── DEV invariants · D-3 (aria-label) · D-7 (children shape) ────────
    // Both short-circuit in production builds inside the helper module.
    // The only cost in prod is the two function calls below, which tree-
    // shake in most bundler configurations (the helpers return early).
    if (process.env.NODE_ENV !== 'production') {
      warnMissingAriaLabel(
        (passthroughDomProps as Record<string, unknown>)['aria-label'],
        (passthroughDomProps as Record<string, unknown>)['aria-labelledby'],
      );
      warnChildrenInvariant(userChildren);
    }

    // ── Polymorphic Action Behavior · 4 concerns (zero new code) ─────────
    // §3.7 contract: this one hook covers pointer swallow, keyboard swallow,
    // keyboard activation (F-1), tab-focus parity, and role='button'
    // injection. IconButton re-uses it as-is — this is the ROI moment for
    // the Action Core abstractions (design.md §11.2). `type='button'`
    // default is NOT here; see `effectiveButtonType` below.
    const actionBehavior = resolvePolymorphicActionBehavior(Element, {
      isInteractiveDisabled,
      onClick: userOnClick,
      onKeyDown: userOnKeyDown,
      tabIndex: userTabIndex,
      role: userRole,
      href: passthroughDomProps.href as string | undefined,
    });

    // ── Phase 5 · usePress ingesting feedback.pressHandlers ──────────────
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

    // ── Phase 5 · handler chaining (contract §5.2 order) ────────────────
    // Pointer + keyup + blur: user first → press second. IconButton has no
    // user-defined pointer handler surface in the type today, but we still
    // pull them off `passthroughDomProps` so a future addition routes
    // through the chain rather than getting silently overridden by spread.
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
      // (Phase 4.1 · finish glow). `chainHandlers` runs all three in order;
      // first throw propagates (contract §5.3 semantics).
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

    // ── HTML button type default (B-1, same rule as Button) ──────────────
    // `<button>` in a `<form>` defaults to `type="submit"` per HTML spec.
    // Neutralize that footgun when (a) Element === 'button' AND (b) the
    // user did not pass an explicit `type`. Non-button polymorphic targets
    // (`<a>` / `<div>` / custom components) do not get a type attribute —
    // it would be meaningless or conflict with unrelated semantics.
    const effectiveButtonType =
      Element === 'button' && userType === undefined ? 'button' : userType;

    // ── D-8 · Loading swap — render the spinner *instead of* children.
    //
    // Key contract points embedded here:
    //   (1) `userChildren` is NOT rendered when loading — children simply
    //       aren't in the tree, so `React.Children.only` style assumptions
    //       downstream are avoided.
    //   (2) `BuiltInSpinner` is an inline <svg> so it hits `.root > svg`
    //       in the CSS, receiving width/height === --icon-button-icon-size.
    //       That's the zero-layout-shift guarantee (design.md §5.5).
    //   (3) Rotation keyframes are CSS-scoped via `.root[data-loading='true']
    //       > svg` — the state system (single-writer per SR-7) already emits
    //       `data-loading`, so IconButton does NOT emit a separate
    //       `data-loader` attr. Button uses `data-loader` on its `.section`
    //       because Button has a real section subtree; IconButton's single-
    //       slot design makes that extra marker redundant.
    const content = loading ? <BuiltInSpinner /> : userChildren;

    // ── Root spread ordering contract (identical to Button's B-7) ────────
    // Order: ref → styles baseline → user passthrough → action behavior →
    //        type default → system data-attrs → disability attrs. Later wins
    //        — "user ≺ system." See Button.tsx for full rationale. IconButton
    // has no component-local data-attrs (no fullWidth / no round sentinel —
    // OQ-IB6 decided not to add one since radius is already expressed via
    // the CSS var; and per the consolidation above, no `data-loader` either).
    // Stage-14 v1.x · Wave 3 · ripple-host wrapper styles (see slot definition).
    const rippleHostStyles = styles.getStyles('rippleHost');

    return (
      <Element
        ref={ref}
        {...styles.getRootProps()}
        {...passthroughRest}
        {...chainedPointerHandlers}
        {...mergedActionBehavior}
        {...(effectiveButtonType !== undefined ? { type: effectiveButtonType } : {})}
        {...systemDataAttrs}
        {...disabilityAttrs}
      >
        <span
          aria-hidden="true"
          data-ripple-host
          className={rippleHostStyles.className}
          style={rippleHostStyles.style}
        />
        {content}
      </Element>
    );
  },
);

IconButton.displayName = 'IconButton';

// Built-in loading spinner — CSS-animated inline <svg>. Matches Button's
// spinner markup/viewBox so both components share the same visual family.
// `aria-hidden='true'` because the root element already carries `aria-busy`
// — the spinner is decorative and announcing it would double up on AT.
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
