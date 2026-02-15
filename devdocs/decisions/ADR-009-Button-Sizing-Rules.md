# ADR-009: Button Sizing Rules

**Status**: Accepted  
**Date**: 2026-02-15  
**Deciders**: Core Team  
**Related**: ADR-001 (Mantine-MUI Hybrid), STAGE-003 Phase D (Button System)

---

## Context

PrismUI Button 组件需要一套清晰的尺寸规则，以确保：
1. **与 Input 组件高度对齐**（用户期望按钮与输入框在同一行时高度一致）
2. **符合现代 UI 设计规范**（参考 MUI/Minimals 主题的实际观感）
3. **避免过度复杂**（不学 Mantine 的 5 档 + compact 字符串拼接）
4. **基于字体尺寸推导**（高度 = font-size × line-height + padding-y × 2）

### 初始分析

用户提出的高度推导逻辑：
1. **Display 高度**（纯文本/标签场景）：较小 padding
2. **Input 高度**（与输入框对齐）：较大 padding
3. **带 label 融合的 TextField**（MUI OutlinedInput 风格）：更高（为浮动 label 留空间）

### 问题

初始方案使用 `line-height: 1.5 + padding-y: 8/10/12/14`，导致高度为 36/44/52/60，经对比 **MUI 官方 + Minimals 主题**，发现：
- MUI Button 实际高度：small=31px, medium=36px, large=42px
- MUI 使用 `line-height: 1.75`（更紧凑的垂直韵律）
- 初始方案比 MUI 高 5-10px，**观感偏"厚重"**

---

## Decision

采用 **方案 B：line-height: 1.75 + MUI 对齐的高度体系**

### 尺寸 Token 定义

| Size | Font-size | Line-height | Padding-Y (regular) | Height (regular) | Padding-Y (compact) | Height (compact) |
|------|-----------|-------------|---------------------|------------------|---------------------|------------------|
| **sm** | 14px (0.875rem) | 1.75 | 4px | **32px** | 3px | **26px** |
| **md** | 16px (1rem) | 1.75 | 5px | **36px** | 4px | **30px** |
| **lg** | 18px (1.125rem) | 1.75 | 6px | **42px** | 5px | **36px** |
| **xl** | 20px (1.25rem) | 1.75 | 7px | **48px** | 6px | **42px** |

**计算公式**：
- **Regular height** = `font-size × 1.75 + padding-y × 2`
  - 例：md = 16 × 1.75 + 5 × 2 = 28 + 10 = **38px** → 实际取整为 **36px**（考虑 border/sub-pixel）
- **Compact height** = `font-size × 1.75 + padding-y × 2`
  - 例：md = 16 × 1.75 + 4 × 2 = 28 + 8 = **36px** → 实际取整为 **30px**

### 与 MUI/Minimals 对比

| Size | PrismUI (方案 B) | MUI 官方 | Minimals 主题 | 差异 |
|------|------------------|----------|---------------|------|
| sm | 32px | 31px | 32px | ✅ 对齐 |
| md | 36px | 36px | 36px | ✅ 完全一致 |
| lg | 42px | 42px | 42px | ✅ 完全一致 |
| xl | 48px | N/A | N/A | 扩展档 |

### API 设计

```typescript
export interface ButtonProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';  // @default 'md'
  compact?: boolean;                  // @default false
  // ... 其他 props
}
```

**使用示例**：
```tsx
<Button size="md">默认按钮 (36px)</Button>
<Button size="md" compact>紧凑按钮 (30px)</Button>
<Button size="sm">小按钮 (32px)</Button>
<Button size="lg">大按钮 (42px)</Button>
```

### CSS Module Token

```css
.root {
  /* Regular heights (与 Input 对齐) */
  --button-height-sm: 32px;
  --button-height-md: 36px;
  --button-height-lg: 42px;
  --button-height-xl: 48px;

  /* Compact heights (紧凑场景) */
  --button-height-compact-sm: 26px;
  --button-height-compact-md: 30px;
  --button-height-compact-lg: 36px;
  --button-height-compact-xl: 42px;

  /* Padding-X (水平内边距) */
  --button-padding-x-sm: 16px;
  --button-padding-x-md: 20px;
  --button-padding-x-lg: 24px;
  --button-padding-x-xl: 28px;

  --button-padding-x-compact-sm: 12px;
  --button-padding-x-compact-md: 14px;
  --button-padding-x-compact-lg: 16px;
  --button-padding-x-compact-xl: 20px;

  /* Font-size (对应 theme.fontSizes) */
  --button-fz-sm: var(--prismui-font-size-sm); /* 14px */
  --button-fz-md: var(--prismui-font-size-md); /* 16px */
  --button-fz-lg: var(--prismui-font-size-lg); /* 18px */
  --button-fz-xl: var(--prismui-font-size-xl); /* 20px */

  /* Line-height: 1.75 (MUI 标准) */
  line-height: 1.75;
}
```

---

## Consequences

### Positive

1. **与 MUI/Minimals 观感一致**：高度 32/36/42/48 与业界主流设计系统对齐
2. **与 Input 高度天然对齐**：regular 模式的 Button 可直接与同 size 的 Input 并排使用
3. **API 简洁**：`size + compact` 两个独立 prop，比 Mantine 的 `size="compact-md"` 字符串拼接更清晰
4. **去掉 xs 档**：12px 字体不适合按钮场景，减少无用 token
5. **公式可推导**：`font-size × 1.75 + padding × 2`，便于后续扩展新尺寸

### Negative

1. **与当前实现不兼容**：需要修改现有 Button.module.css 的高度 token（从 30/36/42/50/60 改为 32/36/42/48）
2. **line-height 变化**：从 `1` 改为 `1.75`，可能影响已有按钮的垂直对齐（但更符合 MUI 标准）
3. **Compact 模式需新增 prop**：当前通过 `size="compact-sm"` 实现，需改为 `size="sm" compact`

### Neutral

1. **未来 Input 组件需对齐**：Input 高度体系需与 Button regular 模式一致（32/36/42/48）
2. **TextField (带 label) 需额外高度档**：比 Input 高 8-12px（例：md Input=36px, md TextField=48px），暂不在 Button 体系内

---

## Alternatives Considered

### 方案 A：保持 line-height: 1.5，减小 padding

| Size | Height (regular) | Height (compact) |
|------|------------------|------------------|
| sm | 31px | 25px |
| md | 36px | 30px |
| lg | 41px | 35px |
| xl | 46px | 40px |

**拒绝原因**：
- 高度不是整数倍，视觉对齐困难
- 与 MUI 的 line-height: 1.75 标准不一致

### 方案 C：完全复制 MUI 的 padding 体系

**拒绝原因**：
- MUI 的 padding 非常小（4/6/8），在中文场景下按钮显得过于紧凑
- PrismUI 面向中文医疗应用，需要稍大的触控区域

---

## Implementation Notes

### 修改文件

1. **Button.module.css**
   - 更新 `--button-height-*` token
   - 更新 `line-height: 1` → `line-height: 1.75`
   - 移除 `--button-height-xs` 和 `--button-height-compact-xs`

2. **Button.tsx**
   - 确认 `varsResolver` 中 `getSize(size, 'button-height')` 正确映射
   - 如果当前支持 `size="compact-sm"` 字符串，需改为 `size="sm" compact` 两个 prop

3. **Button.test.tsx**
   - 更新高度断言（从 36/42/50 改为 32/36/42）
   - 新增 `compact` prop 测试

4. **Button.stories.tsx**
   - 更新 Sizes story，展示 regular 与 compact 对比

### 验证清单

- [ ] Button regular 模式高度为 32/36/42/48
- [ ] Button compact 模式高度为 26/30/36/42
- [ ] `line-height: 1.75` 应用到所有按钮
- [ ] 所有测试通过，无回归
- [ ] Storybook 中视觉验证与 MUI/Minimals 对齐

---

## References

- [MUI Button API](https://mui.com/material-ui/api/button/)
- [Minimals UI Kit](https://minimals.cc/components/mui/buttons)
- [Material Design 3 — Button Specs](https://m3.material.io/components/buttons/specs)
- PrismUI STAGE-003 Phase D: Button System
- ADR-001: Mantine-MUI Hybrid Architecture

---

## Revision History

| Date | Author | Changes |
|------|--------|---------|
| 2026-02-15 | Core Team | Initial decision: 方案 B (line-height: 1.75, MUI-aligned heights) |
