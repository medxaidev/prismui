# ADR-002: Runtime Over Components / 运行时优先于组件

**Status:** Accepted  
**Date:** 2026-02-25  
**Author:** PrismUI Core Team  
**Impact:** Critical — redefines PrismUI's core identity from component library to interaction runtime

**状态：** Accepted  
**日期：** 2026-02-25  
**作者：** PrismUI Core Team  
**影响：** Critical —— 将 PrismUI 的核心身份从组件库重定义为交互运行时

---

## Context

## 背景（Context）

PrismUI 1.x spent 12 stages building components (Button, Dialog, Toast, Tabs, Layout, etc.) with 1674 tests. While successful as a component library, a key insight emerged at STAGE-005:

PrismUI 1.x 用 12 个 stage 构建了大量组件（Button、Dialog、Toast、Tabs、Layout 等），并拥有 1674 个测试。虽然作为组件库取得成功，但在 STAGE-005 出现了一个关键洞察：

> Components are not the competitive advantage. **Behavioral orchestration** is.

> 组件并不是竞争优势。**行为编排（Behavioral orchestration）** 才是。

The market is saturated with component libraries (MUI, Mantine, Ant Design, shadcn/ui). Competing on component count or visual polish is a losing strategy for a specialized project like PrismUI.

市场已经被组件库（MUI、Mantine、Ant Design、shadcn/ui）饱和。对于 PrismUI 这样的专用项目而言，在组件数量或视觉精致度上竞争是一个失败策略。

What MedXAI actually needs is:

MedXAI 真正需要的是：

- **Interaction control** — modal stacks, drawer flows, notification queues managed centrally
- **Workflow orchestration** — multi-step approval flows, page locking during procedures
- **Programmable UI** — automated systems controlling the dashboard
- **Audit compliance** — all interactions logged for medical regulatory requirements

- **交互控制** —— 统一管理 modal stack、drawer flow、notification queue
- **工作流编排** —— 多步骤审批流、手术过程中页面锁定
- **可编程 UI** —— 自动化系统控制仪表盘
- **审计合规** —— 为医疗监管要求记录所有交互

---

## Decision

## 决策（Decision）

PrismUI 2.0 is an **Interaction Runtime**, not a component library.

PrismUI 2.0 是一个 **Interaction Runtime（交互运行时）**，而不是组件库。

### What PrismUI does:

### PrismUI 做什么：

1. **Provider** — Runtime capabilities delivered via Provider + Context + Module injection
2. **Theme** — Semantic theme system with Token → Intent → Behavior Derivation
3. **Interaction** — Unified scheduling of Modal, Drawer, Notification, Form, Workflow

4. **Provider** —— 通过 Provider + Context + Module 注入交付运行时能力
5. **Theme** —— Token → Intent → Behavior Derivation 的语义主题系统
6. **Interaction** —— 统一调度 Modal、Drawer、Notification、Form、Workflow

### What PrismUI does NOT do:

### PrismUI 不做什么：

- ❌ Chase component coverage (not building 100+ components)
- ❌ Compete on visual templates or design presets
- ❌ Stack props on components for every possible configuration
- ❌ Provide a design system / Figma kit

- ❌ 追求组件覆盖率（不构建 100+ 组件）
- ❌ 在视觉模板或设计预设上竞争
- ❌ 为每一种配置在组件上堆叠 props
- ❌ 提供完整设计系统 / Figma 物料

### The three pillars:

### 三大支柱：

| Pillar               | Purpose                                                                            |
| -------------------- | ---------------------------------------------------------------------------------- |
| **Only Provider**    | System-level capabilities via injection, not component wrapping                    |
| **Only Theme**       | Semantic derivation system — tokens, intents, behavior rules                       |
| **Only Interaction** | Unified dispatch system — `ui.modal.open()`, `ui.confirm()`, `ui.workflow.start()` |

| 支柱                 | 目的                                                                           |
| -------------------- | ------------------------------------------------------------------------------ |
| **Only Provider**    | 通过注入提供系统级能力，而非通过组件 wrapper                                   |
| **Only Theme**       | 语义推导系统 —— tokens、intents、行为规则                                      |
| **Only Interaction** | 统一 dispatch 系统 —— `ui.modal.open()`、`ui.confirm()`、`ui.workflow.start()` |

---

## Consequences

## 影响（Consequences）

### Positive

### 正面

- Clear, differentiated positioning — no other library offers Interaction Runtime
- Dramatically smaller scope — fewer components to build and maintain
- Higher value per line of code — each module solves a hard orchestration problem
- Perfect alignment with MedXAI needs — workflow control, audit, compliance
- Enables programmable UI — automation, AI agents, remote control

- 清晰且差异化定位 —— 几乎没有其他库提供 Interaction Runtime
- 范围大幅缩小 —— 更少组件需要构建与维护
- 更高的单位代码价值 —— 每个模块解决一个困难的编排问题
- 与 MedXAI 需求完美对齐 —— 工作流控制、审计、合规
- 支持可编程 UI —— 自动化、AI agent、远程控制

### Negative

### 负面

- Applications still need visual components — must integrate with MUI, Mantine, or shadcn/ui for rendering
- Developers may initially expect a traditional component library
- Marketing challenge — "Interaction Runtime" is a new category to explain

- 应用仍需要视觉组件 —— 渲染层需与 MUI、Mantine 或 shadcn/ui 集成
- 开发者可能一开始期待传统组件库
- 市场表达挑战 —— “Interaction Runtime” 是一个需要解释的新类别

### Mitigation

### 缓解措施

- Layer 3 (Rendering) provides minimal renderers (ModalRenderer, etc.) that can wrap any component library
- Documentation will clearly explain the Runtime + external components pattern
- MedXAI serves as the proof-of-concept integration

- Layer 3（Rendering）提供最小 renderer（如 ModalRenderer），可包裹任意组件库
- 文档会清晰解释 Runtime + 外部组件的模式
- MedXAI 作为概念验证集成（PoC）

---

## References

## 参考资料（References）

- [ARCHITECTURE.md §1 Platform Definition](../architecture/PRISMUI-ARCHITECTURE.md)
- [ROADMAP.md](../ROADMAP.md)
- [DESIGN-PRINCIPLES.md §1 Runtime First](../architecture/PRISMUI-DESIGN-PRINCIPLES.md)
- PrismUI 1.x STAGE-005: the architectural pivot that inspired this decision
