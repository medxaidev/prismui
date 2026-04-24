/**
 * Core systems barrel — re-exports every system sub-directory.
 *
 * Each core sub-directory owns its own `index.ts` (curated public surface).
 * This aggregator is the single import point for `../index.ts` (the package
 * root barrel), so the root does not need to enumerate per-system keys.
 *
 * ## Layering rule
 *
 * ```
 * packages/core/src/index.ts
 *   └── packages/core/src/core/index.ts        ← THIS FILE (aggregator)
 *         └── packages/core/src/core/{system}/index.ts   (authorship)
 * ```
 *
 * ## Adding a new core system
 *
 * 1. Create `packages/core/src/core/{system}/index.ts` exporting the
 *    public API of that system (values + types).
 * 2. Add one line here — `export * from './{system}';`.
 * 3. The root barrel picks up the new symbols automatically.
 *
 * ## Why `export *`
 *
 * Every sub-barrel already curates its public surface (internal
 * implementation files do NOT leak through). `export *` keeps one source
 * of truth per system. Cross-system name collisions surface as TS
 * duplicate-export errors at THIS aggregator — the intended meeting point
 * for resolving any ambiguity.
 */

export * from './theme';
export * from './state';
export * from './props';
export * from './size';
export * from './action';
export * from './radius';
export * from './variant';
export * from './component';
export * from './styles';
export * from './polymorphic';
export * from './interaction-events';
