import type { ReactNode } from 'react'
import { notify } from '../notify'
import type { NotifyMessage, NotifyOptions, PromiseOptions, NotifyPositionType } from '../types'

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
    info(message: string | ReactNode, options?: any): string | number
    warning(message: string | ReactNode, options?: any): string | number
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

    // Notifier accepts ReactNode messages directly; only numbers need coercion
    const getMessage = (msg: unknown): NotifyMessage => {
        if (typeof msg === 'number') return String(msg)
        return msg as NotifyMessage
    }

    const toast = (message: string | ReactNode, options: any = {}) => {
        const opts = { ...defaultOptions, ...options }
        return notify({ ...opts, message: getMessage(message) }).id
    }

    toast.success = (message: string | ReactNode, options: any = {}) => {
        return notify.success(getMessage(message), { ...defaultOptions, ...options }).id
    }

    toast.error = (message: string | ReactNode, options: any = {}) => {
        return notify.error(getMessage(message), { ...defaultOptions, ...options }).id
    }

    toast.info = (message: string | ReactNode, options: any = {}) => {
        return notify.info(getMessage(message), { ...defaultOptions, ...options }).id
    }

    toast.warning = (message: string | ReactNode, options: any = {}) => {
        return notify.warning(getMessage(message), { ...defaultOptions, ...options }).id
    }

    toast.loading = (message: string | ReactNode, options: any = {}) => {
        return notify.loading(getMessage(message), { ...defaultOptions, ...options }).id
    }

    toast.dismiss = (id?: string | number) => {
        notify.dismiss(id ? String(id) : undefined)
    }

    toast.promise = <T>(promiseOrFunction: Promise<T> | (() => Promise<T>), data: any) => {
        const promise =
            typeof promiseOrFunction === 'function' ? promiseOrFunction() : promiseOrFunction

        // Sonner/RHT allow static messages or (data) => message functions; both pass through
        const promiseOptions: PromiseOptions<T> = {
            loading: data?.loading ?? 'Loading...',
            success: data?.success ?? 'Success',
            error: data?.error ?? 'Error'
        }

        return notify.promise(promise, promiseOptions)
    }

    toast.custom = (jsx: (id: string) => ReactNode, options: any = {}) => {
        const instance = notify({ ...defaultOptions, ...options })
        instance.info(jsx(instance.id))
        return instance.id
    }

    return toast as ToastAdapter
}
