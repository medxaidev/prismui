/**
 * Components barrel — re-exports every component sub-directory.
 *
 * Each component directory owns its own `index.ts` (value + type exports).
 * This aggregator is the single import point for `../index.ts` (the package
 * root barrel), so the root does not need to enumerate per-component keys.
 *
 * ## Layering rule
 *
 * ```
 * packages/core/src/index.ts
 *   └── packages/core/src/components/index.ts   ← THIS FILE (aggregator)
 *         └── packages/core/src/components/{Component}/index.ts   (authorship)
 * ```
 *
 * ## Adding a new component
 *
 * 1. Create `packages/core/src/components/{Component}/index.ts` exporting
 *    the public API of that component (values + types).
 * 2. Add one line here — `export * from './{Component}';`.
 * 3. The root barrel picks up the new symbols automatically.
 *
 * ## Why `export *`
 *
 * Every sub-barrel already curates its public surface (no internal files
 * leak through). `export *` re-exports the sub-barrel's named exports
 * verbatim, so there is one source of truth per component. If two
 * components ever collide on a name, TS raises a duplicate-export error at
 * this aggregator — which is exactly where the conflict should be
 * resolved.
 */

export * from './Button';
export * from './IconButton';
export * from './ToggleButton';
export * from './Input';
export * from './Textarea';
export * from './Field';
export * from './Switch';
export * from './Checkbox';
export * from './Radio';
export * from './Popover';
export * from './Tooltip';
export * from './Modal';
