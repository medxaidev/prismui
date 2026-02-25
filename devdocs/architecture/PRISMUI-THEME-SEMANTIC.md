# Semantic Theme System

> **Status:** Planned  
> **Version:** 2.0  
> **Last Updated:** 2026-02-25  
> **Implemented In:** STAGE-003  
> **Location:** `packages/core/src/theme/`

---

## Overview

The PrismUI 2.0 theme is **not just design tokens**. It is a **three-layer derivation system** that connects visual appearance to semantic meaning and ultimately to runtime behavior.

This is the key differentiator from Mantine and MUI:

| System          | Capability                                    |
| --------------- | --------------------------------------------- |
| **Mantine/MUI** | Token override (colors, spacing, typography)  |
| **PrismUI 2.0** | Token → Semantic Intent → Behavior Derivation |

---

## Three-Layer Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Layer 3: Behavior Derivation                           │
│                                                         │
│  if (intent === "destructive") {                        │
│    autoIncreaseContrast()                               │
│    autoEnableConfirm()                                  │
│    autoAdjustMotion()                                   │
│    autoLogAudit()                                       │
│  }                                                      │
│                                                         │
│  Connects theme intent to Runtime behavior.             │
├─────────────────────────────────────────────────────────┤
│  Layer 2: Semantic Intent                               │
│                                                         │
│  intent.primary    → brand emphasis                     │
│  intent.secondary  → supporting content                 │
│  intent.destructive → dangerous actions                 │
│  intent.safe       → confirmed / success                │
│  intent.warning    → caution / attention                │
│  intent.info       → informational                      │
│  intent.backgroundElevated → elevated surfaces          │
│                                                         │
│  Maps meaning to tokens. Components use intents.        │
├─────────────────────────────────────────────────────────┤
│  Layer 1: Token Layer                                   │
│                                                         │
│  color.primary = blue                                   │
│  color.error = red                                      │
│  spacing.md = 8px                                       │
│  radius.lg = 12px                                       │
│  typography.h1 = { fontSize: 32, fontWeight: 700 }      │
│  motion.standard = { duration: 300, easing: '...' }     │
│                                                         │
│  Raw design variables. Foundation of everything.        │
└─────────────────────────────────────────────────────────┘
```

---

## Layer 1: Token Layer

Base design variables. The raw material of the theme.

```typescript
interface TokenLayer {
  color: {
    primary: string;
    secondary: string;
    error: string;
    warning: string;
    info: string;
    success: string;
    neutral: string;
    // Color families
    families: Record<string, string[]>; // blue: [50, 100, ..., 900]
  };
  spacing: Record<string, number>; // xs: 4, sm: 8, md: 16, lg: 24, xl: 32
  radius: Record<string, number>; // sm: 4, md: 8, lg: 12, xl: 16
  typography: Record<string, TypographySpec>;
  shadow: Record<string, string>;
  motion: {
    duration: Record<string, number>; // short: 150, standard: 300, complex: 500
    easing: Record<string, string>;
  };
}
```

**Override API:**

```typescript
runtime.theme.overrideTokens({
  color: { primary: "indigo" },
  spacing: { md: 12 },
  radius: { lg: 16 },
});
```

---

## Layer 2: Semantic Intent

Maps **meaning** to tokens. Components MUST use intents, not raw tokens.

```typescript
interface SemanticIntent {
  // Color intents
  primary: IntentColorSpec;
  secondary: IntentColorSpec;
  destructive: IntentColorSpec;
  safe: IntentColorSpec;
  warning: IntentColorSpec;
  info: IntentColorSpec;

  // Surface intents
  backgroundDefault: string;
  backgroundPaper: string;
  backgroundElevated: string;

  // Text intents
  textPrimary: string;
  textSecondary: string;
  textDisabled: string;

  // Border intents
  divider: string;
  outline: string;
}

interface IntentColorSpec {
  main: string;
  light: string;
  dark: string;
  contrastText: string;
  background: string; // for soft/surface backgrounds
  border: string; // for outlined variants
  hoverBackground: string;
}
```

**Override API:**

```typescript
runtime.theme.overrideIntent("destructive", {
  main: tokens.color.error,
  background: "rgba(255, 0, 0, 0.08)",
  border: "rgba(255, 0, 0, 0.3)",
});
```

**Why semantic > direct tokens:**

| Direct Token             | Semantic Intent                                 |
| ------------------------ | ----------------------------------------------- |
| `Button color="red"`     | `Button intent="destructive"`                   |
| Only sets color          | Sets color + hover + contrast + behavior policy |
| No behavior implications | Triggers policy engine rules                    |
| Manual consistency       | Auto-derived consistency                        |

---

## Layer 3: Behavior Derivation

The revolutionary layer. **Intent automatically triggers runtime behaviors.**

```typescript
interface BehaviorRule {
  intent: string;
  conditions?: (state: RuntimeState) => boolean;
  derive: (intent: IntentColorSpec) => BehaviorEffects;
}

interface BehaviorEffects {
  requireConfirm?: boolean;
  logAudit?: boolean;
  increaseContrast?: boolean;
  adjustMotion?: "none" | "reduced" | "enhanced";
  enforceAccessibility?: boolean;
  notifyOnAction?: boolean;
}
```

**Example derivation rules:**

```typescript
// Destructive intent automatically enables confirmation + audit
runtime.theme.addBehaviorRule({
  intent: "destructive",
  derive: () => ({
    requireConfirm: true,
    logAudit: true,
    increaseContrast: true,
    adjustMotion: "reduced",
  }),
});

// Safe intent skips confirmation
runtime.theme.addBehaviorRule({
  intent: "safe",
  derive: () => ({
    requireConfirm: false,
    logAudit: false,
  }),
});
```

**This connects Theme to Runtime:**

```
Component uses intent="destructive"
    → Semantic Layer resolves colors/styles
    → Behavior Derivation checks rules
    → Policy Engine enforces requireConfirm
    → Audit Trail logs the action
```

---

## Three-Layer Override Summary

```typescript
// 1. Token Override (static layer)
runtime.theme.overrideTokens({
  color: { primary: "indigo", error: "#ff1744" },
});

// 2. Semantic Override (rules layer)
runtime.theme.overrideIntent("destructive", {
  main: "#ff1744",
  background: "rgba(255, 23, 68, 0.08)",
});

// 3. Behavior Override (runtime layer)
runtime.interaction.override("modal", {
  animation: "none",
  backdrop: "blur",
});
```

These three layers stacked form a **programmable UI behavior system**.

---

## Integration Points

### With Runtime (Layer 0)

- Behavior Derivation feeds rules into the Policy Engine
- Intent changes can trigger Runtime events

### With Governance (Layer 1)

- `requireConfirm` from Behavior Derivation → Policy Engine rule
- `logAudit` from Behavior Derivation → Audit Trail recording

### With Adapter (Layer 2)

- `useTheme()` hook provides resolved intent values
- Components receive semantic colors, not raw tokens

### With Rendering (Layer 3)

- Renderers consume resolved `IntentColorSpec` for styling
- CSS variables derived from semantic values, not tokens

---

## Why This Matters

Traditional component libraries stop at tokens:

```
Token → Component → Visual Output
```

PrismUI 2.0 extends to behavior:

```
Token → Semantic Intent → Behavior Derivation → Policy → Audit → Visual + Behavioral Output
```

This is the fusion of **Theme + Runtime** — the defining characteristic of PrismUI 2.0.
