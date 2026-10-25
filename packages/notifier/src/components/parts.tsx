import { useContext, useEffect, useRef, useState } from 'react'
import type { MouseEvent, ReactNode } from 'react'
import { glyphMotions } from '../glyph-motion'
import { cx } from '../utils'
import type { CSSVars } from '../utils'
import { Defaults } from '../constants'
import { CheckMark, CloseGlyph, CrossMark, SpinnerGlyph, StatusGlyph } from './glyphs'
import { CloseLabelContext, SlotContext, useToast } from './context'
import { Flowed } from './flow'
import { useGlyphSwap, useHoverMotion, useIconMotion, useWidthMotion } from './play-motion'
import type {
    ActionColor,
    ActionLabels,
    ActionState,
    ActionVariant,
    AvatarBadge,
    AvatarShape,
    IconShape,
    ToastHandle,
    ToastSlot,
    ToastStatus
} from '../types'

function useSlot(slot: ToastSlot, className?: string): string | undefined {
    const classNames = useContext(SlotContext)
    return cx(`ntf-${slot}`, classNames[slot], className)
}

function defaultShape(status: ToastStatus | undefined): IconShape {
    return status === undefined ? 'box' : 'bare'
}

type IconProps = {
    shape?: IconShape
    status?: ToastStatus
    node?: ReactNode
    children?: ReactNode
    className?: string
}

export function Icon({ shape, status, node, children, className }: IconProps) {
    const ref = useRef<HTMLSpanElement>(null)
    const resolvedShape = shape ?? defaultShape(status)
    const custom = node ?? children
    const builtIn = custom == null
    const glyph = builtIn && status ? <StatusGlyph status={status} shape={resolvedShape} /> : custom
    const glyphKey = builtIn ? (status ?? 'none') : 'custom'
    useIconMotion(ref, { shape: resolvedShape, status, builtIn })
    useGlyphSwap(ref, glyphKey)
    return (
        <span
            ref={ref}
            className={useSlot('icon', className)}
            data-shape={resolvedShape}
            data-status={status}
            data-ntf-part='frame'
            aria-hidden='true'
        >
            {resolvedShape === 'ring' && (
                <>
                    <span className='ntf-ring' data-ring='outer' data-ntf-part='ringOuter' />
                    <span className='ntf-ring' data-ring='inner' data-ntf-part='ringInner' />
                </>
            )}
            {(resolvedShape === 'circle' || resolvedShape === 'ring') && (
                <span className='ntf-halo' data-ntf-part='halo' />
            )}
            <span key={glyphKey} className='ntf-glyph'>
                {glyph}
            </span>
        </span>
    )
}

type AvatarProps = {
    src?: string
    alt?: string
    fallback?: ReactNode
    badge?: AvatarBadge
    shape?: AvatarShape
    className?: string
}

export function Avatar({
    src,
    alt = '',
    fallback,
    badge,
    shape = 'square',
    className
}: AvatarProps) {
    const badgeClass = useSlot('badge')
    return (
        <span className={useSlot('avatar', className)} data-shape={shape}>
            {src ? (
                <img src={src} alt={alt} draggable={false} decoding='async' />
            ) : (
                <span className='ntf-avatar-fallback'>{fallback}</span>
            )}
            {badge && <span className={badgeClass} data-badge={badge} />}
        </span>
    )
}

type BodyProps = {
    children: ReactNode
    className?: string
}

export function Body({ children, className }: BodyProps) {
    return <div className={useSlot('body', className)}>{children}</div>
}

type TitleProps = {
    children: ReactNode
    meta?: ReactNode
    className?: string
}

export function Title({ children, meta, className }: TitleProps) {
    const metaClass = useSlot('meta')
    return (
        <div className='ntf-title-row'>
            <span className={useSlot('title', className)}>
                <Flowed>{children}</Flowed>
            </span>
            {meta != null && (
                <>
                    <span className='ntf-divider' aria-hidden='true' />
                    <span className={metaClass}>
                        <Flowed>{meta}</Flowed>
                    </span>
                </>
            )}
        </div>
    )
}

type DescriptionProps = {
    children: ReactNode
    className?: string
}

export function Description({ children, className }: DescriptionProps) {
    return (
        <div className={useSlot('description', className)}>
            <Flowed>{children}</Flowed>
        </div>
    )
}

type ProgressProps = {
    value: number | null
    label?: boolean | ReactNode
    className?: string
}

/**
 * @name progressLabel
 * @description Text shown beside a progress bar: the rounded percentage for
 * `true`, nothing for `false` or an indeterminate bar, or the node itself.
 *
 * @example
 * progressLabel(59.6, true) // '60%'
 */
export function progressLabel(value: number | null, label: boolean | ReactNode): ReactNode {
    if (label === true) return value === null ? null : `${Math.round(clampProgress(value))}%`
    return label === false ? null : label
}

function clampProgress(value: number): number {
    return Math.min(100, Math.max(0, value))
}

export function Progress({ value, label, className }: ProgressProps) {
    const labelClass = useSlot('label')
    const clamped = value === null ? null : clampProgress(value)
    const text = progressLabel(value, label)
    const fillStyle: CSSVars = { '--ntf-progress': `${clamped ?? 0}%` }
    return (
        <div className={useSlot('progress', className)}>
            <div
                className='ntf-track'
                role='progressbar'
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={clamped ?? undefined}
                data-indeterminate={clamped === null ? '' : undefined}
            >
                <div className='ntf-fill' style={fillStyle} />
            </div>
            {text != null && (
                <div className={labelClass}>
                    <Flowed>{text}</Flowed>
                </div>
            )}
        </div>
    )
}

type ActionsProps = {
    children: ReactNode
    aside?: ReactNode
    className?: string
}

export function Actions({ children, aside, className }: ActionsProps) {
    const asideClass = useSlot('aside')
    return (
        <div className={useSlot('actions', className)}>
            <div className='ntf-actions-list'>{children}</div>
            {aside != null && (
                <div className={asideClass}>
                    <Flowed>{aside}</Flowed>
                </div>
            )}
        </div>
    )
}

type ActionProps = {
    children: ReactNode
    onClick?: (toast: ToastHandle) => void | Promise<unknown>
    labels?: ActionLabels
    variant?: ActionVariant
    color?: ActionColor
    dismiss?: boolean
    href?: string
    disabled?: boolean
    pending?: boolean
    className?: string
}

const SettleMs: Record<Exclude<ActionState, 'idle' | 'loading'>, number> = {
    success: Defaults.ACTION_SUCCESS_MS,
    error: Defaults.ACTION_ERROR_MS
}

function isThenable(value: unknown): value is PromiseLike<unknown> {
    return typeof value === 'object' && value !== null && 'then' in value
}

function stateGlyph(state: ActionState): ReactNode {
    if (state === 'loading') return <SpinnerGlyph />
    if (state === 'success') return <CheckMark />
    if (state === 'error') return <CrossMark />
    return null
}

/**
 * @name useActionState
 * @description Tracks an action whose press returns a promise. The action is
 * `loading` while it runs, then `success` or `error` for a short hold, after
 * which `onSettled` runs for a success and the state returns to idle. A
 * controlled `pending` keeps it `loading`.
 *
 * @example
 * const { state, run } = useActionState(false, () => toast.dismiss('action'))
 * run(() => save())
 */
export function useActionState(pending: boolean, onSettled: () => void) {
    const [own, setOwn] = useState<ActionState>('idle')
    const mounted = useRef(true)
    const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
    const settled = useRef(onSettled)

    useEffect(() => {
        settled.current = onSettled
    })

    useEffect(() => {
        mounted.current = true
        return () => {
            mounted.current = false
            clearTimeout(timer.current)
        }
    }, [])

    function settle(next: Exclude<ActionState, 'idle' | 'loading'>) {
        if (!mounted.current) return
        setOwn(next)
        timer.current = setTimeout(() => {
            if (!mounted.current) return
            if (next === 'success') settled.current()
            setOwn('idle')
        }, SettleMs[next])
    }

    function run(work: () => void | Promise<unknown>): boolean {
        const result = work()
        if (!isThenable(result)) return false
        setOwn('loading')
        Promise.resolve(result).then(
            () => settle('success'),
            () => settle('error')
        )
        return true
    }

    return { state: pending ? 'loading' : own, run }
}

export function Action({
    children,
    onClick,
    labels,
    variant = 'text',
    color = 'default',
    dismiss = true,
    href,
    disabled,
    pending = false,
    className
}: ActionProps) {
    const toast = useToast()
    const ref = useRef<HTMLButtonElement & HTMLAnchorElement>(null)
    const classes = useSlot('action', className)
    const { state, run } = useActionState(pending, () => {
        if (dismiss) toast.dismiss('action')
    })
    const busy = state === 'loading'
    const label = (state !== 'idle' && labels?.[state]) || children
    useGlyphSwap(ref, state, ':scope > .ntf-action-glyph > *')
    useGlyphSwap(ref, state, ':scope > .ntf-action-label > *')
    useWidthMotion(ref, state)
    const content = (
        <>
            <span className='ntf-action-glyph' aria-hidden='true'>
                {state !== 'idle' && <span key={state}>{stateGlyph(state)}</span>}
            </span>
            <span className='ntf-action-label'>
                <span key={state}>{label}</span>
            </span>
        </>
    )

    function handleClick(event: MouseEvent<HTMLElement>) {
        if (disabled || state !== 'idle') {
            event.preventDefault()
            return
        }
        const async = run(() => onClick?.(toast))
        if (!async && dismiss) toast.dismiss('action')
    }

    if (href) {
        return (
            <a
                ref={ref}
                className={classes}
                data-variant={variant}
                data-color={color}
                data-state={state}
                href={disabled ? undefined : href}
                role={disabled ? 'link' : undefined}
                aria-disabled={disabled || undefined}
                aria-busy={busy || undefined}
                onClick={handleClick}
            >
                {content}
            </a>
        )
    }

    return (
        <button
            ref={ref}
            type='button'
            className={classes}
            data-variant={variant}
            data-color={color}
            data-state={state}
            disabled={disabled}
            aria-busy={busy || undefined}
            onClick={handleClick}
        >
            {content}
        </button>
    )
}

type CloseProps = {
    label?: string
    className?: string
}

export function Close({ label, className }: CloseProps) {
    const toast = useToast()
    const fallback = useContext(CloseLabelContext)
    const ref = useRef<HTMLButtonElement>(null)
    useHoverMotion(ref, glyphMotions.close)
    return (
        <button
            ref={ref}
            type='button'
            className={useSlot('close', className)}
            aria-label={label ?? fallback}
            onClick={() => toast.dismiss('close')}
        >
            <CloseGlyph />
        </button>
    )
}
