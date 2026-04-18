import * as React from 'react';
import { factory, ensureClasses, defineSlots } from '../../core/component';
import { isNativeDisableable } from '../../core/component/collect-system-data-attrs';
import { resolveInteractive } from '../../core/state';
import { resolveRadiusToken, type Radius } from '../../core/radius';
import type { SlotNames } from '../../core/component';
import type { VarsResolver, StylesOverride } from '../../core/styles';
import type { PolymorphicSystemProps } from '../../core/props';
import classes from './Button.module.css';

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
  children?: React.ReactNode;
}

export type ButtonProps = ButtonOwnProps & StylesOverride<ButtonStylesNames>;

const varsResolver: VarsResolver<ButtonOwnProps> = (props) => ({
  // External box (Size v2 legacy)
  '--button-height':      'var(--prismui-size-height)',
  '--button-padding-x':   'var(--prismui-size-padding-x)',
  '--button-font-size':   'var(--prismui-size-font-size)',
  // Internal layout (Size v3) — component aliases pointing to system vars
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
    } = componentProps;
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

    // ── Step 10 §2.4 R-D4 · Phase 2 · polymorphic event swallow ───────────
    // When the root element is not native-disableable (polymorphic <a> / <div>
    // / custom component), the browser does NOT block click / keyboard
    // activation on its own — factory only sets `aria-disabled`, which is a
    // visual/a11y flag without behavior. The component layer must swallow
    // click + Enter/Space to avoid "aria-disabled is a visual lie".
    //
    // `loading` is included in the interactive-disabled predicate (Action
    // strategy): a loading button must not double-click while async is in
    // flight, even if the caller didn't pass `disabled`.
    //
    // Rationale for keeping this in the component (not factory): see §5.7.
    // factory's job is attrs; event lifecycle is domain behavior.
    //
    // A-3 · single predicate: `resolveInteractive` is the same function the
    // `state` system uses to produce `data-interactive-disabled`. Reusing it
    // here guarantees CSS visual state and JS event behavior stay in lock-step
    // — no local `disabled || loading` duplication.
    //
    // Naming · variable holds "is this Button currently interactively disabled?"
    // Keep the name aligned with its polarity to prevent `!interactive` bugs
    // in future edits.
    const isInteractiveDisabled = resolveInteractive(
      { disabled, loading },
      'action',
    );

    // B-4 · single destructure for all domProps we need to override or re-route:
    //   - onClick / onKeyDown → we wrap to support the event-swallow predicate
    //   - children           → placed inside `<Button.Label>` (prevents the
    //                          spread vs JSX children footgun)
    //   - tabIndex           → may be overridden by the polymorphic tab bypass
    //   - type               → inspected for the `<button>` default injection
    // The remaining `passthroughDomProps` spreads onto the root element.
    const {
      onClick: userOnClick,
      onKeyDown: userOnKeyDown,
      children: userChildren,
      tabIndex: userTabIndex,
      type: userType,
      ...passthroughDomProps
    } = domProps as {
      onClick?: React.MouseEventHandler;
      onKeyDown?: React.KeyboardEventHandler;
      children?: React.ReactNode;
      tabIndex?: number;
      type?: React.ButtonHTMLAttributes<HTMLButtonElement>['type'];
      [key: string]: unknown;
    };

    const handleClick: React.MouseEventHandler = (e) => {
      if (isInteractiveDisabled) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      userOnClick?.(e);
    };
    const handleKeyDown: React.KeyboardEventHandler = (e) => {
      if (isInteractiveDisabled && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        // do NOT stop propagation — a parent dialog may still want Escape etc.
        return;
      }
      userOnKeyDown?.(e);
    };

    // ── R-D4 part 2 · tab-focus parity for polymorphic interactive-disabled ─
    // Native `<button disabled>` is auto-removed from tab order by the browser.
    // Polymorphic `<a>` / `<div>` with `aria-disabled` stays focusable by
    // default — which means a keyboard user can tab INTO a visually "disabled"
    // button and press Enter, only to find the key swallowed. That mismatch
    // between visual and behavior is the exact "aria-disabled is a lie"
    // symptom we're trying to root out. Mirror native behavior on polymorphic
    // elements: remove from tab order when interactively-disabled.
    //
    // Design choice (NOT bug) · tabIndex hard override when disabled/loading:
    //   User-supplied `tabIndex` is DELIBERATELY overridden to -1 in the
    //   interactive-disabled branch. Rationale: the Action Surface contract
    //   treats `disabled || loading` as a complete keyboard-activation block
    //   (§2.4 R-D4 + §2.7 Action strategy). Accepting a user tabIndex here
    //   would reintroduce the "focusable but key events swallowed" dead-end
    //   we are trying to eliminate. Users who genuinely need focusability on
    //   a disabled button should not pass `disabled` at all and should
    //   manage inert semantics themselves.
    //
    // Polymorphic-detection caveat (§2.4 R-D4 note):
    //   `isNativeDisableable(Element)` only sees static HTML tag names
    //   (`'button'` / `'input'` / …). When a user passes a custom React
    //   component (`component={CustomLink}` that internally renders `<a>`
    //   or `<button>`), we cannot introspect its output and default to
    //   "polymorphic" → conservative tab override. This matches every other
    //   React headless library — the contract on users is: polymorphic
    //   semantics are judged by the TAG NAME passed to `component`.
    const polymorphicNeedsTabBypass =
      isInteractiveDisabled && !isNativeDisableable(Element);
    const effectiveTabIndex = polymorphicNeedsTabBypass ? -1 : userTabIndex;

    // ── B-1 · default `type="button"` on native <button> ──────────────────
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
    return (
      <Element
        ref={ref}
        {...styles.getRootProps()}
        {...passthroughDomProps}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={effectiveTabIndex}
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
