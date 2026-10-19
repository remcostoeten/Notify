'use client'
import { notify, Notifier, Toast } from '@remcostoeten/notifier'
import type {
    IconShape,
    ToastInput,
    ToastPosition,
    ToastStatus,
    ToastTone
} from '@remcostoeten/notifier'
import { Sparkles } from 'lucide-react'
import { useState } from 'react'
import { CodeBlock, CodeBlockCopyButton } from '@/components/code-block'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { PrimaryButton, Stage } from './ui'

type Media = ToastStatus | 'none' | 'icon' | 'avatar'

type Draft = {
    tone: ToastTone
    media: Media
    shape: IconShape
    meta: boolean
    description: boolean
    progress: 'none' | 'determinate' | 'indeterminate'
    actions: 'none' | 'text' | 'buttons'
    close: boolean
}

type Setup = {
    position: ToastPosition
    stack: boolean
    duration: number
    maxVisible: number
}

type Field = {
    label: string
    value: string
    onChange: (value: string) => void
    options: [string, string][]
}

const positions: ToastPosition[] = [
    'bottom-right',
    'bottom-center',
    'bottom-left',
    'top-right',
    'top-center',
    'top-left'
]

const statuses: ToastStatus[] = ['success', 'error', 'warning', 'info', 'loading']

const titles: Record<ToastStatus, string> = {
    success: 'Changes saved',
    error: 'Could not save changes',
    warning: 'Storage almost full',
    info: 'New version available',
    loading: 'Syncing your workspace'
}

const portrait = `data:image/svg+xml;utf8,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="#eadfbf"/><path d="M12 80c2-17 15-23 28-23s26 6 28 23z" fill="#f2b631"/><ellipse cx="40" cy="37" rx="13" ry="16" fill="#8a5a3c"/><path d="M26 34c0-14 8-21 14-21s14 7 14 21c-3-8-8-11-14-11s-11 3-14 11z" fill="#1d2a2e"/></svg>'
)}`

function isStatus(media: Media): media is ToastStatus {
    return statuses.some((status) => status === media)
}

function buildInput(draft: Draft): ToastInput {
    const { media, shape } = draft
    const status = isStatus(media) ? media : undefined
    const input: ToastInput = {
        tone: draft.tone,
        status,
        title: status
            ? titles[status]
            : media === 'avatar'
              ? 'Sienna Hewitt'
              : 'Weekly report is ready',
        description: draft.description
            ? 'Your changes have been saved and your profile is live. Your team can make edits.'
            : undefined,
        meta: draft.meta ? (media === 'avatar' ? '2 mins ago' : 'v4.2') : undefined,
        progress:
            draft.progress === 'determinate'
                ? 60
                : draft.progress === 'indeterminate'
                  ? { value: null }
                  : undefined,
        actions:
            draft.actions === 'text'
                ? [
                      { label: 'Dismiss', color: 'muted' },
                      { label: 'View', color: 'default' }
                  ]
                : draft.actions === 'buttons'
                  ? [
                        { label: 'Dismiss', variant: 'outline' },
                        { label: 'Open', variant: 'filled', color: 'accent' }
                    ]
                  : undefined,
        close: draft.close
    }
    if (status) input.icon = { shape, status }
    if (media === 'icon')
        input.icon = { shape, node: <Sparkles style={{ color: 'var(--ntf-accent-text)' }} /> }
    if (media === 'avatar') input.avatar = { src: portrait, alt: 'Sienna Hewitt', badge: 'online' }
    return input
}

function toCode(draft: Draft): string {
    const { media, shape } = draft
    const status = isStatus(media) ? media : undefined
    const lines = [`  tone: '${draft.tone}',`]
    if (status) {
        lines.push(
            shape === 'circle'
                ? `  status: '${status}',`
                : `  icon: { shape: '${shape}', status: '${status}' },`
        )
    }
    if (media === 'icon') lines.push(`  icon: { shape: '${shape}', node: <Sparkles /> },`)
    if (media === 'avatar') lines.push(`  avatar: { src: portrait, badge: 'online' },`)
    lines.push(
        `  title: '${status ? titles[status] : media === 'avatar' ? 'Sienna Hewitt' : 'Weekly report is ready'}',`
    )
    if (draft.meta) lines.push(`  meta: '${media === 'avatar' ? '2 mins ago' : 'v4.2'}',`)
    if (draft.description) lines.push(`  description: 'Your team can make edits.',`)
    if (draft.progress === 'determinate') lines.push('  progress: 60,')
    if (draft.progress === 'indeterminate') lines.push('  progress: { value: null },')
    if (draft.actions === 'text') {
        lines.push(
            "  actions: [\n    { label: 'Dismiss', color: 'muted' },\n    { label: 'View' }\n  ],"
        )
    }
    if (draft.actions === 'buttons') {
        lines.push(
            "  actions: [\n    { label: 'Dismiss', variant: 'outline' },\n    { label: 'Open', variant: 'filled', color: 'accent' }\n  ],"
        )
    }
    if (!draft.close) lines.push('  close: false,')
    return `notify({\n${lines.join('\n')}\n})`
}

export function Playground() {
    const [draft, setDraft] = useState<Draft>({
        tone: 'dark',
        media: 'success',
        shape: 'circle',
        meta: false,
        description: true,
        progress: 'none',
        actions: 'text',
        close: true
    })
    const [setup, setSetup] = useState<Setup>({
        position: 'bottom-right',
        stack: false,
        duration: 5000,
        maxVisible: 3
    })

    function patch(change: Partial<Draft>) {
        setDraft((current) => ({ ...current, ...change }))
    }

    function configure(change: Partial<Setup>) {
        setSetup((current) => ({ ...current, ...change }))
    }

    const input = buildInput(draft)

    const fields: Field[] = [
        {
            label: 'Tone',
            value: draft.tone,
            onChange: (value) => patch({ tone: value === 'dark' ? 'dark' : 'light' }),
            options: [
                ['light', 'light'],
                ['dark', 'dark']
            ]
        },
        {
            label: 'Media',
            value: draft.media,
            onChange: (value) => patch({ media: value as Media }),
            options: [
                ['none', 'none'],
                ...statuses.map((status): [string, string] => [status, `status: ${status}`]),
                ['icon', 'custom icon'],
                ['avatar', 'avatar']
            ]
        },
        {
            label: 'Icon shape',
            value: draft.shape,
            onChange: (value) => patch({ shape: value as IconShape }),
            options: [
                ['ring', 'ring'],
                ['box', 'box'],
                ['circle', 'circle'],
                ['bare', 'bare']
            ]
        },
        {
            label: 'Progress',
            value: draft.progress,
            onChange: (value) => patch({ progress: value as Draft['progress'] }),
            options: [
                ['none', 'none'],
                ['determinate', '60%'],
                ['indeterminate', 'indeterminate']
            ]
        },
        {
            label: 'Actions',
            value: draft.actions,
            onChange: (value) => patch({ actions: value as Draft['actions'] }),
            options: [
                ['none', 'none'],
                ['text', 'text links'],
                ['buttons', 'buttons']
            ]
        },
        {
            label: 'Position',
            value: setup.position,
            onChange: (value) => configure({ position: value as ToastPosition }),
            options: positions.map((position): [string, string] => [position, position])
        },
        {
            label: 'Duration',
            value: String(setup.duration),
            onChange: (value) => configure({ duration: Number(value) }),
            options: [
                ['2000', '2s'],
                ['5000', '5s'],
                ['8000', '8s'],
                ['0', 'persistent']
            ]
        },
        {
            label: 'Max visible',
            value: String(setup.maxVisible),
            onChange: (value) => configure({ maxVisible: Number(value) }),
            options: [
                ['1', '1'],
                ['3', '3'],
                ['5', '5']
            ]
        }
    ]

    const switches: [string, string, boolean, (value: boolean) => void][] = [
        ['meta', 'Meta next to title', draft.meta, (value) => patch({ meta: value })],
        ['description', 'Description', draft.description, (value) => patch({ description: value })],
        ['close', 'Close button', draft.close, (value) => patch({ close: value })],
        ['stack', 'Stacked (hover to expand)', setup.stack, (value) => configure({ stack: value })]
    ]

    const notifierCode = `<Notifier\n  position='${setup.position}'\n  duration={${setup.duration}}\n  maxVisible={${setup.maxVisible}}${setup.stack ? '\n  stack' : ''}\n/>`

    return (
        <div>
            <div className='grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]'>
                <div className='border-border flex items-stretch border-b p-6 md:border-r'>
                    <Stage className='min-h-[320px] flex-1'>
                        <Toast {...input} />
                    </Stage>
                </div>
                <div className='border-border grid grid-cols-2 border-b'>
                    {fields.map((field) => (
                        <div
                            key={field.label}
                            className='border-border flex flex-col gap-2 border-r border-b p-4 [&:nth-child(2n)]:border-r-0'
                        >
                            <Label className='text-faint font-mono text-[11px] tracking-wider uppercase'>
                                {field.label}
                            </Label>
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger className='h-8 text-[13px]'>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {field.options.map(([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    ))}
                </div>
            </div>

            <div className='grid grid-cols-2 md:grid-cols-4'>
                {switches.map(([id, label, checked, onChange]) => (
                    <div
                        key={id}
                        className='border-border flex items-center gap-3 border-r border-b p-4'
                    >
                        <Switch id={id} checked={checked} onCheckedChange={onChange} />
                        <Label
                            htmlFor={id}
                            className='text-muted-foreground cursor-pointer text-[13px] font-normal'
                        >
                            {label}
                        </Label>
                    </div>
                ))}
            </div>

            <div className='border-border flex items-center justify-between gap-4 border-b px-6 py-4'>
                <span className='text-faint hidden font-mono text-[11px] tracking-[0.2em] uppercase sm:block'>
                    The toast above is the same input
                </span>
                <PrimaryButton
                    className='h-8 px-4 text-[13px]'
                    onClick={() => notify({ ...input, duration: setup.duration })}
                >
                    Show toast
                </PrimaryButton>
            </div>

            <div className='border-border grid grid-cols-1 border-b md:grid-cols-2'>
                <div className='md:border-border md:border-r'>
                    <div className='px-6 py-3'>
                        <span className='text-faint font-mono text-[11px] tracking-[0.2em] uppercase'>
                            Toast
                        </span>
                    </div>
                    <CodeBlock
                        code={toCode(draft)}
                        language='tsx'
                        showLineNumbers={false}
                        className='border-0 border-t text-xs'
                    >
                        <CodeBlockCopyButton />
                    </CodeBlock>
                </div>
                <div className='border-border border-t md:border-t-0'>
                    <div className='px-6 py-3'>
                        <span className='text-faint font-mono text-[11px] tracking-[0.2em] uppercase'>
                            Notifier
                        </span>
                    </div>
                    <CodeBlock
                        code={notifierCode}
                        language='tsx'
                        showLineNumbers={false}
                        className='border-0 border-t text-xs'
                    >
                        <CodeBlockCopyButton />
                    </CodeBlock>
                </div>
            </div>

            <Notifier
                position={setup.position}
                stack={setup.stack}
                duration={setup.duration}
                maxVisible={setup.maxVisible}
            />
        </div>
    )
}
