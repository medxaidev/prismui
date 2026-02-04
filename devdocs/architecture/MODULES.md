# MODULES (Enforceable)

**Status:** Active  
**Version:** v1.0  
**Scope:** Defines all packages and components in Prismui

---

## 1. Package Structure

```
@prismui/
├── core/           # Core components
├── hooks/          # React hooks
├── theme/          # Theming system
├── styles/         # Style utilities
├── types/          # TypeScript types
└── nextjs/         # Next.js integration
```

---

## 2. Core Package (@prismui/core)

### 2.1 Foundation Components

**Box** - Polymorphic container component

- Base for all components
- Style props support
- Polymorphic rendering

**Text** - Typography component

- Text rendering with theme
- Size, weight, color variants

**Button** - Interactive button component

- Multiple variants (filled, outline, subtle)
- Size variants
- Loading and disabled states
- Icon support

### 2.2 Layout Components

**Stack** - Vertical/horizontal layout
**Group** - Horizontal group with spacing
**Grid** - CSS Grid layout
**Container** - Max-width container
**Flex** - Flexbox layout

### 2.3 Input Components

**Input** - Base input component
**TextInput** - Text input field
**Textarea** - Multi-line input
**Select** - Dropdown select
**Checkbox** - Checkbox input
**Radio** - Radio button

### 2.4 Feedback Components

**Modal** - Dialog/modal overlay
**Alert** - Alert messages
**Notification** - Toast notifications
**Loader** - Loading indicators

---

## 3. Hooks Package (@prismui/hooks)

**useTheme** - Access theme context
**useStyles** - Create component styles
**useMediaQuery** - Responsive breakpoints
**useClickOutside** - Detect outside clicks
**useFocusTrap** - Trap focus in component
**useId** - Generate unique IDs (SSR-safe)

---

## 4. Theme Package (@prismui/theme)

**PrismuiProvider** - Root provider
**PrismuiThemeProvider** - Theme-only provider
**createTheme** - Theme factory
**defaultTheme** - Default theme object
**cssVariablesResolver** - CSS var generation

---

## 5. Styles Package (@prismui/styles)

**createStyles** - Style factory function
**rem** - Convert px to rem
**em** - Convert px to em
**rgba** - Color with opacity
**darken/lighten** - Color manipulation

---

## 6. Types Package (@prismui/types)

**ThemeConfig** - Theme configuration
**ComponentProps** - Component prop types
**PolymorphicComponent** - Polymorphic types
**StylesAPI** - Styles API types

---

## 7. Next.js Package (@prismui/nextjs)

**PrismuiAppProvider** - App Router provider
**useServerInsertedHTML** - SSR style injection

---

## 8. Dependency Rules (ENFORCED)

- `@prismui/core` depends on: `theme`, `hooks`, `styles`, `types`
- `@prismui/hooks` depends on: `types`
- `@prismui/theme` depends on: `types`
- `@prismui/styles` depends on: `types`
- `@prismui/types` has NO dependencies
- `@prismui/nextjs` depends on: `core`, `theme`

Circular dependencies are **FORBIDDEN**.

---

## 9. Stage-1 Module Allowlist

**Allowed in Stage-1:**

- @prismui/types (all)
- @prismui/theme (core system)
- @prismui/hooks (useTheme, useId)
- @prismui/styles (createStyles, utilities)
- @prismui/core (Box, Text, Button only)

**Forbidden in Stage-1:**

- Complex components (Modal, DataTable, etc.)
- Advanced hooks
- Animation utilities

---

## 10. Component Development Priority

**Priority 1 (Stage-1):** Box, Text, Button, Stack, Group
**Priority 2 (Stage-2):** Input, TextInput, Select, Checkbox, Radio
**Priority 3 (Stage-3):** Modal, Alert, Notification, Loader
**Priority 4 (Stage-4):** DataTable, Calendar, DatePicker, etc.

Components are built based on **MedXAI project needs**.
