import * as React from 'react';
import { factory, ensureClasses, defineSlots } from '../../core/component';
import type { SlotNames } from '../../core/component';
import type { StylesOverride } from '../../core/styles';
import type { PolymorphicSystemProps } from '../../core/props';
import { useFieldContext } from './FieldContext';
import classes from './Field.module.css';

const labelSlots = defineSlots({
  root: 'label',
});

export type FieldLabelStylesNames = SlotNames<typeof labelSlots>;

export interface FieldLabelOwnProps
  extends Omit<PolymorphicSystemProps, 'size' | 'variant' | 'color' | 'disabled'> {
  children?: React.ReactNode;
}

export type FieldLabelProps = FieldLabelOwnProps & StylesOverride<FieldLabelStylesNames>;

// Class map maps the factory's "root" slot to the shared CSS Module's `.label` class,
// so all three compound components can share Field.module.css.
const labelClassMap = { root: classes.label } as const;
const stylesNames = Object.keys(labelSlots) as (keyof typeof labelSlots)[];
const validatedClasses = ensureClasses(stylesNames, labelClassMap);

/**
 * Field.Label — semantic label with automatic `htmlFor` connection.
 *
 * Reads `inputId` / `labelId` / `required` / `disabled` from FieldContext.
 * When used outside Field, falls back gracefully (no htmlFor, no required marker).
 *
 * Required marker (`*`) is rendered via CSS `::after` + `[data-required]`
 * attribute selector — see `Field.module.css`.
 *
 * ── S-6a click delegation (Switch design.md §一 / OQ-S-11 path B) ────────
 * HTML does NOT guarantee `<label htmlFor="id">` forwarding clicks to a
 * non-form-control target (e.g. `<button role="switch">`). Browser behavior:
 *   - Chrome: click on label → click fires on the button (lucky path)
 *   - Firefox: click on label → focus only, no click
 *   - Safari: historically unstable across versions
 *
 * To compensate, FieldLabel performs delegated activation at the component
 * layer: on click, if the associated element is a non-form-control that
 * wouldn't naturally receive the click from browser label forwarding, we
 * call `.click()` on it ourselves. The test probes `role` on the target to
 * decide — any element with a non-default ARIA role (switch / checkbox /
 * radio / etc.) means the author opted into an aria-driven control whose
 * native click forwarding can't be assumed.
 *
 * Explicitly NOT extending FieldContext with a `controlRef` / registration
 * mechanism (FieldContext.ts:13 enforces "NO registration mechanism"). The
 * approach here is pure DOM lookup (`getElementById`), which:
 *   - Works with any host (button / div / a with role=switch)
 *   - Doesn't break Switch's "zero Core increment" promise
 *   - Stays inert if the control is form-native (it would have received
 *     the click anyway via HTML's native label semantics)
 * ──────────────────────────────────────────────────────────────────────── */
export const FieldLabel = factory(
  {
    displayName: 'Field.Label',
    componentName: 'Field.Label',
    defaultElement: 'label',
    slots: labelSlots,
    componentPropKeys: [] as const,
    styling: {
      structure: { stylesNames },
      resources: { classes: validatedClasses },
    },
  },
  ({ Element, ref, domProps, styles }) => {
    const ctx = useFieldContext();
    const dataAttrs: Record<string, string> = {};
    if (ctx?.required) dataAttrs['data-required'] = 'true';
    if (ctx?.disabled) dataAttrs['data-disabled'] = 'true';

    // Preserve any user-supplied onClick; our delegation runs FIRST (the
    // user may call preventDefault to opt out), then the user's original
    // handler runs after.
    const userOnClick = (domProps as { onClick?: React.MouseEventHandler })
      .onClick;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const onClick = React.useCallback<React.MouseEventHandler>(
      (event) => {
        // ── S-6a delegation ────────────────────────────────────────────
        // Fire ONLY inside a Field (we need inputId). Skip if the label
        // click originated from inside the control itself (e.g. label
        // wrapping the button and the user clicked the button) — firing
        // .click() again would cause a double toggle.
        if (
          ctx &&
          typeof document !== 'undefined' &&
          !event.defaultPrevented
        ) {
          const target = document.getElementById(ctx.inputId);
          if (
            target &&
            target !== event.target &&
            !target.contains(event.target as Node | null)
          ) {
            const role = target.getAttribute('role');
            const tag = target.tagName;
            // Only delegate for non-form-controls that wouldn't receive the
            // click from HTML's native label-forward. Form-natives (input /
            // select / textarea) already do the right thing via HTML5
            // label-control association.
            const isFormNative =
              tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA';
            const hasAriaRole = role !== null && role !== '';
            if (!isFormNative && hasAriaRole) {
              // Two-step: (1) prevent the browser's native label-forward
              // (inconsistent across Chrome / Firefox / Safari for
              // role-driven targets, and present in jsdom too — see
              // `devdocs/components/Switch/design.md` §S-6a); (2) manually
              // dispatch the click ONLY when the Field is not disabled.
              // This gives us one consistent click path across every
              // engine and preserves the S-7 freeze contract.
              event.preventDefault();
              if (!ctx.disabled) {
                // ── P0-2 A · radiogroup branch (Radio design.md §8.2c) ──
                // RadioGroup is a non-interactive container; calling
                // .click() on a <div role="radiogroup"> is a no-op. The
                // semantically meaningful action is "enter the group" —
                // focus + activate the first non-disabled Radio child,
                // matching WAI-ARIA APG / Radix / MUI label-forward
                // expectations.
                if (role === 'radiogroup') {
                  const radios = target.querySelectorAll('[role="radio"]');
                  const focusable = Array.from(radios).find((node) => {
                    const el = node as HTMLElement;
                    if (el.hasAttribute('disabled')) return false;
                    if (el.getAttribute('aria-disabled') === 'true') {
                      return false;
                    }
                    return true;
                  }) as HTMLElement | undefined;
                  if (focusable) {
                    focusable.focus();
                    focusable.click();
                  }
                } else {
                  target.click();
                }
              }
            }
          }
        }
        userOnClick?.(event);
      },
      [ctx, userOnClick],
    );

    // Strip onClick from domProps so our wrapped version is the only
    // writer on the element (prevents double-binding if React spreads
    // user onClick last). We rebuild the spread explicitly below.
    const { onClick: _userOnClick, ...restDomProps } = domProps as {
      onClick?: React.MouseEventHandler;
      [key: string]: unknown;
    };
    void _userOnClick;

    return (
      <Element
        ref={ref}
        {...styles.getRootProps()}
        htmlFor={ctx?.inputId}
        id={ctx?.labelId}
        {...dataAttrs}
        {...restDomProps}
        onClick={onClick}
      />
    );
  },
);

(FieldLabel as React.FC).displayName = 'Field.Label';
