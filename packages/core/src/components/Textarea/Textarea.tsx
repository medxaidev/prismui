import * as React from 'react';
import { factory, ensureClasses, defineSlots } from '../../core/component';
import type { SlotNames } from '../../core/component';
import type { VarsResolver, StylesOverride } from '../../core/styles';
import type { PrismuiSize } from '../../core/size';
import { defaultSizeTokens } from '../../core/size';
import { resolveRadiusToken, type Radius } from '../../core/radius';
import { variantColorResolver, VARIANT_CSS_VARS } from '../../core/variant';
import type { Variant } from '../../core/variant';
import { chainHandlers } from '../../core/utils';
import { useFieldControlProps, useFieldDataAttrs } from '../Field';
import { useAutosizeMeasure } from './useAutosizeMeasure';
import classes from './Textarea.module.css';

// ── Slots ───────────────────────────────────────────────────────────────────
const textareaSlots = defineSlots({
  root: 'div',
  input: 'textarea',
});

export type TextareaStylesNames = SlotNames<typeof textareaSlots>;

// ── Public Types ────────────────────────────────────────────────────────────

/** Visual variant — mirrors Input v1 vocabulary. */
export type TextareaVariant = 'outlined' | 'filled' | 'unstyled';

/**
 * `resize` CSS values exposed via prop. When `autosize` is true this prop is
 * forced to `'none'` (T-5 · §10).
 */
export type TextareaResize = 'none' | 'vertical' | 'horizontal' | 'both';

export interface TextareaOwnProps {
  /** Visual size (Size System). @default 'md' */
  size?: PrismuiSize;
  /** Visual variant. @default 'outlined' */
  variant?: TextareaVariant;
  /**
   * Border radius (theme scale or CSS length). @default 'md'
   * @see Radius System — `core/radius`
   */
  radius?: Radius;
  /**
   * Enable content-driven height (autosize). When true, `resize` is forced to
   * `'none'` (T-5). @default false
   *
   * @see devdocs/components/Textarea/design.md §9 (autosize algorithm)
   */
  autosize?: boolean;
  /**
   * Lower bound for autosize height, expressed in rendered text rows.
   * Also drives the SSR baseline `--input-min-rows` instance var (T-4-B).
   *
   * Normalization (T-8): non-finite (NaN / ±Infinity) and non-positive
   * values are coerced to 1; non-integers are floored. @default 1
   */
  minRows?: number;
  /**
   * Upper bound for autosize height. Pass `Infinity` (default) for unlimited
   * growth. Normalization (T-8): same as `minRows`, but `Infinity` is a legal
   * special case; if `maxRows < minRows` after normalization, DEV warns and
   * `maxRows` is coerced to `minRows`. @default Infinity
   */
  maxRows?: number;
  /**
   * CSS `resize` behavior on the inner `<textarea>`. Ignored (forced to
   * `'none'`) when `autosize` is true (T-5). @default 'vertical'
   */
  resize?: TextareaResize;
}

/**
 * Textarea props.
 *
 * Extends native `<textarea>` HTML attributes (value / onChange / placeholder /
 * rows / etc.).
 *
 * **Does NOT expose** (T-7):
 * - `leftSection` / `rightSection` — multiline icon UX deferred to v2 (OQ-T-3)
 * - `pointer` — Textarea is never used as a Select trigger
 * - `invalid` — driven via `aria-invalid` (from Field or user)
 * - `color` — v1 does not participate in Color System
 *
 * See `devdocs/components/Textarea/design.md` for the full contract.
 */
export type TextareaProps = TextareaOwnProps
  & StylesOverride<TextareaStylesNames>
  & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>;

// ── Local size table — padding-y (component-local · §6.2) ───────────────────
//
// Why local: Size System v3 (`with-size-vars.ts`) does NOT expose
// `--prismui-size-padding-y`. Textarea v1 declares `{ name: 'size', vars: false }`
// (Round 4 method A') so the size system writes `data-size` but skips vars
// injection — the component owns padding-y as a local var (T-2 · §18.2).
//
// Numeric values mirror Input's design intent (font-size · padding-x consumed
// from `defaultSizeTokens`); padding-y is design.md §6.2 starter values, to be
// confirmed with design once visual review begins.
const PADDING_Y_BY_SIZE: Record<PrismuiSize, string> = {
  xs:  '4px',
  sm:  '6px',
  md:  '8px',
  lg: '10px',
  xl: '12px',
};

// ── Variant adapter — Phase 1 (mirrors Input.tsx INPUT_VARIANT_TO_BASE) ─────
//
// Maps Textarea's public variant names → Button-world variant names, which
// `variantColorResolver` then routes to the correct VariantRole:
//   outlined → 'outlined' → VariantRole.bordered
//   filled   → 'soft'     → VariantRole.low
//   unstyled → null       → bypass (token-free per IV-4 analog)
const TEXTAREA_VARIANT_TO_BASE = {
  outlined: 'outlined',
  filled:   'soft',
  unstyled: null,
} as const satisfies Record<TextareaVariant, Variant | null>;

// ── varsResolver — component-local size + variant token wiring ──────────────
//
// Round 4 method A': `systems` declares variant + size with `vars: false` so
// the systems write `data-variant` / `data-size` (single-writer · SR-7.1) but
// skip their built-in vars middleware. This resolver is the SOLE writer of
// the Textarea CSS var contract (`--input-*` family + `--prismui-variant-*`).
const varsResolver: VarsResolver<TextareaOwnProps> = (props, theme) => {
  const size = props.size ?? 'md';
  const sizeTokens = theme?.size?.[size] ?? defaultSizeTokens[size];
  const paddingY = PADDING_Y_BY_SIZE[size];
  const lineHeightVar = `var(--prismui-line-height-${size})`;

  const vars: Record<string, string> = {
    // Size dimensions consumed by CSS module (component-local · NOT system vars).
    '--input-padding-x':   sizeTokens.paddingX,
    '--input-padding-y':   paddingY,
    '--input-font-size':   sizeTokens.fontSize,
    '--input-line-height': lineHeightVar,
    // T-4-B: SSR baseline · CSS formula consumes instance var written by render
    // Step 7 (`--input-min-rows`). Fallback `1` keeps the formula well-formed
    // when the component is used without the render-side inline-style write
    // (e.g. theme override smoke tests).
    '--input-min-height':
      `calc(${lineHeightVar} * 1em * var(--input-min-rows, 1)`
      + ` + ${paddingY} * 2`
      + ` + 2px)`,
    // Radius — resolved via Radius System. Fallback `'md'` is belt-and-suspenders;
    // payload.defaultProps.radius supplies it via the single-writer chain (A-2).
    '--input-radius':      resolveRadiusToken(props.radius ?? 'md'),
  };

  // Variant token layer injection — Textarea IV-1 analog of Input.
  // color is locked to 'neutral' in v1 (Textarea IV-2 analog).
  const variant = props.variant ?? 'outlined';
  const base = TEXTAREA_VARIANT_TO_BASE[variant];
  if (base !== null) {
    const v = variantColorResolver({ variant: base, color: 'neutral' });
    vars[VARIANT_CSS_VARS.bg]          = v.bg;
    vars[VARIANT_CSS_VARS.fg]          = v.fg;
    vars[VARIANT_CSS_VARS.hoverBg]     = v.hoverBg;
    vars[VARIANT_CSS_VARS.activeBg]    = v.activeBg;
    vars[VARIANT_CSS_VARS.border]      = v.border;
    vars[VARIANT_CSS_VARS.hoverBorder] = v.hoverBorder;
    vars[VARIANT_CSS_VARS.hoverShadow] = v.hoverShadow;
  }

  return vars;
};

// ── normalizeRowBounds — T-8 (Round 3 P1-1 two-step formula) ────────────────
//
// Public for testing visibility (Commit 5 — §15.3 P1-3 case). Not exported
// from the component barrel; lives on the module surface for unit tests.
//
// Rules (T-8 · 4 sub-clauses):
//   1. minRows: Number.isFinite(x) ? Math.max(1, Math.floor(x)) : 1
//      — non-finite (NaN / ±Infinity) and non-positive values coerced to 1
//      — non-integers floored
//   2. maxRows: same as minRows, EXCEPT `Infinity` is a legal special case
//   3. maxRows < minRows after normalization → DEV warn + coerce to minRows
//   4. All normalization completed in render Step 0; downstream measure / CSS /
//      data-attr only see normalized values.
function normalizeMinRow(x: number): number {
  return Number.isFinite(x) ? Math.max(1, Math.floor(x)) : 1;
}

function normalizeMaxRow(x: number): number {
  if (x === Infinity) return Infinity;
  return Number.isFinite(x) ? Math.max(1, Math.floor(x)) : 1;
}

export interface NormalizedRowBounds {
  minRows: number;
  /** May be `Infinity`. */
  maxRows: number;
}

export function normalizeRowBounds(rawMin: number, rawMax: number): NormalizedRowBounds {
  const minRows = normalizeMinRow(rawMin);
  let maxRows = normalizeMaxRow(rawMax);
  if (maxRows < minRows) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn(
        `[PrismUI Textarea] maxRows (${rawMax}) is less than minRows (${rawMin}); `
        + `coercing maxRows = ${minRows} to satisfy T-8 (devdocs/components/Textarea/design.md §13).`,
      );
    }
    maxRows = minRows;
  }
  return { minRows, maxRows };
}

// ── Factory wiring ──────────────────────────────────────────────────────────

const stylesNames = Object.keys(textareaSlots) as (keyof typeof textareaSlots)[];
const validatedClasses = ensureClasses(stylesNames, classes);

const textareaComponentPropKeys = [
  'size',
  'variant',
  'radius',
  'autosize',
  'minRows',
  'maxRows',
  'resize',
] as const;

/**
 * Textarea — multiline text input Control.
 *
 * Consumes Field via `useFieldControlProps` (id / aria-* / disabled / readOnly
 * / aria-describedby merging). Works both standalone and nested in `<Field>`.
 *
 * Structure: `<div.root>` wrapper + `<textarea.input>` (semantic target, ref target).
 *
 * **Commit 1**: types + StylesNames + factory setup + varsResolver + normalize-
 * RowBounds. Render body is a minimal pass-through stub — Commit 3 wires the
 * full Field hook chain, data-autosize emit, `--input-min-rows` inline var,
 * and resize-style strip (per design.md §二 Steps 0~7).
 */
export const Textarea = factory<TextareaOwnProps>(
  {
    displayName: 'Textarea',
    componentName: 'Textarea',
    defaultElement: 'div',
    slots: textareaSlots,
    componentPropKeys: textareaComponentPropKeys,
    // A-2 · single-writer defaults.
    defaultProps: {
      variant: 'outlined',
      size: 'md',
      radius: 'md',
    } satisfies Partial<TextareaOwnProps>,
    // Round 4 method A' — vars: false on variant + size keeps single-writer
    // ownership of `data-variant` / `data-size` (SR-7.1) while opting out of
    // the systems' built-in vars middleware (Textarea owns its own var
    // contract via the local `varsResolver` above · T-2).
    systems: [
      { name: 'variant', vars: false },
      { name: 'size',    vars: false },
      { name: 'state', options: { interactiveStrategy: 'control' } },
    ],
    styling: {
      structure: { stylesNames },
      resources: { classes: validatedClasses },
      logic: { varsResolver },
    },
  },
  ({ ref, componentProps, domProps, styles, systemDataAttrs }) => {
    // ── Step 0 — T-8 row-bound normalization (design.md §二 Step 0) ─────────
    // Every downstream consumer (measure / --input-min-rows / data-autosize
    // boundary tests) sees only normalized values; raw values never leak.
    const {
      autosize = false,
      minRows: rawMinRows = 1,
      maxRows: rawMaxRows = Infinity,
      resize: userResize,
      size = 'md',
    } = componentProps;
    const bounds = normalizeRowBounds(rawMinRows, rawMaxRows);

    // ── Step 1 — Merge Field context into <textarea> props ────────────────
    // FCP-2 priority enforced by the hook: Control > Field > defaults.
    // When Field is absent, this is a pass-through (no allocation).
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const mergedTextareaProps = useFieldControlProps(domProps as any);

    // ── Step 2 — Field-aware data-attrs overlay (A-6 single-writer) ───────
    // `systemDataAttrs` sees raw props only (factory-time); Field merge lives
    // inside render. `useFieldDataAttrs` is the first legitimate overlay
    // above the system base — spread AFTER systemDataAttrs (Input.tsx:222).
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const fieldAwareStateAttrs = useFieldDataAttrs(mergedTextareaProps as any, {
      interactiveStrategy: 'control',
    });

    // ── Step 3 — effective resize (T-5 · autosize hard-forces 'none') ─────
    const effectiveResize: TextareaResize = autosize
      ? 'none'
      : (userResize ?? 'vertical');

    // ── Step 4 — strip user inline style.resize (T-5 P0-2) ────────────────
    // `resize` is single-written by Step 3 via inline style on the textarea;
    // any user-supplied `style={{ resize: ... }}` would otherwise override
    // the component's effective value (especially the hard-forced 'none'
    // when autosize=true). Strip the key from user style BEFORE merging.
    //
    // Rationale: the `resize` PROP is the contract surface for this concern.
    // Users who want a specific resize behavior pass `resize="horizontal"`,
    // not `style={{ resize: 'horizontal' }}`.
    const {
      style: userStyleRaw,
      onChange: userOnChange,
      className: userClassName,
      ...restMergedProps
    } = mergedTextareaProps as React.TextareaHTMLAttributes<HTMLTextAreaElement>;
    const { resize: _strippedResize, ...userStyleSafe } =
      (userStyleRaw ?? {}) as React.CSSProperties;
    void _strippedResize;

    // ── Step 5 — autosize measure (dual-path closure · T-4-A) ─────────────
    //
    // Internal ref lets `useAutosizeMeasure` read/write the live DOM node.
    // The external `ref` (forwardRef payload) is merged below via a callback
    // ref so the consumer still receives the textarea element — neither
    // channel is lost.
    //
    // `value` lives on domProps (native HTML attribute, not a componentProp),
    // so we read it from `mergedTextareaProps` (post-Field merge). Pulling it
    // out here keeps Path 1 deps explicit.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const internalTextareaRef = React.useRef<HTMLTextAreaElement | null>(null);
    const controlledValue =
      (mergedTextareaProps as { value?: unknown }).value;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const measure = useAutosizeMeasure({
      ref: internalTextareaRef,
      autosize,
      minRows: bounds.minRows,
      maxRows: bounds.maxRows,
      size,
      value: controlledValue,
    });

    // Callback ref merging internal + external refs · React.ForwardedRef
    // accepts callback / object / null variants.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const mergedTextareaRef = React.useCallback(
      (el: HTMLTextAreaElement | null) => {
        internalTextareaRef.current = el;
        if (typeof ref === 'function') {
          ref(el);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current =
            el;
        }
      },
      [ref],
    );

    // ── Step 6 — local root data-attrs (SR-7.1 · component-local only) ────
    // `data-autosize` is a genuinely component-local attribute (not owned by
    // any upstream system). Emit ONLY when autosize is on; React omits
    // undefined / false-coerced values, but the explicit branch keeps the
    // DOM attribute absent rather than `data-autosize=""` when off.
    const rootDataAttrs: Record<string, string> = {};
    if (autosize) rootDataAttrs['data-autosize'] = 'true';

    // ── Step 7 — root inline --input-min-rows (T-4-B · Round 2 P1-1) ──────
    // SSR-safe baseline: CSS `min-height` formula in varsResolver reads
    // `var(--input-min-rows, 1)`. By writing the normalized minRows as an
    // inline var on root, the first paint (even pre-hydration) reflects
    // the user-supplied minRows, not a hardcoded 1.
    const rootSlotProps = styles.getRootProps();
    const rootStyle: React.CSSProperties & Record<string, string | number> = {
      ...(rootSlotProps.style as React.CSSProperties),
      '--input-min-rows': String(bounds.minRows),
    };

    // ── Inner slot class + style merge (mirrors Input.tsx:236-239) ────────
    const inputSlotStyles = styles.getStyles('input');
    const textareaClassName = [inputSlotStyles.className, userClassName]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        {...rootSlotProps}
        style={rootStyle}
        {...rootDataAttrs}
        {...systemDataAttrs}
        {...fieldAwareStateAttrs}
      >
        <textarea
          ref={mergedTextareaRef}
          {...(restMergedProps as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          onChange={chainHandlers(userOnChange, measure)}
          className={textareaClassName}
          style={{
            ...(inputSlotStyles.style as React.CSSProperties),
            ...userStyleSafe,
            // T-5: component-owned resize channel. Must be LAST to overpower
            // user style (which Step 4 already stripped, belt-and-suspenders).
            resize: effectiveResize,
          }}
        />
      </div>
    );
  },
);

(Textarea as React.FC).displayName = 'Textarea';
