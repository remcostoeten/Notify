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

const ICON_SIZE = 20
const ICON_BADGE_SIZE = 12

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
    initial: { opacity: 0, scale: 0.5, filter: 'blur(4px)' },
    animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, scale: 0.5, filter: 'blur(4px)' },
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

const CheckIcon = ({ size, color }: { size: number; color: string }) => (
    <svg
        width={size}
        height={size}
        viewBox='0 0 24 24'
        fill='none'
        stroke={color}
        strokeWidth={3}
        strokeLinecap='round'
        strokeLinejoin='round'
    >
        <path d='M20 6L9 17l-5-5' />
    </svg>
)

const XIcon = ({ size, color }: { size: number; color: string }) => (
    <svg
        width={size}
        height={size}
        viewBox='0 0 24 24'
        fill='none'
        stroke={color}
        strokeWidth={3}
        strokeLinecap='round'
        strokeLinejoin='round'
    >
        <path d='M18 6 6 18' />
        <path d='M6 6 18 18' />
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
                    <motion.div
                        key='success'
                        {...iconMotionProps}
                        className='absolute flex items-center justify-center rounded-full'
                        style={{
                            width: ICON_SIZE,
                            height: ICON_SIZE,
                            backgroundColor: iconColors.success.icon
                        }}
                    >
                        {icons?.success ? (
                            renderCustomIcon(icons.success, buildIconProps(state))
                        ) : (
                            <CheckIcon
                                size={ICON_BADGE_SIZE}
                                color={theme.colorMode === 'light' ? '#fff' : '#000'}
                            />
                        )}
                    </motion.div>
                )}

                {state === NotifyStateType.ERROR && (
                    <motion.div
                        key='error'
                        {...iconMotionProps}
                        className='absolute flex items-center justify-center rounded-full'
                        style={{
                            width: ICON_SIZE,
                            height: ICON_SIZE,
                            backgroundColor: iconColors.error.icon
                        }}
                    >
                        {icons?.error ? (
                            renderCustomIcon(icons.error, buildIconProps(state))
                        ) : (
                            <XIcon
                                size={ICON_BADGE_SIZE}
                                color={theme.colorMode === 'light' ? '#fff' : '#000'}
                            />
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
