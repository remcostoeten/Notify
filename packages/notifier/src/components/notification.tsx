/**
 * @fileoverview Main Notifier component that renders all notifications.
 * Place once in your app root, then call notify() from anywhere.
 */

"use client"

import * as React from "react"
import { AnimatePresence } from "framer-motion"
import { getNotifications, subscribe } from "../store"
import { configure } from "../notify"
import { PositionStyles, NotifyStateType, Defaults } from "../constants"
import { NotificationItem } from "./notification-item"
import { NotifyThemeProvider } from "./theme-context"
import type { NotifyPositionType, NotifyItem, NotifierProps, ThemeConfig } from "../types"
import type { JSX } from "react"

/**
 * Groups notifications by their position.
 * @internal
 */
function groupByPosition(
  items: NotifyItem[],
  defaultPosition: NotifyPositionType,
): Map<NotifyPositionType, NotifyItem[]> {
  const groups = new Map<NotifyPositionType, NotifyItem[]>()

  items.forEach((item) => {
    const pos = item.options.position ?? defaultPosition
    const existing = groups.get(pos) ?? []
    groups.set(pos, [...existing, item])
  })

  return groups
}

/**
 * Notifier component - the main entry point for the notification system.
 *
 * Place this component once in your app root (e.g., layout.tsx), then call
 * notify() from anywhere in your application.
 *
 * @example Basic usage
 * \`\`\`tsx
 * // In your layout.tsx
 * import { Notifier } from "@/module/notify"
 *
 * export default function Layout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         {children}
 *         <Notifier />
 *       </body>
 *     </html>
 *   )
 * }
 * \`\`\`
 *
 * @example With configuration
 * \`\`\`tsx
 * <Notifier
 *   position="top-right"
 *   maxVisible={5}
 *   duration={4000}
 *   colorMode="light"
 *   radius="rounded"
 *   border={{ enabled: true }}
 * />
 * \`\`\`
 */
export function Notifier({
  // Behavior
  position = Defaults.POSITION as NotifyPositionType,
  maxVisible = Defaults.MAX_VISIBLE,
  duration = Defaults.DURATION_MS,
  swipeToDismiss = true,
  pauseOnHover = true,
  clickToDismiss = false,
  offset,
  gap = 8,
  // Theme
  colorMode = "dark",
  radius = "pill",
  iconColor = "colored",
  border,
  icons,
}: NotifierProps = {}): JSX.Element {
  const [items, setItems] = React.useState<NotifyItem[]>([])

  // Sync props to global config on mount and when props change
  React.useEffect(() => {
    configure({
      position,
      maxVisible,
      defaultDuration: duration,
      swipeToDismiss,
      pauseOnHover,
      clickToDismiss,
      offset,
      gap,
    })
  }, [position, maxVisible, duration, swipeToDismiss, pauseOnHover, clickToDismiss, offset, gap])

  React.useEffect(() => {
    setItems(getNotifications())

    const unsubscribe = subscribe(() => {
      setItems(getNotifications())
    })

    return () => {
      unsubscribe()
    }
  }, [])

  // Build theme config from props
  const themeConfig: ThemeConfig = {
    colorMode,
    radius,
    iconColor,
    border,
    icons,
  }

  // Filter out idle notifications and group by position
  const activeItems = items.filter((item) => item.state !== NotifyStateType.IDLE)
  const grouped = groupByPosition(activeItems, position)

  // Get all positions that have notifications
  const positions = Array.from(grouped.keys())

  // Calculate offset values
  const offsetX = typeof offset === "number" ? offset : (offset?.x ?? 16)
  const offsetY = typeof offset === "number" ? offset : (offset?.y ?? 16)

  return (
    <NotifyThemeProvider theme={themeConfig}>
      {positions.map((pos) => {
        const positionItems = grouped.get(pos) ?? []

        const baseStyle = PositionStyles[pos]
        const isTop = pos.includes("top")
        const isLeft = pos.includes("left")
        const isRight = pos.includes("right")
        const alignItems = isLeft ? "flex-start" : isRight ? "flex-end" : "center"

        // Apply custom offset
        const style = {
          ...baseStyle,
          ...(baseStyle.top !== undefined && { top: offsetY }),
          ...(baseStyle.bottom !== undefined && { bottom: offsetY }),
          ...(baseStyle.left !== undefined && baseStyle.left !== "50%" && { left: offsetX }),
          ...(baseStyle.right !== undefined && { right: offsetX }),
        }

        return (
          <div
            key={pos}
            className="fixed z-50 flex flex-col pointer-events-none"
            style={{
              ...style,
              display: "flex",
              flexDirection: isTop ? "column" : "column-reverse",
              alignItems,
              gap,
            }}
          >
            <AnimatePresence mode="popLayout">
              {positionItems.map((item, index) => (
                <div
                  key={item.id}
                  className="pointer-events-auto"
                  style={{ display: "inline-flex", justifyContent: alignItems === "center" ? "center" : undefined }}
                >
                  <NotificationItem item={item} position={pos} index={index} />
                </div>
              ))}
            </AnimatePresence>
          </div>
        )
      })}
    </NotifyThemeProvider>
  )
}

export { Notifier as Notification }
export type { NotifierProps } from "../types"
