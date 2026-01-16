/**
 * @fileoverview Animated icon component that transitions between states.
 */

"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Spinner } from "./spinner"
import { NotifyStateType, AnimationConfig, Styles } from "../constants"
import { useNotifyTheme } from "./theme-context"
import type { NotifyState, IconProps } from "../types"
import { isValidElement, type ReactNode, type ComponentType } from "react"
import type { JSX } from "react/jsx-runtime"

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
  initial: { opacity: 0, scale: 0.5, filter: "blur(4px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, scale: 0.5, filter: "blur(4px)" },
  transition: AnimationConfig.ICON,
}

/**
 * Renders a custom icon from config.
 * Handles both ReactNode and ComponentType.
 */
function renderCustomIcon(icon: ComponentType<IconProps> | ReactNode, props: IconProps): ReactNode {
  if (isValidElement(icon)) {
    return icon
  }
  if (typeof icon === "function") {
    const IconComponent = icon as ComponentType<IconProps>
    return <IconComponent {...props} />
  }
  return icon
}

const CheckIcon = ({ size, color }: { size: number; color: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const XIcon = ({ size, color }: { size: number; color: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const InfoIcon = ({ size, color }: { size: number; color: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
)

const AlertIcon = ({ size, color }: { size: number; color: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
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
    size: Styles.ICON_SIZE,
    colorMode: theme.iconColorMode,
    color: getStateColors(s as keyof typeof iconColors)?.icon ?? theme.textMuted,
  })

  // Check for custom render function
  if (icons?.render) {
    return (
      <div
        className="relative flex items-center justify-center"
        style={{ width: Styles.ICON_SIZE, height: Styles.ICON_SIZE }}
      >
        <AnimatePresence mode="wait">
          <motion.div key={state} {...iconMotionProps} className="absolute">
            {icons.render(buildIconProps(state))}
          </motion.div>
        </AnimatePresence>
      </div>
    )
  }

  if (theme.iconColorMode === "hidden") {
    return (
      <div
        className="relative flex items-center justify-center"
        style={{ width: Styles.ICON_SIZE, height: Styles.ICON_SIZE }}
      >
        <AnimatePresence mode="wait">
          {state === NotifyStateType.LOADING && (
            <motion.div key="loading" {...iconMotionProps} className="absolute">
              {icons?.loading ? renderCustomIcon(icons.loading, buildIconProps(state)) : <Spinner />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: Styles.ICON_SIZE, height: Styles.ICON_SIZE }}
    >
      <AnimatePresence mode="wait">
        {state === NotifyStateType.LOADING && (
          <motion.div key="loading" {...iconMotionProps} className="absolute">
            {icons?.loading ? renderCustomIcon(icons.loading, buildIconProps(state)) : <Spinner />}
          </motion.div>
        )}

        {state === NotifyStateType.SUCCESS && (
          <motion.div
            key="success"
            {...iconMotionProps}
            className="absolute rounded-full flex items-center justify-center"
            style={{
              width: Styles.ICON_SIZE,
              height: Styles.ICON_SIZE,
              backgroundColor: iconColors.success.icon,
            }}
          >
            {icons?.success ? (
              renderCustomIcon(icons.success, buildIconProps(state))
            ) : (
              <CheckIcon size={Styles.ICON_BADGE_SIZE} color={theme.colorMode === "light" ? "#fff" : "#000"} />
            )}
          </motion.div>
        )}

        {state === NotifyStateType.ERROR && (
          <motion.div
            key="error"
            {...iconMotionProps}
            className="absolute rounded-full flex items-center justify-center"
            style={{
              width: Styles.ICON_SIZE,
              height: Styles.ICON_SIZE,
              backgroundColor: iconColors.error.icon,
            }}
          >
            {icons?.error ? (
              renderCustomIcon(icons.error, buildIconProps(state))
            ) : (
              <XIcon size={Styles.ICON_BADGE_SIZE} color={theme.colorMode === "light" ? "#fff" : "#000"} />
            )}
          </motion.div>
        )}

        {state === NotifyStateType.INFO && (
          <motion.div key="info" {...iconMotionProps} className="absolute">
            {icons?.info ? (
              renderCustomIcon(icons.info, buildIconProps(state))
            ) : (
              <InfoIcon size={Styles.ICON_SIZE} color={theme.textMuted} />
            )}
          </motion.div>
        )}

        {state === NotifyStateType.CONFIRM && (
          <motion.div key="confirm" {...iconMotionProps} className="absolute">
            {icons?.confirm ? (
              renderCustomIcon(icons.confirm, buildIconProps(state))
            ) : (
              <AlertIcon size={Styles.ICON_SIZE} color={iconColors.confirm.icon} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
