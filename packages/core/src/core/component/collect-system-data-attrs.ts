import * as React from 'react';
import type { ComponentSystemEntry } from './types';
import { pruneUndefined } from './data-attrs-resolver';
import { variantDataAttrs } from '../variant/variant-data-attrs';
import { sizeDataAttrs } from '../size/size-data-attrs';
import { stateDataAttrs } from '../state/state-data-attrs';

/**
 * NATIVE_DISABLEABLE — §5.4
 *
 * The HTML elements whose `disabled` attribute is honored by the browser
 * (event blocking + a11y + `:disabled` pseudo-class). On any other element
 * (`<a>`, `<div>`, Web Component, custom React component) the attribute is
 * silently ignored — we fall back to `aria-disabled` instead and let the
 * component-level render swallow click/keydown events.
 */
const NATIVE_DISABLEABLE = new Set([
  'button',
  'input',
  'select',
  'textarea',
  'fieldset',
  'option',
  'optgroup',
]);

export function isNativeDisableable(Element: React.ElementType): boolean {
  return typeof Element === 'string' && NATIVE_DISABLEABLE.has(Element);
}

/**
 * Aggregate the 7 system-managed root `data-*` attrs from the declared systems.
 *
 * Contract (§5.3): system output is produced here and should be spread AFTER
 * any component-local rootDataAttrs to hard-override misdeclared keys. Factory
 * enforces this by placing systemDataAttrs last in the default render path;
 * custom render paths receive the dictionary via FactoryRenderContext and
 * are expected to spread it last themselves.
 */
export function collectSystemDataAttrs(
  systems: readonly ComponentSystemEntry[] | undefined,
  props: Record<string, any>,
): Record<string, string> {
  if (!systems || systems.length === 0) return {};

  const merged: Record<string, string | undefined> = {};

  for (const entry of systems) {
    const name = typeof entry === 'string' ? entry : entry.name;
    const enabled = typeof entry === 'string' ? undefined : entry.enabled;
    const options = typeof entry === 'string' ? undefined : entry.options;

    if (enabled && !enabled(props)) continue;

    if (name === 'variant') {
      Object.assign(merged, variantDataAttrs(props));
    } else if (name === 'size') {
      Object.assign(merged, sizeDataAttrs(props));
    } else if (name === 'state') {
      Object.assign(merged, stateDataAttrs(props, options));
    }
  }

  return pruneUndefined(merged);
}

/**
 * Resolve native `disabled`, `aria-disabled`, and `aria-busy` for the root
 * element (§2.4 decision table + §5.4).
 *
 * - Native-disableable element (`button` / `input` / ...): emit native
 *   `disabled=true`; skip `aria-disabled` (the browser already expresses it).
 * - Polymorphic element (`a` / `div` / custom): emit `aria-disabled='true'`;
 *   skip native `disabled` (silently ignored by the browser).
 * - Loading (independent): emit `aria-busy='true'` on any element type.
 *   Does NOT imply `disabled` — that's the caller's choice (see §2.5).
 */
export function resolveDisabilityAttrs(
  Element: React.ElementType,
  props: Record<string, any>,
): Record<string, any> {
  const out: Record<string, any> = {};
  const disabled = !!props.disabled;
  const loading = !!props.loading;

  if (disabled) {
    if (isNativeDisableable(Element)) {
      out.disabled = true;
    } else {
      out['aria-disabled'] = true;
    }
  }

  if (loading) {
    out['aria-busy'] = true;
  }

  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase 3 · DEV warnings — single-writer hierarchy enforcement (SR-7 · §6.5)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Per-system managed `data-*` key registry.
 *
 * These attributes MUST be produced ONLY by the declared system (Layer 1) or
 * a feature overlay hook such as `useFieldDataAttrs` (Layer 2). Component
 * render bodies MUST NOT emit them directly (§6.5 H-3), and user JSX SHOULD
 * NOT override them — factory spreads `systemDataAttrs` last so any override
 * will be silently discarded. We make that silence loud in development.
 */
const SYSTEM_MANAGED_DATA_KEYS: Record<string, readonly string[]> = {
  variant: ['data-variant', 'data-color'],
  size: ['data-size'],
  state: [
    'data-disabled',
    'data-loading',
    'data-readonly',
    'data-interactive-disabled',
  ],
};

/**
 * Module-level fingerprint cache: one warning per (component × attr) pair
 * per process. Prevents render-loop spam while keeping the signal once per
 * violating call site.
 */
const _warnedOverrideFingerprints =
  process.env.NODE_ENV !== 'production' ? new Set<string>() : null;

/**
 * DEV-only: warn when user / component-authored props collide with a key
 * managed by a declared system.
 *
 * No-op in production (bundlers can dead-code eliminate the call). Ignored
 * silently when `systems` is empty (the component opts out of the contract).
 *
 * Warning channel: `console.error` (loud) — matches "fail safe but loud"
 * discipline from §6.5 A-6. Production behavior is unaffected: factory's
 * JSX spread order guarantees system values win.
 */
export function warnSystemDataAttrOverrides(
  componentName: string,
  systems: readonly ComponentSystemEntry[] | undefined,
  userProps: Record<string, any>,
): void {
  if (process.env.NODE_ENV === 'production') return;
  if (!systems || systems.length === 0) return;

  for (const entry of systems) {
    const name = typeof entry === 'string' ? entry : entry.name;
    const keys = SYSTEM_MANAGED_DATA_KEYS[name];
    if (!keys) continue;

    for (const key of keys) {
      if (!(key in userProps)) continue;

      const fingerprint = `${componentName}\u0000${key}`;
      if (_warnedOverrideFingerprints!.has(fingerprint)) continue;
      _warnedOverrideFingerprints!.add(fingerprint);

      console.error(
        `[PrismUI] "${componentName}" received an explicit "${key}" prop, ` +
        `but the "${name}" system is the single writer for this attribute ` +
        `(SR-7 · component-contract §6.5 H-1). The explicit value will be ` +
        `silently overridden by the system. Remove the "${key}" prop and ` +
        `let the system derive it from component props (e.g. variant / size / ` +
        `disabled / loading).`,
      );
    }
  }
}

/**
 * DEV-only helper: reset the override-warning fingerprint cache. Test-only;
 * never call in production code.
 */
export function __resetSystemDataAttrOverrideWarnings(): void {
  if (process.env.NODE_ENV === 'production') return;
  _warnedOverrideFingerprints?.clear();
}
