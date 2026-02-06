# ADR-003: CSS Injection & Style Engine Architecture

## Status

**Status:** Accepted  
**Date:** 2026-02-06  
**Deciders:** Project Lead

---

## Context

PrismUI needs a strategy for delivering CSS to the browser. This covers three concerns:

1. **Theme CSS variables** — global `--prismui-*` custom properties
2. **System props** — shorthand style props like `p="md"`, `bg="primary.main"`
3. **Component styles** — per-component CSS rules (`.prismui-button-filled { ... }`)

### Constraints

- Must work in both SPA and SSR (Next.js App Router) environments
- Must avoid inline styles for system props (specificity and DOM size concerns)
- Must be lightweight — no Emotion, styled-components, or other CSS-in-JS runtime dependency
- Must allow external CSS to override component styles
- Should use a single unified mechanism where possible

### Alternatives Evaluated

| Approach | Used By | Pros | Cons |
|----------|---------|------|------|
| Emotion CSS-in-JS runtime | MUI | Powerful, scoped | ~11KB runtime, RSC incompatible without workarounds |
| `<style dangerouslySetInnerHTML>` + inline style | Mantine | Simple, RSC-safe for theme vars | Inline styles for system props: highest specificity, DOM bloat, no external override |
| Static CSS file + CSSOM `insertRule` | **PrismUI** | Zero runtime dep, atomic class reuse, overridable | Requires SSR registry for first-paint |

---

## Decision

### Two-Layer Architecture

```
Layer 1: Theme CSS Variables  →  Static style.css (build-time, imported by consumer)
Layer 2: System Props + Component Styles  →  insertCssOnce() (runtime, CSSOM atomic classes)
```

### Layer 1 — Theme CSS Variables (`style.css`)

Theme CSS variables are generated at build time and delivered as a static CSS file.

```css
/* @prismui/core/styles.css */
:root {
  --prismui-color-blue-50: #E3F2FD;
  --prismui-color-blue-100: #BBDEFB;
  /* ... all color families × 10 shades */

  --prismui-palette-primary-main: var(--prismui-color-blue-500);
  --prismui-palette-primary-light: var(--prismui-color-blue-300);
  /* ... all semantic palette tokens */

  --prismui-spacing-xs: 0.5rem;
  --prismui-spacing-sm: 0.75rem;
  /* ... */
}
```

**Consumer usage:**

```typescript
// app/layout.tsx or main entry
import '@prismui/core/styles.css';
```

**Rationale:**
- Zero runtime cost — CSS is parsed by the browser natively
- SSR-safe — no JS needed for first paint
- Cacheable by CDN/browser
- Theme customization via CSS variable overrides or `createTheme()` + Provider

### Layer 2 — System Props & Component Styles (`insertCssOnce`)

All dynamic styles (system props, component CSS) are injected at runtime via a single `<style data-prismui-style-engine>` element using CSSOM `insertRule`.

**System props flow:**

```typescript
// Developer writes:
<Box p="md" bg="primary.main">Hello</Box>

// PrismUI internally:
// 1. Parse system props → deterministic class names
//    p="md"             → "prismui-p-md"
//    bg="primary.main"  → "prismui-bg-primary-main"
//
// 2. insertCssOnce (first encounter only):
//    .prismui-p-md { padding: var(--prismui-spacing-md); }
//    .prismui-bg-primary-main { background: var(--prismui-palette-primary-main); }
//
// 3. Render output:
<div class="prismui-p-md prismui-bg-primary-main">Hello</div>
```

**Key characteristics:**
- **Atomic classes** — each prop-value pair maps to exactly one class
- **Deduplicated** — 100 `<Box p="md">` instances share one `.prismui-p-md` rule
- **Deterministic naming** — class names are derived from prop + value, not hashed from CSS content
- **CSS variable references** — rules reference `var(--prismui-*)`, not hardcoded values
- **Overridable** — class specificity is lower than inline styles; external CSS can override

**SSR support:**
- On the server, `insertCssOnce` delegates to a `PrismuiStyleRegistry`
- The registry collects all CSS rules during render
- `useServerInsertedHTML` (Next.js) or equivalent flushes collected CSS into `<style>` tags in the HTML response

### Implementation: `insertCssOnce`

Core API (already implemented):

```typescript
function insertCssOnce(
  id: string,           // Unique rule identifier (e.g., "prismui-p-md")
  cssText: string,      // CSS rule text
  registry?: PrismuiStyleRegistry  // SSR collection target
): void
```

Behavior:
1. **Browser:** Find or create `<style data-prismui-style-engine>` in `<head>`
2. **Dedup:** Hash `cssText`, skip if same hash already inserted for this `id`
3. **Inject:** Use `sheet.insertRule()` (CSSOM, no DOM reflow); fallback to `textNode.append`
4. **Server:** Call `registry.insert(id, cssText)` for SSR collection

---

## Consequences

### Positive

- **Zero external dependency** — no Emotion, no styled-components
- **No inline styles** — all styling via classes, externally overridable
- **High performance** — `insertRule` avoids DOM parsing; atomic classes are reused across instances
- **Small DOM** — no per-element `style` attributes
- **SSR compatible** — registry pattern works with Next.js App Router
- **Single mechanism** — one `<style>` element for all runtime CSS

### Negative

- **First render requires JS** — atomic classes are injected at runtime (mitigated by SSR registry)
- **Class name management** — need stable, predictable naming convention
- **No static extraction** — unlike Tailwind, unused atomic classes aren't tree-shaken at build time (but they're only generated when used, so no waste)

### Mitigations

- SSR registry ensures first-paint CSS is in the HTML response
- Deterministic class naming (`prismui-{prop}-{value}`) avoids hash instability
- Runtime-only generation means zero unused CSS (better than Tailwind's purge step)

---

## Comparison Summary

| Dimension | MUI | Mantine | **PrismUI** |
|-----------|-----|---------|-------------|
| Theme vars | Emotion runtime | `<style dangerouslySetInnerHTML>` | **Static `style.css`** |
| System props | Not supported | Inline `style` attribute | **Atomic CSS classes** |
| Component styles | Emotion `css()` | `<style>` + CSS modules | **`insertCssOnce` CSSOM** |
| Runtime dep | Emotion (~11KB) | None | **None** |
| SSR | Emotion cache flush | `<style>` direct output | **Registry + `useServerInsertedHTML`** |
| Specificity | Class (Emotion) | Inline (highest, unoverridable) | **Class (overridable)** |
| Deduplication | Emotion internal | None (per-element inline) | **Hash-based dedup** |

---

## File Map

| File | Role |
|------|------|
| `css-vars.ts` | Generate theme CSS variable declarations for `style.css` |
| `style-engine/insert-css.ts` | `insertCssOnce()` — CSSOM injection + SSR registry |
| `style-engine/style-registry.ts` | `PrismuiStyleRegistry` — SSR CSS collection |
| `style-engine/index.ts` | Barrel exports |
| `providers/PrismuiProvider.tsx` | ThemeContext + registry integration |
| `providers/PrismuiAppProvider.tsx` | Next.js SSR bridge |

---

## References

- ADR-001: Mantine-MUI Hybrid Architecture
- ADR-002: Color System Architecture
- [Mantine CSS Variables](https://mantine.dev/styles/css-variables/)
- [MUI System Props](https://mui.com/system/getting-started/)
- [Panda CSS Atomic Approach](https://panda-css.com/)
- [CSSOM insertRule](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet/insertRule)
