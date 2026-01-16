/**
 * Theming Example
 * Demonstrates theme customization options
 */

import { Notifier } from "@remcostoeten/notifier"

// Dark theme with borders
export function DarkThemeWithBorder() {
  return (
    <Notifier
      colorMode="dark"
      radius="rounded"
      iconColor="colored"
      border={{
        enabled: true,
        width: 1,
        color: "rgba(255, 255, 255, 0.1)",
        style: "solid",
      }}
    />
  )
}

// Light theme minimal
export function LightThemeMinimal() {
  return <Notifier colorMode="light" radius="pill" iconColor="neutral" border={false} />
}

// Custom positioned with neutral icons
export function TopRightNeutral() {
  return <Notifier position="top-right" colorMode="dark" radius="squared" iconColor="neutral" maxVisible={5} gap={12} />
}

// Hidden icons (spinner only)
export function MinimalSpinnerOnly() {
  return <Notifier colorMode="dark" iconColor="hidden" radius="pill" />
}

// Custom border style
export function CustomBorderStyle() {
  return (
    <Notifier
      colorMode="dark"
      border={{
        enabled: true,
        width: 2,
        color: "#3b82f6",
        style: "dashed",
      }}
    />
  )
}
