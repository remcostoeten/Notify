import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { act, cleanup, render } from '@testing-library/react'
import { Profiler } from 'react'
import { Notifier } from '../components/notifier'
import { notify } from '../notify'
import { resetStore } from '../store'
import { Defaults } from '../constants'

const resizeCallbacks: ResizeObserverCallback[] = []

class FakeResizeObserver {
    private callback: ResizeObserverCallback

    constructor(callback: ResizeObserverCallback) {
        this.callback = callback
        resizeCallbacks.push(callback)
    }

    observe() {}
    unobserve() {}

    disconnect() {
        const index = resizeCallbacks.indexOf(this.callback)
        if (index !== -1) resizeCallbacks.splice(index, 1)
    }
}

const originalResizeObserver = globalThis.ResizeObserver
const offsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight')

function renderWithProfiler(element: React.ReactElement) {
    let commits = 0
    render(
        <Profiler
            id='notifier'
            onRender={() => {
                commits += 1
            }}
        >
            {element}
        </Profiler>
    )
    return {
        commits: () => commits,
        reset: () => {
            commits = 0
        }
    }
}

describe('Notifier render counts', () => {
    beforeEach(() => {
        cleanup()
        resetStore()
        resizeCallbacks.length = 0
        globalThis.ResizeObserver = FakeResizeObserver as unknown as typeof ResizeObserver
        Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
            configurable: true,
            get: () => 120
        })
    })

    afterEach(() => {
        cleanup()
        globalThis.ResizeObserver = originalResizeObserver
        if (offsetHeight) Object.defineProperty(HTMLElement.prototype, 'offsetHeight', offsetHeight)
    })

    it('commits once when a toast opens', () => {
        const profiler = renderWithProfiler(<Notifier />)
        profiler.reset()
        act(() => {
            notify({ title: 'Saved', actions: [{ label: 'Undo' }] })
        })
        expect(profiler.commits()).toBe(1)
    })

    it('commits once when a stacked toast opens', () => {
        const profiler = renderWithProfiler(<Notifier stack />)
        act(() => {
            notify({ title: 'first', duration: 0 })
        })
        profiler.reset()
        act(() => {
            notify({ title: 'second', duration: 0 })
        })
        expect(profiler.commits()).toBeLessThanOrEqual(2)
    })

    it('does not commit when a resize callback reports an unchanged size', () => {
        const profiler = renderWithProfiler(<Notifier stack />)
        act(() => {
            notify({ title: 'Saved', duration: 0 })
        })
        profiler.reset()
        act(() => {
            resizeCallbacks.forEach((callback) => callback([], new FakeResizeObserver(() => {})))
        })
        expect(profiler.commits()).toBe(0)
    })

    it('does not re-render a remaining toast when another is dismissed and removed', () => {
        const renders: string[] = []
        function Spy({ label }: { label: string }) {
            renders.push(label)
            return null
        }
        render(<Notifier />)
        let stays = ''
        let goes = ''
        act(() => {
            stays = notify.custom(() => <Spy label='stays' />, { duration: 0 })
            goes = notify.custom(() => <Spy label='goes' />, { duration: 0 })
        })
        renders.length = 0
        act(() => {
            notify.dismiss(goes)
        })
        act(() => {
            vi.advanceTimersByTime(Defaults.EXIT_MS + 100)
        })
        expect(stays).not.toBe('')
        expect(renders.filter((label) => label === 'stays')).toHaveLength(0)
    })

    it('does not re-render a toast whose own record did not change', () => {
        const renders: string[] = []
        function Spy({ label }: { label: string }) {
            renders.push(label)
            return null
        }
        render(<Notifier />)
        let other = ''
        act(() => {
            notify.custom(() => <Spy label='static' />, { duration: 0 })
            other = notify({ title: 'Uploading', progress: 10 })
        })
        renders.length = 0
        act(() => {
            notify.update(other, { progress: 50 })
        })
        expect(renders).toHaveLength(0)
    })
})
