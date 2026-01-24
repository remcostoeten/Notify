/* eslint-disable no-unused-vars */
/**
 * @fileoverview Type definitions for the @remcostoeten/notifier package.
 *
 * This module provides comprehensive TypeScript types for the notification system.
 * All types are fully documented for optimal IDE intellisense and developer experience.
 *
 * @packageDocumentation
 * @module @remcostoeten/notifier
 */

import type React from 'react'

/**
 * Notification state representing the current visual and behavioral state of a notification.
 *
 * - `idle` - Initial state, notification is not visible
 * - `loading` - Shows a loading spinner, does not auto-dismiss
 * - `success` - Shows a success icon, auto-dismisses after duration
 * - `error` - Shows an error icon, auto-dismisses after duration
 * - `info` - Shows an info icon, auto-dismisses after duration
 * - `confirm` - Shows confirm/cancel buttons, waits for user response
 *
 * @example
 * ```typescript
 * const state: NotifyState = "loading"
 * ```
 */
export type NotifyState = 'idle' | 'loading' | 'success' | 'error' | 'info' | 'confirm'

/**
 * Screen position where notifications appear.
 *
 * @example
 * ```tsx
 * <Notifier position="top-right" />
 * ```
 */
export type NotifyPositionType =
    | 'top'
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right'

/**
 * Reason for notification dismissal, passed to the `onDismiss` callback.
 *
 * - `timeout` - Auto-dismissed after duration expired
 * - `swipe` - User swiped to dismiss (touch/mouse gesture)
 * - `click` - User clicked anywhere on notification (when `clickToDismiss` is enabled)
 * - `manual` - Programmatically dismissed via `.dismiss()` or `notify.dismiss()`
 * - `replaced` - Dismissed because `maxVisible` limit was reached
 *
 * @example
 * ```typescript
 * notify("Hello", {
 *   onDismiss: (id, reason) => {
 *     if (reason === "swipe") {
 *       console.log("User swiped to dismiss")
 *     }
 *   }
 * })
 * ```
 */
export type DismissReasonType = 'timeout' | 'swipe' | 'click' | 'manual' | 'replaced'

/**
 * Border radius style variant for notification containers.
 *
 * - `pill` - Fully rounded corners (9999px), creates a pill/capsule shape
 * - `rounded` - Medium rounded corners (12px), modern card appearance
 * - `squared` - Minimal rounded corners (4px), more traditional look
 *
 * @default "pill"
 *
 * @example
 * ```tsx
 * <Notifier radius="rounded" />
 * ```
 */
export type RadiusVariant = 'pill' | 'rounded' | 'squared'

/**
 * Color mode for notification theming.
 *
 * - `dark` - Dark theme with light text
 * - `light` - Light theme with dark text
 * - `auto` - Follows system preference via `prefers-color-scheme`
 *
 * @default "dark"
 *
 * @example
 * ```tsx
 * <Notifier colorMode="auto" />
 * ```
 */
export type ColorMode = 'dark' | 'light' | 'auto'

/**
 * Icon color mode determining how notification icons are styled.
 *
 * - `colored` - Icons have state-specific colors (green for success, red for error, etc.)
 * - `neutral` - All icons use the same neutral gray color
 * - `hidden` - Icons are not displayed (except loading spinner)
 *
 * @default "colored"
 *
 * @example
 * ```tsx
 * <Notifier iconColor="neutral" />
 * ```
 */
export type IconColorMode = 'colored' | 'neutral' | 'hidden'

/**
 * Border configuration for notification containers.
 *
 * @example
 * ```tsx
 * <Notifier
 *   border={{
 *     enabled: true,
 *     width: 1,
 *     color: "rgba(255, 255, 255, 0.1)",
 *     style: "solid"
 *   }}
 * />
 * ```
 */
export interface BorderConfig {
    /**
     * Whether to show a border around notifications.
     * @default false
     */
    enabled?: boolean

    /**
     * Border width in pixels.
     * @default 1
     */
    width?: number

    /**
     * Border color as a CSS color value.
     * When not specified, uses theme-appropriate default.
     */
    color?: string

    /**
     * Border style.
     * @default "solid"
     */
    style?: 'solid' | 'dashed' | 'dotted'
}

/**
 * Color palette configuration for custom theming.
 * Overrides default values from the selected colorMode.
 *
 * @example
 * ```tsx
 * <Notifier
 *   theme={{
 *     background: "#000000",
 *     text: "#ffffff",
 *     border: "#333333"
 *   }}
 * />
 * ```
 */
export interface ThemePalette {
    background?: string
    text?: string
    textMuted?: string
    textSubtle?: string
    border?: string
    borderHighlight?: string
    buttonHover?: string
    shadow?: string
}

/**
 * Props passed to custom icon render functions.
 *
 * @example
 * ```tsx
 * <Notifier
 *   icons={{
 *     render: ({ state, colorMode, size }) => (
 *       <CustomIcon state={state} size={size} />
 *     )
 *   }}
 * />
 * ```
 */
export interface IconProps {
    /**
     * Current notification state for determining which icon to render.
     */
    state: NotifyState

    /**
     * Current icon color mode configuration.
     */
    colorMode: IconColorMode

    /**
     * Icon size in pixels.
     * @default 18
     */
    size: number

    /**
     * Suggested icon color based on state and color mode.
     */
    color?: string
}

/**
 * Custom icon configuration allowing override of default notification icons.
 *
 * @example
 * ```tsx
 * import { CheckCircle, XCircle } from "lucide-react"
 *
 * <Notifier
 *   icons={{
 *     success: <CheckCircle className="w-4 h-4" />,
 *     error: <XCircle className="w-4 h-4" />
 *   }}
 * />
 * ```
 */
export interface IconConfig {
    /**
     * Custom icon for loading state.
     * Note: The loading spinner is always shown; this icon appears alongside it.
     */
    loading?: React.ReactNode

    /**
     * Custom icon for success state.
     */
    success?: React.ReactNode

    /**
     * Custom icon for error state.
     */
    error?: React.ReactNode

    /**
     * Custom icon for info state.
     */
    info?: React.ReactNode

    /**
     * Custom icon for confirm state.
     */
    confirm?: React.ReactNode

    /**
     * Custom render function for complete control over icon rendering.
     * When provided, overrides individual icon properties.
     *
     * @param props - Icon rendering context
     * @returns React node to render as the icon
     */
    render?: (props: IconProps) => React.ReactNode
}

/**
 * Callback invoked when a notification first appears.
 *
 * @param id - Unique notification identifier
 *
 * @example
 * ```typescript
 * notify("Hello", {
 *   onOpen: (id) => console.log(`Notification ${id} opened`)
 * })
 * ```
 */
export type OnOpenCallback = (id: string) => void

/**
 * Callback invoked when a notification fully closes (after exit animation completes).
 *
 * @param id - Unique notification identifier
 *
 * @example
 * ```typescript
 * notify("Hello", {
 *   onClose: (id) => console.log(`Notification ${id} closed`)
 * })
 * ```
 */
export type OnCloseCallback = (id: string) => void

/**
 * Callback invoked when a notification is dismissed (before exit animation).
 *
 * @param id - Unique notification identifier
 * @param reason - Reason for dismissal
 *
 * @example
 * ```typescript
 * notify("Hello", {
 *   onDismiss: (id, reason) => {
 *     analytics.track("notification_dismissed", { id, reason })
 *   }
 * })
 * ```
 */
export type OnDismissCallback = (id: string, reason: DismissReasonType) => void

/**
 * Callback invoked when a notification transitions between states.
 *
 * @param id - Unique notification identifier
 * @param newState - State the notification is transitioning to
 * @param prevState - State the notification is transitioning from
 *
 * @example
 * ```typescript
 * notify.loading("Saving...", {
 *   onUpdate: (id, newState, prevState) => {
 *     console.log(`${id}: ${prevState} -> ${newState}`)
 *   }
 * }).success("Saved!")
 * ```
 */
export type OnUpdateCallback = (id: string, newState: NotifyState, prevState: NotifyState) => void

/**
 * Action button configuration for notifications.
 * Actions appear as interactive buttons within the notification.
 *
 * @example
 * ```typescript
 * notify("File deleted", {
 *   action: {
 *     label: "Undo",
 *     onClick: () => restoreFile()
 *   }
 * })
 * ```
 */
export interface NotifyAction {
    /**
     * Button label text displayed to the user.
     */
    label: string

    /**
     * Click handler invoked when the user clicks the action button.
     * The notification is NOT automatically dismissed; call `.dismiss()` if needed.
     */
    onClick: () => void
}

/**
 * Options for confirmation dialog notifications.
 *
 * @example
 * ```typescript
 * const confirmed = await notify({}).confirm("Delete permanently?", {
 *   confirmLabel: "Delete",
 *   cancelLabel: "Cancel"
 * })
 * ```
 */
export interface ConfirmOptions {
    /**
     * Label for the confirm/accept button.
     * @default "Confirm"
     */
    confirmLabel?: string

    /**
     * Label for the cancel/reject button.
     * @default "Cancel"
     */
    cancelLabel?: string
}

/**
 * Options for promise-tracking notifications.
 *
 * @example
 * ```typescript
 * await notify.promise(saveData(), {
 *   loading: "Saving changes...",
 *   success: "Changes saved!",
 *   error: (err) => `Failed: ${err.message}`
 * })
 * ```
 */
export interface PromiseOptions<TData = unknown, TError = unknown> {
    /**
     * Message displayed during the loading/pending state.
     * @default "Loading..."
     */
    loading?: string

    /**
     * Message displayed when the promise resolves successfully.
     * @default "Success"
     */
    success?: string | ((data: TData) => string)

    /**
     * Message displayed when the promise rejects.
     * Can be a static string or a function that extracts a message from the error.
     * @default "Error"
     */
    error?: string | ((error: TError) => string)
}

/**
 * Configuration options for individual notifications.
 * These can be passed to `notify()`, `notify.loading()`, etc.
 *
 * @example
 * ```typescript
 * notify("Hello world", {
 *   duration: 5000,
 *   position: "top-right",
 *   pauseOnHover: true,
 *   action: {
 *     label: "View",
 *     onClick: () => navigate("/details")
 *   }
 * })
 * ```
 */
export interface NotifyOptions {
    /**
     * Message text to display in the notification.
     */
    message?: string

    /**
     * Override position for this specific notification.
     * When not specified, uses the position from `<Notifier />` props.
     */
    position?: NotifyPositionType

    /**
     * Auto-dismiss duration in milliseconds.
     * Set to `0` for persistent notifications that don't auto-dismiss.
     * @default 3000
     */
    duration?: number

    /**
     * Whether to show a dismiss (X) button on the notification.
     * @default false
     */
    dismissible?: boolean

    /**
     * Pause the auto-dismiss timer when user hovers over the notification.
     * Timer resumes when mouse leaves.
     * @default true
     */
    pauseOnHover?: boolean

    /**
     * Allow swipe gestures to dismiss the notification.
     * Swipe direction is based on notification position.
     * @default true
     */
    swipeToDismiss?: boolean

    /**
     * Dismiss the notification when clicking anywhere on it.
     * Does not trigger if clicking on action buttons.
     * @default false
     */
    clickToDismiss?: boolean

    /**
     * Action button configuration.
     * When provided, an action button appears in the notification.
     */
    action?: NotifyAction

    /**
     * Confirm dialog options.
     * Used internally when `.confirm()` is called.
     */
    confirm?: ConfirmOptions

    /**
     * Default message for loading state when not explicitly provided.
     * @default "Loading..."
     */
    loadingMessage?: string

    /**
     * Default message for success state when not explicitly provided.
     * @default "Success"
     */
    successMessage?: string

    /**
     * Default message for error state when not explicitly provided.
     * @default "Error"
     */
    errorMessage?: string

    /**
     * Callback invoked when the notification first appears.
     */
    onOpen?: OnOpenCallback

    /**
     * Callback invoked when the notification fully closes (after animation).
     */
    onClose?: OnCloseCallback

    /**
     * Callback invoked when the notification is dismissed (before animation).
     */
    onDismiss?: OnDismissCallback

    /**
     * Callback invoked when the notification transitions between states.
     */
    onUpdate?: OnUpdateCallback
}

/**
 * Props for the `<Notifier />` component.
 *
 * This is the main configuration API for the notification system.
 * Place once in your app root (e.g., `layout.tsx`) and call `notify()` from anywhere.
 *
 * @example
 * ```tsx
 * // app/layout.tsx
 * import { Notifier } from "@remcostoeten/notifier"
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         {children}
 *         <Notifier
 *           position="bottom"
 *           maxVisible={5}
 *           duration={4000}
 *           colorMode="auto"
 *           radius="rounded"
 *         />
 *       </body>
 *     </html>
 *   )
 * }
 * ```
 */
export interface NotifierProps {
    /**
     * Default position for all notifications.
     * Individual notifications can override this via `NotifyOptions.position`.
     * @default "bottom"
     */
    position?: NotifyPositionType

    /**
     * Maximum number of notifications visible simultaneously.
     * When exceeded, the oldest notifications are dismissed with reason `"replaced"`.
     * @default 5
     */
    maxVisible?: number

    /**
     * Default auto-dismiss duration in milliseconds.
     * Can be overridden per-notification via `NotifyOptions.duration`.
     * @default 3000
     */
    duration?: number

    /**
     * Enable swipe-to-dismiss gestures globally.
     * @default true
     */
    swipeToDismiss?: boolean

    /**
     * Pause auto-dismiss timer on hover globally.
     * @default true
     */
    pauseOnHover?: boolean

    /**
     * Enable click-to-dismiss globally.
     * @default false
     */
    clickToDismiss?: boolean

    /**
     * Whether to show a dismiss (X) button on notifications by default.
     * @default false
     */
    dismissible?: boolean

    /**
     * Color theme for notifications.
     * @default "dark"
     */
    colorMode?: ColorMode

    /**
     * Border radius style for notification containers.
     * @default "pill"
     */
    radius?: RadiusVariant

    /**
     * Icon styling mode.
     * @default "colored"
     */
    iconColor?: IconColorMode

    /**
     * Border configuration for notification containers.
     */
    border?: BorderConfig

    /**
     * Custom icon configuration.
     */
    icons?: IconConfig

    /**
     * Custom color palette overrides.
     * Allows full control over the notification colors.
     */
    theme?: ThemePalette

    /**
     * Offset from screen edges in pixels.
     * Can be a single number for both axes or an object for per-axis control.
     * @default 16
     */
    offset?: number | string | { x?: number; y?: number }

    /**
     * Gap between stacked notifications in pixels.
     * @default 8
     */
    gap?: number
}

/**
 * Chainable notification instance returned by `notify()` and its static methods.
 *
 * All state transition methods return the same instance for chaining.
 *
 * @example
 * ```typescript
 * const n = notify.loading("Saving...")
 *
 * try {
 *   await saveData()
 *   n.success("Saved!")
 * } catch (err) {
 *   n.error("Failed to save")
 * }
 * ```
 */
export interface NotifyInstance {
    /**
     * Unique identifier for this notification.
     * Can be used with `notify.dismiss(id)` to dismiss externally.
     */
    readonly id: string

    /**
     * Transition the notification to loading state.
     *
     * @param message - Loading message to display
     * @returns This instance for chaining
     *
     * @example
     * ```typescript
     * notify({}).loading("Processing...")
     * ```
     */
    loading(message?: string): NotifyInstance

    /**
     * Transition the notification to success state.
     * Starts the auto-dismiss timer.
     *
     * @param message - Success message to display
     * @returns This instance for chaining
     *
     * @example
     * ```typescript
     * notify.loading("Saving...").success("Saved!")
     * ```
     */
    success(message?: string): NotifyInstance

    /**
     * Transition the notification to error state.
     * Starts the auto-dismiss timer.
     *
     * @param message - Error message to display
     * @returns This instance for chaining
     *
     * @example
     * ```typescript
     * notify.loading("Saving...").error("Failed to save")
     * ```
     */
    error(message?: string): NotifyInstance

    /**
     * Transition the notification to info state.
     * Starts the auto-dismiss timer.
     *
     * @param message - Info message to display
     * @returns This instance for chaining
     *
     * @example
     * ```typescript
     * notify({}).info("New update available")
     * ```
     */
    info(message?: string): NotifyInstance

    /**
     * Dismiss this notification immediately.
     * Triggers exit animation and `onDismiss`/`onClose` callbacks.
     *
     * @example
     * ```typescript
     * const n = notify("Hello")
     * setTimeout(() => n.dismiss(), 1000)
     * ```
     */
    dismiss(): void

    /**
     * Update notification options after creation.
     * Useful for adding actions dynamically.
     *
     * @param options - Partial options to merge
     * @returns This instance for chaining
     *
     * @example
     * ```typescript
     * const n = notify("Item deleted")
     * n.update({
     *   action: {
     *     label: "Undo",
     *     onClick: () => { restore(); n.dismiss() }
     *   }
     * })
     * ```
     */
    update(options: Partial<NotifyOptions>): NotifyInstance

    /**
     * Track a promise with automatic state transitions.
     *
     * Shows loading state initially, then success or error based on promise result.
     *
     * @typeParam T - Promise resolve type
     * @param promise - Promise to track
     * @param options - Messages for each state
     * @returns The original promise result
     * @throws Re-throws any error from the promise after showing error state
     *
     * @example
     * ```typescript
     * const data = await notify({}).promise(fetchData(), {
     *   loading: "Fetching...",
     *   success: "Data loaded!",
     *   error: "Failed to fetch"
     * })
     * ```
     */
    promise<T>(promise: Promise<T>, options?: PromiseOptions): Promise<T>

    /**
     * Show a confirmation dialog and wait for user response.
     *
     * @param message - Confirmation message to display
     * @param options - Button label customization
     * @returns Promise resolving to `true` if confirmed, `false` if cancelled
     *
     * @example
     * ```typescript
     * const n = notify({})
     * const confirmed = await n.confirm("Delete file?", {
     *   confirmLabel: "Delete",
     *   cancelLabel: "Keep"
     * })
     *
     * if (confirmed) {
     *   n.loading("Deleting...").success("Deleted!")
     * } else {
     *   n.dismiss()
     * }
     * ```
     */
    confirm(message: string, options?: ConfirmOptions): Promise<boolean>
}

/**
 * Type definition for the main `notify` function and its static methods.
 *
 * @example
 * ```typescript
 * import { notify } from "@remcostoeten/notifier"
 *
 * notify("Hello!")
 * notify.success("Saved!")
 * notify.loading("Processing...")
 * notify.error("Something went wrong")
 * notify.info("New update available")
 * notify.dismiss()
 * ```
 */
export interface NotifyFunction {
    /**
     * Create and display a notification.
     *
     * @param messageOrOptions - Message string or options object
     * @param options - Additional options when first param is a message string
     * @returns Chainable notification instance
     */
    (messageOrOptions?: string | NotifyOptions, options?: NotifyOptions): NotifyInstance

    /**
     * Show a loading notification with spinner.
     */
    loading: (message?: string, options?: NotifyOptions) => NotifyInstance

    /**
     * Show a success notification.
     */
    success: (message?: string, options?: NotifyOptions) => NotifyInstance

    /**
     * Show an error notification.
     */
    error: (message?: string, options?: NotifyOptions) => NotifyInstance

    /**
     * Show an info notification.
     */
    info: (message?: string, options?: NotifyOptions) => NotifyInstance

    /**
     * Dismiss a specific notification by ID, or all notifications if no ID provided.
     */
    dismiss: (id?: string) => void

    /**
     * Track a promise with automatic loading/success/error transitions.
     */
    promise: <T>(promise: Promise<T>, options?: PromiseOptions) => Promise<T>

    /**
     * Show a confirmation dialog and wait for user response.
     */
    confirm: (message: string, options?: ConfirmOptions) => Promise<boolean>

    /**
     * Configure global defaults.
     */
    configure: (config: NotifyContainerConfig) => void

    /**
     * Get current global configuration.
     */
    getConfig: () => NotifyContainerConfig
}

/**
 * Internal notification item stored in the state.
 * @internal
 */
export interface NotifyItem {
    id: string
    state: NotifyState
    message: string
    options: NotifyOptions
    visible: boolean
    prevState: NotifyState
    confirmResolver: ((confirmed: boolean) => void) | null
    createdAt: number
    stateStartedAt: number
    paused: boolean
    remainingTime: number | null
}

/**
 * Store listener callback type.
 * @internal
 */
export type StoreListener = () => void

/**
 * Internal theme configuration derived from NotifierProps.
 * @internal
 */
export interface ThemeConfig {
    colorMode?: ColorMode
    radius?: RadiusVariant
    iconColor?: IconColorMode
    border?: BorderConfig
    icons?: IconConfig
    // Palette overrides
    palette?: ThemePalette
}

/**
 * Internal container config stored in the store.
 * @internal
 */
export interface NotifyContainerConfig {
    position?: NotifyPositionType
    maxVisible?: number
    defaultDuration?: number
    swipeToDismiss?: boolean
    pauseOnHover?: boolean
    clickToDismiss?: boolean
    offset?: number | string | { x?: number; y?: number }
    gap?: number
}
