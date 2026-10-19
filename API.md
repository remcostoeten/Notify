# @remcostoeten/notifier API inventory

Every function, method, component, type and constant the package offers as of version 1.2.1, read from `packages/notifier/src`. Public means reachable through a package entry point. Internal means it exists in source but is not exported from any entry point. This is the baseline for the rewrite.

## Entry points

| Import path                                     | Source file                            | Contents                                                             |
| ----------------------------------------------- | -------------------------------------- | -------------------------------------------------------------------- |
| `@remcostoeten/notifier`                        | `src/index.tsx`                        | `notify`, `Notifier`, `Notification`, `resetStore`, constants, types |
| `@remcostoeten/notifier/styles`                 | `dist/index.css`                       | Spinner keyframes (`src/styles/spinner.css`)                         |
| `@remcostoeten/notifier/compat/sonner`          | `src/compat/sonner/index.tsx`          | `toast`, `Toaster`, `ToasterProps`                                   |
| `@remcostoeten/notifier/compat/react-hot-toast` | `src/compat/react-hot-toast/index.tsx` | `toast` (also default), `Toaster`, `ToasterProps`                    |
| `@remcostoeten/notifier/compat/shadcn`          | `src/compat/shadcn/index.tsx`          | `useToast`, `Toaster`                                                |

Build: tsup, cjs + esm + dts, `"use client"` banner on every bundle. `react`, `react-dom` and `motion` are externals.

## `notify` (public, `src/notify.ts`)

The callable entry plus static methods. Every creator generates an id (`notify_<timestamp>_<counter>`), applies the `maxVisible` limit for the target position, and returns a chainable `NotifyInstance`.

| Call                                 | Signature                                                                                        | Behaviour                                                                                                                                                                                                                      |
| ------------------------------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `notify(message, options?)`          | `(messageOrOptions?: NotifyMessage \| NotifyOptions, options?: NotifyOptions) => NotifyInstance` | Shows an `info` notification. Accepts a string, a React element, or an options object with `message`. With no message (`notify({})` or `notify()`) it creates an idle instance that renders nothing until a method is chained. |
| `notify.loading(message?, options?)` | `(message?: NotifyMessage, options?: NotifyOptions) => NotifyInstance`                           | Shows a spinner. Never auto-dismisses.                                                                                                                                                                                         |
| `notify.success(message?, options?)` | same                                                                                             | Terminal state, auto-dismisses.                                                                                                                                                                                                |
| `notify.error(message?, options?)`   | same                                                                                             | Terminal state, auto-dismisses. Only accepts a message, not an `Error` object.                                                                                                                                                 |
| `notify.info(message?, options?)`    | same                                                                                             | Terminal state, auto-dismisses. Implemented separately from the instance `info` method with duplicated logic.                                                                                                                  |
| `notify.warning(message?, options?)` | same                                                                                             | Terminal state, auto-dismisses.                                                                                                                                                                                                |
| `notify.dismiss(id?)`                | `(id?: string) => void`                                                                          | Dismisses one notification by id with reason `manual`, or all when no id is given.                                                                                                                                             |
| `notify.promise(promise, options?)`  | `<T>(promise: Promise<T>, options?: PromiseOptions<T>) => Promise<T>`                            | Shows loading, then success or error. Returns the original result. Re-throws on rejection. Does not accept a function returning a promise.                                                                                     |
| `notify.confirm(message, options?)`  | `(message: NotifyMessage, options?: ConfirmOptions) => Promise<boolean>`                         | Renders confirm and cancel buttons. Resolves `true` or `false`. Dismissing the notification by any other route resolves `false`. The notification stays open after resolution; the caller chains the next state or dismisses.  |
| `notify.configure(config)`           | `(config: NotifyContainerConfig) => void`                                                        | Merges into module-level global defaults. `<Notifier />` calls this on mount and whenever its props change.                                                                                                                    |
| `notify.getConfig()`                 | `() => NotifyContainerConfig`                                                                    | Returns a copy of the global defaults.                                                                                                                                                                                         |

Module-level defaults before any configure call: position `bottom`, maxVisible `5`, duration `3000`, swipeToDismiss `true`, pauseOnHover `true`, clickToDismiss `false`.

`configure` and `getConfig` are also plain exports of `src/notify.ts` but only reach consumers through `notify.configure` and `notify.getConfig`.

## `NotifyInstance` (public type, returned by every creator)

| Member                       | Signature                                                                | Behaviour                                                                                                                     |
| ---------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `id`                         | `readonly string`                                                        | Usable with `notify.dismiss(id)`.                                                                                             |
| `loading(message?)`          | `(message?: NotifyMessage) => NotifyInstance`                            | Falls back to `options.loadingMessage`, then `"Loading..."`.                                                                  |
| `success(message?)`          | same                                                                     | Falls back to `options.successMessage`, then `"Success"`.                                                                     |
| `error(message?)`            | same                                                                     | Falls back to `options.errorMessage`, then `"Error"`.                                                                         |
| `info(message?)`             | same                                                                     | Falls back to `"Info"`. No `infoMessage` option exists.                                                                       |
| `warning(message?)`          | same                                                                     | Falls back to `options.warningMessage`, then `"Warning"`.                                                                     |
| `dismiss()`                  | `() => void`                                                             | Dismisses with reason `manual`. Does not return the instance.                                                                 |
| `update(options)`            | `(options: Partial<NotifyOptions>) => NotifyInstance`                    | Merges options into the instance and the store without changing state. Changing `duration` restarts the timer, `0` clears it. |
| `promise(promise, options?)` | `<T>(promise: Promise<T>, options?: PromiseOptions<T>) => Promise<T>`    | Same as the static form, on this instance.                                                                                    |
| `confirm(message, options?)` | `(message: NotifyMessage, options?: ConfirmOptions) => Promise<boolean>` | Same as the static form, on this instance.                                                                                    |

Every state method re-applies the instance's merged options to the store on each transition. Options are merged with the store's existing options, and an existing `action` survives unless replaced.

## `NotifyOptions` (public type, per notification)

| Field            | Type                                | Default             | Notes                                                                               |
| ---------------- | ----------------------------------- | ------------------- | ----------------------------------------------------------------------------------- |
| `message`        | `NotifyMessage`                     |                     | Used by the object form of `notify()`.                                              |
| `description`    | `NotifyMessage`                     |                     | Second line, muted.                                                                 |
| `position`       | `NotifyPositionType`                | Notifier `position` | Per-notification override.                                                          |
| `duration`       | `number`                            | `3000`              | `0` means persistent. Applies only to success, error, info and warning.             |
| `dismissible`    | `boolean`                           | `false`             | Shows an X button.                                                                  |
| `pauseOnHover`   | `boolean`                           | `true`              | Hovering pauses every timer on screen, not just the hovered one.                    |
| `swipeToDismiss` | `boolean`                           | `true`              | Axis follows position: x for corners, y for top and bottom centre. Threshold 100px. |
| `clickToDismiss` | `boolean`                           | `false`             | Ignored when the click lands on a button.                                           |
| `action`         | `NotifyAction`                      |                     | `{ label: string, onClick: () => void }`. Clicking does not dismiss.                |
| `confirm`        | `ConfirmOptions`                    |                     | Set internally by `.confirm()`.                                                     |
| `loadingMessage` | `string`                            | `"Loading..."`      | Fallback when `.loading()` is called without a message.                             |
| `successMessage` | `string`                            | `"Success"`         | Fallback for `.success()`.                                                          |
| `errorMessage`   | `string`                            | `"Error"`           | Fallback for `.error()`.                                                            |
| `warningMessage` | `string`                            | `"Warning"`         | Fallback for `.warning()`.                                                          |
| `onOpen`         | `(id) => void`                      |                     | First render only.                                                                  |
| `onClose`        | `(id) => void`                      |                     | After the 300ms exit window, when the item is deleted.                              |
| `onDismiss`      | `(id, reason) => void`              |                     | Before the exit animation.                                                          |
| `onUpdate`       | `(id, newState, prevState) => void` |                     | On every state change of an existing item.                                          |

## `<Notifier />` (public component, `src/components/notification.tsx`)

Mount once at the app root. Subscribes to the store, groups items by position, renders one fixed container per position, and pauses all timers while the document is hidden. Warns in development when more than one is mounted. Also exported under the alias `Notification`.

| Prop             | Type                                             | Default                                        | Notes                                                                                                               |
| ---------------- | ------------------------------------------------ | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `position`       | `NotifyPositionType`                             | `"bottom"`                                     | Written to global config.                                                                                           |
| `maxVisible`     | `number`                                         | `5`                                            | Counted per position. Oldest are dismissed with reason `replaced`.                                                  |
| `duration`       | `number`                                         | `3000`                                         | Written to global config as `defaultDuration`.                                                                      |
| `swipeToDismiss` | `boolean`                                        | `true`                                         | Written to global config.                                                                                           |
| `pauseOnHover`   | `boolean`                                        | `true`                                         | Written to global config.                                                                                           |
| `clickToDismiss` | `boolean`                                        | `false`                                        | Written to global config.                                                                                           |
| `dismissible`    | `boolean`                                        | `false`                                        | Declared in `NotifierProps` but never read by the component and absent from `NotifyContainerConfig`. Has no effect. |
| `offset`         | `number \| string \| { x?: number; y?: number }` | `16`                                           | Distance from the viewport edges.                                                                                   |
| `gap`            | `number`                                         | `8`                                            | Space between toasts in a position group.                                                                           |
| `stack`          | `boolean`                                        | `false`                                        | Collapsed stack behind the newest toast, expands on hover.                                                          |
| `colorMode`      | `"dark" \| "light" \| "auto"`                    | `"dark"`                                       | `auto` follows `prefers-color-scheme`.                                                                              |
| `radius`         | `"pill" \| "rounded" \| "squared"`               | `"rounded"`                                    | 9999px, 12px, 4px.                                                                                                  |
| `iconColor`      | `"colored" \| "neutral" \| "hidden"`             | `"colored"`                                    | `hidden` still shows the loading spinner.                                                                           |
| `border`         | `BorderConfig`                                   | `{ enabled: false, width: 1, style: "solid" }` | `color` falls back to the theme border colour.                                                                      |
| `icons`          | `IconConfig`                                     |                                                | Per-state React nodes or a `render(props)` function that overrides them all.                                        |
| `theme`          | `ThemePalette`                                   |                                                | Colour overrides on top of the chosen `colorMode`. `shadow: "none"` disables the shadow.                            |

## Public types (`src/types.ts`, re-exported from the index)

| Type                            | Shape                                                                                                                                                   |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NotifyMessage`                 | `React.ReactNode`                                                                                                                                       |
| `NotifyState`                   | `"idle" \| "loading" \| "success" \| "error" \| "info" \| "warning" \| "confirm"`                                                                       |
| `NotifyPositionType`            | `"top" \| "top-left" \| "top-center" \| "top-right" \| "bottom" \| "bottom-left" \| "bottom-center" \| "bottom-right"`                                  |
| `DismissReasonType`             | `"timeout" \| "swipe" \| "click" \| "manual" \| "replaced"`                                                                                             |
| `NotifyOptions`                 | See table above.                                                                                                                                        |
| `NotifyInstance`                | See table above.                                                                                                                                        |
| `NotifyAction`                  | `{ label: string; onClick: () => void }`                                                                                                                |
| `ConfirmOptions`                | `{ confirmLabel?: string; cancelLabel?: string }`                                                                                                       |
| `PromiseOptions<TData, TError>` | `{ loading?: NotifyMessage; success?: NotifyMessage \| ((data: TData) => NotifyMessage); error?: NotifyMessage \| ((error: TError) => NotifyMessage) }` |
| `OnOpenCallback`                | `(id: string) => void`                                                                                                                                  |
| `OnCloseCallback`               | `(id: string) => void`                                                                                                                                  |
| `OnDismissCallback`             | `(id: string, reason: DismissReasonType) => void`                                                                                                       |
| `OnUpdateCallback`              | `(id: string, newState: NotifyState, prevState: NotifyState) => void`                                                                                   |
| `NotifierProps`                 | See table above.                                                                                                                                        |
| `ThemeConfig`                   | `{ colorMode?, radius?, iconColor?, border?, icons?, palette?: ThemePalette }`. Marked `@internal` in source but exported.                              |
| `RadiusVariant`                 | `"pill" \| "rounded" \| "squared"`                                                                                                                      |
| `ColorMode`                     | `"dark" \| "light" \| "auto"`                                                                                                                           |
| `IconColorMode`                 | `"colored" \| "neutral" \| "hidden"`                                                                                                                    |
| `BorderConfig`                  | `{ enabled?: boolean; width?: number; color?: string; style?: "solid" \| "dashed" \| "dotted" }`                                                        |
| `IconConfig`                    | `{ loading?, success?, error?, info?, warning?, confirm?: ReactNode; render?: (props: IconProps) => ReactNode }`                                        |
| `IconProps`                     | `{ state: NotifyState; colorMode: IconColorMode; size: number; color?: string }`                                                                        |

Types that exist in `src/types.ts` but are not re-exported: `ThemePalette` (reachable only through `NotifierProps["theme"]`), `NotifyFunction`, `NotifyItem`, `StoreListener`, `NotifyContainerConfig`.

## Public constants (`src/constants.ts`, re-exported from the index)

| Export            | Contents                                                                                                                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `NotifyStateType` | `IDLE`, `LOADING`, `SUCCESS`, `ERROR`, `INFO`, `WARNING`, `CONFIRM` as string literals.                                                                                                    |
| `NotifyPosition`  | `TOP`, `TOP_CENTER`, `TOP_LEFT`, `TOP_RIGHT`, `BOTTOM`, `BOTTOM_CENTER`, `BOTTOM_LEFT`, `BOTTOM_RIGHT`. `TOP` and `TOP_CENTER` render identically, as do `BOTTOM` and `BOTTOM_CENTER`.     |
| `DismissReason`   | `TIMEOUT`, `SWIPE`, `CLICK`, `MANUAL`, `REPLACED`.                                                                                                                                         |
| `Defaults`        | `DURATION_MS: 3000`, `POSITION: "bottom"`, `MAX_VISIBLE: 5`, `SWIPE_THRESHOLD: 100`, `MESSAGES.{LOADING,SUCCESS,ERROR,INFO,WARNING}`, `LABELS.{CONFIRM,CANCEL}`, `EXIT_ANIMATION_MS: 300`. |
| `AnimationConfig` | Motion transitions: `CONTAINER`, `ICON`, `TEXT`, `RESIZE`, `EXIT` (duration + cubic bezier), `SWIPE`, `STACK`, `STACK_EXIT` (springs).                                                     |

Constants in `src/constants.ts` that are not re-exported: `StackConfig` (peek, scale and opacity steps, enter and exit travel, stagger, collapse delay), `RadiusValues`, `ThemeColors` (dark and light palettes), `IconColors` (colored and neutral per state), `PositionStyles`, `PositionAnimationDirection`, `PositionSwipeDirection`.

## Store (`src/store.ts`, internal except `resetStore`)

Plain TypeScript, no React. State is a module-level `Map<string, NotifyItem>`, a `Set` of listeners, and two timeout maps (auto-dismiss and post-exit delete).

| Function                                               | Signature                                                                         | Behaviour                                                                                                                                                                                  |
| ------------------------------------------------------ | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `resetStore()`                                         | `() => void`                                                                      | Public. Clears every item, listener and timer. Meant for tests.                                                                                                                            |
| `getNotifications()`                                   | `() => NotifyItem[]`                                                              | Sorted by `createdAt`.                                                                                                                                                                     |
| `getNotification(id)`                                  | `(id: string) => NotifyItem \| undefined`                                         |                                                                                                                                                                                            |
| `subscribe(listener)`                                  | `(listener: () => void) => () => void`                                            | Returns an unsubscribe function. Listeners receive no payload; they re-read the store.                                                                                                     |
| `setState(id, state, message, options?)`               | `(id, state: NotifyState, message, options?: NotifyOptions) => void`              | Creates or updates. Merges options, fires `onUpdate` on state change and `onOpen` on creation, resets `paused`, starts the auto-dismiss timer for terminal states unless `duration === 0`. |
| `setConfirmState(id, message, options, resolver)`      | `(id, message, options, resolver: (confirmed: boolean) => void) => void`          | Enters `confirm` state and stores the resolver. No timer.                                                                                                                                  |
| `resolveConfirm(id, confirmed)`                        | `(id: string, confirmed: boolean) => void`                                        | Calls and clears the resolver. Does not dismiss.                                                                                                                                           |
| `pauseTimer(id)`                                       | `(id: string) => void`                                                            | Records remaining time and clears the timeout.                                                                                                                                             |
| `resumeTimer(id)`                                      | `(id: string) => void`                                                            | Restarts the timeout with the remaining time.                                                                                                                                              |
| `pauseAllTimers()`                                     | `() => void`                                                                      | Used for hover and hidden tab.                                                                                                                                                             |
| `resumeAllTimers()`                                    | `() => void`                                                                      |                                                                                                                                                                                            |
| `dismiss(id, reason?)`                                 | `(id: string, reason?: DismissReasonType) => void`                                | Resolves a pending confirm as `false`, fires `onDismiss`, sets `visible: false`, then deletes the item and fires `onClose` after 300ms.                                                    |
| `dismissAll(reason?)`                                  | `(reason?: DismissReasonType) => void`                                            |                                                                                                                                                                                            |
| `enforceMaxVisible(maxVisible, excludeId?, position?)` | `(maxVisible: number, excludeId?: string, position?: NotifyPositionType) => void` | Dismisses the oldest visible items in that position with reason `replaced` until there is room for one more.                                                                               |
| `updateOptions(id, options)`                           | `(id: string, options: Partial<NotifyOptions>) => void`                           | Merges options. A new `duration` restarts or clears the timer.                                                                                                                             |

`NotifyItem` fields: `id`, `state`, `message`, `options`, `visible`, `prevState`, `confirmResolver`, `createdAt`, `stateStartedAt`, `paused`, `remainingTime`.

## Stack geometry (`src/stack.ts`, internal)

| Function                                        | Signature                                                                                       | Behaviour                                                                                                                                                                              |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `expandedOffset(heights, index, gap)`           | `(heights: readonly number[], index: number, gap: number) => number`                            | Sum of the heights in front of `index` plus one gap each. Unmeasured heights fall back to the front toast's height.                                                                    |
| `stackPlacement(index, expanded, heights, gap)` | `(index: number, expanded: boolean, heights: readonly number[], gap: number) => StackPlacement` | Expanded: `{ offset: expandedOffset, scale: 1, opacity: 1 }`. Collapsed: offset `index * PEEK`, scale `1 - index * SCALE_STEP`, opacity `1 - index * OPACITY_STEP`, both clamped at 0. |

`StackPlacement` is `{ offset: number; scale: number; opacity: number }`.

## Utilities (`src/utils.ts`, internal)

| Function                           | Signature                                                            | Behaviour                                                                               |
| ---------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `generateId()`                     | `() => string`                                                       | `notify_<Date.now()>_<counter>`.                                                        |
| `getErrorMessage(error, fallback)` | `(error: unknown, fallback: string) => string`                       | `Error.message`, a string as is, else the fallback.                                     |
| `delay(ms)`                        | `(ms: number) => Promise<void>`                                      | Unused by the library itself.                                                           |
| `isObject(value)`                  | `(value: unknown) => value is Record<string, unknown>`               |                                                                                         |
| `isReactElement(value)`            | `(value: unknown) => boolean`                                        | Checks for `$$typeof`. Used by `notify()` to tell a JSX message from an options object. |
| `cn(...classes)`                   | `(...classes: (string \| boolean \| undefined \| null)[]) => string` | Joins truthy class names.                                                               |

## Theme context (`src/components/theme-context.tsx`, internal)

| Export                                      | Behaviour                                                                                                                                                                                                                   |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NotifyThemeProvider({ theme?, children })` | Resolves `ThemeConfig` into a `ResolvedTheme`. Tracks `prefers-color-scheme` for `auto`.                                                                                                                                    |
| `useNotifyTheme()`                          | Returns the `ResolvedTheme`. Throws outside the provider.                                                                                                                                                                   |
| `ResolvedTheme`                             | `colorMode` (`light` or `dark`), `background`, `text`, `textMuted`, `textSubtle`, `border`, `borderHighlight`, `buttonHover`, `shadow`, `radius`, `radiusVariant`, `iconColorMode`, `iconColors`, `icons?`, `borderConfig`. |

## View components (internal)

| Export                            | File                                   | Role                                                                                                                                                                                                                |
| --------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NotificationItem`                | `src/components/notification-item.tsx` | Memoised single toast. Owns swipe, hover pause, click to dismiss, the X button, the action button, confirm and cancel buttons, and the state transition animations. Props: `item`, `position`, `index`, `stacked?`. |
| `NotifyIcon({ state })`           | `src/components/notify-icon.tsx`       | Picks the custom icon, the `render` function, or the built-in SVG for the state.                                                                                                                                    |
| `Spinner()`                       | `src/components/spinner.tsx`           | Loading spinner, animated by the CSS in `styles/spinner.css`.                                                                                                                                                       |
| `PositionGroup` and `StackedItem` | `src/components/notification.tsx`      | Fixed container per position, flat list or collapsed stack. Not exported.                                                                                                                                           |

## Compat adapters (`src/compat/`)

### `createToastAdapter(config?)` (`src/compat/factory.ts`, internal)

Builds a Sonner or react-hot-toast shaped `toast` object on top of `notify`. `config.defaultOptions` is spread under every call. `config.mapPosition` is declared but never used.

| Member                                                         | Signature                                                                 | Maps to                                                                                        |
| -------------------------------------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `toast(message, options?)`                                     | `(message: string \| ReactNode, options?: any) => string`                 | `notify({ ...opts, message }).id`                                                              |
| `toast.success` / `.error` / `.info` / `.warning` / `.loading` | `(message, options?) => string`                                           | The matching `notify.*`, returning the id.                                                     |
| `toast.promise(promiseOrFn, data)`                             | `<T>(promise: Promise<T> \| (() => Promise<T>), data: any) => Promise<T>` | `notify.promise` with `data.loading`, `data.success`, `data.error`. Extra options are dropped. |
| `toast.dismiss(id?)`                                           | `(id?: string \| number) => void`                                         | `notify.dismiss(String(id))`.                                                                  |
| `toast.custom(jsx, options?)`                                  | `(jsx: (id: string) => ReactNode, options?: any) => string`               | Renders the node as an `info` message. Documented as partial.                                  |

Returned ids are strings although the `ToastAdapter` type says `string | number`.

### Sonner (`@remcostoeten/notifier/compat/sonner`)

| Export           | Behaviour                                                                                                                                                                                                                                                                                    |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `toast`          | Adapter with `duration: 4000`.                                                                                                                                                                                                                                                               |
| `Toaster(props)` | Maps `theme` (`system` becomes `auto`), `position` (default `bottom-right`), `richColors` (to `iconColor`), `visibleToasts` (to `maxVisible`), `duration`, `closeButton` (to the no-op `dismissible` prop), `offset`. `invert`, `hotkey`, `expand`, `toastOptions` are accepted and ignored. |
| `ToasterProps`   | `NotifierProps` minus `theme`, plus the Sonner fields above.                                                                                                                                                                                                                                 |

### react-hot-toast (`@remcostoeten/notifier/compat/react-hot-toast`)

| Export                        | Behaviour                                                                                                                                                              |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `toast` (also default export) | Adapter with `duration: 4000`, `position: "top-center"`.                                                                                                               |
| `Toaster(props)`              | `Notifier` with `position` default `top-center`, `radius="rounded"`, `iconColor="colored"`. `reverseOrder`, `containerStyle`, `toastOptions` are accepted and ignored. |
| `ToasterProps`                | `NotifierProps` plus the fields above.                                                                                                                                 |

### shadcn (`@remcostoeten/notifier/compat/shadcn`)

| Export           | Behaviour                                                                                                                                                                                                                                                                                            |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useToast()`     | Returns `{ toast, dismiss, toasts }`. `toast({ title, description, variant, action, ...props })` calls `notify.error` for `variant: "destructive"` and `notify({ message: title, ... })` otherwise. An `action` becomes a button labelled `"Action"` with an empty handler. `toasts` is always `[]`. |
| `Toaster(props)` | `Notifier` with the props passed through.                                                                                                                                                                                                                                                            |

## Runtime rules worth carrying into the rewrite

- Auto-dismiss applies only to `success`, `error`, `info` and `warning`. `loading` and `confirm` wait until something else happens.
- A dismissed item stays in the store with `visible: false` for 300ms so the exit animation can play, then `onClose` fires and it is deleted.
- `maxVisible` is enforced per position at creation time, including for idle instances created with `notify({})`.
- Hover pauses every timer on screen, and so does the tab going hidden. Both resume together.
- `notify.promise` only accepts a promise; the adapters accept a thunk and unwrap it themselves.
- `confirm` never dismisses on its own. Dismissing a confirm by swipe, click, timeout or `notify.dismiss` resolves it as `false`.
- Every state method on an instance re-sends the instance's whole merged options to the store, which is why `update()` has to mutate the instance's local copy too.

## Inconsistencies found while reading

- `NotifierProps.dismissible` and the Sonner `closeButton` prop do nothing. Only the per-notification `dismissible` option is wired.
- `notify.info` duplicates the instance logic instead of calling `instance.info()`, unlike the other static creators.
- `README.md` documents `notify.error(messageOrError, options?)` but the implementation accepts only a `NotifyMessage`.
- `ThemePalette` is not re-exported from the index, while `ThemeConfig`, which is marked `@internal` in source, is.
- `StackConfig` is documented as a public constant in its JSDoc but is not re-exported.
- `AdapterConfig.mapPosition` is declared and never read.
- `utils.delay` and `utils.cn` have no callers in the library.
- `NotifyPosition.TOP` and `TOP_CENTER` (and `BOTTOM` and `BOTTOM_CENTER`) are two spellings of one position.
