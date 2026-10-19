import { describe, it, expect } from 'vitest'
import { cx, kebab, matchesHotkey } from '../utils'

const none = { altKey: false, ctrlKey: false, shiftKey: false, metaKey: false }

describe('matchesHotkey', () => {
    it('matches a modifier and a letter by physical key', () => {
        expect(matchesHotkey({ ...none, code: 'KeyT', altKey: true }, 'alt+t')).toBe(true)
    })

    it('is case insensitive and accepts aliases', () => {
        expect(matchesHotkey({ ...none, code: 'KeyN', metaKey: true }, 'Cmd+N')).toBe(true)
        expect(matchesHotkey({ ...none, code: 'KeyN', altKey: true }, 'option+n')).toBe(true)
        expect(matchesHotkey({ ...none, code: 'KeyN', ctrlKey: true }, 'control+n')).toBe(true)
    })

    it('requires exactly the listed modifiers', () => {
        expect(matchesHotkey({ ...none, code: 'KeyT' }, 'alt+t')).toBe(false)
        expect(
            matchesHotkey({ ...none, code: 'KeyT', altKey: true, shiftKey: true }, 'alt+t')
        ).toBe(false)
        expect(
            matchesHotkey({ ...none, code: 'KeyT', altKey: true, shiftKey: true }, 'alt+shift+t')
        ).toBe(true)
    })

    it('matches digits and named keys', () => {
        expect(matchesHotkey({ ...none, code: 'Digit1', ctrlKey: true }, 'ctrl+1')).toBe(true)
        expect(matchesHotkey({ ...none, code: 'F8' }, 'f8')).toBe(true)
        expect(matchesHotkey({ ...none, code: 'Escape' }, 'escape')).toBe(true)
    })

    it('does not match another key', () => {
        expect(matchesHotkey({ ...none, code: 'KeyY', altKey: true }, 'alt+t')).toBe(false)
    })
})

describe('cx', () => {
    it('joins truthy parts and returns undefined for none', () => {
        expect(cx('a', false, null, undefined, 'b')).toBe('a b')
        expect(cx(false, null)).toBeUndefined()
    })
})

describe('kebab', () => {
    it('turns camel case into kebab case', () => {
        expect(kebab('controlBorder')).toBe('control-border')
        expect(kebab('accent')).toBe('accent')
    })
})
