# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Bun-workspaces monorepo for `@remcostoeten/notifier`, composable toast notifications for React: declarative content slots, a `Toast` primitives API for custom layouts, light and dark tones, Motion-driven animation. Package manager is **Bun 1.4.3**; do not use npm/yarn for installs.

- `packages/notifier/` — the published library (`@remcostoeten/notifier`)
- `packages/release-cli/` — internal AI-changelog release tool (`release` binary), not published as part of the product
- `apps/docs/`: Fumadocs documentation site (package name `notifier-docs`), not a workspace member

## Commands

Run from the repo root unless noted.

```bash
bun install              # install all workspaces
bun run build            # build the two library packages
bun run dev              # install and start apps/docs (http://localhost:3000)
bun run dev:lib          # tsup watch for packages/notifier
bun run typecheck        # tsc --noEmit across the workspace packages
bun run lint             # oxlint across the repo
bun run lint:fix
bun run format           # oxfmt (format:check to verify only)
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

On this 8 GB machine cap the workers. Vitest 5 has no `--minWorkers` option:

```bash
bun run test --maxWorkers=2
```

### apps/docs

`apps/docs` is excluded from the root `workspaces` and has its own `bun.lock`. It depends on `@remcostoeten/notifier` from npm by version, so it documents the published release, not `packages/notifier/src`. Root `oxlint` and `oxfmt` ignore it; inside it, `bun run check` runs `vp` with the settings in `apps/docs/vite.config.ts` (2-space indent, semicolons, double quotes). Its CI is `.github/workflows/docs.yml`. See `apps/docs/README.md`.

## Architecture

### Core is framework-agnostic; React is a thin view layer

`packages/notifier/src` separates state from rendering:

- `store.ts` is the reactive store. A module-level `Map<ToastID, ToastRecord>` plus a `Set` of listeners and maps of dismiss timers and pending removals. Mutations call `emit()`, which rebuilds the immutable snapshot that `Notifier` reads through `useSyncExternalStore`. Exports `show`, `showCustom`, `update`, `dismiss`/`dismissAll`, `handleFor`, `trackShown`, `pauseTimers`/`resumeTimers` (holds: hover, hidden, focus), `configureStore`, `getSnapshot`, `subscribe` and `resetStore`. `resolveDuration` makes loading toasts and progress below 100 persistent, and `duration: 0` means persistent. A timer only runs while a view shows the toast: `ToastItem` calls `trackShown(id)` on mount, so toasts opened before `Notifier` mounts do not expire unseen. `show` with an existing id replaces the input and restarts the timer; `update` merges. Dismissal sets `open: false`, then removes the record after `Defaults.EXIT_MS` (300ms). Opening past `maxVisible` dismisses the oldest toast at that position with reason `replaced`, skipping toasts that `holdsOpen` (loading, unfinished progress, `duration: 0`). `resetStore` keeps subscribers and emits an empty snapshot.
- `notify.ts` is the public API: `notify(title | input)` plus `notify.success/error/warning/info/loading`, `custom`, `promise`, `update` and `dismiss`. Everything returns a toast id and goes through the store. There is no chaining.
- `types.ts` splits a toast input into `ToastContent` (slots), `ToastSurface` (tone, width, classes) and `ToastBehavior` (id, position, duration, callbacks).
- `components/notifier.tsx` exports `Notifier`, mounted once at the app root. It groups records by position, anchors each group (`placement.ts`), lays out the stack (`stack.ts`) and handles hover expand, swipe, pause on hover and the `alt+t` hotkey. It configures the store in `useInsertionEffect`, so toasts opened in children's mount effects already see its props. Stack heights are keyed by toast id and measured from each `.ntf-item` (or its `data-ntf-height` while it resizes), never from the animated wrapper. `labels` sets the region and close labels. Mounting two logs a warning.
- `components/toast.tsx` exports `Toast`, which fills the slots from props or takes children built from the primitives in `components/parts.tsx` (`Toast.Icon`, `Avatar`, `Body`, `Title`, `Description`, `Progress`, `Actions`, `Action`, `Close`). `toast-item.tsx` wraps a record with Motion and gestures, tracks it as shown, and animates the surface height with WAAPI when an update changes it. `glyphs.tsx` holds the inline SVG icons.
- Number animation is opt-in (`animateNumbers` on `Notifier` or a toast, provided through `NumbersContext`) and dependency-free. `number-flow.ts` holds the pure parts (`splitNumbers`, `cellsOf`, `trendOf`, `formatNumber`), `components/flow.tsx` wraps the text slots in `Flowed` and exports `Toast.Number`, and `useDigitRoll` in `play-motion.ts` rolls a changed digit with a WAAPI ghost.
- Styling is tokens plus one stylesheet. `tokens.ts` holds the light and dark values, `styles.ts` builds the CSS (`--ntf-*` variables, `.ntf-*` classes, `stylesFor(layer)` for the optional cascade layer) and `style-sheet.tsx` keeps one `<style data-ntf=sheet>` in the head. It renders the sheet inline only on the server and during hydration, so server-rendered toasts are styled at first paint. `theme.ts` maps a `ToastTheme` prop onto the variables. `constants.ts` holds `Defaults`, `AnimationConfig` and the stack numbers.
- `index.tsx` is the public surface. Add new public API and types here. The package has a single entry point.

When changing behavior, edit the store, `placement.ts`, `stack.ts` or `theme.ts` (pure logic) and keep components as views. Tests in `src/__tests__/` cover those pure modules and the store without rendering, and `toast.test.tsx`, `notifier.test.tsx` and `render-count.test.tsx` cover the components.

### Visual reference

The toasts are matched to the Untitled UI toast shot on Dribbble (dark status toast, upload progress, avatar message, update with icon box). A toast is 400px wide, Inter 14px/20px, radius 12, with 8px radius buttons and icon box. Compare changes against that reference at the same scale, not by eye, and compare ink and text widths rather than extreme pixel values.

## Conventions

- Oxlint (`.oxlintrc.json`) enforces `func-style` (declarations), `prefer-arrow-callback`, `consistent-type-imports` (use `import type`), `no-empty`, `prefer-const` and `no-var`, and warns on `no-explicit-any` and unused vars (prefix intentionally-unused with `_`). `no-console` warns but allows `warn`/`error`. oxfmt (`.oxfmtrc.json`) formats, including Tailwind class order. Never add ESLint or Prettier.
- Husky + lint-staged run `oxlint --fix` and `oxfmt` on staged files at commit time.
- `release-cli` prints through `console`, so `bun run lint` reports its `no-console` warnings. They are expected.
- The user's global style rules apply: standalone funcs as `function` declarations, callbacks as arrows, no empty catch (use a `noop`), and no explanatory inline comments (JSDoc on public helpers is fine — the library uses it heavily).

## Notes

- The `.oxlintrc.json` `ignorePatterns` use `**/`-prefixed globs so nested `packages/*/dist` is excluded. Don't drop the prefix or `bun run lint` will start linting build output.
- `oxlint --rules` prints nothing in the installed version. To check that a rule exists, add it to `.oxlintrc.json` and run `oxlint`, which errors on unknown rules.
- Headless Chrome on Linux renders Inter with uneven letter spacing unless started with `--font-render-hinting=none --enable-font-subpixel-positioning`. Use those flags when screenshotting toasts, and `--hide-scrollbars` so element clips do not shift.
- The docs page has `scroll-behavior: smooth`. Set it to `auto` before measuring element rects after a programmatic scroll.
