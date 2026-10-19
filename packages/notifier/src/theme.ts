import { toneTokens } from './tokens'
import { kebab } from './utils'
import type { CSSVars } from './utils'
import type { ToastTheme, ToastTone } from './types'

function toPixels(value: number | string): string {
    return typeof value === 'number' ? `${value}px` : value
}

/**
 * @name themeVariables
 * @description Turns a `ToastTheme` into the CSS custom properties the toast
 * stylesheet reads. Tone tokens become `--ntf-light-*` and `--ntf-dark-*`.
 *
 * @example
 * themeVariables({ dark: { background: '#000' }, radius: 16 })
 * // { '--ntf-dark-background': '#000', '--ntf-radius': '16px' }
 */
export function themeVariables(theme: ToastTheme | undefined): CSSVars {
    const variables: CSSVars = {}
    if (!theme) return variables

    const tones: ToastTone[] = ['light', 'dark']
    tones.forEach((tone) => {
        Object.entries(theme[tone] ?? {}).forEach(([name, value]) => {
            if (name in toneTokens[tone]) variables[`--ntf-${tone}-${kebab(name)}`] = value
        })
    })

    if (theme.font !== undefined) variables['--ntf-font'] = theme.font
    if (theme.radius !== undefined) variables['--ntf-radius'] = toPixels(theme.radius)
    if (theme.width !== undefined) variables['--ntf-width'] = toPixels(theme.width)
    return variables
}
