import type { CSSProperties } from 'react'
import { EntryConfig } from './constants'
import type { ToastPosition } from './types'

export type Placement = {
    top: boolean
    align: 'start' | 'center' | 'end'
    axis: 'x' | 'y'
    travelX: number
    travelY: number
}

/**
 * @name placementOf
 * @description Describes how a screen position anchors, which axis a swipe
 * dismisses along and which direction a toast travels in from.
 *
 * @example
 * placementOf('bottom-right') // { top: false, align: 'end', axis: 'x', travelX: 24, travelY: 0 }
 */
export function placementOf(position: ToastPosition): Placement {
    const top = position.startsWith('top')
    const align = position.endsWith('left')
        ? 'start'
        : position.endsWith('right')
          ? 'end'
          : 'center'
    if (align === 'center') {
        return { top, align, axis: 'y', travelX: 0, travelY: top ? -16 : 16 }
    }
    return { top, align, axis: 'x', travelX: align === 'start' ? -24 : 24, travelY: 0 }
}

/**
 * @name restingTransform
 * @description CSS transform of a toast at rest.
 *
 * @example
 * restingTransform() // 'translate(0px, 0px) scale(1)'
 */
export function restingTransform(): string {
    return 'translate(0px, 0px) scale(1)'
}

/**
 * @name awayTransform
 * @description CSS transform a toast enters from and leaves to, or the resting
 * transform when motion is reduced.
 *
 * @example
 * awayTransform(placementOf('top-center'), false) // 'translate(0px, -16px) scale(0.96)'
 */
export function awayTransform(placement: Placement, calm: boolean): string {
    if (calm) return restingTransform()
    return `translate(${placement.travelX}px, ${placement.travelY}px) scale(${EntryConfig.SCALE})`
}

/**
 * @name anchorStyle
 * @description Fixed-position styles that pin a toast column to its screen edge.
 *
 * @example
 * anchorStyle(placementOf('top-center'), 24, 16)
 * // { position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)' }
 */
export function anchorStyle(placement: Placement, offsetX: number, offsetY: number): CSSProperties {
    const edge = placement.top ? { top: offsetY } : { bottom: offsetY }
    if (placement.align === 'start') return { position: 'fixed', ...edge, left: offsetX }
    if (placement.align === 'end') return { position: 'fixed', ...edge, right: offsetX }
    return { position: 'fixed', ...edge, left: '50%', transform: 'translateX(-50%)' }
}
