import { describe, it, expect } from 'vitest'
import { themeVariables } from '../theme'
import { toastStyles } from '../styles'
import { toneTokens } from '../tokens'

describe('themeVariables', () => {
    it('returns nothing without a theme', () => {
        expect(themeVariables(undefined)).toEqual({})
    })

    it('maps tone tokens onto tone-scoped custom properties', () => {
        expect(
            themeVariables({
                dark: { background: '#000', accentText: '#fff' },
                light: { body: '#111' }
            })
        ).toEqual({
            '--ntf-dark-background': '#000',
            '--ntf-dark-accent-text': '#fff',
            '--ntf-light-body': '#111'
        })
    })

    it('turns numeric sizes into pixels and passes strings through', () => {
        expect(themeVariables({ radius: 16, width: '28rem', font: 'Geist, sans-serif' })).toEqual({
            '--ntf-radius': '16px',
            '--ntf-width': '28rem',
            '--ntf-font': 'Geist, sans-serif'
        })
    })
})

describe('toastStyles', () => {
    it('reads every tone token through a tone-scoped custom property', () => {
        Object.keys(toneTokens.light).forEach((name) => {
            const kebab = name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
            expect(toastStyles).toContain(`--ntf-${kebab}:var(--ntf-light-${kebab},`)
            expect(toastStyles).toContain(`--ntf-${kebab}:var(--ntf-dark-${kebab},`)
        })
    })

    it('defines the same tokens for both tones', () => {
        expect(Object.keys(toneTokens.dark)).toEqual(Object.keys(toneTokens.light))
    })
})
