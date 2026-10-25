import { describe, it, expect, afterEach, vi } from 'vitest'
import { act, cleanup, render } from '@testing-library/react'
import { cellsOf, formatNumber, splitNumbers, trendOf } from '../number-flow'
import { Notifier } from '../components/notifier'
import { Toast } from '../components/toast'
import { notify } from '../notify'
import { resetStore } from '../store'

afterEach(() => {
    cleanup()
    delete (Element.prototype as { animate?: unknown }).animate
})

describe('splitNumbers', () => {
    it('separates numbers from text and joins back into the input', () => {
        const segments = splitNumbers('Uploaded 45 of 1,200 (3.5%)')
        expect(segments.filter((segment) => segment.kind === 'number').map((s) => s.text)).toEqual([
            '45',
            '1,200',
            '3.5'
        ])
        expect(segments.map((segment) => segment.text).join('')).toBe('Uploaded 45 of 1,200 (3.5%)')
    })

    it('returns a single text segment when there are no digits', () => {
        expect(splitNumbers('Saved')).toEqual([{ kind: 'text', text: 'Saved' }])
    })

    it('returns nothing for an empty string', () => {
        expect(splitNumbers('')).toEqual([])
    })
})

describe('cellsOf', () => {
    it('keys each character by its distance from the right', () => {
        expect(cellsOf('120').map((cell) => cell.key)).toEqual(['p2', 'p1', 'p0'])
        expect(cellsOf('99').map((cell) => cell.key)).toEqual(['p1', 'p0'])
    })
})

describe('trendOf', () => {
    it('is positive when the number grew, negative when it shrank and zero otherwise', () => {
        expect(trendOf('45', '60')).toBe(1)
        expect(trendOf('1,200', '980')).toBe(-1)
        expect(trendOf('7', '7')).toBe(0)
    })
})

describe('formatNumber', () => {
    it('uses String without locale or options', () => {
        expect(formatNumber(1234.5)).toBe('1234.5')
    })

    it('uses Intl.NumberFormat with options', () => {
        expect(formatNumber(1234.5, 'en-US', { style: 'currency', currency: 'USD' })).toBe(
            '$1,234.50'
        )
    })
})

describe('number animation in a toast', () => {
    it('leaves text untouched by default', () => {
        const { container } = render(<Toast title='Uploaded 45 files' />)
        expect(container.querySelector('.ntf-num')).toBeNull()
        expect(container.querySelector('.ntf-title')?.textContent).toBe('Uploaded 45 files')
    })

    it('wraps every number in a slot when enabled on the toast', () => {
        const { container } = render(
            <Toast animateNumbers title='Uploaded 45 of 120' description={7} />
        )
        expect(container.querySelectorAll('.ntf-title .ntf-num')).toHaveLength(2)
        expect(container.querySelectorAll('.ntf-description .ntf-num')).toHaveLength(1)
        expect(container.querySelector('.ntf-title')?.textContent).toBe('Uploaded 45 of 120')
    })

    it('animates the progress label', () => {
        const { container } = render(<Toast animateNumbers progress={60} />)
        expect(container.querySelector('.ntf-label')?.textContent).toBe('60%')
        expect(container.querySelectorAll('.ntf-label .ntf-digit')).toHaveLength(2)
    })

    it('inherits the setting from Notifier and lets the toast turn it off', () => {
        resetStore()
        const { container } = render(<Notifier animateNumbers />)
        act(() => {
            notify({ title: 'Count 5', duration: 0 })
            notify({ title: 'Count 6', duration: 0, animateNumbers: false })
        })
        const titles = [...container.querySelectorAll('.ntf-title')]
        const animated = titles.filter((title) => title.querySelector('.ntf-num'))
        expect(titles).toHaveLength(2)
        expect(animated.map((title) => title.textContent)).toEqual(['Count 5'])
    })

    it('renders Toast.Number whatever the setting', () => {
        const { container } = render(
            <Toast>
                <Toast.Number value={1234.5} locales='en-US' />
            </Toast>
        )
        expect(container.querySelector('.ntf-digits')?.textContent).toBe('1,234.5')
        expect(container.querySelectorAll('.ntf-digit')).toHaveLength(7)
    })

    it('rolls a changed digit through a ghost and removes it when done', async () => {
        const finished = Promise.resolve()
        const animate = vi.fn(() => ({ finished }))
        Object.defineProperty(Element.prototype, 'animate', { value: animate, configurable: true })
        const { container, rerender } = render(<Toast animateNumbers title='Count 19' />)
        expect(animate).not.toHaveBeenCalled()
        rerender(<Toast animateNumbers title='Count 20' />)
        expect(container.querySelectorAll('.ntf-digit-face[data-ghost]')).toHaveLength(2)
        expect(
            [...container.querySelectorAll('.ntf-digit-face:not([data-ghost])')].map(
                (face) => face.textContent
            )
        ).toEqual(['2', '0'])
        await finished
        await Promise.resolve()
        expect(container.querySelectorAll('.ntf-digit-face[data-ghost]')).toHaveLength(0)
    })
})
