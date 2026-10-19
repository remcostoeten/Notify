import type { CSSProperties, ReactElement, ReactNode } from 'react'
import type { ToneTokens } from './tokens'

export type ToastID = string

export type ToastTone = 'light' | 'dark'

export type ToastStatus = 'success' | 'error' | 'warning' | 'info' | 'loading'

export type ToastPosition =
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right'

export type DismissReason = 'timeout' | 'swipe' | 'close' | 'action' | 'manual' | 'replaced'

export type IconShape = 'ring' | 'box' | 'circle' | 'bare'

export type AvatarBadge = 'online' | 'away' | 'busy' | 'offline'

export type AvatarShape = 'square' | 'circle'

export type ActionVariant = 'text' | 'outline' | 'filled'

export type ActionColor = 'default' | 'muted' | 'accent'

export type ToastSlot =
    | 'root'
    | 'icon'
    | 'avatar'
    | 'badge'
    | 'body'
    | 'title'
    | 'meta'
    | 'description'
    | 'progress'
    | 'label'
    | 'actions'
    | 'action'
    | 'aside'
    | 'close'

export type ToastClassNames = Partial<Record<ToastSlot, string>>

export type ToastPatch = Partial<Omit<ToastInput, 'id'>>

export type ToastHandle = {
    id: ToastID
    dismiss: (reason?: DismissReason) => void
    update: (patch: ToastPatch) => void
}

export type ToastRuntime = ToastHandle & {
    tone: ToastTone
}

export type IconConfig = {
    shape?: IconShape
    status?: ToastStatus
    node?: ReactNode
}

export type AvatarConfig = {
    src?: string
    alt?: string
    fallback?: ReactNode
    badge?: AvatarBadge
    shape?: AvatarShape
}

export type ProgressConfig = {
    value: number | null
    label?: boolean | ReactNode
}

export type ActionConfig = {
    label: ReactNode
    onClick?: (toast: ToastHandle) => void
    variant?: ActionVariant
    color?: ActionColor
    dismiss?: boolean
    href?: string
    disabled?: boolean
}

export type ToastContent = {
    status?: ToastStatus
    icon?: IconConfig | ReactElement
    avatar?: AvatarConfig
    title?: ReactNode
    meta?: ReactNode
    description?: ReactNode
    progress?: number | ProgressConfig
    actions?: ActionConfig[]
    close?: boolean
}

export type ToastSurface = {
    tone?: ToastTone
    width?: number | string
    className?: string
    classNames?: ToastClassNames
    style?: CSSProperties
}

export type ToastBehavior = {
    id?: ToastID
    position?: ToastPosition
    duration?: number
    swipe?: boolean
    onOpen?: (id: ToastID) => void
    onDismiss?: (id: ToastID, reason: DismissReason) => void
    onClose?: (id: ToastID) => void
}

export type ToastInput = ToastContent & ToastSurface & ToastBehavior

export type CustomToastOptions = ToastBehavior & Pick<ToastSurface, 'tone'>

export type CustomRender = (toast: ToastRuntime) => ReactNode

export type PromiseMessage<Value> = ToastInput | string | ((value: Value) => ToastInput | string)

export type PromiseMessages<Data> = {
    loading: ToastInput | string
    success: PromiseMessage<Data>
    error: PromiseMessage<Error>
    id?: ToastID
}

export type ToastTheme = {
    light?: Partial<ToneTokens>
    dark?: Partial<ToneTokens>
    font?: string
    radius?: number | string
    width?: number | string
}

export type NotifierProps = {
    position?: ToastPosition
    tone?: ToastTone | 'auto'
    maxVisible?: number
    duration?: number
    swipe?: boolean
    pauseOnHover?: boolean
    close?: boolean
    hotkey?: string | false
    stack?: boolean
    offset?: number | { x?: number; y?: number }
    gap?: number
    theme?: ToastTheme
    nonce?: string
    className?: string
}

export type ToastRecord = {
    id: ToastID
    input: ToastInput
    render: CustomRender | null
    open: boolean
    createdAt: number
}
