type Row = {
    name: string
    type: string
    default: string
    description: string
}

type TableProps = {
    title: string
    rows: Row[]
}

const NOTIFIER: Row[] = [
    {
        name: 'position',
        type: 'ToastPosition',
        default: "'bottom-right'",
        description: 'Where toasts appear'
    },
    {
        name: 'tone',
        type: "'light' | 'dark' | 'auto'",
        default: "'light'",
        description: 'Tone for toasts that do not set one. auto follows the system'
    },
    {
        name: 'maxVisible',
        type: 'number',
        default: '3',
        description: 'Open toasts per position before the oldest is replaced'
    },
    {
        name: 'duration',
        type: 'number',
        default: '5000',
        description: 'Milliseconds before a toast closes, 0 keeps it open'
    },
    {
        name: 'swipe',
        type: 'boolean',
        default: 'true',
        description: 'Swipe a toast towards its edge to dismiss it'
    },
    {
        name: 'pauseOnHover',
        type: 'boolean',
        default: 'true',
        description: 'Hold every timer while the pointer or focus is inside a toast'
    },
    {
        name: 'close',
        type: 'boolean',
        default: 'true',
        description: 'Show the close button on toasts that do not set it'
    },
    {
        name: 'hotkey',
        type: 'string | false',
        default: "'alt+t'",
        description: 'Moves focus to the newest open toast. Escape dismisses the focused toast'
    },
    {
        name: 'stack',
        type: 'boolean',
        default: 'false',
        description: 'Overlap toasts into a stack that expands on hover'
    },
    {
        name: 'offset',
        type: 'number | { x?, y? }',
        default: '24',
        description: 'Distance from the screen edges in px'
    },
    { name: 'gap', type: 'number', default: '12', description: 'Space between toasts in px' },
    {
        name: 'theme',
        type: 'ToastTheme',
        default: '-',
        description: 'Token overrides per tone, plus font, radius and width'
    },
    { name: 'nonce', type: 'string', default: '-', description: 'CSP nonce for the stylesheet' }
]

const INPUT: Row[] = [
    { name: 'title', type: 'ReactNode', default: '-', description: 'First line, semibold' },
    {
        name: 'meta',
        type: 'ReactNode',
        default: '-',
        description: 'Muted text after a divider, next to the title'
    },
    {
        name: 'description',
        type: 'ReactNode',
        default: '-',
        description: 'Body text under the title'
    },
    {
        name: 'status',
        type: "'success' | 'error' | 'warning' | 'info' | 'loading'",
        default: '-',
        description:
            'Adds a status icon. Loading stays open, errors and warnings are announced as alerts'
    },
    {
        name: 'icon',
        type: 'IconConfig | ReactElement',
        default: '-',
        description:
            "{ shape: 'ring' | 'box' | 'circle' | 'bare', status?, node? }. An element goes in a box"
    },
    {
        name: 'avatar',
        type: 'AvatarConfig',
        default: '-',
        description: "{ src, alt, fallback, badge: 'online' | 'away' | 'busy' | 'offline', shape }"
    },
    {
        name: 'progress',
        type: 'number | { value: number | null, label? }',
        default: '-',
        description: 'A bar. null is indeterminate. Stays open until it reaches 100'
    },
    {
        name: 'actions',
        type: 'ActionConfig[]',
        default: '-',
        description:
            "{ label, onClick, variant: 'text' | 'outline' | 'filled', color: 'default' | 'muted' | 'accent', dismiss, href, disabled }"
    },
    { name: 'close', type: 'boolean', default: 'true', description: 'Show the close button' },
    {
        name: 'tone',
        type: "'light' | 'dark'",
        default: 'Notifier tone',
        description: 'Surface for this toast'
    },
    {
        name: 'id',
        type: 'string',
        default: 'generated',
        description: 'Passing an existing id updates that toast in place'
    },
    {
        name: 'position',
        type: 'ToastPosition',
        default: 'Notifier position',
        description: 'Override where this toast appears'
    },
    {
        name: 'duration',
        type: 'number',
        default: 'Notifier duration',
        description: 'Milliseconds, 0 keeps it open'
    },
    {
        name: 'swipe',
        type: 'boolean',
        default: 'Notifier swipe',
        description: 'Allow swiping this toast away'
    },
    { name: 'width', type: 'number | string', default: '400', description: 'Toast width' },
    {
        name: 'className / classNames / style',
        type: 'string / Partial<Record<ToastSlot, string>> / CSSProperties',
        default: '-',
        description: 'Style hooks for the root and for every slot'
    },
    {
        name: 'onOpen / onDismiss / onClose',
        type: '(id, reason?) => void',
        default: '-',
        description: 'Lifecycle callbacks. onClose fires after the exit animation'
    }
]

const METHODS: { signature: string; description: string }[] = [
    { signature: 'notify(title | input)', description: 'Open a toast, returns its id' },
    {
        signature: 'notify.success | error | warning | info | loading(title, input?)',
        description: 'Shortcuts that set status'
    },
    { signature: 'notify.update(id, patch)', description: 'Merge a patch into an open toast' },
    { signature: 'notify.dismiss(id?)', description: 'Close one toast, or all of them' },
    {
        signature: 'notify.promise(promise, { loading, success, error })',
        description: 'Loading toast that turns into success or error'
    },
    {
        signature: 'notify.custom(render, options?)',
        description: 'Render your own content with the Toast primitives'
    },
    { signature: 'useToast()', description: '{ id, tone, dismiss, update } inside a toast' }
]

const PRIMITIVES: { name: string; description: string }[] = [
    { name: 'Toast', description: 'Surface. Takes content props, or children for a custom layout' },
    { name: 'Toast.Icon', description: 'shape, status, node' },
    { name: 'Toast.Avatar', description: 'src, alt, fallback, badge, shape' },
    { name: 'Toast.Body', description: 'Column that holds the text, progress and actions' },
    { name: 'Toast.Title', description: 'meta adds a divider and muted text' },
    { name: 'Toast.Description', description: 'Muted body text' },
    { name: 'Toast.Progress', description: 'value (null is indeterminate), label' },
    { name: 'Toast.Actions', description: 'Row of actions, aside adds trailing content' },
    { name: 'Toast.Action', description: 'variant, color, onClick, dismiss, href' },
    { name: 'Toast.Close', description: 'Close button' }
]

const TOKENS =
    'background, foreground, body, meta, muted, icon, divider, border, shadow, accent, accentText, accentForeground, track, control, controlBorder, controlForeground, controlShadow, controlHover, success, error, warning, info'

function PropsTable({ title, rows }: TableProps) {
    return (
        <div className='overflow-x-auto'>
            <h3 className='border-border text-foreground border-b px-6 py-3 font-mono text-xs'>
                {title}
            </h3>
            <table className='w-full border-collapse text-[13px]'>
                <thead>
                    <tr className='border-border border-b'>
                        {['Name', 'Type', 'Default', 'Description'].map((heading) => (
                            <th
                                key={heading}
                                className='text-faint px-3 py-2.5 text-left font-mono text-[11px] font-medium tracking-wider uppercase first:px-6'
                            >
                                {heading}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr
                            key={row.name}
                            className='border-border hover:bg-muted border-b transition-colors last:border-b-0'
                        >
                            <td className='text-foreground px-6 py-2.5 font-mono whitespace-nowrap'>
                                {row.name}
                            </td>
                            <td className='text-muted-foreground px-3 py-2.5 font-mono'>
                                {row.type}
                            </td>
                            <td className='text-faint px-3 py-2.5 font-mono'>{row.default}</td>
                            <td className='text-muted-foreground px-3 py-2.5'>{row.description}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export function ApiReference() {
    return (
        <div>
            <div className='border-border border-b'>
                <PropsTable title='<Notifier /> props' rows={NOTIFIER} />
            </div>
            <div className='border-border border-b'>
                <PropsTable title='notify(input) and <Toast /> props' rows={INPUT} />
            </div>
            <div className='border-border border-b'>
                <h3 className='border-border text-foreground border-b px-6 py-3 font-mono text-xs'>
                    Methods
                </h3>
                {METHODS.map((method) => (
                    <div
                        key={method.signature}
                        className='border-border flex flex-col gap-1 border-b px-6 py-3 font-mono text-xs last:border-b-0 md:flex-row md:items-baseline md:gap-4'
                    >
                        <span className='text-foreground'>{method.signature}</span>
                        <span className='text-faint'>{method.description}</span>
                    </div>
                ))}
            </div>
            <div className='border-border border-b'>
                <h3 className='border-border text-foreground border-b px-6 py-3 font-mono text-xs'>
                    Primitives
                </h3>
                {PRIMITIVES.map((primitive) => (
                    <div
                        key={primitive.name}
                        className='border-border flex flex-col gap-1 border-b px-6 py-3 font-mono text-xs last:border-b-0 md:flex-row md:items-baseline md:gap-4'
                    >
                        <span className='text-foreground'>{primitive.name}</span>
                        <span className='text-faint'>{primitive.description}</span>
                    </div>
                ))}
            </div>
            <div className='px-6 py-4'>
                <h3 className='text-foreground font-mono text-xs'>Theme tokens</h3>
                <p className='text-muted-foreground mt-2 max-w-3xl font-mono text-xs leading-relaxed'>
                    {TOKENS}
                </p>
                <p className='text-faint mt-2 text-xs'>
                    Each token is a CSS variable per tone, for example --ntf-dark-background and
                    --ntf-light-accent. Inside a toast they are also readable without the tone, as
                    var(--ntf-accent-text).
                </p>
            </div>
        </div>
    )
}
