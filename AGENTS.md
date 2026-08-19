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

**`pnpm build` mutates tracked source files.** The `tcm src` step regenerates
`packages/core/src/**/*.css.d.ts`, and `typed-css-modules` 0.9.1 emits
`export = styles` while the committed files use `export default styles`. Both
typecheck, but a build leaves ~24 unrelated modifications in the working tree.
Revert them (`git checkout -- "packages/core/src/**/*.css.d.ts"`) before
committing anything else.

**Two known flaky tests.** `useDismissal.test.tsx` (D-3 multi-channel
idempotence) and `Modal/_internal/useStackingContextWarning.test.tsx` fail
intermittently — both are timing/event-ordering sensitive, and observed outcomes
across consecutive runs range from 0 to 3 failures. A red result in either does
not by itself indicate a regression; re-run before concluding anything.

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
