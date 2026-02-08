# Responsive Design Constraints (Enforceable)

**Status:** Active  
**Version:** v1.0  
**Scope:** Defines all responsive prop constraints and conventions for the PrismUI design system.

Any responsive behavior in components, layouts, or the style system **must** follow this specification. Violations require an ADR.

---

## 1. Design Philosophy

### 1.1 Mobile First

All responsive design **must start from the smallest viewport**.

- `base` represents the default behavior at the smallest supported viewport
- Larger breakpoints are used only to **enhance**, never to fix

> Principle: **Base must always be safe, usable, and complete.**

### 1.2 Override Model (Not Reset)

Responsive values follow a cascading override model:

```text
base → sm → md → lg → xl
```

- Undeclared breakpoints inherit the nearest smaller breakpoint value
- "Reverse corrections" at larger breakpoints are forbidden

---

## 2. Breakpoint Semantics

| Breakpoint | Semantic Role       | Typical Devices          |
|------------|--------------------|--------------------------| 
| base       | Default / minimum  | Small phones             |
| sm         | Relaxed layout     | Large phones / small tablets |
| md         | Layout shift point | Tablets / small desktops |
| lg         | Desktop enhancement| Desktops                 |
| xl         | High-density       | Large / ultra-wide screens |

> Note: Breakpoints are **semantic tools**, not device lists.

---

## 3. Base Constraints (Mandatory)

### 3.1 Base Must Be Self-Sufficient

When only `base` values are applied, a component **must**:

- Not break its layout
- Not overflow content
- Not depend on hover or fine-pointer interactions

> Base ≠ desktop default

### 3.2 Recommended Base Characteristics

| Dimension | Base Behavior         |
|-----------|-----------------------|
| Layout    | Single column / stack |
| Spacing   | Compact but not cramped |
| Font size | Minimum readable      |
| Interaction | Touch-friendly      |
| Information | Low density          |

---

## 4. Responsive Value Rules

### 4.1 Explicit Base Principle (Mandatory)

All responsive props **must** satisfy one of:

- Explicitly declare `base`
- Or the component documentation clearly states the default base behavior

❌ Forbidden:

```ts
m={{ sm: 1, md: 4 }}
```

✅ Required:

```ts
m={{ base: 1, md: 4 }}
```

### 4.2 Monotonic Non-Decreasing Principle (Mandatory)

The following properties **must be non-decreasing** across breakpoints:

- Spacing (margin / padding / gap)
- Size (width / height / minSize)
- Density (columns / grid count)

❌ Forbidden:

```ts
p={{ base: 4, md: 1 }}
```

### 4.3 Maximum Breakpoint Count (Mandatory)

Maximum number of breakpoints per single property:

- **Recommended: ≤ 3**
- **Hard limit: 4** (requires justification)

❌ Forbidden — meaningless full-breakpoint declarations:

```ts
m={{ base: 1, sm: 2, md: 3, lg: 4, xl: 5 }}
```

### 4.4 Skipping Breakpoints (Allowed)

Skipping intermediate breakpoints is allowed when:

- The intermediate breakpoint behavior equals the base
- `md` / `lg` are clear layout transition points

```ts
columns={{ base: 1, md: 3 }}
```

---

## 5. Type System Constraints (Recommended)

### 5.1 Responsive Value Type

```ts
type Breakpoint = 'base' | 'sm' | 'md' | 'lg' | 'xl';

type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>;
```

Recommended enhancements:

- Lint rules to detect decreasing trends
- Design-token validation

---

## 6. Component-Level Responsibilities

### 6.1 Component Authors Must Ensure

- The component works correctly with only `base` values
- Responsive behavior does not break semantic structure
- Props documentation clearly states the responsive strategy

### 6.2 Forbidden Behaviors

- Depending on a specific breakpoint to be usable
- Using breakpoints to fix base defects
- Implicit responsive behavior (magic behavior)

---

## 7. Documentation & Review

### 7.1 Documentation Requirements

All components supporting responsive props must document:

- Base behavior
- Primary breakpoint transition points
- Recommended usage patterns

### 7.2 Review Checklist

- [ ] Is base self-sufficient?
- [ ] Is it mobile-first?
- [ ] Are there any decreasing responsive values?
- [ ] Are breakpoints overused?
- [ ] Is an ADR needed?

---

## 8. Design Baseline

> **Responsive design is the art of restraint, not a capability showcase.**

If a component needs 5 breakpoints to work,  
the problem is not the breakpoints — it is the design itself.

---

## 9. Appendix: Recommended Patterns

```tsx
<Card
  p={{ base: 2, md: 4 }}
  gap={{ base: 1, md: 2 }}
  columns={{ base: 1, lg: 2 }}
/>
```

---

**End of Document**
