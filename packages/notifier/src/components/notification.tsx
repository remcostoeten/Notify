/**
 * @fileoverview Main Notifier component that renders all notifications.
 * Place once in your app root, then call notify() from anywhere.
 */

'use client'

import * as React from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { getNotifications, subscribe, pauseAllTimers, resumeAllTimers } from '../store'
import { configure } from '../notify'
import { PositionStyles, NotifyStateType, Defaults, AnimationConfig } from '../constants'
import { NotificationItem } from './notification-item'
import { NotifyThemeProvider } from './theme-context'
import type { NotifyPositionType, NotifyItem, NotifierProps, ThemeConfig } from '../types'
import type { JSX } from 'react'

let mountedNotifierCount = 0

/**
 * Groups notifications by their position.
 * @internal
 */
function groupByPosition(
    items: NotifyItem[],
    defaultPosition: NotifyPositionType
): Map<NotifyPositionType, NotifyItem[]> {
    const groups = new Map<NotifyPositionType, NotifyItem[]>()

    items.forEach((item) => {
        const pos = item.options.position ?? defaultPosition
        const existing = groups.get(pos) ?? []
        groups.set(pos, [...existing, item])
    })

    return groups
}

const StackConfig = {
    PEEK: 10,
    SCALE_STEP: 0.05,
    MAX_BEHIND: 2,
    MIN_SCALE: 0.85
} as const

type StackItemProps = {
    stackIndex: number
    total: number
    expanded: boolean
    isTop: boolean
    gap: number
    centered: boolean
    children: React.ReactNode
}

/**
 * Wrapper that collapses a notification behind the one in front of it via a
 * negative margin, and restores the regular gap when the stack is expanded.
 * @internal
 */
function StackItem({
    stackIndex,
    total,
    expanded,
    isTop,
    gap,
    centered,
    children
}: StackItemProps): JSX.Element {
    const ref = React.useRef<HTMLDivElement>(null)
    const [height, setHeight] = React.useState(0)

    React.useLayoutEffect(() => {
        const maybeNode = ref.current
        if (!maybeNode) return
        const node: HTMLDivElement = maybeNode

        function measure() {
            setHeight(node.offsetHeight)
        }

        measure()
        if (typeof ResizeObserver === 'undefined') return
        const observer = new ResizeObserver(() => measure())
        observer.observe(node)
        return () => observer.disconnect()
    }, [])

    const behind = stackIndex > 0
    const hidden = !expanded && stackIndex > StackConfig.MAX_BEHIND
    const marginSide = isTop ? 'marginTop' : 'marginBottom'
    const collapsedMargin = height > 0 ? -(height - StackConfig.PEEK) : 0

    return (
        <motion.div
            ref={ref}
            className='pointer-events-auto'
            style={{
                display: 'inline-flex',
                justifyContent: centered ? 'center' : undefined,
                position: 'relative',
                zIndex: total - stackIndex,
                transformOrigin: isTop ? 'center bottom' : 'center top',
                pointerEvents: hidden ? 'none' : 'auto'
            }}
            animate={{
                [marginSide]: behind ? (expanded ? gap : collapsedMargin) : 0,
                scale: expanded
                    ? 1
                    : Math.max(1 - stackIndex * StackConfig.SCALE_STEP, StackConfig.MIN_SCALE),
                opacity: hidden ? 0 : 1
            }}
            transition={AnimationConfig.CONTAINER}
        >
            {children}
        </motion.div>
    )
}

type PositionGroupProps = {
    position: NotifyPositionType
    items: NotifyItem[]
    stack: boolean
    gap: number
    offsetX: number
    offsetY: number
}

/**
 * Renders all notifications anchored to a single screen position.
 * @internal
 */
function PositionGroup({
    position,
    items,
    stack,
    gap,
    offsetX,
    offsetY
}: PositionGroupProps): JSX.Element {
    const [expanded, setExpanded] = React.useState(false)

    const baseStyle = PositionStyles[position]
    const isTop = position.includes('top')
    const isLeft = position.includes('left')
    const isRight = position.includes('right')
    const alignItems = isLeft ? 'flex-start' : isRight ? 'flex-end' : 'center'

    const style = {
        ...baseStyle,
        ...(baseStyle.top !== undefined && { top: offsetY }),
        ...(baseStyle.bottom !== undefined && { bottom: offsetY }),
        ...(baseStyle.left !== undefined && baseStyle.left !== '50%' && { left: offsetX }),
        ...(baseStyle.right !== undefined && { right: offsetX })
    }

    const flexDirection = stack
        ? isTop
            ? 'column-reverse'
            : 'column'
        : isTop
          ? 'column'
          : 'column-reverse'

    return (
        <div
            className='pointer-events-none fixed z-50 flex flex-col'
            style={{
                ...style,
                display: 'flex',
                flexDirection,
                alignItems,
                gap: stack ? 0 : gap,
                pointerEvents: stack && expanded ? 'auto' : 'none'
            }}
            onMouseEnter={stack ? () => setExpanded(true) : undefined}
            onMouseLeave={stack ? () => setExpanded(false) : undefined}
        >
            <AnimatePresence mode='popLayout'>
                {items.map((item, index) =>
                    stack ? (
                        <StackItem
                            key={item.id}
                            stackIndex={items.length - 1 - index}
                            total={items.length}
                            expanded={expanded}
                            isTop={isTop}
                            gap={gap}
                            centered={alignItems === 'center'}
                        >
                            <NotificationItem item={item} position={position} index={index} />
                        </StackItem>
                    ) : (
                        <div
                            key={item.id}
                            className='pointer-events-auto'
                            style={{
                                display: 'inline-flex',
                                justifyContent: alignItems === 'center' ? 'center' : undefined
                            }}
                        >
                            <NotificationItem item={item} position={position} index={index} />
                        </div>
                    )
                )}
            </AnimatePresence>
        </div>
    )
}

/**
 * Notifier component - the main entry point for the notification system.
 *
 * Place this component once in your app root (e.g., layout.tsx), then call
 * notify() from anywhere in your application.
 *
 * @example Basic usage
 * ```tsx
 * import { Notifier } from "@remcostoeten/notifier"
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
 * ```
 *
 * @example With configuration
 * ```tsx
 * <Notifier
 *   position="top-right"
 *   maxVisible={5}
 *   duration={4000}
 *   colorMode="light"
 *   radius="rounded"
 *   border={{ enabled: true }}
 * />
 * ```
 */
export function Notifier({
    position = Defaults.POSITION as NotifyPositionType,
    maxVisible = Defaults.MAX_VISIBLE,
    duration = Defaults.DURATION_MS,
    swipeToDismiss = true,
    pauseOnHover = true,
    clickToDismiss = false,
    offset,
    gap = 8,
    stack = false,
    // Theme
    colorMode = 'dark',
    radius = 'squared',
    iconColor = 'colored',
    border,
    icons,
    theme
}: NotifierProps = {}): JSX.Element {
    const [items, setItems] = React.useState<NotifyItem[]>([])

    React.useEffect(() => {
        mountedNotifierCount += 1
        if (process.env.NODE_ENV !== 'production' && mountedNotifierCount > 1) {
            console.warn(
                '[notifier] Multiple <Notifier /> instances are mounted. Each instance renders every notification, so you will see duplicates. Mount <Notifier /> once at your app root.'
            )
        }
        return () => {
            mountedNotifierCount -= 1
        }
    }, [])

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
            gap
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

    React.useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                pauseAllTimers()
            } else {
                resumeAllTimers()
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
    }, [])

    // Build theme config from props
    const themeConfig: ThemeConfig = {
        colorMode,
        radius,
        iconColor,
        border,
        icons,
        palette: theme
    }

    // Filter out idle notifications and group by position
    const activeItems = items.filter((item) => item.state !== NotifyStateType.IDLE)
    const grouped = groupByPosition(activeItems, position)

    // Get all positions that have notifications
    const positions = Array.from(grouped.keys())

    // Calculate offset values safely
    let offsetX = 16
    let offsetY = 16

    if (typeof offset === 'number') {
        offsetX = offset
        offsetY = offset
    } else if (typeof offset === 'string') {
        const parsed = parseInt(offset, 10)
        if (!isNaN(parsed)) {
            offsetX = parsed
            offsetY = parsed
        }
    } else if (offset) {
        offsetX = offset.x ?? 16
        offsetY = offset.y ?? 16
    }

    return (
        <NotifyThemeProvider theme={themeConfig}>
            {positions.map((pos) => (
                <PositionGroup
                    key={pos}
                    position={pos}
                    items={grouped.get(pos) ?? []}
                    stack={stack}
                    gap={gap}
                    offsetX={offsetX}
                    offsetY={offsetY}
                />
            ))}
        </NotifyThemeProvider>
    )
}

export { Notifier as Notification }
export type { NotifierProps } from '../types'
