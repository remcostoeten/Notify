import { useInsertionEffect, useSyncExternalStore } from 'react'
import { stylesFor } from '../styles'
import { noop } from '../utils'

type SheetSettings = {
    nonce: string | undefined
    layer: string | null
}

type Props = {
    primary?: boolean
    nonce?: string
    layer?: string | null
}

let settings: SheetSettings = { nonce: undefined, layer: null }

function subscribeHydration(): () => void {
    return noop
}

function onClient(): boolean {
    return true
}

function onServer(): boolean {
    return false
}

/**
 * @name mountStyleSheet
 * @description Keeps exactly one toast stylesheet in the document head. `Notifier`
 * passes its nonce and cascade layer; a standalone `Toast` passes nothing and
 * keeps whatever was set. A new nonce replaces the element, because browsers
 * only check a nonce when the style is inserted.
 *
 * @example
 * mountStyleSheet({ nonce: 'abc', layer: 'notifier' })
 * mountStyleSheet()
 */
export function mountStyleSheet(next?: SheetSettings) {
    if (typeof document === 'undefined') return
    const nonceChanged = next !== undefined && next.nonce !== settings.nonce
    if (next) settings = next
    const css = stylesFor(settings.layer)
    const current = document.head.querySelector<HTMLStyleElement>('style[data-ntf=sheet]')
    if (current && !nonceChanged) {
        if (current.textContent !== css) current.textContent = css
        return
    }
    const sheet = document.createElement('style')
    sheet.setAttribute('data-ntf', 'sheet')
    if (settings.nonce) sheet.setAttribute('nonce', settings.nonce)
    sheet.textContent = css
    if (current) current.replaceWith(sheet)
    else document.head.append(sheet)
}

export function StyleSheet({ primary = false, nonce, layer = null }: Props) {
    const hydrated = useSyncExternalStore(subscribeHydration, onClient, onServer)

    useInsertionEffect(() => {
        mountStyleSheet(primary ? { nonce, layer } : undefined)
    }, [primary, nonce, layer])

    if (hydrated) return null
    return (
        <style
            data-ntf=''
            nonce={nonce}
            dangerouslySetInnerHTML={{ __html: stylesFor(primary ? layer : null) }}
        />
    )
}
