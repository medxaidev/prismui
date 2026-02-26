# Semantic Theme System / 语义主题系统

> **Status:** Planned  
> **Version:** 2.0  
> **Last Updated:** 2026-02-25  
> **Implemented In:** STAGE-003  
> **Location:** `packages/core/src/theme/`

> **状态：** Planned  
> **版本：** 2.0  
> **最后更新：** 2026-02-25  
> **实现于：** STAGE-003  
> **位置：** `packages/core/src/theme/`

---

## Overview

The PrismUI 2.0 theme is **not just design tokens**. It is a **three-layer derivation system** that connects visual appearance to semantic meaning and ultimately to runtime behavior.

## 概览

PrismUI 2.0 的主题 **不只是设计 tokens**。它是一个 **三层推导系统**，将视觉表现连接到语义含义，并最终连接到运行时行为。

This is the key differentiator from Mantine and MUI:

这是 PrismUI 与 Mantine、MUI 的关键差异点：

| System          | Capability                                    |
| --------------- | --------------------------------------------- |
| **Mantine/MUI** | Token override (colors, spacing, typography)  |
| **PrismUI 2.0** | Token → Semantic Intent → Behavior Derivation |

| 系统            | 能力                           |
| --------------- | ------------------------------ |
| **Mantine/MUI** | Token 覆盖（颜色、间距、排版） |
| **PrismUI 2.0** | Token → 语义 Intent → 行为推导 |

---

## Three-Layer Architecture

## 三层架构

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

## 第 1 层：Token Layer（Token 层）

Base design variables. The raw material of the theme.

基础设计变量。主题系统的原材料。

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

**覆盖 API：**

```typescript
runtime.theme.overrideTokens({
  color: { primary: "indigo" },
  spacing: { md: 12 },
  radius: { lg: 16 },
});
```

---

## Layer 2: Semantic Intent

## 第 2 层：Semantic Intent（语义 Intent）

Maps **meaning** to tokens. Components MUST use intents, not raw tokens.

将 **含义（meaning）** 映射到 tokens。组件必须使用 intents，而不是直接使用原始 tokens。

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

**覆盖 API：**

```typescript
runtime.theme.overrideIntent("destructive", {
  main: tokens.color.error,
  background: "rgba(255, 0, 0, 0.08)",
  border: "rgba(255, 0, 0, 0.3)",
});
```

**Why semantic > direct tokens:**

**为什么语义优于直接 tokens：**

| Direct Token             | Semantic Intent                                 |
| ------------------------ | ----------------------------------------------- |
| `Button color="red"`     | `Button intent="destructive"`                   |
| Only sets color          | Sets color + hover + contrast + behavior policy |
| No behavior implications | Triggers policy engine rules                    |
| Manual consistency       | Auto-derived consistency                        |

| 直接 Token           | 语义 Intent                          |
| -------------------- | ------------------------------------ |
| `Button color="red"` | `Button intent="destructive"`        |
| 只设置颜色           | 设置颜色 + hover + 对比度 + 行为策略 |
| 不包含行为含义       | 触发策略引擎规则                     |
| 需要手工保持一致     | 自动推导一致性                       |

---

## Layer 3: Behavior Derivation

## 第 3 层：Behavior Derivation（行为推导）

The revolutionary layer. **Intent automatically triggers runtime behaviors.**

革命性的一层。**Intent 会自动触发运行时行为。**

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

**示例推导规则：**

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

**它把 Theme 与 Runtime 连接起来：**

```
Component uses intent="destructive"
    → Semantic Layer resolves colors/styles
    → Behavior Derivation checks rules
    → Policy Engine enforces requireConfirm
    → Audit Trail logs the action
```

---

## Three-Layer Override Summary

## 三层覆盖总结

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

这三层叠加构成一个 **可编程的 UI 行为系统**。

---

## Integration Points

## 集成点

### With Runtime (Layer 0)

### 与 Runtime（Layer 0）集成

- Behavior Derivation feeds rules into the Policy Engine
- Intent changes can trigger Runtime events

- 行为推导将规则注入 Policy Engine
- intent 变化可以触发 Runtime 事件

### With Governance (Layer 1)

### 与 Governance（Layer 1）集成

- `requireConfirm` from Behavior Derivation → Policy Engine rule
- `logAudit` from Behavior Derivation → Audit Trail recording

- Behavior Derivation 的 `requireConfirm` → Policy Engine 规则
- Behavior Derivation 的 `logAudit` → Audit Trail 记录

### With Adapter (Layer 2)

### 与 Adapter（Layer 2）集成

- `useTheme()` hook provides resolved intent values
- Components receive semantic colors, not raw tokens

- `useTheme()` hook 提供解析后的 intent 值
- 组件接收语义颜色，而不是原始 tokens

### With Rendering (Layer 3)

### 与 Rendering（Layer 3）集成

- Renderers consume resolved `IntentColorSpec` for styling
- CSS variables derived from semantic values, not tokens

- Renderers 消费解析后的 `IntentColorSpec` 用于 styling
- CSS variables 从语义值推导，而不是 tokens

---

## Why This Matters

## 为什么这很重要

Traditional component libraries stop at tokens:

传统组件库止步于 tokens：

```
Token → Component → Visual Output
```

PrismUI 2.0 extends to behavior:

PrismUI 2.0 扩展到了行为层面：

```
Token → Semantic Intent → Behavior Derivation → Policy → Audit → Visual + Behavioral Output
```

This is the fusion of **Theme + Runtime** — the defining characteristic of PrismUI 2.0.

这就是 **Theme + Runtime** 的融合 —— PrismUI 2.0 的定义性特征。
