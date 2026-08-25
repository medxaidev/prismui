# AGENTS.md

## Toolchain

**Package manager is pnpm** (pinned via `packageManager` in `package.json`). Never
run `npm install` / `npm ci` here — it will recreate `package-lock.json` and
desync the lockfile. Workspaces are declared in `pnpm-workspace.yaml`, not in
`package.json`.

## Verified commands

Run from the repo root:

| Command | Purpose |
|---|---|
| `pnpm install` | Install all workspace dependencies |
| `pnpm typecheck` | `tsc --noEmit` across the repo |
| `pnpm exec vitest run` | Full suite, single pass (`pnpm test` starts watch mode) |
| `pnpm build` | Build every workspace package |
| `pnpm build:core` | Build `@prismui/core` only |
| `pnpm storybook` | Dev server on port 6006 (`pnpm dev` is an alias) |

Baseline as of 2026-08-19: `pnpm typecheck` clean, **2197 tests across 81 files**.
A test-count delta of more than ~5% against this number is worth investigating.

## Gotchas

**`.css.d.ts` are committed as tcm output (v0.1 · D-5 resolved).** The `tcm src`
step regenerates `packages/core/src/**/*.css.d.ts`; the committed files now
match tcm's exact output (`export = styles` + quoted keys), so `pnpm build` /
`tcm:watch` are idempotent — no working-tree churn. Do NOT hand-edit these
stubs to `export default` (that reintroduces the churn). They are dev-time type
stubs only, never shipped (not in `files`).

**Flaky tests resolved (v0.1 · D-1).** The two former flakies are fixed:
`useDismissal` dedup switched from a `performance.now()` window to a
`queueMicrotask` round model (load-independent); `testTimeout`/`hookTimeout`
raised to 15s for parallel-load headroom (Modal `await import` smoke). Full
suite is stable green across repeated runs.

**Upgrading to pnpm 10+** requires opting esbuild back into lifecycle scripts,
since pnpm 10 stopped running dependency build scripts by default:

```yaml
# pnpm-workspace.yaml
onlyBuiltDependencies:
  - esbuild
```

Without this, `pnpm build` fails when esbuild's binary is missing.

**Local-only docs.** `devdocs/` holds design documentation and is excluded from
git via `.git/info/exclude` (deliberately not `.gitignore`, so tooling can still
read it). Consequence: ripgrep honours that file too, so a search rooted at the
repo root silently skips `devdocs/`. Pass an explicit search root
(`path: devdocs`) when searching it.
