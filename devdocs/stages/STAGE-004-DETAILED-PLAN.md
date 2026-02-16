# STAGE-004 详细开发计划

> **Created:** 2026-02-16
> **Status:** In Progress (Phase A)
> **Estimated Duration:** 10-14 sessions
> **Estimated New Tests:** ~205

---

## 1. 总体策略

### 开发顺序

遵循依赖关系，按以下顺序开发：

```
Phase A (Typography) → Phase B (Feedback) → Phase C (Overlay) → Phase D (Docs)
     ↓                      ↓                      ↓
  Text ✅ → Anchor          Alert → Badge          Modal → Popover → Tooltip
                           Toast (依赖 Transition)
```

### 关键决策

1. **ADR-010: 统一 Typography 系统** — Text + Title 合并为单一 Text 组件，通过 `variant` prop 选择排版样式 (h1-h6, subtitle1/2, body1/2, caption, overline)
2. **Loader 已完成** (Stage-3 Phase E) — 可直接使用
3. **Transition 组件** — 先实现简化版 (CSS-only)，后续可扩展
4. **Toast 系统** — 使用 React Context + Portal，避免引入外部状态库
5. **Popover 定位** — 评估 `@floating-ui/react` vs 自研简化版
6. **文档站点** — 优先级可调整，可延后到 Phase A/B/C 完成后

---

## 2. Phase A: Typography System (2 sessions) — ADR-010

> **决策:** Text + Title 合并为统一的 Text 组件 (ADR-010)。
> 通过 `variant` prop 选择排版样式，自动映射到正确的 HTML 元素。

### A1: Text Component ✅ (1 session)

**目标:** 统一排版组件，支持 12 种 variant (h1-h6, subtitle1/2, body1/2, caption, overline)

**实现的 API:**

```typescript
export type TextVariant =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "subtitle1"
  | "subtitle2"
  | "body1"
  | "body2"
  | "caption"
  | "overline";

export interface TextProps
  extends BoxProps, StylesApiProps<TextFactory>, ElementProps<"p", "color"> {
  variant?: TextVariant; // @default 'body1'
  color?: string; // theme color or CSS
  align?: React.CSSProperties["textAlign"];
  truncate?: boolean | "end" | "start";
  lineClamp?: number;
  inline?: boolean; // line-height: 1
  inherit?: boolean; // inherit parent font
  gutterBottom?: boolean; // margin-bottom: 0.35em
  textTransform?: React.CSSProperties["textTransform"];
  gradient?: { from: string; to: string; deg?: number };
  span?: boolean; // shorthand for component="span"
}
```

**Typography 规格 (MUI Minimals):**

| Variant   | Element | Weight | Size      | Line Height | Responsive    |
| --------- | ------- | ------ | --------- | ----------- | ------------- |
| h1        | h1      | 800    | 2.5rem    | 1.25        | ✅ 52→58→64px |
| h2        | h2      | 800    | 2rem      | 1.33        | ✅ 40→44→48px |
| h3        | h3      | 700    | 1.5rem    | 1.5         | ✅ 26→30→32px |
| h4        | h4      | 700    | 1.25rem   | 1.5         | ✅ →24px      |
| h5        | h5      | 700    | 1.125rem  | 1.5         | ✅ →19px      |
| h6        | h6      | 600    | 1.0625rem | 1.56        | ✅ →18px      |
| subtitle1 | p       | 600    | 1rem      | 1.5         | ❌            |
| subtitle2 | p       | 600    | 0.875rem  | 1.57        | ❌            |
| body1     | p       | 400    | 1rem      | 1.5         | ❌            |
| body2     | p       | 400    | 0.875rem  | 1.57        | ❌            |
| caption   | span    | 400    | 0.75rem   | 1.5         | ❌            |
| overline  | span    | 700    | 0.75rem   | 1.5         | ❌            |

**CSS Variables:** `--text-fz`, `--text-fw`, `--text-lh`, `--text-color`, `--text-align`, `--text-transform`, `--text-line-clamp`, `--text-gradient`

**文件:**

- `components/Text/Text.tsx` — polymorphicFactory, TYPOGRAPHY_MAP, varsResolver
- `components/Text/Text.module.css` — responsive media queries for h1-h6
- `components/Text/Text.test.tsx` — 54 tests
- `components/Text/Text.stories.tsx` — 13 stories
- `components/Text/index.ts`

**验收标准:**

- [x] 12 种 variant 渲染正确的 HTML 元素
- [x] h1-h6 响应式字体大小 (600/900/1200px breakpoints)
- [x] color 支持 semantic colors, palette tokens, CSS passthrough
- [x] truncate/lineClamp/gradient/inherit/inline/gutterBottom 正常工作
- [x] 多态性正常 (component="div", component="a")
- [x] 54 tests pass, tsc clean, 761 total tests

---

### A2: Anchor Component ✅ (1 session)

**目标:** 样式化链接组件，基于 Text 构建

**实现的 API:**

```typescript
export interface AnchorProps
  extends BoxProps, StylesApiProps<AnchorFactory>, ElementProps<"a", "color"> {
  variant?: TextVariant; // @default 'body1'
  color?: string; // @default 'primary'
  underline?: "always" | "hover" | "never"; // @default 'hover'
  external?: boolean; // target="_blank" rel="noopener noreferrer"
  // Inherits all Text features: align, truncate, lineClamp, gradient, etc.
}
```

**CSS Variables:** `--anchor-color`, `--anchor-hover-color`

**关键特性:**

- 默认渲染 `<a>`，默认 color 为 primary
- `underline` 控制 text-decoration (always/hover/never)
- `external` 自动添加 `target="_blank" rel="noopener noreferrer"`
- hover 状态: 自动使用 `{color}.dark` 加深颜色
- 内部使用 Text 组件，继承所有排版功能
- gradient 模式下自动禁用 underline

**文件:**

- `components/Anchor/Anchor.tsx` — polymorphicFactory, wraps Text with component="a"
- `components/Anchor/Anchor.module.css` — underline modes, hover color transition
- `components/Anchor/Anchor.test.tsx` — 26 tests
- `components/Anchor/Anchor.stories.tsx` — 8 stories
- `components/Anchor/index.ts`

**验收标准:**

- [x] Anchor 默认渲染 `<a>` tag
- [x] underline 三种模式正常工作
- [x] external 自动添加 target 和 rel
- [x] 默认 color 为 primary，hover 加深
- [x] 继承 Text 的所有功能 (variant, truncate, lineClamp, gradient, etc.)
- [x] 26 tests pass, tsc clean, 787 total tests

---

## 3. Phase B: Feedback Components (4 sessions)

### B1: Transition System ✅ (1 session)

**目标:** 完整的 CSS 过渡动画系统，包含 Transition、TransitionGroup、SwitchTransition

**实现的 API:**

```typescript
// --- Transition (render-prop pattern, like Mantine) ---
export interface TransitionProps {
  mounted: boolean;
  transition?: PrismuiTransitionName | PrismuiTransitionStyles; // @default 'fade'
  duration?: number; // @default 225 (MUI enteringScreen)
  exitDuration?: number; // defaults to duration
  timingFunction?: string; // @default 'cubic-bezier(0.4, 0, 0.2, 1)' (MUI easeInOut)
  keepMounted?: boolean;
  enterDelay?: number;
  exitDelay?: number;
  onEnter?: () => void;
  onEntered?: () => void;
  onExit?: () => void;
  onExited?: () => void;
  reduceMotion?: boolean;
  children: (styles: React.CSSProperties) => React.JSX.Element;
}

// --- TransitionGroup (react-transition-group inspired, no deps) ---
export interface TransitionGroupProps {
  children: React.ReactNode; // children must have unique keys
  component?: React.ElementType | null; // @default 'div'
  className?: string;
  style?: React.CSSProperties;
}

// --- SwitchTransition (react-transition-group inspired, no deps) ---
export interface SwitchTransitionProps {
  mode?: "out-in" | "in-out"; // @default 'out-in'
  children: React.ReactElement; // single child with unique key
}
```

**19 transition presets (all using translate3d/scale3d for GPU acceleration):**

| Category  | Names                                                                                                                | Description                          |
| --------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| Placement | top, top-start, top-end, bottom, bottom-start, bottom-end, left, left-start, left-end, right, right-start, right-end | Tooltip/popover style (MUI Minimals) |
| Generic   | fade, grow, zoom                                                                                                     | Common effects                       |
| Slide     | slide-up, slide-down, slide-left, slide-right                                                                        | Full-distance slide                  |

**Theme transitions config (MUI-inspired):**

```typescript
theme.transitions = {
  duration: {
    shortest: 150,
    shorter: 200,
    short: 250,
    standard: 300,
    complex: 375,
    enteringScreen: 225,
    leavingScreen: 195,
  },
  easing: {
    easeInOut: "cubic-bezier(0.4,0,0.2,1)",
    easeOut: "cubic-bezier(0,0,0.2,1)",
    easeIn: "cubic-bezier(0.4,0,1,1)",
    sharp: "cubic-bezier(0.4,0,0.6,1)",
  },
};
```

**useTransition hook (core/src/hooks/):**

- State machine: exited → pre-entering → entering → entered → pre-exiting → exiting → exited
- Double-rAF for browser paint sync (same as Mantine)
- Supports enterDelay/exitDelay, reduceMotion
- Lifecycle callbacks: onEnter, onEntered, onExit, onExited

**文件:**

- `hooks/use-transition.ts` — useTransition hook
- `hooks/index.ts` — hooks barrel export
- `components/Transition/transitions.ts` — 19 presets with translate3d/scale3d
- `components/Transition/get-transition-styles.ts` — status → CSS styles resolver
- `components/Transition/Transition.tsx` — render-prop Transition component
- `components/Transition/TransitionGroup.tsx` — list enter/exit animation
- `components/Transition/SwitchTransition.tsx` — out-in / in-out key-swap animation
- `components/Transition/index.ts` — barrel export
- `core/theme/types/transitions.ts` — PrismuiTransitions types
- Tests: transitions.test.ts (67), get-transition-styles.test.ts (15), Transition.test.tsx (18), TransitionGroup.test.tsx (8), SwitchTransition.test.tsx (5) = **113 tests**
- Stories: Transition.stories.tsx — **11 stories**

**验收标准:**

- [x] mounted=true 触发 enter 动画，mounted=false 触发 exit 动画
- [x] 19 种 transition preset 正常工作 (placement + generic + slide)
- [x] 所有 transform 使用 translate3d/scale3d (GPU 加速)
- [x] 生命周期回调正确触发 (onEnter/onEntered/onExit/onExited)
- [x] TransitionGroup 支持列表动画 (add/remove children)
- [x] SwitchTransition 支持 out-in / in-out 模式
- [x] Theme transitions config (duration + easing) 已添加
- [x] useTransition hook 在 hooks/ 目录
- [x] 113 tests pass, tsc clean, 900 total tests

---

### B2: Alert Component (1 session)

**目标:** 信息横幅组件，支持 icon, title, message, close button

**API 设计:**

```typescript
export interface AlertProps
  extends BoxProps, StylesApiProps<AlertFactory>, ElementProps<"div"> {
  variant?: PrismuiVariant; // @default 'soft'
  color?: string; // @default 'primary'
  title?: React.ReactNode;
  icon?: React.ReactNode;
  withCloseButton?: boolean; // @default false
  onClose?: () => void;
  radius?: PrismuiRadius;
}
```

**CSS Variables:**

```
--alert-bg, --alert-color, --alert-bd, --alert-radius
```

**Styles Names:** `root`, `wrapper`, `icon`, `body`, `title`, `message`, `closeButton`

**关键特性:**

- 使用 `variantColorResolver` 解析颜色
- 默认 icon 根据 color 自动选择 (info/success/warning/error)
- closeButton 使用 ButtonBase
- 支持 4 种 variant (solid/soft/outlined/plain)

**文件:**

- `components/Alert/Alert.tsx`
- `components/Alert/Alert.module.css`
- `components/Alert/Alert.test.tsx` (~20 tests)
- `components/Alert/Alert.stories.tsx` (~10 stories)
- `components/Alert/index.ts`

**验收标准:**

- [ ] Alert 支持所有 4 种 variant
- [ ] variantColorResolver 正确解析颜色
- [ ] title + message 布局正确
- [ ] icon 正确显示
- [ ] closeButton 点击触发 onClose
- [ ] 20 tests pass, tsc clean

---

### B3: Badge Component (1 session)

**目标:** 小标签/徽章组件

**API 设计:**

```typescript
export interface BadgeProps
  extends BoxProps, StylesApiProps<BadgeFactory>, ElementProps<"div"> {
  variant?: PrismuiVariant; // @default 'soft'
  color?: string; // @default 'primary'
  size?: "sm" | "md" | "lg"; // @default 'md'
  radius?: PrismuiRadius; // @default 'xl' (pill)
  leftSection?: React.ReactNode;
  rightSection?: React.ReactNode;
  fullWidth?: boolean;
}
```

**CSS Variables:**

```
--badge-height, --badge-padding-x, --badge-fz, --badge-bg, --badge-color, --badge-bd
```

**关键特性:**

- 使用 `variantColorResolver`
- 默认 pill 形状 (radius=xl)
- 支持 leftSection/rightSection (如 dot indicator)
- 高度: sm=18px, md=22px, lg=26px

**文件:**

- `components/Badge/Badge.tsx`
- `components/Badge/Badge.module.css`
- `components/Badge/Badge.test.tsx` (~18 tests)
- `components/Badge/Badge.stories.tsx` (~10 stories)
- `components/Badge/index.ts`

**验收标准:**

- [ ] Badge 支持所有 4 种 variant
- [ ] 3 种 size 正确渲染
- [ ] leftSection/rightSection 正常工作
- [ ] 18 tests pass, tsc clean

---

### B4: Toast System (1 session)

**目标:** 通知 Toast 系统，支持 auto-dismiss, stacking, positioning

**API 设计:**

```typescript
// Toast Provider
export interface ToastProviderProps {
  position?:
    | "top-left"
    | "top-center"
    | "top-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right";
  maxToasts?: number; // @default 5
  children: React.ReactNode;
}

// Toast API
export interface ToastOptions {
  title?: string;
  message: string;
  color?: string; // @default 'primary'
  icon?: React.ReactNode;
  autoClose?: number | false; // @default 4000
  withCloseButton?: boolean; // @default true
  onClose?: () => void;
}

// Imperative API
toast.show(options);
toast.success(message, options);
toast.error(message, options);
toast.info(message, options);
toast.warning(message, options);
```

**实现策略:**

- React Context + Portal
- 每个 toast 使用 Transition 组件
- 内部使用 Alert 组件样式
- 状态管理: 简单的 reducer (add/remove/update)

**文件:**

- `components/Toast/ToastProvider.tsx`
- `components/Toast/Toast.tsx`
- `components/Toast/Toast.module.css`
- `components/Toast/toast.ts` (imperative API)
- `components/Toast/Toast.test.tsx` (~24 tests)
- `components/Toast/Toast.stories.tsx` (~8 stories)
- `components/Toast/index.ts`

**验收标准:**

- [ ] ToastProvider 正确渲染 Portal
- [ ] toast.show() 显示 toast
- [ ] autoClose 自动关闭
- [ ] 多个 toast 正确堆叠
- [ ] position 正确定位
- [ ] 24 tests pass, tsc clean

---

## 4. Phase C: Overlay Components (3 sessions)

### C1: Overlay Component (0.5 session)

**目标:** 半透明背景遮罩

**API 设计:**

```typescript
export interface OverlayProps
  extends BoxProps, StylesApiProps<OverlayFactory>, ElementProps<"div"> {
  opacity?: number; // @default 0.6
  color?: string; // @default '#000'
  blur?: number; // backdrop-filter blur
  fixed?: boolean; // position fixed
  center?: boolean; // center children
  zIndex?: number;
}
```

**文件:**

- `components/Overlay/Overlay.tsx`
- `components/Overlay/Overlay.module.css`
- `components/Overlay/Overlay.test.tsx` (~10 tests)
- `components/Overlay/Overlay.stories.tsx` (~5 stories)
- `components/Overlay/index.ts`

---

### C2: Modal Component (1.5 sessions)

**目标:** 对话框组件，使用 Portal + Overlay + Transition + focus trap

**API 设计:**

```typescript
export interface ModalProps extends BoxProps, StylesApiProps<ModalFactory> {
  opened: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  centered?: boolean; // @default false
  size?: PrismuiSize | number; // @default 'md'
  fullScreen?: boolean;
  withCloseButton?: boolean; // @default true
  closeOnClickOutside?: boolean; // @default true
  closeOnEscape?: boolean; // @default true
  trapFocus?: boolean; // @default true
  lockScroll?: boolean; // @default true
  overlayProps?: OverlayProps;
  transitionProps?: TransitionProps;
  zIndex?: number;
}
```

**Styles Names:** `root`, `overlay`, `content`, `header`, `title`, `close`, `body`

**关键特性:**

- Portal 渲染到 body
- Overlay 背景遮罩
- Transition 进入/退出动画
- Focus trap (简化版: 监听 Tab, 限制焦点在 Modal 内)
- Scroll lock (document.body overflow: hidden)
- ESC 键关闭
- 点击外部关闭

**文件:**

- `components/Modal/Modal.tsx`
- `components/Modal/Modal.module.css`
- `components/Modal/use-focus-trap.ts` (简化 focus trap hook)
- `components/Modal/use-scroll-lock.ts` (scroll lock hook)
- `components/Modal/Modal.test.tsx` (~25 tests)
- `components/Modal/Modal.stories.tsx` (~10 stories)
- `components/Modal/index.ts`

**验收标准:**

- [ ] Modal opened=true 显示
- [ ] Overlay 正确渲染
- [ ] closeOnClickOutside 正常工作
- [ ] closeOnEscape 正常工作
- [ ] trapFocus 限制焦点
- [ ] lockScroll 锁定滚动
- [ ] 25 tests pass, tsc clean

---

### C3: Popover Component (1 session)

**目标:** 浮动内容组件，锚定到触发元素

**API 设计:**

```typescript
export interface PopoverProps {
  opened?: boolean; // controlled
  defaultOpened?: boolean; // uncontrolled
  onClose?: () => void;
  position?:
    | "top"
    | "right"
    | "bottom"
    | "left"
    | "top-start"
    | "top-end"
    | "right-start"
    | "right-end"
    | "bottom-start"
    | "bottom-end"
    | "left-start"
    | "left-end";
  offset?: number; // @default 8
  withArrow?: boolean; // @default false
  arrowSize?: number;
  width?: number | "target"; // @default 'target'
  shadow?: PrismuiShadow;
  radius?: PrismuiRadius;
  transitionProps?: TransitionProps;
  closeOnClickOutside?: boolean; // @default true
  closeOnEscape?: boolean; // @default true
  trapFocus?: boolean; // @default false
  children: [React.ReactElement, React.ReactElement]; // [Target, Dropdown]
}
```

**实现策略:**

- **简化版定位**: 不使用 floating-ui，手动计算位置
- 使用 `getBoundingClientRect()` 获取 target 位置
- Portal 渲染 dropdown
- Transition 动画
- 监听 window resize/scroll 更新位置

**文件:**

- `components/Popover/Popover.tsx`
- `components/Popover/PopoverTarget.tsx`
- `components/Popover/PopoverDropdown.tsx`
- `components/Popover/Popover.module.css`
- `components/Popover/use-popover-position.ts` (定位 hook)
- `components/Popover/Popover.test.tsx` (~20 tests)
- `components/Popover/Popover.stories.tsx` (~10 stories)
- `components/Popover/index.ts`

**验收标准:**

- [ ] Popover 正确定位到 target
- [ ] 12 种 position 正常工作
- [ ] withArrow 显示箭头
- [ ] closeOnClickOutside 正常工作
- [ ] 20 tests pass, tsc clean

---

### C4: Tooltip Component (0.5 session)

**目标:** 简单文本提示，基于 Popover

**API 设计:**

```typescript
export interface TooltipProps {
  label: React.ReactNode;
  position?: PopoverProps["position"]; // @default 'top'
  offset?: number; // @default 5
  withArrow?: boolean; // @default true
  openDelay?: number; // @default 0
  closeDelay?: number; // @default 0
  children: React.ReactElement;
}
```

**实现策略:**

- 内部使用 Popover
- 默认 hover 触发
- 简化的 API (只保留常用 props)

**文件:**

- `components/Tooltip/Tooltip.tsx`
- `components/Tooltip/Tooltip.module.css`
- `components/Tooltip/Tooltip.test.tsx` (~15 tests)
- `components/Tooltip/Tooltip.stories.tsx` (~6 stories)
- `components/Tooltip/index.ts`

**验收标准:**

- [ ] Tooltip hover 显示
- [ ] openDelay/closeDelay 正常工作
- [ ] 15 tests pass, tsc clean

---

## 5. Phase D: Documentation Site (2-3 sessions, 可选)

### D1: Framework Setup (1 session)

**目标:** 搭建 Next.js + Nextra 文档站点

**任务:**

- [ ] 创建 `apps/docs` Next.js 项目 (App Router)
- [ ] 安装 Nextra (`nextra`, `nextra-theme-docs`)
- [ ] 配置 `next.config.js` + `theme.config.tsx`
- [ ] 设置基础布局 (sidebar, header, footer)
- [ ] 配置 TypeScript + ESLint
- [ ] 配置 Tailwind CSS (用于文档站点自身样式)

**文件结构:**

```
apps/docs/
├── app/
│   ├── layout.tsx
│   ├── page.mdx
│   └── docs/
│       ├── getting-started/
│       ├── components/
│       └── theming/
├── components/
│   ├── ComponentDemo.tsx
│   └── PropsTable.tsx
├── public/
├── next.config.js
├── theme.config.tsx
└── package.json
```

---

### D2: Component API Documentation (1 session)

**目标:** 自动生成 props 表格

**任务:**

- [ ] 编写 TypeScript 类型提取脚本
- [ ] 生成 props 表格组件 `<PropsTable />`
- [ ] 为每个组件创建 MDX 文档页面
- [ ] 添加 live demo 组件 `<ComponentDemo />`

**示例页面结构:**

```mdx
# Button

Description...

## Import

\`\`\`tsx
import { Button } from '@prismui/core';
\`\`\`

## Usage

<ComponentDemo>
  <Button>Click me</Button>
</ComponentDemo>

## Props

<PropsTable component="Button" />

## Examples

### Variants

...
```

---

### D3: Theme Customization Guide (1 session)

**目标:** 编写主题定制教程

**任务:**

- [ ] Getting Started 页面
- [ ] Theme 概念解释
- [ ] Color System 文档
- [ ] Variant System 文档
- [ ] Typography System 文档
- [ ] Spacing System 文档
- [ ] 自定义主题示例

---

## 6. 时间线估算

| Phase | Component   | Duration     | Cumulative |
| ----- | ----------- | ------------ | ---------- |
| A1    | Text        | 1 session    | 1          |
| A2    | Title       | 1 session    | 2          |
| A3    | Anchor      | 1 session    | 3          |
| B1    | Transition  | 1 session    | 4          |
| B2    | Alert       | 1 session    | 5          |
| B3    | Badge       | 1 session    | 6          |
| B4    | Toast       | 1 session    | 7          |
| C1    | Overlay     | 0.5 session  | 7.5        |
| C2    | Modal       | 1.5 sessions | 9          |
| C3    | Popover     | 1 session    | 10         |
| C4    | Tooltip     | 0.5 session  | 10.5       |
| D1    | Docs Setup  | 1 session    | 11.5       |
| D2    | API Docs    | 1 session    | 12.5       |
| D3    | Theme Guide | 1 session    | 13.5       |

**总计:** 12-16 sessions (Phase D 可选)

---

## 7. 测试目标

| Phase     | Components                       | Estimated Tests |
| --------- | -------------------------------- | --------------- |
| A         | Text, Title, Anchor              | ~40             |
| B         | Transition, Alert, Badge, Toast  | ~80             |
| C         | Overlay, Modal, Popover, Tooltip | ~70             |
| **Total** | **11 components**                | **~190**        |

**累计测试:** 707 (Stage-3) + 190 (Stage-4) = **897 tests**

---

## 8. 风险与缓解

| 风险                      | 缓解措施                              |
| ------------------------- | ------------------------------------- |
| Popover 定位复杂度高      | 先实现简化版，后续可引入 floating-ui  |
| Modal focus trap 实现困难 | 参考 Mantine 实现，先做简化版         |
| Toast 状态管理复杂        | 使用 Context + useReducer，避免外部库 |
| 文档站点工具链问题        | 使用成熟的 Nextra，配置简单           |
| 时间估算不准              | Phase D 可延后，优先完成 A/B/C        |

---

## 9. 下一步行动

1. **立即开始:** Phase A1 (Text Component)
2. **准备工作:**
   - 复习 Stage-2/3 的 factory/useStyles 模式
   - 确认 variantColorResolver 可用
   - 准备 Storybook 环境
3. **开发节奏:** 每个组件完成后立即测试 + stories，不积压
4. **文档更新:** 每个 Phase 完成后更新 STAGE-004 主文档

---

## 10. 成功标准

- [ ] 所有 11 个组件完成 (A/B/C phases)
- [ ] ~190 新测试，累计 ~897 tests，0 failures
- [ ] tsc --noEmit clean
- [ ] 所有 Storybook stories 正常渲染
- [ ] 0 known regressions
- [ ] (可选) 文档站点上线
