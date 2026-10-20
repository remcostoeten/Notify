import { StackConfig } from './constants'
import type { Placement } from './placement'

export type StackPlacement = {
    offset: number
    scale: number
    opacity: number
    tilt: number
    shade: number
}

/**
 * @name expandedOffset
 * @description Distance a toast moves away from the front while the stack is
 * expanded: the heights of every toast in front of it plus one gap each. A toast
 * that is not measured yet counts as the front toast's height.
 *
 * @example
 * expandedOffset([100, 80, 60], 2, 12) // 204
 */
export function expandedOffset(
    heights: readonly (number | undefined)[],
    index: number,
    gap: number
): number {
    let total = 0
    for (let position = 0; position < index; position++) {
        total += (heights[position] ?? heights[0] ?? 0) + gap
    }
    return total
}

/**
 * @name stackPlacement
 * @description Offset, scale, tilt, shade and opacity of the toast at `index` in a
 * collapsed or expanded stack, index 0 being the front. A collapsed toast is
 * shifted by the height its scale takes off, so every step shows exactly `PEEK`
 * pixels of the toast behind it whatever the toast's height. It tilts and darkens
 * a little more with depth, and stays opaque until `SOLID_DEPTH`. An expanded
 * stack is straight, full size and unshaded.
 *
 * @example
 * stackPlacement(1, false, [100], 12)
 * // { offset: 13, scale: 0.95, opacity: 1, tilt: 1.1, shade: 0.96 }
 */
export function stackPlacement(
    index: number,
    expanded: boolean,
    heights: readonly (number | undefined)[],
    gap: number
): StackPlacement {
    if (expanded) {
        return {
            offset: expandedOffset(heights, index, gap),
            scale: 1,
            opacity: 1,
            tilt: 0,
            shade: 1
        }
    }
    const scale = Math.max(1 - index * StackConfig.SCALE_STEP, 0)
    const faded = Math.max(index - StackConfig.SOLID_DEPTH, 0)
    return {
        offset: index * StackConfig.PEEK + (1 - scale) * (heights[0] ?? 0),
        scale,
        opacity: Math.max(1 - faded * StackConfig.OPACITY_STEP, 0),
        tilt: Math.min(index * StackConfig.TILT_STEP, StackConfig.TILT_MAX),
        shade: Math.max(1 - index * StackConfig.SHADE_STEP, 0)
    }
}

/**
 * @name tiltSign
 * @description Direction a collapsed toast leans in, 1 for clockwise. A toast
 * pivots on the corner it is anchored to and leans so the side facing the screen
 * rises out of the pile, which flips for toasts anchored to the top. Centered
 * toasts alternate sides.
 *
 * @example
 * tiltSign(placementOf('bottom-right'), 1) // 1
 * tiltSign(placementOf('bottom-center'), 2) // -1
 */
export function tiltSign(placement: Placement, index: number): 1 | -1 {
    const lean =
        placement.align === 'end' ? 1 : placement.align === 'start' ? -1 : index % 2 === 1 ? 1 : -1
    return placement.top ? (lean === 1 ? -1 : 1) : lean
}
