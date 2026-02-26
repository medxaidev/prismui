# ADR-004: Semantic Theme System / 语义主题系统

**Status:** Accepted  
**Date:** 2026-02-25  
**Author:** PrismUI Core Team  
**Impact:** High — redefines theme from token override to three-layer derivation system

**状态：** Accepted  
**日期：** 2026-02-25  
**作者：** PrismUI Core Team  
**影响：** High —— 将主题从“token 覆盖”重定义为“三层推导系统”

---

## Context

## 背景（Context）

PrismUI 1.x had a comprehensive theme system (color families, semantic palette, shade resolver, CSS variables, variant color resolver) — but it was fundamentally a **token override system**. Components referenced tokens directly or through a variant resolver.

PrismUI 1.x 拥有较完整的主题系统（颜色家族、语义调色板、shade resolver、CSS variables、variant color resolver），但本质上仍是 **token 覆盖系统**。组件要么直接引用 tokens，要么通过 variant resolver 引用。

MUI and Mantine follow the same pattern: theme = tokens + component overrides.

MUI 与 Mantine 也遵循同样模式：theme = tokens + component overrides。

This approach has limitations:

该方式存在局限：

- **No behavior implications** — changing a color has no effect on interaction rules
- **No semantic meaning** — `color="red"` doesn't tell the system this is a dangerous action
- **Manual consistency** — developers must manually apply audit logging, confirmation prompts, etc.
- **No derivation** — tokens don't auto-derive behavior, accessibility, or motion adjustments

- **没有行为含义** —— 改变颜色不会影响交互规则
- **缺少语义表达** —— `color="red"` 无法告诉系统该动作是否危险
- **一致性依赖人工** —— 审计、确认弹窗等需要开发者手动接入
- **缺少推导** —— tokens 不会自动推导行为、可访问性或动效调整

---

## Decision

## 决策（Decision）

PrismUI 2.0 implements a **three-layer theme derivation system**:

PrismUI 2.0 实现一个 **三层主题推导系统**：

### Layer 1: Token Layer (Base Variables)

Raw design variables — colors, spacing, typography, radius, shadow, motion.

### 第 1 层：Token Layer（基础变量）

原始设计变量 —— 颜色、间距、排版、圆角、阴影、动效。

```typescript
runtime.theme.overrideTokens({
  color: { primary: "indigo" },
  spacing: { md: 12 },
});
```

### Layer 2: Semantic Intent Layer (Meaning)

Maps meaning to tokens. Components use intents, **never raw tokens**.

### 第 2 层：Semantic Intent Layer（语义）

将含义映射到 tokens。组件使用 intents，**绝不直接使用原始 tokens**。

```typescript
// Component uses intent, not color
<Button intent="destructive">Delete</Button>

// Intent resolves to: main, light, dark, contrastText, background, border, hover
```

### Layer 3: Behavior Derivation Layer (Runtime Fusion)

Intent automatically triggers runtime behaviors via derivation rules.

### 第 3 层：Behavior Derivation Layer（运行时融合）

intent 通过推导规则自动触发运行时行为。

```typescript
runtime.theme.addBehaviorRule({
  intent: "destructive",
  derive: () => ({
    requireConfirm: true,
    logAudit: true,
    increaseContrast: true,
  }),
});
```

### The key insight:

### 关键洞察：

```
Token → Component → Visual Output                    (Mantine / MUI)
Token → Semantic Intent → Behavior → Visual + Policy  (PrismUI 2.0)
```

PrismUI 通过“语义 → 行为”的链路，将主题系统与治理/审计等运行时能力融合。

---

## Consequences

## 影响（Consequences）

### Positive

### 正面

- Components declare **meaning** (`intent="destructive"`), not appearance (`color="red"`)
- Behavior rules auto-apply: destructive actions get confirmation prompts without explicit coding
- Theme changes propagate to behavior: changing the "destructive" intent also changes its policies
- Accessibility improvements auto-derive from intent (e.g., increased contrast for warnings)
- Audit requirements are met by architecture, not by developer discipline

- 组件声明 **含义**（`intent="destructive"`），而不是外观（`color="red"`）
- 行为规则可自动应用：破坏性操作无需显式编码即可获得确认提示
- 主题变化会传播到行为：修改 destructive intent 将同步影响其策略
- 可访问性可从 intent 自动推导（例如 warning 自动提高对比度）
- 审计要求由架构保证，而不是依赖开发者自觉

### Negative

### 负面

- More complex than simple token override — three layers to understand
- Behavior Derivation is a novel concept — no prior art in existing UI libraries
- Initial development cost for the derivation engine
- Components must be refactored from `color` prop to `intent` prop

- 比简单 token 覆盖更复杂 —— 需要理解三层
- 行为推导是新概念 —— 现有 UI 库几乎没有先例
- 推导引擎存在初始开发成本
- 组件需要从 `color` prop 重构为 `intent` prop

### Mitigation

### 缓解措施

- Layer 1 (tokens) works exactly like traditional themes — progressive adoption
- Layer 2 (intents) has sensible defaults — developers can start with `intent="primary"` without behavior rules
- Layer 3 (derivation) is opt-in — applications that don't need it can skip it entirely

- 第 1 层（tokens）保持传统主题的使用方式 —— 支持渐进采用
- 第 2 层（intents）提供合理默认值 —— 可从 `intent="primary"` 起步
- 第 3 层（derivation）按需启用 —— 不需要的应用可以完全跳过

---

## References

## 参考资料（References）

- [THEME-SEMANTIC-SYSTEM.md](../architecture/PRISMUI-THEME-SEMANTIC.md)
- [ARCHITECTURE.md §2.4 Semantic Separation](../architecture/PRISMUI-ARCHITECTURE.md)
- [DESIGN-PRINCIPLES.md §4 Semantic Over Direct](../architecture/PRISMUI-DESIGN-PRINCIPLES.md)
- [GOVERNANCE-LAYER.md — Policy Engine](../architecture/PRISMUI-GOVERNANCE.md)
