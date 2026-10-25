import type { IconShape, ToastStatus } from './types'

export const Easings = {
    out: 'cubic-bezier(0.22, 1, 0.36, 1)',
    inout: 'cubic-bezier(0.65, 0, 0.35, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
} as const

export type Easing = keyof typeof Easings

export type Pose = {
    x?: number
    y?: number
    rotate?: number
    scale?: number
    scaleX?: number
    scaleY?: number
    opacity?: number
}

export type Frame = Pose & {
    at: number
    ease?: Easing
}

export type Track = {
    parts: readonly string[]
    duration: number
    delay?: number
    ease: Easing
    origin?: readonly [number, number]
    reveal?: boolean
    symmetry?: number
    frames: readonly Frame[]
}

export type Motion = readonly Track[]

export const OPEN_DELAY_MS = 120

function pop(part: string, origin: readonly [number, number], delay: number): Track {
    return {
        parts: [part],
        duration: 400,
        delay,
        ease: 'out',
        origin,
        frames: [
            { at: 0 },
            { at: 0.22, scale: 0.78, rotate: -12 },
            { at: 0.55, scale: 1.12 },
            { at: 1 }
        ]
    }
}

function breathe(part: string): Track {
    return {
        parts: [part],
        duration: 360,
        ease: 'out',
        origin: [12, 12],
        frames: [{ at: 0 }, { at: 0.25, scale: 0.9 }, { at: 0.6, scale: 1.04 }, { at: 1 }]
    }
}

function turn(part: string): Track {
    return {
        parts: [part],
        duration: 340,
        ease: 'out',
        origin: [12, 12],
        symmetry: 90,
        frames: [{ at: 0 }, { at: 0.4, rotate: 60, scale: 0.8 }, { at: 1, rotate: 90 }]
    }
}

function bounce(dot: number): Track {
    return {
        parts: ['dot'],
        duration: 420,
        ease: 'out',
        origin: [12, dot],
        frames: [
            { at: 0 },
            { at: 0.22, y: -2.2 },
            { at: 0.45, y: 0, ease: 'inout' },
            { at: 0.65, y: -1 },
            { at: 0.85, y: 0, ease: 'inout' },
            { at: 1 }
        ]
    }
}

const warning: Motion = [
    {
        parts: ['sign'],
        duration: 480,
        ease: 'inout',
        origin: [12, 21],
        frames: [
            { at: 0 },
            { at: 0.18, rotate: 8 },
            { at: 0.4, rotate: -6 },
            { at: 0.6, rotate: 3.5 },
            { at: 0.8, rotate: -1.5 },
            { at: 1 }
        ]
    },
    {
        parts: ['bang'],
        duration: 360,
        delay: 80,
        ease: 'out',
        origin: [12, 13],
        frames: [{ at: 0 }, { at: 0.3, y: -1.2, scaleY: 1.08 }, { at: 0.65, y: 0.3 }, { at: 1 }]
    }
]

/**
 * @name glyphMotions
 * @description One-shot motions for the built-in glyphs, as poses on the named
 * parts each glyph draws. Origins are in units of the 24-unit view box. Every
 * track starts and ends on the resting drawing, or on a rotation the part is
 * symmetric under.
 *
 * @example
 * glyphMotions.success[1].parts // ['tick']
 */
export const glyphMotions = {
    success: [breathe('circle'), pop('tick', [10.5, 15], 60)],
    successMark: [pop('tick', [10, 17], 60)],
    error: [turn('cross')],
    errorMark: [turn('cross')],
    warning,
    info: [breathe('circle'), bounce(8)],
    infoMark: [bounce(7)],
    close: [
        {
            parts: ['cross'],
            duration: 260,
            ease: 'out',
            origin: [12, 12],
            symmetry: 90,
            frames: [{ at: 0 }, { at: 0.45, rotate: 70, scale: 0.84 }, { at: 1, rotate: 90 }]
        }
    ]
} as const satisfies Record<string, Motion>

export type GlyphMotion = keyof typeof glyphMotions

const halo: Track = {
    parts: ['halo'],
    duration: 440,
    delay: 100,
    ease: 'out',
    reveal: true,
    frames: [
        { at: 0, opacity: 0 },
        { at: 0.18, scale: 1.08 },
        { at: 1, scale: 1.55, opacity: 0 }
    ]
}

/**
 * @name shapeMotions
 * @description One-shot motions for the icon container of each shape, in CSS
 * pixels about the center of each part. The halo only exists while it plays:
 * a ripple around the circle and a shockwave through the rings.
 *
 * @example
 * shapeMotions.ring.map((track) => track.parts[0]) // ['halo', 'ringInner', 'ringOuter']
 */
export const shapeMotions = {
    circle: [
        {
            parts: ['frame'],
            duration: 360,
            ease: 'out',
            frames: [{ at: 0 }, { at: 0.22, scale: 0.9 }, { at: 0.55, scale: 1.05 }, { at: 1 }]
        },
        halo
    ],
    ring: [
        {
            parts: ['halo'],
            duration: 480,
            ease: 'out',
            reveal: true,
            frames: [
                { at: 0, opacity: 0 },
                { at: 0.12, scale: 1.1 },
                { at: 1, scale: 2.5, opacity: 0 }
            ]
        },
        {
            parts: ['ringInner'],
            duration: 400,
            delay: 90,
            ease: 'spring',
            frames: [{ at: 0 }, { at: 0.3, scale: 1.2 }, { at: 1 }]
        },
        {
            parts: ['ringOuter'],
            duration: 400,
            delay: 180,
            ease: 'spring',
            frames: [{ at: 0 }, { at: 0.3, scale: 1.16 }, { at: 1 }]
        }
    ],
    box: [
        {
            parts: ['frame'],
            duration: 360,
            ease: 'out',
            frames: [
                { at: 0 },
                { at: 0.25, y: 1, scale: 0.95 },
                { at: 0.6, y: -1.2, scale: 1.02 },
                { at: 1 }
            ]
        }
    ],
    bare: []
} as const satisfies Record<IconShape, Motion>

const statusGlyphMotions: Record<ToastStatus, GlyphMotion | null> = {
    success: 'success',
    error: 'error',
    warning: 'warning',
    info: 'info',
    loading: null
}

const statusMarkMotions: Record<ToastStatus, GlyphMotion | null> = {
    success: 'successMark',
    error: 'errorMark',
    warning: 'warning',
    info: 'infoMark',
    loading: null
}

type IconMotionInput = {
    shape: IconShape
    status: ToastStatus | undefined
    builtIn: boolean
}

/**
 * @name iconMotion
 * @description The tracks an icon plays when it is first seen, when its status
 * changes and when its toast is hovered: the container motion of its shape,
 * plus the glyph motion when the icon draws a built-in status glyph. A loading
 * icon keeps its spinner and skips the halo.
 *
 * @example
 * iconMotion({ shape: 'circle', status: 'success', builtIn: true })
 */
export function iconMotion({ shape, status, builtIn }: IconMotionInput): Motion {
    const container: Motion = shapeMotions[shape]
    const settled =
        status === 'loading'
            ? container.filter((track) => !track.parts.includes('halo'))
            : container
    if (!builtIn || status === undefined) return settled
    const glyph = (shape === 'circle' ? statusMarkMotions : statusGlyphMotions)[status]
    return glyph === null ? settled : [...settled, ...glyphMotions[glyph]]
}

/**
 * @name poseTransform
 * @description Writes a pose as a CSS transform in the order the motion data is
 * designed in: translate, rotate, scale.
 *
 * @example
 * poseTransform({ y: -1.2, scale: 1.02 }) // 'translate(0px, -1.2px) rotate(0deg) scale(1.02, 1.02)'
 */
export function poseTransform({ x = 0, y = 0, rotate = 0, scale = 1, scaleX, scaleY }: Pose) {
    return `translate(${x}px, ${y}px) rotate(${rotate}deg) scale(${scaleX ?? scale}, ${scaleY ?? scale})`
}

/**
 * @name trackKeyframes
 * @description Turns a track into Web Animations keyframes. A track with an
 * origin is placed in view box units, a revealed track is visible for as long
 * as it plays, and opacity is only animated when a frame sets it.
 *
 * @example
 * part.animate(trackKeyframes(track), { duration: track.duration, fill: 'both' })
 */
export function trackKeyframes(track: Track): Keyframe[] {
    const fades = track.frames.some((frame) => frame.opacity !== undefined)
    return track.frames.map((frame) => {
        const keyframe: Keyframe = {
            offset: frame.at,
            easing: Easings[frame.ease ?? track.ease],
            transform: poseTransform(frame)
        }
        if (track.origin) {
            keyframe.transformBox = 'view-box'
            keyframe.transformOrigin = `${track.origin[0]}px ${track.origin[1]}px`
        }
        if (fades) keyframe.opacity = frame.opacity ?? 1
        if (track.reveal) keyframe.visibility = 'visible'
        return keyframe
    })
}
