import { describe, it, expect } from 'vitest'
import { themeVariables } from '../theme'
import { stylesFor, toastStyles } from '../styles'
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

    it('reserves room beside the title only when a close button is present', () => {
        expect(toastStyles).toContain(
            '.ntf-title-row{display:flex;align-items:center;gap:8px;min-width:0}'
        )
        expect(toastStyles).toContain(
            '.ntf-toast:has(.ntf-close) .ntf-title-row{padding-right:28px}'
        )
    })

    it('derives padding, gap and the close button offset from spacing variables', () => {
        expect(toastStyles).toContain('gap:var(--ntf-gap,16px)')
        expect(toastStyles).toContain('padding:var(--ntf-padding,16px)')
        expect(toastStyles).toContain('top:calc(var(--ntf-padding,16px) - 4px)')
        expect(toastStyles).not.toMatch(/15\.5px|11\.4px|11\.8px|8\.5px/)
    })
})

describe('stylesFor', () => {
    it('returns the plain stylesheet without a layer', () => {
        expect(stylesFor(null)).toBe(toastStyles)
    })

    it('wraps the stylesheet in the named layer', () => {
        expect(stylesFor('vendor.toasts')).toBe(`@layer vendor.toasts{${toastStyles}}`)
    })
})
