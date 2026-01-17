/* eslint-disable no-unused-vars, @typescript-eslint/no-unused-vars */
import type { ReactNode } from 'react'
import { notify } from '../notify'
import type { NotifyOptions, PromiseOptions, NotifyPositionType } from '../types'

/**
 * Configuration for a toast adapter.
 */
export interface AdapterConfig {
    /** Default options to apply to all notifications */
    defaultOptions?: Partial<NotifyOptions>
    /** Function to map external position names to NotifyPositionType */
    mapPosition?: (pos: string) => NotifyPositionType
}

/**
 * Generic interface for a toast compatibility adapter.
 * Matches common patterns across libraries (sonner, react-hot-toast).
 */
export interface ToastAdapter {
    (message: string | ReactNode, options?: any): string | number
    success(message: string | ReactNode, options?: any): string | number
    error(message: string | ReactNode, options?: any): string | number
    loading(message: string | ReactNode, options?: any): string | number
    promise<T>(promise: Promise<T> | (() => Promise<T>), data: any, options?: any): Promise<T>
    dismiss(id?: string | number): void
    custom(jsx: (id: string) => ReactNode, options?: any): string | number
}

/**
 * Creates a toast adapter that maps external API calls to @remcostoeten/notifier.
 */
export function createToastAdapter(config: AdapterConfig = {}): ToastAdapter {
    const { defaultOptions } = config

    // Helper to normalize message
    const getMessage = (msg: any): string => {
        if (typeof msg === 'string') return msg
        if (typeof msg === 'number') return String(msg)
        // If ReactNode, we might need a custom renderer, currently casting or specific handling required
        // For now, handling strings primarily as that's 99% usage
        return String(msg)
    }

    // Base toast function
    const toast = (message: string | ReactNode, options: any = {}) => {
        const opts = { ...defaultOptions, ...options }
        return notify(getMessage(message), opts).id
    }

    // Method implementations
    toast.success = (message: string | ReactNode, options: any = {}) => {
        return notify.success(getMessage(message), { ...defaultOptions, ...options }).id
    }

    toast.error = (message: string | ReactNode, options: any = {}) => {
        return notify.error(getMessage(message), { ...defaultOptions, ...options }).id
    }

    toast.loading = (message: string | ReactNode, options: any = {}) => {
        return notify.loading(getMessage(message), { ...defaultOptions, ...options }).id
    }

    toast.info = (message: string | ReactNode, options: any = {}) => {
        return notify.info(getMessage(message), { ...defaultOptions, ...options }).id
    }

    toast.dismiss = (id?: string | number) => {
        notify.dismiss(id ? String(id) : undefined)
    }

    // Promise handler
    toast.promise = <T>(promiseOrFunction: Promise<T> | (() => Promise<T>), data: any) => {
        const promise =
            typeof promiseOrFunction === 'function' ? promiseOrFunction() : promiseOrFunction

        // Normalize promise options
        // Sonner/RHT use diverse signatures. We'll try to detect.
        const promiseOptions: PromiseOptions = {
            loading: data.loading ?? 'Loading...',
            success: data.success ?? 'Success',
            error: data.error ?? 'Error'
        }

        return notify.promise(promise, promiseOptions)
    }

    // Custom JSX handler

    toast.custom = (jsx: (id: string) => ReactNode, _options?: any) => {
        // Requires a custom render capability in notifier.
        // For now, using a workaround or just treating as info if generic
        // TO-DO: Implement custom component rendering support in core if needed
        console.warn('toast.custom is not fully supported yet in adapter')
        return notify.info('Custom toast').id
    }

    return toast as ToastAdapter
}
