# ADR-004: Color Scheme Manager

## Status

**Status:** Accepted  
**Date:** 2026-02-07  
**Deciders:** Project Lead

---

## Context

PrismUI needs to manage color scheme preferences (light / dark / auto) with:

1. **Persistence** — remember the user's choice across page reloads
2. **Cross-tab sync** — switching in one tab updates all tabs
3. **System preference tracking** — `auto` mode follows `prefers-color-scheme`
4. **DOM attribute** — set `data-prismui-color-scheme` for CSS selectors
5. **SSR safety** — no crashes when `window` / `localStorage` are unavailable
6. **Pluggability** — allow custom storage backends (e.g. cookie-based for SSR)

Both Mantine and MUI provide solutions:

| Aspect | Mantine | MUI |
|--------|---------|-----|
| Interface | `ColorSchemeManager` (get/set/subscribe/unsubscribe/clear) | `StorageManager` factory-of-factory (key → get/set/subscribe) |
| Scope | One manager = one key | One manager = multiple keys (mode, lightScheme, darkScheme) |
| subscribe | Separate `subscribe()` + `unsubscribe()` methods | `subscribe()` returns unsubscribe function |
| Named schemes | No (light/dark/auto only) | Yes (e.g. `{ light: 'ocean', dark: 'midnight' }`) |
| FOUC prevention | No built-in | `InitColorSchemeScript` inline `<script>` |
| Complexity | Low | High |

---

## Decision

### 1. Strategy Pattern Interface

Adopt Mantine's simple strategy pattern, but with MUI's cleaner `subscribe` return value:

```typescript
interface PrismuiColorSchemeManager {
  get: (defaultValue: PrismuiColorScheme) => PrismuiColorScheme;
  set: (value: PrismuiColorScheme) => void;
  subscribe: (onUpdate: (value: PrismuiColorScheme) => void) => () => void;
}
```

**Key differences from Mantine:**
- `subscribe` returns `() => void` (unsubscribe function) instead of separate `subscribe` + `unsubscribe` methods — cleaner, no closure coupling
- No `clear` method — `set(defaultValue)` achieves the same result

**Key differences from MUI:**
- Single key per manager (not factory-of-factory) — PrismUI only has light/dark/auto, no named schemes
- No `storageWindow` parameter — single-app scenario (MedXAI)

### 2. Default Implementation: localStorage

```typescript
localStorageColorSchemeManager(options?: { key?: string }): PrismuiColorSchemeManager
```

- Default key: `'prismui-color-scheme'`
- Cross-tab sync via `StorageEvent`
- SSR-safe with `typeof window` guards
- Validates stored values against `'light' | 'dark' | 'auto'`

### 3. useProviderColorScheme Hook

Internal hook consumed by `PrismuiThemeProvider`:

- Initializes state from `manager.get(defaultColorScheme)`
- `setColorScheme(scheme)` — updates state, persists via manager, updates DOM attribute
- `clearColorScheme()` — resets to default
- `forceColorScheme` — when set, ignores all user toggles
- System preference tracking via `matchMedia('(prefers-color-scheme: dark)')`
- Cross-tab sync via `manager.subscribe()`
- Sets `data-prismui-color-scheme` attribute on `document.documentElement`

### 4. No getRootElement Parameter

Mantine allows configuring which DOM element receives the color scheme attribute. This supports Shadow DOM and micro-frontend scenarios. **PrismUI does not need this** — it targets MedXAI as a single-app deployment. The attribute is always set on `document.documentElement`.

### 5. Provider Integration

Both `PrismuiThemeProvider` and `PrismuiProvider` accept an optional `colorSchemeManager` prop:

```tsx
<PrismuiProvider
  colorSchemeManager={localStorageColorSchemeManager()}
  defaultColorScheme="auto"
>
  <App />
</PrismuiProvider>
```

When `colorSchemeManager` is `undefined` or `null`, no persistence occurs — the color scheme is purely in-memory React state.

### 6. Context API

`PrismuiThemeContextValue` exposes:

- `colorScheme: PrismuiResolvedColorScheme` — always `'light'` or `'dark'` (never `'auto'`)
- `setColorScheme: (scheme: PrismuiColorScheme) => void` — accepts `'light' | 'dark' | 'auto'`
- `clearColorScheme: () => void` — resets to default

### 7. Future: InitColorSchemeScript

A `<script>` component (inspired by MUI's `InitColorSchemeScript`) can be added later for SSR FOUC prevention. It would read `localStorage` and set `data-prismui-color-scheme` before React hydrates. This is **not implemented yet** — deferred to SSR support phase.

---

## Consequences

### Positive

- **Simple API** — 3 methods, no factory-of-factory
- **Pluggable** — custom managers (cookie, session storage) can be created by implementing the interface
- **Cross-tab sync** — built into the default localStorage manager
- **SSR-safe** — all browser APIs guarded
- **Clean unsubscribe** — no closure coupling, follows React `useEffect` cleanup pattern

### Negative

- **No named schemes** — only light/dark/auto; adding named schemes later would require interface changes
- **No FOUC prevention yet** — SSR apps may flash the wrong scheme until React hydrates
- **No getRootElement** — cannot target Shadow DOM roots (acceptable for MedXAI)

### Mitigations

- Named schemes are unlikely to be needed for MedXAI
- `InitColorSchemeScript` will be added in the SSR support phase
- `getRootElement` can be added as an optional parameter later if needed

---

## File Map

| File | Role |
|------|------|
| `PrismuiProvider/color-scheme-manager/types.ts` | `PrismuiColorSchemeManager` interface |
| `PrismuiProvider/color-scheme-manager/is-prismui-color-scheme.ts` | Validation helper |
| `PrismuiProvider/color-scheme-manager/local-storage-color-scheme-manager.ts` | localStorage implementation |
| `PrismuiProvider/color-scheme-manager/index.ts` | Barrel exports |
| `PrismuiProvider/use-provider-color-scheme/use-provider-color-scheme.ts` | Core hook |
| `PrismuiProvider/use-provider-color-scheme/index.ts` | Barrel exports |

---

## References

- [Mantine localStorageColorSchemeManager](https://mantine.dev/theming/color-schemes/)
- [MUI useCurrentColorScheme](https://github.com/mui/material-ui/blob/master/packages/mui-system/src/cssVars/useCurrentColorScheme.ts)
- [MUI InitColorSchemeScript](https://github.com/mui/material-ui/blob/master/packages/mui-system/src/InitColorSchemeScript/InitColorSchemeScript.tsx)
- [MUI localStorageManager](https://github.com/mui/material-ui/blob/master/packages/mui-system/src/cssVars/localStorageManager.ts)
- ADR-001: Mantine-MUI Hybrid Architecture
- ADR-002: Color System Architecture
