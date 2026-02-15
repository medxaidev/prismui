# STAGE-004 详细开发计划

> **Created:** 2026-02-16
> **Status:** Ready to Start
> **Estimated Duration:** 12-16 sessions
> **Estimated New Tests:** ~180

---

## 1. 总体策略

### 开发顺序
遵循依赖关系，按以下顺序开发：

```
Phase A (Typography) → Phase B (Feedback) → Phase C (Overlay) → Phase D (Docs)
     ↓                      ↓                      ↓
  Text → Title → Anchor    Alert → Badge          Modal → Popover → Tooltip
                           Toast (依赖 Transition)
```

### 关键决策点

1. **Loader 已完成** (Stage-3 Phase E) — 可直接使用
2. **Transition 组件** — 先实现简化版 (CSS-only)，后续可扩展
3. **Toast 系统** — 使用 React Context + Portal，避免引入外部状态库
4. **Popover 定位** — 评估 `@floating-ui/react` vs 自研简化版
5. **文档站点** — 优先级可调整，可延后到 Phase A/B/C 完成后

---

## 2. Phase A: Typography System (3 sessions)

### A1: Text Component (1 session)

**目标:** 多态文本组件，支持 size, color, weight, align, truncate, lineClamp

**API 设计:**
```typescript
export interface TextProps extends BoxProps, StylesApiProps<TextFactory>,
  ElementProps<'span', 'color'> {
  size?: PrismuiSize | (string & {});           // @default 'md'
  color?: string;                                // theme color or CSS
  weight?: React.CSSProperties['fontWeight'];    // @default 400
  align?: React.CSSProperties['textAlign'];      // @default 'left'
  transform?: React.CSSProperties['textTransform'];
  truncate?: boolean | 'end' | 'start';          // @default false
  lineClamp?: number;                            // multi-line truncate
  inherit?: boolean;                             // inherit parent styles
  gradient?: { from: string; to: string; deg?: number }; // gradient text
}
```

**CSS Variables:**
```
--text-fz, --text-lh, --text-color, --text-gradient
```

**关键特性:**
- `truncate` → `text-overflow: ellipsis` + `overflow: hidden`
- `lineClamp` → `-webkit-line-clamp` + `display: -webkit-box`
- `gradient` → `background-clip: text` + linear-gradient
- `inherit` → 继承父元素 font-size/color/weight

**文件:**
- `components/Text/Text.tsx` (polymorphicFactory, default: `<span>`)
- `components/Text/Text.module.css`
- `components/Text/Text.test.tsx` (~15 tests)
- `components/Text/Text.stories.tsx` (~8 stories)
- `components/Text/index.ts`

**验收标准:**
- [ ] Text 支持所有 size tokens (xs/sm/md/lg/xl)
- [ ] Text color 支持 theme colors 和 CSS colors
- [ ] truncate 单行截断正常工作
- [ ] lineClamp 多行截断正常工作 (webkit + fallback)
- [ ] gradient 渐变文字正常显示
- [ ] 多态性正常 (component="p", component="div")
- [ ] 15 tests pass, tsc clean

---

### A2: Title Component (1 session)

**目标:** 语义化标题组件 (h1-h6)，从 theme 获取一致的尺寸

**API 设计:**
```typescript
export interface TitleProps extends BoxProps, StylesApiProps<TitleFactory>,
  ElementProps<'h1'> {
  order?: 1 | 2 | 3 | 4 | 5 | 6;                 // @default 1
  size?: PrismuiSize | (string & {});            // override theme size
  color?: string;
  weight?: React.CSSProperties['fontWeight'];
  align?: React.CSSProperties['textAlign'];
  truncate?: boolean;
  lineClamp?: number;
}
```

**CSS Variables:**
```
--title-fz, --title-lh, --title-fw, --title-color
```

**关键特性:**
- `order` 决定渲染的 HTML tag (`<h1>` ~ `<h6>`)
- 默认尺寸从 theme 映射: h1=xl, h2=lg, h3=md, h4=sm, h5=xs, h6=xs
- 默认 font-weight: h1/h2=700, h3/h4=600, h5/h6=500
- 复用 Text 的 truncate/lineClamp 逻辑

**文件:**
- `components/Title/Title.tsx` (factory, 非多态)
- `components/Title/Title.module.css`
- `components/Title/Title.test.tsx` (~12 tests)
- `components/Title/Title.stories.tsx` (~6 stories)
- `components/Title/index.ts`

**验收标准:**
- [ ] Title order 1-6 渲染正确的 h1-h6 tag
- [ ] 默认尺寸映射正确
- [ ] 支持 size override
- [ ] truncate/lineClamp 正常工作
- [ ] 12 tests pass, tsc clean

---

### A3: Anchor Component (1 session)

**目标:** 样式化链接组件，扩展 Text

**API 设计:**
```typescript
export interface AnchorProps extends TextProps {
  underline?: 'always' | 'hover' | 'never';     // @default 'hover'
  external?: boolean;                            // add target="_blank" rel="noopener"
}
```

**CSS Variables:**
```
继承 Text 的所有 CSS 变量
```

**关键特性:**
- 默认渲染 `<a>`
- `underline` 控制 text-decoration
- `external` 自动添加 `target="_blank" rel="noopener noreferrer"`
- 默认 color 为 theme primary color
- hover 状态: 加深颜色

**文件:**
- `components/Anchor/Anchor.tsx` (polymorphicFactory, default: `<a>`)
- `components/Anchor/Anchor.module.css`
- `components/Anchor/Anchor.test.tsx` (~13 tests)
- `components/Anchor/Anchor.stories.tsx` (~6 stories)
- `components/Anchor/index.ts`

**验收标准:**
- [ ] Anchor 默认渲染 `<a>` tag
- [ ] underline 三种模式正常工作
- [ ] external 自动添加 target 和 rel
- [ ] 继承 Text 的所有功能 (truncate, lineClamp, etc.)
- [ ] 13 tests pass, tsc clean

---

## 3. Phase B: Feedback Components (4 sessions)

### B1: Transition Component (1 session)

**目标:** CSS 过渡动画包装器，支持 mount/unmount 动画

**API 设计:**
```typescript
export interface TransitionProps {
  mounted: boolean;                              // control visibility
  transition?: 'fade' | 'scale' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right';
  duration?: number;                             // @default 250
  timingFunction?: string;                       // @default 'ease'
  keepMounted?: boolean;                         // keep in DOM when unmounted
  onEnter?: () => void;
  onEntered?: () => void;
  onExit?: () => void;
  onExited?: () => void;
  children: React.ReactElement;
}
```

**实现策略:**
- 使用 CSS transitions + React state machine
- 状态: `unmounted` → `entering` → `entered` → `exiting` → `unmounted`
- 不依赖第三方库 (react-transition-group)
- 简化版实现，足够支持 Modal/Toast/Popover

**文件:**
- `components/Transition/Transition.tsx`
- `components/Transition/Transition.module.css`
- `components/Transition/Transition.test.tsx` (~18 tests)
- `components/Transition/Transition.stories.tsx` (~8 stories)
- `components/Transition/index.ts`

**验收标准:**
- [ ] mounted=true 触发 enter 动画
- [ ] mounted=false 触发 exit 动画
- [ ] 所有 transition 类型正常工作
- [ ] 生命周期回调正确触发
- [ ] 18 tests pass, tsc clean

---

### B2: Alert Component (1 session)

**目标:** 信息横幅组件，支持 icon, title, message, close button

**API 设计:**
```typescript
export interface AlertProps extends BoxProps, StylesApiProps<AlertFactory>,
  ElementProps<'div'> {
  variant?: PrismuiVariant;                      // @default 'soft'
  color?: string;                                // @default 'primary'
  title?: React.ReactNode;
  icon?: React.ReactNode;
  withCloseButton?: boolean;                     // @default false
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
export interface BadgeProps extends BoxProps, StylesApiProps<BadgeFactory>,
  ElementProps<'div'> {
  variant?: PrismuiVariant;                      // @default 'soft'
  color?: string;                                // @default 'primary'
  size?: 'sm' | 'md' | 'lg';                     // @default 'md'
  radius?: PrismuiRadius;                        // @default 'xl' (pill)
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
  position?: 'top-left' | 'top-center' | 'top-right' | 
             'bottom-left' | 'bottom-center' | 'bottom-right';
  maxToasts?: number;                            // @default 5
  children: React.ReactNode;
}

// Toast API
export interface ToastOptions {
  title?: string;
  message: string;
  color?: string;                                // @default 'primary'
  icon?: React.ReactNode;
  autoClose?: number | false;                    // @default 4000
  withCloseButton?: boolean;                     // @default true
  onClose?: () => void;
}

// Imperative API
toast.show(options)
toast.success(message, options)
toast.error(message, options)
toast.info(message, options)
toast.warning(message, options)
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
export interface OverlayProps extends BoxProps, StylesApiProps<OverlayFactory>,
  ElementProps<'div'> {
  opacity?: number;                              // @default 0.6
  color?: string;                                // @default '#000'
  blur?: number;                                 // backdrop-filter blur
  fixed?: boolean;                               // position fixed
  center?: boolean;                              // center children
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
  centered?: boolean;                            // @default false
  size?: PrismuiSize | number;                   // @default 'md'
  fullScreen?: boolean;
  withCloseButton?: boolean;                     // @default true
  closeOnClickOutside?: boolean;                 // @default true
  closeOnEscape?: boolean;                       // @default true
  trapFocus?: boolean;                           // @default true
  lockScroll?: boolean;                          // @default true
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
  opened?: boolean;                              // controlled
  defaultOpened?: boolean;                       // uncontrolled
  onClose?: () => void;
  position?: 'top' | 'right' | 'bottom' | 'left' | 
             'top-start' | 'top-end' | 'right-start' | 'right-end' |
             'bottom-start' | 'bottom-end' | 'left-start' | 'left-end';
  offset?: number;                               // @default 8
  withArrow?: boolean;                           // @default false
  arrowSize?: number;
  width?: number | 'target';                     // @default 'target'
  shadow?: PrismuiShadow;
  radius?: PrismuiRadius;
  transitionProps?: TransitionProps;
  closeOnClickOutside?: boolean;                 // @default true
  closeOnEscape?: boolean;                       // @default true
  trapFocus?: boolean;                           // @default false
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
  position?: PopoverProps['position'];           // @default 'top'
  offset?: number;                               // @default 5
  withArrow?: boolean;                           // @default true
  openDelay?: number;                            // @default 0
  closeDelay?: number;                           // @default 0
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

| Phase | Component | Duration | Cumulative |
|-------|-----------|----------|------------|
| A1 | Text | 1 session | 1 |
| A2 | Title | 1 session | 2 |
| A3 | Anchor | 1 session | 3 |
| B1 | Transition | 1 session | 4 |
| B2 | Alert | 1 session | 5 |
| B3 | Badge | 1 session | 6 |
| B4 | Toast | 1 session | 7 |
| C1 | Overlay | 0.5 session | 7.5 |
| C2 | Modal | 1.5 sessions | 9 |
| C3 | Popover | 1 session | 10 |
| C4 | Tooltip | 0.5 session | 10.5 |
| D1 | Docs Setup | 1 session | 11.5 |
| D2 | API Docs | 1 session | 12.5 |
| D3 | Theme Guide | 1 session | 13.5 |

**总计:** 12-16 sessions (Phase D 可选)

---

## 7. 测试目标

| Phase | Components | Estimated Tests |
|-------|------------|-----------------|
| A | Text, Title, Anchor | ~40 |
| B | Transition, Alert, Badge, Toast | ~80 |
| C | Overlay, Modal, Popover, Tooltip | ~70 |
| **Total** | **11 components** | **~190** |

**累计测试:** 707 (Stage-3) + 190 (Stage-4) = **897 tests**

---

## 8. 风险与缓解

| 风险 | 缓解措施 |
|------|----------|
| Popover 定位复杂度高 | 先实现简化版，后续可引入 floating-ui |
| Modal focus trap 实现困难 | 参考 Mantine 实现，先做简化版 |
| Toast 状态管理复杂 | 使用 Context + useReducer，避免外部库 |
| 文档站点工具链问题 | 使用成熟的 Nextra，配置简单 |
| 时间估算不准 | Phase D 可延后，优先完成 A/B/C |

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
