# STAGE-002: Component Factory & Styles API

**Status:** Planned  
**Start Date:** TBD  
**Prerequisite:** Stage-1 complete (Provider, Theme, SystemProps, Box)  
**Complexity:** High  
**Risk:** Medium  
**Estimated Duration:** 9-11 days

---

## 1. Stage Goal

Establish the **component factory infrastructure** — the core system that all PrismUI components are built upon. This includes the factory pattern, styling API, CSS Modules integration, theme-level component customization, and the first batch of validation components.

**This stage is foundational and must be completed in full before any component work beyond this stage.**

---

## 2. Why This Stage Exists

Stage-1 delivered the **system boundary** (Provider, Theme, SystemProps, Box). But Box alone is not enough to build real components. Every component in Mantine follows a consistent creation pattern:

```
factory/polymorphicFactory → useProps → useStyles → CSS Modules → Box
```

Without this infrastructure, each component would reinvent its own:

- Props merging logic
- Style resolution logic
- Theme integration logic
- CSS class generation logic

This is unacceptable. **The factory system is the component assembly line.**

---

## 3. Key Concepts (Must Understand Before Implementation)

以下概念是 Stage-2 的核心知识前提。实现前必须理解每个概念的职责边界。

### 3.1 FactoryPayload — 组件元数据类型

每个组件通过 `FactoryPayload` 在**类型层面**声明自己的能力：

```typescript
// 非多态组件的元数据
interface FactoryPayload {
  props: Record<string, any>; // 组件 props 类型
  ref: any; // ref 类型
  stylesNames: string; // 可样式化的部件名 (如 'root' | 'inner' | 'label')
  vars: Record<string, string>; // 组件级 CSS 变量 (如 { root: '--button-height' | ... })
  variant: string; // 变体名 (如 'filled' | 'outline' | ...)
  ctx?: Record<string, any>; // 样式上下文 (可选)
  staticComponents?: Record<string, any>; // 静态子组件 (如 Button.Group)
  compound?: boolean; // 是否为复合子组件 (见 §3.8)
}

// 多态组件额外声明默认元素和 ref
interface PolymorphicFactoryPayload extends FactoryPayload {
  defaultComponent: string; // 默认 HTML 元素 (如 'button')
  defaultRef: any; // 默认 ref 类型 (如 HTMLButtonElement)
}
```

**为什么重要**: 这个类型驱动了整个工厂系统的类型推导 — `useStyles` 的 selector 自动补全、`classNames` prop 的 key 约束、`vars` prop 的变量名约束，全部来自 FactoryPayload。

### 3.2 factory() / polymorphicFactory() — 组件创建函数

包装 `forwardRef`，附加静态属性：

- `.extend()` — 返回 theme 级定制配置（供 `createTheme({ components: { Button: Button.extend({...}) } })` 使用）
- `.withProps()` — 创建固定 props 的变体组件（如 `const PrimaryButton = Button.withProps({ variant: 'filled' })`）
- `.classes` — 暴露 CSS Module 类名对象（供外部 CSS 选择器使用）

**非多态 vs 多态**: `factory()` 用于固定元素的组件（如 Paper 始终是 `<div>`）；`polymorphicFactory()` 用于可变元素的组件（如 Button 可以是 `<button>` 或 `<a>`）。

### 3.3 useProps() — 默认 Props 合并

三层合并，优先级递增：

```
组件内部 defaultProps  <  theme.components[name].defaultProps  <  用户传入 props
```

**为什么重要**: 允许用户在 theme 级别为所有 Button 设置默认 `variant='filled'`，而无需每个 Button 都写。

### 3.4 useStyles() — 多来源样式编排

这是 Stage-2 **最复杂**的部分。它接收多个样式来源，返回 `getStyles(selector)` 函数。

每次调用 `getStyles('root')` 时，合并以下来源：

**className 合并（8 个来源，通过 `cx()` 合并）:**

| 优先级 | 来源                   | 示例                                       |
| ------ | ---------------------- | ------------------------------------------ |
| 1      | CSS Module class       | `Button_root_x7k2a`（构建时生成）          |
| 2      | Static class           | `prismui-Button-root`（可预测的选择器）    |
| 3      | Variant class          | `Button_root--filled`（变体样式）          |
| 4      | Theme classNames       | `theme.components.Button.classNames.root`  |
| 5      | User `classNames` prop | `<Button classNames={{ root: 'my-btn' }}>` |
| 6      | Options classNames     | `getStyles('root', { classNames: {...} })` |
| 7      | Global classes         | `prismui-focus-auto`（焦点环等）           |
| 8      | User `className` prop  | `<Button className="extra">`（仅 root）    |

**style 合并（6 个来源，展开为 CSSProperties）:**

| 优先级 | 来源                | 示例                                                      |
| ------ | ------------------- | --------------------------------------------------------- |
| 1      | Theme styles        | `theme.components.Button.styles.root`                     |
| 2      | User `styles` prop  | `<Button styles={{ root: { color: 'red' } }}>`            |
| 3      | Options styles      | `getStyles('root', { styles: {...} })`                    |
| 4      | varsResolver output | `{ '--button-height': '36px', '--button-bg': '#228be6' }` |
| 5      | User `style` prop   | `<Button style={{ margin: 8 }}`（仅 root）                |
| 6      | Options style       | `getStyles('root', { style: {...} })`                     |

### 3.5 CSS Modules — 静态基础样式

每个组件有一个 `.module.css` 文件，包含**不依赖 props 的基础样式**：

```css
/* ButtonBase.module.css */
.root {
  background-color: transparent;
  cursor: pointer;
  border: 0;
  padding: 0;
  appearance: none;
  font-size: var(--prismui-font-size-md);
  text-align: left;
  text-decoration: none;
  color: inherit;
}
```

构建时 Vite 将 `.root` 编译为唯一类名（如 `ButtonBase_root_x7k2a`），通过 `import classes from './ButtonBase.module.css'` 获取映射。

**与 `insertCssOnce` 的关系**: CSS Modules 处理静态组件样式；`insertCssOnce` 处理动态样式（SystemProps 响应式类、theme CSS 变量）。两者共存，互不冲突。

### 3.6 createVarsResolver() — 组件级 CSS 变量

将组件 props 转换为 CSS 变量，注入到组件根元素的 `style` 中：

```typescript
const varsResolver = createVarsResolver<ButtonFactory>(
  (theme, { radius, color, size }) => ({
    root: {
      "--button-height": getSize(size, "button-height"),
      "--button-radius": getRadius(radius),
      "--button-bg": theme.colors[color][theme.primaryShade.light],
    },
  }),
);
```

**为什么不用 CSS Modules**: 这些值依赖 props（`size`、`color`），无法在构建时确定。

### 3.7 `unstyled` Prop — 无样式模式

当 `unstyled={true}` 时，`useStyles` 跳过 CSS Module 类（`classes[selector]`），但保留用户传入的 `classNames`、`styles`、`className`。这允许用户完全自定义组件外观，同时保留行为和可访问性。

### 3.8 Compound Components — 复合子组件模式

`compound: true` 标记一个组件是**父组件的子部件**，而非独立组件。

**典型场景:**

```
Progress.Root          ← 父组件 (compound: false)
  ├── Progress.Section ← 复合子组件 (compound: true)
  └── Progress.Label   ← 复合子组件 (compound: true)

Tabs                   ← 父组件
  ├── Tabs.List        ← 复合子组件
  ├── Tabs.Tab         ← 复合子组件
  └── Tabs.Panel       ← 复合子组件
```

**compound 改变了什么:**

| 行为                         | 普通组件                  | Compound 子组件                                  |
| ---------------------------- | ------------------------- | ------------------------------------------------ |
| `classNames` / `styles` prop | 自己接收                  | 从父组件 Context 继承                            |
| `unstyled` prop              | 自己接收                  | 从父组件 Context 继承                            |
| `variant` prop               | 自己接收                  | 从父组件 Context 继承                            |
| Props 类型                   | `StylesApiProps<P>`       | `CompoundStylesApiProps<P>`                      |
| Theme 定制                   | `theme.components.Button` | 通过父组件定制（如 `theme.components.Progress`） |
| `useStyles` 来源             | 从自身 props 读取         | 从父组件 Context 读取                            |

**实现机制:**

1. 父组件创建 `StylesApiContext`，将 `classNames`、`styles`、`unstyled`、`variant` 等注入 Context
2. 子组件通过 `useStyles` 读取 Context 中的样式配置，而非自身 props
3. `CompoundStylesApiProps` 类型**不包含** `classNames`、`styles`、`unstyled`、`variant`，防止用户在子组件上直接传入

**为什么重要**: 没有 compound 模式，用户需要在每个子组件上重复传入 `classNames`/`styles`/`unstyled`，且无法在 theme 级别统一定制父组件的所有子部件。

---

## 4. Architecture Reference

### 4.1 Mantine's Component Creation Pipeline

```
Component Definition
    │
    ├── FactoryPayload type (props, ref, stylesNames, vars, variant)
    │
    ├── factory() / polymorphicFactory()
    │       └── forwardRef + .extend() + .withProps() + .classes
    │
    ├── useProps(componentName, defaultProps, props)
    │       └── merge: defaultProps < theme.components[name].defaultProps < user props
    │
    ├── useStyles({ name, classes, props, classNames, styles, vars, varsResolver })
    │       └── returns getStyles(selector) → { className, style }
    │           ├── getClassName: 8+ sources merged via cx()
    │           └── getStyle: 6+ sources merged into CSSProperties
    │
    ├── CSS Modules (Component.module.css)
    │       └── Static base styles, zero runtime
    │
    └── Box (renders final element with all merged props)
```

### 4.2 PrismUI Adaptation

PrismUI follows Mantine's pattern with these differences:

| Aspect                              | Mantine                | PrismUI                                 |
| ----------------------------------- | ---------------------- | --------------------------------------- |
| Class prefix                        | `mantine-`             | `prismui-`                              |
| CSS Modules                         | ✅                     | ✅ (same)                               |
| `sx` prop / CSS-in-JS transform     | Emotion optional       | Not used (simpler)                      |
| `transformedStyles` in getClassName | Yes                    | No (removed, no Emotion)                |
| Style engine for dynamic styles     | PostCSS + InlineStyles | `insertCssOnce` (already built)         |
| Theme context hook                  | `useMantineTheme`      | `usePrismuiTheme` / `usePrismuiContext` |
| Headless mode                       | Yes                    | Deferred (Stage-3+)                     |

---

## 5. File Structure

```
packages/core/src/core/types/polymorphic/   # [Stage-1 existing, Stage-2 refactored]
├── element-type.ts               # ElementType — 保留
├── jsx-props.ts                  # JSXProps<C> — 保留
├── merge-props.ts                # MergeProps<A,B> — 保留
├── polymorphic-ref.ts            # PolymorphicRef<C> — 保留
├── polymorphic-component-props.ts # PolymorphicComponentProps<C, Props> — 保留
├── create-polymorphic-component.ts # ⛔ 删除 (被 polymorphicFactory 替代)
└── index.ts                      # 移除 createPolymorphicComponent 导出

packages/core/src/core/factory/             # [Stage-2 新建]
├── factory.tsx                    # factory() + FactoryPayload + PrismuiComponent types
├── polymorphic-factory.tsx        # polymorphicFactory() + PolymorphicFactoryPayload
│                                  #   内部 import { ElementType, ... } from '../types/polymorphic'
├── create-factory.ts              # Factory<P> / PolymorphicFactory<P> type aliases
├── use-props.ts                   # useProps() hook + filterProps()
└── index.ts                       # barrel exports (re-export polymorphic types for convenience)

packages/core/src/core/styles-api/
├── styles-api.types.ts            # StylesApiProps, CompoundStylesApiProps, ClassNames, Styles
├── styles-api-context.ts          # StylesApiContext (compound parent → child propagation)
├── create-vars-resolver.ts        # createVarsResolver() + VarsResolver type
├── use-styles/
│   ├── use-styles.ts              # useStyles() hook → getStyles(selector)
│   ├── get-class-name/
│   │   ├── get-class-name.ts      # Main className merger (cx of 8 sources)
│   │   ├── get-selector-class-name.ts   # CSS Module class
│   │   ├── get-static-class-names.ts    # prismui-Button-root
│   │   ├── get-root-class-name.ts       # User className (root only)
│   │   ├── get-resolved-class-names.ts  # User classNames prop
│   │   ├── get-theme-class-names.ts     # theme.components[name].classNames
│   │   ├── get-options-class-names.ts   # getStyles() call-site classNames
│   │   ├── get-global-class-names.ts    # focusable, active
│   │   └── get-variant-class-name.ts    # Variant-specific class
│   └── get-style/
│       ├── get-style.ts           # Main style merger (6 sources)
│       ├── get-theme-styles.ts    # theme.components[name].styles
│       ├── resolve-styles.ts      # Resolve function/object styles
│       └── resolve-vars.ts        # varsResolver execution
└── index.ts                       # barrel exports

packages/core/src/components/
├── Stack/
│   ├── Stack.tsx                  # Component
│   ├── Stack.module.css           # Base styles
│   ├── index.ts                   # Barrel export
│   ├── Stack.test.tsx             # Tests
│   └── Stack.stories.tsx          # Storybook
├── ButtonBase/
│   ├── ButtonBase.tsx
│   ├── ButtonBase.module.css
│   ├── index.ts
│   ├── ButtonBase.test.tsx
│   └── ButtonBase.stories.tsx
├── Paper/
│   ├── Paper.tsx
│   ├── Paper.module.css
│   ├── index.ts
│   ├── Paper.test.tsx
│   └── Paper.stories.tsx
├── Button/
│   ├── Button.tsx
│   ├── Button.module.css
│   ├── ButtonGroup/
│   │   ├── ButtonGroup.tsx
│   │   └── ButtonGroup.module.css
│   ├── index.ts
│   ├── Button.test.tsx
│   └── Button.stories.tsx
└── ... (future components)
```

---

## 6. Phase A: Factory System (~1-2 days)

### 文件: `core/factory/factory.tsx`, `polymorphic-factory.tsx`, `create-factory.ts`

> **与 `types/polymorphic/` 的关系:**  
> Stage-1 的多态类型工具（`ElementType`, `PolymorphicComponentProps`, `PolymorphicRef`, `MergeProps`, `JSXProps`）**保留在 `core/types/polymorphic/`**，它们是纯类型工具，不依赖 factory 系统。  
> `polymorphicFactory()` 从 `../types/polymorphic` 导入这些类型。  
> `createPolymorphicComponent` 被 `polymorphicFactory()` 完全替代，**Stage-2 中删除**。

### 接口设计

```typescript
type DataAttributes = Record<`data-${string}`, any>;

/**
 * 非多态组件的元数据类型
 * 每个组件通过此类型声明自己的能力，驱动整个类型系统
 * 注意：字段均为 optional，与 Mantine 保持一致
 */
export interface FactoryPayload {
  props: Record<string, any>;
  ctx?: any;
  ref?: any;
  stylesNames?: string;
  vars?: any;
  variant?: string;
  staticComponents?: Record<string, any>;
  compound?: boolean;
}

/**
 * 多态组件额外声明默认元素和 ref
 */
export interface PolymorphicFactoryPayload extends FactoryPayload {
  defaultComponent: any;
  defaultRef: any;
}

/**
 * Compound 子组件只能在 theme 中定制 defaultProps
 */
export interface ExtendCompoundComponent<Payload extends FactoryPayload> {
  defaultProps?: Partial<Payload["props"]> & DataAttributes;
}

/**
 * Root (非 compound) 组件可定制 defaultProps + classNames + styles
 * vars 将在 Phase C (Styles API) 实现后补充为 PartialVarsResolver<Payload>
 */
export interface ExtendsRootComponent<Payload extends FactoryPayload> {
  defaultProps?: Partial<Payload["props"]> &
    DataAttributes & { component?: any };
  classNames?: Partial<Record<string & Payload["stylesNames"], string>>;
  styles?: Partial<
    Record<string & Payload["stylesNames"], React.CSSProperties>
  >;
  // vars?: PartialVarsResolver<Payload>;  // Phase C 补充
}

/**
 * 条件类型：compound 组件获得受限的 extend 形状
 */
export type ExtendComponent<Payload extends FactoryPayload> =
  Payload["compound"] extends true
    ? ExtendCompoundComponent<Payload>
    : ExtendsRootComponent<Payload>;

/**
 * 组件静态属性类型组合
 */
type StaticComponents<Input> =
  Input extends Record<string, any> ? Input : Record<string, never>;

type PrismuiComponentStaticProperties<Payload extends FactoryPayload> =
  ThemeExtend<Payload> &
    ComponentClasses<Payload> &
    StaticComponents<Payload["staticComponents"]> &
    FactoryComponentWithProps<Payload>;

/**
 * factory() 返回的组件类型
 * 包含 component? / renderRoot? 以及所有静态属性
 */
export type PrismuiComponent<Payload extends FactoryPayload> =
  React.ForwardRefExoticComponent<
    Payload["props"] &
      React.RefAttributes<Payload["ref"]> & {
        component?: any;
        renderRoot?: (props: Record<string, any>) => React.ReactNode;
      }
  > &
    PrismuiComponentStaticProperties<Payload>;

/**
 * 非多态组件工厂
 * 包装 forwardRef，附加 .extend() (identity) / .withProps() / .classes
 */
export function factory<Payload extends FactoryPayload>(
  ui: React.ForwardRefRenderFunction<Payload["ref"], Payload["props"]>,
): PrismuiComponent<Payload>;

/**
 * 多态组件工厂
 * 支持 component prop 的类型推导
 */
export function polymorphicFactory<Payload extends PolymorphicFactoryPayload>(
  ui: React.ForwardRefRenderFunction<Payload["defaultRef"], Payload["props"]>,
): PrismuiPolymorphicComponent<Payload>;
```

### 设计决策

- **`identity` 函数用于 `.extend()`**: `.extend()` 运行时不做任何事（`identity`），只是类型标记。实际消费在 `createTheme` 中。
- **`withProps` 创建新的 forwardRef 组件**: 固定部分 props，保留类型安全。返回的组件 `displayName` 为 `WithProps(原组件名)`。
- **`ExtendComponent` 条件类型**: `compound: true` 的组件只能定制 `defaultProps`；非 compound 组件可定制 `defaultProps` + `classNames` + `styles` + `vars`（vars 待 Phase C 补充）。
- **`FactoryPayload` 字段均为 optional**: 与 Mantine 保持一致，允许组件按需声明能力。
- **`PrismuiComponent` 包含 `component?` 和 `renderRoot?`**: 与 Mantine 一致，所有 factory 组件都支持这两个 prop。
- **`StaticComponents` 合并到组件类型**: `Payload['staticComponents']` 自动成为组件的静态属性（如 `Button.Group`）。
- **`.classes` 不由 factory 初始化**: 由 CSS Module 外部设置，factory 只提供类型。
- **替换 `createPolymorphicComponent`**: `polymorphicFactory()` 完全取代 `createPolymorphicComponent()`。后者在 Stage-2 中删除。
- **多态类型保留在 `types/polymorphic/`**: `ElementType`、`PolymorphicComponentProps` 等纯类型工具不移动，factory 从 `types/` 导入。职责分离：`types/` 提供类型定义，`factory/` 提供运行时工厂函数。
- **`PolymorphicComponentProps` 使用条件类型**: `C` 不加 `extends ElementType` 约束，改用 `C extends ElementType ? ... : ...` 条件类型，与 Mantine 一致，允许 `<C = Payload['defaultComponent']>` 无约束泛型。
- **✅ 采纳 Mantine theme components 机制**: `.extend()` → `createTheme({ components })` → `useProps`/`useStyles` 消费。Phase B 添加 `PrismuiTheme.components` + `PrismuiThemeComponent`，Phase C 补全 `ExtendsRootComponent` 中的 `vars`。

### 验收标准

- [ ] `factory()` 返回带 `.extend()` 和 `.withProps()` 的组件
- [ ] `polymorphicFactory()` 返回支持 `component` prop 类型推导的组件
- [ ] `.withProps({ variant: 'filled' })` 创建的组件自动携带固定 props
- [ ] `.extend()` 返回值可传入 `createTheme({ components: {...} })`
- [ ] `FactoryPayload` 正确约束 `stylesNames`、`vars`、`variant` 的类型
- [ ] 所有类型从 `factory/index.ts` 正确导出
- [ ] 编译通过 (`tsc --noEmit`)

### Implementation Notes

**已完成** (Phase A)

| 文件                                                    | 说明                                                                                                                                                                                                                                                                                                  |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `core/factory/factory.tsx`                              | `FactoryPayload`, `PolymorphicFactoryPayload`, `ExtendCompoundComponent`, `ExtendsRootComponent`, `ExtendComponent` (条件类型), `StaticComponents`, `ThemeExtend`, `ComponentClasses`, `FactoryComponentWithProps`, `PrismuiComponentStaticProperties`, `PrismuiComponent`, `identity()`, `factory()` |
| `core/factory/polymorphic-factory.tsx`                  | `PolymorphicComponentWithProps`, `polymorphicFactory()`, `PrismuiPolymorphicComponent`                                                                                                                                                                                                                |
| `core/factory/create-factory.ts`                        | `Factory<P>`, `PolymorphicFactory<P>` 类型别名                                                                                                                                                                                                                                                        |
| `core/factory/index.ts`                                 | Barrel exports (所有类型 + `factory` + `polymorphicFactory` + `identity`)                                                                                                                                                                                                                             |
| `core/index.ts`                                         | 新增 `export * from './factory'`                                                                                                                                                                                                                                                                      |
| `core/types/polymorphic/polymorphic-component-props.ts` | `PolymorphicComponentProps` 改为条件类型（不约束 `C`），添加 `renderRoot?`                                                                                                                                                                                                                            |
| `core/factory/factory.test.tsx`                         | 20 tests (10 factory + 10 polymorphicFactory)                                                                                                                                                                                                                                                         |

**验证**: `tsc --noEmit` ✅ | 全量 151 tests ✅ | 零回归

**发现的问题**:

- `PolymorphicComponentProps` 原先使用 `C extends ElementType` 约束，导致 `polymorphicFactory` 中 `<C = Payload['defaultComponent']>` 无约束泛型报错。改为 Mantine 的条件类型方案解决。
- `ExtendsRootComponent.vars` 暂时注释，等 Phase C 的 `PartialVarsResolver` 类型就绪后补充。

---

## 7. Phase B: useProps (~0.5 day)

### 文件: `core/factory/use-props.ts`

### 接口设计

```typescript
/**
 * 过滤掉值为 undefined 的 props
 */
export function filterProps<T extends Record<string, any>>(props: T): T;

/**
 * 三层 props 合并:
 *   组件 defaultProps < theme.components[name].defaultProps < 用户 props
 *
 * @param component - 组件名 (如 'Button')，用于从 theme 读取默认值
 * @param defaultProps - 组件内部默认值
 * @param props - 用户传入的 props
 */
export function useProps<
  T extends Record<string, any>,
  U extends Partial<T> = {},
>(
  component: string,
  defaultProps: U,
  props: T,
): T & { [Key in Extract<keyof T, keyof U>]-?: U[Key] | NonNullable<T[Key]> };
```

### Theme 类型扩展（Mantine theme components 机制）

> **决策**: 完整采纳 Mantine 的 theme components 机制。  
> `.extend()` 返回的对象存入 `createTheme({ components })`，由 `useProps` 消费 `defaultProps`，由 `useStyles` 消费 `classNames`/`styles`/`vars`。  
> 这使得项目级统一调整组件样式（如所有 Button 圆角改为 8px）只需一处配置。

```typescript
// 扩展 PrismuiTheme
interface PrismuiTheme {
  // ... existing fields
  components: Record<string, PrismuiThemeComponent>; // 可选字段
}

/**
 * .extend() 的返回值类型，也是 theme.components[name] 的值类型
 * Phase B 只消费 defaultProps；Phase C 消费 classNames/styles/vars
 */
interface PrismuiThemeComponent {
  defaultProps?: Record<string, any>;
  classNames?: Record<string, string>; // Phase C 消费
  styles?: Record<string, React.CSSProperties>; // Phase C 消费
  vars?: PartialVarsResolver<any>; // Phase C 消费
}
```

**数据流:**

```
Button.extend({ defaultProps: { variant: 'filled' }, classNames: { root: 'my-btn' } })
  │
  ▼
createTheme({ components: { Button: Button.extend({...}) } })
  │
  ▼
PrismuiProvider theme={theme}
  │
  ├── useProps('Button', null, props)     → 合并 defaultProps
  └── useStyles({ name: 'Button', ... }) → 合并 classNames / styles / vars
```

### 验收标准

- [ ] `useProps('Button', { variant: 'filled' }, props)` 正确合并三层
- [ ] `filterProps` 移除 `undefined` 值但保留 `null`、`false`、`0`
- [ ] Theme 中设置 `components.Button.defaultProps.size = 'lg'` 后，未传 `size` 的 Button 使用 `'lg'`
- [ ] 用户 props 优先级最高（覆盖 theme 和 defaultProps）
- [ ] `PrismuiTheme.components` 字段为可选，不破坏现有代码
- [ ] 编译通过

### Implementation Notes

**已完成** (Phase B)

| 文件                              | 说明                                                                                                   |
| --------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `core/theme/types/theme.ts`       | 新增 `PrismuiThemeComponent` interface + `PrismuiThemeComponents` type；`PrismuiTheme.components` 字段 |
| `core/theme/default-theme.ts`     | `components: {}` 已存在于默认主题                                                                      |
| `core/theme/types/index.ts`       | 导出 `PrismuiThemeComponent`, `PrismuiThemeComponents`                                                 |
| `core/factory/use-props.ts`       | `useProps()` hook — 3 层合并，复用 `omitUndefinedProps`，支持 `defaultProps` 为函数                    |
| `core/factory/index.ts`           | 新增 `export { useProps }`                                                                             |
| `core/factory/use-props.test.tsx` | 11 tests                                                                                               |

**设计要点**:

- 复用已有 `omitUndefinedProps`（而非 Mantine 的 `filterProps`），功能等价
- `useSafeTheme()` 内部 try/catch：无 Provider 时跳过 theme 层，不报错
- `defaultProps` 支持 `(theme) => object` 函数形式，与 Mantine 一致
- `null` 可作为 `defaultProps` 传入（组件无内置默认值时）

**验证**: `tsc --noEmit` ✅ | 全量 162 tests ✅ | 零回归

---

## 8. Phase C: Styles API (~2-3 days)

### 文件: `core/styles-api/` 目录

这是 Stage-2 **最复杂**的部分。

### 接口设计

```typescript
// ---- styles-api.types.ts ----

/**
 * 每个使用 Styles API 的组件自动获得这些 props
 */
export interface StylesApiProps<Payload extends FactoryPayload> {
  /** 跳过 CSS Module 类，仅保留用户自定义样式 */
  unstyled?: boolean;
  /** 组件变体 */
  variant?: Payload["variant"] extends string
    ? Payload["variant"] | (string & {})
    : string;
  /** 按 selector 覆盖 className */
  classNames?: ClassNames<Payload>;
  /** 按 selector 覆盖 style */
  styles?: Styles<Payload>;
  /** 按 selector 覆盖 CSS 变量 */
  vars?: PartialVarsResolver<Payload>;
}

/** classNames 可以是对象或函数 */
export type ClassNames<Payload extends FactoryPayload> =
  | Partial<Record<Payload["stylesNames"], string>>
  | ((
      theme: PrismuiTheme,
      props: Payload["props"],
      ctx: Payload["ctx"] | undefined,
    ) => Partial<Record<Payload["stylesNames"], string>>);

/** styles 可以是对象或函数 */
export type Styles<Payload extends FactoryPayload> =
  | Partial<Record<Payload["stylesNames"], React.CSSProperties>>
  | ((
      theme: PrismuiTheme,
      props: Payload["props"],
      ctx: Payload["ctx"] | undefined,
    ) => Partial<Record<Payload["stylesNames"], React.CSSProperties>>);

/**
 * Compound 子组件的 props 类型
 * 不包含 classNames/styles/unstyled/variant，这些从父组件 Context 继承
 */
export interface CompoundStylesApiProps<Payload extends FactoryPayload> {
  /** 按 selector 覆盖 className（仅当子组件需要局部覆盖时使用） */
  className?: string;
  /** 按 selector 覆盖 style（仅当子组件需要局部覆盖时使用） */
  style?: React.CSSProperties;
}

// ---- styles-api-context.ts ----

/**
 * 父组件通过此 Context 向 compound 子组件传播样式配置
 */
export interface StylesApiContextValue {
  classNames: Record<string, string>;
  styles: Record<string, React.CSSProperties>;
  unstyled: boolean;
  variant?: string;
  getStyles: GetStylesApi<any>;
}

export const StylesApiContext =
  React.createContext<StylesApiContextValue | null>(null);

// ---- use-styles/use-styles.ts ----

export interface UseStylesInput<Payload extends FactoryPayload> {
  name: string | string[];
  props: Payload["props"];
  classes: Record<string, string>; // CSS Module 导入
  className?: string;
  style?: React.CSSProperties;
  classNames?: ClassNames<Payload>;
  styles?: Styles<Payload>;
  unstyled?: boolean;
  vars?: PartialVarsResolver<Payload>;
  varsResolver?: VarsResolver<Payload>;
  rootSelector?: string;
  compound?: boolean; // 是否为 compound 子组件
}

/**
 * 多来源样式编排 hook
 * 返回 getStyles(selector, options?) → { className, style, ...attributes }
 *
 * 当 compound=true 时，从 StylesApiContext 读取父组件的
 * classNames/styles/unstyled/variant，而非从自身 props
 */
export function useStyles<Payload extends FactoryPayload>(
  input: UseStylesInput<Payload>,
): GetStylesApi<Payload>;

export type GetStylesApi<Payload extends FactoryPayload> = (
  selector: Payload["stylesNames"],
  options?: GetStylesApiOptions,
) => { className: string; style: React.CSSProperties };

// ---- create-vars-resolver.ts ----

export type VarsResolver<Payload extends FactoryPayload> = (
  theme: PrismuiTheme,
  props: Payload["props"],
  ctx: Payload["ctx"],
) => TransformVars<Payload["vars"]>;

/**
 * 类型安全的 CSS 变量解析器工厂
 * 仅做类型标记，运行时直接返回传入的函数
 */
export function createVarsResolver<Payload extends FactoryPayload>(
  resolver: VarsResolver<Payload>,
): VarsResolver<Payload>;
```

### getClassName 内部架构

```
getClassName(options)
  │
  ├── getSelectorClassName(selector, classes, unstyled)
  │     └── unstyled ? undefined : classes[selector]
  │
  ├── getStaticClassNames(themeName, prefix, selector)
  │     └── 'prismui-Button-root'
  │
  ├── getVariantClassName(options, classes, selector, unstyled)
  │     └── classes[`${selector}--${variant}`] (if exists)
  │
  ├── getThemeClassNames(theme, themeName, selector, props, ctx)
  │     └── theme.components[name].classNames[selector]
  │
  ├── getResolvedClassNames(selector, ctx, theme, classNames, props)
  │     └── resolve classNames prop (object or function)
  │
  ├── getOptionsClassNames(selector, ctx, options, props, theme)
  │     └── getStyles() call-site classNames
  │
  ├── getGlobalClassNames(theme, options, unstyled)
  │     └── 'prismui-focus-auto' etc.
  │
  ├── getRootClassName(rootSelector, selector, className)
  │     └── className (only if selector === rootSelector)
  │
  └── cx(...all above) → final className string
```

### 验收标准

- [ ] `StylesApiProps` 类型正确约束 `classNames` 和 `styles` 的 key 为 `stylesNames`
- [ ] `CompoundStylesApiProps` 不包含 `classNames`/`styles`/`unstyled`/`variant`
- [ ] `StylesApiContext` 可由父组件提供，子组件可读取
- [ ] `useStyles()` 返回 `getStyles` 函数
- [ ] `useStyles({ compound: true })` 从 Context 读取 classNames/styles/unstyled
- [ ] `getStyles('root')` 返回 `{ className, style }` 包含所有合并来源
- [ ] `getStyles('root')` 的 className 包含 CSS Module class + static class + user className
- [ ] `getStyles('inner')` 不包含用户 `className`（仅 root 有）
- [ ] `unstyled={true}` 时 CSS Module class 被跳过
- [ ] `classNames` 支持对象和函数两种形式
- [ ] `styles` 支持对象和函数两种形式
- [ ] `createVarsResolver` 的返回值被 `getStyle` 正确合并为 CSS 变量
- [ ] Theme 级 `classNames` 和 `styles` 被正确合并
- [ ] 所有 8 个 className 来源按正确优先级合并
- [ ] 所有 6 个 style 来源按正确优先级合并
- [ ] 编译通过

### Implementation Notes

> _完成后回填_

---

## 9. Phase D: CSS Modules (~0.5 day)

### 工作项

1. **验证 Vite CSS Modules 配置** — 创建测试 `.module.css` 文件，确认 `import classes from './X.module.css'` 返回正确的类名映射
2. **PostCSS 配置** — 如需 RTL mixin 或其他预处理，配置 PostCSS
3. **CSS Module 命名约定** — 文档化：selector 名使用 camelCase（`.root`, `.inner`, `.label`, `.section`, `.loader`）
4. **`unstyled` 行为验证** — 确认 `useStyles` 在 `unstyled=true` 时跳过 `classes[selector]`

### 验收标准

- [ ] `import classes from './Stack.module.css'` 返回 `{ root: 'Stack_root_xxxxx' }`
- [ ] CSS Module 类名在构建产物中正确生成
- [ ] Storybook 中 CSS Module 样式正确应用
- [ ] 命名约定文档化

### Implementation Notes

> _完成后回填_

---

## 10. Phase E: Box Refactoring (~1 day)

### 工作项

1. **Box 使用 `polymorphicFactory()`** — 替换 `createPolymorphicComponent`
2. **删除 `createPolymorphicComponent`** — 从 `core/types/polymorphic/` 中移除该文件，更新 `index.ts` 导出
3. **Box 集成 `useStyles`** — className/style 通过 Styles API 解析
4. **保持所有现有 Box 功能** — `component`, `renderRoot`, `mod`, `variant`/`size`, SystemProps
5. **运行所有现有测试** — 零回归
6. **更新 Storybook** — 反映新模式

### 验收标准

- [ ] Box 使用 `polymorphicFactory()` 创建
- [ ] `createPolymorphicComponent` 已从 `types/polymorphic/` 删除
- [ ] `types/polymorphic/index.ts` 不再导出 `createPolymorphicComponent`
- [ ] Box 支持 `classNames`, `styles`, `unstyled` props
- [ ] `<Box component="a" href="/link">` 类型推导正确
- [ ] `<Box renderRoot={(props) => <a {...props} />}>` 仍然工作
- [ ] `<Box mod={{ active: true }}>` 仍然生成 `data-active`
- [ ] `<Box variant="filled" size="lg">` 仍然生成 `data-variant` / `data-size`
- [ ] 所有 SystemProps 仍然工作（`p`, `m`, `bg`, `c` 等）
- [ ] **所有现有 Box 测试通过（131 tests, zero failures）**
- [ ] Storybook 更新

### Implementation Notes

> _完成后回填_

---

## 11. Phase F: Validation Components

这些组件验证工厂基础设施。它们**不是可选的** — 它们是工厂系统的端到端测试用例。

### F1: Stack (~0.5 day)

**验证目标**: factory + useStyles + CSS Module + 单一 selector (`root`)

```typescript
// Stack 的 Factory 类型
export type StackFactory = Factory<{
  props: StackProps;
  ref: HTMLDivElement;
  stylesNames: "root";
  vars: StackCssVariables;
}>;

export interface StackProps extends BoxProps, StylesApiProps<StackFactory> {
  /** 子元素间距 @default 'md' */
  gap?: PrismuiSpacing;
  /** 对齐方式 */
  align?: React.CSSProperties["alignItems"];
  /** 排列方式 */
  justify?: React.CSSProperties["justifyContent"];
}

export type StackCssVariables = {
  root: "--stack-gap" | "--stack-align" | "--stack-justify";
};
```

```css
/* Stack.module.css */
.root {
  display: flex;
  flex-direction: column;
  gap: var(--stack-gap);
  align-items: var(--stack-align);
  justify-content: var(--stack-justify);
}
```

**验收标准:**

- [ ] `<Stack gap="md">` 渲染正确的 flex 布局
- [ ] `<Stack align="center" justify="space-between">` 正确应用
- [ ] `<Stack unstyled>` 跳过 CSS Module 类
- [ ] `<Stack classNames={{ root: 'custom' }}>` 正确合并
- [ ] Stack 无 Provider 时使用 defaultTheme
- [ ] 测试覆盖: 渲染、props、unstyled、classNames/styles

**Implementation Notes:**

> _完成后回填_

### F2: ButtonBase (~1 day)

**验证目标**: polymorphicFactory + useProps + `<button>` 语义 + 键盘可访问性

```typescript
export type ButtonBaseFactory = PolymorphicFactory<{
  props: ButtonBaseProps;
  defaultRef: HTMLButtonElement;
  defaultComponent: "button";
  stylesNames: "root";
}>;

export interface ButtonBaseProps
  extends BoxProps, StylesApiProps<ButtonBaseFactory> {
  /** 静态 selector 名（供父组件覆盖） */
  __staticSelector?: string;
}
```

```css
/* ButtonBase.module.css */
.root {
  background-color: transparent;
  cursor: pointer;
  border: 0;
  padding: 0;
  appearance: none;
  font-size: var(--prismui-font-size-md);
  text-align: left;
  text-decoration: none;
  color: inherit;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
```

**验收标准:**

- [ ] `<ButtonBase>` 渲染 `<button type="button">`
- [ ] `<ButtonBase component="a" href="/link">` 渲染 `<a>` 且不设 `type`
- [ ] 键盘 Enter/Space 触发 onClick
- [ ] `disabled` 属性正确应用
- [ ] `<ButtonBase unstyled>` 跳过 CSS Module 类
- [ ] Theme 级 `defaultProps` 正确合并
- [ ] 测试覆盖: 渲染、多态、键盘、disabled、unstyled、useProps

**Implementation Notes:**

> _完成后回填_

### F3: Paper (~0.5 day)

**验证目标**: varsResolver + CSS 变量 + shadow tokens

```typescript
export type PaperFactory = Factory<{
  props: PaperProps;
  ref: HTMLDivElement;
  stylesNames: "root";
  vars: PaperCssVariables;
}>;

export interface PaperProps extends BoxProps, StylesApiProps<PaperFactory> {
  /** 阴影层级 @default 'xs' */
  shadow?: PrismuiShadow;
  /** 圆角 @default theme.defaultRadius */
  radius?: PrismuiRadius;
  /** 是否有边框 @default false */
  withBorder?: boolean;
}

export type PaperCssVariables = {
  root: "--paper-radius" | "--paper-shadow";
};
```

**验收标准:**

- [ ] `<Paper shadow="md">` 通过 CSS 变量应用阴影
- [ ] `<Paper radius="lg">` 通过 CSS 变量应用圆角
- [ ] `<Paper withBorder>` 通过 `data-with-border` 属性应用边框
- [ ] varsResolver 正确将 props 转换为 CSS 变量
- [ ] 用户可通过 `vars` prop 覆盖 CSS 变量
- [ ] 测试覆盖: 渲染、shadow、radius、withBorder、varsResolver、vars 覆盖

**Implementation Notes:**

> _完成后回填_

### F4: Button (~1-2 days)

**验证目标**: 全部基础设施端到端验证

```typescript
export type ButtonStylesNames =
  | "root"
  | "inner"
  | "loader"
  | "section"
  | "label";
export type ButtonVariant =
  | "filled"
  | "light"
  | "outline"
  | "subtle"
  | "transparent"
  | "default";

export type ButtonFactory = PolymorphicFactory<{
  props: ButtonProps;
  defaultRef: HTMLButtonElement;
  defaultComponent: "button";
  stylesNames: ButtonStylesNames;
  vars: ButtonCssVariables;
  variant: ButtonVariant;
}>;

export interface ButtonProps extends BoxProps, StylesApiProps<ButtonFactory> {
  /** 按钮大小 @default 'sm' */
  size?: PrismuiSize;
  /** 颜色 @default theme.primaryColor */
  color?: PrismuiColor;
  /** 圆角 @default theme.defaultRadius */
  radius?: PrismuiRadius;
  /** 左侧内容 */
  leftSection?: React.ReactNode;
  /** 右侧内容 */
  rightSection?: React.ReactNode;
  /** 全宽 @default false */
  fullWidth?: boolean;
  /** 加载中 @default false */
  loading?: boolean;
  /** 禁用 @default false */
  disabled?: boolean;
  children?: React.ReactNode;
}

export type ButtonCssVariables = {
  root:
    | "--button-height"
    | "--button-padding-x"
    | "--button-fz"
    | "--button-radius"
    | "--button-bg"
    | "--button-hover"
    | "--button-color"
    | "--button-bd";
};
```

**验收标准:**

- [ ] `<Button>Click</Button>` 渲染完整的按钮结构（root > inner > label）
- [ ] `<Button variant="filled" color="primary">` 正确应用变体颜色
- [ ] `<Button variant="outline">` 正确应用轮廓样式
- [ ] `<Button size="lg">` 通过 CSS 变量调整尺寸
- [ ] `<Button leftSection={<Icon />}>` 渲染左侧区域
- [ ] `<Button loading>` 显示加载状态
- [ ] `<Button disabled>` 禁用交互
- [ ] `<Button fullWidth>` 占满容器宽度
- [ ] `<Button component="a" href="/link">` 多态渲染
- [ ] `<Button classNames={{ root: 'x', inner: 'y', label: 'z' }}>` 多 selector 覆盖
- [ ] `<Button styles={{ root: { margin: 8 } }}>` 样式覆盖
- [ ] `<Button unstyled>` 跳过所有 CSS Module 类
- [ ] Theme 级 `components.Button.defaultProps` 正确合并
- [ ] Theme 级 `components.Button.classNames` 正确合并
- [ ] 测试覆盖: 渲染、变体、尺寸、loading、disabled、sections、多态、classNames/styles、unstyled、theme 定制

**Implementation Notes:**

> _完成后回填_

### F5: Button.Group — Compound 验证 (~0.5 day)

**验证目标**: compound 模式端到端验证 — `StylesApiContext` 传播、`CompoundStylesApiProps`、父组件统一控制子组件样式

```typescript
// Button.Group 是 Button 的 compound 父容器
export type ButtonGroupFactory = Factory<{
  props: ButtonGroupProps;
  ref: HTMLDivElement;
  stylesNames: "root";
  vars: ButtonGroupCssVariables;
}>;

export interface ButtonGroupProps
  extends BoxProps, StylesApiProps<ButtonGroupFactory> {
  /** 排列方向 @default 'horizontal' */
  orientation?: "horizontal" | "vertical";
  /** 子元素 (Button 组件) */
  children?: React.ReactNode;
}

// Button 在 Button.Group 内部时作为 compound 子组件
// Button.Group 通过 StylesApiContext 向子 Button 传播:
//   - classNames / styles / unstyled / variant
// 子 Button 使用 CompoundStylesApiProps（不接收这些 props）
```

```css
/* ButtonGroup.module.css */
.root {
  display: flex;
}

.root[data-orientation="horizontal"] > :not(:first-child) {
  border-start-start-radius: 0;
  border-end-start-radius: 0;
}

.root[data-orientation="horizontal"] > :not(:last-child) {
  border-start-end-radius: 0;
  border-end-end-radius: 0;
}
```

**验收标准:**

- [ ] `<Button.Group>` 渲染水平排列的按钮容器
- [ ] `<Button.Group orientation="vertical">` 渲染垂直排列
- [ ] `<Button.Group unstyled>` 通过 Context 传播到所有子 Button
- [ ] `<Button.Group classNames={{ root: 'x' }}>` 通过 Context 传播
- [ ] `<Button.Group variant="outline">` 通过 Context 统一设置子 Button 变体
- [ ] 子 Button **不接受** `classNames`/`styles`/`unstyled` props（类型层面）
- [ ] Theme 级 `components.ButtonGroup.classNames` 正确传播到子组件
- [ ] 测试覆盖: 渲染、方向、Context 传播、unstyled 传播、variant 传播

**Implementation Notes:**

> _完成后回填_

---

## 12. Testing Strategy

测试分为四个层次：

### Layer 1: 单元测试 — Factory 工具

```typescript
describe("factory", () => {
  it("wraps forwardRef and adds .extend()");
  it("wraps forwardRef and adds .withProps()");
  it(".withProps() creates component with fixed props");
  it(".extend() returns identity (type-only marker)");
});

describe("polymorphicFactory", () => {
  it("supports component prop type inference");
  it("defaults to specified defaultComponent");
});

describe("filterProps", () => {
  it("removes undefined values");
  it("preserves null, false, 0, empty string");
});

describe("useProps", () => {
  it("merges defaultProps < theme < user");
  it("user props override theme defaults");
  it("works without theme (uses defaultTheme)");
});
```

### Layer 2: 单元测试 — Styles API 工具

```typescript
describe("getClassName", () => {
  it("includes CSS Module class when not unstyled");
  it("excludes CSS Module class when unstyled");
  it("includes static class (prismui-Button-root)");
  it("includes user className only for root selector");
  it("merges theme classNames");
  it("merges user classNames prop");
  it("resolves function-form classNames");
});

describe("getStyle", () => {
  it("merges theme styles");
  it("merges user styles prop");
  it("includes varsResolver output");
  it("includes user style only for root selector");
  it("resolves function-form styles");
});

describe("createVarsResolver", () => {
  it("returns the resolver function unchanged");
  it("resolver receives theme, props, ctx");
});

describe("CompoundStylesApiProps", () => {
  it("does not include classNames/styles/unstyled/variant");
});

describe("StylesApiContext", () => {
  it("provides classNames/styles/unstyled/variant to children");
  it("returns null when no parent provider");
});

describe("useStyles (compound mode)", () => {
  it("reads classNames from StylesApiContext when compound=true");
  it("reads styles from StylesApiContext when compound=true");
  it("reads unstyled from StylesApiContext when compound=true");
  it("falls back to own props when no Context");
});
```

### Layer 3: 集成测试 — 组件渲染

```typescript
describe("Stack", () => {
  it("renders flex column with gap");
  it("applies align and justify");
  it("supports unstyled mode");
  it("merges classNames and styles");
});

describe("ButtonBase", () => {
  it('renders <button type="button"> by default');
  it('renders <a> when component="a"');
  it("handles keyboard events");
  it("applies disabled state");
});

describe("Paper", () => {
  it("applies shadow via CSS variables");
  it("applies radius via CSS variables");
  it("supports withBorder");
});

describe("Button", () => {
  it("renders complete structure (root > inner > label)");
  it("applies variant styles");
  it("applies size via CSS variables");
  it("renders leftSection and rightSection");
  it("shows loading state");
  it("handles disabled state");
});

describe("Button.Group (compound)", () => {
  it("renders horizontal button group");
  it("renders vertical button group");
  it("propagates unstyled to child Buttons via Context");
  it("propagates variant to child Buttons via Context");
  it("propagates classNames to child Buttons via Context");
});
```

### Layer 4: 端到端验证 — Theme 定制

```typescript
describe("Theme customization", () => {
  it("theme.components.Button.defaultProps applies to all Buttons");
  it("theme.components.Button.classNames merges with user classNames");
  it("theme.components.Button.styles merges with user styles");
  it("user props override theme defaults");
  it("components work without PrismuiProvider");
  it("theme.components.ButtonGroup styles propagate to child Buttons");
});
```

### 测试数量目标

| 类别            | 预计测试数  |
| --------------- | ----------- |
| Factory 工具    | 10-15       |
| Styles API 工具 | 25-35       |
| Stack           | 8-12        |
| ButtonBase      | 10-15       |
| Paper           | 8-12        |
| Button          | 15-25       |
| Button.Group    | 8-12        |
| Theme 定制      | 6-12        |
| **总计**        | **~90-140** |

---

## 13. Dependency Graph

```
Phase A: Factory System
  ↓
Phase B: useProps ← depends on PrismuiTheme.components type
  ↓
Phase C: Styles API ← depends on factory types + useProps + theme context
  ↓
Phase D: CSS Modules ← independent, but must be ready before E
  ↓
Phase E: Box Refactoring ← depends on A + B + C + D
  ↓
Phase F1: Stack ← depends on E (uses factory + useStyles)
  ↓
Phase F2: ButtonBase ← depends on F1 patterns
  ↓
Phase F3: Paper ← depends on F2 patterns + varsResolver
  ↓
Phase F4: Button ← depends on F2 (ButtonBase) + F3 patterns
  ↓
Phase F5: Button.Group ← depends on F4 (Button) + compound infra from C
```

**Critical path:** A → B → C → E → F4 → F5

---

## 14. Estimated Timeline

| Phase              | Duration       | Day    | Notes                                                    |
| ------------------ | -------------- | ------ | -------------------------------------------------------- |
| A: Factory System  | 1-2 days       | D1-D2  | Types + functions, moderate complexity                   |
| B: useProps        | 0.5 day        | D2     | Simple hook, but requires theme type extension           |
| C: Styles API      | 2-3 days       | D3-D5  | Most complex part (getClassName, getStyle, varsResolver) |
| D: CSS Modules     | 0.5 day        | D5     | Config verification, conventions                         |
| E: Box Refactoring | 1 day          | D6     | Must pass all existing tests                             |
| F1: Stack          | 0.5 day        | D7     | Simple component                                         |
| F2: ButtonBase     | 1 day          | D7-D8  | Accessibility + polymorphism                             |
| F3: Paper          | 0.5 day        | D8     | VarsResolver validation                                  |
| F4: Button         | 1-2 days       | D9-D10 | Full-featured, most complex component                    |
| F5: Button.Group   | 0.5 day        | D11    | Compound validation                                      |
| **Total**          | **~9-11 days** |        |                                                          |

---

## 15. Risks and Mitigations

| Risk                                                       | Probability | Impact | Mitigation                                                  |
| ---------------------------------------------------------- | ----------- | ------ | ----------------------------------------------------------- |
| CSS Modules don't work with current Vite config            | Low         | High   | Verify early in Phase D; Vite supports CSS Modules natively |
| `PrismuiTheme.components` type change breaks existing code | Low         | Medium | Optional field, no existing code uses it                    |
| Box refactoring introduces regressions                     | Medium      | High   | Run all 131 existing tests; keep old tests intact           |
| useStyles complexity exceeds estimate                      | Medium      | Medium | Start with core sources, add incrementally                  |
| TypeScript inference issues with factory types             | Medium      | Medium | Test type inference in `.test-d.ts` files                   |
| CSS Module class names conflict in tests                   | Low         | Low    | Use unique component names in test fixtures                 |

---

## 16. Non-Goals (Explicitly Deferred)

- **Headless mode** — `useMantineIsHeadless()` equivalent deferred to Stage-3+
- **CSS-in-JS transform** — No Emotion/styled-components integration
- **Theme-level style transforms** — `useStylesTransform` deferred
- **Documentation website** — Deferred to later stage
- **Text component** — Not in Stage-2 (Button validates the system sufficiently)
- **Group component** — Not in Stage-2 (Stack is sufficient for layout validation)

---

## 17. Relationship to Other Stages

```
Stage-1 (Complete)          Stage-2 (This Stage)           Stage-3+ (Future)
─────────────────           ────────────────────           ─────────────────
Provider                    Factory System                  Text, Group
Theme + CSS Vars     →      useProps                 →      Input Components
SystemProps                 Styles API                      Feedback Components
Box (basic)                 CSS Modules                     Documentation Site
                            Box (refactored)                Headless mode
                            Stack                           Advanced theming
                            ButtonBase
                            Paper
                            Button
```

---

## 18. Stage-2 Overall Acceptance Criteria

| Criteria                                                                   | Status |
| -------------------------------------------------------------------------- | ------ |
| `factory()` and `polymorphicFactory()` produce correctly typed components  |        |
| `useProps()` correctly merges default → theme → user props                 |        |
| `useStyles()` returns `getStyles(selector)` with correct className + style |        |
| `createVarsResolver()` produces type-safe CSS variable resolvers           |        |
| CSS Modules work with Vite build                                           |        |
| Box refactored with zero regressions (131 existing tests pass)             |        |
| Stack renders with correct flex layout                                     |        |
| ButtonBase is polymorphic and keyboard accessible                          |        |
| Paper applies elevation shadow via CSS variables                           |        |
| Button renders with all variants, sizes, loading, sections                 |        |
| All components support `classNames`, `styles`, `unstyled` props            |        |
| Compound pattern works: parent Context propagates to child components      |        |
| `CompoundStylesApiProps` correctly restricts child component props         |        |
| Button.Group propagates variant/unstyled/classNames to child Buttons       |        |
| All components work with and without PrismuiProvider                       |        |
| Test count ≥ 90 (new tests, excluding existing 131)                        |        |
| All Storybook stories render correctly                                     |        |
| ADR-007 written and approved                                               | ✅     |
| MODULES.md updated                                                         | ✅     |
| STAGE.md updated                                                           | ✅     |
| Zero TypeScript compilation errors                                         |        |
| Zero known regressions in Stage-1                                          |        |

---

## 19. Stage-2 Final Statistics (Template)

> _Stage-2 完成后填写_

| Metric                          | Value |
| ------------------------------- | ----- |
| Infrastructure files            |       |
| Component files                 |       |
| CSS Module files                |       |
| Test files                      |       |
| Total new tests                 |       |
| Total tests (including Stage-1) |       |
| Storybook stories               |       |
| Public API functions            |       |
| Public API types                |       |

---

## 20. References

- Mantine factory source: `@mantine/core/src/core/factory/`
- Mantine useStyles source: `@mantine/core/src/core/styles-api/use-styles/`
- Mantine UnstyledButton: `@mantine/core/src/components/UnstyledButton/`
- Mantine Button: `@mantine/core/src/components/Button/`
- PrismUI Stage-1: `devdocs/stages/STAGE-001-SUMMARY.md`
- PrismUI style engine: `packages/core/src/core/style-engine/`
- ADR-006: Box Component Architecture
- ADR-007: Component Factory & Styles API
