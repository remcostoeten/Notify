import { isValidElement, useContext } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { cx } from '../utils'
import type { CSSVars } from '../utils'
import { NumbersContext, SheetContext, SlotContext, useToast } from './context'
import { Digits } from './flow'
import { Action, Actions, Avatar, Body, Close, Description, Icon, Progress, Title } from './parts'
import { StyleSheet } from './style-sheet'
import type { IconConfig, ToastClassNames, ToastContent, ToastStatus, ToastSurface } from '../types'

type Props = ToastSurface &
    ToastContent & {
        children?: ReactNode
    }

type ResolvedIcon = IconConfig | null

const noClassNames: ToastClassNames = {}

function resolveIcon(
    icon: IconConfig | ReactElement | undefined,
    status: ToastStatus | undefined
): ResolvedIcon {
    if (isValidElement(icon)) return { shape: 'box', node: icon }
    if (icon) return { ...icon, status: icon.status ?? status }
    return status ? { status } : null
}

function ToastContentView({
    status,
    icon,
    avatar,
    title,
    meta,
    description,
    progress,
    actions,
    close = true
}: ToastContent) {
    const resolvedIcon = resolveIcon(icon, status)
    const bar = typeof progress === 'number' ? { value: progress, label: true } : progress
    const hasActions = actions !== undefined && actions.length > 0

    return (
        <>
            {avatar ? <Avatar {...avatar} /> : resolvedIcon && <Icon {...resolvedIcon} />}
            <Body>
                {title != null && <Title meta={meta}>{title}</Title>}
                {description != null && <Description>{description}</Description>}
                {bar && <Progress value={bar.value} label={bar.label} />}
                {hasActions && (
                    <Actions>
                        {actions.map((action, index) => (
                            <Action
                                key={index}
                                onClick={action.onClick}
                                labels={action.labels}
                                variant={action.variant}
                                color={action.color}
                                dismiss={action.dismiss}
                                href={action.href}
                                disabled={action.disabled}
                                pending={action.pending}
                            >
                                {action.label}
                            </Action>
                        ))}
                    </Actions>
                )}
            </Body>
            {close && <Close />}
        </>
    )
}

function ToastRoot({
    tone,
    width,
    className,
    classNames,
    style,
    animateNumbers,
    children,
    ...content
}: Props) {
    const runtime = useToast()
    const hasSheet = useContext(SheetContext)
    const inheritedNumbers = useContext(NumbersContext)
    const rootStyle: CSSVars = { ...style }
    const compact =
        children === undefined &&
        content.description == null &&
        content.progress == null &&
        !content.actions?.length
    if (width !== undefined)
        rootStyle['--ntf-width'] = typeof width === 'number' ? `${width}px` : width

    return (
        <SlotContext.Provider value={classNames ?? noClassNames}>
            <NumbersContext.Provider value={animateNumbers ?? inheritedNumbers}>
                {!hasSheet && <StyleSheet />}
                <div
                    className={cx('ntf-toast', classNames?.root, className)}
                    data-tone={tone ?? runtime.tone}
                    data-status={content.status}
                    data-compact={compact ? '' : undefined}
                    style={rootStyle}
                >
                    {children ?? <ToastContentView {...content} />}
                </div>
            </NumbersContext.Provider>
        </SlotContext.Provider>
    )
}

export const Toast = Object.assign(ToastRoot, {
    Icon,
    Avatar,
    Body,
    Title,
    Description,
    Progress,
    Number: Digits,
    Actions,
    Action,
    Close
})
