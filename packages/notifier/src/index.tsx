/**
 * @module notify
 * @description Enterprise-grade chainable notification system.
 *
 * ## Quick Start
 *
 * 1. Add Notifier to your app root:
 * ```tsx
 * import { Notifier } from "@/module/notify"
 *
 * export default function Layout({ children }) {
 *   return (
 *     <>
 *       {children}
 *       <Notifier />
 *     </>
 *   )
 * }
 * ```
 *
 * 2. Call notify() from anywhere:
 * ```tsx
 * import { notify } from "@/module/notify"
 *
 * notify("Hello!")
 * notify.success("Saved!")
 * notify.loading("Processing...").success("Done!")
 * ```
 *
 * ## Notifier Props
 *
 * Configure all behavior and theming via the Notifier component:
 *
 * ```tsx
 * <Notifier
 *   // Behavior
 *   position="top-right"
 *   maxVisible={5}
 *   duration={4000}
 *   swipeToDismiss={true}
 *   pauseOnHover={true}
 *   clickToDismiss={false}
 *   offset={16}
 *   gap={8}
 *
 *   // Theming
 *   colorMode="dark"
 *   radius="pill"
 *   iconColor="colored"
 *   border={{ enabled: false }}
 *   icons={{ success: <CustomIcon /> }}
 * />
 * ```
 *
 * ## API Methods
 *
 * - `notify(message)` - Show info notification
 * - `notify.loading(message)` - Show loading state
 * - `notify.success(message)` - Show success state
 * - `notify.error(message)` - Show error state
 * - `notify.dismiss(id?)` - Dismiss one or all
 * - `notify.promise(promise, opts)` - Track async operation
 * - `notify.confirm(message, opts)` - Await user confirmation
 *
 * ## Chaining
 *
 * ```tsx
 * const n = notify.loading("Saving...")
 * await saveData()
 * n.success("Saved!")
 * ```
 */

export { notify } from "./notify"
export { Notifier, Notification, type NotifierProps } from "./components/notification"

export type {
  NotifyState,
  NotifyPositionType,
  DismissReasonType,
  NotifyOptions,
  NotifyInstance,
  NotifyAction,
  ConfirmOptions,
  PromiseOptions,
  OnOpenCallback,
  OnCloseCallback,
  OnDismissCallback,
  OnUpdateCallback,
  // Theming types
  ThemeConfig,
  RadiusVariant,
  ColorMode,
  IconColorMode,
  BorderConfig,
  IconConfig,
  IconProps,
} from "./types"

export { NotifyStateType, NotifyPosition, DismissReason, Defaults, AnimationConfig } from "./constants"

export { resetStore } from "./store"
