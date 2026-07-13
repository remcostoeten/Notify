/**
 * @fileoverview Component tests for the Notifier container.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, act, cleanup } from '@testing-library/react'
import * as React from 'react'
import { Notifier } from '../components/notification'
import { notify } from '../notify'
import { resetStore } from '../store'

describe('Notifier', () => {
    beforeEach(() => {
        cleanup()
        resetStore()
    })

    it('renders a triggered notification exactly once', () => {
        render(<Notifier />)

        act(() => {
            notify.success('Saved to database')
        })

        expect(screen.getAllByText('Saved to database')).toHaveLength(1)
    })

    it('renders ReactNode messages and descriptions', () => {
        render(<Notifier />)

        act(() => {
            notify(<strong>Rich content</strong>, { description: 'More detail here' })
        })

        expect(screen.getByText('Rich content')).toBeTruthy()
        expect(screen.getByText('More detail here')).toBeTruthy()
    })

    it('renders warning notifications with assertive live region', () => {
        render(<Notifier />)

        act(() => {
            notify.warning('Disk almost full')
        })

        const alert = screen.getByRole('alert')
        expect(alert.getAttribute('aria-live')).toBe('assertive')
    })

    it('uses a polite status role for success notifications', () => {
        render(<Notifier />)

        act(() => {
            notify.success('Done')
        })

        expect(screen.getByRole('status')).toBeTruthy()
    })

    it('resolves a confirm as false when Escape is pressed', async () => {
        render(<Notifier />)

        let result: Promise<boolean>
        act(() => {
            result = notify.confirm('Delete file?')
        })

        act(() => {
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
        })

        await expect(result!).resolves.toBe(false)
    })

    it('warns when a second Notifier is mounted', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

        render(
            <React.Fragment>
                <Notifier />
                <Notifier />
            </React.Fragment>
        )

        expect(
            warnSpy.mock.calls.some(([msg]) => String(msg).includes('Multiple <Notifier />'))
        ).toBe(true)
        warnSpy.mockRestore()
    })
})
