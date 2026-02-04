# GLOSSARY (Authoritative)

**Status:** Active  
**Version:** v1.0  
**Scope:** Defines all critical terms used in Prismui

---

## Core Concepts

### Polymorphic Component

A component that can render as different HTML elements or React components via the `component` prop.

**Example:**

```typescript
<Button component="a" href="/link">Link Button</Button>
```

### Theme Object

The central configuration object containing colors, spacing, typography, and other design tokens.

### Design Tokens

Atomic design values (colors, spacing, typography) stored in the theme object.

### CSS Variables

Runtime-modifiable CSS custom properties generated from the theme object.

**Example:** `--prismui-color-primary-5`

---

## Provider System

### PrismuiProvider

The all-in-one root provider that includes theme context, CSS variables, and baseline styles.

### PrismuiThemeProvider

A theme-only provider for cases where you only need theme context without CSS injection.

### PrismuiAppProvider

Next.js App Router-specific provider that handles SSR style injection using `useServerInsertedHTML`.

---

## Component Patterns

### Style Props

Props that directly map to CSS properties with theme-aware values.

**Example:**

```typescript
<Box p="md" bg="primary.5" />
// p = padding, bg = background
```

### Variant

A predefined style configuration for a component.

**Example:** Button variants: `filled`, `outline`, `subtle`

### Size

A predefined size configuration for a component.

**Example:** Button sizes: `xs`, `sm`, `md`, `lg`, `xl`

---

## Theming Terms

### Color Palette

An array of 10 color shades (0-9) for each color in the theme.

**Example:** `primary: ['#e3f2fd', ..., '#0d47a1']`

### Spacing Scale

Predefined spacing values: `xs`, `sm`, `md`, `lg`, `xl`

### Radius Scale

Predefined border radius values: `xs`, `sm`, `md`, `lg`, `xl`

### Breakpoints

Responsive design breakpoints: `xs`, `sm`, `md`, `lg`, `xl`

---

## Accessibility Terms

### ARIA Attributes

Accessibility attributes that provide semantic information to assistive technologies.

**Example:** `aria-label`, `aria-describedby`, `role`

### Focus Trap

A pattern that keeps keyboard focus within a specific component (e.g., Modal).

### Keyboard Navigation

Interaction patterns using keyboard (Tab, Enter, Escape, Arrow keys).

### Screen Reader

Assistive technology that reads UI content aloud for visually impaired users.

---

## TypeScript Terms

### ComponentPropsWithoutRef

React type utility that provides props for an HTML element without the ref.

**Example:**

```typescript
interface ButtonProps extends ComponentPropsWithoutRef<"button"> {}
```

### Generic Component Type

A TypeScript generic that allows polymorphic component typing.

```typescript
<C extends ElementType = 'div'>
```

### Discriminated Union

TypeScript pattern for variant props with type safety.

```typescript
type Variant = "filled" | "outline" | "subtle";
```

---

## Mantine-Inspired Terms

### Polymorphic Factory

The pattern used to create polymorphic components (from Mantine).

### Style Props System

The system that allows CSS-like props on components (from Mantine).

### Factory Function

A function that creates components with specific configurations.

---

## MUI-Inspired Terms

### Theme Provider

The context provider pattern for theming (from MUI).

### sx Prop

Style prop pattern (MUI uses `sx`, Prismui uses style props directly).

### Palette

Color system organization (inspired by MUI's palette structure).

---

## Development Terms

### Stage

A development phase with specific goals and constraints.

### ADR (Architecture Decision Record)

A document recording a significant architectural decision.

### Component API

The public interface (props) of a component.

---

## Abbreviations

| Term     | Full Name                             | Definition                     |
| -------- | ------------------------------------- | ------------------------------ |
| **SSR**  | Server-Side Rendering                 | Rendering React on the server  |
| **CSR**  | Client-Side Rendering                 | Rendering React in the browser |
| **ARIA** | Accessible Rich Internet Applications | Accessibility standard         |
| **WCAG** | Web Content Accessibility Guidelines  | Accessibility guidelines       |
| **HOC**  | Higher-Order Component                | Component wrapper pattern      |
| **JSX**  | JavaScript XML                        | React's syntax extension       |
| **TSX**  | TypeScript XML                        | TypeScript + JSX               |

---

## Cross-References

- **ARCHITECTURE.md**: System structure and patterns
- **MODULES.md**: Package and component organization
- **DATAFLOW.md**: Runtime behavior and flows
- **CODING-CONVENTIONS.md**: Code style and patterns
