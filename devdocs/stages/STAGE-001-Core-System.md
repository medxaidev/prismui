# STAGE-001: Core System

> **Status:** In Progress  
> **Start Date:** 2026-02-04  
> **Target Completion:** TBD  
> **Owner:** Development Team

---

## Goal

Establish the foundational architecture and theming system for Prismui, implementing core components and polymorphic component patterns.

---

## Success Criteria

- [ ] Theme can be customized and switched at runtime
- [ ] Components render correctly with SSR (Next.js App Router)
- [ ] All components meet WCAG 2.1 Level AA standards
- [ ] Full TypeScript type support and autocomplete
- [ ] All components have comprehensive test coverage
- [ ] Documentation and usage examples are complete

---

## Phase 1: Polymorphic Foundation (CORE)

**Goal:** Establish the polymorphic component pattern - the foundation of Mantine/MUI architecture.

**Why This First?**

- Polymorphic components are THE core architectural pattern
- Box is the base for all other components
- Must validate TypeScript polymorphic types work correctly
- No theme, no styleProps - just pure polymorphism

---

### Phase 1 Scope

**In scope:**

- Monorepo/workspace setup minimal enough to build and consume `@prismui/core`
- Polymorphic type system (prop inference driven by `component`)
- `Box` component implementation with correct prop passthrough and ref forwarding
- Tests:
  - Runtime tests (render output, prop passthrough, ref)
  - Type-level tests (valid/invalid prop combinations via `@ts-expect-error`)

**Out of scope (explicit non-goals):**

- Theme system (no providers, no context, no CSS variables, no SSR style injection)
- Style props system (`p`, `m`, `bg`, `c`, etc.) and any resolver/parser logic
- Building real UI components (Button/Text/etc.)
- Enforcing design-system constraints that depend on Theme/Styles (will be enforced in later phases)

---

### Package Boundaries (Phase 1 Decision)

**Decision:** Phase 1 will implement polymorphic types **inside** `@prismui/core`.

- We will **not** create `@prismui/types` in Phase 1.
- Rationale: polymorphic typing is part of the component foundation; splitting it into a separate package adds versioning/exports complexity without Phase 1 benefits.
- Revisit: introduce `@prismui/types` only when multiple packages have stable shared types that must be versioned independently.

---

### Phase 1 Milestones & Acceptance Gates

- **Milestone A (Buildable Core):** `@prismui/core` builds and can be imported in a React/Next.js app.
- **Milestone B (Type System Proven):** TypeScript infers element-specific props via `component` and rejects invalid combinations.
- **Milestone C (Box Runtime Proven):** Box renders correct element, passes native props, and forwards refs.
- **Milestone D (Validation Gate):** The Phase 1 validation checklist passes and documentation is updated/frozen for Phase 1.

---

### 1.1 Setup @prismui/core Package Structure

**Task List:**

- [ ] Initialize monorepo structure (pnpm workspace or Turborepo)
- [ ] Create @prismui/core package
- [ ] Configure TypeScript (tsconfig.json)
- [ ] Setup build tooling (tsup or rollup)
- [ ] Configure package.json exports

**Package Structure:**

```
packages/
└── core/
    ├── src/
    │   ├── Box/
    │   │   ├── Box.tsx
    │   │   ├── Box.types.ts
    │   │   └── index.ts
    │   └── index.ts
    ├── package.json
    └── tsconfig.json
```

**Completion Criteria:**

- Package builds successfully
- TypeScript compiles without errors
- Can import from @prismui/core

---

### 1.2 Implement Polymorphic Type System

**Task List:**

- [ ] Define polymorphic component types in Box.types.ts
- [ ] Implement type utilities for component prop inference
- [ ] Add JSDoc documentation

**Core Type Implementation:**

```typescript
// src/Box/Box.types.ts
import { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

/**
 * Polymorphic component props that allow rendering as different elements
 */
export type PolymorphicComponentProps<
  C extends ElementType,
  Props = {},
> = Props &
  Omit<ComponentPropsWithoutRef<C>, keyof Props> & {
    component?: C;
    children?: ReactNode;
  };

/**
 * Box component props - minimal version without theme or styleProps
 */
export type BoxProps<C extends ElementType = "div"> = PolymorphicComponentProps<
  C,
  {
    className?: string;
    style?: React.CSSProperties;
  }
>;
```

**Completion Criteria:**

- Types compile without errors
- TypeScript correctly infers element props based on `component` prop
- JSDoc comments complete

---

### 1.3 Implement Box Component

**Task List:**

- [ ] Implement Box component with polymorphic rendering
- [ ] Handle ref forwarding correctly
- [ ] Write unit tests
- [ ] Write usage documentation

**Core Implementation:**

```typescript
// src/Box/Box.tsx
import { ElementType, forwardRef } from 'react';
import { BoxProps } from './Box.types';

/**
 * Box - The foundational polymorphic component
 *
 * @example
 * // Render as div (default)
 * <Box>Content</Box>
 *
 * @example
 * // Render as button
 * <Box component="button" onClick={handler}>Click me</Box>
 *
 * @example
 * // Render as link
 * <Box component="a" href="/path">Link</Box>
 */
export const Box = forwardRef<HTMLElement, BoxProps>(
  <C extends ElementType = 'div'>(
    { component, children, className, style, ...props }: BoxProps<C>,
    ref: React.Ref<any>
  ) => {
    const Component = component || 'div';

    return (
      <Component
        ref={ref}
        className={className}
        style={style}
        {...props}
      >
        {children}
      </Component>
    );
  }
) as <C extends ElementType = 'div'>(
  props: BoxProps<C> & { ref?: React.Ref<any> }
) => React.ReactElement;

Box.displayName = 'Box';
```

**Testing Requirements:**

- [ ] Renders as `div` by default
- [ ] `component="button"` renders as `<button>`
- [ ] `component="a"` renders as `<a>` with href
- [ ] TypeScript correctly infers props (e.g., `href` available when `component="a"`)
- [ ] Ref forwarding works correctly
- [ ] className and style props work
- [ ] All native HTML attributes pass through

**Test Example:**

```typescript
// src/Box/Box.test.tsx
import { render } from '@testing-library/react';
import { Box } from './Box';

describe('Box', () => {
  it('renders as div by default', () => {
    const { container } = render(<Box>Content</Box>);
    expect(container.firstChild?.nodeName).toBe('DIV');
  });

  it('renders as button when component="button"', () => {
    const { container } = render(
      <Box component="button" onClick={() => {}}>
        Click
      </Box>
    );
    expect(container.firstChild?.nodeName).toBe('BUTTON');
  });

  it('renders as anchor with href', () => {
    const { container } = render(
      <Box component="a" href="/test">
        Link
      </Box>
    );
    const link = container.firstChild as HTMLAnchorElement;
    expect(link.nodeName).toBe('A');
    expect(link.href).toContain('/test');
  });

  // TypeScript type test (compile-time check)
  it('has correct TypeScript types', () => {
    // This should compile
    <Box component="a" href="/test" />;
    <Box component="button" onClick={() => {}} />;

    // @ts-expect-error - href not valid on button
    <Box component="button" href="/test" />;
  });
});
```

**Completion Criteria:**

- Component renders correctly for all element types
- TypeScript types work perfectly (autocomplete, error checking)
- All tests pass
- Has usage documentation
- Ref forwarding works

---

### 1.4 Phase 1 Validation

**Validation Checklist:**

- [ ] Can render `<Box>Content</Box>` (default div)
- [ ] Can render `<Box component="button">Click</Box>`
- [ ] Can render `<Box component="a" href="/link">Link</Box>`
- [ ] TypeScript autocomplete works for element-specific props
- [ ] TypeScript errors on invalid prop combinations
- [ ] All tests pass
- [ ] Documentation complete

**Acceptance Gate (Phase 1 is DONE only if):**

- [ ] Milestone A is satisfied (`@prismui/core` is buildable/consumable)
- [ ] Milestone B is satisfied (type-level tests compile as expected)
- [ ] Milestone C is satisfied (runtime tests for Box pass)
- [ ] This Phase 1 section is reviewed and frozen before starting Phase 2

**Success Criteria:**

- **Polymorphic pattern is proven and working**
- Box can be used as foundation for other components
- Ready to add theme system in Phase 2

---

## Phase 2: Theme System (MOST COMPLEX & CORE)

**Goal:** Build the complete theming infrastructure - the heart of the component library.

**Why This is Phase 2?**

- Theme system is the most complex part of the architecture
- Requires deep understanding of React Context, CSS variables, SSR
- Foundation for all styling and customization
- Must work perfectly before adding style props

**This phase includes:**

1. Theme type definitions
2. Theme creation and merging
3. CSS variables generation
4. Provider architecture (PrismuiProvider, PrismuiThemeProvider, PrismuiAppProvider)
5. Theme context and hooks
6. SSR support for Next.js App Router
7. Baseline styles injection

---

### 2.1 Define Theme Type System

**Task List:**

- [ ] Create @prismui/theme package structure
- [ ] Define ThemeConfig interface
- [ ] Define color palette structure
- [ ] Define spacing, radius, fontSize scales
- [ ] Define breakpoints
- [ ] Add comprehensive JSDoc

**Core Type Definitions:**

```typescript
// packages/theme/src/types/theme.ts

/**
 * Color palette - array of 10 shades from lightest to darkest
 */
export type ColorPalette = [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
];

/**
 * Theme colors configuration
 */
export interface ThemeColors {
  primary: ColorPalette;
  gray: ColorPalette;
  red: ColorPalette;
  green: ColorPalette;
  blue: ColorPalette;
  yellow: ColorPalette;
  // Extensible for custom colors
  [key: string]: ColorPalette;
}

/**
 * Spacing scale
 */
export type SpacingScale = {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
};

/**
 * Complete theme configuration
 */
export interface ThemeConfig {
  colors: ThemeColors;
  spacing: SpacingScale;
  radius: SpacingScale;
  fontSizes: SpacingScale;
  lineHeights: SpacingScale;
  breakpoints: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  fontFamily: string;
  fontFamilyMonospace: string;
}
```

**Completion Criteria:**

- All theme types defined
- JSDoc documentation complete
- Types are extensible for custom themes

---

### 2.2 Implement Default Theme

**Task List:**

- [ ] Create defaultTheme object
- [ ] Define MUI-inspired color palettes
- [ ] Define spacing/sizing scales
- [ ] Add Chinese-friendly font stack

**Implementation:**

```typescript
// packages/theme/src/default-theme.ts
import { ThemeConfig } from './types/theme';

export const defaultTheme: ThemeConfig = {
  colors: {
    // MUI Blue palette
    primary: [
      '#e3f2fd', '#bbdefb', '#90caf9', '#64b5f6', '#42a5f5',
      '#2196f3', '#1e88e5', '#1976d2', '#1565c0', '#0d47a1'
    ],
    // Gray palette
    gray: [
      '#f8f9fa', '#f1f3f5', '#e9ecef', '#dee2e6', '#ced4da',
      '#adb5bd', '#868e96', '#495057', '#343a40', '#212529'
    ],
    // Additional colors...
    red: [...],
    green: [...],
    blue: [...],
    yellow: [...],
  },

  spacing: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
  },

  radius: {
    xs: 2,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },

  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
  },

  lineHeights: {
    xs: 1.4,
    sm: 1.5,
    md: 1.6,
    lg: 1.7,
    xl: 1.8,
  },

  breakpoints: {
    xs: 576,
    sm: 768,
    md: 992,
    lg: 1200,
    xl: 1400,
  },

  // Chinese-friendly font stack
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", "PingFang SC", "Microsoft YaHei"',

  fontFamilyMonospace: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
};
```

**Completion Criteria:**

- Default theme is complete and usable
- Colors follow MUI palette structure
- Font stack supports Chinese characters
- All scales are well-balanced

---

### 2.3 Implement Theme Creation and Merging

**Task List:**

- [ ] Implement createTheme factory function
- [ ] Implement deep merge logic
- [ ] Handle partial theme configs
- [ ] Write tests for merging

**Implementation:**

```typescript
// packages/theme/src/create-theme.ts
import { ThemeConfig } from "./types/theme";
import { defaultTheme } from "./default-theme";

/**
 * Deep merge utility for theme objects
 */
function deepMerge<T>(target: T, source: Partial<T>): T {
  // Implementation...
}

/**
 * Create a custom theme by merging with default theme
 *
 * @example
 * const myTheme = createTheme({
 *   colors: {
 *     primary: customPrimaryPalette,
 *   },
 * });
 */
export function createTheme(config: Partial<ThemeConfig> = {}): ThemeConfig {
  return deepMerge(defaultTheme, config);
}
```

**Testing Requirements:**

- [ ] Empty config returns default theme
- [ ] Partial config merges correctly
- [ ] Deep properties merge (e.g., colors.primary)
- [ ] Arrays replace (not merge)
- [ ] Custom colors can be added

**Completion Criteria:**

- createTheme works correctly
- Merging logic is robust
- All tests pass

---

### 2.4 Implement CSS Variables Generation

**Task List:**

- [ ] Implement cssVariablesResolver
- [ ] Generate CSS variables for all theme values
- [ ] Handle color palette indexing
- [ ] Add CSS variable injection logic

**Implementation:**

```typescript
// packages/theme/src/css-variables-resolver.ts
import { ThemeConfig } from "./types/theme";

/**
 * Generate CSS variables from theme config
 *
 * @example
 * const vars = cssVariablesResolver(theme);
 * // {
 * //   '--prismui-color-primary-0': '#e3f2fd',
 * //   '--prismui-color-primary-5': '#2196f3',
 * //   '--prismui-spacing-md': '16px',
 * //   ...
 * // }
 */
export function cssVariablesResolver(
  theme: ThemeConfig,
): Record<string, string> {
  const vars: Record<string, string> = {};

  // Generate color variables
  Object.entries(theme.colors).forEach(([colorName, palette]) => {
    palette.forEach((shade, index) => {
      vars[`--prismui-color-${colorName}-${index}`] = shade;
    });
  });

  // Generate spacing variables
  Object.entries(theme.spacing).forEach(([size, value]) => {
    vars[`--prismui-spacing-${size}`] = `${value}px`;
  });

  // Generate radius variables
  Object.entries(theme.radius).forEach(([size, value]) => {
    vars[`--prismui-radius-${size}`] = `${value}px`;
  });

  // Generate fontSize variables
  Object.entries(theme.fontSizes).forEach(([size, value]) => {
    vars[`--prismui-font-size-${size}`] = `${value}px`;
  });

  // Font family
  vars["--prismui-font-family"] = theme.fontFamily;
  vars["--prismui-font-family-monospace"] = theme.fontFamilyMonospace;

  return vars;
}
```

**Testing Requirements:**

- [ ] All theme values generate CSS variables
- [ ] Variable naming is consistent
- [ ] Numeric values get 'px' suffix
- [ ] String values pass through

**Completion Criteria:**

- CSS variables generated correctly
- All tests pass
- Variable naming follows convention

---

### 2.5 Implement Theme Context and Providers

**Task List:**

- [ ] Create ThemeContext
- [ ] Implement PrismuiThemeProvider (theme-only)
- [ ] Implement PrismuiProvider (all-in-one)
- [ ] Implement CSS variable injection
- [ ] Implement baseline styles
- [ ] Write tests

**Implementation:**

```typescript
// packages/theme/src/PrismuiThemeProvider.tsx
import { createContext, ReactNode } from 'react';
import { ThemeConfig } from './types/theme';
import { defaultTheme } from './default-theme';

export const ThemeContext = createContext<ThemeConfig>(defaultTheme);

export interface PrismuiThemeProviderProps {
  theme?: ThemeConfig;
  children: ReactNode;
}

/**
 * Theme-only provider - provides theme context without CSS injection
 */
export function PrismuiThemeProvider({
  theme = defaultTheme,
  children
}: PrismuiThemeProviderProps) {
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

// packages/theme/src/PrismuiProvider.tsx
import { PrismuiThemeProvider } from './PrismuiThemeProvider';
import { cssVariablesResolver } from './css-variables-resolver';
import { useEffect } from 'react';

export interface PrismuiProviderProps {
  theme?: ThemeConfig;
  children: ReactNode;
  withCSSVariables?: boolean;
  withGlobalStyles?: boolean;
}

/**
 * All-in-one provider - theme context + CSS variables + baseline styles
 */
export function PrismuiProvider({
  theme = defaultTheme,
  children,
  withCSSVariables = true,
  withGlobalStyles = true,
}: PrismuiProviderProps) {
  useEffect(() => {
    if (withCSSVariables) {
      const vars = cssVariablesResolver(theme);
      const root = document.documentElement;

      Object.entries(vars).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    }
  }, [theme, withCSSVariables]);

  return (
    <PrismuiThemeProvider theme={theme}>
      {withGlobalStyles && <GlobalStyles />}
      {children}
    </PrismuiThemeProvider>
  );
}

// Baseline styles component
function GlobalStyles() {
  return (
    <style jsx global>{`
      *, *::before, *::after {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        font-family: var(--prismui-font-family);
        font-size: var(--prismui-font-size-md);
        line-height: var(--prismui-line-height-md);
      }
    `}</style>
  );
}
```

**Testing Requirements:**

- [ ] ThemeContext provides theme correctly
- [ ] PrismuiThemeProvider works without CSS injection
- [ ] PrismuiProvider injects CSS variables
- [ ] CSS variables update when theme changes
- [ ] GlobalStyles render correctly

**Completion Criteria:**

- All providers work correctly
- Theme context accessible
- CSS variables injected
- All tests pass

---

### 2.6 Implement useTheme Hook

**Task List:**

- [ ] Create @prismui/hooks package
- [ ] Implement useTheme hook
- [ ] Implement useId hook (SSR-safe)
- [ ] Write tests

**Implementation:**

```typescript
// packages/hooks/src/use-theme.ts
import { useContext } from "react";
import { ThemeContext } from "@prismui/theme";

/**
 * Access theme from context
 *
 * @example
 * const theme = useTheme();
 * const primaryColor = theme.colors.primary[5];
 */
export function useTheme() {
  const theme = useContext(ThemeContext);

  if (!theme) {
    throw new Error(
      "useTheme must be used within PrismuiProvider or PrismuiThemeProvider",
    );
  }

  return theme;
}

// packages/hooks/src/use-id.ts
import { useId as useReactId } from "react";

/**
 * Generate unique ID (SSR-safe)
 *
 * @example
 * const id = useId();
 * const customId = useId('my-prefix');
 */
export function useId(staticId?: string): string {
  const reactId = useReactId();
  return staticId || `prismui-${reactId}`;
}
```

**Testing Requirements:**

- [ ] useTheme returns theme inside provider
- [ ] useTheme throws error outside provider
- [ ] useId generates unique IDs
- [ ] useId works with SSR

**Completion Criteria:**

- Hooks work correctly
- All tests pass

---

### 2.7 Implement Next.js App Router Support

**Task List:**

- [ ] Create @prismui/nextjs package
- [ ] Implement PrismuiAppProvider with SSR style injection
- [ ] Test with Next.js App Router
- [ ] Write integration guide

**Implementation:**

```typescript
// packages/nextjs/src/PrismuiAppProvider.tsx
'use client';

import { useServerInsertedHTML } from 'next/navigation';
import { PrismuiProvider, ThemeConfig } from '@prismui/theme';
import { cssVariablesResolver } from '@prismui/theme';
import { ReactNode } from 'react';

export interface PrismuiAppProviderProps {
  theme?: ThemeConfig;
  children: ReactNode;
}

/**
 * Next.js App Router provider with SSR style injection
 *
 * @example
 * // app/layout.tsx
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <PrismuiAppProvider>
 *           {children}
 *         </PrismuiAppProvider>
 *       </body>
 *     </html>
 *   );
 * }
 */
export function PrismuiAppProvider({ theme, children }: PrismuiAppProviderProps) {
  useServerInsertedHTML(() => {
    const vars = cssVariablesResolver(theme || defaultTheme);
    const cssVarsString = Object.entries(vars)
      .map(([key, value]) => `${key}: ${value};`)
      .join('\n');

    return (
      <style
        dangerouslySetInnerHTML={{
          __html: `:root { ${cssVarsString} }`,
        }}
      />
    );
  });

  return (
    <PrismuiProvider theme={theme} withCSSVariables={false}>
      {children}
    </PrismuiProvider>
  );
}
```

**Testing Requirements:**

- [ ] SSR renders without flicker
- [ ] CSS variables injected in <head>
- [ ] Client hydration works correctly
- [ ] Theme consistent server/client

**Completion Criteria:**

- Next.js App Router fully supported
- SSR works without flicker
- Integration guide complete

---

### 2.8 Update Box to Use Theme

**Task List:**

- [ ] Update Box component to accept theme-aware props
- [ ] Add basic styling support (no styleProps yet)
- [ ] Test Box with theme
- [ ] Update documentation

**Updated Box:**

```typescript
// packages/core/src/Box/Box.tsx
import { useTheme } from '@prismui/hooks';

export const Box = forwardRef<HTMLElement, BoxProps>(
  <C extends ElementType = 'div'>(
    { component, children, className, style, ...props }: BoxProps<C>,
    ref: React.Ref<any>
  ) => {
    const theme = useTheme(); // Now has access to theme
    const Component = component || 'div';

    return (
      <Component
        ref={ref}
        className={className}
        style={style}
        {...props}
      >
        {children}
      </Component>
    );
  }
) as <C extends ElementType = 'div'>(
  props: BoxProps<C> & { ref?: React.Ref<any> }
) => React.ReactElement;
```

**Completion Criteria:**

- Box can access theme via useTheme
- Ready for styleProps in Phase 3

---

### 2.9 Phase 2 Validation

**Validation Checklist:**

- [ ] Theme types fully defined
- [ ] Default theme complete and usable
- [ ] createTheme works with partial configs
- [ ] CSS variables generated correctly
- [ ] PrismuiThemeProvider works (theme-only)
- [ ] PrismuiProvider works (all-in-one)
- [ ] useTheme hook works
- [ ] useId hook works (SSR-safe)
- [ ] Next.js App Router support works
- [ ] Box component can access theme
- [ ] All tests pass
- [ ] Documentation complete

**Success Criteria:**

- **Complete theme system is working**
- Theme can be customized and switched
- SSR works without flicker
- Ready to add styleProps in Phase 3

---

## Phase 3: Style Props System

**Goal:** Add the style props system to components - enabling theme-aware shorthand styling.

**Why This is Phase 3?**

- Style props are a convenience layer on top of theme
- Simpler and more focused than theme system
- Builds on existing Box and theme infrastructure
- Makes components more ergonomic to use

**This phase includes:**

1. Style props type definitions
2. Style props parser/resolver
3. Integration with Box component
4. Utility functions for style manipulation

---

### 3.1 Define Style Props Types

**Task List:**

- [ ] Create @prismui/styles package
- [ ] Define StyleProps interface
- [ ] Define prop-to-CSS mapping
- [ ] Add JSDoc documentation

**Core Type Definitions:**

```typescript
// packages/styles/src/types/style-props.ts

/**
 * Style props for spacing
 */
export interface SpacingProps {
  /** Padding (all sides) */
  p?: string | number;
  /** Padding top */
  pt?: string | number;
  /** Padding right */
  pr?: string | number;
  /** Padding bottom */
  pb?: string | number;
  /** Padding left */
  pl?: string | number;
  /** Padding horizontal (left + right) */
  px?: string | number;
  /** Padding vertical (top + bottom) */
  py?: string | number;

  /** Margin (all sides) */
  m?: string | number;
  /** Margin top */
  mt?: string | number;
  /** Margin right */
  mr?: string | number;
  /** Margin bottom */
  mb?: string | number;
  /** Margin left */
  ml?: string | number;
  /** Margin horizontal (left + right) */
  mx?: string | number;
  /** Margin vertical (top + bottom) */
  my?: string | number;
}

/**
 * Style props for colors
 */
export interface ColorProps {
  /** Background color (supports theme colors like 'primary.5') */
  bg?: string;
  /** Text color (supports theme colors) */
  c?: string;
}

/**
 * Style props for sizing
 */
export interface SizeProps {
  /** Width */
  w?: string | number;
  /** Height */
  h?: string | number;
  /** Min width */
  miw?: string | number;
  /** Min height */
  mih?: string | number;
  /** Max width */
  maw?: string | number;
  /** Max height */
  mah?: string | number;
}

/**
 * All style props combined
 */
export interface StyleProps extends SpacingProps, ColorProps, SizeProps {}
```

**Completion Criteria:**

- All common style props defined
- JSDoc documentation complete
- Types are clear and intuitive

---

### 3.2 Implement Style Props Parser

**Task List:**

- [ ] Implement parseStyleProps function
- [ ] Handle theme value resolution (e.g., 'primary.5' → theme color)
- [ ] Handle spacing scale resolution (e.g., 'md' → theme spacing)
- [ ] Handle numeric values (e.g., 16 → '16px')
- [ ] Write tests

**Implementation:**

```typescript
// packages/styles/src/parse-style-props.ts
import { ThemeConfig } from "@prismui/theme";
import { StyleProps } from "./types/style-props";

/**
 * Resolve a value from theme or convert to CSS value
 */
function resolveValue(
  value: string | number,
  theme: ThemeConfig,
  type: "spacing" | "color" | "size",
): string {
  // Handle numeric values
  if (typeof value === "number") {
    return `${value}px`;
  }

  // Handle theme spacing (e.g., 'md' → theme.spacing.md)
  if (type === "spacing" && value in theme.spacing) {
    return `${theme.spacing[value as keyof typeof theme.spacing]}px`;
  }

  // Handle theme colors (e.g., 'primary.5' → theme.colors.primary[5])
  if (type === "color" && value.includes(".")) {
    const [colorName, index] = value.split(".");
    const palette = theme.colors[colorName];
    if (palette && palette[parseInt(index)]) {
      return palette[parseInt(index)];
    }
  }

  // Return as-is for CSS values
  return value;
}

/**
 * Parse style props into CSS styles object
 */
export function parseStyleProps(
  props: StyleProps,
  theme: ThemeConfig,
): React.CSSProperties {
  const styles: React.CSSProperties = {};

  // Padding
  if (props.p !== undefined) {
    styles.padding = resolveValue(props.p, theme, "spacing");
  }
  if (props.pt !== undefined) {
    styles.paddingTop = resolveValue(props.pt, theme, "spacing");
  }
  if (props.pr !== undefined) {
    styles.paddingRight = resolveValue(props.pr, theme, "spacing");
  }
  if (props.pb !== undefined) {
    styles.paddingBottom = resolveValue(props.pb, theme, "spacing");
  }
  if (props.pl !== undefined) {
    styles.paddingLeft = resolveValue(props.pl, theme, "spacing");
  }
  if (props.px !== undefined) {
    const value = resolveValue(props.px, theme, "spacing");
    styles.paddingLeft = value;
    styles.paddingRight = value;
  }
  if (props.py !== undefined) {
    const value = resolveValue(props.py, theme, "spacing");
    styles.paddingTop = value;
    styles.paddingBottom = value;
  }

  // Margin (similar pattern)
  // ... implement for m, mt, mr, mb, ml, mx, my

  // Colors
  if (props.bg !== undefined) {
    styles.backgroundColor = resolveValue(props.bg, theme, "color");
  }
  if (props.c !== undefined) {
    styles.color = resolveValue(props.c, theme, "color");
  }

  // Sizing
  if (props.w !== undefined) {
    styles.width = resolveValue(props.w, theme, "size");
  }
  if (props.h !== undefined) {
    styles.height = resolveValue(props.h, theme, "size");
  }
  // ... implement for miw, mih, maw, mah

  return styles;
}
```

**Testing Requirements:**

- [ ] Numeric values convert to px
- [ ] Theme spacing keys resolve correctly ('md' → '16px')
- [ ] Theme colors resolve correctly ('primary.5' → color value)
- [ ] Shorthand props work (px, py, mx, my)
- [ ] CSS values pass through ('100%', 'auto', etc.)

**Completion Criteria:**

- Parser works correctly for all prop types
- All tests pass
- Performance is acceptable

---

### 3.3 Implement Style Utility Functions

**Task List:**

- [ ] Implement rem() converter
- [ ] Implement em() converter
- [ ] Implement rgba() color utility
- [ ] Write tests

**Implementation:**

```typescript
// packages/styles/src/utils/rem.ts
/**
 * Convert px to rem
 * @param px - Pixel value
 * @returns rem value string
 */
export function rem(px: number): string {
  return `${px / 16}rem`;
}

// packages/styles/src/utils/em.ts
/**
 * Convert px to em
 * @param px - Pixel value
 * @returns em value string
 */
export function em(px: number): string {
  return `${px / 16}em`;
}

// packages/styles/src/utils/rgba.ts
/**
 * Add alpha channel to color
 * @param color - Hex color
 * @param alpha - Alpha value (0-1)
 * @returns rgba string
 */
export function rgba(color: string, alpha: number): string {
  // Implementation for hex to rgba conversion
  // ...
}
```

**Testing Requirements:**

- [ ] rem() converts correctly
- [ ] em() converts correctly
- [ ] rgba() handles hex colors
- [ ] Edge cases handled

**Completion Criteria:**

- All utility functions work
- All tests pass
- Has usage documentation

---

### 3.4 Integrate Style Props with Box

**Task List:**

- [ ] Update BoxProps to include StyleProps
- [ ] Update Box component to use parseStyleProps
- [ ] Merge parsed styles with user styles
- [ ] Write tests
- [ ] Update documentation

**Updated Box Implementation:**

```typescript
// packages/core/src/Box/Box.types.ts
import { StyleProps } from '@prismui/styles';

export type BoxProps<C extends ElementType = 'div'> =
  PolymorphicComponentProps<C, {
    className?: string;
    style?: React.CSSProperties;
  } & StyleProps>; // Add StyleProps

// packages/core/src/Box/Box.tsx
import { useTheme } from '@prismui/hooks';
import { parseStyleProps } from '@prismui/styles';

export const Box = forwardRef<HTMLElement, BoxProps>(
  <C extends ElementType = 'div'>(
    {
      component,
      children,
      className,
      style,
      // Extract style props
      p, pt, pr, pb, pl, px, py,
      m, mt, mr, mb, ml, mx, my,
      bg, c,
      w, h, miw, mih, maw, mah,
      ...props
    }: BoxProps<C>,
    ref: React.Ref<any>
  ) => {
    const theme = useTheme();
    const Component = component || 'div';

    // Parse style props
    const stylePropsStyles = parseStyleProps(
      { p, pt, pr, pb, pl, px, py, m, mt, mr, mb, ml, mx, my, bg, c, w, h, miw, mih, maw, mah },
      theme
    );

    // Merge with user styles (user styles take precedence)
    const mergedStyles = { ...stylePropsStyles, ...style };

    return (
      <Component
        ref={ref}
        className={className}
        style={mergedStyles}
        {...props}
      >
        {children}
      </Component>
    );
  }
) as <C extends ElementType = 'div'>(
  props: BoxProps<C> & { ref?: React.Ref<any> }
) => React.ReactElement;
```

**Testing Requirements:**

- [ ] Style props work on Box
- [ ] `<Box p="md">` applies correct padding
- [ ] `<Box bg="primary.5">` applies correct background
- [ ] User styles override style props
- [ ] TypeScript autocomplete works for style props

**Test Examples:**

```typescript
describe('Box with Style Props', () => {
  it('applies padding from theme', () => {
    const { container } = render(
      <PrismuiProvider>
        <Box p="md">Content</Box>
      </PrismuiProvider>
    );
    const box = container.firstChild as HTMLElement;
    expect(box.style.padding).toBe('16px');
  });

  it('applies background color from theme', () => {
    const { container } = render(
      <PrismuiProvider>
        <Box bg="primary.5">Content</Box>
      </PrismuiProvider>
    );
    const box = container.firstChild as HTMLElement;
    expect(box.style.backgroundColor).toBe('#2196f3');
  });

  it('user styles override style props', () => {
    const { container } = render(
      <PrismuiProvider>
        <Box p="md" style={{ padding: '32px' }}>Content</Box>
      </PrismuiProvider>
    );
    const box = container.firstChild as HTMLElement;
    expect(box.style.padding).toBe('32px');
  });
});
```

**Completion Criteria:**

- Box fully supports style props
- All tests pass
- Documentation updated with examples

---

### 3.5 Phase 3 Validation

**Validation Checklist:**

- [ ] StyleProps types fully defined
- [ ] parseStyleProps works correctly
- [ ] Utility functions (rem, em, rgba) work
- [ ] Box component supports style props
- [ ] Theme values resolve correctly
- [ ] Numeric values convert to px
- [ ] User styles can override style props
- [ ] All tests pass
- [ ] Documentation complete

**Usage Examples to Validate:**

```typescript
// Basic usage
<Box p="md" bg="primary.5">Content</Box>

// Numeric values
<Box p={16} m={8}>Content</Box>

// Directional props
<Box px="lg" py="sm">Content</Box>

// Colors
<Box bg="gray.1" c="primary.7">Text</Box>

// Sizing
<Box w={200} h="100%">Fixed width, full height</Box>

// Combined with polymorphism
<Box component="button" p="sm" bg="primary.5">
  Button
</Box>
```

**Success Criteria:**

- **Style props system is fully working**
- Box is ergonomic and powerful
- Ready to build other components (Text, Button, etc.)

---

## Phase 4: Core Components (Text, Button)

**Goal:** Build Text and Button components using Box as foundation.

**Why This is Phase 4?**

- Now we have polymorphism + theme + styleProps
- Text and Button validate the full system
- These are the most commonly used components

---

### 4.1 Text Component

**Task List:**

- [ ] Define TextProps interface
- [ ] Implement Text component (extends Box)
- [ ] Add size, weight, color variants
- [ ] Add truncate functionality
- [ ] Write tests
- [ ] Write documentation

**API Design:**

````typescript
interface TextProps<C extends ElementType = 'span'> extends BoxProps<C> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  truncate?: boolean;
}

// Usage Examples
<Text size="lg" weight="bold">Bold Text</Text>
<Text c="primary.5">Colored Text</Text>
<Text component="p" truncate>Long text...</Text>
- Validates polymorphic component pattern
- Validates style props system

**Task List:**

- [ ] Define BoxProps interface
- [ ] Implement polymorphic component logic
- [ ] Implement style props parsing
- [ ] Write unit tests
- [ ] Write accessibility tests
- [ ] Write usage documentation

**API Design:**

```typescript
interface BoxProps<C extends ElementType = 'div'>
  extends ComponentPropsWithoutRef<C>, StyleProps {
  component?: C;
  children?: ReactNode;
}

// Usage Examples
<Box p="md" bg="primary.5">Content</Box>
<Box component="section" m="lg">Section</Box>
<Box component="a" href="/link">Link</Box>
````

**Testing Requirements:**

- [ ] Renders as div by default
- [ ] component prop correctly switches element type
- [ ] Style props correctly applied
- [ ] TypeScript types correctly inferred
- [ ] Accessibility: Semantic HTML

**Completion Criteria:**

- Component implementation complete
- All tests pass (unit + accessibility)
- Has usage documentation and examples
- TypeScript types complete

---

### 3.2 Text Component

**Task List:**

- [ ] Define TextProps interface
- [ ] Implement component (based on Box)
- [ ] Implement theme variants (size, weight, color)
- [ ] Write tests
- [ ] Write documentation

**API Design:**

```typescript
interface TextProps<C extends ElementType = 'span'>
  extends BoxProps<C> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: string;
  truncate?: boolean;
}

// Usage Examples
<Text size="lg" weight="bold">Bold Text</Text>
<Text color="primary.5">Colored Text</Text>
<Text component="p" truncate>Long text...</Text>
```

**Testing Requirements:**

- [ ] Different sizes render correctly
- [ ] weight correctly applied
- [ ] color resolved from theme
- [ ] truncate functionality works
- [ ] Accessibility: Text readability

**Completion Criteria:**

- Component implementation complete
- Theme integration correct
- All tests pass
- Has usage documentation

---

### 3.3 Button Component

**Task List:**

- [ ] Define ButtonProps interface
- [ ] Implement component (based on Box)
- [ ] Implement variants (filled, outline, subtle)
- [ ] Implement sizes (xs, sm, md, lg, xl)
- [ ] Implement loading state
- [ ] Implement disabled state
- [ ] Write tests (unit + accessibility)
- [ ] Write documentation

**API Design:**

```typescript
interface ButtonProps<C extends ElementType = 'button'>
  extends BoxProps<C> {
  variant?: 'filled' | 'outline' | 'subtle';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

// Usage Examples
<Button variant="filled" color="primary">Submit</Button>
<Button variant="outline" size="lg">Cancel</Button>
<Button component="a" href="/link">Link Button</Button>
<Button loading disabled>Loading...</Button>
```

**Testing Requirements:**

- [ ] Different variants render correctly
- [ ] Different sizes correctly applied
- [ ] loading state shows loading indicator
- [ ] disabled state disables interaction
- [ ] Polymorphic rendering (button, a)
- [ ] **Accessibility Focus:**
  - [ ] Keyboard navigation (Enter, Space)
  - [ ] ARIA attributes (aria-disabled, aria-busy)
  - [ ] Focus indicator visible
  - [ ] Color contrast meets WCAG AA

**Completion Criteria:**

- Component implementation complete
- All variants and states work correctly
- All accessibility tests pass
- Has complete documentation and examples

---

## Phase 4: Layout Components

### 4.1 Stack Component

**Task List:**

- [ ] Define StackProps interface
- [ ] Implement vertical/horizontal layout
- [ ] Implement spacing control
- [ ] Implement alignment
- [ ] Write tests
- [ ] Write documentation

**API Design:**

```typescript
interface StackProps<C extends ElementType = 'div'>
  extends BoxProps<C> {
  direction?: 'horizontal' | 'vertical';
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'space-between';
}

// Usage Examples
<Stack spacing="md">
  <Button>Button 1</Button>
  <Button>Button 2</Button>
</Stack>
```

**Testing Requirements:**

- [ ] direction correctly switches layout direction
- [ ] spacing correctly applies spacing
- [ ] align and justify correctly align

**Completion Criteria:**

- Component implementation complete
- Layout behavior correct
- All tests pass
- Has usage documentation

---

### 4.2 Group Component

**Task List:**

- [ ] Define GroupProps interface
- [ ] Implement horizontal group layout
- [ ] Implement spacing and alignment
- [ ] Write tests
- [ ] Write documentation

**API Design:**

```typescript
interface GroupProps<C extends ElementType = 'div'>
  extends BoxProps<C> {
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  align?: 'start' | 'center' | 'end';
  justify?: 'start' | 'center' | 'end' | 'space-between';
  wrap?: boolean;
}

// Usage Examples
<Group spacing="sm" justify="space-between">
  <Button>Left</Button>
  <Button>Right</Button>
</Group>
```

**Testing Requirements:**

- [ ] spacing correctly applied
- [ ] align and justify correct
- [ ] wrap functionality works

**Completion Criteria:**

- Component implementation complete
- All tests pass
- Has usage documentation

---

## Phase 5: Next.js Integration

### 5.1 Create @prismui/nextjs Package

**Task List:**

- [ ] Implement PrismuiAppProvider
- [ ] Implement SSR style injection
- [ ] Write Next.js App Router examples
- [ ] Test SSR rendering
- [ ] Write integration documentation

**Core Implementation:**

```typescript
// src/PrismuiAppProvider.tsx
'use client';

export function PrismuiAppProvider({
  theme,
  children
}: PrismuiAppProviderProps) {
  useServerInsertedHTML(() => {
    // Inject styles into <head>
  });

  return (
    <PrismuiProvider theme={theme}>
      {children}
    </PrismuiProvider>
  );
}
```

**Testing Requirements:**

- [ ] Styles correctly injected during SSR
- [ ] Client hydration works correctly
- [ ] Theme consistent on server and client

**Completion Criteria:**

- Next.js App Router fully supported
- SSR rendering without flicker
- Has complete integration guide

---

## Testing Strategy

### Unit Testing Requirements

Each component must have:

- Props rendering tests
- Variant tests
- Interaction tests (if applicable)
- TypeScript type tests

### Accessibility Testing Requirements

Each component must have:

- jest-axe automated tests
- Keyboard navigation tests
- ARIA attribute validation
- Color contrast checks

### Testing Stack

- **Vitest** - Test runner
- **React Testing Library** - Component testing
- **@testing-library/jest-dom** - DOM matchers
- **jest-axe** - Accessibility testing
- **@testing-library/user-event** - User interaction simulation

---

## Documentation Requirements

Each component must have:

1. **API Documentation**
   - Props interface description
   - Type definitions
   - Default values

2. **Usage Examples**
   - Basic usage
   - Variant examples
   - Advanced usage

3. **Accessibility Documentation**
   - ARIA attributes
   - Keyboard interactions
   - Screen reader support

4. **Theme Customization**
   - How to customize via theme
   - CSS variable overrides

---

## Completion Checklist

### Phase 1: Type System & Utilities

- [ ] @prismui/types package complete
- [ ] @prismui/styles package complete
- [ ] All tests pass
- [ ] Documentation complete

### Phase 2: Theme System

- [ ] @prismui/theme package complete
- [ ] @prismui/hooks package complete
- [ ] Theme can be customized and switched
- [ ] CSS variables correctly generated
- [ ] All tests pass

### Phase 3: Foundation Components

- [ ] Box component complete
- [ ] Text component complete
- [ ] Button component complete
- [ ] All components pass accessibility tests
- [ ] Documentation and examples complete

### Phase 4: Layout Components

- [ ] Stack component complete
- [ ] Group component complete
- [ ] All tests pass
- [ ] Documentation complete

### Phase 5: Next.js Integration

- [ ] @prismui/nextjs package complete
- [ ] SSR works correctly
- [ ] Integration guide complete

### Final Acceptance

- [ ] All packages build correctly
- [ ] All tests pass (unit + accessibility)
- [ ] Test coverage > 80%
- [ ] All components meet WCAG 2.1 Level AA
- [ ] TypeScript types complete and correct
- [ ] Documentation complete
- [ ] Integration tests pass in MedXAI project

---

## Risks & Mitigation

| Risk                                  | Impact | Mitigation                                               |
| ------------------------------------- | ------ | -------------------------------------------------------- |
| Polymorphic component type complexity | High   | Reference Mantine implementation, validate incrementally |
| SSR style flicker                     | Medium | Test Next.js integration early                           |
| Insufficient accessibility testing    | High   | Mandatory accessibility tests for each component         |
| Theme system performance              | Low    | Use CSS variables, avoid runtime computation             |

---

## Next Actions

1. **Start Immediately:** Phase 1 - Create @prismui/types package
2. **Parallel Preparation:** Configure monorepo tools (pnpm workspace / Turborepo)
3. **Setup CI/CD:** Configure automated testing and builds

---

## References

- [ARCHITECTURE.md](../architecture/ARCHITECTURE.md)
- [MODULES.md](../architecture/MODULES.md)
- [TESTING-STRATEGY.md](../development/TESTING-STRATEGY.md)
- [ADR-001](../decisions/ADR-001-Mantine-MUI-Hybrid-Architecture.md)
