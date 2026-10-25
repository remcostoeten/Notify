import { describe, it, expect, afterEach, vi } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { ReactElement } from 'react'
import { glyphMotions, iconMotion, shapeMotions, trackKeyframes } from '../glyph-motion'
import type { GlyphMotion, Motion, Track } from '../glyph-motion'
import {
    AlertGlyph,
    CheckCircleGlyph,
    CheckMark,
    CloseGlyph,
    CrossMark,
    InfoGlyph,
    InfoMark,
    XCircleGlyph
} from '../components/glyphs'
import { Icon } from '../components/parts'
import { playMotion } from '../components/play-motion'
import type { IconShape } from '../types'

afterEach(() => {
    cleanup()
})

const glyphs: [GlyphMotion, () => ReactElement][] = [
    ['success', CheckCircleGlyph],
    ['successMark', CheckMark],
    ['error', XCircleGlyph],
    ['errorMark', CrossMark],
    ['warning', AlertGlyph],
    ['info', InfoGlyph],
    ['infoMark', InfoMark],
    ['close', CloseGlyph]
]

const shapes: IconShape[] = ['circle', 'ring', 'box', 'bare']

function partsIn(markup: string): string[] {
    return [...markup.matchAll(/data-ntf-part="([^"]+)"/g)].map((match) => match[1] ?? '')
}

function isIdentity({
    x = 0,
    y = 0,
    rotate = 0,
    scale = 1,
    scaleX,
    scaleY,
    opacity = 1
}: Track['frames'][number]) {
    return (
        x === 0 &&
        y === 0 &&
        rotate === 0 &&
        (scaleX ?? scale) === 1 &&
        (scaleY ?? scale) === 1 &&
        opacity === 1
    )
}

function everyTrack(): [string, Track][] {
    const motions: [string, Motion][] = [
        ...Object.entries(glyphMotions),
        ...Object.entries(shapeMotions).map(([shape, motion]): [string, Motion] => [
            `shape ${shape}`,
            motion
        ])
    ]
    return motions.flatMap(([name, motion]) =>
        motion.map((track): [string, Track] => [name, track])
    )
}

describe('glyph motion data', () => {
    it('runs every track from offset 0 to 1 in ascending order', () => {
        for (const [name, track] of everyTrack()) {
            const offsets = track.frames.map((frame) => frame.at)
            expect(offsets[0], name).toBe(0)
            expect(offsets[offsets.length - 1], name).toBe(1)
            expect(
                [...offsets].sort((a, b) => a - b),
                name
            ).toEqual(offsets)
        }
    })

    it('starts every visible part at rest and ends it at rest or on a symmetry', () => {
        for (const [name, track] of everyTrack()) {
            if (track.reveal) continue
            const first = track.frames[0]
            const last = track.frames[track.frames.length - 1]
            expect(first && isIdentity(first), name).toBe(true)
            if (track.symmetry) {
                expect(last && (last.rotate ?? 0) % track.symmetry, name).toBe(0)
                expect(last && isIdentity({ ...last, rotate: 0 }), name).toBe(true)
            } else {
                expect(last && isIdentity(last), name).toBe(true)
            }
        }
    })

    it('only animates parts the glyph draws', () => {
        expect(glyphs.map(([name]) => name).sort()).toEqual(Object.keys(glyphMotions).sort())
        for (const [name, Glyph] of glyphs) {
            const drawn = partsIn(renderToStaticMarkup(<Glyph />))
            const animated = glyphMotions[name].flatMap((track: Track) => track.parts)
            for (const part of animated) expect(drawn, `${name} draws ${part}`).toContain(part)
        }
    })

    it('only animates parts the icon container draws', () => {
        for (const shape of shapes) {
            const drawn = partsIn(renderToStaticMarkup(<Icon shape={shape} status='success' />))
            const animated = shapeMotions[shape].flatMap((track) => track.parts)
            for (const part of animated) expect(drawn, `${shape} draws ${part}`).toContain(part)
        }
    })
})

describe('iconMotion', () => {
    it('plays the plain mark in a circle and the full glyph elsewhere', () => {
        const circle = iconMotion({ shape: 'circle', status: 'success', builtIn: true })
        const ring = iconMotion({ shape: 'ring', status: 'success', builtIn: true })
        expect(circle).toEqual([...shapeMotions.circle, ...glyphMotions.successMark])
        expect(ring).toEqual([...shapeMotions.ring, ...glyphMotions.success])
    })

    it('moves only the container of a custom icon', () => {
        expect(iconMotion({ shape: 'box', status: undefined, builtIn: false })).toEqual(
            shapeMotions.box
        )
        expect(iconMotion({ shape: 'circle', status: 'error', builtIn: false })).toEqual(
            shapeMotions.circle
        )
    })

    it('keeps the spinner and drops the halo while loading', () => {
        const motion = iconMotion({ shape: 'circle', status: 'loading', builtIn: true })
        expect(motion.flatMap((track) => track.parts)).toEqual(['frame'])
    })
})

describe('trackKeyframes', () => {
    it('places a track with an origin in view box units', () => {
        const [keyframe] = trackKeyframes(glyphMotions.successMark[0])
        expect(keyframe?.transformBox).toBe('view-box')
        expect(keyframe?.transformOrigin).toBe('10px 17px')
        expect(keyframe?.opacity).toBeUndefined()
    })

    it('shows a revealed part while it plays and fades it only when asked', () => {
        const halo = shapeMotions.circle[1]
        const keyframes = trackKeyframes(halo)
        expect(keyframes.every((keyframe) => keyframe.visibility === 'visible')).toBe(true)
        expect(keyframes.map((keyframe) => keyframe.opacity)).toEqual([0, 1, 0])
    })
})

describe('playMotion', () => {
    function fakeAnimate() {
        const cancel = vi.fn()
        const animate = vi.fn(() => ({ finished: new Promise(() => undefined), cancel }))
        return { animate, cancel }
    }

    it('animates the matching parts and leaves a live run alone', () => {
        const { container } = render(<Icon shape='circle' status='success' />)
        const root = container.querySelector<HTMLElement>('.ntf-icon')
        if (!root) throw new Error('no icon')
        const { animate, cancel } = fakeAnimate()
        for (const part of [root, ...root.querySelectorAll<HTMLElement>('[data-ntf-part]')]) {
            Object.assign(part, { animate })
        }
        const motion = iconMotion({ shape: 'circle', status: 'success', builtIn: true })
        expect(playMotion(root, motion, { delay: 0, restart: false })).toBe(true)
        expect(animate).toHaveBeenCalledTimes(3)
        expect(playMotion(root, motion, { delay: 0, restart: false })).toBe(false)
        expect(playMotion(root, motion, { delay: 0, restart: true })).toBe(true)
        expect(cancel).toHaveBeenCalledTimes(3)
    })

    it('does nothing without the Web Animations API', () => {
        const { container } = render(<Icon status='success' />)
        const root = container.querySelector<HTMLElement>('.ntf-icon')
        if (!root) throw new Error('no icon')
        expect(playMotion(root, glyphMotions.successMark, { delay: 0, restart: false })).toBe(false)
    })
})
