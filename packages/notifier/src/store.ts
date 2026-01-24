/**
 * @fileoverview Reactive store for notification state management.
 * Supports multiple notifications with position-based stacking.
 */

import { NotifyStateType, Defaults, DismissReason } from "./constants"
import type { NotifyState, NotifyOptions, NotifyItem, StoreListener, DismissReasonType } from "./types"

// ============================================================================
// STORE STATE
// ============================================================================

console.log("[Notifier] Store Module Initialized")

/** Map of notification items by ID */
const notifications = new Map<string, NotifyItem>()

/** Set of subscribed listeners */
const listeners = new Set<StoreListener>()

/** Map of dismiss timeouts by notification ID */
const dismissTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

// ============================================================================
// INTERNAL HELPERS
// ============================================================================

/**
 * Notifies all subscribed listeners of a state change.
 * @internal
 */
function emit(): void {
  console.log("[Notifier] Emitting to listeners:", listeners.size)
  listeners.forEach((listener) => listener())
}

/**
 * Clears any pending auto-dismiss timeout for a notification.
 * @internal
 */
function clearDismissTimeout(id: string): void {
  const timeout = dismissTimeouts.get(id)
  if (timeout) {
    clearTimeout(timeout)
    dismissTimeouts.delete(id)
  }
}

/**
 * Determines if a state should auto-dismiss.
 * @internal
 */
function shouldAutoDismiss(state: NotifyState): boolean {
  return state === NotifyStateType.SUCCESS || state === NotifyStateType.ERROR || state === NotifyStateType.INFO
}

/**
 * Sets up auto-dismiss timeout for a notification.
 * @internal
 */
function setupAutoDismiss(id: string, duration: number): void {
  clearDismissTimeout(id)
  dismissTimeouts.set(
    id,
    setTimeout(() => {
      dismiss(id, DismissReason.TIMEOUT)
    }, duration),
  )
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Returns all notifications as an array, sorted by creation time.
 * @returns Array of notification items
 */
export function getNotifications(): NotifyItem[] {
  return Array.from(notifications.values()).sort((a, b) => a.createdAt - b.createdAt)
}

export function resetStore(): void {
  dismissTimeouts.forEach(clearTimeout)
  notifications.clear()
  listeners.clear()
  dismissTimeouts.clear()
}

/**
 * Returns a specific notification by ID.
 * @param id - Notification ID
 * @returns The notification item or undefined
 */
export function getNotification(id: string): NotifyItem | undefined {
  return notifications.get(id)
}

/**
 * Subscribes to store changes.
 * @param listener - Callback invoked on state changes
 * @returns Unsubscribe function
 */
export function subscribe(listener: StoreListener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/**
 * Creates a new notification or updates an existing one.
 * @param id - Notification ID
 * @param state - New notification state
 * @param message - Message to display
 * @param options - Additional options
 */
export function setState(id: string, state: NotifyState, message: string, options: NotifyOptions = {}): void {
  console.log(`[Notifier] setState: ${id} -> ${state}`, message)
  clearDismissTimeout(id)

  const existing = notifications.get(id)
  const prevState = existing?.state ?? NotifyStateType.IDLE

  const mergedOptions: NotifyOptions = {
    ...(existing?.options ?? {}),
    ...options,
    // Preserve action if it exists in either
    action: options.action ?? existing?.options?.action,
  }

  // Call onUpdate callback if state changed
  if (existing && state !== prevState && mergedOptions.onUpdate) {
    mergedOptions.onUpdate(id, state, prevState)
  }

  const now = Date.now()
  const isStateChange = existing && state !== prevState

  const item: NotifyItem = {
    id,
    state,
    message,
    options: mergedOptions,
    visible: true,
    prevState,
    confirmResolver: existing?.confirmResolver ?? null,
    createdAt: existing?.createdAt ?? now,
    stateStartedAt: isStateChange ? now : (existing?.stateStartedAt ?? now),
    paused: false,
    remainingTime: null,
  }

  notifications.set(id, item)

  // Call onOpen for new notifications
  if (!existing && mergedOptions.onOpen) {
    mergedOptions.onOpen(id)
  }

  emit()

  // Auto-dismiss for terminal states
  if (shouldAutoDismiss(state) && mergedOptions.duration !== 0) {
    const duration = mergedOptions.duration ?? Defaults.DURATION_MS
    setupAutoDismiss(id, duration)
  }
}

/**
 * Transitions to confirm state with a resolver.
 * @param id - Notification ID
 * @param message - Confirmation message
 * @param options - Notification options
 * @param resolver - Callback to resolve the confirm promise
 * @internal
 */
export function setConfirmState(
  id: string,
  message: string,
  options: NotifyOptions,
  resolver: (confirmed: boolean) => void,
): void {
  clearDismissTimeout(id)

  const existing = notifications.get(id)
  const prevState = existing?.state ?? NotifyStateType.IDLE

  const mergedOptions = existing ? { ...existing.options, ...options } : options

  const now = Date.now()

  const item: NotifyItem = {
    id,
    state: NotifyStateType.CONFIRM,
    message,
    options: mergedOptions,
    visible: true,
    prevState,
    confirmResolver: resolver,
    createdAt: existing?.createdAt ?? now,
    stateStartedAt: now,
    paused: false,
    remainingTime: null,
  }

  notifications.set(id, item)

  if (!existing && mergedOptions.onOpen) {
    mergedOptions.onOpen(id)
  }

  emit()
}

/**
 * Resolves a pending confirmation dialog.
 * Does NOT dismiss the notification - caller should chain to next state or dismiss manually.
 * @param id - Notification ID
 * @param confirmed - Whether the user confirmed
 * @internal
 */
export function resolveConfirm(id: string, confirmed: boolean): void {
  const item = notifications.get(id)
  if (item?.confirmResolver) {
    const resolver = item.confirmResolver
    notifications.set(id, { ...item, confirmResolver: null })
    resolver(confirmed)
  }
}

/**
 * Pauses the auto-dismiss timer for a notification.
 * @param id - Notification ID
 */
export function pauseTimer(id: string): void {
  const item = notifications.get(id)
  if (!item || item.paused) return

  const timeout = dismissTimeouts.get(id)
  if (timeout) {
    clearDismissTimeout(id)
    const elapsed = Date.now() - item.stateStartedAt
    const duration = item.options.duration ?? Defaults.DURATION_MS
    const remaining = Math.max(0, duration - elapsed)

    notifications.set(id, { ...item, paused: true, remainingTime: remaining })
    emit()
  }
}

export function resumeTimer(id: string): void {
  const item = notifications.get(id)
  if (!item || !item.paused) return

  const remaining = item.remainingTime ?? Defaults.DURATION_MS
  const now = Date.now()
  notifications.set(id, { ...item, paused: false, remainingTime: null, stateStartedAt: now })

  if (shouldAutoDismiss(item.state)) {
    setupAutoDismiss(id, remaining)
  }

  emit()
}

/**
 * Dismisses a notification.
 * @param id - Notification ID
 * @param reason - Reason for dismissal
 */
export function dismiss(id: string, reason: DismissReasonType = DismissReason.MANUAL): void {
  const item = notifications.get(id)
  if (!item) return

  clearDismissTimeout(id)

  // Auto-resolve pending confirms as false
  if (item.confirmResolver) {
    item.confirmResolver(false)
  }

  // Call onDismiss callback
  if (item.options.onDismiss) {
    item.options.onDismiss(id, reason)
  }

  notifications.set(id, { ...item, visible: false, confirmResolver: null })
  emit()

  // Remove from store after animation completes
  setTimeout(() => {
    notifications.delete(id)
    if (item.options.onClose) {
      item.options.onClose(id)
    }
    emit()
  }, 300)
}

/**
 * Dismisses all notifications.
 * @param reason - Reason for dismissal
 */
export function dismissAll(reason: DismissReasonType = DismissReason.MANUAL): void {
  notifications.forEach((_, id) => dismiss(id, reason))
}

/**
 * Enforces maximum visible notifications limit.
 * @param maxVisible - Maximum number to keep
 * @param excludeId - ID to exclude from removal
 */
export function enforceMaxVisible(maxVisible: number, excludeId?: string): void {
  const items = getNotifications()
  const visibleItems = items.filter((item) => item.visible && item.id !== excludeId)

  if (visibleItems.length >= maxVisible) {
    const toRemove = visibleItems.slice(0, visibleItems.length - maxVisible + 1)
    toRemove.forEach((item) => dismiss(item.id, DismissReason.REPLACED))
  }
}

/**
 * Updates options for an existing notification without changing state.
 * @param id - Notification ID
 * @param options - Options to merge
 */
export function updateOptions(id: string, options: Partial<NotifyOptions>): void {
  const item = notifications.get(id)
  if (!item) return

  notifications.set(id, {
    ...item,
    options: {
      ...item.options,
      ...options,
    },
  })

  emit()
}
