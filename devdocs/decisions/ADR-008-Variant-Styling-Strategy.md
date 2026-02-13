# ADR-008: Variant Styling Strategy

## Status

**Accepted** — 2026-02-11

## Context

Phase C 实现了 `getVariantClassName`，它通过 CSS Module 类名（如 `root--filled`）来区分 variant。但在研究 Mantine Button 的实际实现后发现，Mantine 的 Button **并不使用** variant 类名，而是完全通过 CSS 变量 + `varsResolver` 实现 variant 样式切换。

这引出了一个关键设计问题：**PrismUI 组件的 variant 样式应该用哪种机制？**

### 三种可选方案

#### 方案 A: CSS Module 类名 (`root--filled`)

```css
/* Button.module.css */
.root {
  /* base */
}
.root--filled {
  background: blue;
  color: white;
}
.root--outlined {
  background: transparent;
  border: 2px solid blue;
}
```

- ✅ 简单直观，CSS Module 天然隔离
- ❌ 颜色硬编码，无法通过 `color` prop 动态改变
- 适合：variant 之间有**结构性差异**（不同布局、动画、display 模式）

#### 方案 B: `data-variant` attribute

```css
.root[data-variant="filled"] {
  background: blue;
}
.root[data-variant="outlined"] {
  border: 2px solid blue;
}
```

- ✅ CSS 中可见 variant 语义，DevTools 可读性好
- ❌ 同样是硬编码颜色，attribute selector 特异性略高
- 适合：需要在 CSS 中区分 variant，但不需要动态颜色

#### 方案 C: CSS 变量 (`varsResolver`) — Mantine Button 的实际方式

```css
.root {
  background: var(--button-bg);
  border: var(--button-bd);
  color: var(--button-color);
}
```

```ts
const varsResolver = createVarsResolver<ButtonFactory>(
  (theme, { variant, color }) => {
    const colors = theme.variantColorResolver({ variant, color });
    return { root: { '--button-bg': colors.background, ... } };
  }
);
```

- ✅ 完全动态，`color` prop 可以改变任何 variant 的颜色
- ✅ 主题可覆盖（theme.vars）
- ❌ 需要 `variantColorResolver` 基础设施
- 适合：颜色可定制的组件（Button、Badge、Alert 等）

### Mantine 的实际做法

深入分析 Mantine Button 源码后发现：

| 机制                                   | Mantine 是否提供 | Button 是否使用 | 用途                                     |
| -------------------------------------- | ---------------- | --------------- | ---------------------------------------- |
| `getVariantClassName` (`root--filled`) | ✅ 通用能力      | ❌ 未使用       | 留给需要结构性 variant 差异的组件        |
| `data-variant` (Box 自动设置)          | ✅ Box 内置      | ❌ CSS 中未引用 | 留给需要 CSS attribute 选择器的场景      |
| `varsResolver` + CSS 变量              | ✅ 核心机制      | ✅ **唯一使用** | 通过 `variantColorResolver` 动态计算颜色 |

**关键发现**：Mantine Button 的 CSS 中**没有任何 variant 相关的类或 attribute 选择器**。所有 variant 差异完全通过 `varsResolver` 注入 CSS 变量实现。

## Decision

### PrismUI 采用混合策略，按场景选择 variant 机制

#### 规则 1: 颜色类 variant → CSS 变量 (方案 C)

当 variant 主要影响**颜色**（background、border、text color、hover 等）时，使用 `varsResolver` + `variantColorResolver`。

适用组件：Button、Badge、Alert、Chip、ActionIcon 等。

```ts
// 推荐写法
const varsResolver = createVarsResolver<ButtonFactory>(
  (theme, { variant, color }) => {
    const colors = theme.variantColorResolver({ variant, color, theme });
    return {
      root: {
        "--button-bg": colors.background,
        "--button-color": colors.color,
        "--button-bd": colors.border,
        "--button-hover": colors.hover,
      },
    };
  },
);
```

```css
/* Button.module.css — 不出现 variant 相关选择器 */
.root {
  background: var(--button-bg);
  color: var(--button-color);
  border: var(--button-bd);
}
```

#### 规则 2: 结构类 variant → CSS Module 类名 (方案 A)

当 variant 影响**布局结构**（display、flex-direction、position、animation 等）时，使用 CSS Module variant 类名。

适用场景：Card 的 `elevated` vs `flat`（shadow 差异）、Input 的 `filled` vs `outlined`（padding/border 结构差异）。

```css
/* Card.module.css */
.root {
  /* base */
}
.root--elevated {
  box-shadow: var(--card-shadow);
}
.root--flat {
  border: 1px solid var(--card-border-color);
}
```

#### 规则 3: `data-variant` 作为辅助，不作为主要样式载体

Box 会自动设置 `data-variant` attribute（Phase E Box 重构时实现）。这主要用于：

- DevTools 调试可读性
- 外部 CSS 选择器（用户自定义样式）
- 测试断言

**不推荐**在组件自身的 CSS Module 中使用 `[data-variant="..."]` 选择器。

#### 规则 4: `variantColorResolver` 作为 Phase F 前置依赖

在实现 Button 等颜色类组件之前，需要先实现：

```ts
interface VariantColorResolverInput {
  color: string;
  theme: PrismuiTheme;
  variant: string;
  gradient?: PrismuiGradient;
  autoContrast?: boolean;
}

interface VariantColorsResolver {
  (input: VariantColorResolverInput): VariantColorResolverResult;
}

interface VariantColorResolverResult {
  background: string;
  hover: string;
  hoverColor: string;
  color: string;
  border: string;
}
```

这将作为 Phase F 的前置工作项。

### 决策矩阵

| 组件   | variant 类型                     | 推荐机制                 | 原因                         |
| ------ | -------------------------------- | ------------------------ | ---------------------------- |
| Button | 颜色 (solid/soft/outlined/plain) | CSS 变量                 | 需要 `color` prop 动态化     |
| Badge  | 颜色 (solid/soft/outlined/plain) | CSS 变量                 | 同上                         |
| Alert  | 颜色 (solid/soft/outlined/plain) | CSS 变量                 | 同上                         |
| Card   | 结构 (elevated/outlined/flat)    | CSS Module 类            | shadow vs border 是结构差异  |
| Input  | 混合 (filled/outlined)           | CSS Module 类 + CSS 变量 | 结构(padding) + 颜色(border) |
| Paper  | 结构 (elevated/outlined)         | CSS Module 类            | 同 Card                      |

## Consequences

### Positive

- **动态性** — 颜色类 variant 完全可通过 `color` prop 和 theme 定制
- **清晰分离** — 结构差异用类名，颜色差异用变量，职责明确
- **一致性** — 与 Mantine 的实际做法对齐（而非表面 API）
- **可测试** — `data-variant` 提供调试和测试锚点

### Negative

- **需要 `variantColorResolver`** — Phase F 前需要额外基础设施
- **规则判断** — 开发者需要判断 variant 属于"颜色类"还是"结构类"

### Mitigations

- 在组件开发指南中明确列出判断标准
- `variantColorResolver` 提供合理默认值，减少每个组件的样板代码
- Phase C 已实现的 `getVariantClassName` 保留为通用能力，不删除

## Implementation Timeline

| 阶段           | 工作项                                                  | 状态      |
| -------------- | ------------------------------------------------------- | --------- |
| Phase C        | `getVariantClassName` 通用能力                          | ✅ 已完成 |
| Phase E        | Box 设置 `data-variant` / `data-size`                   | 待实现    |
| Phase F (前置) | `variantColorResolver` + `defaultVariantColorsResolver` | 待实现    |
| Phase F        | Button 等组件使用 CSS 变量方式                          | 待实现    |

## References

- Mantine Button: `@mantine/core/src/components/Button/Button.tsx` — 完全使用 `varsResolver`，无 variant 类名
- Mantine Button CSS: `Button.module.css` — 无 `[data-variant]` 或 `.root--*` 选择器
- Mantine Box: `Box.tsx` line 113 — `'data-variant': variant` 自动设置
- Mantine `getVariantClassName`: 通用能力，查找 `classes[selector--variant]`
- ADR-007: Component Factory & Styles API Architecture
- ADR-001: Mantine-MUI Hybrid Architecture
