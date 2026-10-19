import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { Notifier } from '../components/notifier'
import { Toast } from '../components/toast'
import { useToast } from '../components/context'
import { notify } from '../notify'
import { getRecord, resetStore } from '../store'
import { Defaults } from '../constants'

describe('Notifier', () => {
    beforeEach(() => {
        cleanup()
        resetStore()
    })

    afterEach(() => {
        cleanup()
    })

    it('renders only its stylesheet and an empty live region while there are no toasts', () => {
        const { container } = render(<Notifier />)
        expect(container.querySelector('.ntf-toast')).toBeNull()
        expect(container.querySelector('style[data-ntf]')).not.toBeNull()
        expect(container.querySelectorAll('[role=region]')).toHaveLength(1)
    })

    it('keeps the live region mounted when the last toast leaves', () => {
        const { container } = render(<Notifier />)
        let id = ''
        act(() => {
            id = notify({ title: 'a', duration: 0 })
        })
        const region = container.querySelector('[role=region]')
        act(() => {
            notify.dismiss(id)
            vi.advanceTimersByTime(Defaults.EXIT_MS)
        })
        expect(container.querySelector('[role=region]')).toBe(region)
    })

    it('renders a toast opened with notify', () => {
        const { container } = render(<Notifier />)
        act(() => {
            notify({ title: 'Saved', description: 'All good' })
        })
        expect(container.querySelectorAll('.ntf-toast')).toHaveLength(1)
        expect(container.querySelector('.ntf-title')?.textContent).toBe('Saved')
    })

    it('supplies one stylesheet for every toast', () => {
        const { container } = render(<Notifier />)
        act(() => {
            notify('one')
            notify('two')
        })
        expect(container.querySelectorAll('style[data-ntf]')).toHaveLength(1)
    })

    it('announces toasts in a polite live region', () => {
        const { container } = render(<Notifier />)
        act(() => {
            notify('Saved')
        })
        const region = container.querySelector('[role=region]')
        expect(region?.getAttribute('aria-live')).toBe('polite')
        expect(region?.getAttribute('aria-label')).toBe('Notifications')
    })

    it('marks error and warning toasts as alerts', () => {
        const { container } = render(<Notifier />)
        act(() => {
            notify.error('Failed')
            notify.info('FYI')
        })
        expect(container.querySelectorAll('[role=alert]')).toHaveLength(1)
    })

    it('groups toasts by position', () => {
        const { container } = render(<Notifier />)
        act(() => {
            notify({ title: 'a', position: 'top-left', duration: 0 })
            notify({ title: 'b', position: 'bottom-right', duration: 0 })
            notify({ title: 'c', position: 'bottom-right', duration: 0 })
        })
        const regions = container.querySelectorAll('[role=region]')
        expect(regions).toHaveLength(2)
        expect(
            Array.from(regions)
                .map((region) => region.querySelectorAll('.ntf-toast').length)
                .sort()
        ).toEqual([1, 2])
    })

    it('anchors a group to its corner', () => {
        const { container } = render(<Notifier offset={{ x: 10, y: 20 }} />)
        act(() => {
            notify({ title: 'a', position: 'top-left', duration: 0 })
        })
        const style = (container.querySelector('[role=region]') as HTMLElement).style
        expect(style.position).toBe('fixed')
        expect(style.top).toBe('20px')
        expect(style.left).toBe('10px')
    })

    it('uses the position prop for toasts without one', () => {
        const { container } = render(<Notifier position='top-center' />)
        act(() => {
            notify({ title: 'a', duration: 0 })
        })
        expect((container.querySelector('[role=region]') as HTMLElement).style.top).toBe('24px')
    })

    it('applies the tone prop, and a toast can override it', () => {
        const { container } = render(<Notifier tone='dark' />)
        act(() => {
            notify({ title: 'a', duration: 0 })
            notify({ title: 'b', tone: 'light', duration: 0 })
        })
        const tones = Array.from(container.querySelectorAll('.ntf-toast')).map((node) =>
            node.getAttribute('data-tone')
        )
        expect(tones).toEqual(['dark', 'light'])
    })

    it('follows the system scheme for tone auto', () => {
        const { container } = render(<Notifier tone='auto' />)
        act(() => {
            notify({ title: 'a', duration: 0 })
        })
        expect(container.querySelector('.ntf-toast')?.getAttribute('data-tone')).toBe('dark')
    })

    it('hides the close button for every toast when close is false', () => {
        const { container } = render(<Notifier close={false} />)
        act(() => {
            notify({ title: 'a', duration: 0 })
            notify({ title: 'b', close: true, duration: 0 })
        })
        expect(container.querySelectorAll('.ntf-close')).toHaveLength(1)
    })

    it('passes theme tokens to the toast stylesheet as custom properties', () => {
        const { container } = render(
            <Notifier theme={{ dark: { background: '#000' }, radius: 20 }} />
        )
        act(() => {
            notify({ title: 'a', duration: 0 })
        })
        const style = (container.querySelector('[role=region]') as HTMLElement).style
        expect(style.getPropertyValue('--ntf-dark-background')).toBe('#000')
        expect(style.getPropertyValue('--ntf-radius')).toBe('20px')
    })

    it('sets the nonce on the stylesheet', () => {
        const { container } = render(<Notifier nonce='abc' />)
        expect(container.querySelector('style[data-ntf]')?.getAttribute('nonce')).toBe('abc')
    })

    it('hands the configured defaults to the store', () => {
        render(<Notifier duration={1500} maxVisible={1} position='top-right' />)
        let first = ''
        let second = ''
        act(() => {
            first = notify({ title: 'a' })
            notify({ title: 'b' })
        })
        expect(getRecord(first)?.open).toBe(false)
        act(() => {
            second = notify({ title: 'c' })
        })
        act(() => {
            vi.advanceTimersByTime(1500)
        })
        expect(getRecord(second)?.open).toBe(false)
    })

    it('removes a toast from the page once its exit window has passed', () => {
        const { container } = render(<Notifier />)
        let id = ''
        act(() => {
            id = notify({ title: 'a', duration: 0 })
        })
        act(() => {
            notify.dismiss(id)
        })
        expect(container.querySelectorAll('.ntf-toast')).toHaveLength(1)
        act(() => {
            vi.advanceTimersByTime(Defaults.EXIT_MS)
        })
        expect(container.querySelectorAll('.ntf-toast')).toHaveLength(0)
    })

    it('dismisses from the close button and from an action', () => {
        const { container, getByLabelText } = render(<Notifier />)
        let id = ''
        act(() => {
            id = notify({ title: 'a', duration: 0, actions: [{ label: 'Undo' }] })
        })
        fireEvent.click(container.querySelector('.ntf-action') as HTMLElement)
        expect(getRecord(id)?.open).toBe(false)

        act(() => {
            vi.advanceTimersByTime(Defaults.EXIT_MS)
        })
        act(() => {
            id = notify({ title: 'b', duration: 0 })
        })
        fireEvent.click(getByLabelText('Close'))
        expect(getRecord(id)?.open).toBe(false)
    })

    it('pauses timers while the pointer is over a toast', () => {
        const { container } = render(<Notifier />)
        let id = ''
        act(() => {
            id = notify({ title: 'a', duration: 1000 })
        })
        const item = container.querySelector('.ntf-toast')?.parentElement as HTMLElement
        act(() => {
            vi.advanceTimersByTime(500)
            fireEvent.pointerEnter(item)
            vi.advanceTimersByTime(10_000)
        })
        expect(getRecord(id)?.open).toBe(true)
        act(() => {
            fireEvent.pointerLeave(item)
            vi.advanceTimersByTime(500)
        })
        expect(getRecord(id)?.open).toBe(false)
    })

    it('releases the hover hold when the hovered toast is dismissed', () => {
        const { container } = render(<Notifier />)
        let hovered = ''
        let other = ''
        act(() => {
            hovered = notify({ title: 'a', duration: 0 })
            other = notify({ title: 'b', duration: 1000 })
        })
        const item = container.querySelector('.ntf-toast')?.parentElement as HTMLElement
        act(() => {
            fireEvent.pointerEnter(item)
            notify.dismiss(hovered)
        })
        act(() => {
            vi.advanceTimersByTime(1000)
        })
        expect(getRecord(other)?.open).toBe(false)
    })

    it('releases the hover hold when the Notifier unmounts', () => {
        const { container, unmount } = render(<Notifier />)
        act(() => {
            notify({ title: 'a', duration: 0 })
        })
        act(() => {
            fireEvent.pointerEnter(
                container.querySelector('.ntf-toast')?.parentElement as HTMLElement
            )
        })
        unmount()
        const later = notify({ title: 'b', duration: 1000 })
        vi.advanceTimersByTime(1000)
        expect(getRecord(later)?.open).toBe(false)
    })

    it('releases the hover hold of a stack once its toasts are gone', () => {
        const { container } = render(<Notifier stack />)
        let id = ''
        act(() => {
            id = notify({ title: 'a', duration: 0 })
        })
        act(() => {
            fireEvent.pointerEnter(
                container.querySelector('.ntf-toast')?.parentElement?.parentElement as HTMLElement
            )
        })
        act(() => {
            notify.dismiss(id)
        })
        act(() => {
            vi.advanceTimersByTime(Defaults.EXIT_MS)
        })
        let later = ''
        act(() => {
            later = notify({ title: 'b', duration: 1000 })
        })
        act(() => {
            vi.advanceTimersByTime(1000)
        })
        expect(getRecord(later)?.open).toBe(false)
    })

    describe('keyboard access', () => {
        function pressHotkey(overrides: Partial<KeyboardEventInit> = {}) {
            fireEvent.keyDown(document.body, { code: 'KeyT', altKey: true, ...overrides })
        }

        it('makes every toast focusable and identifies it', () => {
            const { container } = render(<Notifier />)
            let id = ''
            act(() => {
                id = notify({ title: 'a', duration: 0 })
            })
            const item = container.querySelector<HTMLElement>('.ntf-item')
            expect(item?.getAttribute('tabindex')).toBe('-1')
            expect(item?.dataset.ntfId).toBe(id)
        })

        it('moves focus to the newest toast with the hotkey', () => {
            const { container } = render(<Notifier />)
            act(() => {
                notify({ title: 'first', duration: 0 })
                notify({ title: 'second', duration: 0 })
            })
            pressHotkey()
            const focused = document.activeElement as HTMLElement
            expect(focused.classList.contains('ntf-item')).toBe(true)
            expect(focused.querySelector('.ntf-title')?.textContent).toBe('second')
            expect(container.contains(focused)).toBe(true)
        })

        it('does nothing without open toasts', () => {
            render(<Notifier />)
            const before = document.activeElement
            pressHotkey()
            expect(document.activeElement).toBe(before)
        })

        it('uses a custom hotkey and can be turned off', () => {
            const { rerender } = render(<Notifier hotkey='ctrl+shift+n' />)
            act(() => {
                notify({ title: 'a', duration: 0 })
            })
            pressHotkey()
            expect((document.activeElement as HTMLElement).classList.contains('ntf-item')).toBe(
                false
            )
            pressHotkey({ code: 'KeyN', altKey: false, ctrlKey: true, shiftKey: true })
            expect((document.activeElement as HTMLElement).classList.contains('ntf-item')).toBe(
                true
            )

            ;(document.activeElement as HTMLElement).blur()
            rerender(<Notifier hotkey={false} />)
            pressHotkey()
            expect((document.activeElement as HTMLElement).classList.contains('ntf-item')).toBe(
                false
            )
        })

        it('lets Tab reach the actions of the focused toast', () => {
            const { container } = render(<Notifier />)
            act(() => {
                notify({ title: 'a', duration: 0, actions: [{ label: 'Undo' }] })
            })
            pressHotkey()
            const action = container.querySelector<HTMLElement>('.ntf-action')
            expect(action?.tabIndex).toBe(0)
        })

        it('dismisses the focused toast with Escape and returns focus', () => {
            const { getByText } = render(
                <>
                    <button type='button'>trigger</button>
                    <Notifier />
                </>
            )
            const trigger = getByText('trigger')
            trigger.focus()
            let id = ''
            act(() => {
                id = notify({ title: 'a', duration: 0 })
            })
            pressHotkey()
            expect(document.activeElement).not.toBe(trigger)
            act(() => {
                fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'Escape' })
            })
            expect(getRecord(id)?.open).toBe(false)
            expect(document.activeElement).toBe(trigger)
        })

        it('returns focus when the focused toast is dismissed by an action', () => {
            const { getByText } = render(
                <>
                    <button type='button'>trigger</button>
                    <Notifier />
                </>
            )
            const trigger = getByText('trigger')
            trigger.focus()
            act(() => {
                notify({ title: 'a', duration: 0, actions: [{ label: 'Undo' }] })
            })
            pressHotkey()
            const action = getByText('Undo')
            act(() => {
                action.focus()
            })
            act(() => {
                fireEvent.click(action)
            })
            expect(document.activeElement).toBe(trigger)
        })

        it('holds the timer while focus is inside a toast and resumes on blur', () => {
            const { container } = render(<Notifier />)
            let id = ''
            act(() => {
                id = notify({ title: 'a', duration: 1000, actions: [{ label: 'Undo' }] })
            })
            const item = container.querySelector<HTMLElement>('.ntf-item') as HTMLElement
            const action = container.querySelector<HTMLElement>('.ntf-action') as HTMLElement
            act(() => {
                vi.advanceTimersByTime(500)
                item.focus()
                action.focus()
                vi.advanceTimersByTime(10_000)
            })
            expect(getRecord(id)?.open).toBe(true)
            act(() => {
                action.blur()
                vi.advanceTimersByTime(500)
            })
            expect(getRecord(id)?.open).toBe(false)
        })

        it('releases the focus hold when the focused toast is removed', () => {
            const { container } = render(<Notifier />)
            let focusedId = ''
            let otherId = ''
            act(() => {
                focusedId = notify({ title: 'a', duration: 0 })
                otherId = notify({ title: 'b', duration: 1000 })
            })
            act(() => {
                container.querySelector<HTMLElement>('.ntf-item')?.focus()
            })
            act(() => {
                notify.dismiss(focusedId)
            })
            act(() => {
                vi.advanceTimersByTime(1000)
            })
            expect(getRecord(otherId)?.open).toBe(false)
        })
    })

    it('updates a rendered toast in place', () => {
        const { container } = render(<Notifier />)
        let id = ''
        act(() => {
            id = notify({ title: 'Uploading', progress: 10 })
        })
        act(() => {
            notify.update(id, { progress: 60 })
        })
        expect(container.querySelector('.ntf-label')?.textContent).toBe('60%')
        expect(container.querySelectorAll('.ntf-toast')).toHaveLength(1)
    })

    it('renders a custom toast and gives it the runtime', () => {
        function Probe() {
            const toast = useToast()
            return (
                <button type='button' data-testid='probe' onClick={() => toast.dismiss('manual')}>
                    {toast.id.length > 0 ? 'has id' : 'no id'}
                </button>
            )
        }
        const { getByTestId } = render(<Notifier tone='dark' />)
        let id = ''
        act(() => {
            id = notify.custom(
                (toast) => (
                    <Toast>
                        <Toast.Body>
                            <Probe />
                            <Toast.Title>{toast.tone}</Toast.Title>
                        </Toast.Body>
                    </Toast>
                ),
                { duration: 0 }
            )
        })
        expect(getByTestId('probe').textContent).toBe('has id')
        fireEvent.click(getByTestId('probe'))
        expect(getRecord(id)?.open).toBe(false)
    })

    it('warns when a second Notifier is mounted', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        render(
            <>
                <Notifier />
                <Notifier />
            </>
        )
        expect(warn).toHaveBeenCalledTimes(1)
        warn.mockRestore()
    })

    it('renders collapsed stacks', () => {
        const { container } = render(<Notifier stack />)
        act(() => {
            notify({ title: 'a', duration: 0 })
            notify({ title: 'b', duration: 0 })
        })
        expect(container.querySelectorAll('.ntf-toast')).toHaveLength(2)
    })
})
