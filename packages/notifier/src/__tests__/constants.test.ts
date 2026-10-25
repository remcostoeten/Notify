import { describe, it, expect } from 'vitest'
import { AnimationConfig, Defaults } from '../constants'

describe('exit timing', () => {
    it('finishes the column exit tween before the toast is removed', () => {
        expect(AnimationConfig.EXIT.duration * 1000).toBeLessThanOrEqual(Defaults.EXIT_MS)
    })

    it('finishes every stack exit tween before the toast is removed', () => {
        const { default: base, opacity } = AnimationConfig.STACK_EXIT
        expect(base.duration * 1000).toBeLessThanOrEqual(Defaults.EXIT_MS)
        expect(opacity.duration * 1000).toBeLessThanOrEqual(Defaults.EXIT_MS)
    })
})
