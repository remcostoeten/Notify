import { describe, it, expect } from 'vitest'
import { expandedOffset, stackPlacement, tiltSign } from '../stack'
import { placementOf } from '../placement'
import { StackConfig } from '../constants'

describe('expandedOffset', () => {
    it('keeps the front toast in place', () => {
        expect(expandedOffset([64, 72], 0, 8)).toBe(0)
    })

    it('sums the heights in front plus one gap each', () => {
        expect(expandedOffset([64, 72, 80], 2, 8)).toBe(152)
    })

    it('counts an unmeasured toast as the front one', () => {
        expect(expandedOffset([64], 3, 8)).toBe(216)
    })
})

describe('stackPlacement', () => {
    it('steps each collapsed toast back, smaller, tilted and shaded', () => {
        expect(stackPlacement(2, false, [], 8)).toEqual({
            offset: 2 * StackConfig.PEEK,
            scale: 1 - 2 * StackConfig.SCALE_STEP,
            opacity: 1,
            tilt: 2 * StackConfig.TILT_STEP,
            shade: 1 - 2 * StackConfig.SHADE_STEP
        })
    })

    it('shows the same peek of each toast behind whatever the height', () => {
        const heights = [140]
        const step = stackPlacement(1, false, heights, 8)
        const visible = step.offset - (1 - step.scale) * heights[0]
        expect(visible).toBeCloseTo(StackConfig.PEEK)
    })

    it('keeps the front toast straight, full size and unshaded', () => {
        expect(stackPlacement(0, false, [64], 8)).toEqual({
            offset: 0,
            scale: 1,
            opacity: 1,
            tilt: 0,
            shade: 1
        })
    })

    it('stops tilting at the maximum', () => {
        expect(stackPlacement(30, false, [], 8).tilt).toBe(StackConfig.TILT_MAX)
    })

    it('fades only the toasts deeper than the solid depth', () => {
        const solid = stackPlacement(StackConfig.SOLID_DEPTH, false, [], 8).opacity
        const deeper = stackPlacement(StackConfig.SOLID_DEPTH + 1, false, [], 8).opacity
        expect(solid).toBe(1)
        expect(deeper).toBeCloseTo(1 - StackConfig.OPACITY_STEP)
    })

    it('never scales or fades below zero', () => {
        const far = stackPlacement(40, false, [], 8)
        expect(far.scale).toBe(0)
        expect(far.opacity).toBe(0)
        expect(far.shade).toBe(0)
    })

    it('spreads an expanded stack straight, full size and unshaded at real heights', () => {
        expect(stackPlacement(1, true, [64, 72], 8)).toEqual({
            offset: 72,
            scale: 1,
            opacity: 1,
            tilt: 0,
            shade: 1
        })
    })
})

describe('tiltSign', () => {
    it('lifts the side facing the screen from a right corner', () => {
        expect(tiltSign(placementOf('bottom-right'), 1)).toBe(1)
        expect(tiltSign(placementOf('bottom-right'), 2)).toBe(1)
    })

    it('leans the other way from a left corner', () => {
        expect(tiltSign(placementOf('bottom-left'), 1)).toBe(-1)
    })

    it('alternates sides when centered', () => {
        expect(tiltSign(placementOf('bottom-center'), 1)).toBe(1)
        expect(tiltSign(placementOf('bottom-center'), 2)).toBe(-1)
    })

    it('flips for toasts anchored to the top', () => {
        expect(tiltSign(placementOf('top-right'), 1)).toBe(-1)
        expect(tiltSign(placementOf('top-left'), 1)).toBe(1)
    })
})
