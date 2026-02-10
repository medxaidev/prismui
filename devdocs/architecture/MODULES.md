# MODULES (Enforceable)

**Status:** Active  
**Version:** v2.0  
**Last Updated:** 2026-02-10  
**Scope:** Defines all modules and components in PrismUI

---

## 1. Package Structure

PrismUI is a **monorepo with a single core package**. All core infrastructure, components, and utilities live in `@prismui/core`. Separate packages are created only when a clear boundary exists (e.g., Next.js integration).

```
packages/
├── core/                   # @prismui/core — all core infrastructure and components
│   └── src/
│       ├── core/           # Infrastructure (non-component)
│       │   ├── PrismuiProvider/    # Provider, theme context, hooks
│       │   ├── theme/              # Theme types, defaultTheme, createTheme
│       │   ├── css-vars/           # CSS variable generation (ThemeVars, palette-vars)
│       │   ├── css-baseline/       # CSS reset/baseline
│       │   ├── style-engine/       # insertCssOnce, StyleRegistry, SSR support
│       │   ├── system/             # SystemProps (config, resolvers, split)
│       │   ├── factory/            # [Stage-2] Component factory system
│       │   ├── styles-api/         # [Stage-2] useStyles, getClassName, getStyle
│       │   ├── types/              # Polymorphic types, style prop types
│       │   ├── color-functions/    # Color parsing utilities
│       │   └── index.ts            # Core barrel export
│       ├── components/     # All components
│       │   ├── Box/                # [Stage-1] Base polymorphic component
│       │   ├── Stack/              # [Stage-2] Vertical layout
│       │   ├── ButtonBase/         # [Stage-2] Unstyled accessible button
│       │   ├── Paper/              # [Stage-2] Elevated container
│       │   └── Button/             # [Stage-2] Styled button
│       └── index.ts        # Public API barrel export
└── nextjs/                 # @prismui/nextjs — Next.js App Router integration (future)
```

---

## 2. Core Infrastructure Modules (`core/`)

### 2.1 Stage-1 Modules (Complete)

| Module               | Responsibility                     | Key Exports                                                                                         |
| -------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------- |
| `PrismuiProvider/`   | Theme context, color scheme, hooks | `PrismuiProvider`, `PrismuiThemeProvider`, `usePrismuiTheme`, `usePrismuiContext`, `useColorScheme` |
| `theme/`             | Theme types, defaults, factory     | `PrismuiTheme`, `defaultTheme`, `createTheme`                                                       |
| `css-vars/`          | CSS variable generation            | `ThemeVars`, `getPrismuiCssVariables`, `getPaletteVars`                                             |
| `css-baseline/`      | CSS reset                          | `CssBaseline`, `BASELINE_CSS`                                                                       |
| `style-engine/`      | Runtime CSS injection              | `insertCssOnce`, `createStyleRegistry`, `StyleRegistryProvider`                                     |
| `system/`            | SystemProps resolution             | `SystemProps`, `splitSystemProps`, `resolveSystemProps`, `SYSTEM_CONFIG`                            |
| `types/polymorphic/` | Polymorphic component types        | `PolymorphicComponentProps`, `PolymorphicRef`, `createPolymorphicComponent`                         |
| `color-functions/`   | Color parsing                      | `getColorChannels`                                                                                  |

### 2.2 Stage-2 Modules (Planned)

| Module        | Responsibility                   | Key Exports                                                                         |
| ------------- | -------------------------------- | ----------------------------------------------------------------------------------- |
| `factory/`    | Component creation pipeline      | `factory`, `polymorphicFactory`, `useProps`, `FactoryPayload`, `PolymorphicFactory` |
| `styles-api/` | Multi-source style orchestration | `useStyles`, `createVarsResolver`, `StylesApiProps`, `ClassNames`, `Styles`         |

**Note:** Stage-2 `factory/` will **replace** `types/polymorphic/createPolymorphicComponent`. The polymorphic type definitions (`PolymorphicComponentProps`, `PolymorphicRef`) remain but are consumed by the factory system.

---

## 3. Components

### 3.1 Stage-1 Components (Complete)

| Component | Type       | Description                                                                                                                              |
| --------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Box**   | Foundation | Polymorphic base component. All components render through Box. Supports `component`, `renderRoot`, `mod`, `variant`/`size`, SystemProps. |

### 3.2 Stage-2 Components (Planned)

| Component      | Type        | Base       | Description                                               |
| -------------- | ----------- | ---------- | --------------------------------------------------------- |
| **Stack**      | Layout      | Box        | Vertical flex layout with gap, align, justify             |
| **ButtonBase** | Base        | Box        | Unstyled accessible button (keyboard, ARIA, polymorphic)  |
| **Paper**      | Container   | Box        | Elevated container with shadow via CSS variables          |
| **Button**     | Interactive | ButtonBase | Full-featured button (variants, sizes, loading, sections) |

### 3.3 Stage-3+ Components (Planned)

| Component    | Stage | Base      |
| ------------ | ----- | --------- |
| Text         | 3     | Box       |
| Group        | 3     | Box       |
| Grid         | 3     | Box       |
| Container    | 3     | Box       |
| InputBase    | 4     | Box       |
| TextInput    | 4     | InputBase |
| Select       | 4     | InputBase |
| Checkbox     | 4     | Box       |
| Radio        | 4     | Box       |
| ModalBase    | 5     | Box       |
| Modal        | 5     | ModalBase |
| Alert        | 5     | Box       |
| Notification | 5     | Box       |

---

## 4. Component Creation Pattern (Stage-2+)

Every component follows the same creation pipeline:

```tsx
// 1. Define Factory type
export type ButtonFactory = PolymorphicFactory<{
  props: ButtonProps;
  defaultRef: HTMLButtonElement;
  defaultComponent: "button";
  stylesNames: ButtonStylesNames;
  vars: ButtonCssVariables;
  variant: ButtonVariant;
  staticComponents: { Group: typeof ButtonGroup };
}>;

// 2. Create with polymorphicFactory
export const Button = polymorphicFactory<ButtonFactory>((_props, ref) => {
  // 3. Merge props (default < theme < user)
  const props = useProps("Button", defaultProps, _props);

  // 4. Resolve styles (CSS Modules + theme + user overrides)
  const getStyles = useStyles<ButtonFactory>({
    name: "Button",
    props,
    classes, // from Button.module.css
    className,
    style,
    classNames,
    styles,
    unstyled,
    vars,
    varsResolver,
  });

  // 5. Render through Box (or ButtonBase)
  return (
    <ButtonBase
      ref={ref}
      {...getStyles("root")}
      variant={variant}
      mod={[{ loading, disabled }]}
      {...others}
    >
      <span {...getStyles("inner")}>
        <span {...getStyles("label")}>{children}</span>
      </span>
    </ButtonBase>
  );
});

// 6. Attach static properties
Button.classes = classes;
Button.displayName = "@prismui/core/Button";
```

---

## 5. Dependency Rules (ENFORCED)

### Internal dependency direction (strict one-way)

```
components/ → core/factory/ → core/styles-api/ → core/PrismuiProvider/ → core/theme/
                                                → core/style-engine/
                                                → core/system/
```

- Components **depend on** factory and styles-api
- Factory **depends on** PrismuiProvider (for useProps → theme.components)
- Styles-api **depends on** PrismuiProvider (for usePrismuiTheme)
- Style-engine is **independent** (no React dependencies in core logic)
- Theme types are **independent** (pure TypeScript, no React)

### Cross-package rules

- `@prismui/core` has NO external package dependencies beyond React and `clsx`
- `@prismui/nextjs` depends on `@prismui/core` only
- Circular dependencies are **FORBIDDEN**

---

## 6. Module Allowlist by Stage

| Stage        | Allowed Infrastructure                                                            | Allowed Components                                                      |
| ------------ | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| 1 (Complete) | Provider, Theme, CSS Vars, Baseline, Style Engine, SystemProps, Polymorphic Types | Box                                                                     |
| 2 (Next)     | Factory, Styles API, CSS Modules                                                  | Stack, ButtonBase, Paper, Button                                        |
| 3            | —                                                                                 | Text, Group, Grid, Container, Flex                                      |
| 4            | —                                                                                 | InputBase, TextInput, Textarea, Select, Checkbox, Radio, Switch         |
| 5            | —                                                                                 | ModalBase, Modal, Drawer, Alert, Notification, Loader, Tooltip, Popover |
| 6            | —                                                                                 | DataTable, Calendar, DatePicker (on-demand)                             |

**Modules not in the current stage's allowlist MUST NOT be created.**
