import { useContext } from 'react'
import type { ReactNode } from 'react'
import { cx } from '../utils'
import type { CSSVars } from '../utils'
import { CloseGlyph, StatusGlyph } from './glyphs'
import { SlotContext, useToast } from './context'
import type {
    ActionColor,
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
    return status === undefined ? 'box' : 'circle'
}

type IconProps = {
    shape?: IconShape
    status?: ToastStatus
    node?: ReactNode
    children?: ReactNode
    className?: string
}

export function Icon({ shape, status, node, children, className }: IconProps) {
    const resolvedShape = shape ?? defaultShape(status)
    const glyph =
        node ?? children ?? (status ? <StatusGlyph status={status} shape={resolvedShape} /> : null)
    return (
        <span
            className={useSlot('icon', className)}
            data-shape={resolvedShape}
            data-status={status}
            aria-hidden='true'
        >
            {glyph}
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
            <span className={useSlot('title', className)}>{children}</span>
            {meta != null && (
                <>
                    <span className='ntf-divider' aria-hidden='true' />
                    <span className={metaClass}>{meta}</span>
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
    return <div className={useSlot('description', className)}>{children}</div>
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
            {text != null && <div className={labelClass}>{text}</div>}
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
            {aside != null && <div className={asideClass}>{aside}</div>}
        </div>
    )
}

type ActionProps = {
    children: ReactNode
    onClick?: (toast: ToastHandle) => void
    variant?: ActionVariant
    color?: ActionColor
    dismiss?: boolean
    href?: string
    disabled?: boolean
    className?: string
}

export function Action({
    children,
    onClick,
    variant = 'text',
    color = 'default',
    dismiss = true,
    href,
    disabled,
    className
}: ActionProps) {
    const toast = useToast()
    const classes = useSlot('action', className)

    function handleClick() {
        onClick?.(toast)
        if (dismiss) toast.dismiss('action')
    }

    if (href) {
        return (
            <a
                className={classes}
                data-variant={variant}
                data-color={color}
                href={href}
                aria-disabled={disabled}
                onClick={handleClick}
            >
                {children}
            </a>
        )
    }

    return (
        <button
            type='button'
            className={classes}
            data-variant={variant}
            data-color={color}
            disabled={disabled}
            onClick={handleClick}
        >
            {children}
        </button>
    )
}

type CloseProps = {
    label?: string
    className?: string
}

export function Close({ label = 'Close', className }: CloseProps) {
    const toast = useToast()
    return (
        <button
            type='button'
            className={useSlot('close', className)}
            aria-label={label}
            onClick={() => toast.dismiss('close')}
        >
            <CloseGlyph />
        </button>
    )
}
