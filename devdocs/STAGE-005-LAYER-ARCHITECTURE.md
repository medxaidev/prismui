# STAGE-005 层级架构说明

## 问题诊断与修复历史

### 问题 1：Overlay 高度为 0 / 不显示
**原因**：`Transition` 的样式被应用到外层 wrapper div，而不是 `Overlay` 本身。

**修复**：
```tsx
// ❌ 错误
<Transition>
  {(transitionStyles) => (
    <div style={transitionStyles}>
      <Overlay />
    </div>
  )}
</Transition>

// ✅ 正确
<Transition>
  {(transitionStyles) => (
    <Overlay style={{ ...transitionStyles, ...style }} />
  )}
</Transition>
```

### 问题 2：内容出现在 Overlay 下方
**原因 1**：`ModalBaseContent` 没有设置 z-index。

**修复 1**：
```tsx
// ModalBaseContent.tsx
style={{ ...transitionStyles, zIndex: ctx.zIndex + 1, ...style }}
```

**原因 2**：Dialog 创建了自己的 `position: fixed` 层，打破了 ModalBase 的层级结构。

**修复 2**：
- 移除 `Dialog.module.css` 中的 `.inner { position: fixed; inset: 0; }`
- Dialog 直接使用 ModalBase 提供的布局
- ModalBase 添加 `.inner` 容器来包裹内容

**原因 3**：`ModalBaseOverlay` 使用 `position: fixed`，脱离了 ModalBase 的定位上下文。

**修复 3**：
- 移除 `ModalBaseOverlay` 的 `fixed` 属性
- 在 `ModalBase.module.css` 中为 `.overlay` 添加 `position: absolute; inset: 0;`
- 这样 Overlay 相对于 `ModalBase.root` 定位，而不是视口

---

## 最终正确的层级架构

### DOM 结构
```
<Portal>
  <ModalBase.root>                    {/* position: fixed, inset: 0, z-index: 1000 */}
    <ModalBase.inner>                 {/* position: relative, 提供滚动和居中 */}
      <ModalBaseOverlay>              {/* position: absolute, inset: 0 */}
        <Overlay />                   {/* 背景遮罩 */}
      </ModalBaseOverlay>
      <ModalBaseContent>              {/* position: relative, z-index: 1001 */}
        <Paper>                       {/* Dialog 内容 */}
          ...
        </Paper>
      </ModalBaseContent>
    </ModalBase.inner>
  </ModalBase.root>
</Portal>
```

### 关键 CSS 属性

#### ModalBase.root
```css
.root {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  pointer-events: none;
  z-index: var(--allocated-z-index); /* 由 OverlayManager 分配 */
}
```

#### ModalBase.inner
```css
.inner {
  position: relative;          /* 创建定位上下文 */
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  height: 100%;
  padding-top: 5vh;
  overflow-y: auto;            /* 提供滚动 */
  pointer-events: none;        /* 让点击穿透 */
}

.inner[data-centered] {
  align-items: center;
  padding-top: 0;
}
```

#### ModalBase.overlay
```css
.overlay {
  position: absolute;          /* 相对于 .root 定位 */
  inset: 0;                    /* 覆盖整个 modal 区域 */
  pointer-events: auto;        /* 接收点击事件 */
}
```

#### ModalBase.content
```css
.content {
  pointer-events: auto;
  position: relative;
  /* z-index 通过内联样式设置为 ctx.zIndex + 1 */
}
```

---

## 定位策略

### 为什么 Overlay 用 absolute 而不是 fixed？

**Fixed 的问题**：
- `position: fixed` 相对于**视口**定位
- 脱离父容器的定位上下文
- 无法通过父容器的 z-index 控制层级

**Absolute 的优势**：
- `position: absolute` 相对于**最近的定位祖先**（ModalBase.root）定位
- 保持在 ModalBase 的层级上下文中
- 可以通过 ModalBase.root 的 z-index 统一控制整个 modal 的层级

### 为什么 ModalBase.root 用 fixed？

- 需要覆盖整个视口
- 需要脱离页面文档流
- 通过 OverlayManager 分配的 z-index 控制多个 modal 的层级

### 为什么 ModalBase.inner 用 relative？

- 创建定位上下文，让 Overlay 的 absolute 定位相对于它
- 提供 flexbox 布局来居中内容
- 提供滚动容器（`overflow-y: auto`）

---

## Z-Index 分配

### OverlayManager 分配
- 基础 z-index：1000（可配置）
- 每个 overlay 递增 10：1000, 1010, 1020...
- 确保多个 modal 正确堆叠

### Modal 内部层级
- **ModalBase.root**：使用 OverlayManager 分配的 z-index（如 1000）
- **ModalBaseOverlay**：不需要 z-index（absolute 定位，在文档流中排在前面）
- **ModalBaseContent**：`z-index: ctx.zIndex + 1`（如 1001）

### 为什么 Content 需要 z-index + 1？

虽然 Content 在 DOM 中排在 Overlay 后面（自然会显示在上方），但显式设置 z-index 有以下好处：
1. **明确的层级意图**：代码清晰表达"内容在遮罩上方"
2. **防御性编程**：避免未来的 CSS 改动破坏层级
3. **嵌套 modal 支持**：确保在复杂场景下层级正确

---

## Pointer Events 策略

### 为什么使用 pointer-events？

```css
.root { pointer-events: none; }      /* 容器不拦截点击 */
.inner { pointer-events: none; }     /* 布局层不拦截点击 */
.overlay { pointer-events: auto; }   /* 遮罩接收点击（用于关闭） */
.content { pointer-events: auto; }   /* 内容接收点击 */
```

**目的**：
- 让点击能够"穿透"布局层
- 只有 overlay 和 content 响应点击
- 点击 overlay 可以关闭 modal（closeOnClickOutside）
- 点击 content 不会关闭 modal

---

## 常见问题排查

### Overlay 不显示
1. 检查 `Transition` 的样式是否应用到正确的元素
2. 检查 `.overlay` 是否有 `position: absolute; inset: 0;`
3. 检查 `ModalBase.root` 是否有正确的 z-index

### 内容在 Overlay 下方
1. 检查 `ModalBaseContent` 是否设置了 `zIndex: ctx.zIndex + 1`
2. 检查是否有其他组件创建了 `position: fixed` 层
3. 检查 CSS 中是否有冲突的 z-index 设置

### 点击穿透问题
1. 检查 `.overlay` 和 `.content` 是否有 `pointer-events: auto`
2. 检查 `.root` 和 `.inner` 是否有 `pointer-events: none`

### 居中不工作
1. 检查 `ModalBase.inner` 是否有正确的 flexbox 设置
2. 检查 `data-centered` 属性是否正确应用
3. 检查 CSS 中 `.inner[data-centered]` 的样式

---

## 测试验证

所有修复已通过以下测试：
- ✅ ModalBase.test.tsx：24/24 通过
- ✅ Dialog.test.tsx：21/21 通过
- ✅ 完整测试套件：1203/1203 通过
- ✅ TypeScript 编译：零错误

---

## 总结

正确的层级架构关键点：
1. **ModalBase.root** 用 `fixed` 覆盖视口
2. **ModalBase.inner** 用 `relative` 创建定位上下文
3. **Overlay** 用 `absolute` 相对于 root 定位
4. **Content** 用 `relative` + 明确的 `z-index`
5. 使用 `pointer-events` 控制点击穿透
6. 不要在子组件中创建额外的 `fixed` 层
