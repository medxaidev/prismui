# STAGE-001 & STAGE-002: Completion Summary

> **Status:** ✅ Completed  
> **Completion Date:** 2026-02-05  
> **Duration:** ~1 day

---

## What Was Achieved

### Stage-001: Polymorphic Foundation (Phase 1)

#### ✅ Milestone A: Buildable Core

- Monorepo structure established (npm workspaces)
- `@prismui/core` package created with proper structure
- TypeScript configuration aligned for library development
- Build tooling configured (esbuild + api-extractor)
- Package exports properly configured for ESM/CJS dual output

#### ✅ Milestone B: Type System Proven

- **Polymorphic type system implemented** in `packages/core/src/types/polymorphic/`:
  - `ElementType`: Union of intrinsic elements + React components
  - `JSXProps`: Uses `LibraryManagedAttributes` + `ComponentPropsWithoutRef`
  - `PolymorphicRef`: Extracts correct ref type per component
  - `MergeProps`: Merges props with override precedence
  - `PolymorphicComponentProps`: Core polymorphic props type with explicit `ref` support
  - `createPolymorphicComponent`: Type-level helper for ergonomic polymorphic components

- **Type inference validated**:
  - `<Box component="a" href="..." />` ✅ (href allowed)
  - `<Box href="..." />` ❌ (href not valid on default div)
  - `<Box component="button" type="submit" />` ✅ (type allowed)
  - Ref types correctly inferred based on `component` prop

#### ✅ Milestone C: Box Runtime Proven

- **Box component** (`packages/core/src/components/Box/`):
  - Renders as `div` by default
  - Polymorphic via `component` prop
  - Forwards `ref` correctly to underlying element
  - Passes `className`, `style`, and all native HTML attributes
  - Supports `StyleProp` and `CSSVars` types (runtime resolution deferred to Stage-003)

- **Text component** (`packages/core/src/components/Text/`):
  - Built on top of Box
  - Renders as `span` by default
  - Inherits full polymorphic behavior
  - Validates type system works for derived components

#### ✅ Milestone D: Validation Gate

- **Tests passing** (15 tests total):
  - `Box.test.tsx`: 10 tests (runtime + type-level)
  - `Text.test.tsx`: 5 tests (runtime + type-level)
  - Type-level tests use `@ts-expect-error` to validate inference
  - All runtime behaviors verified (rendering, props, refs)

- **Commands validated**:
  - `npm test` ✅ (all tests pass)
  - `npm run typecheck` ✅ (no type errors)

---

### Stage-002: Build Tooling

#### ✅ Build Pipeline Established

- **Build script** (`packages/core/scripts/esbuild.mjs`):
  - Uses `tsc` for type declarations (`dist/lib/*.d.ts`)
  - Uses `api-extractor` for single-file type rollup (`dist/index.d.ts`)
  - Uses `esbuild` for ESM/CJS bundling
  - Generates proper subpath `package.json` files for ESM/CJS

- **Output structure**:

  ```
  packages/core/dist/
  ├── index.d.ts              # Rolled-up types (api-extractor)
  ├── lib/                    # Individual d.ts files (tsc)
  │   └── index.d.ts
  ├── esm/
  │   ├── index.mjs           # ESM bundle
  │   ├── index.d.ts          # Types copy
  │   └── package.json        # {"type": "module"}
  └── cjs/
      ├── index.cjs           # CJS bundle
      ├── index.d.ts          # Types copy
      └── package.json        # {"type": "commonjs"}
  ```

- **Package exports aligned**:
  ```json
  {
    "main": "./dist/cjs/index.cjs",
    "module": "./dist/esm/index.mjs",
    "types": "./dist/index.d.ts",
    "exports": {
      ".": {
        "import": {
          "types": "./dist/esm/index.d.ts",
          "default": "./dist/esm/index.mjs"
        },
        "require": {
          "types": "./dist/cjs/index.d.ts",
          "default": "./dist/cjs/index.cjs"
        }
      }
    }
  }
  ```

#### ✅ Build Commands Working

- `npm run clean` - Clears dist folder
- `npm run build` - Full build (tsc → api-extractor → esbuild)
- `npm run typecheck` - Type checking without emit

---

## Key Technical Decisions

### 1. Polymorphic Type Strategy (Mantine-style)

- **Decision**: Use `ComponentPropsWithoutRef` in `JSXProps` + explicit `ref` in `PolymorphicComponentProps`
- **Rationale**: Avoids ref duplication/conflicts, aligns with Mantine's proven approach
- **Alternative considered**: Using `ComponentPropsWithRef` directly (rejected due to potential type conflicts)

### 2. Build Tooling (esbuild + api-extractor)

- **Decision**: Use `esbuild` for JS bundling, `tsc` for d.ts, `api-extractor` for type rollup
- **Rationale**:
  - esbuild: Fast, simple, handles ESM/CJS well
  - api-extractor: Single-file d.ts improves consumer experience
  - tsc: Only for declaration generation (emitDeclarationOnly)
- **Alternative considered**: tsup (rejected as user already had esbuild setup)

### 3. Package Structure

- **Decision**: Keep polymorphic types inside `@prismui/core`
- **Rationale**: Avoid premature package splitting, types are tightly coupled to components
- **Future**: May extract to `@prismui/types` if multiple packages need shared types

### 4. Runtime vs Type-only Props

- **Decision**: `className`/`style` forwarded immediately, `StyleProp`/`CSSVars` resolution deferred
- **Rationale**: Stage-001 focuses on polymorphism, theme-aware style resolution belongs in Stage-003

---

## File Structure (Final)

```
packages/core/
├── src/
│   ├── components/
│   │   ├── Box/
│   │   │   ├── Box.tsx
│   │   │   ├── Box.test.tsx
│   │   │   └── index.ts
│   │   └── Text/
│   │       ├── Text.tsx
│   │       ├── Text.test.tsx
│   │       └── index.ts
│   ├── types/
│   │   ├── polymorphic/
│   │   │   ├── element-type.ts
│   │   │   ├── jsx-props.ts
│   │   │   ├── polymorphic-ref.ts
│   │   │   ├── merge-props.ts
│   │   │   ├── polymorphic-component-props.ts
│   │   │   ├── create-polymorphic-component.ts
│   │   │   ├── render-root.ts (not exported in Stage-001)
│   │   │   └── index.ts
│   │   ├── css-properties.ts
│   │   ├── css-vars.ts
│   │   ├── style-prop.ts
│   │   └── index.ts
│   └── index.ts
├── scripts/
│   └── esbuild.mjs
├── api-extractor.json
├── package.json
└── tsconfig.json
```

---

## Public API (Exported from @prismui/core)

### Components

- `Box` - Polymorphic base component
- `Text` - Polymorphic text component (based on Box)

### Types

- `BoxProps`
- `TextProps`
- `ElementType`
- `JSXProps<C>`
- `PolymorphicRef<C>`
- `MergeProps<Props, OverrideProps>`
- `PolymorphicComponentProps<C, Props>`
- `CSSProperties`
- `CSSVariable`, `CSSVariables`, `CSSVars`
- `StyleProp`

### Utilities

- `createPolymorphicComponent<DefaultC, Props, StaticComponents>()`

---

## What's NOT in Stage-001/002 (Intentionally Deferred)

- ❌ Theme system (PrismuiProvider, theme context, CSS variables runtime)
- ❌ Style props system (`p`, `m`, `bg`, `c` shorthand props)
- ❌ StyleProp/CSSVars runtime resolution (functions, arrays, theme access)
- ❌ SSR style injection (Next.js App Router integration)
- ❌ Design tokens (colors, spacing, typography scales)
- ❌ Component variants/sizes system
- ❌ Accessibility utilities (focus management, ARIA)
- ❌ Additional components (Button, Input, etc.)

---

## Validation Checklist ✅

- [x] `npm test` passes (15/15 tests)
- [x] `npm run typecheck` passes (no type errors)
- [x] `npm run build -w @prismui/core` generates correct dist structure
- [x] Type inference works for polymorphic components
- [x] `@ts-expect-error` type tests validate prop restrictions
- [x] Box renders correct elements based on `component` prop
- [x] Ref forwarding works for all element types
- [x] className and style props pass through to DOM
- [x] Text component inherits polymorphic behavior from Box
- [x] Package exports align with build outputs

---

## Known Issues / Technical Debt

### Minor (Non-blocking)

1. **api-extractor TSDoc warnings** in `style-prop.ts`:
   - Warning about `>` character in comments
   - Does not affect build output or type correctness
   - Can be fixed by escaping or reformatting comments

### None (Critical)

- No critical issues identified

---

## Next Stage Recommendations

Based on `STAGE-001-SUMMARY.md` Phase 2, the next logical step is:

### **Stage-003: Theme System (Phase 2)**

**Why Theme System Next?**

- It's the most complex part of the architecture
- Foundation for all styling and design tokens
- Must work perfectly before adding style props
- Touches React Context, CSS variables, SSR

**Key Deliverables:**

1. Theme type definitions (`ThemeConfig`, `ColorPalette`, `Spacing`, `Typography`)
2. Default theme (MUI-inspired colors, Chinese-friendly fonts)
3. `createTheme()` factory function
4. CSS variables generation from theme
5. `PrismuiProvider` (theme context + CSS vars injection)
6. `useTheme()` hook
7. SSR support skeleton (for Next.js App Router)
8. Update Box/Text to access theme context

**Success Criteria:**

- Can customize theme via `<PrismuiProvider theme={customTheme}>`
- Theme can be switched at runtime
- CSS variables are injected into DOM
- SSR works without flash of unstyled content (FOUC)

---

## Lessons Learned

1. **Polymorphic types are subtle**: The `ref` handling required careful consideration of `ComponentPropsWithRef` vs `ComponentPropsWithoutRef`.

2. **Build tooling needs alignment**: Package exports, tsconfig outDir, and api-extractor paths must all be consistent.

3. **Type-level tests are critical**: `@ts-expect-error` tests catch type inference bugs that runtime tests miss.

4. **Incremental validation works**: Building Box → Text → verifying both validated the polymorphic system without over-engineering.

5. **Documentation-driven development**: Having clear Stage definitions prevented scope creep and kept focus on core objectives.

---

## Time Investment

- **Stage-001 (Polymorphic Foundation)**: ~4-6 hours
  - Type system design and implementation
  - Box component + tests
  - Text component + tests
  - Type inference validation

- **Stage-002 (Build Tooling)**: ~1-2 hours
  - esbuild script setup
  - api-extractor configuration
  - Package exports alignment
  - Build verification

**Total**: ~5-8 hours for a production-ready polymorphic component foundation with full build pipeline.

---

## References

- Original plan: `STAGE-001-Core-System.md`
- Restructured plan: `STAGE-001-SUMMARY.md`
- Mantine polymorphic reference: https://mantine.dev/guides/polymorphic/
- MUI polymorphic reference: https://mui.com/material-ui/guides/composition/
