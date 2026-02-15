# ADR-010: Unified Typography System

## Status

**Status:** Accepted
**Date:** 2026-02-16
**Deciders:** Development Team

## Context

The original STAGE-004 plan separated typography into three components:
- **Text** — generic text with size/color/truncate
- **Title** — semantic headings (h1-h6)
- **Anchor** — styled links

This mirrors Mantine's separation (Text + Title). However, MUI takes a unified approach with a single `Typography` component that handles all text variants through a `variant` prop. Given PrismUI's MUI-inspired visual design, a unified approach is more appropriate because:

1. **Text and headings share the same styling concerns** — font-size, font-weight, line-height, color, truncation
2. **MUI's typography variant system** (h1-h6, subtitle1/2, body1/2, caption, overline) is well-established and familiar
3. **Responsive heading sizes** (MUI Minimals pattern) require media queries that are best co-located in one CSS module
4. **Fewer components = simpler API** — users learn one component instead of two

## Decision

### Merge Text + Title into a single `Text` component

The `Text` component uses a `variant` prop (MUI pattern) to select typography styles, while the rendered HTML element is automatically determined by the variant (but overridable via `component` prop).

### Typography Variants

| Variant | HTML Element | Font Weight | Font Size (base) | Line Height | Responsive |
|---------|-------------|-------------|-------------------|-------------|------------|
| h1 | h1 | 800 | 2.5rem (40px) | 1.25 | ✅ 52→58→64px |
| h2 | h2 | 800 | 2rem (32px) | 1.33 | ✅ 40→44→48px |
| h3 | h3 | 700 | 1.5rem (24px) | 1.5 | ✅ 26→30→32px |
| h4 | h4 | 700 | 1.25rem (20px) | 1.5 | ✅ →24px |
| h5 | h5 | 700 | 1.125rem (18px) | 1.5 | ✅ →19px |
| h6 | h6 | 600 | 1.0625rem (17px) | 1.56 | ✅ →18px |
| subtitle1 | p | 600 | 1rem (16px) | 1.5 | ❌ |
| subtitle2 | p | 600 | 0.875rem (14px) | 1.57 | ❌ |
| body1 | p | 400 | 1rem (16px) | 1.5 | ❌ |
| body2 | p | 400 | 0.875rem (14px) | 1.57 | ❌ |
| caption | span | 400 | 0.75rem (12px) | 1.5 | ❌ |
| overline | span | 700 | 0.75rem (12px) | 1.5 | ❌ |

### Responsive Breakpoints (headings only)

Following MUI Minimals pattern:
- **sm** (600px): First responsive step
- **md** (900px): Second responsive step
- **lg** (1200px): Third responsive step

### Color Support

The `color` prop supports:
- Semantic colors: `'primary'`, `'secondary'`, `'error'`, etc. → `var(--prismui-{color}-main)`
- Palette tokens: `'text.primary'`, `'text.secondary'`, `'text.disabled'`
- CSS passthrough: `'#ff0000'`, `'rgb(255,0,0)'`

### API Design

```typescript
export type TextVariant =
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  | 'subtitle1' | 'subtitle2'
  | 'body1' | 'body2'
  | 'caption' | 'overline';

export interface TextProps extends BoxProps, StylesApiProps<TextFactory>,
  ElementProps<'p', 'color'> {
  variant?: TextVariant;                          // @default 'body1'
  color?: string;                                 // theme color or CSS
  align?: React.CSSProperties['textAlign'];
  truncate?: boolean | 'end' | 'start';
  lineClamp?: number;
  inline?: boolean;                               // line-height: 1
  inherit?: boolean;                              // inherit parent font
  gutterBottom?: boolean;                         // margin-bottom: 0.35em
  noWrap?: boolean;                               // alias for truncate='end'
  textTransform?: React.CSSProperties['textTransform'];
  gradient?: { from: string; to: string; deg?: number };
  span?: boolean;                                 // shorthand for component="span"
}
```

### Element Mapping

The component automatically selects the HTML element based on variant:
- `h1`-`h6` → `<h1>`-`<h6>`
- `subtitle1`, `subtitle2`, `body1`, `body2` → `<p>`
- `caption`, `overline` → `<span>`

This can be overridden with the `component` prop (polymorphic).

## Consequences

### Positive
- Single component for all typography needs
- Familiar MUI-like API for developers
- Responsive heading sizes built-in
- Consistent with PrismUI's MUI-inspired visual design
- Fewer files to maintain

### Negative
- Diverges from Mantine's Text/Title separation
- CSS module is larger due to responsive media queries
- `variant` prop serves double duty (typography style + visual variant)

### Migration from Original Plan
- **Text + Title → Text** (merged)
- **Anchor** remains separate (extends Text, adds link-specific behavior)
- STAGE-004 Phase A reduced from 3 sessions to 2 sessions (A1: Text, A2: Anchor)

## References

- MUI Typography: https://mui.com/material-ui/react-typography/
- MUI Minimals Typography: https://minimals.cc/components/foundation/typography
- Mantine Text: `@mantine/core/src/components/Text`
- Mantine Title: `@mantine/core/src/components/Title`
