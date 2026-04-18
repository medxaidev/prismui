import type * as React from 'react';
import { isNativeDisableable } from '../component/collect-system-data-attrs';

/**
 * Inputs to `resolvePolymorphicActionBehavior`.
 *
 * Captures the subset of DOM / ARIA props the Action Surface hook may need to
 * override (onClick / onKeyDown / tabIndex / type / role). Callers extract
 * these from `domProps` by destructuring, pass them in, and spread the
 * returned object back onto the root element.
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
  /** User-supplied `type`. Consumed only when `Element === 'button'`. */
  type?: React.ButtonHTMLAttributes<HTMLButtonElement>['type'];
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
  /** Present only when the component should inject or override `type`. */
  type?: React.ButtonHTMLAttributes<HTMLButtonElement>['type'];
  /** Present only when the component should inject or override `role`. */
  role?: React.AriaRole;
}

/**
 * `resolvePolymorphicActionBehavior` · Stage 3 Step 10 · A-2 / B-1 / B-2.
 *
 * The single source of truth for Action Surface rendering behavior on a
 * polymorphic root element. Consolidates four concerns that every Action
 * component (Button / IconButton / ToggleButton / ActionIcon / …) otherwise
 * copy-pastes verbatim:
 *
 *   (1) Event swallow — click + Enter/Space blocked when interactive-disabled
 *       (§2.4 R-D4 Phase 2). This fixes the "aria-disabled is a visual lie"
 *       anti-pattern on polymorphic elements where the browser does NOT
 *       automatically block activation.
 *
 *   (2) Tab-focus parity — polymorphic non-disableable elements (`<a>` /
 *       `<div>` / custom components) stay focusable by default. When the
 *       Surface is interactive-disabled, we mirror native `<button disabled>`
 *       behavior by overriding tabIndex to -1 (§2.4 R-D4 part 2).
 *
 *   (3) `type="button"` default — a native `<button>` nested in a `<form>`
 *       defaults to `type="submit"` (HTML spec), causing a classic footgun
 *       where `<Button onClick={openModal}>` inadvertently submits the form.
 *       We inject `type="button"` only when Element is the literal `'button'`
 *       tag AND the user did not supply one.
 *
 *   (4) `role="button"` injection — polymorphic non-button non-link elements
 *       (`<div>` / `<span>` / `<a>` without href / custom components) carry
 *       no native button semantics. We inject `role="button"` so screen
 *       readers announce them as buttons. Native `<button>` already carries
 *       the role, and `<a href>` is genuinely a link — those are skipped.
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
 *     type: userType,
 *     role: userRole,
 *     href: userHref,
 *   });
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
    type: userType,
    role: userRole,
    href,
  } = inputs;

  // (1) Event swallow wrappers — always wrap so CSS-visual and JS-behavioral
  // disabling stay in lock-step. When `isInteractiveDisabled` is false the
  // wrappers are pass-through; the allocation cost is negligible (parent
  // re-renders per prop change anyway).
  const onClick: React.MouseEventHandler = (e) => {
    if (isInteractiveDisabled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    userOnClick?.(e);
  };
  const onKeyDown: React.KeyboardEventHandler = (e) => {
    if (isInteractiveDisabled && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      // Do NOT stopPropagation — a parent dialog may still want Escape etc.
      return;
    }
    userOnKeyDown?.(e);
  };

  // (2) Tab-focus parity — only override for polymorphic non-disableable.
  // Native `<button disabled>` is auto-removed by the browser; no override.
  const isPolymorphicNonDisableable = !isNativeDisableable(Element);
  const polymorphicNeedsTabBypass =
    isInteractiveDisabled && isPolymorphicNonDisableable;
  const effectiveTabIndex = polymorphicNeedsTabBypass ? -1 : userTabIndex;

  // (3) `type="button"` default — only for literal `'button'` tag, only when
  // user didn't supply one. Polymorphic `<a>` / `<div>` / custom must not
  // receive a type attribute (meaningless or semantically collision-prone).
  const effectiveType =
    Element === 'button' && userType === undefined ? 'button' : userType;

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
  if (effectiveType !== undefined) result.type = effectiveType;
  if (effectiveRole !== undefined) result.role = effectiveRole;
  return result;
}
