import type { ReactNode } from 'react'
import { dismiss, dismissAll, show, showCustom, update } from './store'
import { noop } from './utils'
import type {
    CustomRender,
    CustomToastOptions,
    PromiseMessage,
    PromiseMessages,
    ToastID,
    ToastInput,
    ToastPatch,
    ToastStatus
} from './types'

const clearedContent: ToastPatch = {
    icon: undefined,
    avatar: undefined,
    meta: undefined,
    description: undefined,
    progress: undefined,
    actions: undefined
}

function asInput(message: ToastInput | string): ToastInput {
    return typeof message === 'string' ? { title: message } : message
}

function resolveMessage<Value>(message: PromiseMessage<Value>, value: Value): ToastInput | string {
    return typeof message === 'function' ? message(value) : message
}

function withStatus(status: ToastStatus) {
    return (title: ReactNode, input: ToastInput = {}): ToastID => show({ ...input, status, title })
}

function notifyBase(source: string | ToastInput, input: ToastInput = {}): ToastID {
    return show(typeof source === 'string' ? { ...input, title: source } : { ...source, ...input })
}

/**
 * @name notify.promise
 * @description Shows a loading toast, then turns it into a success or error toast
 * when the promise settles. Resolves with the promise's value and rethrows its
 * error, so it can wrap an existing `await`. A call that is not awaited does not
 * leave an unhandled rejection.
 *
 * @example
 * await notify.promise(save(), {
 *   loading: 'Saving',
 *   success: (data) => `Saved ${data.name}`,
 *   error: (error) => error.message
 * })
 */
function promise<Data>(source: Promise<Data>, messages: PromiseMessages<Data>): Promise<Data> {
    const id = show({ ...asInput(messages.loading), id: messages.id, status: 'loading' })
    const result = source.then(
        (data) => {
            update(id, {
                ...clearedContent,
                ...asInput(resolveMessage(messages.success, data)),
                status: 'success'
            })
            return data
        },
        (caught) => {
            const error = caught instanceof Error ? caught : new Error(String(caught))
            update(id, {
                ...clearedContent,
                ...asInput(resolveMessage(messages.error, error)),
                status: 'error'
            })
            throw error
        }
    )
    result.catch(noop)
    return result
}

/**
 * @name notify.custom
 * @description Opens a toast whose content is rendered by the caller, usually
 * from the `Toast` primitives. Positioning, motion, swipe and timers still apply.
 *
 * @example
 * notify.custom((toast) => (
 *   <Toast>
 *     <Toast.Body>
 *       <Toast.Title>Hello</Toast.Title>
 *     </Toast.Body>
 *     <Toast.Close />
 *   </Toast>
 * ))
 */
function custom(render: CustomRender, options?: CustomToastOptions): ToastID {
    return showCustom(render, options)
}

/**
 * @name notify
 * @description Opens a toast and returns its id. Pass a title string for the
 * simple case, or an input object to set any slot. Pass an existing `id` to
 * replace that toast's content in place; use `notify.update` to change only
 * some fields.
 *
 * @example
 * notify('Saved')
 * notify({
 *   tone: 'dark',
 *   status: 'success',
 *   title: 'Details updated',
 *   description: 'Your team can make edits.',
 *   actions: [{ label: 'View profile', color: 'default' }]
 * })
 */
export const notify = Object.assign(notifyBase, {
    success: withStatus('success'),
    error: withStatus('error'),
    warning: withStatus('warning'),
    info: withStatus('info'),
    loading: withStatus('loading'),
    custom,
    promise,
    update,
    dismiss: (id?: ToastID) => (id === undefined ? dismissAll() : dismiss(id))
})
