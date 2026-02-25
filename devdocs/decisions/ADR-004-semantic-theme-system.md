# ADR-004: Semantic Theme System

**Status:** Accepted  
**Date:** 2026-02-25  
**Author:** PrismUI Core Team  
**Impact:** High — redefines theme from token override to three-layer derivation system

---

## Context

PrismUI 1.x had a comprehensive theme system (color families, semantic palette, shade resolver, CSS variables, variant color resolver) — but it was fundamentally a **token override system**. Components referenced tokens directly or through a variant resolver.

MUI and Mantine follow the same pattern: theme = tokens + component overrides.

This approach has limitations:
- **No behavior implications** — changing a color has no effect on interaction rules
- **No semantic meaning** — `color="red"` doesn't tell the system this is a dangerous action
- **Manual consistency** — developers must manually apply audit logging, confirmation prompts, etc.
- **No derivation** — tokens don't auto-derive behavior, accessibility, or motion adjustments

---

## Decision

PrismUI 2.0 implements a **three-layer theme derivation system**:

### Layer 1: Token Layer (Base Variables)
Raw design variables — colors, spacing, typography, radius, shadow, motion.

```typescript
runtime.theme.overrideTokens({
  color: { primary: 'indigo' },
  spacing: { md: 12 },
});
```

### Layer 2: Semantic Intent Layer (Meaning)
Maps meaning to tokens. Components use intents, **never raw tokens**.

```typescript
// Component uses intent, not color
<Button intent="destructive">Delete</Button>

// Intent resolves to: main, light, dark, contrastText, background, border, hover
```

### Layer 3: Behavior Derivation Layer (Runtime Fusion)
Intent automatically triggers runtime behaviors via derivation rules.

```typescript
runtime.theme.addBehaviorRule({
  intent: 'destructive',
  derive: () => ({
    requireConfirm: true,
    logAudit: true,
    increaseContrast: true,
  }),
});
```

### The key insight:

```
Token → Component → Visual Output                    (Mantine / MUI)
Token → Semantic Intent → Behavior → Visual + Policy  (PrismUI 2.0)
```

---

## Consequences

### Positive
- Components declare **meaning** (`intent="destructive"`), not appearance (`color="red"`)
- Behavior rules auto-apply: destructive actions get confirmation prompts without explicit coding
- Theme changes propagate to behavior: changing the "destructive" intent also changes its policies
- Accessibility improvements auto-derive from intent (e.g., increased contrast for warnings)
- Audit requirements are met by architecture, not by developer discipline

### Negative
- More complex than simple token override — three layers to understand
- Behavior Derivation is a novel concept — no prior art in existing UI libraries
- Initial development cost for the derivation engine
- Components must be refactored from `color` prop to `intent` prop

### Mitigation
- Layer 1 (tokens) works exactly like traditional themes — progressive adoption
- Layer 2 (intents) has sensible defaults — developers can start with `intent="primary"` without behavior rules
- Layer 3 (derivation) is opt-in — applications that don't need it can skip it entirely

---

## References

- [THEME-SEMANTIC-SYSTEM.md](../architecture/PRISMUI-THEME-SEMANTIC.md)
- [ARCHITECTURE.md §2.4 Semantic Separation](../architecture/PRISMUI-ARCHITECTURE.md)
- [DESIGN-PRINCIPLES.md §4 Semantic Over Direct](../architecture/PRISMUI-DESIGN-PRINCIPLES.md)
- [GOVERNANCE-LAYER.md — Policy Engine](../architecture/PRISMUI-GOVERNANCE.md)
