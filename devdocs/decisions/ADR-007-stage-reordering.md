# ADR-007: Stage Reordering — Runtime Kernel Completeness Before Presentation / 阶段重排——运行时内核完整性优先于表现层

**Status:** Accepted  
**Date:** 2026-03-08  
**Author:** PrismUI Core Team  
**Impact:** High — reorders development stages to prioritize runtime kernel completeness

**状态：** Accepted  
**日期：** 2026-03-08  
**作者：** PrismUI Core Team  
**影响：** High —— 重新排序开发阶段，优先完成运行时内核

---

## Context

## 背景（Context）

After completing STAGE-001 (Runtime Core) and STAGE-002 (Governance Layer), the original plan placed **Semantic Theme** as STAGE-003. However, analysis reveals a logical gap:

完成 STAGE-001（Runtime Core）和 STAGE-002（Governance Layer）后，原计划将 **Semantic Theme** 作为 STAGE-003。但分析后发现逻辑断层：

- STAGE-001 & 002 build the **pure runtime kernel** (Layer 0 + Layer 1) — framework-agnostic, zero DOM
- Semantic Theme belongs to the **presentation layer** (alongside Layer 3) — it involves tokens, CSS variables, React context
- Between them, the runtime's **module capabilities are incomplete** — only Page + Modal exist as built-in modules

- STAGE-001 和 002 构建了 **纯运行时内核**（Layer 0 + Layer 1）——与框架无关、零 DOM
- Semantic Theme 属于 **表现层**（与 Layer 3 并列）——涉及 tokens、CSS 变量、React context
- 在两者之间，runtime 的 **模块能力尚不完整** —— 仅有 Page + Modal 作为内建模块

The principle of **"infrastructure before consumers"** (Rule #14) demands that the runtime kernel be feature-complete before building the presentation layer that consumes it.

**"基础设施先于消费者"** 原则（Rule #14）要求运行时内核在构建消费它的表现层之前完成功能。

---

## Decision

## 决策（Decision）

Reorder stages to complete the **Runtime Kernel** (Layers 0-1) fully before the **Presentation Layer** (Theme + Rendering):

重新排序阶段，在表现层（Theme + Rendering）之前完成 **运行时内核**（Layers 0-1）：

### Old Order:

```
1. Runtime Core        ✅  (Layer 0)
2. Governance Layer    ✅  (Layer 1)
3. Semantic Theme          (Presentation)   ← too early
4. Interaction Modules     (Layer 0.5)
5. Form & Async Runtime    (Layer 0.5)
6. Page Orchestration      (Layer 0.5)
7. Interaction DSL         (Layer 0.5+)
8. DevTools & Automation   (Tooling)
```

### New Order:

```
1. Runtime Core        ✅  (Layer 0)
2. Governance Layer    ✅  (Layer 1)
3. Interaction Modules     (Layer 0.5)      ← runtime modules first
4. Lifecycle & Hooks       (Layer 0 ext.)   ← enrich module system
5. Semantic Theme          (Presentation)   ← now has full runtime to derive from
6. Interaction DSL         (Layer 0.5+)
7. DevTools & Automation   (Tooling)
```

### Key changes:

### 关键变更：

1. **Interaction Modules promoted to STAGE-003** — Drawer, Notification, Toast modules as pure `packages/core/` runtime modules
2. **Lifecycle & Hooks as STAGE-004** — module-level lifecycle events, state selectors, inter-module communication
3. **Semantic Theme deferred to STAGE-005** — by this point the full runtime exists, and Behavior Derivation (Layer 3 of theme) can properly integrate with Policy Engine + all interaction modules
4. **Form & Async Runtime merged into STAGE-004** or deferred — form state is a lifecycle/hooks concern
5. **Page Orchestration absorbed** — page lifecycle hooks fit naturally into STAGE-004

---

## Consequences

## 影响（Consequences）

### Positive

### 正面

- Runtime kernel is complete before any presentation code is written
- Semantic Theme's Behavior Derivation layer has the full runtime to integrate with
- Interaction Modules can be tested in pure Node.js without theme/rendering concerns
- Follows the established pattern: STAGE-001 built Core, STAGE-002 added Governance, STAGE-003 extends modules

### Negative

### 负面

- Semantic Theme is pushed back further — visual styling capabilities delayed
- Applications needing theme must wait longer

### Mitigation

### 缓解

- Theme is opt-in anyway (ADR-004: Layer 1 tokens work without Layer 2/3)
- MedXAI can use inline styles or external CSS while waiting for Theme
- The demo app already works without Theme

---

## References

## 参考资料（References）

- [RULES.md Rule #14](../RULES.md) — Infrastructure before consumers
- [ADR-002 Runtime Over Components](./DECISION-002-runtime-over-components.md)
- [ARCHITECTURE.md §3](../architecture/PRISMUI-ARCHITECTURE.md) — Four-Layer Architecture
