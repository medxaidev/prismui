import * as React from 'react';
import { factory, ensureClasses, defineSlots } from '../../core/component';
import type { SlotNames } from '../../core/component';
import type { StylesOverride } from '../../core/styles';
import type { PolymorphicSystemProps } from '../../core/props';
import type { PrismuiSize } from '../../core/size';
import type { ThemeColor } from '../../core/variant';
import type { FeedbackFactory } from '../../core/feedback';
import { useControllableState } from '../../hooks';
import { useFieldControlProps } from '../Field/useFieldControlProps';
import { useFieldDataAttrs } from '../Field/useFieldDataAttrs';
import {
  RadioGroupContext,
  type RadioGroupContextValue,
} from './RadioGroupContext';
import { useRovingFocus } from './useRovingFocus';
import { warnDuplicateRadioValues } from './radio-invariants';
import classes from './RadioGroup.module.css';

/**
 * RadioGroup · Control Surface · C-2 Abstract container · single-selection group.
 *
 * Design reference: `@/devdocs/components/Radio/design.md` v0.2
 * Contract references:
 *   - `component-contract.md` SR-1~9 + §3.7 Action Behavior
 *   - `control-surface.md` §2.3 C-2 + §四 FCP-1~6 + §五 FI-0~5
 *   - `focus-behavior.md` v1.2 §4.3 C-2 mode-B variant
 *   - `feedback-contract.md` v0.8.2 (D-1 / Z-3 / Z-5 / FB-3 · pass-through to children)
 *   - WAI-ARIA APG · Radio Group Pattern
 *
 * ── Slot tree ──────────────────────────────────────────────────────────
 *   .root (<div role="radiogroup">)        ← container; owns selection state
 *     {children}                            ← user-supplied <Radio> nodes
 *
 * ── Commit 1 scope (this file lands the foundation only) ───────────────
 *   ✅ Controllable group `value` via useControllableState<string|undefined>
 *   ✅ RadioGroupContext provider — children consume size/color/disabled/
 *      loading/feedbacks/orientation/loop/registry/onSelect
 *   ✅ Roving focus registry (component-local · `useRovingFocus`)
 *   ✅ role="radiogroup" + aria-orientation + data-orientation
 *   ⏳ Field integration (FCP-1~6)             — Commit 5
 *   ⏳ Field.Label delegation upstream         — Commit 6
 *   ⏳ Container CSS / data-invalid descendant — Commit 7
 * ──────────────────────────────────────────────────────────────────── */
const radioGroupSlots = defineSlots({
  root: 'div',
});

export type RadioGroupStylesNames = SlotNames<typeof radioGroupSlots>;

export interface RadioGroupOwnProps extends PolymorphicSystemProps {
  // ── Selection state (R-2 · group持 state) ─────────────────────────────
  /**
   * Controlled selected value. When provided (not `undefined`), the parent
   * owns the value — `onValueChange` is the only back-channel.
   *
   * `undefined` is the legitimate "全不选" initial state — no surrogate
   * sentinel is used (R-2 / §4.3).
   */
  value?: string;
  /**
   * Uncontrolled initial value. `undefined` ≡ no preselection — matches
   * Radix / Mantine / MUI defaults.
   * @default undefined
   */
  defaultValue?: string;
  /** Fires when selection changes via click / Space / arrow keys. */
  onValueChange?: (value: string) => void;

  // ── Visual / System (downstream defaults; child explicit-wins) ───────
  size?: PrismuiSize;
  color?: ThemeColor;
  disabled?: boolean;
  loading?: boolean;

  // ── Keyboard layout (R-10) ───────────────────────────────────────────
  /**
   * Drives arrow-key channel: `'horizontal'` → ←/→ navigate, `'vertical'` →
   * ↑/↓ navigate (the OTHER channel is no-op). Mirrored to `aria-orientation`
   * + `data-orientation` for AT and CSS hooks respectively.
   * @default 'vertical'
   */
  orientation?: 'horizontal' | 'vertical';
  /**
   * When true, arrow navigation wraps at boundaries (WAI-ARIA APG default
   * for radio groups). Set `false` to clamp.
   * @default true
   */
  loop?: boolean;

  // ── Form integration (v1 ARIA-only · v2 hidden input) ────────────────
  /** Form field name (v1 attribute only · v2 will render hidden input). */
  name?: string;

  // ── Field integration (R-6 · Commit 5) ───────────────────────────────
  /** Semantic required marker (Commit 5 will flow to `aria-required`). */
  required?: boolean;

  // ── L4 Feedback (passed down via context · Commit 2 wires children) ──
  /**
   * L4 feedback factories the group hands to every child Radio. Children
   * may override per-instance via their own `feedbacks` prop. Final
   * resolution chain (per child):
   *   props.feedbacks ?? group.feedbacks ?? theme.components.Radio.defaultFeedbacks
   *     ?? RADIO_DEFAULT_FEEDBACKS
   * Pass `feedbacks={[]}` to opt out group-wide.
   */
  feedbacks?: FeedbackFactory[];

  // ── Content ──────────────────────────────────────────────────────────
  children?: React.ReactNode;
}

export type RadioGroupProps =
  & RadioGroupOwnProps
  & StylesOverride<RadioGroupStylesNames>;

const stylesNames = Object.keys(radioGroupSlots) as (keyof typeof radioGroupSlots)[];
const validatedClasses = ensureClasses(stylesNames, classes);

const radioGroupComponentPropKeys = [
  'size',
  'color',
  'disabled',
  'loading',
  'orientation',
  'loop',
  'name',
  'required',
  'value',
  'defaultValue',
  'onValueChange',
  'feedbacks',
] as const;

export const RadioGroup = factory<RadioGroupOwnProps>(
  {
    displayName: 'RadioGroup',
    componentName: 'RadioGroup',
    defaultElement: 'div',
    slots: radioGroupSlots,
    componentPropKeys: radioGroupComponentPropKeys,
    // R-9 mirror of Switch S-9 / Checkbox CB-9 — no `variant` default since
    // RadioGroup container doesn't drive variant tokens (children do via
    // their own factory). `size` / `color` are downstream defaults a child
    // inherits via context, not a visual hook on the container itself.
    defaultProps: {
      color: 'primary',
      size: 'md',
      orientation: 'vertical',
      loop: true,
    } satisfies Partial<RadioGroupOwnProps>,
    systems: [
      // SR-7.1 Key Ownership · same posture as Switch / Checkbox: enrol in
      // the variant system with `vars: false` so `data-color` is emitted
      // (public API surface) but no `--prismui-variant-*` vars leak into
      // the container style. RadioGroup CSS doesn't consume variant vars
      // (the container is essentially a flex/grid layout — children own
      // visual identity).
      { name: 'variant', vars: false },
      'size',
      // Action Strategy on the container so `data-interactive-disabled` is
      // emitted on root when `disabled || loading` — children inherit the
      // freeze through context, but the container also surfaces the same
      // signal for descendant CSS hooks (e.g. `.root[data-interactive-disabled='true'] .circle`).
      { name: 'state', options: { interactiveStrategy: 'action' } },
    ],
    styling: {
      structure: { stylesNames },
      resources: { classes: validatedClasses },
    },
  },
  ({
    Element,
    ref,
    componentProps,
    domProps,
    styles,
    systemDataAttrs,
    disabilityAttrs,
  }) => {
    const {
      value: valueProp,
      defaultValue,
      onValueChange,
      size,
      color,
      disabled,
      loading,
      orientation,
      loop,
      name,
      required,
      feedbacks,
    } = componentProps;

    const effectiveLoading = loading ?? false;
    const effectiveOrientation = orientation ?? 'vertical';
    const effectiveLoop = loop ?? true;

    // ── R-6 · Field integration via useFieldControlProps (FCP-1) ────────
    // RadioGroup is the Field target (R-6) — children Radio do NOT register
    // with Field. The hook injects Field's `id` / `aria-describedby` /
    // `aria-required` / `aria-invalid` / `aria-labelledby` and merges
    // `disabled` / `readOnly` per FCP-2 (Control-explicit-wins).
    const ariaRequiredPassthrough = (domProps as Record<string, unknown>)[
      'aria-required'
    ] as boolean | 'true' | 'false' | undefined;
    const ariaRequiredFromProp: boolean | undefined =
      required === true ? true : undefined;

    const fieldMergeInput = {
      id: (domProps as Record<string, unknown>).id as string | undefined,
      disabled,
      // RadioGroup has no readOnly semantic but pass-through keeps Field-
      // scoped consistency (mirrors Switch's stance).
      readOnly: (domProps as Record<string, unknown>).readOnly as
        | boolean
        | undefined,
      required,
      'aria-describedby': (domProps as Record<string, unknown>)[
        'aria-describedby'
      ] as string | undefined,
      'aria-labelledby': (domProps as Record<string, unknown>)[
        'aria-labelledby'
      ] as string | undefined,
      'aria-invalid': (domProps as Record<string, unknown>)['aria-invalid'] as
        | boolean
        | 'true'
        | 'false'
        | 'grammar'
        | 'spelling'
        | undefined,
      'aria-required': ariaRequiredPassthrough ?? ariaRequiredFromProp,
    };
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const fieldMerged = useFieldControlProps(fieldMergeInput);

    // FCP-3 · Field-aware data-attrs overlay. Action Strategy mirrors the
    // `state` system declaration in payload.systems above.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const fieldAwareStateAttrs = useFieldDataAttrs(
      {
        disabled: fieldMerged.disabled,
        readOnly: fieldMerged.readOnly,
        loading,
      },
      { interactiveStrategy: 'action' },
    );

    // Effective disabled — honors both component prop AND Field's view.
    // Children inherit this via context, so a `<Field disabled>` automatically
    // freezes every Radio in the group (FCP-1 vertical propagation).
    const effectiveDisabled = fieldMerged.disabled ?? false;

    // ── R-2 · group state via useControllableState<string | undefined> ──
    // External setter signature is `(string) => void` because selection only
    // ever moves to a concrete value. The internal generic is widened to
    // `string | undefined` so `defaultValue` honestly admits the "全不选"
    // initial state.
    const [value, setValue] = useControllableState<string | undefined>({
      value: valueProp,
      defaultValue,
      onChange: onValueChange as ((next: string | undefined) => void) | undefined,
    });

    // child commit channel — narrowed to `string` since selections are
    // always concrete. The internal setter accepts the wider type but we
    // never call it with `undefined` here.
    const handleSelect = React.useCallback<(next: string) => void>(
      (next) => {
        setValue(next);
      },
      [setValue],
    );

    // ── Roving focus registry (component-local) ──────────────────────────
    const {
      registerItem,
      getItems,
      focusItem: focusItemBase,
      version: registryVersion,
    } = useRovingFocus();

    // ── DEV invariants · RG-1 · scan for duplicate values among children ──
    // Run after each registry mutation (children mount / unmount / value
    // change). The helper short-circuits in production builds. Latched once
    // per process inside the helper so re-renders don't spam.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useEffect(() => {
      if (process.env.NODE_ENV === 'production') return;
      const values = getItems().map((it) => it.value);
      warnDuplicateRadioValues(values);
    });

    // Adapt `focusItem` to the context shape (no `options` arg — group owns
    // `loop` and `onSelect`). Stable across renders because deps are stable
    // setters.
    const focusItem = React.useCallback<RadioGroupContextValue['focusItem']>(
      (direction, currentId) => {
        focusItemBase(direction, currentId, {
          loop: effectiveLoop,
          onSelect: handleSelect,
        });
      },
      [focusItemBase, effectiveLoop, handleSelect],
    );

    // ── Context value · memoised so identity is stable for unchanged inputs
    // Re-build the context value whenever the registry version bumps so
    // child Radios re-render and recompute their roving tabIndex against
    // the now-populated registry.
    void registryVersion;
    const contextValue = React.useMemo<RadioGroupContextValue>(
      () => ({
        value,
        onSelect: handleSelect,
        size,
        color,
        disabled: effectiveDisabled,
        loading: effectiveLoading,
        feedbacks,
        orientation: effectiveOrientation,
        loop: effectiveLoop,
        registerItem,
        getItems,
        focusItem,
        name,
      }),
      [
        value,
        handleSelect,
        size,
        color,
        effectiveDisabled,
        effectiveLoading,
        feedbacks,
        effectiveOrientation,
        effectiveLoop,
        registerItem,
        getItems,
        focusItem,
        name,
        registryVersion,
      ],
    );

    // v1 form integration: `name` accepted for forward-compat (v2 will
    // render hidden <input> for native form submission). `required` is
    // routed through fieldMerged above.
    void name;

    // Build field-derived ARIA bag — only surface keys the hook actually
    // populated (mirrors Switch's stance).
    const fieldAriaProps: Record<string, string | boolean | undefined> = {};
    if (fieldMerged.id !== undefined) fieldAriaProps.id = fieldMerged.id;
    if (fieldMerged['aria-describedby'] !== undefined) {
      fieldAriaProps['aria-describedby'] = fieldMerged['aria-describedby'];
    }
    if (fieldMerged['aria-labelledby'] !== undefined) {
      fieldAriaProps['aria-labelledby'] = fieldMerged['aria-labelledby'];
    }
    if (fieldMerged['aria-required'] !== undefined) {
      fieldAriaProps['aria-required'] = fieldMerged['aria-required'];
    }
    if (fieldMerged['aria-invalid'] !== undefined) {
      fieldAriaProps['aria-invalid'] = fieldMerged['aria-invalid'];
    }

    // Strip the keys we route through fieldMerged — prevents double-binding
    // on the root (e.g. user-supplied id vs Field-injected id collision).
    const {
      id: _userId,
      'aria-describedby': _userDescribedBy,
      'aria-labelledby': _userLabelledBy,
      'aria-required': _userAriaRequired,
      'aria-invalid': _userAriaInvalid,
      readOnly: _userReadOnly,
      ...passthroughDomProps
    } = domProps as Record<string, unknown>;
    void _userId;
    void _userDescribedBy;
    void _userLabelledBy;
    void _userAriaRequired;
    void _userAriaInvalid;
    void _userReadOnly;

    const rootDataAttrs: Record<string, string> = {
      'data-orientation': effectiveOrientation,
    };
    if (effectiveLoading) rootDataAttrs['data-loading'] = 'true';
    // RG-1 / S-5 · mirror Field's aria-invalid into data-invalid on the
    // radiogroup root so the descendant CSS selector
    // `[role='radiogroup'][data-invalid='true']` can paint each child
    // Radio's `.circle` border in danger without per-child plumbing.
    const mergedAriaInvalid = fieldMerged['aria-invalid'];
    if (mergedAriaInvalid === true || mergedAriaInvalid === 'true') {
      rootDataAttrs['data-invalid'] = 'true';
    } else if (mergedAriaInvalid === false || mergedAriaInvalid === 'false') {
      rootDataAttrs['data-invalid'] = 'false';
    }

    // ── Root spread ordering ────────────────────────────────────────────
    //   1. ref                          — non-spread
    //   2. styles.getRootProps()        — theme / vars / root className
    //   3. domProps                     — user passthrough (aria-*, data-*, handlers)
    //   4. role="radiogroup"            — R-1 · always wins (user role discarded)
    //   5. aria-orientation             — R-10 mirror of orientation prop
    //   6. rootDataAttrs                — single-writer data-orientation / data-loading
    //   7. systemDataAttrs              — variant/size/state base attrs
    //   8. disabilityAttrs              — a11y boundary (last)
    return (
      <RadioGroupContext.Provider value={contextValue}>
        <Element
          ref={ref}
          {...styles.getRootProps()}
          {...passthroughDomProps}
          role="radiogroup"
          aria-orientation={effectiveOrientation}
          {...rootDataAttrs}
          {...fieldAriaProps}
          {...systemDataAttrs}
          {...fieldAwareStateAttrs}
          {...disabilityAttrs}
          {...(effectiveLoading ? { 'aria-busy': true } : {})}
        />
      </RadioGroupContext.Provider>
    );
  },
);

(RadioGroup as React.FC).displayName = 'RadioGroup';
