export const Defaults = {
    POSITION: 'bottom-right',
    TONE: 'light',
    DURATION_MS: 5000,
    MAX_VISIBLE: 3,
    GAP: 12,
    OFFSET: 24,
    SWIPE_THRESHOLD: 100,
    HOTKEY: 'alt+t',
    EXIT_MS: 300,
    ACTION_SUCCESS_MS: 900,
    ACTION_ERROR_MS: 1600,
    REGION_LABEL: 'Notifications',
    CLOSE_LABEL: 'Close'
} as const

export const AnimationConfig = {
    ENTER: {
        duration: 0.28,
        ease: [0.23, 1, 0.32, 1] as [number, number, number, number]
    },
    EXIT: {
        duration: 0.14,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number]
    },
    PRESS: {
        duration: 0.16,
        ease: [0.23, 1, 0.32, 1] as [number, number, number, number]
    },
    REFLOW: {
        type: 'spring' as const,
        duration: 0.38,
        bounce: 0
    },
    STACK_REVEAL: {
        type: 'tween' as const,
        duration: 0.36,
        ease: [0.32, 0.72, 0, 1] as [number, number, number, number]
    },
    STACK_SETTLE: {
        type: 'tween' as const,
        duration: 0.28,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number]
    },
    STACK_EXIT: {
        default: {
            type: 'tween' as const,
            duration: 0.28,
            ease: [0.32, 0.72, 0, 1] as [number, number, number, number]
        },
        opacity: {
            type: 'tween' as const,
            duration: 0.22,
            ease: [0.3, 0, 0.2, 1] as [number, number, number, number]
        }
    }
} as const

export const ResizeConfig = {
    DURATION_MS: 240,
    EASING: 'cubic-bezier(.23,1,.32,1)'
} as const

export const EntryConfig = {
    SCALE: 0.96,
    DRAG_SCALE: 0.985
} as const

export const StackConfig = {
    PEEK: 8,
    SCALE_STEP: 0.05,
    TILT_STEP: 1.1,
    TILT_MAX: 3,
    SHADE_STEP: 0.04,
    SOLID_DEPTH: 2,
    OPACITY_STEP: 0.35,
    CLIP_BLEED: 48,
    ENTER_TRAVEL: 48,
    ENTER_SCALE: 0.85,
    EXIT_TRAVEL: 24,
    EXIT_SCALE: 0.8,
    COLLAPSE_DELAY_MS: 60,
    REVEAL_STAGGER: 0.024,
    REVEAL_STAGGER_MAX: 4
} as const
