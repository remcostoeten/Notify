import { useEffect, useLayoutEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { Easings, OPEN_DELAY_MS, iconMotion, trackKeyframes } from '../glyph-motion'
import type { Motion } from '../glyph-motion'
import type { FlowTrend } from '../number-flow'
import type { IconShape, ToastStatus } from '../types'
import { noop } from '../utils'

const CALM_QUERY = '(prefers-reduced-motion: reduce)'
const HOVER_QUERY = '(hover: hover) and (pointer: fine)'

const live = new WeakMap<Element, Animation[]>()

type PartElement = HTMLElement | SVGElement

function matches(query: string): boolean {
    return 'matchMedia' in window && window.matchMedia(query).matches
}

function stop(root: Element) {
    for (const animation of live.get(root) ?? []) animation.cancel()
    live.delete(root)
}

/**
 * @name playMotion
 * @description Plays a motion once on the parts inside `root` (and on `root`
 * itself when it is a part) with the Web Animations API. Parts stay drawn the
 * whole time and every track ends on the resting pose, so nothing blanks or
 * redraws. A run that is still live is left alone unless `restart` is set.
 * Returns false when nothing played.
 *
 * @example
 * playMotion(button, glyphMotions.close, { delay: 0, restart: false })
 */
export function playMotion(
    root: HTMLElement,
    motion: Motion,
    { delay, restart }: { delay: number; restart: boolean }
): boolean {
    // jsdom and other DOM shims have no Web Animations API
    if (!('animate' in root) || motion.length === 0 || matches(CALM_QUERY)) return false
    if (live.has(root)) {
        if (!restart) return false
        stop(root)
    }
    const parts = [root, ...root.querySelectorAll<PartElement>('[data-ntf-part]')]
    const animations = motion.flatMap((track) => {
        const keyframes = trackKeyframes(track)
        return parts
            .filter((part) => track.parts.includes(part.dataset.ntfPart ?? ''))
            .map((part) =>
                part.animate(keyframes, {
                    duration: track.duration,
                    delay: delay + (track.delay ?? 0),
                    fill: 'both'
                })
            )
    })
    if (animations.length === 0) return false
    live.set(root, animations)
    void Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
        if (live.get(root) === animations) stop(root)
    })
    return true
}

function onFirstSight(element: Element, run: () => void): () => void {
    if (!('IntersectionObserver' in window)) {
        run()
        return noop
    }
    const observer = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        observer.disconnect()
        run()
    })
    observer.observe(element)
    return () => observer.disconnect()
}

function bindHover(host: Element, play: () => void): () => void {
    function enter() {
        if (matches(HOVER_QUERY)) play()
    }
    host.addEventListener('pointerenter', enter)
    return () => host.removeEventListener('pointerenter', enter)
}

function bindIcon(root: HTMLElement, motion: Motion, seen: RefObject<boolean>): () => void {
    const unbind = bindHover(root.closest('.ntf-toast') ?? root, () => {
        if (seen.current) playMotion(root, motion, { delay: 0, restart: false })
    })
    if (seen.current) {
        playMotion(root, motion, { delay: 0, restart: true })
        return unbind
    }
    const release = onFirstSight(root, () => {
        seen.current = true
        playMotion(root, motion, { delay: OPEN_DELAY_MS, restart: true })
    })
    return () => {
        unbind()
        release()
    }
}

type IconMotionOptions = {
    shape: IconShape
    status: ToastStatus | undefined
    builtIn: boolean
}

/**
 * @name useIconMotion
 * @description Plays an icon's motion the first time it is on screen, again
 * right away when its status changes, and on pointer enter of its toast.
 *
 * @example
 * useIconMotion(ref, { shape: 'circle', status: 'success', builtIn: true })
 */
export function useIconMotion(
    ref: RefObject<HTMLElement | null>,
    { shape, status, builtIn }: IconMotionOptions
) {
    const seen = useRef(false)

    useEffect(() => {
        const root = ref.current
        if (!root) return
        return bindIcon(root, iconMotion({ shape, status, builtIn }), seen)
    }, [ref, shape, status, builtIn])
}

/**
 * @name useHoverMotion
 * @description Plays a motion on pointer enter of the element, for hosts such
 * as the close button.
 *
 * @example
 * useHoverMotion(ref, glyphMotions.close)
 */
export function useHoverMotion(ref: RefObject<HTMLElement | null>, motion: Motion) {
    useEffect(() => {
        const host = ref.current
        if (!host) return
        return bindHover(host, () => playMotion(host, motion, { delay: 0, restart: false }))
    }, [ref, motion])
}

const SwapConfig = {
    OUT_MS: 120,
    IN_MS: 200,
    IN_DELAY_MS: 40,
    SCALE: 0.8
} as const

const GLYPH_SELECTOR = ':scope > .ntf-glyph'

/**
 * @name useGlyphSwap
 * @description Crossfades the element matched by `selector` inside `ref` when
 * `key` changes, as when a loading toast settles to success or an action turns
 * from "Send" into "Sent". The outgoing node stays as a ghost that fades and
 * shrinks out while the new one fades in from the same scale, so the change
 * reads as one mark becoming another rather than a redraw. The ghost sits next
 * to the new node, so the parent should stack its children (a grid with one
 * cell does).
 *
 * @example
 * useGlyphSwap(ref, status ?? 'custom')
 * useGlyphSwap(buttonRef, state, ':scope > .ntf-action-label > *')
 */
export function useGlyphSwap(
    ref: RefObject<HTMLElement | null>,
    key: string,
    selector: string = GLYPH_SELECTOR
) {
    const last = useRef<{ key: string; node: Element | null }>({ key, node: null })

    useLayoutEffect(() => {
        const root = ref.current
        const glyph = root?.querySelector<HTMLElement>(selector) ?? null
        const previous = last.current
        last.current = { key, node: glyph }
        if (!root || !glyph || previous.key === key || !previous.node) return
        if (!('animate' in glyph) || matches(CALM_QUERY)) return
        const ghost = previous.node.cloneNode(true) as HTMLElement
        ghost.setAttribute('data-ghost', '')
        glyph.parentElement?.appendChild(ghost)
        const leave = ghost.animate(
            [
                { opacity: 1, transform: 'scale(1)' },
                { opacity: 0, transform: `scale(${SwapConfig.SCALE})` }
            ],
            { duration: SwapConfig.OUT_MS, easing: Easings.out, fill: 'forwards' }
        )
        function remove() {
            ghost.remove()
        }
        leave.finished.then(remove, remove)
        glyph.animate(
            [
                { opacity: 0, transform: `scale(${SwapConfig.SCALE})` },
                { opacity: 1, transform: 'scale(1)' }
            ],
            {
                duration: SwapConfig.IN_MS,
                delay: SwapConfig.IN_DELAY_MS,
                easing: Easings.out,
                fill: 'backwards'
            }
        )
        return remove
    }, [ref, key, selector])
}

const ResizeConfig = {
    DURATION_MS: 220
} as const

/**
 * @name useWidthMotion
 * @description Animates an element between its previous and new width whenever
 * `key` changes, so a button whose label turns from "Send" into "Sending" grows
 * instead of jumping. The element is measured after each commit; the animation
 * runs on the real width, so it stays in layout.
 *
 * @example
 * useWidthMotion(buttonRef, state)
 */
export function useWidthMotion(ref: RefObject<HTMLElement | null>, key: string) {
    const last = useRef<{ key: string; width: number }>({ key, width: 0 })

    useLayoutEffect(() => {
        const host = ref.current
        if (!host) return
        const previous = last.current
        const width = host.offsetWidth
        last.current = { key, width }
        if (previous.key === key || previous.width === 0 || previous.width === width) return
        if (!('animate' in host) || matches(CALM_QUERY)) return
        const animation = host.animate(
            [{ width: `${previous.width}px` }, { width: `${width}px` }],
            {
                duration: ResizeConfig.DURATION_MS,
                easing: Easings.out
            }
        )
        return () => animation.cancel()
    }, [ref, key])
}

const RollConfig = {
    DURATION_MS: 320,
    TRAVEL: 100
} as const

function rollFrames(trend: FlowTrend) {
    const travel = (trend === -1 ? -1 : 1) * RollConfig.TRAVEL
    return {
        enter: [
            { opacity: 0, transform: `translateY(${travel}%)` },
            { opacity: 1, transform: 'translateY(0)' }
        ],
        leave: [
            { opacity: 1, transform: 'translateY(0)' },
            { opacity: 0, transform: `translateY(${-travel}%)` }
        ]
    }
}

/**
 * @name useDigitRoll
 * @description Rolls one character cell when its character changes. The old
 * character stays as a ghost that slides out while the new one slides in from the
 * other side, up when the number grew and down when it shrank. A cell that mounts
 * after its number was already on screen slides in on its own. The cell is a grid
 * with one face in it, so the ghost lays over the face.
 *
 * @example
 * useDigitRoll(cellRef, '7', 1, true)
 */
export function useDigitRoll(
    ref: RefObject<HTMLElement | null>,
    char: string,
    trend: FlowTrend,
    enter: boolean
) {
    const last = useRef<string | null>(null)

    useLayoutEffect(() => {
        const host = ref.current
        const face = host?.firstElementChild
        const previous = last.current
        last.current = char
        if (!host || !face || previous === char) return
        if (!('animate' in face) || matches(CALM_QUERY)) return
        const frames = rollFrames(trend)
        const options = { duration: RollConfig.DURATION_MS, easing: Easings.out }
        if (previous === null) {
            if (enter) face.animate(frames.enter, options)
            return
        }
        const ghost = face.cloneNode(false) as HTMLElement
        ghost.textContent = previous
        ghost.setAttribute('aria-hidden', 'true')
        ghost.setAttribute('data-ghost', '')
        host.appendChild(ghost)
        function remove() {
            ghost.remove()
        }
        ghost.animate(frames.leave, { ...options, fill: 'forwards' }).finished.then(remove, remove)
        face.animate(frames.enter, options)
        return remove
    }, [ref, char, trend, enter])
}
