import type { ToastTone } from './types'

export type ToneTokens = {
    background: string
    foreground: string
    body: string
    meta: string
    muted: string
    icon: string
    divider: string
    border: string
    shadow: string
    accent: string
    accentText: string
    accentForeground: string
    track: string
    control: string
    controlBorder: string
    controlForeground: string
    controlShadow: string
    controlHover: string
    success: string
    error: string
    warning: string
    info: string
}

export const toneTokens: Record<ToastTone, ToneTokens> = {
    light: {
        background: '#ffffff',
        foreground: '#000000',
        body: '#404040',
        meta: '#595959',
        muted: '#6e6e72',
        icon: '#737378',
        divider: '#cbcbcb',
        border: '#d4d4d4',
        shadow: '0 4px 8px -1px rgba(0,0,0,.08), 0 30px 25px -9px rgba(0,0,0,.12)',
        accent: '#5f5afa',
        accentText: '#4f46e5',
        accentForeground: '#ffffff',
        track: '#eae9ee',
        control: '#ffffff',
        controlBorder: '#cfcfd2',
        controlForeground: '#2b2b2e',
        controlShadow: '0 1px 2px rgba(10,13,18,.05), inset 0 -2px 0 rgba(10,13,18,.05)',
        controlHover: '#f6f6f7',
        success: '#16a34a',
        error: '#d92d20',
        warning: '#dc6803',
        info: '#1570ef'
    },
    dark: {
        background: '#161618',
        foreground: '#ffffff',
        body: '#b4b4b8',
        meta: '#b2b2b5',
        muted: '#9b9b9f',
        icon: '#a1a1a6',
        divider: '#656567',
        border: 'transparent',
        shadow: '0 4px 8px -1px rgba(0,0,0,.08), 0 30px 25px -9px rgba(0,0,0,.12)',
        accent: '#8683ff',
        accentText: '#a5a2ff',
        accentForeground: '#ffffff',
        track: '#2f2f33',
        control: '#29282b',
        controlBorder: '#3d3c3f',
        controlForeground: '#ffffff',
        controlShadow: 'none',
        controlHover: '#323134',
        success: '#82c88c',
        error: '#f0827a',
        warning: '#f5b342',
        info: '#7fa8f5'
    }
}
