import { describe, it, expect, beforeEach, vi } from 'vitest'
import { notify } from '../notify'
import { getRecord, getSnapshot, resetStore } from '../store'
import { Defaults } from '../constants'
import { noop } from '../utils'

describe('notify', () => {
    beforeEach(() => {
        resetStore()
    })

    it('opens a toast from a title and returns its id', () => {
        const id = notify('Saved')
        expect(typeof id).toBe('string')
        expect(getRecord(id)?.input).toMatchObject({ title: 'Saved' })
    })

    it('merges extra input into a title toast', () => {
        const id = notify('Saved', { description: 'All good', tone: 'dark' })
        expect(getRecord(id)?.input).toMatchObject({
            title: 'Saved',
            description: 'All good',
            tone: 'dark'
        })
    })

    it('opens a toast from an input object', () => {
        const id = notify({ title: 'Hi', status: 'info', actions: [{ label: 'Undo' }] })
        expect(getRecord(id)?.input).toMatchObject({ title: 'Hi', status: 'info' })
    })

    it('updates the toast that owns the id', () => {
        notify({ id: 'x', title: 'one' })
        notify({ id: 'x', title: 'two' })
        expect(getSnapshot()).toHaveLength(1)
    })

    describe('status shortcuts', () => {
        it.each(['success', 'error', 'warning', 'info', 'loading'] as const)('%s', (status) => {
            const id = notify[status]('Title', { description: 'Body' })
            expect(getRecord(id)?.input).toMatchObject({
                status,
                title: 'Title',
                description: 'Body'
            })
        })
    })

    describe('update and dismiss', () => {
        it('updates by id', () => {
            const id = notify({ title: 'Uploading', progress: 10 })
            notify.update(id, { progress: 60 })
            expect(getRecord(id)?.input.progress).toBe(60)
        })

        it('dismisses by id', () => {
            const id = notify({ title: 'a', duration: 0 })
            const other = notify({ title: 'b', duration: 0 })
            notify.dismiss(id)
            expect(getRecord(id)?.open).toBe(false)
            expect(getRecord(other)?.open).toBe(true)
        })

        it('dismisses everything without an id', () => {
            const a = notify({ title: 'a', duration: 0 })
            const b = notify({ title: 'b', duration: 0 })
            notify.dismiss()
            expect(getRecord(a)?.open).toBe(false)
            expect(getRecord(b)?.open).toBe(false)
        })
    })

    describe('custom', () => {
        it('stores the render function', () => {
            const render = vi.fn(() => null)
            const id = notify.custom(render, { tone: 'dark', duration: 0 })
            expect(getRecord(id)?.render).toBe(render)
            expect(getRecord(id)?.input).toMatchObject({ tone: 'dark', duration: 0 })
        })
    })

    describe('promise', () => {
        it('shows a loading toast that stays until the promise settles', async () => {
            let resolve: (value: string) => void = noop
            const pending = new Promise<string>((done) => {
                resolve = done
            })
            const result = notify.promise(pending, {
                id: 'save',
                loading: 'Saving',
                success: 'Saved',
                error: 'Failed'
            })
            expect(getRecord('save')?.input).toMatchObject({ status: 'loading', title: 'Saving' })
            vi.advanceTimersByTime(60_000)
            expect(getRecord('save')?.open).toBe(true)
            resolve('ok')
            await expect(result).resolves.toBe('ok')
        })

        it('turns into a success toast and then expires', async () => {
            await notify.promise(Promise.resolve({ name: 'Ada' }), {
                id: 'save',
                loading: {
                    title: 'Saving',
                    description: 'Hold on',
                    actions: [{ label: 'Cancel' }]
                },
                success: (data) => ({ title: `Saved ${data.name}` }),
                error: 'Failed'
            })
            expect(getRecord('save')?.input).toMatchObject({
                status: 'success',
                title: 'Saved Ada'
            })
            expect(getRecord('save')?.input.description).toBeUndefined()
            expect(getRecord('save')?.input.actions).toBeUndefined()
            vi.advanceTimersByTime(Defaults.DURATION_MS)
            expect(getRecord('save')?.open).toBe(false)
        })

        it('turns into an error toast and rethrows', async () => {
            const failure = new Error('disk full')
            await expect(
                notify.promise(Promise.reject(failure), {
                    id: 'save',
                    loading: 'Saving',
                    success: 'Saved',
                    error: (error) => `Failed: ${error.message}`
                })
            ).rejects.toBe(failure)
            expect(getRecord('save')?.input).toMatchObject({
                status: 'error',
                title: 'Failed: disk full'
            })
        })

        it('wraps a non-error rejection in an Error', async () => {
            await expect(
                notify.promise(Promise.reject('nope'), {
                    loading: 'Saving',
                    success: 'Saved',
                    error: (error) => error.message
                })
            ).rejects.toThrow('nope')
        })
    })
})
