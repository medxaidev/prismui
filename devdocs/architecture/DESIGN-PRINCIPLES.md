# PrismUI Design Principles

This document captures PrismUI's design and development principles.
It is intentionally opinionated and practical.

The goal is not to maximize configuration.
The goal is to ship a small set of components that look great by default,
remain consistent over time, and are easy to evolve.

---

## 1. Positioning

PrismUI is built for real product work.
It is primarily a library the maintainers will use directly.
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

## 8. Practical Guidance for New Components

When creating a component:

1. Study the equivalent component in Mantine and MUI/Joy UI.
2. Define the minimal API (props, sizes, variants) that covers real needs.
3. Decide beautiful defaults first (before adding configuration).
4. Ensure theme-level micro-adjustments are sufficient for most use cases.
5. Validate with Storybook examples and unit tests.
