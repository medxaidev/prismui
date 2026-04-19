import * as React from 'react';
import { factory, ensureClasses, defineSlots } from '../../core/component';
import { resolveInteractive } from '../../core/state';
import { resolveRadiusToken, type Radius } from '../../core/radius';
import {
  resolvePolymorphicActionBehavior,
  type ActionSurfaceDomProps,
} from '../../core/action';
import type { SlotNames } from '../../core/component';
import type { VarsResolver, StylesOverride } from '../../core/styles';
import type { PolymorphicSystemProps } from '../../core/props';
import {
  warnMissingAriaLabel,
  warnChildrenInvariant,
} from './icon-button-invariants';
import classes from './IconButton.module.css';

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
    const { loading, disabled } = componentProps;

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
    //   (3) `data-loader='true'` on the root enables the rotation keyframes
    //       (scoped selector — won't animate arbitrary user svgs on non-
    //       loading renders).
    const content = loading ? <BuiltInSpinner /> : userChildren;
    const rootLoaderAttrs: Record<string, string> = loading
      ? { 'data-loader': 'true' }
      : {};

    // ── Root spread ordering contract (identical to Button's B-7) ────────
    // Order: ref → styles baseline → user passthrough → action behavior →
    //        type default → component data-attrs → system data-attrs →
    //        disability attrs. Later wins — "user ≺ component ≺ system."
    // See Button.tsx for full rationale. IconButton has no component-local
    // data-attrs (no fullWidth / no round sentinel — OQ-IB6 decided not to
    // add one since radius is already expressed via the CSS var), so the
    // `rootDataAttrs` position in the chain is empty here.
    return (
      <Element
        ref={ref}
        {...styles.getRootProps()}
        {...passthroughDomProps}
        {...actionBehavior}
        {...(effectiveButtonType !== undefined ? { type: effectiveButtonType } : {})}
        {...rootLoaderAttrs}
        {...systemDataAttrs}
        {...disabilityAttrs}
      >
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
