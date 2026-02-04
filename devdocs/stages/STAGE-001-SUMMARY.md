# STAGE-001: Core System - Restructured Plan Summary

## Restructuring Rationale

The original plan had Phase 1 focusing on separate type and utility packages, which didn't align with the core architectural principle: **polymorphic components are the foundation of Mantine/MUI architecture**.

## New Structure

### **Phase 1: Polymorphic Foundation** (CORE)
**Goal:** Establish polymorphic component pattern with Box

**Why First?**
- Polymorphism is THE defining feature of Mantine/MUI
- Box is the base for all other components
- Must validate TypeScript polymorphic types work
- **No theme, no styleProps** - just pure polymorphism

**Deliverables:**
- Monorepo setup
- @prismui/core package
- Polymorphic type system
- Box component: `<Box component="button">Click</Box>`
- Tests validating polymorphism

**Success:** Can render `<Box component="a" href="/link">Link</Box>` with full TypeScript support

---

### **Phase 2: Theme System** (MOST COMPLEX & CORE)
**Goal:** Build complete theming infrastructure

**Why Second?**
- Theme system is the most complex part
- Requires deep understanding of React Context, CSS variables, SSR
- Foundation for all styling
- Must work perfectly before styleProps

**Deliverables:**
- @prismui/theme package
- Theme type definitions (ThemeConfig, ColorPalette, etc.)
- Default theme (MUI-inspired colors, Chinese-friendly fonts)
- createTheme() factory
- CSS variables generation
- PrismuiProvider, PrismuiThemeProvider
- @prismui/hooks (useTheme, useId)
- @prismui/nextjs (PrismuiAppProvider with SSR)
- Box updated to access theme

**Success:** Theme can be customized, switched at runtime, SSR works without flicker

---

### **Phase 3: Style Props System**
**Goal:** Add theme-aware shorthand styling

**Why Third?**
- Style props are a convenience layer on top of theme
- Simpler and more focused than theme system
- Makes components ergonomic

**Deliverables:**
- @prismui/styles package
- StyleProps types (SpacingProps, ColorProps, SizeProps)
- parseStyleProps() function
- Theme value resolution (`'primary.5'` → color, `'md'` → spacing)
- Utility functions (rem, em, rgba)
- Box updated with style props

**Success:** Can use `<Box p="md" bg="primary.5">Content</Box>`

---

### **Phase 4: Core Components** (Text, Button)
**Goal:** Build first real components using full system

**Why Fourth?**
- Now have polymorphism + theme + styleProps
- Text and Button validate the complete system
- Most commonly used components

**Deliverables:**
- Text component (size, weight, color, truncate)
- Button component (variants, sizes, loading, disabled, accessibility)
- Full test coverage
- Documentation

**Success:** Production-ready Text and Button components

---

## Key Differences from Original Plan

| Original | New | Reason |
|----------|-----|--------|
| Phase 1: Types + Styles packages | Phase 1: Polymorphic Box only | Polymorphism is the core pattern |
| Phase 2: Theme system | Phase 2: Theme system (expanded) | Same, but more comprehensive |
| Phase 3: Foundation components | Phase 3: Style Props System | Style props are simpler, should come before components |
| Phase 4: Layout components | Phase 4: Core components (Text, Button) | Validate full system first |

---

## Development Order

```
1. Polymorphic Box (no theme, no styleProps)
   ↓
2. Complete Theme System (the most complex part)
   ↓
3. Style Props System (convenience layer)
   ↓
4. Text & Button (validate everything works)
```

---

## Why This Order Makes Sense

1. **Polymorphism First** - It's the architectural foundation. Without it, we don't have Mantine/MUI's core pattern.

2. **Theme Second** - It's complex and touches everything. Better to get it right before adding more layers.

3. **Style Props Third** - It's a simpler, focused feature that builds on theme. Easier to add after theme is solid.

4. **Components Last** - Once we have polymorphism + theme + styleProps, building components is straightforward.

---

## Validation Points

**After Phase 1:**
```typescript
<Box component="button" onClick={handler}>Click</Box>
<Box component="a" href="/link">Link</Box>
```

**After Phase 2:**
```typescript
<PrismuiProvider theme={customTheme}>
  <Box>Uses theme</Box>
</PrismuiProvider>
```

**After Phase 3:**
```typescript
<Box p="md" bg="primary.5" c="white">
  Styled with theme-aware props
</Box>
```

**After Phase 4:**
```typescript
<Button variant="filled" size="lg" loading>
  Submit
</Button>
<Text size="xl" weight="bold" c="primary.7">
  Heading
</Text>
```

---

## Next Steps

Start with Phase 1.1: Setup @prismui/core package structure and implement polymorphic Box component.
