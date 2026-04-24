/**
 * `@prismui/core` public API barrel.
 *
 * Layering rule (strictly hierarchical · never reach past one level):
 *
 * ```
 * packages/core/src/index.ts                         ← THIS FILE (package root)
 *   ├── ./core/index.ts                              ← core systems aggregator
 *   │     └── ./core/{theme|state|props|size|action|radius|variant|
 *   │                component|styles|polymorphic}/index.ts
 *   ├── ./components/index.ts                        ← components aggregator
 *   │     └── ./components/{Button|IconButton|ToggleButton|Input|Field|Switch}/index.ts
 *   └── ./hooks/index.ts                             ← hooks aggregator
 * ```
 *
 * Each level may ONLY re-export from its immediate children. Skipping levels
 * (e.g. the root importing directly from `./core/theme`) is forbidden —
 * routing everything through the aggregator gives us:
 *
 *   1. **Single source of truth** — the sub-barrel decides what is public.
 *      A refactor inside a system can add / rename internal files freely
 *      as long as the sub-barrel's surface is preserved; the package
 *      root is unaffected.
 *   2. **Centralized collision detection** — any cross-system name clash
 *      produces a TS duplicate-export error at the aggregator that owns
 *      both offenders, exactly where humans look when resolving it.
 *   3. **Predictable layering** — new features land in exactly ONE place
 *      (the sub-barrel). The aggregators are boring "one line per child"
 *      files that almost never change.
 *
 * The small legacy helpers (`CoreConfig` / `hello`) are kept at the root
 * because they are not owned by any specific system — they predate the
 * current layering and are scheduled for removal once the demo / docs
 * site drops its dependency on them.
 */

export interface CoreConfig {
  name: string;
}

export const hello = () => {
  console.log('Hello from core!');
};

// ── Aggregators (one level down · never reach past) ────────────────────────
export * from './core';
export * from './components';
export * from './hooks';
export * from './feedbacks';
