# STAGE-003: Advanced Theming & Layout Components

> **Status:** Not Started
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

| Dependency | Source | Status |
|---|---|---|
| `factory()` / `polymorphicFactory()` | Stage-2 Phase A | ✅ |
| `useProps()` | Stage-2 Phase B | ✅ |
| `useStyles()` / `createVarsResolver()` | Stage-2 Phase C | ✅ |
| CSS Modules + PostCSS | Stage-2 Phase D | ✅ |
| Box (refactored) | Stage-2 Phase E | ✅ |
| Stack, ButtonBase, Paper | Stage-2 Phase F | ✅ |
| `getRadius()` / `getShadow()` | Stage-2 Phase F3 | ✅ |
| Theme CSS variables (`--prismui-*`) | Stage-1 | ✅ |
| ADR-008: Variant Styling Strategy | Stage-2 | ✅ |

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

### A1: variantColorResolver

**Goal:** Provide a theme-level function that resolves `(variant, color, theme)` → `{ background, hover, hoverColor, color, border }` CSS values. This is the core mechanism for color-variant components.

**Design (aligned with Mantine + ADR-008):**

```typescript
export interface VariantColorResolverInput {
  color: string;           // theme color key or CSS color
  theme: PrismuiTheme;
  variant: string;         // 'filled' | 'light' | 'outline' | 'subtle' | 'transparent' | 'default' | 'white'
  gradient?: PrismuiGradient;
  autoContrast?: boolean;
}

export interface VariantColorsResult {
  background: string;
  hover: string;
  hoverColor: string;
  color: string;
  border: string;
}

export type VariantColorResolver = (input: VariantColorResolverInput) => VariantColorsResult;
```

**`defaultVariantColorsResolver`** — built-in implementation:

| Variant | Background | Color | Border | Hover |
|---|---|---|---|---|
| `filled` | `--{color}-main` | contrastText | transparent | `--{color}-dark` |
| `light` | `--{color}-lighter` (0.1 alpha) | `--{color}-dark` | transparent | `--{color}-lighter` (0.15 alpha) |
| `outline` | transparent | `--{color}-main` | `--{color}-main` | `--{color}-lighter` (0.05 alpha) |
| `subtle` | transparent | `--{color}-main` | transparent | `--{color}-lighter` (0.1 alpha) |
| `transparent` | transparent | `--{color}-main` | transparent | transparent |
| `default` | `--background-default` | `--text-primary` | `--divider` | `--action-hover` |
| `white` | white | `--{color}-dark` | transparent | darken(white, 0.01) |

**Theme integration:**

```typescript
// In PrismuiTheme
export interface PrismuiTheme {
  // ... existing fields
  variantColorResolver: VariantColorResolver;
}
```

**Files:**
- `core/theme/variant-color-resolver/variant-color-resolver.ts`
- `core/theme/variant-color-resolver/default-variant-colors-resolver.ts`
- `core/theme/variant-color-resolver/index.ts`

**Tests:** ~20 tests (each variant × light/dark, custom color, gradient, autoContrast)

### A2: getThemeColor

**Goal:** Resolve a color string to a CSS value. If it's a theme color key (e.g. `'primary'`, `'blue'`), return the corresponding CSS variable. Otherwise, pass through as raw CSS.

```typescript
export function getThemeColor(color: string, theme: PrismuiTheme): string;
// 'primary' → 'var(--prismui-primary-main)'
// 'blue' → 'var(--prismui-color-blue-500)'  (using primaryShade)
// 'blue.300' → 'var(--prismui-color-blue-300)'
// '#ff0000' → '#ff0000'  (passthrough)
// 'rgb(255,0,0)' → 'rgb(255,0,0)'  (passthrough)
```

**Files:** `core/theme/get-theme-color.ts`
**Tests:** ~10 tests

### A3: getSize / getFontSize

**Goal:** Resolve size tokens to CSS variable references, similar to `getRadius`/`getShadow`.

```typescript
// getSize('sm', 'button-height') → 'var(--button-height-sm)'
// getSize(42, 'button-height') → rem(42)
export function getSize(size: unknown, prefix: string): string | undefined;

// getFontSize('sm') → 'var(--prismui-font-size-sm)'
// getFontSize(14) → rem(14)
export function getFontSize(size: unknown): string | undefined;

// getSpacing — already exists as spacingResolver, may need a simpler alias
export function getSpacing(size: unknown): string | undefined;
```

**Files:** `core/theme/get-size.ts`, `core/theme/get-font-size.ts`
**Tests:** ~12 tests

### A4: Headless Mode

**Goal:** Allow entire component trees to render without CSS Module classes. Components already support `unstyled` prop individually; headless mode provides a provider-level toggle.

```typescript
// Context
const HeadlessContext = createContext(false);

export function useIsHeadless(): boolean {
  return useContext(HeadlessContext);
}

// In PrismuiProvider
<PrismuiProvider headless>
  <Button>No styles applied</Button>
</PrismuiProvider>
```

**Integration with `useStyles`:** When `useIsHeadless()` returns `true`, `useStyles` behaves as if `unstyled=true` for all components (skip CSS Module classes, keep static classes for testing).

**Files:**
- `core/PrismuiProvider/headless-context.ts`
- Modify `core/styles-api/use-styles/use-styles.ts`
- Modify `core/PrismuiProvider/PrismuiProvider.tsx`

**Tests:** ~8 tests

### A Phase Acceptance Criteria

- [ ] `defaultVariantColorsResolver` returns correct colors for all 7 variants
- [ ] `variantColorResolver` is configurable via `createTheme({ variantColorResolver })`
- [ ] `getThemeColor` resolves theme keys and passes through CSS values
- [ ] `getSize` / `getFontSize` resolve tokens to CSS variables
- [ ] Headless mode disables all CSS Module classes via provider
- [ ] All tests pass, tsc clean

---

## 5. Phase B: Utility Components

### B1: Portal

**Goal:** Render children into a DOM node outside the parent component tree. Essential for modals, popovers, tooltips, dropdowns.

**Props:**
```typescript
export interface PortalProps {
  children: React.ReactNode;
  /** Target DOM element or CSS selector. Default: new div appended to document.body */
  target?: HTMLElement | string;
  /** Reuse a shared portal node across all Portal instances @default true */
  reuseTargetNode?: boolean;
}
```

**Key behaviors:**
- SSR-safe: renders `null` until mounted (client-side only)
- Uses `createPortal` from `react-dom`
- Shared node: `[data-prismui-portal-node]` attribute
- Cleanup: removes created node on unmount (unless reusing)
- Uses `factory` (not polymorphicFactory) — no styles, just logic

**Files:**
- `components/Portal/Portal.tsx`
- `components/Portal/Portal.test.tsx`
- `components/Portal/index.ts`

**Tests:** ~10 tests (mount, unmount, target, shared node, SSR safety)

### B2: Divider

**Goal:** Visual separator line with optional label. Supports horizontal/vertical orientation.

**Props:**
```typescript
export interface DividerProps extends BoxProps, StylesApiProps<DividerFactory>, ElementProps<'div'> {
  color?: string;                                    // theme color or CSS
  size?: PrismuiSize | number | (string & {});       // border width
  label?: React.ReactNode;                           // center label
  labelPosition?: 'left' | 'center' | 'right';      // label alignment
  orientation?: 'horizontal' | 'vertical';           // direction
}
```

**CSS Variables:** `--divider-color`, `--divider-border-style`, `--divider-size`
**Styles Names:** `root`, `label`
**Variants:** `solid` (default), `dashed`, `dotted`

**Files:**
- `components/Divider/Divider.tsx`, `Divider.module.css`, `Divider.test.tsx`, `Divider.stories.tsx`, `index.ts`

**Tests:** ~15 tests

### B Phase Acceptance Criteria

- [ ] Portal renders children outside parent DOM tree
- [ ] Portal is SSR-safe (no hydration mismatch)
- [ ] Divider renders horizontal/vertical with correct CSS variables
- [ ] Divider label renders with correct positioning
- [ ] All tests pass, tsc clean

---

## 6. Phase C: Layout Components

### C1: Container

**Goal:** Max-width centered container. Simple wrapper with responsive `size` prop.

**Props:**
```typescript
export interface ContainerProps extends BoxProps, StylesApiProps<ContainerFactory>, ElementProps<'div'> {
  size?: PrismuiSize | (string & {}) | number;  // max-width
  fluid?: boolean;                                // 100% width, ignore size
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
export interface GroupProps extends BoxProps, StylesApiProps<GroupFactory>, ElementProps<'div'> {
  justify?: React.CSSProperties['justifyContent'];  // @default 'flex-start'
  align?: React.CSSProperties['alignItems'];         // @default 'center'
  wrap?: React.CSSProperties['flexWrap'];             // @default 'wrap'
  gap?: PrismuiSpacing;                               // @default 'md'
  grow?: boolean;                                      // children flex-grow
  preventGrowOverflow?: boolean;                       // max-width per child @default true
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
export interface GridProps extends BoxProps, StylesApiProps<GridFactory>, ElementProps<'div'> {
  gutter?: PrismuiResponsiveValue<PrismuiSpacing>;  // @default 'md'
  grow?: boolean;                                      // last row fills space
  columns?: number;                                    // @default 12
  justify?: React.CSSProperties['justifyContent'];
  align?: React.CSSProperties['alignItems'];
  overflow?: React.CSSProperties['overflow'];
}
```

**Grid.Col Props:**
```typescript
export interface GridColProps extends BoxProps, StylesApiProps<GridColFactory>, ElementProps<'div'> {
  span?: PrismuiResponsiveValue<number | 'auto' | 'content'>;  // column span
  offset?: PrismuiResponsiveValue<number>;                       // column offset
  order?: PrismuiResponsiveValue<number>;                        // flex order
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
  color?: string;                                    // theme color or CSS
  variant?: ButtonVariant;                           // @default 'filled'
  justify?: React.CSSProperties['justifyContent'];  // inner content alignment
  leftSection?: React.ReactNode;
  rightSection?: React.ReactNode;
  fullWidth?: boolean;
  radius?: PrismuiRadius;
  disabled?: boolean;
  loading?: boolean;
  loaderProps?: LoaderProps;                          // future: Loader component
  autoContrast?: boolean;
  children?: React.ReactNode;
}

export type ButtonVariant =
  | 'filled' | 'light' | 'outline' | 'subtle'
  | 'transparent' | 'white' | 'default';
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
export interface ButtonGroupProps extends BoxProps, StylesApiProps<ButtonGroupFactory>, ElementProps<'div'> {
  orientation?: 'horizontal' | 'vertical';  // @default 'horizontal'
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
- [ ] Button supports all 7 variants with correct visual output
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
describe('variantColorResolver', () => {
  it('filled variant returns correct bg/color/hover');
  it('light variant returns semi-transparent background');
  it('outline variant returns transparent bg with colored border');
  it('subtle variant returns transparent bg');
  it('transparent variant returns all transparent');
  it('default variant uses theme defaults');
  it('white variant returns white bg');
  it('custom color key resolves via getThemeColor');
  it('raw CSS color passes through');
  it('autoContrast overrides text color');
  // ... per variant × light/dark scheme
});

describe('getThemeColor', () => {
  it('resolves semantic key to CSS variable');
  it('resolves color family key to CSS variable');
  it('resolves color.shade notation');
  it('passes through hex colors');
  it('passes through rgb/hsl colors');
});

describe('getSize / getFontSize', () => {
  it('resolves named size to CSS variable');
  it('converts number to rem');
  it('returns undefined for undefined');
});

describe('headless mode', () => {
  it('useIsHeadless returns false by default');
  it('useIsHeadless returns true inside headless provider');
  it('useStyles skips CSS module classes in headless mode');
  it('static class names preserved in headless mode');
});
```

### Layer 2: Component Tests (~100 tests)

| Component | Estimated Tests |
|---|---|
| Portal | ~10 |
| Divider | ~15 |
| Container | ~12 |
| Group | ~18 |
| Grid + Grid.Col | ~25 |
| Button | ~30 |
| Button.Group | ~12 |

### Test Count Target

| Category | Estimated | Actual |
|---|---|---|
| Theme infrastructure (A1-A4) | 40-50 | |
| Portal | 8-12 | |
| Divider | 12-18 | |
| Container | 10-15 | |
| Group | 15-20 | |
| Grid + Grid.Col | 20-30 | |
| Button | 25-35 | |
| Button.Group | 10-15 | |
| **Total (new)** | **~140-195** | |

---

## 10. Estimated Timeline

| Phase | Duration | Cumulative |
|---|---|---|
| A1: variantColorResolver | 2-3 sessions | 2-3 sessions |
| A2: getThemeColor | 1 session | 3-4 sessions |
| A3: getSize / getFontSize | 1 session | 4-5 sessions |
| A4: Headless mode | 1 session | 5-6 sessions |
| B1: Portal | 1 session | 6-7 sessions |
| B2: Divider | 1 session | 7-8 sessions |
| C1: Container | 1 session | 8-9 sessions |
| C2: Group | 1-2 sessions | 9-11 sessions |
| C3: Grid + Grid.Col | 2-3 sessions | 11-14 sessions |
| D1: Button | 2-3 sessions | 13-17 sessions |
| D2: Button.Group | 1 session | 14-18 sessions |
| Documentation + verification | 1 session | 15-19 sessions |

**Estimated total: 15-19 sessions**

---

## 11. Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| variantColorResolver complexity (dark mode, autoContrast) | Medium | High | Start with filled/outline/default, add others incrementally |
| Grid responsive CSS generation complexity | Medium | Medium | Reuse `resolveResponsiveVars` from Stack |
| Button loading state needs Transition component | Low | Medium | Use simple CSS opacity initially, add Transition later |
| Type complexity with polymorphic Button + variants | Medium | Medium | Follow ButtonBase pattern, test types early |
| Portal SSR hydration issues | Low | Medium | Render null on server, mount on client only |

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

| Criteria | Status |
|---|---|
| `variantColorResolver` resolves all 7 built-in variants correctly | |
| `variantColorResolver` is customizable via `createTheme()` | |
| `getThemeColor` resolves theme keys and CSS passthrough | |
| `getSize` / `getFontSize` resolve tokens to CSS variables | |
| Headless mode disables CSS Module classes via provider | |
| Portal renders children outside parent DOM tree, SSR-safe | |
| Divider renders horizontal/vertical with label support | |
| Container centers content with responsive max-width | |
| Group renders horizontal flex layout with gap/grow | |
| Grid + Grid.Col renders 12-column responsive layout | |
| Button renders with variant colors, loading, sections | |
| Button inherits ripple from ButtonBase | |
| Button.Group groups buttons with shared border radius | |
| All components support `classNames`, `styles`, `unstyled` | |
| Test count ≥ 140 (new tests) | |
| All Storybook stories render correctly | |
| Zero TypeScript compilation errors (excluding pre-existing TS6133) | |
| Zero known regressions in Stage-1/Stage-2 | |

---

## 15. Stage-3 Final Statistics (Template)

> _Stage-3 完成后填写_

| Metric | Value |
|---|---|
| Infrastructure files (new) | |
| Component files (new) | |
| CSS Module files (new) | |
| Test files (new) | |
| Total new tests | |
| Total tests (cumulative) | |
| Storybook stories (new) | |
| Public API functions (new) | |
| Public API types (new) | |

---

## 16. Implementation Notes (Template)

> _各 Phase 完成后填写_

### Phase A: Advanced Theming

<details>
<summary>A1: variantColorResolver</summary>

_Implementation notes will be filled after completion._

</details>

<details>
<summary>A2: getThemeColor</summary>

_Implementation notes will be filled after completion._

</details>

<details>
<summary>A3: getSize / getFontSize</summary>

_Implementation notes will be filled after completion._

</details>

<details>
<summary>A4: Headless Mode</summary>

_Implementation notes will be filled after completion._

</details>

### Phase B: Utility Components

<details>
<summary>B1: Portal</summary>

_Implementation notes will be filled after completion._

</details>

<details>
<summary>B2: Divider</summary>

_Implementation notes will be filled after completion._

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
