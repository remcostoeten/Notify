/**
 * @fileoverview Theme context for notification styling.
 * Provides theme values to all notification components.
 */

'use client'

import type React from 'react'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { IconColors, RadiusValues, ThemeColors } from '../constants'
import type { BorderConfig, IconColorMode, IconConfig, RadiusVariant, ThemeConfig } from '../types'

/**
 * Fully resolved theme with computed values.
 */
export interface ResolvedTheme {
    /** Resolved color mode (never "auto") */
    colorMode: 'light' | 'dark'
    /** Background color */
    background: string
    /** Primary text color */
    text: string
    /** Muted text color */
    textMuted: string
    /** Subtle text color */
    textSubtle: string
    /** Border color */
    border: string
    /** Highlighted border color */
    borderHighlight: string
    /** Button hover background */
    buttonHover: string
    /** Box shadow */
    shadow: string
    /** Border radius value */
    radius: string
    /** Border radius variant name */
    radiusVariant: RadiusVariant
    /** Icon color mode */
    iconColorMode: IconColorMode
    /** Resolved icon colors by state */
    iconColors: typeof IconColors.colored | typeof IconColors.neutral
    /** Custom icon configuration */
    icons?: IconConfig
    /** Border configuration */
    borderConfig: Required<BorderConfig>
}

const DEFAULT_BORDER_CONFIG: Required<BorderConfig> = {
    enabled: false,
    width: 1,
    color: '',
    style: 'solid'
}

const DEFAULT_THEME: ThemeConfig = {
    colorMode: 'dark',
    radius: 'rounded',
    iconColor: 'colored',
    border: DEFAULT_BORDER_CONFIG
}

const ThemeContext = createContext<ResolvedTheme | null>(null)

/**
 * Hook to access the resolved notification theme.
 * Must be used within a NotifyThemeProvider.
 */
export function useNotifyTheme(): ResolvedTheme {
    const theme = useContext(ThemeContext)
    if (!theme) {
        throw new Error('useNotifyTheme must be used within a Notification component')
    }
    return theme
}

interface ThemeProviderProps {
    theme?: ThemeConfig
    children: React.ReactNode
}

/**
 * Internal theme provider component.
 * Resolves theme configuration and provides computed values.
 */
export function NotifyThemeProvider({ theme = DEFAULT_THEME, children }: ThemeProviderProps) {
    const [systemColorMode, setSystemColorMode] = useState<'light' | 'dark'>('dark')

    useEffect(() => {
        if (typeof window === 'undefined') return

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        setSystemColorMode(mediaQuery.matches ? 'dark' : 'light')

        const handler = (e: MediaQueryListEvent) => {
            setSystemColorMode(e.matches ? 'dark' : 'light')
        }

        mediaQuery.addEventListener('change', handler)
        return () => mediaQuery.removeEventListener('change', handler)
    }, [])

    const { colorMode: themeColorMode, iconColor, radius, border, icons, palette } = theme
    const borderEnabled = border?.enabled
    const borderWidth = border?.width
    const borderColor = border?.color
    const borderStyle = border?.style
    const paletteBackground = palette?.background
    const paletteText = palette?.text
    const paletteTextMuted = palette?.textMuted
    const paletteTextSubtle = palette?.textSubtle
    const paletteBorder = palette?.border
    const paletteBorderHighlight = palette?.borderHighlight
    const paletteButtonHover = palette?.buttonHover
    const paletteShadow = palette?.shadow

    const resolvedTheme = useMemo((): ResolvedTheme => {
        const colorMode: 'light' | 'dark' =
            themeColorMode === 'auto' ? systemColorMode : (themeColorMode ?? 'dark')

        const colors = ThemeColors[colorMode]
        const iconColorMode = iconColor ?? 'colored'
        const iconColorsKey = iconColorMode === 'hidden' ? 'neutral' : iconColorMode
        const iconColors = IconColors[iconColorsKey]
        const radiusVariant = radius ?? 'rounded'

        const borderConfig: Required<BorderConfig> = {
            enabled: borderEnabled ?? false,
            width: borderWidth ?? 1,
            color: borderColor ?? colors.border,
            style: borderStyle ?? 'solid'
        }

        return {
            colorMode,
            background: paletteBackground ?? colors.background,
            text: paletteText ?? colors.text,
            textMuted: paletteTextMuted ?? colors.textMuted,
            textSubtle: paletteTextSubtle ?? colors.textSubtle,
            border: paletteBorder ?? colors.border,
            borderHighlight: paletteBorderHighlight ?? colors.borderHighlight,
            buttonHover: paletteButtonHover ?? colors.buttonHover,
            shadow: paletteShadow === 'none' ? 'none' : (paletteShadow ?? colors.shadow),
            radius: RadiusValues[radiusVariant],
            radiusVariant,
            iconColorMode,
            iconColors,
            icons,
            borderConfig
        }
    }, [
        themeColorMode,
        systemColorMode,
        iconColor,
        radius,
        icons,
        borderEnabled,
        borderWidth,
        borderColor,
        borderStyle,
        paletteBackground,
        paletteText,
        paletteTextMuted,
        paletteTextSubtle,
        paletteBorder,
        paletteBorderHighlight,
        paletteButtonHover,
        paletteShadow
    ])

    return <ThemeContext.Provider value={resolvedTheme}>{children}</ThemeContext.Provider>
}
