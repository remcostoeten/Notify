/**
 * @fileoverview Theme context for notification styling.
 * Provides theme values to all notification components.
 */

"use client"

import type React from "react"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { IconColors, RadiusValues, ThemeColors } from "../constants"
import type { BorderConfig, IconColorMode, IconConfig, RadiusVariant, ThemeConfig } from "../types"

/**
 * Fully resolved theme with computed values.
 */
export interface ResolvedTheme {
  /** Resolved color mode (never "auto") */
  colorMode: "light" | "dark"
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
  color: "",
  style: "solid",
}

const DEFAULT_THEME: ThemeConfig = {
  colorMode: "dark",
  radius: "pill",
  iconColor: "colored",
  border: DEFAULT_BORDER_CONFIG,
}

const ThemeContext = createContext<ResolvedTheme | null>(null)

/**
 * Hook to access the resolved notification theme.
 * Must be used within a NotifyThemeProvider.
 */
export function useNotifyTheme(): ResolvedTheme {
  const theme = useContext(ThemeContext)
  if (!theme) {
    throw new Error("useNotifyTheme must be used within a Notification component")
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
  const [systemColorMode, setSystemColorMode] = useState<"light" | "dark">("dark")

  useEffect(() => {
    if (typeof window === "undefined") return

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    setSystemColorMode(mediaQuery.matches ? "dark" : "light")

    const handler = (e: MediaQueryListEvent) => {
      setSystemColorMode(e.matches ? "dark" : "light")
    }

    mediaQuery.addEventListener("change", handler)
    return () => mediaQuery.removeEventListener("change", handler)
  }, [])

  const resolvedTheme = useMemo((): ResolvedTheme => {
    const colorMode: "light" | "dark" = theme.colorMode === "auto" ? systemColorMode : (theme.colorMode ?? "dark")

    const colors = ThemeColors[colorMode]
    const iconColorMode = theme.iconColor ?? "colored"
    const iconColorsKey = iconColorMode === "hidden" ? "neutral" : iconColorMode
    const iconColors = IconColors[iconColorsKey]
    const radiusVariant = theme.radius ?? "pill"

    const borderConfig: Required<BorderConfig> = {
      enabled: theme.border?.enabled ?? false,
      width: theme.border?.width ?? 1,
      color: theme.border?.color ?? colors.border,
      style: theme.border?.style ?? "solid",
    }

    return {
      colorMode,
      background: theme.palette?.background ?? colors.background,
      text: theme.palette?.text ?? colors.text,
      textMuted: theme.palette?.textMuted ?? colors.textMuted,
      textSubtle: theme.palette?.textSubtle ?? colors.textSubtle,
      border: theme.palette?.border ?? colors.border,
      borderHighlight: theme.palette?.borderHighlight ?? colors.borderHighlight,
      buttonHover: theme.palette?.buttonHover ?? colors.buttonHover,
      shadow: theme.palette?.shadow === "none" ? "none" : (theme.palette?.shadow ?? colors.shadow),
      radius: RadiusValues[radiusVariant],
      radiusVariant,
      iconColorMode,
      iconColors,
      icons: theme.icons,
      borderConfig,
    }
  }, [theme, systemColorMode])

  return <ThemeContext.Provider value={resolvedTheme}>{children}</ThemeContext.Provider>
}
