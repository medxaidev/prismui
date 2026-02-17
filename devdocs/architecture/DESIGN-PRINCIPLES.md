# PrismUI Design Principles

**Version**: 2.0 — Runtime Platform Era  
**Last Updated**: 2026-02-17  
**Authority**: [ADR-011](../decisions/ADR-011-Runtime-Platform-Architecture.md)

This document captures PrismUI's design and development principles.
It is intentionally opinionated and practical.

The goal is not to maximize configuration.
The goal is to ship a platform that enables large-scale applications with beautiful components,
runtime coordination, and programmatic control.

---

## 1. Positioning

> **PrismUI is a Composable UI Runtime Platform for Large-Scale Applications.**

PrismUI is **not just a component library** — it is a runtime platform that provides:

- **Design System**: Beautiful components with thoughtful defaults
- **Runtime System**: Overlay coordination, focus management, positioning
- **Programmatic APIs**: Imperative control (dialog.confirm(), toast.show())
- **Module System**: Tree-shakable, opt-in capabilities

PrismUI is built for real product work, primarily for the maintainers' use.
If it becomes useful to other developers, that is a welcome consequence.

---

## 2. Hybrid Philosophy

PrismUI is a deliberate hybrid of two proven ecosystems:

### 2.1 Learn from Mantine (engineering)

- Prefer a consistent component architecture and internal patterns.
- Prefer theme-based micro-adjustments over component forks.
- Prefer strong TypeScript inference and predictable APIs.
- Prefer composability and clear layering (defaults -> theme -> user props).

### 2.2 Learn from MUI / Joy UI (design)

- Prefer visually refined defaults (spacing, radius, shadows, typography).
- Prefer thoughtful interaction details (hover/active/focus/disabled states).
- Prefer density and readability that works for real dashboards and forms.
- Prefer a design language that has been validated by large adoption.

---

## 3. Defaults Must Be Beautiful

The default appearance of each component must be acceptable in production.

- Theme customization should usually be a micro-adjustment.
- If a component needs heavy customization to look good, the defaults are wrong.

---

## 4. Constrained API Surface

We intentionally avoid over-configuring components.
More props and more variants are not automatically better.

### 4.1 Sizes

- Default guideline: `sm | md | lg`.
- If a component truly requires more granularity, it must be justified.
- Avoid "five sizes" unless there is a strong product-driven reason.

### 4.2 Variants

- Default guideline: keep variants to 3 (for example: `filled | outline | ghost`).
- New variants must be justified by real usage, not by symmetry or completeness.

### 4.3 Escape hatches

- Prefer one or two clear escape hatches over many special-case props.
- Escape hatches must not become the primary usage pattern.

---

## 5. Theme Customization Is for Micro-adjustments

A theme should enable small changes that apply consistently across the app:

- Adjust default props globally (density, radius, sizes).
- Adjust design tokens (spacing, colors, typography).
- Adjust component-level styling without rewriting components.

A theme is not meant to turn PrismUI into an arbitrary style framework.

---

## 6. Design Details Matter

Components must treat visual details as first-class:

- Clear focus indicators and keyboard navigation.
- Balanced spacing and typographic rhythm.
- Predictable hover/active/disabled states.
- Consistent border, radius, and shadow decisions.

The "engineering" layer should make these details easy to implement,
but the product quality comes from choosing good defaults.

---

## 7. Build for Maintainability

- Prefer a small set of well-tested core primitives.
- Avoid adding options that cannot be maintained.
- Avoid scope creep: build components only when they are needed.

---

## 8. Runtime Platform Principles

### 8.1 Separation of Concerns

**Runtime ≠ Design System**

- Runtime modules (Overlay, Focus, Positioning) MUST NOT access theme tokens
- Design components (Dialog, Drawer) MUST NOT contain runtime logic
- Behavior bases (ModalBase) bridge runtime and design

### 8.2 Four-Layer Architecture

Complex overlay components MUST follow:

1. **Layer 0**: Runtime Kernel (module system)
2. **Layer 1**: Runtime Systems (coordination)
3. **Layer 2**: Behavior Bases (integration)
4. **Layer 3**: Semantic Components (design)
5. **Layer 4**: Programmatic Controllers (imperative APIs)

### 8.3 Module-First Design

- All runtime capabilities via pluggable modules
- No boolean flags for features
- Tree-shakable by default
- Third-party extensible

---

## 9. Practical Guidance for New Components

When creating a component:

1. Study the equivalent component in Mantine and MUI/Joy UI.
2. Determine if it requires runtime coordination (overlay, positioning, etc.)
3. If yes, follow four-layer architecture; if no, use standard factory pattern
4. Define the minimal API (props, sizes, variants) that covers real needs.
5. Decide beautiful defaults first (before adding configuration).
6. Ensure theme-level micro-adjustments are sufficient for most use cases.
7. Validate with Storybook examples and unit tests.

### 9.1 For Runtime-Coordinated Components

Additional steps:

1. Identify which Layer 1 runtime system it depends on (Overlay, Focus, Positioning)
2. Create or use existing Layer 2 behavior base
3. Build Layer 3 semantic component with design tokens
4. Consider if Layer 4 programmatic API is needed (dialog.confirm(), toast.show())
5. Ensure proper module dependencies are documented
