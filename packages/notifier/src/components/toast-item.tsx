import { memo, useEffect, useMemo, useRef } from 'react'
import type { FocusEvent } from 'react'
import { motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import type { PanInfo } from 'motion/react'
import { AnimationConfig, Defaults, EntryConfig } from '../constants'
import { placementOf } from '../placement'
import { dismiss, handleFor, pauseTimers, resumeTimers } from '../store'
import { RuntimeContext } from './context'
import { Toast } from './toast'
import type { ToastPosition, ToastRecord, ToastRuntime, ToastTone } from '../types'

type Props = {
    record: ToastRecord
    position: ToastPosition
    tone: ToastTone
    swipe: boolean
    pauseOnHover: boolean
    close: boolean
    stacked: boolean
}

function ToastItemView({ record, position, tone, swipe, pauseOnHover, close, stacked }: Props) {
    const { id, input, render, open } = record
    const calm = useReducedMotion() === true
    const placement = placementOf(position)
    const horizontal = placement.axis === 'x'
    const swipeEnabled = (input.swipe ?? swipe) && open
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const drag = horizontal ? x : y
    const opacity = useTransform(
        drag,
        [-Defaults.SWIPE_THRESHOLD, 0, Defaults.SWIPE_THRESHOLD],
        [0, 1, 0]
    )
    const resolvedTone = input.tone ?? tone
    const runtime = useMemo<ToastRuntime>(
        () => ({ ...handleFor(id), tone: resolvedTone }),
        [id, resolvedTone]
    )
    const assertive = input.status === 'error' || input.status === 'warning'
    const hovering = useRef(false)

    function handleEnter() {
        if (!pauseOnHover) return
        hovering.current = true
        pauseTimers('hover')
    }

    function handleLeave() {
        if (!hovering.current) return
        hovering.current = false
        resumeTimers('hover')
    }

    const focused = useRef(false)

    function handleFocus() {
        if (focused.current) return
        focused.current = true
        pauseTimers('focus')
    }

    function releaseFocus() {
        if (!focused.current) return
        focused.current = false
        resumeTimers('focus')
    }

    function handleBlur(event: FocusEvent<HTMLDivElement>) {
        const next = event.relatedTarget
        if (next instanceof Node && event.currentTarget.contains(next)) return
        releaseFocus()
    }

    useEffect(() => {
        if (open) return
        handleLeave()
        releaseFocus()
    }, [open])

    useEffect(
        () => () => {
            handleLeave()
            releaseFocus()
        },
        []
    )

    function handleDragEnd(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
        const away = horizontal ? (placement.align === 'start' ? -1 : 1) : placement.top ? -1 : 1
        const offset = (horizontal ? info.offset.x : info.offset.y) * away
        const velocity = (horizontal ? info.velocity.x : info.velocity.y) * away
        const threshold = Defaults.SWIPE_THRESHOLD
        if (offset > threshold / 2 || velocity > 500 || Math.abs(offset) > threshold) {
            dismiss(id, 'swipe')
        }
    }

    return (
        <motion.div
            layout={stacked ? undefined : 'position'}
            className='ntf-item'
            data-ntf-id={id}
            tabIndex={-1}
            role={assertive ? 'alert' : undefined}
            style={{ x, y, opacity, display: 'flex', pointerEvents: open ? 'auto' : 'none' }}
            drag={swipeEnabled ? placement.axis : false}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.5}
            whileDrag={calm ? undefined : { scale: EntryConfig.DRAG_SCALE }}
            transition={{ layout: AnimationConfig.REFLOW, scale: AnimationConfig.PRESS }}
            onDragEnd={handleDragEnd}
            onPointerEnter={handleEnter}
            onPointerLeave={handleLeave}
            onFocus={handleFocus}
            onBlur={handleBlur}
        >
            <RuntimeContext.Provider value={runtime}>
                {render ? (
                    render(runtime)
                ) : (
                    <Toast {...input} tone={resolvedTone} close={input.close ?? close} />
                )}
            </RuntimeContext.Provider>
        </motion.div>
    )
}

export const ToastItem = memo(ToastItemView)
