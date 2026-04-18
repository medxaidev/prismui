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
