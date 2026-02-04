# ADR-001: Mantine-MUI Hybrid Architecture

## Status

**Status:** Accepted  
**Date:** 2026-02-04  
**Deciders:** Project Lead

---

## Context

Prismui needs to establish its architectural foundation. Two major React UI libraries provide excellent patterns:

1. **Mantine** - Excellent architecture, polymorphic components, powerful theming
2. **MUI (Material-UI)** - Beautiful design, comprehensive styling system, Joy UI aesthetics

The question is: Should we follow one library exclusively, or combine the best of both?

### Constraints

- Must serve MedXAI project (Chinese medical application)
- Must be lightweight (not replicate everything)
- Must support Next.js App Router with SSR
- Must prioritize accessibility
- Must be maintainable long-term

---

## Decision

**We will adopt a hybrid approach:**

### From Mantine (Architecture & Core)

1. **Polymorphic component pattern** - `component` prop for flexible rendering
2. **Style props system** - Direct CSS-like props (p, m, bg, etc.)
3. **Theme structure** - Color palettes, spacing scales, design tokens
4. **Provider architecture** - Context-based theming
5. **Factory pattern** - Component creation utilities
6. **Hooks-first approach** - useTheme, useStyles, etc.

### From MUI (Design & Aesthetics)

1. **Visual design language** - Clean, modern, professional
2. **Component variants** - Filled, outlined, subtle patterns
3. **Color system organization** - Palette structure
4. **Joy UI inspiration** - Modern, lightweight aesthetic
5. **Elevation and shadows** - Depth and hierarchy

### Prismui-Specific

1. **MedXAI-first** - Build components as needed, not comprehensive library
2. **Modern-only** - No legacy browser support
3. **Chinese-friendly** - Typography and spacing for Chinese text
4. **Lightweight** - Minimal dependencies, tree-shakeable
5. **Provider naming** - PrismuiProvider (all-in-one), PrismuiThemeProvider (theme-only), PrismuiAppProvider (Next.js bridge)

---

## Consequences

### Positive

- **Best of both worlds** - Mantine's architecture + MUI's aesthetics
- **Proven patterns** - Both libraries are battle-tested
- **Flexibility** - Can adapt patterns as needed
- **Learning from leaders** - Leverage industry best practices
- **Maintainability** - Clear architectural principles

### Negative

- **Learning curve** - Need to understand both libraries
- **Potential confusion** - "Why not just use Mantine or MUI?"
- **Documentation burden** - Must explain our choices
- **Pattern conflicts** - May need to resolve differences

### Mitigations

- Document architectural decisions clearly (this ADR)
- Provide clear examples showing the hybrid approach
- Maintain consistency within Prismui
- Reference Mantine/MUI in code comments where patterns are borrowed

---

## Implementation Notes

### Provider Architecture (Decided)

Based on previous decision:

- **PrismuiProvider**: All-in-one root provider (theme + CSS vars + baseline + optional SSR registry)
- **PrismuiThemeProvider**: Theme-only provider (renamed from previous provider)
- **PrismuiAppProvider**: Next.js App Router bridge using `useServerInsertedHTML` to flush registry

Core remains framework-agnostic.

### Component Pattern Example

```typescript
// Mantine-inspired polymorphic pattern
<Button component="a" href="/link">
  Link Button
</Button>

// MUI-inspired variants
<Button variant="filled" color="primary">
  Filled Button
</Button>
```

### Theming Example

```typescript
// Mantine-inspired theme structure
const theme = {
  colors: {
    primary: ['#e3f2fd', ..., '#0d47a1'], // MUI-inspired palette
  },
  spacing: { xs: 8, sm: 12, md: 16, lg: 20, xl: 24 },
}
```

---

## References

- [Mantine Documentation](https://mantine.dev/)
- [MUI Documentation](https://mui.com/)
- [Joy UI](https://mui.com/joy-ui/)
- Prismui ARCHITECTURE.md
- Prismui MODULES.md

---

## Review Date

This decision should be reviewed after Stage 1 completion to validate the approach.
