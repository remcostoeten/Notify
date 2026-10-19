import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
    configureStore,
    dismiss,
    dismissAll,
    getRecord,
    getSnapshot,
    pauseTimers,
    resetStore,
    resolveDuration,
    resumeTimers,
    show,
    showCustom,
    subscribe,
    update
} from '../store'
import { Defaults } from '../constants'

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

        it('updates in place when the id already exists', () => {
            show({ id: 'upload', title: 'Uploading', description: 'one' })
            show({ id: 'upload', title: 'Uploaded' })
            expect(getSnapshot()).toHaveLength(1)
            expect(getRecord('upload')?.input).toMatchObject({
                title: 'Uploaded',
                description: 'one'
            })
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

    describe('auto dismiss', () => {
        it('closes after the default duration', () => {
            const id = show({ title: 'Saved' })
            vi.advanceTimersByTime(Defaults.DURATION_MS - 1)
            expect(getRecord(id)?.open).toBe(true)
            vi.advanceTimersByTime(1)
            expect(getRecord(id)?.open).toBe(false)
        })

        it('uses the configured default duration', () => {
            configureStore({ duration: 1000 })
            const id = show({ title: 'Saved' })
            vi.advanceTimersByTime(1000)
            expect(getRecord(id)?.open).toBe(false)
        })

        it('uses an explicit duration over the default', () => {
            const id = show({ title: 'Saved', duration: 200 })
            vi.advanceTimersByTime(200)
            expect(getRecord(id)?.open).toBe(false)
        })

        it('stays open when the duration is 0', () => {
            const id = show({ title: 'Saved', duration: 0 })
            vi.advanceTimersByTime(60_000)
            expect(getRecord(id)?.open).toBe(true)
        })

        it('removes the toast after the exit window and fires onClose', () => {
            const onClose = vi.fn()
            const id = show({ title: 'Saved', duration: 100, onClose })
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
            const id = show({ title: 'a', duration: 1000 })
            vi.advanceTimersByTime(600)
            update(id, { title: 'b' })
            vi.advanceTimersByTime(400)
            expect(getRecord(id)?.open).toBe(false)
        })

        it('restarts the timer when the patch sets a duration', () => {
            const id = show({ title: 'a', duration: 1000 })
            vi.advanceTimersByTime(900)
            update(id, { duration: 1000 })
            vi.advanceTimersByTime(900)
            expect(getRecord(id)?.open).toBe(true)
            vi.advanceTimersByTime(100)
            expect(getRecord(id)?.open).toBe(false)
        })

        it('starts the timer when a loading toast stops being persistent', () => {
            const id = show({ title: 'Saving', status: 'loading' })
            vi.advanceTimersByTime(60_000)
            expect(getRecord(id)?.open).toBe(true)
            update(id, { status: 'success', title: 'Saved' })
            vi.advanceTimersByTime(Defaults.DURATION_MS)
            expect(getRecord(id)?.open).toBe(false)
        })

        it('starts the timer when progress finishes', () => {
            const id = show({ title: 'Uploading', progress: 50 })
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
            show({ id: 'a', title: 'a', duration: 100, onDismiss })
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
            const id = show({ title: 'a', duration: 1000 })
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
            const id = show({ title: 'a', duration: 1000 })
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
            const id = show({ title: 'a', duration: 1000 })
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
            const first = show({ title: 'first', duration: 0, onDismiss })
            show({ title: 'second', duration: 0 })
            show({ title: 'third', duration: 0 })
            expect(getRecord(first)?.open).toBe(false)
            expect(onDismiss).toHaveBeenCalledWith(first, 'replaced')
            expect(getSnapshot().filter((record) => record.open)).toHaveLength(2)
        })

        it('counts positions separately', () => {
            configureStore({ maxVisible: 1 })
            const a = show({ title: 'a', duration: 0, position: 'top-left' })
            const b = show({ title: 'b', duration: 0, position: 'bottom-right' })
            expect(getRecord(a)?.open).toBe(true)
            expect(getRecord(b)?.open).toBe(true)
        })

        it('counts a toast without a position in the configured default position', () => {
            configureStore({ maxVisible: 1, position: 'top-right' })
            const a = show({ title: 'a', duration: 0 })
            show({ title: 'b', duration: 0, position: 'top-right' })
            expect(getRecord(a)?.open).toBe(false)
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
})
