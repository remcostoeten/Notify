import { describe, it, expect, afterEach, vi } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/react'
import { Toast } from '../components/toast'
import { CloseLabelContext, RuntimeContext } from '../components/context'
import type { ToastRuntime } from '../types'

afterEach(() => {
    cleanup()
})

function runtime(overrides: Partial<ToastRuntime> = {}): ToastRuntime {
    return { id: 'toast-1', tone: 'dark', dismiss: vi.fn(), update: vi.fn(), ...overrides }
}

describe('Toast from content', () => {
    it('renders title, meta and description', () => {
        const { container } = render(
            <Toast title='Sienna Hewitt' meta='2 mins ago' description='Notes are ready' />
        )
        expect(container.querySelector('.ntf-title')?.textContent).toBe('Sienna Hewitt')
        expect(container.querySelector('.ntf-meta')?.textContent).toBe('2 mins ago')
        expect(container.querySelector('.ntf-divider')).not.toBeNull()
        expect(container.querySelector('.ntf-description')?.textContent).toBe('Notes are ready')
    })

    it('leaves out the divider and meta without a meta', () => {
        const { container } = render(<Toast title='Saved' />)
        expect(container.querySelector('.ntf-divider')).toBeNull()
        expect(container.querySelector('.ntf-meta')).toBeNull()
    })

    it('marks a toast with only a title as compact so its content centers', () => {
        const { container, rerender } = render(<Toast status='success' title='Saved' />)
        function root() {
            return container.querySelector('.ntf-toast')
        }
        expect(root()?.hasAttribute('data-compact')).toBe(true)
        rerender(<Toast status='success' title='Saved' description='All good' />)
        expect(root()?.hasAttribute('data-compact')).toBe(false)
        rerender(<Toast title='Saving' progress={40} />)
        expect(root()?.hasAttribute('data-compact')).toBe(false)
        rerender(<Toast title='Saved' actions={[{ label: 'Undo' }]} />)
        expect(root()?.hasAttribute('data-compact')).toBe(false)
    })

    it('shows a close button by default and hides it on request', () => {
        const { container, rerender } = render(<Toast title='Saved' />)
        expect(container.querySelector('.ntf-close')).not.toBeNull()
        rerender(<Toast title='Saved' close={false} />)
        expect(container.querySelector('.ntf-close')).toBeNull()
    })

    it('uses the tone from the prop, falling back to the runtime tone', () => {
        const { container, rerender } = render(<Toast title='a' tone='light' />)
        expect(container.querySelector('.ntf-toast')?.getAttribute('data-tone')).toBe('light')
        rerender(
            <RuntimeContext.Provider value={runtime({ tone: 'dark' })}>
                <Toast title='a' />
            </RuntimeContext.Provider>
        )
        expect(container.querySelector('.ntf-toast')?.getAttribute('data-tone')).toBe('dark')
    })

    it('sets a custom width as a custom property', () => {
        const { container } = render(<Toast title='a' width={480} />)
        expect(
            container
                .querySelector<HTMLElement>('.ntf-toast')
                ?.style.getPropertyValue('--ntf-width')
        ).toBe('480px')
    })

    it('adds class names per slot', () => {
        const { container } = render(
            <Toast
                title='a'
                description='b'
                className='mine'
                classNames={{
                    root: 'root',
                    title: 'title-x',
                    description: 'desc-x',
                    close: 'close-x'
                }}
            />
        )
        expect(container.querySelector('.ntf-toast')?.className).toBe('ntf-toast root mine')
        expect(container.querySelector('.ntf-title')?.className).toContain('title-x')
        expect(container.querySelector('.ntf-description')?.className).toContain('desc-x')
        expect(container.querySelector('.ntf-close')?.className).toContain('close-x')
    })

    it('adds the stylesheet to the head when no Notifier supplies one', () => {
        render(<Toast title='a' />)
        expect(document.head.querySelector('style[data-ntf]')?.textContent).toContain('.ntf-toast')
    })

    it('adds one stylesheet however many standalone toasts render', () => {
        const { container } = render(
            <>
                <Toast title='a' />
                <Toast title='b' />
                <Toast title='c' />
            </>
        )
        expect(container.querySelectorAll('style')).toHaveLength(0)
        expect(document.querySelectorAll('style[data-ntf]')).toHaveLength(1)
    })
})

describe('icons', () => {
    it('derives a circle icon from the status', () => {
        const { container } = render(<Toast status='success' title='a' />)
        const icon = container.querySelector('.ntf-icon')
        expect(icon?.getAttribute('data-shape')).toBe('circle')
        expect(icon?.getAttribute('data-status')).toBe('success')
        expect(icon?.querySelector('svg')).not.toBeNull()
    })

    it('draws a plain mark in a circle and the full glyph in a ring', () => {
        const circle = render(<Toast status='success' title='a' />)
        expect(circle.container.querySelector('.ntf-icon svg circle')).toBeNull()
        cleanup()
        const ring = render(<Toast icon={{ shape: 'ring', status: 'success' }} title='a' />)
        expect(ring.container.querySelector('.ntf-icon svg circle')).not.toBeNull()
    })

    it('keeps the same icon size when a loading toast turns into a success toast', () => {
        const { container, rerender } = render(<Toast status='loading' title='a' />)
        const loading = container.querySelector('.ntf-icon')?.getAttribute('data-shape')
        rerender(<Toast status='success' title='a' />)
        expect(container.querySelector('.ntf-icon')?.getAttribute('data-shape')).toBe(loading)
    })

    it('shows a spinner for loading', () => {
        const { container } = render(<Toast status='loading' title='a' />)
        expect(container.querySelector('.ntf-icon .ntf-spin')).not.toBeNull()
    })

    it('puts an element icon in a box', () => {
        const { container } = render(<Toast icon={<i data-testid='glyph' />} title='a' />)
        expect(container.querySelector('.ntf-icon')?.getAttribute('data-shape')).toBe('box')
        expect(container.querySelector('[data-testid=glyph]')).not.toBeNull()
    })

    it('honours the shape and status of an icon config', () => {
        const { container } = render(
            <Toast icon={{ shape: 'circle', status: 'warning' }} title='a' />
        )
        const icon = container.querySelector('.ntf-icon')
        expect(icon?.getAttribute('data-shape')).toBe('circle')
        expect(icon?.getAttribute('data-status')).toBe('warning')
    })

    it('inherits the toast status when the icon config has none', () => {
        const { container } = render(<Toast status='error' icon={{ shape: 'box' }} title='a' />)
        expect(container.querySelector('.ntf-icon')?.getAttribute('data-status')).toBe('error')
    })

    it('renders nothing for the icon without a status or icon', () => {
        const { container } = render(<Toast title='a' />)
        expect(container.querySelector('.ntf-icon')).toBeNull()
    })
})

describe('avatar', () => {
    it('renders the image with a badge', () => {
        const { container } = render(
            <Toast avatar={{ src: '/a.png', alt: 'Sienna', badge: 'online' }} title='a' />
        )
        expect(container.querySelector('.ntf-avatar img')?.getAttribute('src')).toBe('/a.png')
        expect(container.querySelector('.ntf-badge')?.getAttribute('data-badge')).toBe('online')
    })

    it('falls back to the fallback node without a source', () => {
        const { container } = render(<Toast avatar={{ fallback: 'SH' }} title='a' />)
        expect(container.querySelector('.ntf-avatar img')).toBeNull()
        expect(container.querySelector('.ntf-avatar-fallback')?.textContent).toBe('SH')
    })

    it('wins over an icon', () => {
        const { container } = render(
            <Toast avatar={{ fallback: 'SH' }} status='success' title='a' />
        )
        expect(container.querySelector('.ntf-avatar')).not.toBeNull()
        expect(container.querySelector('.ntf-icon')).toBeNull()
    })
})

describe('progress', () => {
    it('renders a determinate bar and a percentage label for a number', () => {
        const { container } = render(<Toast progress={60} title='a' />)
        const track = container.querySelector('.ntf-track')
        expect(track?.getAttribute('role')).toBe('progressbar')
        expect(track?.getAttribute('aria-valuenow')).toBe('60')
        expect(
            container
                .querySelector<HTMLElement>('.ntf-fill')
                ?.style.getPropertyValue('--ntf-progress')
        ).toBe('60%')
        expect(container.querySelector('.ntf-label')?.textContent).toBe('60%')
    })

    it('clamps the value', () => {
        const { container } = render(<Toast progress={140} title='a' />)
        expect(container.querySelector('.ntf-track')?.getAttribute('aria-valuenow')).toBe('100')
        expect(container.querySelector('.ntf-label')?.textContent).toBe('100%')
    })

    it('hides the label when asked', () => {
        const { container } = render(<Toast progress={{ value: 30, label: false }} title='a' />)
        expect(container.querySelector('.ntf-label')).toBeNull()
    })

    it('renders a custom label', () => {
        const { container } = render(<Toast progress={{ value: 30, label: '3 of 10' }} title='a' />)
        expect(container.querySelector('.ntf-label')?.textContent).toBe('3 of 10')
    })

    it('marks a null value as indeterminate', () => {
        const { container } = render(<Toast progress={{ value: null, label: true }} title='a' />)
        const track = container.querySelector('.ntf-track')
        expect(track?.hasAttribute('data-indeterminate')).toBe(true)
        expect(track?.hasAttribute('aria-valuenow')).toBe(false)
        expect(container.querySelector('.ntf-label')).toBeNull()
    })
})

describe('actions', () => {
    it('renders each action with its variant and color', () => {
        const { container } = render(
            <Toast
                title='a'
                actions={[
                    { label: 'Dismiss', variant: 'outline' },
                    { label: 'Reply', variant: 'filled', color: 'accent' },
                    { label: 'More' }
                ]}
            />
        )
        const buttons = Array.from(container.querySelectorAll('.ntf-action'))
        expect(buttons.map((button) => button.textContent)).toEqual(['Dismiss', 'Reply', 'More'])
        expect(buttons.map((button) => button.getAttribute('data-variant'))).toEqual([
            'outline',
            'filled',
            'text'
        ])
        expect(buttons.map((button) => button.getAttribute('data-color'))).toEqual([
            'default',
            'accent',
            'default'
        ])
    })

    it('calls onClick with the toast handle, then dismisses', () => {
        const toast = runtime()
        const onClick = vi.fn()
        const { container } = render(
            <RuntimeContext.Provider value={toast}>
                <Toast title='a' actions={[{ label: 'Undo', onClick }]} />
            </RuntimeContext.Provider>
        )
        fireEvent.click(container.querySelector('.ntf-action') as HTMLElement)
        expect(onClick).toHaveBeenCalledWith(toast)
        expect(toast.dismiss).toHaveBeenCalledWith('action')
    })

    it('keeps the toast open when dismiss is false', () => {
        const toast = runtime()
        const { container } = render(
            <RuntimeContext.Provider value={toast}>
                <Toast title='a' actions={[{ label: 'Retry', dismiss: false }]} />
            </RuntimeContext.Provider>
        )
        fireEvent.click(container.querySelector('.ntf-action') as HTMLElement)
        expect(toast.dismiss).not.toHaveBeenCalled()
    })

    it('renders a link for an action with an href', () => {
        const { container } = render(
            <Toast title='a' actions={[{ label: 'Open', href: '/inbox' }]} />
        )
        const link = container.querySelector('a.ntf-action')
        expect(link?.getAttribute('href')).toBe('/inbox')
    })

    it('disables an action', () => {
        const { container } = render(
            <Toast title='a' actions={[{ label: 'Wait', disabled: true }]} />
        )
        expect(container.querySelector<HTMLButtonElement>('.ntf-action')?.disabled).toBe(true)
    })

    it('turns a disabled link into an inert link', () => {
        const toast = runtime()
        const onClick = vi.fn()
        const { container } = render(
            <RuntimeContext.Provider value={toast}>
                <Toast
                    title='a'
                    actions={[{ label: 'Open', href: '/inbox', disabled: true, onClick }]}
                />
            </RuntimeContext.Provider>
        )
        const link = container.querySelector('a.ntf-action') as HTMLElement
        expect(link.hasAttribute('href')).toBe(false)
        expect(link.getAttribute('role')).toBe('link')
        expect(link.getAttribute('aria-disabled')).toBe('true')
        fireEvent.click(link)
        expect(onClick).not.toHaveBeenCalled()
        expect(toast.dismiss).not.toHaveBeenCalled()
    })

    it('puts the progress label above the actions row', () => {
        const { container } = render(
            <Toast title='a' progress={60} actions={[{ label: 'Cancel' }]} />
        )
        const progress = container.querySelector('.ntf-progress')
        expect(progress?.querySelector('.ntf-label')?.textContent).toBe('60%')
        expect(progress?.nextElementSibling?.classList.contains('ntf-actions')).toBe(true)
    })
})

describe('close', () => {
    it('dismisses the toast', () => {
        const toast = runtime()
        const { getByLabelText } = render(
            <RuntimeContext.Provider value={toast}>
                <Toast title='a' />
            </RuntimeContext.Provider>
        )
        fireEvent.click(getByLabelText('Close'))
        expect(toast.dismiss).toHaveBeenCalledWith('close')
    })

    it('takes its label from the surrounding Notifier', () => {
        const { getByLabelText } = render(
            <CloseLabelContext.Provider value='Sluiten'>
                <Toast title='a' />
            </CloseLabelContext.Provider>
        )
        expect(getByLabelText('Sluiten')).not.toBeNull()
    })

    it('prefers its own label', () => {
        const { getByLabelText } = render(
            <CloseLabelContext.Provider value='Sluiten'>
                <Toast>
                    <Toast.Close label='Fermer' />
                </Toast>
            </CloseLabelContext.Provider>
        )
        expect(getByLabelText('Fermer')).not.toBeNull()
    })
})

describe('compound primitives', () => {
    it('composes a toast from the parts', () => {
        const { container } = render(
            <Toast tone='light'>
                <Toast.Avatar src='/a.png' badge='away' />
                <Toast.Body>
                    <Toast.Title meta='now'>Hello</Toast.Title>
                    <Toast.Description>World</Toast.Description>
                    <Toast.Progress value={20} label />
                    <Toast.Actions aside='side'>
                        <Toast.Action variant='outline'>One</Toast.Action>
                    </Toast.Actions>
                </Toast.Body>
                <Toast.Close />
            </Toast>
        )
        expect(container.querySelector('.ntf-avatar')).not.toBeNull()
        expect(container.querySelector('.ntf-title')?.textContent).toBe('Hello')
        expect(container.querySelector('.ntf-meta')?.textContent).toBe('now')
        expect(container.querySelector('.ntf-description')?.textContent).toBe('World')
        expect(container.querySelector('.ntf-label')?.textContent).toBe('20%')
        expect(container.querySelector('.ntf-aside')?.textContent).toBe('side')
        expect(container.querySelector('.ntf-action')?.textContent).toBe('One')
        expect(container.querySelector('.ntf-close')).not.toBeNull()
    })

    it('does not add content of its own around children', () => {
        const { container } = render(
            <Toast>
                <span data-testid='only' />
            </Toast>
        )
        expect(container.querySelector('.ntf-toast')?.children).toHaveLength(1)
        expect(container.querySelector('.ntf-body')).toBeNull()
    })
})
