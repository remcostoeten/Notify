import { describe, it, expect } from 'vitest'
import { anchorStyle, awayTransform, placementOf, restingTransform } from '../placement'

describe('placementOf', () => {
    it('swipes sideways in the corners and vertically in the centre', () => {
        expect(placementOf('bottom-right').axis).toBe('x')
        expect(placementOf('top-left').axis).toBe('x')
        expect(placementOf('top-center').axis).toBe('y')
        expect(placementOf('bottom-center').axis).toBe('y')
    })

    it('travels in from the side a toast is anchored to', () => {
        expect(placementOf('bottom-right')).toMatchObject({ travelX: 24, travelY: 0 })
        expect(placementOf('bottom-left')).toMatchObject({ travelX: -24, travelY: 0 })
        expect(placementOf('top-center')).toMatchObject({ travelX: 0, travelY: -16 })
        expect(placementOf('bottom-center')).toMatchObject({ travelX: 0, travelY: 16 })
    })
})

describe('anchorStyle', () => {
    it('pins the column to its corner', () => {
        expect(anchorStyle(placementOf('bottom-right'), 24, 16)).toEqual({
            position: 'fixed',
            bottom: 16,
            right: 24
        })
        expect(anchorStyle(placementOf('top-left'), 24, 16)).toEqual({
            position: 'fixed',
            top: 16,
            left: 24
        })
    })

    it('centres the column horizontally', () => {
        expect(anchorStyle(placementOf('top-center'), 24, 16)).toEqual({
            position: 'fixed',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)'
        })
    })
})

describe('awayTransform', () => {
    it('shrinks and offsets a toast that is entering or leaving', () => {
        expect(awayTransform(placementOf('bottom-right'), false)).toBe(
            'translate(24px, 0px) scale(0.96)'
        )
    })

    it('stays put when motion is reduced', () => {
        expect(awayTransform(placementOf('bottom-right'), true)).toBe(restingTransform())
    })
})
