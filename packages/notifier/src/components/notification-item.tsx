/**
 * @fileoverview Individual notification item with swipe, hover, and click behaviors.
 */

'use client'

import * as React from 'react'
import {
    AnimatePresence,
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

const XIcon = (props: React.SVGProps<any>) => (
    <svg
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
        {...props}
    >
        <path d='M18 6 6 18' />
        <path d='m6 6 12 12' />
    </svg>
)

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
export function NotificationItem({ item, position, index }: Props): JSX.Element {
    const { id, state, message, visible, options, stateStartedAt } = item
    const theme = useNotifyTheme()
    const shouldReduceMotion = useReducedMotion()

    const hasAction = !!options.action
    const isDismissible = options.dismissible === true
    const isConfirm = state === NotifyStateType.CONFIRM
    const confirmOptions = options.confirm
    const isAssertive = state === NotifyStateType.ERROR || state === NotifyStateType.WARNING
    const visualState = state === NotifyStateType.IDLE ? NotifyStateType.INFO : state
    const stateColors = theme.iconColors[visualState as keyof typeof theme.iconColors]
    const showIcon = !(theme.iconColorMode === 'hidden' && item.state !== NotifyStateType.LOADING)

    const cancelButtonRef = React.useRef<HTMLButtonElement>(null)
    const contentRef = React.useRef<HTMLDivElement>(null)
    const [size, setSize] = React.useState<{ width: number; height: number } | null>(null)

    React.useLayoutEffect(() => {
        const maybeNode = contentRef.current
        if (!maybeNode) return
        const node: HTMLDivElement = maybeNode

        function measure() {
            setSize({ width: node.offsetWidth, height: node.offsetHeight })
        }

        measure()
        if (typeof ResizeObserver === 'undefined') return
        const observer = new ResizeObserver(() => measure())
        observer.observe(node)
        return () => observer.disconnect()
    }, [])

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

    // Calculate opacity based on swipe distance
    const swipeValue = isHorizontalSwipe ? x : y
    const opacity = useTransform(
        swipeValue,
        [-Defaults.SWIPE_THRESHOLD, 0, Defaults.SWIPE_THRESHOLD],
        [0, 1, 0]
    )

    // Animation direction based on position
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

    // Stack offset for multiple notifications
    const stackOffset = index * 8

    // Build border style
    const borderStyle = theme.borderConfig.enabled
        ? `${theme.borderConfig.width}px ${theme.borderConfig.style} ${theme.borderConfig.color || theme.border}`
        : 'none'

    return (
        <motion.div
            layout='position'
            className='flex items-center overflow-hidden'
            style={{
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                isolation: 'isolate',
                maxWidth: 'calc(100vw - 32px)',
                overflow: 'hidden',
                backgroundColor: theme.background,
                boxShadow: theme.shadow,
                borderRadius: theme.radius,
                border: borderStyle,
                x,
                y,
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
                ...(size ? { width: size.width, height: size.height } : {}),
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
            transition={
                visible
                    ? {
                          ...AnimationConfig.CONTAINER,
                          width: AnimationConfig.RESIZE,
                          height: AnimationConfig.RESIZE
                      }
                    : AnimationConfig.EXIT
            }
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
                    alignItems: 'center',
                    position: 'relative',
                    zIndex: 1,
                    width: 'max-content',
                    maxWidth: 'min(360px, calc(100vw - 32px))',
                    flexShrink: 0
                }}
            >
                {/* Main content area */}
                <div
                    className='flex items-center'
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        minHeight: '40px',
                        paddingTop: '8px',
                        paddingBottom: '8px',
                        paddingLeft: '14px',
                        paddingRight: hasAction || isDismissible || isConfirm ? '0' : '14px'
                    }}
                >
                    {showIcon && (
                        <motion.div
                            aria-hidden='true'
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 28,
                                height: 28,
                                flexShrink: 0,
                                borderRadius: '9px',
                                color: stateColors.icon,
                                backgroundColor: theme.buttonHover
                            }}
                            animate={{
                                color: stateColors.icon
                            }}
                            transition={AnimationConfig.TEXT}
                        >
                            <NotifyIcon state={state} />
                        </motion.div>
                    )}

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
                                gap: '2px',
                                minWidth: 0
                            }}
                        >
                            <span
                                style={{
                                    fontSize: '13px',
                                    fontWeight: 550,
                                    lineHeight: 1.4,
                                    letterSpacing: '-0.01em',
                                    overflowWrap: 'break-word',
                                    color: theme.text
                                }}
                            >
                                {message}
                            </span>
                            {options.description != null && (
                                <span
                                    style={{
                                        fontSize: '12px',
                                        fontWeight: 400,
                                        lineHeight: 1.4,
                                        overflowWrap: 'break-word',
                                        color: theme.textMuted
                                    }}
                                >
                                    {options.description}
                                </span>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Confirm buttons */}
                {isConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={AnimationConfig.TEXT}
                        className='mr-1 flex h-10 items-center gap-0.5'
                    >
                        <motion.button
                            ref={cancelButtonRef}
                            onClick={() => resolveConfirm(id, false)}
                            className='h-8 whitespace-nowrap rounded-lg px-2.5 text-[13px] font-medium transition-colors'
                            style={{ color: theme.textMuted }}
                            whileHover={{ backgroundColor: theme.buttonHover, color: theme.text }}
                            whileTap={{ scale: 0.97 }}
                        >
                            {confirmOptions?.cancelLabel ?? Defaults.LABELS.CANCEL}
                        </motion.button>
                        <motion.button
                            onClick={() => resolveConfirm(id, true)}
                            className='h-8 whitespace-nowrap rounded-lg px-2.5 text-[13px] font-medium transition-colors'
                            style={{
                                color: theme.text,
                                backgroundColor: theme.buttonHover,
                                boxShadow: `inset 0 0 0 1px ${theme.border}`
                            }}
                            whileHover={{ boxShadow: `inset 0 0 0 1px ${theme.borderHighlight}` }}
                            whileTap={{ scale: 0.97 }}
                        >
                            {confirmOptions?.confirmLabel ?? Defaults.LABELS.CONFIRM}
                        </motion.button>
                    </motion.div>
                )}

                {/* Action button */}
                {hasAction && !isConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={AnimationConfig.TEXT}
                        className='mr-1 flex h-10 items-center'
                    >
                        <motion.button
                            onClick={(e) => {
                                e.stopPropagation()
                                options.action?.onClick()
                            }}
                            className='h-8 whitespace-nowrap rounded-lg px-2.5 text-[13px] font-medium transition-colors'
                            style={{
                                color: theme.text,
                                backgroundColor: theme.buttonHover,
                                boxShadow: `inset 0 0 0 1px ${theme.border}`
                            }}
                            whileHover={{
                                backgroundColor: theme.buttonHover,
                                boxShadow: `inset 0 0 0 1px ${theme.borderHighlight}`
                            }}
                            whileTap={{ scale: 0.97 }}
                        >
                            {options.action?.label}
                        </motion.button>
                    </motion.div>
                )}

                {/* Dismiss button */}
                {isDismissible && !isConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={AnimationConfig.TEXT}
                        className='mr-1 flex h-10 items-center'
                    >
                        <motion.button
                            onClick={(e) => {
                                e.stopPropagation()
                                dismiss(id, DismissReason.MANUAL)
                            }}
                            className='flex h-8 w-8 items-center justify-center rounded-lg transition-colors'
                            style={{ color: theme.textSubtle }}
                            whileHover={{
                                backgroundColor: theme.buttonHover,
                                color: theme.textMuted
                            }}
                            whileTap={{ scale: 0.97 }}
                            aria-label='Dismiss notification'
                        >
                            <XIcon className='h-4 w-4' />
                        </motion.button>
                    </motion.div>
                )}
            </div>
        </motion.div>
    )
}
