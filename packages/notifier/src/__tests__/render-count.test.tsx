/**
 * @fileoverview Commit counts for opening a notification and for resize callbacks.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, act, cleanup } from '@testing-library/react'
import * as React from 'react'
import { Notifier } from '../components/notification'
import { notify } from '../notify'
import { resetStore } from '../store'

const resizeCallbacks: ResizeObserverCallback[] = []
const measured = { width: 240, height: 44 }

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

function fireResize() {
    resizeCallbacks.forEach((callback) => callback([], new FakeResizeObserver(() => {})))
}

const originalResizeObserver = globalThis.ResizeObserver
const offsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth')
const offsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight')

function renderWithProfiler() {
    let commits = 0
    function onRender() {
        commits += 1
    }
    render(
        <React.Profiler id='notifier' onRender={onRender}>
            <Notifier
                position='bottom-right'
                radius='rounded'
                border={{ enabled: true }}
                theme={{ background: '#111' }}
            />
        </React.Profiler>
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
        measured.width = 240
        measured.height = 44
        globalThis.ResizeObserver = FakeResizeObserver as unknown as typeof ResizeObserver
        Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
            configurable: true,
            get: () => measured.width
        })
        Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
            configurable: true,
            get: () => measured.height
        })
    })

    afterEach(() => {
        cleanup()
        globalThis.ResizeObserver = originalResizeObserver
        if (offsetWidth) Object.defineProperty(HTMLElement.prototype, 'offsetWidth', offsetWidth)
        if (offsetHeight) Object.defineProperty(HTMLElement.prototype, 'offsetHeight', offsetHeight)
    })

    it('commits once when a notification opens', () => {
        const profiler = renderWithProfiler()
        profiler.reset()

        act(() => {
            notify('Saved', { action: { label: 'Undo', onClick: () => {} } })
        })

        expect(profiler.commits()).toBe(1)
    })

    it('does not commit when a resize callback reports an unchanged size', () => {
        const profiler = renderWithProfiler()

        act(() => {
            notify('Saved', { action: { label: 'Undo', onClick: () => {} } })
        })
        profiler.reset()

        act(() => {
            fireResize()
        })

        expect(profiler.commits()).toBe(0)
    })

    it('does not re-render a remaining notification when another is dismissed and removed', () => {
        const infoRenders: string[] = []
        const icons = {
            render: (props: { state: string }) => {
                if (props.state === 'info') infoRenders.push(props.state)
                return null
            }
        }
        render(<Notifier border={{ enabled: true }} icons={icons} />)

        let second = { dismiss: () => {} }
        act(() => {
            notify.info('Stays', { duration: 0 })
            second = notify.success('Goes', { duration: 0 })
        })
        infoRenders.length = 0

        act(() => {
            second.dismiss()
        })
        act(() => {
            vi.advanceTimersByTime(400)
        })

        expect(infoRenders).toHaveLength(0)
    })
})
