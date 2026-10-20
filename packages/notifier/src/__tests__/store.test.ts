import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
    configureStore,
    dismiss,
    dismissAll,
    getRecord,
    getSnapshot,
    holdsOpen,
    pauseTimers,
    resetStore,
    resolveDuration,
    resumeTimers,
    show,
    showCustom,
    subscribe,
    trackShown,
    update
} from '../store'
import { Defaults } from '../constants'
import type { ToastInput } from '../types'

function shown(input: ToastInput): string {
    const id = show(input)
    trackShown(id)
    return id
}

describe('store', () => {
    beforeEach(() => {
        resetStore()
    })

    describe('show', () => {
        it('opens a toast and exposes it in the snapshot', () => {
            const id = show({ title: 'Saved' })
            expect(getSnapshot()).toHaveLength(1)
            expect(getRecord(id)).toMatchObject({ id, open: true, input: { title: 'Saved' } })
        })

        it('generates unique ids', () => {
            expect(show({ title: 'a' })).not.toBe(show({ title: 'b' }))
        })

        it('keeps creation order', () => {
            const first = show({ title: 'first' })
            const second = show({ title: 'second' })
            expect(getSnapshot().map((record) => record.id)).toEqual([first, second])
        })

        it('replaces the content when the id already exists', () => {
            show({ id: 'upload', title: 'Uploading', description: 'one', progress: 30 })
            show({ id: 'upload', title: 'Uploaded' })
            expect(getSnapshot()).toHaveLength(1)
            expect(getRecord('upload')?.input).toEqual({ id: 'upload', title: 'Uploaded' })
        })

        it('does not carry a duration over from the content it replaces', () => {
            const id = shown({ id: 'network', title: 'You are offline', duration: 0 })
            show({ id: 'network', title: 'Back online', status: 'success' })
            vi.advanceTimersByTime(Defaults.DURATION_MS)
            expect(getRecord(id)?.open).toBe(false)
        })

        it('restarts the timer when the content is replaced', () => {
            const id = shown({ id: 'a', title: 'one', duration: 1000 })
            vi.advanceTimersByTime(900)
            show({ id: 'a', title: 'two', duration: 1000 })
            vi.advanceTimersByTime(900)
            expect(getRecord(id)?.open).toBe(true)
            vi.advanceTimersByTime(100)
            expect(getRecord(id)?.open).toBe(false)
        })

        it('turns a custom toast into a slot toast when replaced by show', () => {
            showCustom(() => null, { id: 'a' })
            show({ id: 'a', title: 'Slots' })
            expect(getRecord('a')?.render).toBeNull()
        })

        it('fires onOpen once, for a new toast only', () => {
            const onOpen = vi.fn()
            show({ id: 'a', title: 'a', onOpen })
            show({ id: 'a', title: 'b', onOpen })
            expect(onOpen).toHaveBeenCalledTimes(1)
            expect(onOpen).toHaveBeenCalledWith('a')
        })

        it('replaces the content of a toast that is leaving and reopens it', () => {
            show({ id: 'a', title: 'one' })
            dismiss('a')
            show({ id: 'a', title: 'two' })
            vi.advanceTimersByTime(Defaults.EXIT_MS * 2)
            expect(getRecord('a')).toMatchObject({ open: true, input: { title: 'two' } })
        })
    })

    describe('showCustom', () => {
        it('stores the render function with the options', () => {
            function render() {
                return null
            }
            const id = showCustom(render, { duration: 1000, position: 'top-left' })
            expect(getRecord(id)?.render).toBe(render)
            expect(getRecord(id)?.input).toMatchObject({ duration: 1000, position: 'top-left' })
        })
    })

    describe('shown', () => {
        it('does not start a timer until the toast is shown', () => {
            const id = show({ title: 'Saved', duration: 1000 })
            vi.advanceTimersByTime(5000)
            expect(getRecord(id)?.open).toBe(true)
            trackShown(id)
            vi.advanceTimersByTime(999)
            expect(getRecord(id)?.open).toBe(true)
            vi.advanceTimersByTime(1)
            expect(getRecord(id)?.open).toBe(false)
        })

        it('uses the default duration that is set when the toast is shown', () => {
            const id = show({ title: 'Saved' })
            configureStore({ duration: 10_000 })
            trackShown(id)
            vi.advanceTimersByTime(Defaults.DURATION_MS)
            expect(getRecord(id)?.open).toBe(true)
            vi.advanceTimersByTime(10_000 - Defaults.DURATION_MS)
            expect(getRecord(id)?.open).toBe(false)
        })

        it('stops the timer once no view shows the toast', () => {
            const id = show({ title: 'Saved', duration: 1000 })
            const first = trackShown(id)
            const second = trackShown(id)
            first()
            vi.advanceTimersByTime(1000)
            expect(getRecord(id)?.open).toBe(false)
            const other = show({ title: 'Other', duration: 1000 })
            trackShown(other)()
            vi.advanceTimersByTime(5000)
            expect(getRecord(other)?.open).toBe(true)
            second()
        })
    })

    describe('auto dismiss', () => {
        it('closes after the default duration', () => {
            const id = shown({ title: 'Saved' })
            vi.advanceTimersByTime(Defaults.DURATION_MS - 1)
            expect(getRecord(id)?.open).toBe(true)
            vi.advanceTimersByTime(1)
            expect(getRecord(id)?.open).toBe(false)
        })

        it('uses the configured default duration', () => {
            configureStore({ duration: 1000 })
            const id = shown({ title: 'Saved' })
            vi.advanceTimersByTime(1000)
            expect(getRecord(id)?.open).toBe(false)
        })

        it('uses an explicit duration over the default', () => {
            const id = shown({ title: 'Saved', duration: 200 })
            vi.advanceTimersByTime(200)
            expect(getRecord(id)?.open).toBe(false)
        })

        it('stays open when the duration is 0', () => {
            const id = shown({ title: 'Saved', duration: 0 })
            vi.advanceTimersByTime(60_000)
            expect(getRecord(id)?.open).toBe(true)
        })

        it('removes the toast after the exit window and fires onClose', () => {
            const onClose = vi.fn()
            const id = shown({ title: 'Saved', duration: 100, onClose })
            vi.advanceTimersByTime(100)
            expect(getRecord(id)).toBeDefined()
            vi.advanceTimersByTime(Defaults.EXIT_MS)
            expect(getRecord(id)).toBeUndefined()
            expect(onClose).toHaveBeenCalledWith(id)
        })
    })

    describe('resolveDuration', () => {
        it('falls back to the default', () => {
            expect(resolveDuration({}, 5000)).toBe(5000)
        })

        it('treats 0 and negatives as persistent', () => {
            expect(resolveDuration({ duration: 0 }, 5000)).toBe(Infinity)
            expect(resolveDuration({ duration: -1 }, 5000)).toBe(Infinity)
        })

        it('treats a fallback of 0 as persistent', () => {
            expect(resolveDuration({}, 0)).toBe(Infinity)
        })

        it('keeps loading toasts open', () => {
            expect(resolveDuration({ status: 'loading' }, 5000)).toBe(Infinity)
        })

        it('keeps toasts open while progress is unfinished or indeterminate', () => {
            expect(resolveDuration({ progress: 40 }, 5000)).toBe(Infinity)
            expect(resolveDuration({ progress: { value: null } }, 5000)).toBe(Infinity)
            expect(resolveDuration({ progress: 100 }, 5000)).toBe(5000)
        })

        it('lets an explicit duration win over loading and progress', () => {
            expect(resolveDuration({ status: 'loading', duration: 300 }, 5000)).toBe(300)
        })
    })

    describe('holdsOpen', () => {
        it('is true for loading, unfinished progress and a duration of 0', () => {
            expect(holdsOpen({ status: 'loading' })).toBe(true)
            expect(holdsOpen({ progress: 40 })).toBe(true)
            expect(holdsOpen({ progress: { value: null } })).toBe(true)
            expect(holdsOpen({ duration: 0 })).toBe(true)
        })

        it('is false for timed toasts, whatever the default duration', () => {
            configureStore({ duration: 0 })
            expect(holdsOpen({ title: 'Saved' })).toBe(false)
            expect(holdsOpen({ progress: 100 })).toBe(false)
            expect(holdsOpen({ status: 'loading', duration: 300 })).toBe(false)
        })
    })

    describe('update', () => {
        it('merges the patch into the toast', () => {
            const id = show({ title: 'Uploading', progress: 10 })
            update(id, { progress: 60 })
            expect(getRecord(id)?.input).toMatchObject({ title: 'Uploading', progress: 60 })
        })

        it('replaces the record so only this toast changes identity', () => {
            const first = show({ title: 'first', duration: 0 })
            const second = show({ title: 'second', duration: 0 })
            const before = getRecord(second)
            update(first, { title: 'changed' })
            expect(getRecord(second)).toBe(before)
        })

        it('ignores toasts that do not exist or are leaving', () => {
            update('missing', { title: 'x' })
            const id = show({ title: 'a' })
            dismiss(id)
            update(id, { title: 'b' })
            expect(getRecord(id)?.input.title).toBe('a')
        })

        it('keeps the timer running when the effective duration is unchanged', () => {
            const id = shown({ title: 'a', duration: 1000 })
            vi.advanceTimersByTime(600)
            update(id, { title: 'b' })
            vi.advanceTimersByTime(400)
            expect(getRecord(id)?.open).toBe(false)
        })

        it('restarts the timer when the patch sets a duration', () => {
            const id = shown({ title: 'a', duration: 1000 })
            vi.advanceTimersByTime(900)
            update(id, { duration: 1000 })
            vi.advanceTimersByTime(900)
            expect(getRecord(id)?.open).toBe(true)
            vi.advanceTimersByTime(100)
            expect(getRecord(id)?.open).toBe(false)
        })

        it('starts the timer when a loading toast stops being persistent', () => {
            const id = shown({ title: 'Saving', status: 'loading' })
            vi.advanceTimersByTime(60_000)
            expect(getRecord(id)?.open).toBe(true)
            update(id, { status: 'success', title: 'Saved' })
            vi.advanceTimersByTime(Defaults.DURATION_MS)
            expect(getRecord(id)?.open).toBe(false)
        })

        it('starts the timer when progress finishes', () => {
            const id = shown({ title: 'Uploading', progress: 50 })
            update(id, { progress: 100 })
            vi.advanceTimersByTime(Defaults.DURATION_MS)
            expect(getRecord(id)?.open).toBe(false)
        })
    })

    describe('dismiss', () => {
        it('fires onDismiss with the reason, once', () => {
            const onDismiss = vi.fn()
            const id = show({ title: 'a', duration: 0, onDismiss })
            dismiss(id, 'swipe')
            dismiss(id, 'manual')
            expect(onDismiss).toHaveBeenCalledTimes(1)
            expect(onDismiss).toHaveBeenCalledWith(id, 'swipe')
        })

        it('defaults the reason to manual', () => {
            const onDismiss = vi.fn()
            const id = show({ title: 'a', duration: 0, onDismiss })
            dismiss(id)
            expect(onDismiss).toHaveBeenCalledWith(id, 'manual')
        })

        it('reports timeouts as timeout', () => {
            const onDismiss = vi.fn()
            shown({ id: 'a', title: 'a', duration: 100, onDismiss })
            vi.advanceTimersByTime(100)
            expect(onDismiss).toHaveBeenCalledWith('a', 'timeout')
        })

        it('does nothing for an unknown id', () => {
            expect(() => dismiss('missing')).not.toThrow()
        })

        it('dismissAll closes every toast', () => {
            const a = show({ title: 'a', duration: 0 })
            const b = show({ title: 'b', duration: 0 })
            dismissAll()
            expect(getRecord(a)?.open).toBe(false)
            expect(getRecord(b)?.open).toBe(false)
        })
    })

    describe('timers', () => {
        it('pauses every timer and resumes with the time left', () => {
            const id = shown({ title: 'a', duration: 1000 })
            vi.advanceTimersByTime(400)
            pauseTimers('hover')
            vi.advanceTimersByTime(60_000)
            expect(getRecord(id)?.open).toBe(true)
            resumeTimers('hover')
            vi.advanceTimersByTime(599)
            expect(getRecord(id)?.open).toBe(true)
            vi.advanceTimersByTime(1)
            expect(getRecord(id)?.open).toBe(false)
        })

        it('stays paused until every hold is released', () => {
            const id = shown({ title: 'a', duration: 1000 })
            pauseTimers('hover')
            pauseTimers('hidden')
            resumeTimers('hover')
            vi.advanceTimersByTime(5000)
            expect(getRecord(id)?.open).toBe(true)
            resumeTimers('hidden')
            vi.advanceTimersByTime(1000)
            expect(getRecord(id)?.open).toBe(false)
        })

        it('does not start the timer of a toast opened while paused', () => {
            pauseTimers('hover')
            const id = shown({ title: 'a', duration: 1000 })
            vi.advanceTimersByTime(5000)
            expect(getRecord(id)?.open).toBe(true)
            resumeTimers('hover')
            vi.advanceTimersByTime(1000)
            expect(getRecord(id)?.open).toBe(false)
        })
    })

    describe('maxVisible', () => {
        it('replaces the oldest toast in the same position', () => {
            configureStore({ maxVisible: 2 })
            const onDismiss = vi.fn()
            const first = show({ title: 'first', onDismiss })
            show({ title: 'second' })
            show({ title: 'third' })
            expect(getRecord(first)?.open).toBe(false)
            expect(onDismiss).toHaveBeenCalledWith(first, 'replaced')
            expect(getSnapshot().filter((record) => record.open)).toHaveLength(2)
        })

        it('counts positions separately', () => {
            configureStore({ maxVisible: 1 })
            const a = show({ title: 'a', position: 'top-left' })
            const b = show({ title: 'b', position: 'bottom-right' })
            expect(getRecord(a)?.open).toBe(true)
            expect(getRecord(b)?.open).toBe(true)
        })

        it('counts a toast without a position in the configured default position', () => {
            configureStore({ maxVisible: 1, position: 'top-right' })
            const a = show({ title: 'a' })
            show({ title: 'b', position: 'top-right' })
            expect(getRecord(a)?.open).toBe(false)
        })

        it('never replaces a toast that holds itself open', () => {
            configureStore({ maxVisible: 2 })
            const loading = show({ title: 'Saving', status: 'loading' })
            const upload = show({ title: 'Uploading', progress: 10 })
            const pinned = show({ title: 'Pinned', duration: 0 })
            const timed = show({ title: 'Saved' })
            show({ title: 'Saved again' })
            expect(getRecord(loading)?.open).toBe(true)
            expect(getRecord(upload)?.open).toBe(true)
            expect(getRecord(pinned)?.open).toBe(true)
            expect(getRecord(timed)?.open).toBe(false)
        })

        it('replaces the oldest timed toast even when a persistent one is older', () => {
            configureStore({ maxVisible: 2 })
            const loading = show({ title: 'Saving', status: 'loading' })
            const timed = show({ title: 'Saved' })
            show({ title: 'Saved again' })
            expect(getRecord(loading)?.open).toBe(true)
            expect(getRecord(timed)?.open).toBe(false)
        })

        it('keeps replacing timed toasts when the default duration is 0', () => {
            configureStore({ maxVisible: 1, duration: 0 })
            const first = show({ title: 'first' })
            show({ title: 'second' })
            expect(getRecord(first)?.open).toBe(false)
        })

        it('replaces when a closing toast is reopened by its id', () => {
            configureStore({ maxVisible: 1 })
            const a = show({ id: 'a', title: 'a' })
            dismiss(a)
            const b = show({ title: 'b' })
            show({ id: 'a', title: 'a again' })
            expect(getRecord(b)?.open).toBe(false)
            expect(getRecord(a)?.open).toBe(true)
        })
    })

    describe('subscribe', () => {
        it('notifies listeners on every change and stops after unsubscribe', () => {
            const listener = vi.fn()
            const unsubscribe = subscribe(listener)
            const id = show({ title: 'a', duration: 0 })
            update(id, { title: 'b' })
            dismiss(id)
            expect(listener).toHaveBeenCalledTimes(3)
            unsubscribe()
            show({ title: 'c' })
            expect(listener).toHaveBeenCalledTimes(3)
        })

        it('returns a new snapshot array only when something changed', () => {
            show({ title: 'a', duration: 0 })
            const before = getSnapshot()
            expect(getSnapshot()).toBe(before)
            show({ title: 'b', duration: 0 })
            expect(getSnapshot()).not.toBe(before)
        })
    })

    describe('resetStore', () => {
        it('keeps subscribers and tells them the store is empty', () => {
            const listener = vi.fn()
            const unsubscribe = subscribe(listener)
            show({ title: 'a', duration: 0 })
            listener.mockClear()
            resetStore()
            expect(listener).toHaveBeenCalledTimes(1)
            expect(getSnapshot()).toHaveLength(0)
            show({ title: 'b', duration: 0 })
            expect(listener).toHaveBeenCalledTimes(2)
            unsubscribe()
        })
    })
})
