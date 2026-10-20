import type { CSSProperties } from 'react'
import type { ToastID } from './types'

export type CSSVars = CSSProperties & { [name: `--${string}`]: string }

let counter = 0

export function generateId(): ToastID {
    counter += 1
    return `ntf_${Date.now().toString(36)}_${counter}`
}

export function noop() {}

// A CSS layer name: identifiers joined by dots, such as `notifier` or `vendor.toasts`
const LAYER_NAME = /^-?[_a-zA-Z][\w-]*(\.-?[_a-zA-Z][\w-]*)*$/

/**
 * @name resolveLayer
 * @description The cascade layer the stylesheet goes in, from the `layer` prop of
 * `Notifier`: `notifier` for true, the name itself when it is a valid layer
 * name, and null (no layer) for false, nothing or an invalid name.
 *
 * @example
 * resolveLayer(true) // 'notifier'
 * resolveLayer('vendor.toasts') // 'vendor.toasts'
 * resolveLayer('two words') // null
 */
export function resolveLayer(layer: boolean | string | undefined): string | null {
    if (layer === true) return 'notifier'
    if (typeof layer === 'string' && LAYER_NAME.test(layer)) return layer
    return null
}

export function cx(...parts: (string | false | null | undefined)[]): string | undefined {
    const joined = parts.filter(Boolean).join(' ')
    return joined === '' ? undefined : joined
}

export function kebab(name: string): string {
    return name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
}

const modifierFlags = [
    { names: ['alt', 'option'], flag: 'altKey' },
    { names: ['ctrl', 'control'], flag: 'ctrlKey' },
    { names: ['shift'], flag: 'shiftKey' },
    { names: ['meta', 'cmd', 'command'], flag: 'metaKey' }
] as const

type HotkeyEvent = Pick<KeyboardEvent, 'code' | 'altKey' | 'ctrlKey' | 'shiftKey' | 'metaKey'>

function codeOf(key: string): string {
    if (/^[a-z]$/.test(key)) return `key${key}`
    if (/^[0-9]$/.test(key)) return `digit${key}`
    return key
}

/**
 * @name matchesHotkey
 * @description Whether a keyboard event is the hotkey. A hotkey is modifiers and one key
 * joined by plus signs, such as `alt+t` or `ctrl+shift+n`. The key is matched by its
 * physical position, so it works on layouts where Alt changes the typed character.
 *
 * @example
 * matchesHotkey({ code: 'KeyT', altKey: true, ctrlKey: false, shiftKey: false, metaKey: false }, 'alt+t') // true
 */
export function matchesHotkey(event: HotkeyEvent, hotkey: string): boolean {
    const parts = hotkey
        .toLowerCase()
        .split('+')
        .map((part) => part.trim())
    const key = parts[parts.length - 1] ?? ''
    const modifiers = parts.slice(0, -1)
    const modifiersMatch = modifierFlags.every(
        ({ names, flag }) =>
            event[flag] === modifiers.some((name) => names.some((alias) => alias === name))
    )
    return modifiersMatch && event.code.toLowerCase() === codeOf(key)
}
