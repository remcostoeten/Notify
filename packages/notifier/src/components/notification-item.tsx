/**
 * @fileoverview Individual notification item with swipe, hover, and click behaviors.
 */

'use client'

import * as React from 'react'
import {
    AnimatePresence,
    animate,
    motion,
    useMotionValue,
    useReducedMotion,
    useTransform,
    type PanInfo
} from 'motion/react'
import { dismiss, resolveConfirm, pauseAllTimers, resumeAllTimers } from '../store'
import {
    NotifyStateType,
    AnimationConfig,
    Defaults,
    DismissReason,
    PositionSwipeDirection,
    PositionAnimationDirection,
    NotifyPosition
} from '../constants'
import { NotifyIcon } from './notify-icon'
import { useNotifyTheme } from './theme-context'
import type { NotifyItem, NotifyPositionType } from '../types'
import type { JSX } from 'react'

const TOAST_WIDTH = 400
const TOAST_PADDING = 16
const CLOSE_BUTTON_SIZE = 36

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
        aria-hidden='true'
        {...props}
    >
        <path d='M18 6 6 18M6 6l12 12' />
    </svg>
)

const ChevronIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
        aria-hidden='true'
        {...props}
    >
        <path d='m9 18 6-6-6-6' />
    </svg>
)

const textButtonStyle: React.CSSProperties = {
    appearance: 'none',
    background: 'none',
    border: 'none',
    padding: 0,
    margin: 0,
    cursor: 'pointer',
    font: 'inherit',
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: 600,
    whiteSpace: 'nowrap',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px'
}

/**
 * Props for the NotificationItem component.
 */
type Props = {
    /** The notification data */
    item: NotifyItem
    /** Position for animation direction */
    position: NotifyPositionType
    /** Index in the stack for offset calculation */
    index: number
}

/**
 * Individual notification item component.
 * Handles swipe gestures, hover pause, click dismiss, and all interactions.
 */
function NotificationItemView({ item, position, index }: Props): JSX.Element {
    const { id, state, message, visible, options, stateStartedAt } = item
    const theme = useNotifyTheme()
    const shouldReduceMotion = useReducedMotion()

    const hasAction = !!options.action
    const isDismissible = options.dismissible === true
    const isConfirm = state === NotifyStateType.CONFIRM
    const confirmOptions = options.confirm
    const isAssertive = state === NotifyStateType.ERROR || state === NotifyStateType.WARNING
    const showIcon = !(theme.iconColorMode === 'hidden' && item.state !== NotifyStateType.LOADING)
    const hasActions = isConfirm || hasAction

    const cancelButtonRef = React.useRef<HTMLButtonElement>(null)
    const contentRef = React.useRef<HTMLDivElement>(null)
    const width = useMotionValue<number | 'auto'>('auto')
    const height = useMotionValue<number | 'auto'>('auto')
    const visibleRef = React.useRef(visible)
    visibleRef.current = visible

    React.useLayoutEffect(() => {
        const maybeNode = contentRef.current
        if (!maybeNode) return
        const node: HTMLDivElement = maybeNode
        let measured: { width: number; height: number } | null = null

        function measure() {
            const next = { width: node.offsetWidth, height: node.offsetHeight }
            if (measured && measured.width === next.width && measured.height === next.height) {
                return
            }
            const previous = measured
            measured = next
            if (!previous) {
                width.set(next.width)
                height.set(next.height)
                return
            }
            const transition = visibleRef.current ? AnimationConfig.RESIZE : AnimationConfig.EXIT
            animate(width, next.width, transition)
            animate(height, next.height, transition)
        }

        measure()
        if (typeof ResizeObserver === 'undefined') return
        const observer = new ResizeObserver(() => measure())
        observer.observe(node)
        return () => observer.disconnect()
    }, [width, height])

    React.useEffect(() => {
        if (!isConfirm || !visible) return

        cancelButtonRef.current?.focus()

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                resolveConfirm(id, false)
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isConfirm, visible, id])

    const swipeEnabled = options.swipeToDismiss !== false
    const swipeDirection = PositionSwipeDirection[position]
    const isHorizontalSwipe = swipeDirection === 'x'

    const x = useMotionValue(0)
    const y = useMotionValue(0)

    const swipeValue = isHorizontalSwipe ? x : y
    const opacity = useTransform(
        swipeValue,
        [-Defaults.SWIPE_THRESHOLD, 0, Defaults.SWIPE_THRESHOLD],
        [0, 1, 0]
    )

    const animationDir = PositionAnimationDirection[position]

    const handleDragEnd = (_: unknown, info: PanInfo) => {
        if (!swipeEnabled) return

        const threshold = Defaults.SWIPE_THRESHOLD
        const velocity = isHorizontalSwipe ? info.velocity.x : info.velocity.y
        const offset = isHorizontalSwipe ? info.offset.x : info.offset.y

        const shouldDismiss =
            Math.abs(offset) > threshold ||
            Math.abs(velocity) > 500 ||
            (position.includes('left') && offset < -threshold / 2) ||
            (position.includes('right') && offset > threshold / 2) ||
            (position === NotifyPosition.TOP && offset < -threshold / 2) ||
            (position === NotifyPosition.BOTTOM && offset > threshold / 2)

        if (shouldDismiss) {
            dismiss(id, DismissReason.SWIPE)
        }
    }

    const handleMouseEnter = () => {
        if (options.pauseOnHover !== false) {
            pauseAllTimers()
        }
    }

    const handleMouseLeave = () => {
        if (options.pauseOnHover !== false) {
            resumeAllTimers()
        }
    }

    const handleClick = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('button')) return

        if (options.clickToDismiss === true) {
            dismiss(id, DismissReason.CLICK)
        }
    }

    const stackOffset = index * 8

    const borderStyle = theme.borderConfig.enabled
        ? `${theme.borderConfig.width}px ${theme.borderConfig.style} ${theme.borderConfig.color || theme.border}`
        : 'none'

    return (
        <motion.div
            layout='position'
            style={{
                position: 'relative',
                isolation: 'isolate',
                maxWidth: 'calc(100vw - 32px)',
                overflow: 'hidden',
                backgroundColor: theme.background,
                boxShadow: theme.shadow,
                borderRadius: theme.radius,
                border: borderStyle,
                boxSizing: 'border-box',
                x,
                y,
                width,
                height,
                opacity,
                cursor: options.clickToDismiss === true ? 'pointer' : 'default',
                marginBottom: stackOffset > 0 ? 8 : 0,
                willChange: 'transform, opacity, width, height'
            }}
            initial={{
                opacity: 0,
                scale: shouldReduceMotion ? 1 : 0.98,
                ...(shouldReduceMotion ? {} : animationDir.enter)
            }}
            animate={{
                opacity: visible ? 1 : 0,
                scale: visible || shouldReduceMotion ? 1 : 0.98,
                x:
                    visible || shouldReduceMotion
                        ? 0
                        : 'x' in animationDir.exit
                          ? animationDir.exit.x
                          : 0,
                y:
                    visible || shouldReduceMotion
                        ? 0
                        : 'y' in animationDir.exit
                          ? animationDir.exit.y
                          : 0,
                pointerEvents: visible ? 'auto' : 'none'
            }}
            transition={visible ? AnimationConfig.CONTAINER : AnimationConfig.EXIT}
            drag={swipeEnabled ? swipeDirection : false}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.5}
            onDragEnd={handleDragEnd}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            role={isConfirm ? 'alertdialog' : isAssertive ? 'alert' : 'status'}
            aria-live={isAssertive ? 'assertive' : 'polite'}
        >
            <div
                ref={contentRef}
                style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px',
                    position: 'relative',
                    boxSizing: 'border-box',
                    width: `min(${TOAST_WIDTH}px, calc(100vw - 32px))`,
                    padding: `${TOAST_PADDING}px`,
                    paddingRight:
                        isDismissible && !isConfirm
                            ? `${TOAST_PADDING + 28}px`
                            : `${TOAST_PADDING}px`,
                    flexShrink: 0
                }}
            >
                {showIcon && (
                    <div
                        aria-hidden='true'
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            marginTop: '1px'
                        }}
                    >
                        <NotifyIcon state={state} />
                    </div>
                )}

                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1,
                        minWidth: 0
                    }}
                >
                    <AnimatePresence initial={false} mode='wait'>
                        <motion.div
                            key={`${state}:${stateStartedAt}`}
                            initial={{
                                opacity: 0,
                                transform: shouldReduceMotion ? 'translateY(0)' : 'translateY(6px)',
                                filter: shouldReduceMotion ? 'blur(0px)' : 'blur(3px)'
                            }}
                            animate={{
                                opacity: 1,
                                transform: 'translateY(0)',
                                filter: 'blur(0px)'
                            }}
                            exit={{
                                opacity: 0,
                                transform: shouldReduceMotion
                                    ? 'translateY(0)'
                                    : 'translateY(-4px)',
                                filter: shouldReduceMotion ? 'blur(0px)' : 'blur(2px)',
                                transition: { duration: shouldReduceMotion ? 0.1 : 0.14 }
                            }}
                            transition={
                                shouldReduceMotion ? { duration: 0.12 } : AnimationConfig.TEXT
                            }
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '5px',
                                minWidth: 0
                            }}
                        >
                            <span
                                style={{
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    lineHeight: '20px',
                                    overflowWrap: 'break-word',
                                    color: theme.text
                                }}
                            >
                                {message}
                            </span>
                            {options.description != null && (
                                <span
                                    style={{
                                        fontSize: '14px',
                                        fontWeight: 400,
                                        lineHeight: '20px',
                                        overflowWrap: 'break-word',
                                        color: theme.textMuted
                                    }}
                                >
                                    {options.description}
                                </span>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {hasActions && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={AnimationConfig.TEXT}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                marginTop: '16px'
                            }}
                        >
                            {isConfirm && (
                                <motion.button
                                    ref={cancelButtonRef}
                                    type='button'
                                    onClick={() => resolveConfirm(id, false)}
                                    style={{ ...textButtonStyle, color: theme.textSubtle }}
                                    whileHover={{ color: theme.textMuted }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {confirmOptions?.cancelLabel ?? Defaults.LABELS.CANCEL}
                                </motion.button>
                            )}

                            {isConfirm && (
                                <motion.button
                                    type='button'
                                    onClick={() => resolveConfirm(id, true)}
                                    style={{ ...textButtonStyle, color: theme.text }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {confirmOptions?.confirmLabel ?? Defaults.LABELS.CONFIRM}
                                    <ChevronIcon width={20} height={20} />
                                </motion.button>
                            )}

                            {hasAction && !isConfirm && (
                                <motion.button
                                    type='button'
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        options.action?.onClick()
                                    }}
                                    style={{ ...textButtonStyle, color: theme.text }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {options.action?.label}
                                    <ChevronIcon width={20} height={20} />
                                </motion.button>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>

            {isDismissible && !isConfirm && (
                <motion.button
                    type='button'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={AnimationConfig.TEXT}
                    onClick={(e) => {
                        e.stopPropagation()
                        dismiss(id, DismissReason.MANUAL)
                    }}
                    style={{
                        appearance: 'none',
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        margin: 0,
                        cursor: 'pointer',
                        position: 'absolute',
                        top: 6,
                        right: 7,
                        width: CLOSE_BUTTON_SIZE,
                        height: CLOSE_BUTTON_SIZE,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 8,
                        color: theme.textSubtle,
                        zIndex: 2
                    }}
                    whileHover={{ backgroundColor: theme.buttonHover, color: theme.textMuted }}
                    whileTap={{ scale: 0.97 }}
                    aria-label='Dismiss notification'
                >
                    <XIcon width={20} height={20} />
                </motion.button>
            )}
        </motion.div>
    )
}

export const NotificationItem = React.memo(NotificationItemView)
