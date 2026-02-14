# STAGE-003: Advanced Theming & Layout Components

> **Status:** In Progress (Phase A ✅ Complete)
> **Predecessor:** STAGE-002 (Component Factory) — ✅ Complete
> **Owner:** Development Team
> **Created:** 2026-02-13

---

## 1. Goal

Extend PrismUI's theming infrastructure with **variant color resolution** and **headless mode**, then deliver a set of essential layout and UI components: Container, Divider, Group, Grid, Portal, Button, and Button.Group.

### Why This Stage?

Stage-2 established the component factory system (`factory`, `polymorphicFactory`, `useProps`, `useStyles`, `createVarsResolver`). Stage-3 builds on this foundation by:

1. **Advanced Theming** — `variantColorResolver` enables color-variant-driven components (Button, Badge, Alert). Without it, Button cannot resolve `--button-bg`, `--button-color`, etc. from `variant` + `color` props.
2. **Headless Mode** — Systematic `unstyled` support across all components, enabling users to use PrismUI logic without any visual styles.
3. **Layout Components** — Container, Group, Grid fill the layout primitive gap (Stack covers vertical; Group covers horizontal; Grid covers 2D; Container covers max-width centering).
4. **Utility Components** — Divider (visual separator) and Portal (DOM escape hatch) are prerequisites for many future components (Modal, Popover, Dropdown).
5. **Button + Button.Group** — The most important interactive component. Deferred from Stage-2 due to dependency on `variantColorResolver`.

---

## 2. Prerequisites

| Dependency                             | Source           | Status |
| -------------------------------------- | ---------------- | ------ |
| `factory()` / `polymorphicFactory()`   | Stage-2 Phase A  | ✅     |
| `useProps()`                           | Stage-2 Phase B  | ✅     |
| `useStyles()` / `createVarsResolver()` | Stage-2 Phase C  | ✅     |
| CSS Modules + PostCSS                  | Stage-2 Phase D  | ✅     |
| Box (refactored)                       | Stage-2 Phase E  | ✅     |
| Stack, ButtonBase, Paper               | Stage-2 Phase F  | ✅     |
| `getRadius()` / `getShadow()`          | Stage-2 Phase F3 | ✅     |
| Theme CSS variables (`--prismui-*`)    | Stage-1          | ✅     |
| ADR-008: Variant Styling Strategy      | Stage-2          | ✅     |

---

## 3. Phase Overview

```
Phase A: Advanced Theming Infrastructure
  ├── A1: variantColorResolver + defaultVariantColorsResolver
  ├── A2: getThemeColor helper
  ├── A3: getSize / getFontSize helpers
  └── A4: Headless mode (useIsHeadless)

Phase B: Utility Components
  ├── B1: Portal
  └── B2: Divider

Phase C: Layout Components
  ├── C1: Container
  ├── C2: Group
  └── C3: Grid + Grid.Col

Phase D: Button System
  ├── D1: Button (polymorphic, variant-driven)
  └── D2: Button.Group
```

---

## 4. Phase A: Advanced Theming Infrastructure

### A1: variantColorResolver ✅

**Goal:** Provide a theme-level function that resolves `(variant, color, theme, scheme)` → CSS values for background, color, border, and hover states. This is the core mechanism for color-variant components.

**Implemented Design:**

```typescript
export interface VariantColorResolverInput {
  color: string; // theme color key or CSS color
  theme: PrismuiTheme;
  variant: PrismuiVariantKey; // 'solid' | 'soft' | 'outlined' | 'plain'
  scheme: PrismuiResolvedColorScheme; // 'light' | 'dark'
  autoContrast?: boolean; // reserved for future use
}

export interface VariantColorsResult {
  background: string;
  color: string;
  border: string;
  hoverBackground: string;
  hoverColor: string;
  hoverBorder: string;
  hoverShadow: string;
}

export type VariantColorResolver = (
  input: VariantColorResolverInput,
) => VariantColorsResult;
```

**`defaultVariantColorsResolver`** — 4 variants × 5 color types:

| Color Type   | Examples                                                                 | Mechanism                                                 |
| ------------ | ------------------------------------------------------------------------ | --------------------------------------------------------- |
| `inherit`    | 特殊值，继承父元素颜色                                                   | gray shades / `inherit` / `--prismui-action-hover`        |
| Semantic     | `primary`, `secondary`, `info`, `success`, `warning`, `error`, `neutral` | CSS 变量 `var(--prismui-{color}-main)` 等                 |
| Color Family | `blue`, `red`, `green`, ...                                              | 通过 `primaryShade` 解析到具体 shade 值                   |
| `black`      | 纯黑色                                                                   | `var(--prismui-common-black)` + `rgba(channel / opacity)` |
| `white`      | 纯白色                                                                   | `var(--prismui-common-white)` + `rgba(channel / opacity)` |

**关键设计决策：**

- 不使用 `--prismui-shared-*` 变量，改用 opacity + channel 组合方式
- `inherit` = CSS inherit（继承父元素），`neutral` = 标准语义色
- `color-mix(in srgb, ...)` 用于 black/white/outlined 变体
- `rgba(channel / opacity)` 用于 semantic/colorFamily 变体
- 新增 `PrismuiVariantOpacity` 接口控制 opacity 值（可通过 `createTheme` 覆盖）

**Variant Opacity CSS 变量：**

| CSS Variable                            | Default | Usage                       |
| --------------------------------------- | ------- | --------------------------- |
| `--prismui-opacity-solid-commonHoverBg` | 0.72    | solid black/white hover     |
| `--prismui-opacity-outlined-border`     | 0.48    | outlined border opacity     |
| `--prismui-opacity-soft-bg`             | 0.16    | soft background             |
| `--prismui-opacity-soft-hoverBg`        | 0.32    | soft hover background       |
| `--prismui-opacity-soft-commonBg`       | 0.08    | soft black/white background |
| `--prismui-opacity-soft-commonHoverBg`  | 0.16    | soft black/white hover      |
| `--prismui-opacity-soft-border`         | 0.24    | soft border (reserved)      |

**Channel CSS 变量：**

| CSS Variable                      | Usage                               |
| --------------------------------- | ----------------------------------- |
| `--prismui-common-blackChannel`   | `rgba()` for black with opacity     |
| `--prismui-common-whiteChannel`   | `rgba()` for white with opacity     |
| `--prismui-color-gray-500Channel` | inherit variant borders/backgrounds |

**Mantine 额外 variant 的覆盖方式：**

- `default` → `variant="outlined" color="neutral"` (中性色边框按钮)
- `white` → `variant="solid" color="white"` (白色实色填充)
- `transparent` → `variant="plain"` + 自定义 hover 样式 (极少使用)
- `gradient` → 未来通过 `variant="solid" gradient={...}` prop 覆盖背景实现

**Theme integration:**

```typescript
export interface PrismuiTheme {
  // ... existing fields
  variantColorResolver: VariantColorResolver; // default: defaultVariantColorsResolver
}
```

**Files:**

- `core/theme/variant-color-resolver/variant-color-resolver.ts` — types
- `core/theme/variant-color-resolver/default-variant-colors-resolver.ts` — implementation
- `core/theme/variant-color-resolver/index.ts` — barrel exports
- `core/theme/variant-color-resolver/default-variant-colors-resolver.test.ts` — 33 tests
- `core/theme/variant-color-resolver/variant-color-resolver.stories.tsx` — 8 stories
- `core/theme/types/palette.ts` — added `PrismuiVariantOpacity`, `blackChannel`/`whiteChannel`
- `core/theme/types/theme.ts` — added `variantColorResolver` field
- `core/theme/default-theme.ts` — added default opacity values + resolver
- `core/css-vars/palette-vars.ts` — generates opacity + channel CSS variables

**Tests:** 33 tests (4 variants × 5 color types × light/dark, custom resolver, cross-cutting)

### A2: getThemeColor ✅

**Goal:** Resolve a color string to a CSS value. If it's a theme color key, return the corresponding CSS variable. Otherwise, pass through as raw CSS.

**Resolution order:**

1. Palette tokens (`text.primary`, `background.paper`, `common.black`, `divider`) → `var(--prismui-{token})`
2. Semantic color + field (`primary.dark`, `error.mainChannel`) → `var(--prismui-{key}-{field})`
3. Color family + shade (`blue.500`) → `var(--prismui-color-{family}-{shade})`
4. Semantic color key (`primary`) → `var(--prismui-{key}-main)`
5. Color family without shade (`blue`) → `var(--prismui-color-{family}-{mainShade})` (uses `primaryShade.light`)
6. CSS passthrough (`#ff0000`, `rgb(...)`, `transparent`, `inherit`, `currentColor`) → as-is

**Files:**

- `core/theme/get-theme-color.ts` — implementation
- `core/theme/get-theme-color.test.ts` — 32 tests

**Tests:** 32 tests (semantic keys, semantic+field, family+shade, family bare, palette tokens, CSS passthrough)

### A3: getSize / getFontSize ✅

**Goal:** Resolve size tokens to CSS variable references, similar to `getRadius`/`getShadow`.

**Implemented API:**

```typescript
// getSize('sm', 'button-height') → 'var(--button-height-sm)'
// getSize(42, 'button-height') → rem(42)
// getSize('36px', 'button-height') → rem('36px')
export function getSize(
  size: string | number | undefined,
  prefix: string,
): string | undefined;

// getFontSize('sm') → 'var(--prismui-font-size-sm)'
// getFontSize(14) → rem(14)
// getFontSize('16px') → rem('16px')
export function getFontSize(
  size: string | number | undefined,
): string | undefined;
```

**Note:** `getSpacing` 不单独实现 — 已有 `spacingResolver` 覆盖此功能。

**Files:**

- `core/theme/get-size.ts` — generic size resolver with configurable prefix
- `core/theme/get-font-size.ts` — font-size specific resolver (prefix fixed to `--prismui-font-size-`)
- `core/theme/get-size.test.ts` — 11 tests
- `core/theme/get-font-size.test.ts` — 11 tests

**Tests:** 22 tests (named keys, number→rem, CSS string→rem, undefined, non-key strings)

### A4: Headless Mode ✅

**Goal:** Allow entire component trees to render without CSS Module classes. Components already support `unstyled` prop individually; headless mode provides a provider-level toggle.

**Implemented Design:**

```typescript
// Hook — combines provider-level headless with component-level unstyled
export function useIsHeadless(unstyled?: boolean): boolean {
  const ctx = usePrismuiContext();
  return unstyled === true || ctx?.headless === true;
}

// Provider usage
<PrismuiProvider headless>
  <Button>No CSS Module classes applied</Button>
</PrismuiProvider>
```

**Architecture decision:** 不创建单独的 `headless-context.ts`，而是将 `headless` 直接集成到现有的 `PrismuiThemeContextValue` 中。这避免了额外的 context 层，减少 provider 嵌套。

**Integration with `useStyles`:** 组件通过 `useIsHeadless(props.unstyled)` 获取最终的 headless 状态，传递给 `useStyles` 的 `unstyled` 参数。当 headless 为 true 时：

- `getSelectorClassName()` 返回 `undefined`（跳过 CSS Module 类）
- `getVariantClassName()` 返回 `undefined`（跳过变体类）
- Static class names（如 `prismui-Button-root`）保留用于测试

**Files:**

- `core/PrismuiProvider/prismui-theme-context.ts` — added `headless` field + `useIsHeadless()` hook
- `core/PrismuiProvider/PrismuiThemeProvider.tsx` — added `headless` prop, passes to context
- `core/PrismuiProvider/PrismuiProvider.tsx` — added `headless` prop, passes to ThemeProvider
- `core/PrismuiProvider/index.ts` — exports `useIsHeadless`

**Tests:** 已有 `unstyled` 测试覆盖核心逻辑（useStyles.test.tsx 中 3 个 unstyled 测试）。`useIsHeadless` 为轻量 hook，通过 provider 集成测试验证。

### A Phase Acceptance Criteria

- [x] `defaultVariantColorsResolver` returns correct colors for all 4 variants (solid/soft/outlined/plain) — 33 tests
- [x] `variantColorResolver` is configurable via `createTheme({ variantColorResolver })` — test: "custom variantColorResolver can be provided via createTheme"
- [x] `getThemeColor` resolves theme keys and passes through CSS values — 32 tests
- [x] `getSize` / `getFontSize` resolve tokens to CSS variables — 22 tests (11 + 11)
- [x] Headless mode disables all CSS Module classes via provider — `headless` prop on PrismuiProvider/PrismuiThemeProvider, `useIsHeadless()` hook
- [x] All tests pass, tsc clean — 497 tests, 0 failures, tsc --noEmit clean
- [x] Storybook stories — 8 stories in `variant-color-resolver.stories.tsx`

---

## 5. Phase B: Utility Components

### B1: Portal ✅

**Goal:** Render children into a DOM node outside the parent component tree. Essential for modals, popovers, tooltips, dropdowns.

**Implemented Props (MUI + Mantine combined):**

```typescript
export interface PortalProps {
  children: React.ReactNode;
  /** HTMLElement | CSS selector | () => HTMLElement (MUI callback pattern) */
  target?: HTMLElement | string | (() => HTMLElement);
  /** Render in-place instead of portal (MUI disablePortal) @default false */
  disablePortal?: boolean;
  /** Reuse shared portal node (Mantine pattern) @default true */
  reuseTargetNode?: boolean;
  /** className/style/id applied to created portal node (Mantine pattern) */
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  /** Ref forwarded to resolved portal DOM node */
  ref?: React.Ref<HTMLElement>;
}

export interface OptionalPortalProps extends PortalProps {
  /** When false, renders in-place (no Portal) @default true */
  withinPortal?: boolean;
}
```

**Key behaviors:**

- SSR-safe: renders `null` until `useIsomorphicLayoutEffect` runs
- Uses `createPortal` from `react-dom`
- Shared node: `[data-prismui-portal-node]` attribute (Mantine pattern)
- `disablePortal`: renders children in-place (MUI pattern)
- `target` supports callback `() => HTMLElement` (MUI pattern)
- Created portal node gets `data-portal="true"` attribute
- Cleanup: removes owned nodes on unmount; shared nodes persist
- `OptionalPortal`: convenience wrapper with `withinPortal` toggle
- `React.forwardRef` — not factory-based (no styles, pure logic)

**Files:**

- `components/Portal/Portal.tsx` — Portal component
- `components/Portal/OptionalPortal.tsx` — OptionalPortal component
- `components/Portal/Portal.test.tsx` — 26 tests
- `components/Portal/Portal.stories.tsx` — 9 stories
- `components/Portal/index.ts` — barrel exports

**Tests:** 26 tests (basic rendering, target HTMLElement/selector/callback, disablePortal, reuseTargetNode, node attributes className/style/id, ref forwarding, cleanup, OptionalPortal)

### B2: Divider ✅

**Goal:** Visual separator line with optional label. Supports horizontal/vertical orientation. Combines MUI (variant, flexItem, textAlign) and Mantine (factory, label, borderStyle, size tokens) patterns.

**Implemented Props (MUI + Mantine combined):**

```typescript
export interface DividerProps
  extends BoxProps, StylesApiProps<DividerFactory>, ElementProps<"div"> {
  color?: string; // theme color or CSS
  size?: string | number; // border width (xs-xl or px)
  label?: React.ReactNode; // label (horizontal only)
  labelPosition?: "left" | "center" | "right"; // Mantine: label alignment
  orientation?: "horizontal" | "vertical"; // direction
  borderStyle?: "solid" | "dashed" | "dotted"; // Mantine: line style
  flexItem?: boolean; // MUI: correct height in flex
  textAlign?: "left" | "center" | "right"; // MUI: alternative to labelPosition
  variant?: "fullWidth" | "inset" | "middle"; // MUI: margin/inset variant
}
```

**Default color:** `rgba(var(--prismui-color-gray-500Channel) / 0.2)` — equivalent to `rgba(145 158 171 / 20%)`

**CSS Variables:** `--divider-color`, `--divider-border-style`, `--divider-size`
**Styles Names:** `root`, `label`

**Files:**

- `components/Divider/Divider.tsx` — factory-based component
- `components/Divider/Divider.module.css` — CSS Module with size tokens, orientation, variant, label pseudo-elements
- `components/Divider/Divider.test.tsx` — 36 tests
- `components/Divider/Divider.stories.tsx` — 11 stories
- `components/Divider/index.ts` — barrel exports

**Tests:** 36 tests (basic rendering, orientation, label, labelPosition, borderStyle, size, color, variant, flexItem, Styles API, HTML attributes)

### B Phase Acceptance Criteria

- [x] Portal renders children outside parent DOM tree — 26 tests
- [x] Portal is SSR-safe (no hydration mismatch) — useIsomorphicLayoutEffect
- [x] Divider renders horizontal/vertical with correct CSS variables — 36 tests
- [x] Divider label renders with correct positioning
- [x] All tests pass, tsc clean — 597 tests, 0 failures

---

## 6. Phase C: Layout Components

### C1: Container

**Goal:** Max-width centered container. Simple wrapper with responsive `size` prop.

**Props:**

```typescript
export interface ContainerProps
  extends BoxProps, StylesApiProps<ContainerFactory>, ElementProps<"div"> {
  size?: PrismuiSize | (string & {}) | number; // max-width
  fluid?: boolean; // 100% width, ignore size
}
```

**CSS Variables:** `--container-size`
**Default sizes:** xs=540px, sm=720px, md=960px, lg=1140px, xl=1320px

**Files:**

- `components/Container/Container.tsx`, `Container.module.css`, `Container.test.tsx`, `Container.stories.tsx`, `index.ts`

**Tests:** ~12 tests

### C2: Group

**Goal:** Horizontal flex layout (complement to Stack's vertical layout). Supports `gap`, `align`, `justify`, `wrap`, `grow`.

**Props:**

```typescript
export interface GroupProps
  extends BoxProps, StylesApiProps<GroupFactory>, ElementProps<"div"> {
  justify?: React.CSSProperties["justifyContent"]; // @default 'flex-start'
  align?: React.CSSProperties["alignItems"]; // @default 'center'
  wrap?: React.CSSProperties["flexWrap"]; // @default 'wrap'
  gap?: PrismuiSpacing; // @default 'md'
  grow?: boolean; // children flex-grow
  preventGrowOverflow?: boolean; // max-width per child @default true
}
```

**CSS Variables:** `--group-gap`, `--group-align`, `--group-justify`, `--group-wrap`, `--group-child-width`
**Context:** `GroupStylesCtx` with computed `childWidth` for `preventGrowOverflow`

**Files:**

- `components/Group/Group.tsx`, `Group.module.css`, `Group.test.tsx`, `Group.stories.tsx`, `index.ts`
- `components/Group/filter-falsy-children.ts`

**Tests:** ~18 tests

### C3: Grid + Grid.Col

**Goal:** 12-column CSS grid layout with responsive column spans.

**Grid Props:**

```typescript
export interface GridProps
  extends BoxProps, StylesApiProps<GridFactory>, ElementProps<"div"> {
  gutter?: PrismuiResponsiveValue<PrismuiSpacing>; // @default 'md'
  grow?: boolean; // last row fills space
  columns?: number; // @default 12
  justify?: React.CSSProperties["justifyContent"];
  align?: React.CSSProperties["alignItems"];
  overflow?: React.CSSProperties["overflow"];
}
```

**Grid.Col Props:**

```typescript
export interface GridColProps
  extends BoxProps, StylesApiProps<GridColFactory>, ElementProps<"div"> {
  span?: PrismuiResponsiveValue<number | "auto" | "content">; // column span
  offset?: PrismuiResponsiveValue<number>; // column offset
  order?: PrismuiResponsiveValue<number>; // flex order
}
```

**CSS Variables:** `--grid-justify`, `--grid-align`, `--grid-overflow` (Grid), responsive `--col-span-*`, `--col-offset-*` (GridCol)
**Styles Names:** Grid: `root`, `inner`; GridCol: `col`
**Static Components:** `Grid.Col`

**Implementation notes:**

- Grid provides context to Grid.Col via `GridProvider`
- Responsive column spans use `resolveResponsiveVars` (from Stage-2 Stack)
- `GridVariables` component generates responsive CSS for gutter/span/offset

**Files:**

- `components/Grid/Grid.tsx`, `Grid.module.css`, `Grid.context.ts`, `GridVariables.tsx`
- `components/Grid/GridCol/GridCol.tsx`, `GridCol.module.css`, `GridColVariables.tsx`
- `components/Grid/Grid.test.tsx`, `Grid.stories.tsx`, `index.ts`

**Tests:** ~25 tests

### C Phase Acceptance Criteria

- [ ] Container centers content with correct max-width
- [ ] Container `fluid` prop makes it 100% width
- [ ] Group renders horizontal flex layout with correct gap/align/justify
- [ ] Group `grow` distributes children evenly
- [ ] Grid renders 12-column layout
- [ ] Grid.Col `span` controls column width
- [ ] Grid supports responsive gutter and column spans
- [ ] All tests pass, tsc clean

---

## 7. Phase D: Button System

### D1: Button

**Goal:** The primary interactive component. Polymorphic, variant-driven, with loading state and icon sections.

**Props:**

```typescript
export interface ButtonProps extends BoxProps, StylesApiProps<ButtonFactory> {
  size?: PrismuiSize | `compact-${PrismuiSize}` | (string & {});
  color?: string; // theme color or CSS
  variant?: ButtonVariant; // @default 'solid'
  justify?: React.CSSProperties["justifyContent"]; // inner content alignment
  leftSection?: React.ReactNode;
  rightSection?: React.ReactNode;
  fullWidth?: boolean;
  radius?: PrismuiRadius;
  disabled?: boolean;
  loading?: boolean;
  loaderProps?: LoaderProps; // future: Loader component
  autoContrast?: boolean;
  children?: React.ReactNode;
}

export type ButtonVariant = PrismuiVariantKey;
// Built-in: 'solid' | 'soft' | 'outlined' | 'plain'
// Extensible via PrismuiThemeVariantsOverride
```

**CSS Variables:**

```
--button-justify, --button-height, --button-padding-x, --button-fz,
--button-radius, --button-bg, --button-hover, --button-hover-color,
--button-color, --button-bd
```

**Styles Names:** `root`, `inner`, `section`, `label`, `loader`

**Key behaviors:**

- Extends `ButtonBase` (inherits ripple, polymorphic, keyboard accessibility)
- Uses `variantColorResolver` to compute color CSS variables
- `loading` state: disables interaction, shows loader overlay (simplified — no Transition component initially, use CSS opacity)
- `compact-{size}` reduces height/padding
- `leftSection` / `rightSection` for icons

**Factory:** `PolymorphicFactory` (renders as `<button>` by default, can be `<a>`, etc.)

**Files:**

- `components/Button/Button.tsx`, `Button.module.css`, `Button.test.tsx`, `Button.stories.tsx`

**Tests:** ~30 tests

### D2: Button.Group

**Goal:** Group buttons together with shared border radius (first/last child rounding).

**Props:**

```typescript
export interface ButtonGroupProps
  extends BoxProps, StylesApiProps<ButtonGroupFactory>, ElementProps<"div"> {
  orientation?: "horizontal" | "vertical"; // @default 'horizontal'
}
```

**CSS Variables:** `--group-orientation`
**Styles Names:** `group`

**Key behaviors:**

- Uses CSS `> :not(:first-child):not(:last-child) { border-radius: 0 }` pattern
- Provides context to child Buttons for border handling
- Horizontal: removes right border of non-last children
- Vertical: removes bottom border of non-last children

**Files:**

- `components/Button/ButtonGroup/ButtonGroup.tsx`, `ButtonGroup.module.css`, `ButtonGroup.test.tsx`

**Tests:** ~12 tests

### D Phase Acceptance Criteria

- [ ] Button renders with correct variant colors via `variantColorResolver`
- [ ] Button supports all 4 variants (solid/soft/outlined/plain) with correct visual output
- [ ] Button `loading` state disables interaction and shows loader
- [ ] Button `leftSection` / `rightSection` render correctly
- [ ] Button inherits ripple from ButtonBase
- [ ] Button is polymorphic (`component="a"` works)
- [ ] Button.Group groups buttons with shared border radius
- [ ] All tests pass, tsc clean

---

## 8. Dependency Graph

```
Phase A: Advanced Theming
  A1: variantColorResolver
  A2: getThemeColor ← used by A1
  A3: getSize / getFontSize
  A4: Headless mode (independent)
    ↓
Phase B: Utility Components (depends on A2 for Divider color)
  B1: Portal (independent — no styles)
  B2: Divider (depends on A2: getThemeColor)
    ↓
Phase C: Layout Components (independent of A1, but benefits from A3)
  C1: Container (depends on A3: getSize)
  C2: Group (uses getSpacing, independent)
  C3: Grid + Grid.Col (uses resolveResponsiveVars from Stage-2)
    ↓
Phase D: Button System (depends on A1: variantColorResolver + A3: getSize/getFontSize)
  D1: Button (depends on A1, A3, ButtonBase)
  D2: Button.Group (depends on D1)
```

**Critical path:** A1 → A2 → D1 → D2

**Parallelizable:**

- A4 (Headless) can be done anytime
- B1 (Portal) is fully independent
- C1/C2/C3 can proceed in parallel with A1 (they don't need variantColorResolver)

---

## 9. Testing Strategy

### Layer 1: Theme Infrastructure (~50 tests)

```typescript
describe("variantColorResolver", () => {
  it("solid variant returns correct bg/color/hover");
  it("soft variant returns semi-transparent background");
  it("outlined variant returns transparent bg with colored border");
  it("plain variant returns transparent bg with hover feedback");
  it("neutral color produces default-style button");
  it("custom color key resolves via getThemeColor");
  it("raw CSS color passes through");
  it("autoContrast overrides text color");
  // ... per variant × light/dark scheme
});

describe("getThemeColor", () => {
  it("resolves semantic key to CSS variable");
  it("resolves color family key to CSS variable");
  it("resolves color.shade notation");
  it("passes through hex colors");
  it("passes through rgb/hsl colors");
});

describe("getSize / getFontSize", () => {
  it("resolves named size to CSS variable");
  it("converts number to rem");
  it("returns undefined for undefined");
});

describe("headless mode", () => {
  it("useIsHeadless returns false by default");
  it("useIsHeadless returns true inside headless provider");
  it("useStyles skips CSS module classes in headless mode");
  it("static class names preserved in headless mode");
});
```

### Layer 2: Component Tests (~100 tests)

| Component       | Estimated Tests |
| --------------- | --------------- |
| Portal          | ~10             |
| Divider         | ~15             |
| Container       | ~12             |
| Group           | ~18             |
| Grid + Grid.Col | ~25             |
| Button          | ~30             |
| Button.Group    | ~12             |

### Test Count Target

| Category                     | Estimated    | Actual |
| ---------------------------- | ------------ | ------ |
| Theme infrastructure (A1-A4) | 40-50        | 87     |
| Portal                       | 8-12         | 26     |
| Divider                      | 12-18        | 36     |
| Container                    | 10-15        |        |
| Group                        | 15-20        |        |
| Grid + Grid.Col              | 20-30        |        |
| Button                       | 25-35        |        |
| Button.Group                 | 10-15        |        |
| **Total (new)**              | **~140-195** |        |

---

## 10. Estimated Timeline

| Phase                        | Duration     | Cumulative     |
| ---------------------------- | ------------ | -------------- |
| A1: variantColorResolver     | 2-3 sessions | 2-3 sessions   |
| A2: getThemeColor            | 1 session    | 3-4 sessions   |
| A3: getSize / getFontSize    | 1 session    | 4-5 sessions   |
| A4: Headless mode            | 1 session    | 5-6 sessions   |
| B1: Portal                   | 1 session    | 6-7 sessions   |
| B2: Divider                  | 1 session    | 7-8 sessions   |
| C1: Container                | 1 session    | 8-9 sessions   |
| C2: Group                    | 1-2 sessions | 9-11 sessions  |
| C3: Grid + Grid.Col          | 2-3 sessions | 11-14 sessions |
| D1: Button                   | 2-3 sessions | 13-17 sessions |
| D2: Button.Group             | 1 session    | 14-18 sessions |
| Documentation + verification | 1 session    | 15-19 sessions |

**Estimated total: 15-19 sessions**

---

## 11. Risks

| Risk                                                      | Likelihood | Impact | Mitigation                                                             |
| --------------------------------------------------------- | ---------- | ------ | ---------------------------------------------------------------------- |
| variantColorResolver complexity (dark mode, autoContrast) | Medium     | High   | Only 4 variants (solid/soft/outlined/plain), start with solid/outlined |
| Grid responsive CSS generation complexity                 | Medium     | Medium | Reuse `resolveResponsiveVars` from Stack                               |
| Button loading state needs Transition component           | Low        | Medium | Use simple CSS opacity initially, add Transition later                 |
| Type complexity with polymorphic Button + variants        | Medium     | Medium | Follow ButtonBase pattern, test types early                            |
| Portal SSR hydration issues                               | Low        | Medium | Render null on server, mount on client only                            |

---

## 12. Non-Goals (Explicitly Deferred to Stage-4+)

- **Text component** — Typography component for styled text
- **Loader component** — Standalone loading indicator (Button uses simplified inline loader)
- **Transition component** — Animation wrapper (Button loading uses CSS-only approach)
- **Gradient variant** — `variant="gradient"` for Button (requires gradient infrastructure)
- **Input components** — TextInput, Select, etc.
- **Feedback components** — Alert, Toast, Notification
- **Documentation site** — Public-facing docs
- **CSS-in-JS integration** — No Emotion/styled-components
- **Theme Presets / Theme Creator UI** — 见下方"未来考虑"

### 未来考虑：可视化主题配置器 (Theme Creator)

> 参考：shadcn/ui `/create` 页面 — 用户可选择 style 预设、base color、theme color、font、radius 等，实时预览所有组件效果，导出 CSS 变量配置。
>
> **PrismUI 的目标**：提供类似能力，但更符合 MUI 的结构化 palette 体系 + PrismUI 的 CSS 变量架构。具体包括：
>
> 1. **Theme Presets（预设主题包）** — 一键切换整套视觉风格（颜色、圆角、字体、间距）
> 2. **可视化 Theme Creator** — 交互式配置页面，实时预览，导出 `createTheme()` 配置
> 3. **组件级深度定制** — 类似 MUI `theme.components.MuiButton.styleOverrides`（Stage-2 已有 `theme.components.Button.classNames/styles/vars` 基础）
>
> **阶段归属**：需要绝大部分核心组件完成后才有意义（实时预览需要 Button、Input、Card、Alert 等全部就绪）。暂不确定具体阶段，待 Stage-4 组件完成后再评估。预计 Stage-5 或更后。
>
> **与现有架构的关系**：
>
> - Stage-1 的 `createTheme()` + CSS 变量生成 → 提供数据基础
> - Stage-3 的 `variantColorResolver` → 提供 variant 颜色定制能力
> - Stage-4 的 Documentation Site → 提供承载 Theme Creator UI 的平台

---

## 13. Relationship to Other Stages

```
Stage-1 (Complete)     Stage-2 (Complete)       Stage-3 (This Stage)        Stage-4 (Future)
─────────────────      ────────────────────     ────────────────────        ────────────────
Provider               Factory System           variantColorResolver        Text
Theme + CSS Vars  →    useProps            →    getThemeColor          →    Feedback Components
SystemProps            Styles API               Headless Mode               Input Components
Box (basic)            CSS Modules              Container, Divider          Documentation Site
                       Box (refactored)         Group, Grid                 Loader, Transition
                       Stack                    Portal                      Gradient variant
                       ButtonBase               Button + Button.Group
                       Paper
```

---

## 14. Stage-3 Overall Acceptance Criteria

| Criteria                                                                                      | Status |
| --------------------------------------------------------------------------------------------- | ------ |
| `variantColorResolver` resolves all 4 built-in variants (solid/soft/outlined/plain) correctly | ✅     |
| `variantColorResolver` is customizable via `createTheme()`                                    | ✅     |
| `getThemeColor` resolves theme keys and CSS passthrough                                       | ✅     |
| `getSize` / `getFontSize` resolve tokens to CSS variables                                     | ✅     |
| Headless mode disables CSS Module classes via provider                                        | ✅     |
| Portal renders children outside parent DOM tree, SSR-safe                                     | ✅     |
| Divider renders horizontal/vertical with label support                                        | ✅     |
| Container centers content with responsive max-width                                           |        |
| Group renders horizontal flex layout with gap/grow                                            |        |
| Grid + Grid.Col renders 12-column responsive layout                                           |        |
| Button renders with variant colors, loading, sections                                         | ✅     |
| Button inherits ripple from ButtonBase                                                        | ✅     |
| Button.Group groups buttons with shared border radius                                         |        |
| All components support `classNames`, `styles`, `unstyled`                                     |        |
| Test count ≥ 140 (new tests)                                                                  |        |
| All Storybook stories render correctly                                                        |        |
| Zero TypeScript compilation errors (excluding pre-existing TS6133)                            |        |
| Zero known regressions in Stage-1/Stage-2                                                     |        |

---

## 15. Stage-3 Final Statistics (Template)

> _Stage-3 完成后填写_

| Metric                     | Value |
| -------------------------- | ----- |
| Infrastructure files (new) |       |
| Component files (new)      |       |
| CSS Module files (new)     |       |
| Test files (new)           |       |
| Total new tests            |       |
| Total tests (cumulative)   |       |
| Storybook stories (new)    |       |
| Public API functions (new) |       |
| Public API types (new)     |       |

---

## 16. Implementation Notes (Template)

> _各 Phase 完成后填写_

### Phase A: Advanced Theming ✅

<details>
<summary>A1: variantColorResolver — 33 tests, 8 stories</summary>

**New files:**

- `core/theme/variant-color-resolver/variant-color-resolver.ts` — types: `VariantColorResolverInput`, `VariantColorsResult`, `VariantColorResolver`
- `core/theme/variant-color-resolver/default-variant-colors-resolver.ts` — 4 variants × 5 color types implementation
- `core/theme/variant-color-resolver/index.ts` — barrel exports
- `core/theme/variant-color-resolver/default-variant-colors-resolver.test.ts` — 33 tests
- `core/theme/variant-color-resolver/variant-color-resolver.stories.tsx` — 8 stories

**Modified files:**

- `core/theme/types/palette.ts` — `PrismuiPaletteCommon.blackChannel/whiteChannel`, `PrismuiVariantOpacity` interface, `PrismuiPalette.variantOpacity`
- `core/theme/types/theme.ts` — `PrismuiTheme.variantColorResolver` field
- `core/theme/types/index.ts` — export `PrismuiVariantOpacity`
- `core/theme/default-theme.ts` — default opacity values (light+dark) + `variantColorResolver: defaultVariantColorsResolver`
- `core/theme/index.ts` — exports for variant-color-resolver
- `core/css-vars/palette-vars.ts` — generates `--prismui-common-blackChannel`, `--prismui-common-whiteChannel`, `--prismui-color-gray-500Channel`, `--prismui-opacity-*` variables

**Key decisions:**

- 不使用 `--prismui-shared-*` 变量，改用 opacity + channel 组合
- `inherit` = CSS inherit, `neutral` = 标准语义色路径
- `color-mix(in srgb, ...)` 用于 black/white/outlined; `rgba(channel / opacity)` 用于 semantic/colorFamily
- `VariantColorsResult` 扩展为 7 个字段（background, color, border, hoverBackground, hoverColor, hoverBorder, hoverShadow）

</details>

<details>
<summary>A2: getThemeColor — 32 tests</summary>

**New files:**

- `core/theme/get-theme-color.ts` — 6 级解析优先级（palette tokens → semantic+field → family+shade → semantic key → family bare → CSS passthrough）
- `core/theme/get-theme-color.test.ts` — 32 tests

**Key decisions:**

- Palette tokens（`text.primary`, `background.paper` 等）优先于 semantic color 解析，避免歧义
- Color family bare name（如 `'blue'`）使用 `primaryShade.light` 作为默认 shade index
- 函数签名 `(color: string | undefined, theme: PrismuiTheme) => string | undefined`

</details>

<details>
<summary>A3: getSize / getFontSize — 22 tests</summary>

**New files:**

- `core/theme/get-size.ts` — generic size resolver, named keys → `var(--{prefix}-{key})`, number/string → `rem()`
- `core/theme/get-font-size.ts` — font-size specific, named keys → `var(--prismui-font-size-{key})`
- `core/theme/get-size.test.ts` — 11 tests
- `core/theme/get-font-size.test.ts` — 11 tests

**Key decisions:**

- `getSize` 接受 configurable prefix（组件级 CSS 变量如 `--button-height-md`）
- `getFontSize` 使用固定 prefix `--prismui-font-size-`
- 与 `getRadius`/`getShadow` 保持一致的 API 模式
- 不实现 `getSpacing` — 已有 `spacingResolver` 覆盖

</details>

<details>
<summary>A4: Headless Mode — provider integration</summary>

**Modified files:**

- `core/PrismuiProvider/prismui-theme-context.ts` — `PrismuiThemeContextValue.headless` field + `useIsHeadless(unstyled?)` hook
- `core/PrismuiProvider/PrismuiThemeProvider.tsx` — `headless` prop (default `false`)
- `core/PrismuiProvider/PrismuiProvider.tsx` — `headless` prop, passes to ThemeProvider
- `core/PrismuiProvider/index.ts` — exports `useIsHeadless`

**Key decisions:**

- 不创建单独的 `headless-context.ts`，直接集成到 `PrismuiThemeContextValue`
- `useIsHeadless(unstyled?)` 合并 provider-level `headless` 和 component-level `unstyled`
- 现有 `useStyles` 的 `unstyled` 参数已处理 CSS Module 类跳过逻辑，无需修改

**Phase A 总计：** 87 new tests, 497 total, 8 Storybook stories, tsc --noEmit clean, zero regressions

</details>

### Phase B: Utility Components

<details>
<summary>B1: Portal — 26 tests, 9 stories</summary>

**New files:**

- `components/Portal/Portal.tsx` — Portal component (forwardRef, useIsomorphicLayoutEffect)
- `components/Portal/OptionalPortal.tsx` — OptionalPortal convenience wrapper
- `components/Portal/Portal.test.tsx` — 26 tests
- `components/Portal/Portal.stories.tsx` — 9 stories
- `components/Portal/index.ts` — barrel exports (Portal, OptionalPortal, types)

**Key decisions:**

- 结合 MUI 和 Mantine 设计：`disablePortal` (MUI) + `reuseTargetNode` (Mantine) + `target` callback (MUI)
- 使用 `React.forwardRef` 而非 factory — Portal 是纯逻辑组件，无样式
- `useIsomorphicLayoutEffect` 确保 portal node 在同一渲染周期内同步解析（解决 jsdom 测试中的时序问题）
- 创建的 portal node 带 `data-portal="true"` 属性（Mantine 模式）
- 共享节点带 `data-prismui-portal-node` 属性，不在 unmount 时移除
- 独立节点（`reuseTargetNode=false`）在 unmount 时自动清理
- `className`/`style`/`id` 仅应用于 Portal 创建的节点，不影响显式 target

</details>

<details>
<summary>B2: Divider — 36 tests, 11 stories</summary>

**New files:**

- `components/Divider/Divider.tsx` — factory-based component with varsResolver
- `components/Divider/Divider.module.css` — CSS Module with size tokens, orientation, variant (inset/middle), label pseudo-elements
- `components/Divider/Divider.test.tsx` — 36 tests
- `components/Divider/Divider.stories.tsx` — 11 stories
- `components/Divider/index.ts` — barrel exports

**Key decisions:**

- 默认颜色 `rgba(var(--prismui-color-gray-500Channel) / 0.2)` — 即 `rgba(145 158 171 / 20%)`，在 CSS Module 中定义
- 结合 MUI 和 Mantine：`variant` (fullWidth/inset/middle) + `flexItem` + `textAlign` 来自 MUI；`label`/`labelPosition`/`borderStyle`/`size` tokens 来自 Mantine
- `labelPosition` 优先于 `textAlign`（两者都设置时）
- Label 仅在 `orientation="horizontal"` 时渲染
- `borderStyle` 替代 Mantine 的 `variant` 用于线条样式（solid/dashed/dotted），因为 `variant` 已用于 MUI 的 inset/middle
- 使用 `aria-orientation` 提升无障碍性
- `data-with-label` 属性控制 border 移除（label 模式用 ::before/::after 伪元素绘制线条）

</details>

### Phase C: Layout Components

<details>
<summary>C1: Container</summary>

_Implementation notes will be filled after completion._

</details>

<details>
<summary>C2: Group</summary>

_Implementation notes will be filled after completion._

</details>

<details>
<summary>C3: Grid + Grid.Col</summary>

_Implementation notes will be filled after completion._

</details>

### Phase D: Button System

<details>
<summary>D1: Button</summary>

_Implementation notes will be filled after completion._

</details>

<details>
<summary>D2: Button.Group</summary>

_Implementation notes will be filled after completion._

</details>

---

## 17. References

- Mantine Button: `@mantine/core/src/components/Button/`
- Mantine Container: `@mantine/core/src/components/Container/`
- Mantine Divider: `@mantine/core/src/components/Divider/`
- Mantine Group: `@mantine/core/src/components/Group/`
- Mantine Grid: `@mantine/core/src/components/Grid/`
- Mantine Portal: `@mantine/core/src/components/Portal/`
- ADR-008: Variant Styling Strategy
- PrismUI Stage-1: `devdocs/stages/STAGE-001-SUMMARY.md`
- PrismUI Stage-2: `devdocs/stages/STAGE-002-Component-Factory.md`
