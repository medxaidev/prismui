# STAGE-008: TextField — Material Design Floating Label Input

**Status**: ✅ Complete  
**Start Date**: 2026-02-21  
**Priority**: High  
**Dependencies**: STAGE-007 ✅

---

## Executive Summary

STAGE-008 introduces `TextField`, a Material Design–style input component with **floating labels**, inspired by [MUI TextField](https://mui.com/material-ui/react-text-field/) and [minimals.cc TextField](https://minimals.cc/components/mui/text-field). It is a Layer 3 component built on top of `InputBase` (Layer 2), sitting alongside the existing `Input` component.

### Key Distinction

| Component                 | Label Style                            | Variants                         | Use Case                        |
| ------------------------- | -------------------------------------- | -------------------------------- | ------------------------------- |
| **Input** (STAGE-007)     | Static label above input               | `outlined \| soft \| plain`      | Traditional forms, admin panels |
| **TextField** (STAGE-008) | Floating label (shrink on focus/value) | `outlined \| filled \| standard` | Material Design apps, modern UI |

### Visual Reference

```
outlined (default)           filled                      standard
┌─ Label ─────────┐         ┌─────────────────┐
│                  │         │ Label            │         Label
│ [input value]    │         │ [input value]    │         [input value]
└──────────────────┘         └──────────────────┘         ─────────────────
                                                          (underline only)
```

When focused or has value, the label "floats" up and shrinks:

- **outlined**: label moves to border notch, background behind label
- **filled**: label moves to top of filled area, smaller font
- **standard**: label moves above the underline, smaller font

---

## Architecture — Four-Layer Positioning

```
Layer 1 (Core)      Box, theme, styles-api, factory
                    ↓
Layer 2 (Base)      InputBase — DOM structure + CSS variable interface
                    ↓
Layer 3 (Semantic)  Input      — static label, outlined/soft/plain
                    TextField  — floating label, outlined/filled/standard  ← NEW
                    ↓
Application         <Input />      — simple forms
                    <TextField />  — Material Design forms (primary usage)
```

### Why Layer 3 (not a new Layer 2)?

TextField reuses `InputBase` for:

- Input element structure (wrapper → sections → native input)
- Focus/blur state management
- ARIA attributes
- Section slots (leftSection / rightSection)

TextField adds:

- Floating label with shrink animation (CSS transitions)
- Three MUI-aligned variants (outlined / filled / standard)
- Label notch for outlined variant (border gap around label)
- `::before` / `::after` pseudo-elements for underline animation (standard/filled)

---

## Design Decisions

### Variants

| Variant      | Border                   | Background  | Focus Effect                      | Reference    |
| ------------ | ------------------------ | ----------- | --------------------------------- | ------------ |
| **outlined** | 1px border, 2px on focus | transparent | Border thickens, label in notch   | MUI Outlined |
| **filled**   | none (bottom underline)  | gray fill   | Underline animates, label shrinks | MUI Filled   |
| **standard** | none (bottom underline)  | transparent | Underline animates, label shrinks | MUI Standard |

### Sizes

| Size   | Height | Font Size | Label Font (shrunk) |
| ------ | ------ | --------- | ------------------- |
| **sm** | 40px   | 14px      | 12px                |
| **md** | 56px   | 16px      | 12px                |

> Note: MUI TextField uses only sm/md. We follow the same pattern.
> The `sm` size maps to MUI's "small" prop, `md` is the default.

### Floating Label Behavior

```
State: Empty + Not Focused
┌──────────────────┐
│ Label             │  ← label centered vertically, full size
│                   │
└──────────────────┘

State: Focused OR Has Value
┌─ Label ─────────┐   ← label shrinks to 75%, moves up
│                  │
│ [input value]    │
└──────────────────┘
```

- **Shrink trigger**: `focused || hasValue || placeholder`
- **Shrink transform**: `scale(0.75)` + `translateY(...)` (variant-dependent)
- **Transition**: `200ms cubic-bezier(0, 0, 0.2, 1)` (MUI standard)
- **Force shrink**: `shrink` prop for manual control (datetime inputs, etc.)

### Color Tokens

```css
/* Outlined */
--tf-bd:
  var(--prismui-divider) → hover: var(--prismui-text-primary) →
    focus: var(--prismui-text-primary),
  2px --tf-label-color: var(--prismui-text-secondary) →
    focus: var(--prismui-text-primary) --tf-bg: transparent /* Filled */
    --tf-bg: var(--prismui-action-hover) → hover: darker
    --tf-underline: var(--prismui-divider) → focus: var(--prismui-text-primary),
  scaleX animation /* Standard */ --tf-bg: transparent
    --tf-underline: var(--prismui-divider) → focus: var(--prismui-text-primary),
  scaleX animation /* Error (all variants) */ --tf-bd /
    --tf-underline: var(--prismui-error-main)
    --tf-label-color: var(--prismui-error-main);
```

---

## TextFieldProps

```typescript
export type TextFieldVariant = "outlined" | "filled" | "standard";
export type TextFieldSize = "sm" | "md";

export interface TextFieldProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size"
> {
  /** Floating label text. */
  label?: string;

  /** Helper text displayed below the input. */
  helperText?: React.ReactNode;

  /** Error message or error state. */
  error?: React.ReactNode | boolean;

  /** Visual variant. @default 'outlined' */
  variant?: TextFieldVariant;

  /** Input size. @default 'md' */
  size?: TextFieldSize;

  /** Border radius (outlined only). @default 'sm' */
  radius?: PrismuiRadius;

  /** Force label shrink state. */
  shrink?: boolean;

  /** Content on the left side of the input. */
  leftSection?: React.ReactNode;

  /** Content on the right side of the input. */
  rightSection?: React.ReactNode;

  /** pointer-events on the right section. @default 'none' */
  rightSectionPointerEvents?: React.CSSProperties["pointerEvents"];

  /** If true, the input takes 100% width. @default true */
  fullWidth?: boolean;

  /** Whether the input is disabled. */
  disabled?: boolean;

  /** Whether the input is required (adds asterisk to label). */
  required?: boolean;

  /** Multiline mode (renders textarea). @default false */
  multiline?: boolean;

  /** Number of rows for multiline. */
  rows?: number;

  /** Min rows for multiline auto-resize. */
  minRows?: number;

  /** Max rows for multiline auto-resize. */
  maxRows?: number;

  /** Additional className. */
  className?: string;

  /** Additional style. */
  style?: React.CSSProperties;
}
```

### Naming: `helperText` vs `description`

- `Input` (STAGE-007) uses `description` (Mantine convention)
- `TextField` uses `helperText` (MUI convention)
- This intentional divergence signals the different design lineage

---

## CSS Architecture

### StylesNames

```
root        — outermost container (fieldset-like)
wrapper     — input row (border/bg container) — reuses InputBase wrapper
input       — native <input> element
label       — floating label element
helperText  — helper/error text below
section     — left/right section slots
```

### Key CSS Techniques (from MedXAI reference)

1. **Floating label**: `position: absolute`, `transform-origin: left top`, `transition: transform, color, max-width`
2. **Outlined notch**: label has `background-color: white` + `padding-inline: 4px` when shrunk, creating a "gap" in the border
3. **Underline animation** (filled/standard): `::before` for static underline, `::after` for animated focus underline with `transform: scaleX(0)` → `scaleX(1)`
4. **Hover thickening**: outlined `::before` border-width increases on hover

---

## DOM Structure

```html
<!-- TextField -->
<div
  class="root"
  data-variant="outlined"
  data-size="md"
  data-error
  data-disabled
>
  <label class="label" data-shrink>Label *</label>
  <div class="wrapper">
    <div class="section" data-position="left">...</div>
    <input class="input" />
    <div class="section" data-position="right">...</div>
  </div>
  <div class="helperText">Helper or error text</div>
</div>
```

> Note: Unlike `Input` which delegates wrapper layout to `InputWrapper` (from InputBase),
> `TextField` manages its own root layout because the floating label requires
> `position: relative` on root and `position: absolute` on label.

---

## Implementation Plan

### Phase A: TextField Component

1. `TextField.module.css` — all variants, sizes, floating label, underline animation
2. `TextField.tsx` — component implementation using `factory()` + `useProps()` + `useStyles()`
3. `index.ts` — barrel exports
4. Register in `components/index.ts`

### Phase B: Tests

1. `TextField.test.tsx` — rendering, variants, sizes, floating label, states, accessibility

### Phase C: Storybook

1. `TextField.stories.tsx` — all variants, sizes, states, sections, multiline

---

## File Structure

```
packages/core/src/components/
  TextField/
    TextField.tsx
    TextField.module.css
    TextField.test.tsx
    TextField.stories.tsx
    index.ts
```

---

## Success Metrics

### Technical

- [x] tsc --noEmit clean
- [x] 45 new tests passing (1515 total, zero regressions)
- [x] 12 Storybook stories

### Visual

- [x] Floating label animates smoothly (200ms cubic-bezier)
- [x] Outlined: label creates border notch (bg + padding trick)
- [x] Filled: gray background with ::after scaleX underline animation
- [x] Standard: underline-only with ::after scaleX animation
- [x] Error state: red border/underline + red label + red helperText
- [x] Disabled state: muted colors + not-allowed cursor + dotted underline

### Architectural

- [x] Self-contained component (manages own DOM, floating label, shrink state)
- [x] No duplication of focus/blur/ARIA logic (all in TextField.tsx)
- [x] Compatible with react-hook-form ({...register()} spread works)

---

## Future Extensions (Post-STAGE-008)

- **STAGE-009**: Select/Combobox visual refresh using TextField wrapper
- **Textarea**: `multiline` prop on TextField (auto-resize)
- **NumberInput**: TextField + step buttons
- **PasswordInput**: TextField + show/hide toggle
