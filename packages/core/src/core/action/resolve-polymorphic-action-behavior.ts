import type * as React from 'react';
import { isNativeDisableable } from '../component/collect-system-data-attrs';

/**
 * `isActivationKey` — Action system primitive.
 *
 * Returns true when `key` is one of the two WAI-ARIA "activation keys" that
 * trigger a button: `Enter` or `Space` (the space character `' '`). Promoted
 * to a named exported helper (rather than an inline string check) because:
 *
 *   • Multiple future hooks — Pointer-style `resolvePolymorphicActionBehavior`
 *     today, Menu.Item / Tabs.Trigger / SegmentedControl.Item tomorrow — all
 *     need the same predicate. A typo (`'Space'` vs `' '`) in any copy
 *     silently breaks keyboard activation.
 *   • `' '` (U+0020) is a tricky string literal; the named helper removes the
 *     opportunity to get it wrong.
 *   • Future extensions (e.g. allow modifier-less Space only, exclude
 *     repeat-key events) can be added centrally without chasing call sites.
 *
 * Not gated on `e.repeat` — callers decide whether to block key-repeat,
 * because Menu.Item arrow navigation etc. legitimately wants repeat.
 */
export function isActivationKey(key: string): boolean {
  return key === 'Enter' || key === ' ';
}

/**
 * `isNativeActivating` — does this element natively convert Enter/Space into
 * a click event without JS help?
 *
 *   • `<button>` — yes (both Enter and Space)
 *   • `<a href>`  — yes for Enter (navigates); Space does NOT navigate but
 *                    this helper still returns true because browsers treat
 *                    the element as "activating" and firing `.click()`
 *                    ourselves would duplicate navigation.
 *   • Everything else (`<a>` without href, `<div>`, `<span>`, custom
 *                    component) — no; we must simulate activation.
 *
 * Kept local to this module because the predicate only makes sense inside
 * the Action keyboard model. If a future Selection / Disclosure model needs
 * a similar predicate, promote to a shared helper at that time.
 */
function isNativeActivating(
  Element: React.ElementType,
  href: string | undefined,
): boolean {
  if (Element === 'button') return true;
  if (Element === 'a' && typeof href === 'string') return true;
  return false;
}

/**
 * `ActionSurfaceDomProps` — the union of DOM/ARIA props that any Action Surface
 * component needs to destructure out of `domProps` before spreading the rest
 * back onto the root. Centralized here so Button / IconButton / ToggleButton /
 * ActionIcon / Menu.Item / Tabs.Trigger / SegmentedControl.Item do not each
 * re-declare the same 6-field inline cast.
 *
 * Every field is OPTIONAL — a raw `<Button>` without `onClick` / `type` / etc.
 * should still satisfy the type. The `[key: string]: unknown` index signature
 * preserves the "anything else passes through" escape hatch for arbitrary
 * `aria-*` / `data-*` / native HTML attributes the component does not need to
 * intercept.
 *
 * Why a shared named type (instead of each component casting inline):
 *   • Single source of truth for "which DOM keys does the Action Behavior
 *     model care about". If F-1-style additions happen (e.g. adding
 *     `onPointerDown` wrappers later), the new field lands in ONE place.
 *   • Removes the opportunity for typos (`onkeydown` vs `onKeyDown`) in six
 *     different components.
 *   • Matches the "Action Core layer" mental model established in Audit Log
 *     v0.7 — the keyboard activation fix proved this layer is real.
 *
 * Kept intentionally minimal: only fields the hook actively reads or wraps.
 * `children` is NOT in this shape — it is a render-body concern (see Button's
 * `userChildren` destructure), not an Action Surface one.
 */
export interface ActionSurfaceDomProps {
  onClick?: React.MouseEventHandler;
  onKeyDown?: React.KeyboardEventHandler;
  tabIndex?: number;
  type?: React.ButtonHTMLAttributes<HTMLButtonElement>['type'];
  role?: React.AriaRole;
  href?: string;
  [key: string]: unknown;
}

/**
 * Inputs to `resolvePolymorphicActionBehavior`.
 *
 * Captures the subset of DOM / ARIA props the Action Surface hook may need to
 * override (onClick / onKeyDown / tabIndex / role). Callers extract these
 * from `domProps` by destructuring, pass them in, and spread the returned
 * object back onto the root element.
 *
 * **Intentionally excluded** — `type` (the HTML `<button type>` default):
 * it is a pure static attribute default with zero dependency on the Action
 * Surface predicate or event handlers, so it lives in the component render
 * body where it originally belonged. Keeping it out of this hook preserves
 * the rule "a hook named `*Behavior` only adjusts behavior, never silently
 * mutates unrelated HTML semantics." See Audit Log 2026-04-18 v0.6.
 *
 * `href` is read (not written) — purely for link-vs-button classification on
 * the `<a>` tag (`<a href>` is a link → keep role="link"; `<a>` without href
 * gets role="button").
 */
export interface ResolvePolymorphicActionInputs {
  /**
   * The Action Surface "non-interactive" predicate result — single source of
   * truth supplied by the caller (typically the result of
   * `resolveInteractive(props, 'action')`). The hook does NOT recompute it.
   */
  isInteractiveDisabled: boolean;
  /** User-supplied click handler. Wrapped with swallow-when-disabled guard. */
  onClick?: React.MouseEventHandler;
  /** User-supplied keydown handler. Wrapped with Enter/Space swallow guard. */
  onKeyDown?: React.KeyboardEventHandler;
  /** User-supplied tabIndex. Overridden to `-1` when polymorphic non-disableable and interactive-disabled. */
  tabIndex?: number;
  /** User-supplied `role`. Respected if set; otherwise may inject 'button' for polymorphic non-button non-link. */
  role?: React.AriaRole;
  /** User-supplied `href`. Controls `<a>` link-vs-button role classification. */
  href?: string;
}

/**
 * Return shape of `resolvePolymorphicActionBehavior`. Designed to be spread
 * directly onto the root element AFTER user-supplied `domProps` so the wrapped
 * handlers and any injected defaults take precedence.
 *
 * Optional keys are OMITTED (not `undefined`) when they should not be emitted,
 * so callers can rely on `{ ...passthroughDomProps, ...actionProps }` ordering
 * without accidentally clobbering a pass-through attribute with `undefined`.
 */
export interface ResolvePolymorphicActionResult {
  /** Always defined — the swallow-aware click wrapper. */
  onClick: React.MouseEventHandler;
  /** Always defined — the swallow-aware keydown wrapper. */
  onKeyDown: React.KeyboardEventHandler;
  /** Present only when the component should inject or override tabIndex. */
  tabIndex?: number;
  /** Present only when the component should inject or override `role`. */
  role?: React.AriaRole;
}

/**
 * `resolvePolymorphicActionBehavior` · Stage 3 Step 10 · A-2 / B-2 / F-1.
 *
 * The single source of truth for Action Surface rendering **behavior** on a
 * polymorphic root element. The Action Behavior model has four concerns,
 * all tightly coupled to the event handlers the hook installs, that every
 * Action component (Button / IconButton / ToggleButton / ActionIcon / …)
 * would otherwise copy-paste verbatim:
 *
 *     Action Behavior  =  Pointer (click swallow)
 *                      +  Keyboard (Enter/Space swallow + activation)
 *                      +  Disabled guard (tab-focus parity)
 *                      +  ARIA role injection
 *
 *   (1) Pointer swallow — click blocked when interactive-disabled (§2.4 R-D4
 *       Phase 2). Fixes the "aria-disabled is a visual lie" anti-pattern on
 *       polymorphic elements where the browser does NOT auto-block activation.
 *
 *   (2) Keyboard — two-sided parity (§2.4 R-D4 Phase 2 + Phase 3 / F-1):
 *         (2a) Swallow: Enter/Space blocked when interactive-disabled.
 *         (2b) Activate: on enabled polymorphic non-native elements
 *              (`<div>` / `<span>` / `<a>` without href / custom), convert
 *              Enter/Space keydown into a `.click()` to honor the
 *              `role="button"` contract injected in (4). Native `<button>`
 *              and `<a href>` are skipped — the browser handles activation
 *              there, and a manual click would double-fire (or double-
 *              navigate). `.click()` (not `dispatchEvent`) is used so React
 *              synthetic-event subscribers receive the call.
 *
 *   (3) Tab-focus parity — polymorphic non-disableable elements (`<a>` /
 *       `<div>` / custom components) stay focusable by default. When the
 *       Surface is interactive-disabled, we mirror native `<button disabled>`
 *       behavior by overriding tabIndex to -1 (§2.4 R-D4 part 2).
 *
 *   (4) `role="button"` injection — polymorphic non-button non-link elements
 *       (`<div>` / `<span>` / `<a>` without href / custom components) carry
 *       no native button semantics. We inject `role="button"` so screen
 *       readers announce them as buttons. The activation branch in (2b) is
 *       what makes this role announcement honest — "AT says button, keyboard
 *       behaves like button" must be a biconditional.
 *
 * **NOT in scope** — `type="button"` default: it is a static HTML attribute
 * default with no state / handler coupling, so it is applied in the component
 * render body (Button.tsx) rather than here. Putting it here would violate
 * "a *Behavior hook must not silently mutate unrelated HTML semantics."
 *
 * Polymorphic-detection caveat (same as §2.4 R-D4 note):
 *   `isNativeDisableable(Element)` only sees string tag names. Custom React
 *   components default to "polymorphic" → conservative tab-bypass + role
 *   injection. Users who pass `component={CustomLink}` get role="button"
 *   applied; if their custom component already renders a semantic button
 *   internally, the injected role will merge idempotently.
 *
 * @param Element  The resolved polymorphic element (`factory`'s `Element`).
 * @param inputs   User-supplied handlers / attrs + the Action predicate result.
 * @returns        Spread-ready overrides; undefined keys are omitted.
 *
 * @example
 *   const actionProps = resolvePolymorphicActionBehavior(Element, {
 *     isInteractiveDisabled: resolveInteractive({ disabled, loading }, 'action'),
 *     onClick: userOnClick,
 *     onKeyDown: userOnKeyDown,
 *     tabIndex: userTabIndex,
 *     role: userRole,
 *     href: userHref,
 *   });
 *   // `type` default applied separately in the render body (see Button.tsx)
 *   return <Element {...passthroughDomProps} {...actionProps} />;
 */
export function resolvePolymorphicActionBehavior(
  Element: React.ElementType,
  inputs: ResolvePolymorphicActionInputs,
): ResolvePolymorphicActionResult {
  const {
    isInteractiveDisabled,
    onClick: userOnClick,
    onKeyDown: userOnKeyDown,
    tabIndex: userTabIndex,
    role: userRole,
    href,
  } = inputs;

  // (1) Pointer swallow + (2) Keyboard swallow+activate — always wrap so
  // CSS-visual and JS-behavioral disabling stay in lock-step, and so the
  // role="button" contract is honest on polymorphic non-native elements.
  // When `isInteractiveDisabled` is false the pointer wrapper is
  // pass-through; the allocation cost is negligible (parent re-renders per
  // prop change anyway).
  const onClick: React.MouseEventHandler = (e) => {
    if (isInteractiveDisabled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    userOnClick?.(e);
  };
  const onKeyDown: React.KeyboardEventHandler = (e) => {
    if (isActivationKey(e.key)) {
      // (2a) Disabled → swallow the activation key, don't call user handler.
      if (isInteractiveDisabled) {
        e.preventDefault();
        // Do NOT stopPropagation — a parent dialog may still want Escape etc.
        return;
      }
      // (2b) Enabled + polymorphic non-native → simulate click so the
      // role="button" contract is honest. Space would otherwise scroll; Enter
      // on a <div> would otherwise be inert. `.click()` dispatches a native
      // click event that React synthetic-event listeners (`onClick` etc.) DO
      // receive — prefer this over `dispatchEvent(new MouseEvent(...))` which
      // can bypass React's event plugin. We fall through to `userOnKeyDown`
      // afterwards so the user can still observe raw keydown if they want.
      if (!isNativeActivating(Element, href)) {
        e.preventDefault();
        (e.currentTarget as HTMLElement).click();
      }
    }
    userOnKeyDown?.(e);
  };

  // (3) Tab-focus parity — only override for polymorphic non-disableable.
  // Native `<button disabled>` is auto-removed by the browser; no override.
  const isPolymorphicNonDisableable = !isNativeDisableable(Element);
  const polymorphicNeedsTabBypass =
    isInteractiveDisabled && isPolymorphicNonDisableable;
  const effectiveTabIndex = polymorphicNeedsTabBypass ? -1 : userTabIndex;

  // (4) `role="button"` injection — respect user-supplied role first, then
  // skip native `<button>` (has role implicitly) and `<a href>` (is a link).
  // Everything else in the polymorphic space (`<a>` without href, `<div>`,
  // `<span>`, custom components) receives role="button".
  let effectiveRole: React.AriaRole | undefined = userRole;
  if (effectiveRole === undefined) {
    const isNativeButton = Element === 'button';
    const isLink = Element === 'a' && typeof href === 'string';
    if (!isNativeButton && !isLink) {
      effectiveRole = 'button';
    }
  }

  // Build result with only-defined-keys pattern so spread ordering is safe.
  const result: ResolvePolymorphicActionResult = { onClick, onKeyDown };
  if (effectiveTabIndex !== undefined) result.tabIndex = effectiveTabIndex;
  if (effectiveRole !== undefined) result.role = effectiveRole;
  return result;
}
