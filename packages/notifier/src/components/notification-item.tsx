/**
 * @fileoverview Individual notification item with swipe, hover, and click behaviors.
 */

"use client"

import type * as React from "react"
import { X } from "lucide-react"
import { motion, useMotionValue, useTransform, type PanInfo } from "framer-motion"
import { dismiss, resolveConfirm, pauseTimer, resumeTimer } from "../store"
import {
  NotifyStateType,
  AnimationConfig,
  Defaults,
  DismissReason,
  PositionSwipeDirection,
  PositionAnimationDirection,
  NotifyPosition,
} from "../constants"
import { NotifyIcon } from "./notify-icon"
import { useNotifyTheme } from "./theme-context"
import type { NotifyItem, NotifyPositionType } from "../types"
import type { JSX } from "react"

/**
 * Props for the NotificationItem component.
 */
interface NotificationItemProps {
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
export function NotificationItem({ item, position, index }: NotificationItemProps): JSX.Element {
  const { id, state, message, visible, options } = item
  const theme = useNotifyTheme()

  const hasAction = !!options.action
  const isDismissible = options.dismissible === true
  const isConfirm = state === NotifyStateType.CONFIRM
  const confirmOptions = options.confirm

  const swipeEnabled = options.swipeToDismiss !== false
  const swipeDirection = PositionSwipeDirection[position]
  const isHorizontalSwipe = swipeDirection === "x"

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Calculate opacity based on swipe distance
  const swipeValue = isHorizontalSwipe ? x : y
  const opacity = useTransform(swipeValue, [-Defaults.SWIPE_THRESHOLD, 0, Defaults.SWIPE_THRESHOLD], [0, 1, 0])

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
      (position.includes("left") && offset < -threshold / 2) ||
      (position.includes("right") && offset > threshold / 2) ||
      (position === NotifyPosition.TOP && offset < -threshold / 2) ||
      (position === NotifyPosition.BOTTOM && offset > threshold / 2)

    if (shouldDismiss) {
      dismiss(id, DismissReason.SWIPE)
    }
  }

  const handleMouseEnter = () => {
    if (options.pauseOnHover !== false) {
      pauseTimer(id)
    }
  }

  const handleMouseLeave = () => {
    if (options.pauseOnHover !== false) {
      resumeTimer(id)
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return

    if (options.clickToDismiss === true) {
      dismiss(id, DismissReason.CLICK)
    }
  }

  // Stack offset for multiple notifications
  const stackOffset = index * 8

  // Build border style
  const borderStyle = theme.borderConfig.enabled
    ? `${theme.borderConfig.width}px ${theme.borderConfig.style} ${theme.borderConfig.color || theme.border}`
    : "none"

  return (
    <motion.div
      className="flex items-center overflow-hidden"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "auto",
        maxWidth: "calc(100vw - 32px)",
        backgroundColor: theme.background,
        boxShadow: theme.shadow,
        borderRadius: theme.radius,
        border: borderStyle,
        x,
        y,
        cursor: options.clickToDismiss === true ? "pointer" : "default",
        marginBottom: stackOffset > 0 ? 8 : 0,
        willChange: "transform, opacity",
      }}
      initial={{
        opacity: 0,
        scale: 0.95,
        ...animationDir.enter,
      }}
      animate={{
        opacity: visible ? 1 : 0,
        scale: visible ? 1 : 0.95,
        x: visible ? 0 : ("x" in animationDir.exit ? animationDir.exit.x : 0),
        y: visible ? 0 : ("y" in animationDir.exit ? animationDir.exit.y : 0),
        pointerEvents: visible ? "auto" : "none",
      }}
      transition={AnimationConfig.CONTAINER}
      drag={swipeEnabled ? swipeDirection : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.5}
      onDragEnd={handleDragEnd}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      role="alert"
      aria-live="polite"
    >
      {/* Main content area */}
      <motion.div
        className="flex items-center"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          height: "40px",
          paddingLeft: "14px",
          paddingRight: hasAction || isDismissible || isConfirm ? "0" : "14px",
        }}
        transition={AnimationConfig.CONTAINER}
      >
        {!(theme.iconColorMode === "hidden" && item.state !== NotifyStateType.LOADING) && <NotifyIcon state={state} />}

        <motion.span
          key={message}
          initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={AnimationConfig.TEXT}
          style={{
            fontSize: "13px",
            fontWeight: 500,
            lineHeight: 1,
            whiteSpace: "nowrap",
            color: theme.text,
          }}
        >
          {message}
        </motion.span>
      </motion.div>

      {/* Confirm buttons */}
      {isConfirm && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "auto", opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={AnimationConfig.CONTAINER}
          className="overflow-hidden flex items-center h-10"
        >
          <div className="h-4 mx-1" style={{ width: "1px", backgroundColor: theme.border }} />
          <motion.button
            onClick={() => resolveConfirm(id, false)}
            className="h-10 px-3 text-[13px] font-medium whitespace-nowrap transition-colors"
            style={{ color: theme.textMuted }}
            whileHover={{ backgroundColor: theme.buttonHover, color: theme.text }}
            whileTap={{ scale: 0.98 }}
          >
            {confirmOptions?.cancelLabel ?? Defaults.LABELS.CANCEL}
          </motion.button>
          <div className="h-4" style={{ width: "1px", backgroundColor: theme.border }} />
          <motion.button
            onClick={() => resolveConfirm(id, true)}
            className="h-10 px-3 text-[13px] font-medium whitespace-nowrap transition-colors"
            style={{ color: theme.text }}
            whileHover={{ backgroundColor: theme.buttonHover }}
            whileTap={{ scale: 0.98 }}
          >
            {confirmOptions?.confirmLabel ?? Defaults.LABELS.CONFIRM}
          </motion.button>
        </motion.div>
      )}

      {/* Action button */}
      {hasAction && !isConfirm && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "auto", opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={AnimationConfig.CONTAINER}
          className="overflow-hidden flex items-center h-10"
        >
          <div className="h-4 mx-1" style={{ width: "1px", backgroundColor: theme.border }} />
          <motion.button
            onClick={(e) => {
              e.stopPropagation()
              options.action?.onClick()
            }}
            className="h-10 px-3 text-[13px] font-medium whitespace-nowrap transition-colors"
            style={{ color: theme.textMuted }}
            whileHover={{ backgroundColor: theme.buttonHover, color: theme.text }}
            whileTap={{ scale: 0.98 }}
          >
            {options.action?.label}
          </motion.button>
        </motion.div>
      )}

      {/* Dismiss button */}
      {isDismissible && !isConfirm && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "auto", opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={AnimationConfig.CONTAINER}
          className="overflow-hidden flex items-center h-10"
        >
          <div className="h-4 mx-1" style={{ width: "1px", backgroundColor: theme.border }} />
          <motion.button
            onClick={(e) => {
              e.stopPropagation()
              dismiss(id, DismissReason.MANUAL)
            }}
            className="h-10 px-2 transition-colors"
            style={{ color: theme.textSubtle }}
            whileHover={{ backgroundColor: theme.buttonHover, color: theme.textMuted }}
            whileTap={{ scale: 0.98 }}
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  )
}
