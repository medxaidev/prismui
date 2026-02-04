# Prismui Architecture (Enforceable)

> **Status:** Active  
> **Version:** v1.0  
> **Last Updated:** 2026-02-04

This document defines **binding architectural rules** for Prismui.
Any new component, feature, or refactor **MUST comply** with this document.

---

## 1. Architectural Goals

Prismui **MUST**:

1. Provide a **lightweight React UI component library** in TypeScript
2. Serve **MedXAI project** as primary use case
3. Combine **Mantine's architecture** (core) with **MUI's design** (styling)
4. Ensure **WCAG 2.1 Level AA accessibility** for all components
5. Support **React 18+** and **Next.js App Router** with SSR
6. Provide powerful **theming system** with CSS variables
7. Remain **framework-agnostic at core** with React implementations

---

## 2. Component Architecture Layers

```
┌─────────────────────────────────────┐
│   Application Layer (MedXAI)       │
│   - Uses Prismui components      │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   Component Layer                   │
│   - Button, Input, Modal, etc.     │
│   - Polymorphic components          │
│   - Accessibility built-in          │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   Theming Layer                     │
│   - Theme context & provider        │
│   - CSS variables system            │
│   - Design tokens                   │
│   - Style resolution                │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   Core Layer                        │
│   - Type system                     │
│   - Utilities                       │
│   - Hooks                           │
│   - Factory functions               │
└─────────────────────────────────────┘
```

---

## 3. Key Architectural Patterns

### 3.1 Polymorphic Components (Mantine-inspired)

All components support `component` prop for rendering as different elements:

```typescript
<Button component="a" href="/link">Link Button</Button>
<Box component="section">Section Box</Box>
```

### 3.2 Provider Architecture

- **PrismuiProvider**: Root provider (theme + CSS vars + baseline styles)
- **PrismuiThemeProvider**: Theme-only provider
- **PrismuiAppProvider**: Next.js App Router bridge (SSR support)

### 3.3 Theming System

- CSS variables for runtime theme switching
- Design tokens for consistency
- Theme object with TypeScript autocomplete
- Support for light/dark modes

### 3.4 Component Props Pattern

```typescript
interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  variant?: "filled" | "outline" | "subtle";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  color?: string;
  // ... theme-aware props
}
```

---

## 4. Design Principles (BINDING)

1. **Accessibility First** – WCAG 2.1 AA is mandatory
2. **Mantine Core, MUI Style** – Architecture from Mantine, aesthetics from MUI
3. **MedXAI-Driven** – Components built for actual project needs
4. **Type Safety** – Full TypeScript support with strict types
5. **Lightweight** – Minimal dependencies, tree-shakeable
6. **Modern Only** – Evergreen browsers, no legacy support
7. **SSR Compatible** – Full Next.js App Router support

---

## 5. Module Organization

```
packages/
├── @prismui/core/          # Core components
│   ├── Button/
│   ├── Box/
│   ├── Text/
│   └── ...
├── @prismui/hooks/         # React hooks
├── @prismui/theme/         # Theming system
├── @prismui/styles/        # Style utilities
└── @prismui/types/         # TypeScript types
```

---

## 6. Stability Policy

| Layer              | Stability | Breaking Changes |
| ------------------ | --------- | ---------------- |
| Core types         | Very High | Requires ADR     |
| Theming system     | High      | Major version    |
| Component APIs     | Medium    | Minor version    |
| Internal utilities | Low       | Patch version    |

---

## 7. Enforcement Rules

1. New components **MUST reference this document**
2. Code reviews **MUST block** violations
3. Accessibility tests **MUST pass**
4. Disputes resolved via ADRs

---

## 8. Relationship to Other Documents

- **MODULES.md**: Component and package inventory
- **DATAFLOW.md**: Theming and styling flow
- **GLOSSARY.md**: UI library terminology
- **ADRs**: Architectural decisions

This document is the **highest authority** on system structure.
