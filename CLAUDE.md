# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Bun-workspaces monorepo for `@remcostoeten/notifier` — a chainable, framework-agnostic-core notification system for React (Sonner-like API, Motion-driven animations). Package manager is **Bun 1.2.0**; do not use npm/yarn for installs.

- `packages/notifier/` — the published library (`@remcostoeten/notifier`)
- `packages/release-cli/` — internal AI-changelog release tool (`release` binary), not published as part of the product
- `apps/demo/` — Next.js 16 docs/showcase site (package name `repro-notifier`)

## Commands

Run from the repo root unless noted.

```bash
bun install              # install all workspaces
bun run build:packages   # build the two library packages (the demo is NOT covered — see gotcha below)
bun run typecheck        # tsc --noEmit across the workspace packages
bun run lint             # eslint . across the repo
bun run lint:fix
bun run format           # prettier --write . (format:check to verify only)
```

Note on `bun --filter`: this repo's bun (1.3.x) only matches the form `bun run --filter='<glob>' <script>`. The older `bun --filter '<glob>' run <script>` form silently matches nothing — keep the scripts in their current order.

Notifier package (`cd packages/notifier`):

```bash
bun run build            # tsup -> dist/ (cjs + esm + dts, "use client" banner)
bun run dev              # tsup --watch
bun run typecheck        # tsc --noEmit
bun run test             # vitest run
bun run test:watch
bun run test:coverage
```

Run a single test:

```bash
cd packages/notifier
bun run test src/__tests__/store.test.ts        # one file
bun run test -t "name of the test case"          # by test name
```

### apps/demo is a standalone project — IMPORTANT gotcha

`apps/demo` is listed in the root `workspaces`, but it **also has its own committed `apps/demo/bun.lock`**, which makes it behave as a separate project rather than a true workspace member:

- ⚠️ **A clean root `bun install` (when root `node_modules`/lockfile is absent) can DELETE the `apps/demo/` working-tree files.** If it happens, restore with `git checkout -- apps/demo`. A subsequent `bun install` (with node_modules present) does not reproduce it.
- `bun --filter` does **not** match the demo, so `bun run dev` / a root `build:apps` cover only real workspace members (currently none under `apps/*`). Build and run the demo standalone:
    ```bash
    cd apps/demo && bun install && bun run dev   # http://localhost:3000
    ```
- The demo imports `@remcostoeten/notifier` and consumes its built `dist/` (not `src/`). When iterating on library source with the demo open, run `bun run dev` (tsup watch) inside `packages/notifier` or rebuild it, or the demo won't pick up changes.

## Architecture

### Core is framework-agnostic; React is a thin view layer

`packages/notifier/src` separates state from rendering:

- `store.ts` — the reactive store. A module-level `Map<string, NotifyItem>` plus a `Set` of listeners and a `Map` of dismiss timeouts. Mutations call `emit()` to notify subscribers. This is plain TS with no React. Key exports: `setState`, `dismiss`/`dismissAll`, `setConfirmState`/`resolveConfirm`, `pauseTimer`/`resumeTimer`, `enforceMaxVisible`, `updateOptions`, `subscribe`, `resetStore`. Auto-dismiss applies only to terminal states (success/error/info) and is skipped when `duration === 0`. Dismissal flips `visible: false`, then deletes after a 300ms animation window.
- `notify.ts` — the public chainable API. `createNotifyInstance(id, opts)` returns an object whose methods (`loading`/`success`/`error`/`info`/`update`/`promise`/`confirm`) call into the store and return the instance for chaining. `notify(...)` and its static methods (`notify.success`, `notify.promise`, etc.) are the entry points; a module-level `globalConfig` holds defaults set via `notify.configure`.
- `components/notification.tsx` exports `Notifier` (the container you mount once at app root) and `Notification`. Components `subscribe` to the store and render with Motion. `theme-context.tsx` carries theming; `constants.ts` holds `Defaults`, `NotifyStateType`, `DismissReason`, `AnimationConfig`.
- `index.tsx` is the public surface — it re-exports `notify`, `Notifier`, all public types, constants, and `resetStore`. Add new public API here.

When changing notification behavior, prefer editing `store.ts` (logic) and keep React components as views. Tests in `src/__tests__/` cover the store and notify API directly without rendering.

### Compat adapters

`src/compat/` provides drop-in replacements for other toast libs. `factory.ts` `createToastAdapter()` maps a generic toast interface onto `notify`, and `compat/{sonner,react-hot-toast,shadcn}/` are thin wrappers. These are separate package entry points (`@remcostoeten/notifier/compat/sonner`, etc.) declared in `package.json` `exports` and built as extra tsup entries — update both when adding an adapter.

### Demo app

Next.js 16 App Router under `apps/demo/src` (`@/*` -> `./src/*`). It imports the library via the workspace dep `@remcostoeten/notifier` (not a path alias). `Notifier` is mounted in `app/layout.tsx`; `app/page.tsx` is the interactive showcase.

## Conventions

- ESLint enforces `consistent-type-imports` (use `import type`), warns on `no-explicit-any` and unused vars (prefix intentionally-unused with `_`), and bans `var`. `no-console` warns but allows `warn`/`error`.
- Husky + lint-staged run eslint --fix and prettier on staged `*.{ts,tsx}` at commit time.
- The user's global style rules apply: standalone funcs as `function` declarations, callbacks as arrows, no empty catch (use a `noop`), and no explanatory inline comments (JSDoc on public helpers is fine — the library uses it heavily).

## Notes

- The `eslint.config.js` global `ignores` use `**/`-prefixed globs so nested `packages/*/dist` is excluded — don't drop the prefix or `bun run lint` will start linting build output.
- The compat `useToast()` shadcn shim and `toast.custom` in `compat/factory.ts` are intentionally partial (documented limitations), not bugs to "fix" silently.
