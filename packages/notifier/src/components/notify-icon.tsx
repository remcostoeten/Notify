/**
 * @fileoverview Animated icon component that transitions between states.
 */

'use client'

import { motion, AnimatePresence } from 'motion/react'
import { Spinner } from './spinner'
import { NotifyStateType, AnimationConfig } from '../constants'
import { useNotifyTheme } from './theme-context'
import type { NotifyState, IconProps } from '../types'
import { isValidElement, type ReactNode, type ComponentType } from 'react'
import type { JSX } from 'react/jsx-runtime'

const ICON_SIZE = 18

/**
 * Props for the NotifyIcon component.
 */
interface NotifyIconProps {
    /** Current notification state */
    state: NotifyState
}

/**
 * Base motion props for icon animations.
 * @internal
 */
const iconMotionProps = {
    initial: { opacity: 0, scale: 0.94, filter: 'blur(2px)' },
    animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
    exit: {
        opacity: 0,
        scale: 0.94,
        filter: 'blur(2px)',
        transition: { duration: 0.12, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] }
    },
    transition: AnimationConfig.ICON
}

/**
 * Renders a custom icon from config.
 * Handles both ReactNode and ComponentType.
 */
function renderCustomIcon(icon: ComponentType<IconProps> | ReactNode, props: IconProps): ReactNode {
    if (isValidElement(icon)) {
        return icon
    }
    if (typeof icon === 'function') {
        const IconComponent = icon as ComponentType<IconProps>
        return <IconComponent {...props} />
    }
    return icon
}

const CircleCheckIcon = ({ size, color }: { size: number; color: string }) => (
    <svg
        width={size}
        height={size}
        viewBox='0 0 24 24'
        fill='none'
        stroke={color}
        strokeWidth={2}
        strokeLinecap='round'
        strokeLinejoin='round'
    >
        <circle cx='12' cy='12' r='10' />
        <path d='m9 12 2 2 4-4' />
    </svg>
)

const CircleXIcon = ({ size, color }: { size: number; color: string }) => (
    <svg
        width={size}
        height={size}
        viewBox='0 0 24 24'
        fill='none'
        stroke={color}
        strokeWidth={2}
        strokeLinecap='round'
        strokeLinejoin='round'
    >
        <circle cx='12' cy='12' r='10' />
        <path d='m15 9-6 6' />
        <path d='m9 9 6 6' />
    </svg>
)

const InfoIcon = ({ size, color }: { size: number; color: string }) => (
    <svg
        width={size}
        height={size}
        viewBox='0 0 24 24'
        fill='none'
        stroke={color}
        strokeWidth={2}
        strokeLinecap='round'
        strokeLinejoin='round'
    >
        <circle cx='12' cy='12' r='10' />
        <path d='M12 16v-4' />
        <path d='M12 8h.01' />
    </svg>
)

const AlertIcon = ({ size, color }: { size: number; color: string }) => (
    <svg
        width={size}
        height={size}
        viewBox='0 0 24 24'
        fill='none'
        stroke={color}
        strokeWidth={2}
        strokeLinecap='round'
        strokeLinejoin='round'
    >
        <path d='m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z' />
        <path d='M12 9v4' />
        <path d='M12 17h.01' />
    </svg>
)

/**
 * Animated icon that morphs between notification states.
 * Uses AnimatePresence for smooth enter/exit transitions.
 * Respects theme configuration for colors and custom icons.
 */
export function NotifyIcon({ state }: NotifyIconProps): JSX.Element {
    const theme = useNotifyTheme()
    const { iconColors, icons } = theme

    // Get colors for current state
    const getStateColors = (s: keyof typeof iconColors) => iconColors[s]

    // Build icon props for custom icons
    const buildIconProps = (s: NotifyState): IconProps => ({
        state: s,
        size: ICON_SIZE,
        colorMode: theme.iconColorMode,
        color: getStateColors(s as keyof typeof iconColors)?.icon ?? theme.textMuted
    })

    // Check for custom render function
    if (icons?.render) {
        return (
            <div
                className='relative flex items-center justify-center'
                style={{ width: ICON_SIZE, height: ICON_SIZE }}
            >
                <AnimatePresence mode='wait'>
                    <motion.div key={state} {...iconMotionProps} className='absolute'>
                        {icons.render(buildIconProps(state))}
                    </motion.div>
                </AnimatePresence>
            </div>
        )
    }

    if (theme.iconColorMode === 'hidden') {
        return (
            <div
                className='relative flex items-center justify-center'
                style={{ width: ICON_SIZE, height: ICON_SIZE }}
            >
                <AnimatePresence mode='wait'>
                    {state === NotifyStateType.LOADING && (
                        <motion.div key='loading' {...iconMotionProps} className='absolute'>
                            {icons?.loading ? (
                                renderCustomIcon(icons.loading, buildIconProps(state))
                            ) : (
                                <Spinner />
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        )
    }

    return (
        <div
            className='relative flex items-center justify-center'
            style={{ width: ICON_SIZE, height: ICON_SIZE }}
        >
            <AnimatePresence mode='wait'>
                {state === NotifyStateType.LOADING && (
                    <motion.div key='loading' {...iconMotionProps} className='absolute'>
                        {icons?.loading ? (
                            renderCustomIcon(icons.loading, buildIconProps(state))
                        ) : (
                            <Spinner />
                        )}
                    </motion.div>
                )}

                {state === NotifyStateType.SUCCESS && (
                    <motion.div key='success' {...iconMotionProps} className='absolute'>
                        {icons?.success ? (
                            renderCustomIcon(icons.success, buildIconProps(state))
                        ) : (
                            <CircleCheckIcon size={ICON_SIZE} color={iconColors.success.icon} />
                        )}
                    </motion.div>
                )}

                {state === NotifyStateType.ERROR && (
                    <motion.div key='error' {...iconMotionProps} className='absolute'>
                        {icons?.error ? (
                            renderCustomIcon(icons.error, buildIconProps(state))
                        ) : (
                            <CircleXIcon size={ICON_SIZE} color={iconColors.error.icon} />
                        )}
                    </motion.div>
                )}

                {state === NotifyStateType.INFO && (
                    <motion.div key='info' {...iconMotionProps} className='absolute'>
                        {icons?.info ? (
                            renderCustomIcon(icons.info, buildIconProps(state))
                        ) : (
                            <InfoIcon size={ICON_SIZE} color={theme.textMuted} />
                        )}
                    </motion.div>
                )}

                {state === NotifyStateType.WARNING && (
                    <motion.div key='warning' {...iconMotionProps} className='absolute'>
                        {icons?.warning ? (
                            renderCustomIcon(icons.warning, buildIconProps(state))
                        ) : (
                            <AlertIcon size={ICON_SIZE} color={iconColors.warning.icon} />
                        )}
                    </motion.div>
                )}

                {state === NotifyStateType.CONFIRM && (
                    <motion.div key='confirm' {...iconMotionProps} className='absolute'>
                        {icons?.confirm ? (
                            renderCustomIcon(icons.confirm, buildIconProps(state))
                        ) : (
                            <AlertIcon size={ICON_SIZE} color={iconColors.confirm.icon} />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
