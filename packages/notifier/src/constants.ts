/**
 * @fileoverview Constants and configuration values for the notify module.
 * All magic strings and default values are centralized here.
 */

/**
 * Enumeration of all possible notification states.
 * Used to determine icon display and behavior.
 * @constant
 */
export const NotifyStateType = {
  /** Initial state, no notification visible */
  IDLE: "idle",
  /** Loading state with spinner */
  LOADING: "loading",
  /** Success state with checkmark */
  SUCCESS: "success",
  /** Error state with X icon */
  ERROR: "error",
  /** Info state with info icon */
  INFO: "info",
  /** Confirm state with confirm/cancel buttons */
  CONFIRM: "confirm",
} as const

/**
 * Enumeration of all available notification positions.
 * @constant
 */
export const NotifyPosition = {
  /** Top center of viewport */
  TOP: "top",
  /** Top center of viewport (alias) */
  TOP_CENTER: "top-center",
  /** Top left corner of viewport */
  TOP_LEFT: "top-left",
  /** Top right corner of viewport */
  TOP_RIGHT: "top-right",
  /** Bottom center of viewport */
  BOTTOM: "bottom",
  /** Bottom center of viewport (alias) */
  BOTTOM_CENTER: "bottom-center",
  /** Bottom left corner of viewport */
  BOTTOM_LEFT: "bottom-left",
  /** Bottom right corner of viewport */
  BOTTOM_RIGHT: "bottom-right",
} as const

/**
 * Enumeration of reasons a notification was dismissed.
 * Passed to the onDismiss callback.
 * @constant
 */
export const DismissReason = {
  /** Auto-dismissed after timeout */
  TIMEOUT: "timeout",
  /** User swiped to dismiss */
  SWIPE: "swipe",
  /** User clicked to dismiss */
  CLICK: "click",
  /** Programmatically dismissed via API */
  MANUAL: "manual",
  /** Replaced by a new notification (when limit reached) */
  REPLACED: "replaced",
} as const

/**
 * Default configuration values for notifications.
 * @constant
 */
export const Defaults = {
  /** Default auto-dismiss duration in milliseconds */
  DURATION_MS: 3000,
  /** Default position for notifications */
  POSITION: NotifyPosition.BOTTOM,
  /** Maximum number of visible notifications */
  MAX_VISIBLE: 5,
  /** Swipe threshold in pixels to trigger dismiss */
  SWIPE_THRESHOLD: 100,
  /** Default messages for each state */
  MESSAGES: {
    LOADING: "Loading...",
    SUCCESS: "Success",
    ERROR: "Error",
  },
  /** Default button labels */
  LABELS: {
    CONFIRM: "Confirm",
    CANCEL: "Cancel",
  },
} as const

/**
 * Spring animation configuration for container transitions.
 * @constant
 */
export const AnimationConfig = {
  /** Main container spring animation - tuned for smooth entry without overshoot */
  CONTAINER: {
    type: "spring" as const,
    stiffness: 300,
    damping: 30,
    mass: 0.5,
  },
  /** Icon transition spring animation */
  ICON: {
    type: "spring" as const,
    stiffness: 500,
    damping: 30,
  },
  /** Text transition duration */
  TEXT: {
    duration: 0.15,
    ease: [0.25, 0.1, 0.25, 1],
  },
  /** Swipe gesture animation */
  SWIPE: {
    type: "spring" as const,
    stiffness: 300,
    damping: 25,
  },
} as const

/**
 * Border radius values for each variant.
 * @constant
 */
export const RadiusValues = {
  pill: "9999px",
  rounded: "12px",
  squared: "4px",
} as const

/**
 * Theme color palettes.
 * @constant
 */
export const ThemeColors = {
  dark: {
    background: "#131316",
    text: "#ffffff",
    textMuted: "rgba(255, 255, 255, 0.6)",
    textSubtle: "rgba(255, 255, 255, 0.4)",
    border: "rgba(255, 255, 255, 0.1)",
    borderHighlight: "rgba(255, 255, 255, 0.2)",
    buttonHover: "rgba(255, 255, 255, 0.05)",
    shadow:
      "0px 32px 64px -16px rgba(0,0,0,0.30), 0px 16px 32px -8px rgba(0,0,0,0.30), 0px 8px 16px -4px rgba(0,0,0,0.24), 0px 4px 8px -2px rgba(0,0,0,0.24), 0px -8px 16px -1px rgba(0,0,0,0.16), 0px 2px 4px -1px rgba(0,0,0,0.24), 0px 0px 0px 1px rgba(0,0,0,1.00), inset 0px 0px 0px 1px rgba(255,255,255,0.08), inset 0px 1px 0px 0px rgba(255,255,255,0.20)",
  },
  light: {
    background: "#fafaf8",
    text: "#0a0a0b",
    textMuted: "rgba(10, 10, 11, 0.7)",
    textSubtle: "rgba(10, 10, 11, 0.5)",
    border: "rgba(10, 10, 11, 0.1)",
    borderHighlight: "rgba(10, 10, 11, 0.2)",
    buttonHover: "rgba(10, 10, 11, 0.08)",
    shadow:
      "0px 32px 64px -16px rgba(0,0,0,0.16), 0px 16px 32px -8px rgba(0,0,0,0.14), 0px 8px 16px -4px rgba(0,0,0,0.12), 0px 4px 8px -2px rgba(0,0,0,0.10), 0px 0px 0px 1px rgba(10, 10, 11, 0.10), inset 0px 0px 0px 1px rgba(10, 10, 11, 0.06), inset 0px 1px 0px 0px rgba(255, 255, 255, 0.8)",
  },
} as const

/**
 * Icon colors for each state.
 * @constant
 */
export const IconColors = {
  colored: {
    success: {
      bg: "rgba(120, 160, 131, 0.15)",
      border: "rgba(120, 160, 131, 0.25)",
      icon: "#6b9b7a",
    },
    error: {
      bg: "rgba(180, 110, 110, 0.15)",
      border: "rgba(180, 110, 110, 0.25)",
      icon: "#b07878",
    },
    info: {
      bg: "transparent",
      border: "transparent",
      icon: "#8a9aaa",
    },
    confirm: {
      bg: "rgba(180, 155, 100, 0.15)",
      border: "rgba(180, 155, 100, 0.25)",
      icon: "#b0a070",
    },
    loading: {
      bg: "transparent",
      border: "transparent",
      icon: "#888890",
    },
  },
  neutral: {
    success: {
      bg: "rgba(140, 140, 150, 0.12)",
      border: "rgba(140, 140, 150, 0.2)",
      icon: "#909098",
    },
    error: {
      bg: "rgba(140, 140, 150, 0.12)",
      border: "rgba(140, 140, 150, 0.2)",
      icon: "#909098",
    },
    info: {
      bg: "transparent",
      border: "transparent",
      icon: "#909098",
    },
    confirm: {
      bg: "rgba(140, 140, 150, 0.12)",
      border: "rgba(140, 140, 150, 0.2)",
      icon: "#909098",
    },
    loading: {
      bg: "transparent",
      border: "transparent",
      icon: "#909098",
    },
  },
} as const



/**
 * CSS position styles for each notification position.
 * @constant
 */

export const PositionStyles = {
  [NotifyPosition.TOP]: {
    top: 24,
    left: "50%",
    right: "auto",
    bottom: "auto",
    transform: "translateX(-50%)",
  },
  [NotifyPosition.TOP_CENTER]: {
    top: 24,
    left: "50%",
    right: "auto",
    bottom: "auto",
    transform: "translateX(-50%)",
  },
  [NotifyPosition.TOP_LEFT]: {
    top: 24,
    left: 24,
    right: "auto",
    bottom: "auto",
    transform: "none",
  },
  [NotifyPosition.TOP_RIGHT]: {
    top: 24,
    left: "auto",
    right: 24,
    bottom: "auto",
    transform: "none",
  },
  [NotifyPosition.BOTTOM]: {
    top: "auto",
    left: "50%",
    right: "auto",
    bottom: 24,
    transform: "translateX(-50%)",
  },
  [NotifyPosition.BOTTOM_CENTER]: {
    top: "auto",
    left: "50%",
    right: "auto",
    bottom: 24,
    transform: "translateX(-50%)",
  },
  [NotifyPosition.BOTTOM_LEFT]: {
    top: "auto",
    left: 24,
    right: "auto",
    bottom: 24,
    transform: "none",
  },
  [NotifyPosition.BOTTOM_RIGHT]: {
    top: "auto",
    left: "auto",
    right: 24,
    bottom: 24,
    transform: "none",
  },
} as const

export const PositionAnimationDirection = {
  [NotifyPosition.TOP]: { enter: { y: -24 }, exit: { y: -24 } },
  [NotifyPosition.TOP_CENTER]: { enter: { y: -24 }, exit: { y: -24 } },
  [NotifyPosition.TOP_LEFT]: { enter: { x: -24 }, exit: { x: -24 } },
  [NotifyPosition.TOP_RIGHT]: { enter: { x: 24 }, exit: { x: 24 } },
  [NotifyPosition.BOTTOM]: { enter: { y: 24 }, exit: { y: 24 } },
  [NotifyPosition.BOTTOM_CENTER]: { enter: { y: 24 }, exit: { y: 24 } },
  [NotifyPosition.BOTTOM_LEFT]: { enter: { x: -24 }, exit: { x: -24 } },
  [NotifyPosition.BOTTOM_RIGHT]: { enter: { x: 24 }, exit: { x: 24 } },
} as const

export const PositionSwipeDirection = {
  [NotifyPosition.TOP]: "y" as const,
  [NotifyPosition.TOP_CENTER]: "y" as const,
  [NotifyPosition.TOP_LEFT]: "x" as const,
  [NotifyPosition.TOP_RIGHT]: "x" as const,
  [NotifyPosition.BOTTOM]: "y" as const,
  [NotifyPosition.BOTTOM_CENTER]: "y" as const,
  [NotifyPosition.BOTTOM_LEFT]: "x" as const,
  [NotifyPosition.BOTTOM_RIGHT]: "x" as const,
} as const
