/**
 * @fileoverview Main notify API with chainable interface.
 * Supports multiple notifications, positioning, and callbacks.
 */

import { Defaults, DismissReason } from './constants'
import {
    setState,
    dismiss,
    dismissAll,
    setConfirmState,
    enforceMaxVisible,
    updateOptions
} from './store'
import { getErrorMessage, generateId } from './utils'
import type {
    NotifyInstance,
    NotifyOptions,
    ConfirmOptions,
    PromiseOptions,
    NotifyContainerConfig
} from './types'

// ============================================================================
// GLOBAL CONFIGURATION
// ============================================================================

/** Global container configuration */
let globalConfig: NotifyContainerConfig = {
    position: Defaults.POSITION,
    maxVisible: Defaults.MAX_VISIBLE,
    defaultDuration: Defaults.DURATION_MS,
    swipeToDismiss: true,
    pauseOnHover: true,
    clickToDismiss: false
}

/**
 * Configures global defaults for all notifications.
 * @param config - Configuration options
 */
export function configure(config: NotifyContainerConfig): void {
    globalConfig = { ...globalConfig, ...config }
}

/**
 * Returns the current global configuration.
 * @returns Current configuration
 */
export function getConfig(): NotifyContainerConfig {
    return globalConfig
}

// ============================================================================
// INSTANCE FACTORY
// ============================================================================

/**
 * Creates a chainable notification instance.
 * @param id - Notification ID
 * @param baseOptions - Base configuration for all methods
 * @returns Chainable NotifyInstance
 * @internal
 */
function createNotifyInstance(id: string, baseOptions: NotifyOptions = {}): NotifyInstance {
    const mergedOptions: NotifyOptions = {
        position: globalConfig.position,
        duration: globalConfig.defaultDuration,
        swipeToDismiss: globalConfig.swipeToDismiss,
        pauseOnHover: globalConfig.pauseOnHover,
        clickToDismiss: globalConfig.clickToDismiss,
        ...baseOptions
    }

    const instance: NotifyInstance = {
        id,

        loading(message?: string) {
            setState(
                id,
                'loading',
                message ?? mergedOptions.loadingMessage ?? Defaults.MESSAGES.LOADING,
                mergedOptions
            )
            return instance
        },

        success(message?: string) {
            setState(
                id,
                'success',
                message ?? mergedOptions.successMessage ?? Defaults.MESSAGES.SUCCESS,
                mergedOptions
            )
            return instance
        },

        error(message?: string) {
            setState(
                id,
                'error',
                message ?? mergedOptions.errorMessage ?? Defaults.MESSAGES.ERROR,
                mergedOptions
            )
            return instance
        },

        info(message?: string) {
            setState(id, 'info', message ?? Defaults.MESSAGES.LOADING, mergedOptions)
            return instance
        },

        dismiss() {
            dismiss(id, DismissReason.MANUAL)
        },

        update(options: Partial<NotifyOptions>) {
            // Update local merged options
            Object.assign(mergedOptions, options)
            // Update store
            updateOptions(id, options)
            return instance
        },

        async promise<T>(promise: Promise<T>, options?: PromiseOptions<T>): Promise<T> {
            instance.loading(options?.loading)
            try {
                const result = await promise
                const successOpt = options?.success
                const successMessage =
                    typeof successOpt === 'function'
                        ? successOpt(result)
                        : (successOpt ?? Defaults.MESSAGES.SUCCESS)
                instance.success(successMessage)
                return result
            } catch (err) {
                const errorOpt = options?.error
                const errorMessage =
                    typeof errorOpt === 'function'
                        ? errorOpt(err)
                        : (errorOpt ?? getErrorMessage(err, Defaults.MESSAGES.ERROR))
                instance.error(errorMessage)
                throw err
            }
        },

        confirm(message: string, options?: ConfirmOptions): Promise<boolean> {
            return new Promise((resolve) => {
                setConfirmState(id, message, { ...mergedOptions, confirm: options }, resolve)
            })
        }
    }

    return instance
}

// ============================================================================
// MAIN API
// ============================================================================

/**
 * Creates and displays a notification.
 * @param messageOrOptions - Message string or configuration object
 * @param options - Additional options (when first param is message string)
 * @returns Chainable NotifyInstance for state transitions
 */
export function notify(
    messageOrOptions?: string | NotifyOptions,
    options?: NotifyOptions
): NotifyInstance {
    // Handle both notify("msg", opts) and notify({ message, ...opts })
    const resolvedOptions: NotifyOptions =
        typeof messageOrOptions === 'string'
            ? { ...options, message: messageOrOptions }
            : (messageOrOptions ?? {})

    const id = generateId()

    // Enforce max visible limit
    enforceMaxVisible(globalConfig.maxVisible ?? Defaults.MAX_VISIBLE, id)

    const instance = createNotifyInstance(id, resolvedOptions)

    if (resolvedOptions.message) {
        setState(id, 'info', resolvedOptions.message, {
            position: globalConfig.position,
            duration: globalConfig.defaultDuration,
            swipeToDismiss: globalConfig.swipeToDismiss,
            pauseOnHover: globalConfig.pauseOnHover,
            clickToDismiss: globalConfig.clickToDismiss,
            ...resolvedOptions
        })
    }

    return instance
}

// ============================================================================
// STATIC METHODS
// ============================================================================

/**
 * Shows a loading notification.
 * @param message - Loading message
 * @param options - Additional options
 * @returns Chainable NotifyInstance
 */
notify.loading = (message?: string, options?: NotifyOptions): NotifyInstance => {
    const id = generateId()
    enforceMaxVisible(globalConfig.maxVisible ?? Defaults.MAX_VISIBLE, id)
    const instance = createNotifyInstance(id, options)
    return instance.loading(message)
}

/**
 * Shows a success notification.
 * @param message - Success message
 * @param options - Additional options
 * @returns Chainable NotifyInstance
 */
notify.success = (message?: string, options?: NotifyOptions): NotifyInstance => {
    const id = generateId()
    enforceMaxVisible(globalConfig.maxVisible ?? Defaults.MAX_VISIBLE, id)
    const instance = createNotifyInstance(id, options)
    return instance.success(message)
}

/**
 * Shows an error notification.
 * @param message - Error message
 * @param options - Additional options
 * @returns Chainable NotifyInstance
 */
notify.error = (message?: string, options?: NotifyOptions): NotifyInstance => {
    const id = generateId()
    enforceMaxVisible(globalConfig.maxVisible ?? Defaults.MAX_VISIBLE, id)
    const instance = createNotifyInstance(id, options)
    return instance.error(message)
}

notify.info = (message?: string, options?: NotifyOptions): NotifyInstance => {
    const id = generateId()
    enforceMaxVisible(globalConfig.maxVisible ?? Defaults.MAX_VISIBLE, id)
    const instance = createNotifyInstance(id, options)
    setState(id, 'info', message ?? Defaults.MESSAGES.LOADING, {
        position: globalConfig.position,
        duration: globalConfig.defaultDuration,
        swipeToDismiss: globalConfig.swipeToDismiss,
        pauseOnHover: globalConfig.pauseOnHover,
        clickToDismiss: globalConfig.clickToDismiss,
        ...options
    })
    return instance
}

/**
 * Dismisses a specific notification or all if no ID provided.
 * @param id - Optional notification ID
 */
notify.dismiss = (id?: string): void => {
    if (id) {
        dismiss(id, DismissReason.MANUAL)
    } else {
        dismissAll(DismissReason.MANUAL)
    }
}

/**
 * Wraps a promise with loading/success/error notifications.
 * @param promise - The promise to track
 * @param options - Messages for each state
 * @returns The original promise result
 * @throws Re-throws any error from the promise
 */
notify.promise = <T>(promise: Promise<T>, options?: PromiseOptions): Promise<T> => {
    const id = generateId()
    enforceMaxVisible(globalConfig.maxVisible ?? Defaults.MAX_VISIBLE, id)
    return createNotifyInstance(id).promise(promise, options)
}

/**
 * Shows a confirmation dialog and waits for user response.
 * @param message - The confirmation message to display
 * @param options - Button label customization
 * @returns Promise resolving to true on confirm, false on cancel
 */
notify.confirm = (message: string, options?: ConfirmOptions): Promise<boolean> => {
    const id = generateId()
    enforceMaxVisible(globalConfig.maxVisible ?? Defaults.MAX_VISIBLE, id)
    return createNotifyInstance(id).confirm(message, options)
}

/**
 * Configures global defaults for all notifications.
 * @param config - Configuration options
 */
notify.configure = configure

/**
 * Returns the current global configuration.
 * @returns Current configuration
 */
notify.getConfig = getConfig
