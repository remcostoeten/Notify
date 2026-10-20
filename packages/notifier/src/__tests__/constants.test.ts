import { describe, it, expect } from 'vitest'
import { spring } from 'motion'
import { AnimationConfig, Defaults } from '../constants'

describe('exit timing', () => {
    it('finishes the column exit tween before the toast is removed', () => {
        expect(AnimationConfig.EXIT.duration * 1000).toBeLessThanOrEqual(Defaults.EXIT_MS)
    })

    it('settles the stack exit spring before the toast is removed', () => {
        const { stiffness, damping, mass } = AnimationConfig.STACK_EXIT
        const generator = spring({ keyframes: [0, 1], stiffness, damping, mass })
        expect(Math.abs(1 - generator.next(Defaults.EXIT_MS).value)).toBeLessThan(0.001)
    })
})
