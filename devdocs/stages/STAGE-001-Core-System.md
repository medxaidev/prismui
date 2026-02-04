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

## Phase 1: Type System & Utilities

### 1.1 Create @prismui/types Package

**Task List:**

- [ ] Initialize package structure and package.json
- [ ] Configure TypeScript (tsconfig.json)
- [ ] Define core types

**Core Type Definitions:**

```typescript
// src/theme.ts
export interface ThemeConfig {
  colors: Record<string, string[]>;
  spacing: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', number>;
  radius: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', number>;
  fontSizes: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', number>;
  breakpoints: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', number>;
}

// src/polymorphic.ts
export type PolymorphicComponent<C extends ElementType, Props = {}> = ...

// src/style-props.ts
export interface StyleProps {
  p?: string | number;
  m?: string | number;
  bg?: string;
  // ... other style props
}
```

**Completion Criteria:**

- TypeScript compiles without errors
- Exported types can be referenced by other packages
- Has basic JSDoc comments

---

### 1.2 Create @prismui/styles Package

**Task List:**

- [ ] Initialize package structure
- [ ] Implement style utility functions
- [ ] Write unit tests

**Core Functions:**

```typescript
// src/rem.ts
export function rem(px: number): string;

// src/em.ts
export function em(px: number): string;

// src/rgba.ts
export function rgba(color: string, alpha: number): string;

// src/color.ts
export function darken(color: string, amount: number): string;
export function lighten(color: string, amount: number): string;
```

**Testing Requirements:**

- At least 3 test cases per function
- Cover edge cases
- Test coverage > 90%

**Completion Criteria:**

- All functions implemented and pass tests
- Has complete TypeScript types
- Has usage example documentation

---

## Phase 2: Theme System

### 2.1 Create @prismui/theme Package

**Task List:**

- [ ] Implement createTheme factory function
- [ ] Implement defaultTheme default theme
- [ ] Implement cssVariablesResolver CSS variables generator
- [ ] Implement PrismuiThemeProvider
- [ ] Implement PrismuiProvider
- [ ] Write tests

**Core Implementation:**

```typescript
// src/create-theme.ts
export function createTheme(config: Partial<ThemeConfig>): ThemeConfig;

// src/default-theme.ts
export const defaultTheme: ThemeConfig = {
  colors: {
    primary: [
      '#e3f2fd', '#bbdefb', '#90caf9', '#64b5f6', '#42a5f5',
      '#2196f3', '#1e88e5', '#1976d2', '#1565c0', '#0d47a1'
    ],
    gray: [...],
  },
  spacing: { xs: 8, sm: 12, md: 16, lg: 20, xl: 24 },
  // ...
};

// src/css-variables-resolver.ts
export function cssVariablesResolver(theme: ThemeConfig): Record<string, string>;

// src/PrismuiThemeProvider.tsx
export function PrismuiThemeProvider({ theme, children }): JSX.Element;

// src/PrismuiProvider.tsx
export function PrismuiProvider({ theme, children }): JSX.Element;
```

**Testing Requirements:**

- createTheme merge logic tests
- CSS variable generation tests
- Provider rendering tests
- Theme context propagation tests

**Completion Criteria:**

- Theme can be customized and merged
- CSS variables correctly generated and injected
- Provider correctly provides theme context
- All tests pass

---

### 2.2 Create @prismui/hooks Package

**Task List:**

- [ ] Implement useTheme hook
- [ ] Implement useId hook (SSR-safe)
- [ ] Write tests

**Core Implementation:**

```typescript
// src/use-theme.ts
export function useTheme(): ThemeConfig;

// src/use-id.ts
export function useId(staticId?: string): string;
```

**Testing Requirements:**

- useTheme behavior inside and outside Provider
- useId uniqueness and SSR compatibility

**Completion Criteria:**

- Hooks correctly access theme context
- useId works in both SSR and CSR
- All tests pass

---

## Phase 3: Foundation Components

### 3.1 Box Component (Highest Priority)

**Why Box First?**

- Box is the foundation for all components
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
```

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
