# ADR-011: PrismUI Runtime Platform Architecture

**状态**: Accepted  
**日期**: 2026-02-17  
**作者**: PrismUI Core Team  
**范围**: Overlay、Dialog、Drawer、Popover、Toast、未来 Runtime 扩展

---

## 一、设计定位（Positioning）

PrismUI 的定位被正式定义为：

> **PrismUI 是一个 UI Runtime 平台，而不仅仅是 React 组件库。**

这意味着：

- ✅ PrismUI 不只是提供组件
- ✅ PrismUI 提供运行时调度能力
- ✅ PrismUI 提供行为系统
- ✅ PrismUI 提供可插拔 Runtime 模块系统
- ✅ PrismUI 是大型应用的 UI 基础设施

---

## 二、核心理念

PrismUI 架构建立在三个核心原则之上：

### 1️⃣ Runtime 与 Design 分离

- **Theme 是设计系统**
- **Overlay 是运行时系统**
- **行为系统不可混入 Theme**

因此：

```
ThemeSystem ≠ RuntimeSystem
```

### 2️⃣ 四层架构模型

所有复杂浮层组件必须遵循四层结构：

```
Layer 0  Runtime Kernel
Layer 1  Runtime System
Layer 2  Behavior Base
Layer 3  Semantic Layer
Layer 4  Programmatic Controller
```

**Dialog 必须完整实现四层。**

### 3️⃣ 模块化 Runtime 注入

- ❌ PrismUI 不使用布尔开关控制功能
- ✅ 所有 Runtime 能力必须通过 Module 注入

---

## 三、整体架构图

```
PrismuiProvider
    ↓
RuntimeKernel
    ├── ThemeModule
    ├── OverlayModule
    ├── FocusModule
    ├── PositioningModule
    ├── DialogModule
    ├── ToastModule
    └── Future Modules
```

---

## 四、分层详细说明

### Layer 0 — Runtime Kernel

由 `PrismuiProvider` 创建。

**职责**：

- 创建 Runtime 容器
- 注册模块
- 提供 Context
- 管理模块生命周期
- 提供模块访问接口

**接口草案**：

```typescript
type PrismuiModule = {
  name: string;
  setup(kernel: RuntimeKernel): void;
};

interface RuntimeKernel {
  register(name: string, value: unknown): void;
  get<T>(name: string): T;
  expose(name: string, api: unknown): void;
}
```

---

### Layer 1 — Overlay Runtime System

核心运行时调度器。

**职责**：

- overlay stack 管理
- zIndex 分配
- scroll lock
- escape 处理
- active overlay 切换
- nested overlay 管理

**此层不包含**：

- ❌ 动画
- ❌ 语义
- ❌ UI 布局

**Overlay 属于 Runtime System。**

---

### Layer 2 — Behavior Base 层

例如：

- `ModalBase`
- `DrawerBase`
- `PopoverBase`

**职责**：

- 注册到 OverlayManager
- 控制 open / close 生命周期
- 管理 enter / exit 动画
- 与 FocusManager 对接
- 与 PositioningEngine 对接

**此层不包含**：

- ❌ Header
- ❌ Footer
- ❌ 默认按钮

---

### Layer 3 — Semantic Layer

例如：

- `Dialog`
- `Drawer`
- `Tooltip`

**职责**：

- 视觉结构
- Header / Footer
- Padding
- 默认样式
- Token 应用

**语义层不处理运行时逻辑。**

---

### Layer 4 — Programmatic Controller

例如：

- `dialog.open()`
- `dialog.confirm()`
- `toast.show()`

这是 **Runtime Service 层**。

**职责**：

- 命令式调用
- 默认行为注入
- Promise 结果支持
- 队列管理
- 高级流程控制

**它不是 UI 层，而是 Runtime 调度接口。**

---

## 五、Dialog 的完整四层结构

```
PrismuiProvider
    ↓
OverlayModule
    ↓
ModalBase
    ↓
Dialog
    ↓
DialogController
```

### DialogController 示例

```typescript
prismui.dialog.confirm({
  title: '删除确认',
  onConfirm: async () => {
    // ...
  },
});
```

**功能**：

- 自动注入确认按钮
- 自动处理 close
- 支持 await 语义

---

## 六、Overlay Module 设计

Overlay 作为 Runtime Module：

```typescript
export function overlayModule(): PrismuiModule {
  return {
    name: 'overlay',
    setup(kernel) {
      const manager = createOverlayManager();
      kernel.register('overlay', manager);
    },
  };
}
```

Base 层通过 kernel 获取 overlay：

```typescript
const overlay = kernel.get('overlay');
```

---

## 七、Dialog Module 设计

DialogModule 依赖 OverlayModule。

```typescript
export function dialogModule(): PrismuiModule {
  return {
    name: 'dialog',
    setup(kernel) {
      const overlay = kernel.get('overlay');
      const controller = createDialogController(overlay);
      kernel.expose('dialog', controller);
    },
  };
}
```

只有启用 DialogModule 时：

```typescript
prismui.dialog;
```

才存在。

---

## 八、PrismuiProvider 设计

推荐结构：

```tsx
<PrismuiProvider
  modules={[themeModule(), overlayModule(), dialogModule()]}
>
  <App />
</PrismuiProvider>
```

内部实现：

```typescript
function PrismuiProvider({ modules, children }) {
  const kernel = createRuntimeKernel();

  modules.forEach((m) => m.setup(kernel));

  return (
    <RuntimeContext.Provider value={kernel}>
      {children}
    </RuntimeContext.Provider>
  );
}
```

---

## 九、为什么必须 Module 化

**原因**：

1. 支持大型应用裁剪能力
2. 支持未来插件系统
3. 支持微前端隔离
4. 支持 SSR 变体
5. 支持 A/B 控制
6. 避免 Provider 布尔参数爆炸

---

## 十、与 Mantine 的区别

### Mantine

- Modals 作为单独 Provider
- 没有 Runtime Kernel 概念
- 没有 Module 系统

### PrismUI

- Runtime Kernel 统一管理
- 模块可插拔
- Controller 属于 Runtime 层
- 行为与语义彻底分离

---

## 十一、硬性约束（Hard Constraints）

### 禁止：

- ❌ OverlayManager 访问 Theme
- ❌ Base 组件直接操作 `document.body`
- ❌ Controller 修改 Overlay 内部实现
- ❌ 组件绕过 RuntimeKernel 访问子系统
- ❌ 使用布尔参数控制模块

### 强制：

- ✅ 所有 Runtime 必须通过 Module 注入

---

## 十二、长期演进能力

本架构允许未来扩展：

- Toast System
- Command Palette
- Window Manager
- Dock System
- Floating AI Panel
- DevTools Overlay Inspector
- Motion Scheduler
- Layout Engine

**所有能力均作为 Runtime Module 存在。**

---

## 十三、最终定义

PrismUI 被定义为：

> **A Composable UI Runtime Platform for Large-Scale Applications.**

- **Dialog** 是四层结构的代表性实现
- **Overlay** 是 Runtime 内核能力
- **Controller** 是 Runtime 服务接口
- **Theme** 是 Design System

**四者职责清晰，永不混合。**

---

## 十四、实施优先级

### 阶段一：Runtime Kernel 基础

- 实现 RuntimeKernel
- 实现 OverlayModule
- 重构 ModalBase
- 实现 Dialog（无 Controller）

### 阶段二：Controller 层

- 实现 DialogModule（Controller）
- 实现 ToastModule

### 阶段三：扩展能力

- 插件机制
- DevTools
- Runtime Inspector

---

## 结语

本 ADR 不仅定义 Overlay 架构，也正式确立 **PrismUI 的平台级设计哲学**。

所有未来开发必须遵循：

- ✅ 四层结构
- ✅ Runtime 模块化
- ✅ 行为与语义分离
- ✅ Kernel 统一调度

**这是 PrismUI 的架构宪法。**
