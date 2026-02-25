# STAGE-012: Layout System

> **Status**: Design / Planning
> **Reference (Mantine)**: `D:\Programming\mantine\github\mantine-next-8.3.14\packages\@mantine\core\src\components\AppShell`
> **Reference (Visual)**: https://minimals.cc/components/extra/layout

---

## 1. 需求分析 (Requirements Analysis)

### 1.1 目标布局类型

根据 minimals.cc 的设计，需要覆盖以下三种核心布局：

| 布局类型 | 组件名 | 说明 |
|---------|--------|------|
| **Dashboard** | `DashboardLayout` | 固定侧边栏 + 顶部导航栏 + 主内容区，核心模式 |
| **Main** | `MainLayout` | 简单的顶部导航栏 + 主内容区，无侧边栏 |
| **Auth Centered** | `AuthLayout` | 居中卡片式认证页面（登录/注册） |

暂不实现：Simple、Simple Compact、Auth Split（可在后续 STAGE 中补充）。

### 1.2 Dashboard 布局的核心交互需求

Dashboard 是最复杂的布局，具有以下交互特性：

1. **侧边栏折叠/展开** — 桌面端可收缩为 mini 模式（只显示图标）
2. **移动端抽屉** — 小屏幕下侧边栏变为 Drawer 覆盖层
3. **响应式断点** — 不同屏幕宽度下侧边栏宽度/可见性自动切换
4. **过渡动画** — 侧边栏折叠/展开有平滑 CSS transition
5. **窗口 resize 期间禁用动画** — 防止 resize 时闪烁（Mantine 的 `useResizing`）
6. **Header 与 Sidebar 的层叠关系** — 两种模式：
   - `default`：Header 全宽，Sidebar 在 Header 下方
   - `alt`：Sidebar 全高，Header 在 Sidebar 右侧（minimals.cc 默认模式）

---

## 2. 架构决策：Runtime vs Context

### 2.1 问题

Dashboard 布局有大量跨组件交互：
- `Header` 中的汉堡菜单按钮 → 控制 `Sidebar` 的折叠状态
- `Sidebar` 的宽度变化 → 影响 `Main` 的 padding-left
- 移动端检测 → 影响 Sidebar 的渲染模式（fixed vs drawer）

这些交互需要一个**共享状态中心**。

### 2.2 为什么不用 Runtime 模式

Runtime 模式（`RuntimeKernel`）适用于：
- **跨页面/跨组件树**的服务注册（如全局 Toast、全局 Modal）
- **模块化插件系统**（第三方扩展）
- **生命周期管理**（setup/teardown）

Dashboard Layout 的状态是**局部的、树内的**：
- 状态只在一个 `<DashboardLayout>` 实例内有效
- 不需要跨越 React 树边界
- 不需要插件扩展机制

**结论：使用 React Context（同 Tabs、Grid 模式），不使用 Runtime。**

但 Dashboard 的 Context 比 Tabs 更复杂，需要包含：
- 折叠状态（controlled/uncontrolled）
- 移动端检测
- 响应式尺寸配置
- 过渡动画配置

### 2.3 为什么不用四层架构

四层架构（Base → Primitive → Component → Compound）适用于有**可复用底层行为**的组件族：
- ModalBase → Dialog / Drawer / Lightbox
- PopoverBase → Popover / Tooltip / Menu

Layout 组件没有这种复用关系：
- `DashboardLayout` 不与 `MainLayout` 共享底层行为
- 每种 Layout 是独立的 compound component

**结论：每种 Layout 是独立的 compound component，内部用 Context 协调子组件。**

---

## 3. 组件 API 设计

### 3.1 DashboardLayout（核心）

```tsx
<DashboardLayout
  // 侧边栏配置
  navbar={{
    width: 280,           // 展开宽度
    miniWidth: 88,        // 折叠后 mini 宽度（仅图标）
    breakpoint: 'lg',     // 小于此断点时变为 Drawer
    collapsed?: {
      desktop?: boolean,  // 桌面端折叠状态（controlled）
      mobile?: boolean,   // 移动端 Drawer 开关（controlled）
    }
  }}
  // Header 配置
  header={{
    height: 64,
  }}
  // 布局模式
  layout="alt"            // 'default' | 'alt'（minimals.cc 默认 alt）
  // 过渡
  transitionDuration={200}
  // 折叠状态变化回调
  onNavbarCollapse={(collapsed) => void}
  onNavbarMobileOpen={(opened) => void}
>
  <DashboardLayout.Header>
    {/* 顶部导航栏内容 */}
  </DashboardLayout.Header>

  <DashboardLayout.Navbar>
    {/* 侧边栏内容 */}
  </DashboardLayout.Navbar>

  <DashboardLayout.Main>
    {/* 页面主内容 */}
  </DashboardLayout.Main>
</DashboardLayout>
```

#### 子组件

| 子组件 | HTML 元素 | 说明 |
|--------|-----------|------|
| `DashboardLayout.Header` | `<header>` | 固定顶部，全宽或右侧（取决于 layout 模式） |
| `DashboardLayout.Navbar` | `<nav>` | 固定左侧，支持折叠/mini/drawer |
| `DashboardLayout.Main` | `<main>` | 主内容区，自动计算 padding-left/top |

#### useNavbarState hook（暴露给用户）

```tsx
// 在 DashboardLayout 子树内使用
const { collapsed, toggleCollapse, mobileOpened, toggleMobile } = useNavbarState();
```

用于在 Header 的汉堡菜单按钮中调用 `toggleCollapse()` / `toggleMobile()`。

---

### 3.2 MainLayout（简单）

```tsx
<MainLayout
  header={{ height: 64 }}
>
  <MainLayout.Header>...</MainLayout.Header>
  <MainLayout.Main>...</MainLayout.Main>
</MainLayout>
```

---

### 3.3 AuthLayout（居中认证）

```tsx
<AuthLayout>
  {/* 居中显示的内容，通常是登录/注册卡片 */}
  <LoginCard />
</AuthLayout>
```

无子组件，直接居中渲染 children。

---

## 4. CSS 布局策略

### 4.1 DashboardLayout — `layout="alt"`（minimals.cc 模式）

```
┌─────────────────────────────────────────────────┐
│  Navbar (fixed, full height)  │  Header (fixed)  │
│                               ├──────────────────│
│  width: var(--nav-width)      │  Main            │
│  height: 100dvh               │  (scrollable)    │
└─────────────────────────────────────────────────┘
```

CSS 实现：
- Navbar: `position: fixed; left: 0; top: 0; height: 100dvh; width: var(--nav-width)`
- Header: `position: fixed; top: 0; left: var(--nav-width); right: 0; height: var(--header-height)`
- Main: `padding-left: var(--nav-width); padding-top: var(--header-height)`

折叠时：`--nav-width` 从 `280px` 变为 `88px`，触发 CSS transition。

### 4.2 DashboardLayout — `layout="default"`（Mantine 模式）

```
┌─────────────────────────────────────────────────┐
│              Header (fixed, full width)          │
├───────────────────┬─────────────────────────────┤
│  Navbar (fixed)   │  Main (scrollable)           │
│  top: header-h    │  padding-left: nav-width     │
└───────────────────┴─────────────────────────────┘
```

### 4.3 响应式 CSS 变量注入

参考 Mantine 的 `AppShellMediaStyles` 模式，通过 `<style>` 标签注入响应式 CSS 变量：

```html
<style>
  :root {
    --nav-width: 280px;
    --header-height: 64px;
  }
  @media (max-width: 1200px) {
    :root { --nav-width: 0px; }
  }
</style>
```

这样 Main 的 padding 可以纯 CSS 响应，无需 JS 监听 resize。

### 4.4 Mini 模式（折叠但保留图标）

```
--nav-width: 88px  (mini)
--nav-width: 280px (expanded)
```

Navbar 内部内容通过 `data-collapsed` 属性控制显示/隐藏文字：

```css
.navItem[data-collapsed] .label { display: none; }
.navItem[data-collapsed] .icon { margin: auto; }
```

### 4.5 移动端 Drawer 模式

当屏幕宽度 < breakpoint 时：
- Navbar 变为 `position: fixed; transform: translateX(-100%)` (hidden)
- 打开时：`transform: translateX(0)` + 背景遮罩
- 这与 PrismUI 的 `Drawer` 组件不同——Layout 内置轻量 drawer 逻辑，不依赖 DrawerBase

---

## 5. 文件结构

```
components/
├── DashboardLayout/
│   ├── DashboardLayout.tsx          # Root + compound exports
│   ├── DashboardLayout.context.ts   # Context + useNavbarState hook
│   ├── DashboardLayout.module.css   # All layout styles
│   ├── DashboardLayoutHeader.tsx    # Header sub-component
│   ├── DashboardLayoutNavbar.tsx    # Navbar sub-component
│   ├── DashboardLayoutMain.tsx      # Main sub-component
│   ├── DashboardLayoutMediaStyles.tsx # Responsive CSS injection
│   ├── DashboardLayout.test.tsx     # Tests
│   ├── DashboardLayout.stories.tsx  # Storybook stories
│   └── index.ts                     # Barrel
│
├── MainLayout/
│   ├── MainLayout.tsx
│   ├── MainLayout.context.ts
│   ├── MainLayout.module.css
│   ├── MainLayoutHeader.tsx
│   ├── MainLayoutMain.tsx
│   ├── MainLayout.test.tsx
│   ├── MainLayout.stories.tsx
│   └── index.ts
│
└── AuthLayout/
    ├── AuthLayout.tsx
    ├── AuthLayout.module.css
    ├── AuthLayout.test.tsx
    ├── AuthLayout.stories.tsx
    └── index.ts

hooks/
└── use-window-event.ts    # 新增：window resize 监听（参考 Mantine useWindowEvent）
```

---

## 6. 新增 Hooks

### `useWindowEvent`
监听 window 事件，SSR 安全。

```ts
useWindowEvent('resize', handler);
```

### `useMediaQuery`
响应式断点检测，用于判断移动端。

```ts
const isMobile = useMediaQuery('(max-width: 1200px)');
```

---

## 7. Context 设计（DashboardLayout）

```ts
interface DashboardLayoutContextValue {
  // 折叠状态
  desktopCollapsed: boolean;
  mobileOpened: boolean;

  // 控制函数
  toggleDesktopCollapse: () => void;
  toggleMobileOpen: () => void;
  setDesktopCollapsed: (v: boolean) => void;
  setMobileOpened: (v: boolean) => void;

  // 配置
  navbarWidth: number;
  navbarMiniWidth: number;
  headerHeight: number;
  layout: 'default' | 'alt';
  transitionDuration: number;

  // 状态
  isMobile: boolean;
  isResizing: boolean;
}
```

---

## 8. 与 Mantine AppShell 的对比

| 特性 | Mantine AppShell | PrismUI DashboardLayout |
|------|-----------------|------------------------|
| 响应式配置 | 对象配置 + MediaStyles 注入 | 对象配置 + MediaStyles 注入（相同） |
| 折叠状态 | 外部 controlled | controlled + uncontrolled（useUncontrolled） |
| Mini 模式 | ❌ 无 | ✅ 有（minimals.cc 特性） |
| 移动端 Drawer | 外部 Drawer 组件 | ✅ 内置轻量 drawer |
| layout 模式 | default / alt | default / alt（相同） |
| `useNavbarState` hook | ❌ 无 | ✅ 有（方便 Header 内控制） |
| Auth Layout | ❌ 无 | ✅ 有 |
| Main Layout | ❌ 无 | ✅ 有 |

---

## 9. 实现顺序

### Phase A：工具层
1. `useWindowEvent` hook
2. `useMediaQuery` hook

### Phase B：DashboardLayout（核心）
1. Context + `useNavbarState`
2. `DashboardLayoutMediaStyles`（CSS 变量注入）
3. `DashboardLayout` root
4. `DashboardLayout.Header`
5. `DashboardLayout.Navbar`（含 mini 模式 + mobile drawer）
6. `DashboardLayout.Main`
7. CSS module（default + alt 两种 layout 模式）
8. Tests（30+ 测试）
9. Stories（10+ 故事，含完整 Dashboard 演示）

### Phase C：MainLayout
1. Context（简单，只有 headerHeight）
2. Root + Header + Main
3. CSS module
4. Tests + Stories

### Phase D：AuthLayout
1. 纯 CSS 居中布局，无 Context
2. Tests + Stories

---

## 10. 验收标准

- [ ] DashboardLayout 支持 `layout="default"` 和 `layout="alt"` 两种模式
- [ ] 侧边栏支持展开/折叠/mini 三种状态
- [ ] 移动端自动切换为 Drawer 模式
- [ ] 响应式断点通过 CSS 变量注入实现，无 JS resize 监听
- [ ] `useNavbarState()` hook 可在子树内任意位置调用
- [ ] controlled + uncontrolled 折叠状态
- [ ] 过渡动画，resize 期间禁用动画
- [ ] MainLayout 和 AuthLayout 实现
- [ ] 30+ 测试通过
- [ ] 10+ Storybook 故事
- [ ] tsc --noEmit 无错误
- [ ] 零测试回归

---

## 11. 关键设计问题（待确认）

1. **Mini 模式宽度**：默认 88px（minimals.cc），是否需要可配置？
2. **移动端断点**：默认 `lg`（1200px），是否使用 PrismUI 主题断点？
3. **Navbar 内容**：DashboardLayout.Navbar 是否提供 `Section`（类似 Mantine AppShell.Section）用于分割导航区域？
4. **Aside（右侧边栏）**：当前 STAGE 不实现，后续补充？
5. **Footer**：当前 STAGE 不实现，后续补充？
