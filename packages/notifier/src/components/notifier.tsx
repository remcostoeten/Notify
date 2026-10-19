import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { CSSProperties, PointerEvent } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { AnimationConfig, Defaults, StackConfig } from '../constants'
import { anchorStyle, awayTransform, placementOf, restingTransform } from '../placement'
import { stackPlacement, tiltSign } from '../stack'
import {
    configureStore,
    dismiss,
    getSnapshot,
    pauseTimers,
    resumeTimers,
    subscribe
} from '../store'
import { themeVariables } from '../theme'
import { matchesHotkey } from '../utils'
import { SheetContext } from './context'
import { StyleSheet } from './style-sheet'
import { ToastItem } from './toast-item'
import type { NotifierProps, ToastPosition, ToastRecord, ToastTone } from '../types'

const SCHEME_QUERY = '(prefers-color-scheme: dark)'

const emptyRecords: readonly ToastRecord[] = []

let mountedCount = 0

function subscribeScheme(onChange: () => void): () => void {
    const query = window.matchMedia(SCHEME_QUERY)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
}

function readScheme(): boolean {
    return window.matchMedia(SCHEME_QUERY).matches
}

function readServerScheme(): boolean {
    return false
}

function getServerSnapshot(): readonly ToastRecord[] {
    return emptyRecords
}

function holderOf(node: Element | null): HTMLElement | null {
    return node?.closest<HTMLElement>('[data-ntf-id]') ?? null
}

function groupByPosition(
    records: readonly ToastRecord[],
    fallback: ToastPosition
): Map<ToastPosition, ToastRecord[]> {
    const groups = new Map<ToastPosition, ToastRecord[]>()
    records.forEach((record) => {
        const position = record.input.position ?? fallback
        groups.set(position, [...(groups.get(position) ?? []), record])
    })
    return groups
}

function resolveOffset(offset: NotifierProps['offset']): { x: number; y: number } {
    if (typeof offset === 'number') return { x: offset, y: offset }
    return { x: offset?.x ?? Defaults.OFFSET, y: offset?.y ?? Defaults.OFFSET }
}

type StackItemProps = {
    record: ToastRecord
    position: ToastPosition
    tone: ToastTone
    index: number
    total: number
    expanded: boolean
    heights: readonly number[]
    gap: number
    swipe: boolean
    pauseOnHover: boolean
    close: boolean
    calm: boolean
    setHeight: (index: number, height: number) => void
    onEnter: () => void
    onHover: (event: PointerEvent<HTMLDivElement>) => void
    onLeave: () => void
}

const stackOrigin = {
    start: 'left',
    center: 'center',
    end: 'right'
} as const

const stackAlign = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end'
} as const

function poseOf(y: number, rotate: number, scale: number): string {
    return `translateY(${y}px) rotate(${rotate}deg) scale(${scale})`
}

function clipOf(bottom: number): string {
    const bleed = StackConfig.CLIP_BLEED
    return `inset(-${bleed}px -${bleed}px ${bottom}px -${bleed}px)`
}

function StackItem({
    record,
    position,
    tone,
    index,
    total,
    expanded,
    heights,
    gap,
    swipe,
    pauseOnHover,
    close,
    calm,
    setHeight,
    onEnter,
    onHover,
    onLeave
}: StackItemProps) {
    const ref = useRef<HTMLDivElement>(null)
    const leaving = !record.open
    const placement = placementOf(position)

    useEffect(() => {
        const node = ref.current
        if (!node) return
        let measured = -1
        function measure() {
            const height = node?.offsetHeight ?? 0
            if (height === measured) return
            measured = height
            setHeight(index, height)
        }
        measure()
        if (typeof ResizeObserver === 'undefined') return
        const observer = new ResizeObserver(measure)
        observer.observe(node)
        return () => observer.disconnect()
    }, [index, setHeight])

    const away = placement.top ? 1 : -1
    const frontHeight = heights[0] ?? 0
    const clamped = !expanded && index > 0 && frontHeight > 0
    const rest = stackPlacement(index, expanded, heights, gap)
    const tilt = calm ? 0 : tiltSign(placement, index) * rest.tilt
    const enterPose = calm
        ? poseOf(0, 0, 1)
        : poseOf(-away * StackConfig.ENTER_TRAVEL, 0, StackConfig.ENTER_SCALE)
    const exitPose = calm
        ? poseOf(0, 0, 1)
        : poseOf(-away * StackConfig.EXIT_TRAVEL, 0, StackConfig.EXIT_SCALE)
    const restTarget = {
        opacity: rest.opacity,
        transform: poseOf(away * rest.offset, tilt, rest.scale),
        filter: `brightness(${rest.shade})`,
        height: clamped ? frontHeight : 'auto',
        clipPath: clipOf(clamped ? 0 : -StackConfig.CLIP_BLEED)
    }

    return (
        <motion.div
            style={{
                position: 'absolute',
                [placement.top ? 'top' : 'bottom']: 0,
                left: 0,
                right: 0,
                display: 'flex',
                justifyContent: stackAlign[placement.align],
                transformOrigin: `${stackOrigin[placement.align]} ${placement.top ? 'top' : 'bottom'}`,
                zIndex: total - index,
                pointerEvents: 'none'
            }}
            initial={{
                opacity: 0,
                transform: enterPose,
                filter: 'brightness(1)',
                clipPath: clipOf(-StackConfig.CLIP_BLEED)
            }}
            animate={leaving ? { opacity: 0, transform: exitPose } : restTarget}
            transition={
                leaving
                    ? AnimationConfig.STACK_EXIT
                    : expanded
                      ? AnimationConfig.STACK_REVEAL
                      : AnimationConfig.STACK_SETTLE
            }
            onPointerEnter={leaving ? undefined : onHover}
            onPointerLeave={leaving ? undefined : onLeave}
            onFocus={onEnter}
            onBlur={onLeave}
        >
            {expanded && !leaving ? (
                <div
                    aria-hidden
                    style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        height: gap,
                        [placement.top ? 'bottom' : 'top']: -gap,
                        pointerEvents: 'auto'
                    }}
                />
            ) : null}
            <div ref={ref}>
                <ToastItem
                    record={record}
                    position={position}
                    tone={tone}
                    swipe={swipe}
                    pauseOnHover={pauseOnHover}
                    close={close}
                    stacked
                />
            </div>
        </motion.div>
    )
}

type FlowItemProps = {
    record: ToastRecord
    position: ToastPosition
    tone: ToastTone
    swipe: boolean
    pauseOnHover: boolean
    close: boolean
    calm: boolean
}

function FlowItem({ record, position, tone, swipe, pauseOnHover, close, calm }: FlowItemProps) {
    const placement = placementOf(position)
    const away = awayTransform(placement, calm)
    return (
        <motion.div
            style={{ display: 'flex', pointerEvents: 'none' }}
            initial={{ opacity: 0, transform: away }}
            animate={
                record.open
                    ? { opacity: 1, transform: restingTransform() }
                    : { opacity: 0, transform: away }
            }
            transition={record.open ? AnimationConfig.ENTER : AnimationConfig.EXIT}
        >
            <ToastItem
                record={record}
                position={position}
                tone={tone}
                swipe={swipe}
                pauseOnHover={pauseOnHover}
                close={close}
                stacked={false}
            />
        </motion.div>
    )
}

type GroupProps = {
    position: ToastPosition
    records: ToastRecord[]
    tone: ToastTone
    stack: boolean
    gap: number
    offsetX: number
    offsetY: number
    swipe: boolean
    pauseOnHover: boolean
    close: boolean
    variables: CSSProperties
    className?: string
}

function PositionGroup({
    position,
    records,
    tone,
    stack,
    gap,
    offsetX,
    offsetY,
    swipe,
    pauseOnHover,
    close,
    variables,
    className
}: GroupProps) {
    const [hovered, setHovered] = useState(false)
    const [heights, setHeights] = useState<number[]>([])
    const collapseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const calm = useReducedMotion() === true
    const placement = placementOf(position)

    const setHeight = useCallback((index: number, height: number) => {
        setHeights((current) => {
            if (current[index] === height) return current
            const next = [...current]
            next[index] = height
            return next
        })
    }, [])

    const expand = useCallback(() => {
        if (collapseTimer.current !== null) clearTimeout(collapseTimer.current)
        setHovered(true)
    }, [])

    const hover = useCallback(
        (event: PointerEvent<HTMLDivElement>) => {
            if (event.pointerType === 'touch') return
            expand()
        },
        [expand]
    )

    const collapse = useCallback(() => {
        if (collapseTimer.current !== null) clearTimeout(collapseTimer.current)
        collapseTimer.current = setTimeout(() => setHovered(false), StackConfig.COLLAPSE_DELAY_MS)
    }, [])

    useEffect(
        () => () => {
            if (collapseTimer.current !== null) clearTimeout(collapseTimer.current)
        },
        []
    )

    const openCount = records.filter((record) => record.open).length

    if (openCount === 0 && hovered) setHovered(false)

    useEffect(() => {
        if (!hovered || !pauseOnHover) return
        pauseTimers('hover')
        return () => resumeTimers('hover')
    }, [hovered, pauseOnHover])

    const edgeOffset = offsetX * 2
    const containerStyle: CSSProperties = {
        ...variables,
        ...anchorStyle(placement, offsetX, offsetY),
        zIndex: 2147483647,
        pointerEvents: 'none'
    }

    if (stack) {
        const front = records.filter((record) => record.open).reverse()
        const indexOf = new Map(front.map((record, index) => [record.id, index]))
        const expanded = hovered && front.length > 1 && (heights[0] ?? 0) > 0

        return (
            <div
                className={className}
                role='region'
                aria-label='Notifications'
                aria-live='polite'
                style={{
                    ...containerStyle,
                    width: `min(var(--ntf-width, 400px), calc(100vw - ${edgeOffset}px))`
                }}
            >
                {records.map((record) => (
                    <StackItem
                        key={record.id}
                        record={record}
                        position={position}
                        tone={tone}
                        index={indexOf.get(record.id) ?? 0}
                        total={front.length}
                        expanded={expanded}
                        heights={heights}
                        gap={gap}
                        swipe={swipe}
                        pauseOnHover={false}
                        close={close}
                        calm={calm}
                        setHeight={setHeight}
                        onEnter={expand}
                        onHover={hover}
                        onLeave={collapse}
                    />
                ))}
            </div>
        )
    }

    return (
        <div
            className={className}
            role='region'
            aria-label='Notifications'
            aria-live='polite'
            style={{
                ...containerStyle,
                display: 'flex',
                flexDirection: placement.top ? 'column' : 'column-reverse',
                alignItems: stackAlign[placement.align],
                gap,
                maxWidth: `calc(100vw - ${edgeOffset}px)`
            }}
        >
            {records.map((record) => (
                <FlowItem
                    key={record.id}
                    record={record}
                    position={position}
                    tone={tone}
                    swipe={swipe}
                    pauseOnHover={pauseOnHover}
                    close={close}
                    calm={calm}
                />
            ))}
        </div>
    )
}

export function Notifier({
    position = Defaults.POSITION,
    tone = Defaults.TONE,
    maxVisible = Defaults.MAX_VISIBLE,
    duration = Defaults.DURATION_MS,
    swipe = true,
    pauseOnHover = true,
    close = true,
    hotkey = Defaults.HOTKEY,
    stack = false,
    offset = Defaults.OFFSET,
    gap = Defaults.GAP,
    theme,
    nonce,
    className
}: NotifierProps) {
    const records = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
    const prefersDark = useSyncExternalStore(subscribeScheme, readScheme, readServerScheme)
    const resolvedTone: ToastTone = tone === 'auto' ? (prefersDark ? 'dark' : 'light') : tone

    useEffect(() => {
        mountedCount += 1
        if (process.env.NODE_ENV !== 'production' && mountedCount > 1) {
            console.warn(
                '[notifier] More than one <Notifier /> is mounted, so every toast renders twice. Mount it once at your app root.'
            )
        }
        return () => {
            mountedCount -= 1
        }
    }, [])

    useEffect(() => {
        configureStore({ position, duration, maxVisible })
    }, [position, duration, maxVisible])

    useEffect(
        () => () => {
            resumeTimers('hover')
            resumeTimers('hidden')
        },
        []
    )

    const previousFocus = useRef<HTMLElement | null>(null)

    const restoreFocus = useCallback(() => {
        const target = previousFocus.current
        previousFocus.current = null
        if (target?.isConnected) target.focus()
    }, [])

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            const holder = holderOf(document.activeElement)
            if (event.key === 'Escape' && holder?.dataset.ntfId) {
                dismiss(holder.dataset.ntfId, 'close')
                restoreFocus()
                return
            }
            if (hotkey === false || !matchesHotkey(event, hotkey)) return
            const open = getSnapshot().filter((record) => record.open)
            const newest = open[open.length - 1]
            if (!newest) return
            const target = Array.from(document.querySelectorAll<HTMLElement>('[data-ntf-id]')).find(
                (node) => node.dataset.ntfId === newest.id
            )
            if (!target) return
            event.preventDefault()
            if (!holder && document.activeElement instanceof HTMLElement) {
                previousFocus.current = document.activeElement
            }
            target.focus()
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [hotkey, restoreFocus])

    useEffect(() => {
        const holder = holderOf(document.activeElement)
        if (!holder) return
        const record = records.find((item) => item.id === holder.dataset.ntfId)
        if (record && !record.open) restoreFocus()
    }, [records, restoreFocus])

    useEffect(() => {
        function handleVisibility() {
            if (document.visibilityState === 'hidden') pauseTimers('hidden')
            else resumeTimers('hidden')
        }
        document.addEventListener('visibilitychange', handleVisibility)
        return () => document.removeEventListener('visibilitychange', handleVisibility)
    }, [])

    const groups = groupByPosition(records, position)
    if (!groups.has(position)) groups.set(position, [])
    const { x, y } = resolveOffset(offset)
    const variables = themeVariables(theme)

    return (
        <SheetContext.Provider value>
            <StyleSheet nonce={nonce} />
            {Array.from(groups, ([groupPosition, groupRecords]) => (
                <PositionGroup
                    key={groupPosition}
                    position={groupPosition}
                    records={groupRecords}
                    tone={resolvedTone}
                    stack={stack}
                    gap={gap}
                    offsetX={x}
                    offsetY={y}
                    swipe={swipe}
                    pauseOnHover={pauseOnHover}
                    close={close}
                    variables={variables}
                    className={className}
                />
            ))}
        </SheetContext.Provider>
    )
}
