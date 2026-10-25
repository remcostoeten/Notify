# Changelog

## 3.1.0 (2026-10-25)

### New

- `animateNumbers` on `Notifier` or a single toast rolls the digits of a number when text changes, with no dependency. It is off by default and skipped under reduced motion. `Toast.Number` always rolls, and `formatNumber` formats a value through `Intl.NumberFormat`.
- An action whose `onClick` returns a promise runs through `loading`, `success` and `error` with a spinner, check or cross. `labels` sets the text of each state, and `ActionLabels` and `ActionState` are exported.
- Icons, glyphs and the close button play short hover and swap motions.

### Design

- Status colors are brighter in both tones, and the stack reveal, settle and exit use slower tween easings with a small stagger.

## 3.0.0 (2026-10-20)

### Breaking changes

- `notify({ id })` on an open toast replaces its content and restarts its timer instead of merging into it. Use `notify.update` to change only some fields.
- A toast's timer starts when `Notifier` first shows it, not when `notify` is called, so a toast opened before `Notifier` mounts no longer expires unseen.

### Fixes

- `maxVisible` no longer dismisses loading toasts, toasts with unfinished progress or toasts with `duration: 0`, so a promise or an upload always shows its result.
- The stack keeps its layout after an older toast of a different height leaves, and no longer re-renders on every frame while it expands or collapses.
- `Notifier` applies `duration` and `maxVisible` to toasts opened in mount effects, and holds timers when the page loads in a hidden tab.
- `notify.promise` leaves no unhandled rejection when the result is not awaited.
- `resetStore` keeps subscribers, so a mounted `Notifier` keeps working.
- A disabled link action drops its `href`, so Enter no longer follows it.
- The title row only reserves room for a close button when one is shown.
- Standalone `Toast` elements share one stylesheet in the document head instead of adding one each.

### New

- `layer` on `Notifier` puts the stylesheet in a cascade layer, so Tailwind v4 utilities in `className` and `classNames` can override it.
- `labels` on `Notifier` sets the label of each region and of every close button.
- An update that changes a toast's height animates the surface.
- `--ntf-padding` and `--ntf-gap` set the inner spacing.

### Design

- Dark tone: accent `#5f5afa`, a 10% white ring, a stronger shadow and a darker progress track. Light success is `#15803d`.
- Spacing is rounded to whole pixels.

## 2.0.0 (2026-10-19)

- Rebuilt toasts on slots and primitives: `Toast` with `Toast.Icon`, `Avatar`, `Body`, `Title`, `Description`, `Progress`, `Actions`, `Action` and `Close`, plus `notify.custom`.
- Light and dark tones, token theming through `theme`, and a stack that expands on hover.
- Breaking: removed `notify.confirm`, `notify.configure`, the chainable instance, the `./styles` export and the compat adapters. `notify()` returns a toast id.

## 1.2.1 (2026-10-07)

- Opening a toast takes one React commit.

## 1.2.0 (2026-09-13)

- Compact visual refresh with a state accent bar and a rounded default.

## 1.1.0 (2026-07-15)

- Updated the package and the demo.

## 1.0.0 (2026-01-24)

- First stable release.

## 0.0.82 (2026-01-16)

- Refactored the repository into a standard monorepo.
- Renamed the repository to Notify.
- Initialized a new Git workflow.

## 0.0.81 (2025-12-20)

- Initial implementation of headless notification logic.
- Added basic animation support via Framer Motion.

## 0.0.80 (2025-12-15)

- Project initialization.
- Set up the basic package structure.
