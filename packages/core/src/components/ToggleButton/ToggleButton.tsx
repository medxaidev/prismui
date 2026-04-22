import * as React from 'react';
import { factory, ensureClasses, defineSlots } from '../../core/component';
import { resolveInteractive } from '../../core/state';
import { resolveRadiusToken, type Radius } from '../../core/radius';
import {
  resolvePolymorphicActionBehavior,
  type ActionSurfaceDomProps,
} from '../../core/action';
import { useControllableState } from '../../hooks';
import type { SlotNames } from '../../core/component';
import type { VarsResolver, StylesOverride } from '../../core/styles';
import type { PolymorphicSystemProps } from '../../core/props';
import {
  warnMixedDefaultPressed,
  warnAriaPressedOverride,
} from './toggle-button-invariants';
import classes from './ToggleButton.module.css';

/**
 * ToggleButton · Action Surface · persistent pressed state
 *
 * Design reference: `@/devdocs/components/ToggleButton/design.md` v0.1
 * Contract reference: `@/devdocs/system/component-contract.md` §3.7 · SR-1~9
 * Hook reference: `@/devdocs/hooks/use-controllable-state.md` v0.2
 *
 * ── Slot tree — IDENTICAL to Button (root / inner / label / section×2) ──
 * ToggleButton's visual form is "a Button that remembers it was pressed,"
 * so it inherits Button's slot silhouette in full. The ONLY structural
 * differences between ToggleButton and Button are:
 *
 *   1. `aria-pressed` is ALWAYS written on the root (T-1 — no undefined /
 *      empty-string state is legal; that would silently reduce the button
 *      to a plain action for assistive tech).
 *   2. `data-pressed` is written alongside `aria-pressed` as the CSS hook
 *      (SR-7 single-writer lives in this component — see design §六.1).
 *   3. Pressed state is sourced from `useControllableState` (H-1 ~ H-10),
 *      which routes between controlled `pressed` and uncontrolled
 *      `defaultPressed` in one place and exposes a stable setter.
 *
 * Zero new Action concerns (T-4). The `resolvePolymorphicActionBehavior`
 * hook handles pointer / keyboard swallow + activation + role injection
 * unchanged; the only component-layer addition is a 3-line onClick wrapper
 * that toggles pressed AFTER the user's onClick runs. That ordering is
 * load-bearing (T-7): calling `preventDefault` inside the user's onClick
 * does NOT cancel the toggle — to cancel, the parent must use controlled
 * mode and decline to update `pressed`.
 * ──────────────────────────────────────────────────────────────────── */
const toggleButtonSlots = defineSlots({
  root: 'button',
  inner: 'span',
  section: 'span',
  label: 'span',
});

export type ToggleButtonStylesNames = SlotNames<typeof toggleButtonSlots>;

/**
 * ToggleButton's pressed state can be binary or tri-state. Exported so
 * consumers can type handler signatures ergonomically:
 *
 * ```ts
 * const handleChange = (next: ToggleButtonPressedState) => { ... };
 * ```
 */
export type ToggleButtonPressedState = boolean | 'mixed';

export interface ToggleButtonOwnProps extends PolymorphicSystemProps {
  /**
   * Controlled pressed state. When provided (not `undefined`), the parent
   * owns the value — `onPressedChange` is the ONLY way back. Accepts
   * `'mixed'` for tri-state (WAI-ARIA `aria-pressed="mixed"`).
   *
   * @see design.md §T-2 / T-8
   */
  pressed?: ToggleButtonPressedState;
  /**
   * Uncontrolled initial pressed state. Ignored when `pressed` is provided.
   * Note the type is **`boolean`** — not `ToggleButtonPressedState`. Starting
   * uncontrolled in `'mixed'` is disallowed (T-8: there is no natural click
   * action that toggles out of mixed unless a parent observes it).
   * Attempting `defaultPressed="mixed"` (e.g. via `as any`) emits a DEV
   * warning and falls back to `false`.
   *
   * @default false
   */
  defaultPressed?: boolean;
  /**
   * Fires after each click / Enter / Space activation. Receives the NEXT
   * pressed value (already toggled):
   *
   *   - `false` → `true`
   *   - `true`  → `false`
   *   - `'mixed'` → `true` (WAI-ARIA recommendation, T-8)
   *
   * In controlled mode this is your only update signal. In uncontrolled mode
   * it fires in the same frame as the internal setState.
   */
  onPressedChange?: (pressed: ToggleButtonPressedState) => void;
  /**
   * Content rendered in the left section slot (typically an icon). Size
   * driven by `--prismui-size-slot-size`. Replaced by the built-in spinner
   * while `loading` is `true`.
   */
  leftSection?: React.ReactNode;
  /**
   * Content rendered in the right section slot (typically an icon / chevron).
   * Size driven by `--prismui-size-slot-size`.
   */
  rightSection?: React.ReactNode;
  /**
   * Border radius. Accepts theme scale keys or any CSS length.
   * @default 'md'
   */
  radius?: Radius;
  /**
   * Stretches to fill the container width. Inherits Button's semantics.
   * @default false
   */
  fullWidth?: boolean;
  /**
   * Shows a spinner in the left section and sets `aria-busy`. Per T-6 the
   * pressed visual is preserved — loading freezes interaction but does NOT
   * reset state.
   * @default false
   */
  loading?: boolean;
  children?: React.ReactNode;
}

export type ToggleButtonProps = ToggleButtonOwnProps &
  StylesOverride<ToggleButtonStylesNames>;

/**
 * varsResolver — maps Size System v3 tokens into ToggleButton's isolated
 * `--toggle-button-*` namespace (SR-5 prefix isolation · 6 aliases matching
 * Button one-for-one).
 *
 * Pressed visual aliases (3 of the 6) are component-local aliases pointing
 * to the variant system's HOVER tokens as the v1 interim for OQ-TB-5. This
 * respects T-3 at the CSS layer (pressed reads its own vars, never the
 * system's active vars), and the underlying palette can be re-pointed in
 * one place when the variant system grows a dedicated `pressed` token
 * family. The component CSS is unaffected by that future change.
 */
const varsResolver: VarsResolver<ToggleButtonOwnProps> = (props) => ({
  // External box sizing (same mapping as Button)
  '--toggle-button-height':      'var(--prismui-size-height)',
  '--toggle-button-padding-x':   'var(--prismui-size-padding-x)',
  '--toggle-button-font-size':   'var(--prismui-size-font-size)',
  // Internal layout (Size System v3 slot scaling)
  '--toggle-button-slot-size':   'var(--prismui-size-slot-size)',
  '--toggle-button-inner-gap':   'var(--prismui-size-inner-gap)',
  // Radius — Radius System (same as Button)
  '--toggle-button-radius':      resolveRadiusToken(props.radius ?? 'md'),
  // Pressed channel (T-3) — component-local aliases, currently pointing at
  // variant-hover-* as the v1 interim (see block comment above).
  '--toggle-button-pressed-bg':      'var(--prismui-variant-hover-bg)',
  '--toggle-button-pressed-fg':      'var(--prismui-variant-fg)',
  '--toggle-button-pressed-border':  'var(--prismui-variant-hover-border)',
});

const stylesNames = Object.keys(toggleButtonSlots) as (keyof typeof toggleButtonSlots)[];
const validatedClasses = ensureClasses(stylesNames, classes);

export const ToggleButton = factory<ToggleButtonOwnProps>(
  {
    displayName: 'ToggleButton',
    componentName: 'ToggleButton',
    defaultElement: 'button',
    slots: toggleButtonSlots,
    // Keys the factory pulls off of props and routes into `componentProps`
    // rather than spreading onto the DOM element. `pressed` / `defaultPressed`
    // / `onPressedChange` are ToggleButton-own and MUST live in this list —
    // without it, React would warn about `onPressedChange` on `<button>` and
    // `pressed` would surface as a junk DOM attribute.
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
      'pressed',
      'defaultPressed',
      'onPressedChange',
    ] as const,
    // SR-7 single-writer — factory sees these defaults so a bare
    // `<ToggleButton />` emits data-variant='outlined' (§2.5 rationale) /
    // data-color='primary' / data-size='md' / radius 'md' on the root.
    defaultProps: {
      variant: 'outlined',
      color: 'primary',
      size: 'md',
      radius: 'md',
    } satisfies Partial<ToggleButtonOwnProps>,
    systems: [
      'variant',
      'size',
      // Action Surface — disabled || loading drives data-interactive-disabled
      // (identical strategy to Button / IconButton, so the Action CSS guards
      // match across the three Action components).
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
    const {
      leftSection,
      rightSection,
      fullWidth,
      loading,
      disabled,
      pressed: pressedProp,
      defaultPressed,
      onPressedChange,
    } = componentProps;

    // Multi-instance slot (same as Button) — we grab the generated
    // className/style bundle once and apply it twice (left + right) inside
    // the JSX below. The factory does NOT auto-render multi-instance slots
    // for us; the second invocation would produce an identical React
    // element which is what we want here.
    const sectionSlot = styles.getStyles('section');

    // ── DEV invariants ─────────────────────────────────────────────────
    // Both short-circuit in production builds inside the helper module.
    // We probe the raw `domProps` bag for `aria-pressed` presence BEFORE
    // destructuring — destructuring would filter the key out of the bag.
    if (process.env.NODE_ENV !== 'production') {
      warnMixedDefaultPressed(defaultPressed);
      warnAriaPressedOverride(domProps as Record<string, unknown>);
    }

    // ── Pressed state (Hooks §4.2) ────────────────────────────────────
    // `useControllableState` routes controlled vs uncontrolled in one place.
    // Lazy defaultValue is not needed here — `defaultPressed ?? false` is a
    // cheap fallback; using a function form would only matter if we were
    // reading from storage / computing.
    //
    // T-8 DEV fallback: if the user somehow got `'mixed'` into
    // `defaultPressed` past the TS layer (via `as any`), the warn above
    // fires and the `typeof === 'string'` probe below coerces to `false`
    // so uncontrolled mode starts from a valid binary state. The
    // `typeof` comparison (rather than `=== 'mixed'`) sidesteps the TS
    // narrow-check — `defaultPressed` is typed `boolean | undefined` so
    // a literal string comparison is an "unintentional" overlap error.
    const defaultValue: ToggleButtonPressedState =
      typeof defaultPressed === 'string'
        ? false
        : (defaultPressed ?? false);

    const [pressed, setPressed] = useControllableState<ToggleButtonPressedState>({
      value: pressedProp,
      defaultValue,
      onChange: onPressedChange,
    });

    // ── Action Surface interactive predicate ─────────────────────────────
    // Re-uses the exact predicate the state system emits as
    // `data-interactive-disabled`. This keeps CSS visual state (hover /
    // active suppression) in lock-step with JS event behavior (click /
    // key swallow). `loading` participates via the 'action' strategy —
    // a loading ToggleButton should not double-toggle.
    const isInteractiveDisabled = resolveInteractive(
      { disabled, loading },
      'action',
    );

    // ── Destructure DOM props ─────────────────────────────────────────
    // Shape matches ActionSurfaceDomProps — the shared type from
    // core/action that enumerates every DOM field the Action Behavior hook
    // reads or wraps. `children` is picked off separately (render concern,
    // not an Action concern).
    //
    // We ALSO peel off `aria-pressed` so a user-supplied value doesn't
    // slip through via `passthroughDomProps` (T-1: component always wins).
    // The DEV warn above already told the user their value was ignored.
    const {
      onClick: userOnClick,
      onKeyDown: userOnKeyDown,
      children: userChildren,
      tabIndex: userTabIndex,
      type: userType,
      role: userRole,
      'aria-pressed': _discardedAriaPressed,
      ...passthroughDomProps
    } = domProps as ActionSurfaceDomProps & {
      children?: React.ReactNode;
      'aria-pressed'?: unknown;
    };
    void _discardedAriaPressed;

    // ── handleClick · the ONLY component-layer extension to Action Behavior
    // (T-4 · zero new Action concerns). Order is load-bearing per T-7:
    //
    //   1. user's onClick fires first (original synthetic event)
    //   2. setPressed flips to next state
    //   3. useControllableState invokes onPressedChange (H-4 · after diff)
    //
    // `preventDefault()` inside userOnClick does NOT cancel the toggle —
    // React synthetic-event preventDefault has no effect on JS control flow
    // after onClick returns. To cancel a toggle the parent must use
    // controlled mode and decline to update `pressed`. This mirrors Radix
    // <Toggle> and shadcn <Toggle>.
    //
    // We use useControllableState's FUNCTIONAL setter form here rather than
    // `!pressed` so the closure doesn't capture stale `pressed`. Effect:
    // handleClick only re-creates when `userOnClick` changes (setPressed is
    // stable per H-3), which is cheaper for the Action Behavior hook's own
    // useMemo dependencies.
    const handleClick = React.useCallback<React.MouseEventHandler>(
      (e) => {
        userOnClick?.(e);
        setPressed((prev) => (prev === 'mixed' ? true : !prev));
      },
      [userOnClick, setPressed],
    );

    // ── Polymorphic Action Behavior · 4 concerns (zero new code) ────────
    // §3.7 contract: this one hook covers pointer swallow, keyboard swallow,
    // keyboard activation (F-1), tab-focus parity, and role='button'
    // injection. ToggleButton feeds it the toggle-wrapped handler; the hook
    // handles interactive-disabled swallow (clicks through handleClick are
    // not invoked when disabled / loading, so setPressed never fires — T-6).
    const actionBehavior = resolvePolymorphicActionBehavior(Element, {
      isInteractiveDisabled,
      onClick: handleClick,
      onKeyDown: userOnKeyDown,
      tabIndex: userTabIndex,
      role: userRole,
      href: passthroughDomProps.href as string | undefined,
    });

    // ── HTML button type default (same rule as Button / IconButton) ──────
    // `<button>` in a `<form>` defaults to `type="submit"` per HTML spec.
    // Neutralize that when (a) Element === 'button' AND (b) user didn't
    // pass an explicit `type`. Polymorphic `<a>` / `<div>` / custom targets
    // skip this — `type` would be meaningless or conflict.
    const effectiveButtonType =
      Element === 'button' && userType === undefined ? 'button' : userType;

    // ── Pressed → ARIA/data attribute serialization (T-1 contract) ───────
    // Always produces a concrete string — never undefined or empty. React's
    // JSX runtime coerces `aria-pressed={true}` to `"true"` automatically,
    // but we serialize to string here so the same value can drive both
    // `aria-pressed` and `data-pressed` without forking the logic.
    const pressedAttr: 'true' | 'false' | 'mixed' =
      pressed === 'mixed' ? 'mixed' : pressed ? 'true' : 'false';

    // Root-level component-local data-attrs. `data-pressed` is the CSS hook
    // for pressed visual state (SR-7 single-writer: this component is the
    // only writer of `data-pressed` — theme / factory / state-system do NOT
    // touch it). `data-full-width` matches Button's pattern.
    const rootDataAttrs: Record<string, string> = {
      'data-pressed': pressedAttr,
    };
    if (fullWidth) rootDataAttrs['data-full-width'] = 'true';

    // ── Loading swap — render spinner INSTEAD OF leftSection (matches
    // Button's D-8-equivalent contract). Preserves the slot's position so
    // there is zero layout shift between loading / idle.
    const isBuiltInSpinner = !!loading;
    const leftContent = isBuiltInSpinner ? <BuiltInSpinner /> : leftSection;

    // ── Root spread ordering (same rule as Button/IconButton: user ≺ system)
    //   1. `ref`                        — non-spread.
    //   2. `styles.getRootProps()`      — theme / vars / root className.
    //   3. `passthroughDomProps`        — user arbitrary props (aria-*, data-*,
    //                                     event handlers we don't wrap).
    //   4. `actionBehavior`             — Pointer/Keyboard/tabIndex/role — MUST
    //                                     win over (3): disabled honesty.
    //   5. `type` default               — component-layer HTML default (B-1).
    //   6. `aria-pressed` + rootDataAttrs — COMPONENT wins over user (T-1 /
    //                                     SR-7 single-writer for data-pressed).
    //   7. `systemDataAttrs`            — system-owned (SR-7 chain).
    //   8. `disabilityAttrs`            — a11y boundary (last).
    //
    // aria-pressed is written inline (not via rootDataAttrs) because React
    // types `aria-pressed` as a specific literal union, which survives
    // `{...rootDataAttrs}` spread but at the cost of losing type narrowing
    // — inline keeps the literal type visible in the JSX.
    return (
      <Element
        ref={ref}
        {...styles.getRootProps()}
        {...passthroughDomProps}
        {...actionBehavior}
        {...(effectiveButtonType !== undefined ? { type: effectiveButtonType } : {})}
        aria-pressed={pressedAttr}
        {...rootDataAttrs}
        {...systemDataAttrs}
        {...disabilityAttrs}
      >
        <ToggleButton.Inner data-prismui-slot-usage {...styles.getStyles('inner')}>
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
          <ToggleButton.Label data-prismui-slot-usage {...styles.getStyles('label')}>
            {userChildren}
          </ToggleButton.Label>
          {rightSection != null && (
            <span
              className={sectionSlot.className}
              style={sectionSlot.style}
              data-position="right"
            >
              {rightSection}
            </span>
          )}
        </ToggleButton.Inner>
      </Element>
    );
  },
);

ToggleButton.displayName = 'ToggleButton';

// Built-in loading spinner — CSS-animated inline <svg>. Markup is identical
// to Button's / IconButton's spinner so consumers get a consistent loading
// motion across the Action Surface family. `aria-hidden='true'` because the
// root element already carries `aria-busy='true'` — announcing both would
// double up on AT.
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
