'use client'
import { notify, Notifier } from '@remcostoeten/notifier'
import type { NotifyPositionType, ColorMode, RadiusVariant } from '@remcostoeten/notifier'
import { useState } from 'react'
import { CodeBlock, CodeBlockCopyButton } from '@/components/code-block'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Bot, Check, Copy } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

function Button({
    onClick,
    children,
    className = ''
}: {
    onClick: () => void
    children: React.ReactNode
    className?: string
}) {
    return (
        <button
            onClick={onClick}
            className={`border-border text-muted-foreground hover:border-border-strong hover:text-foreground focus-visible:outline-ring border bg-transparent px-3 py-1.5 font-mono text-xs transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 ${className}`}
        >
            {children}
        </button>
    )
}

function PrimaryButton({
    onClick,
    children,
    className = ''
}: {
    onClick: () => void
    children: React.ReactNode
    className?: string
}) {
    return (
        <button
            onClick={onClick}
            className={`bg-foreground text-background focus-visible:outline-ring h-10 px-5 text-sm font-medium transition-colors hover:bg-[#cccccc] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 ${className}`}
        >
            {children}
        </button>
    )
}

function SectionHeading({ id, label, hint }: { id?: string; label: string; hint?: string }) {
    return (
        <div
            id={id}
            className='border-border flex scroll-mt-16 items-baseline justify-between border-b px-6 py-4'
        >
            <h2 className='text-muted-foreground font-mono text-[11px] font-medium uppercase tracking-[0.2em]'>
                {label}
            </h2>
            {hint && <span className='text-faint hidden text-xs sm:block'>{hint}</span>}
        </div>
    )
}

function InstallCommand() {
    const [copied, setCopied] = useState(false)

    const copy = async () => {
        await navigator.clipboard.writeText(SNIPPETS.install)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <button
            onClick={copy}
            className='border-border text-muted-foreground hover:border-border-strong hover:text-foreground focus-visible:outline-ring group flex h-10 items-center gap-3 border px-4 font-mono text-[13px] transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2'
        >
            <span className='text-faint select-none'>$</span>
            <span>{SNIPPETS.install}</span>
            {copied ? (
                <Check size={13} className='text-foreground' />
            ) : (
                <Copy
                    size={13}
                    className='text-faint group-hover:text-foreground transition-colors'
                />
            )}
        </button>
    )
}

const SNIPPETS = {
    install: 'npm install @remcostoeten/notifier',
    setup: `// app/layout.tsx
import { Notifier } from '@remcostoeten/notifier'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <Notifier position="bottom" colorMode="dark" />
      </body>
    </html>
  )
}`,
    usage: `import { notify } from '@remcostoeten/notifier'

notify('Hello world')
notify.success('Saved successfully')
notify.error('Something went wrong')
notify.loading('Processing...')`,
    info: "notify('Default notification')",
    success: "notify.success('Saved to database')",
    error: "notify.error('Connection failed')",
    loading: "notify.loading('Processing...')",
    chain: `const n = notify.loading('Calculating...')
setTimeout(() => {
  n.loading('Still working...')
  setTimeout(() => n.success('Done!'), 1500)
}, 1500)`,
    promise: `const promise = fetch('/api/data')
notify.promise(promise, {
  loading: 'Fetching...',
  success: (data) => \`Loaded \${data.length} items\`,
  error: (err) => \`Error: \${err.message}\`
})`,
    confirm: `const confirmed = await notify({}).confirm('Delete this item?', {
  confirmLabel: 'Delete',
  cancelLabel: 'Cancel'
})
if (confirmed) notify.success('Deleted')`,
    action: `notify.success('File moved to trash', {
  duration: 5000,
  action: { label: 'Undo', onClick: () => restoreFile() }
})`,
    position: (pos: string) => `notify('Message', { position: '${pos}' })`,
    migration_shadcn: `// layout.tsx
- import { Toaster } from "@/components/ui/toaster"
+ import { Notifier } from "@remcostoeten/notifier"

export default function RootLayout({ children }) {
  return (
    <body>
      {children}
-     <Toaster />
+     <Notifier />
    </body>
  )
}`,
    migration_hottoast: `// Drop-in replacement for most calls
- import toast from 'react-hot-toast'
+ import { notify } from '@remcostoeten/notifier'

// Usage is identical
notify.success('Saved!')
notify.error('Error!')
notify.promise(save(), { ... })`
}

const PROPS_NOTIFIER = [
    {
        prop: 'position',
        type: 'NotifyPositionType',
        default: '"bottom"',
        desc: 'Default position for notifications'
    },
    { prop: 'maxVisible', type: 'number', default: '5', desc: 'Max notifications visible at once' },
    { prop: 'duration', type: 'number', default: '3000', desc: 'Auto-dismiss duration (ms)' },
    {
        prop: 'colorMode',
        type: '"dark" | "light" | "auto"',
        default: '"dark"',
        desc: 'Color theme'
    },
    {
        prop: 'radius',
        type: '"pill" | "rounded" | "squared"',
        default: '"squared"',
        desc: 'Border radius style'
    },
    {
        prop: 'iconColor',
        type: '"colored" | "neutral" | "hidden"',
        default: '"colored"',
        desc: 'Icon styling mode'
    },
    { prop: 'swipeToDismiss', type: 'boolean', default: 'true', desc: 'Enable swipe gestures' },
    { prop: 'pauseOnHover', type: 'boolean', default: 'true', desc: 'Pause timer on hover' },
    {
        prop: 'clickToDismiss',
        type: 'boolean',
        default: 'false',
        desc: 'Click anywhere to dismiss'
    },
    { prop: 'dismissible', type: 'boolean', default: 'false', desc: 'Show dismiss button' },
    { prop: 'gap', type: 'number', default: '8', desc: 'Gap between stacked notifications (px)' },
    {
        prop: 'stack',
        type: 'boolean',
        default: 'false',
        desc: 'Collapse into an overlapping stack, hover to expand'
    },
    {
        prop: 'offset',
        type: 'number | { x?, y? }',
        default: '16',
        desc: 'Offset from screen edges (px)'
    },
    { prop: 'theme', type: 'ThemePalette', default: '-', desc: 'Custom color palette overrides' }
]

const PROPS_NOTIFY = [
    { prop: 'message', type: 'string', default: '-', desc: 'Notification message' },
    {
        prop: 'position',
        type: 'NotifyPositionType',
        default: '-',
        desc: 'Override default position'
    },
    { prop: 'duration', type: 'number', default: '3000', desc: 'Auto-dismiss duration (ms)' },
    { prop: 'dismissible', type: 'boolean', default: 'false', desc: 'Show dismiss button' },
    { prop: 'pauseOnHover', type: 'boolean', default: 'true', desc: 'Pause timer on hover' },
    { prop: 'swipeToDismiss', type: 'boolean', default: 'true', desc: 'Enable swipe to dismiss' },
    { prop: 'clickToDismiss', type: 'boolean', default: 'false', desc: 'Click to dismiss' },
    { prop: 'action', type: '{ label, onClick }', default: '-', desc: 'Action button config' },
    {
        prop: 'onOpen',
        type: '(id) => void',
        default: '-',
        desc: 'Called when notification appears'
    },
    { prop: 'onClose', type: '(id) => void', default: '-', desc: 'Called after exit animation' },
    { prop: 'onDismiss', type: '(id, reason) => void', default: '-', desc: 'Called on dismiss' }
]

const METHODS = [
    { sig: 'notify(message, options?)', desc: 'Default info notification' },
    { sig: 'notify.success(message, options?)', desc: 'Success state' },
    { sig: 'notify.error(message, options?)', desc: 'Error state' },
    { sig: 'notify.loading(message, options?)', desc: 'Loading spinner' },
    { sig: 'notify.promise(promise, messages)', desc: 'Track async operations' },
    { sig: 'notify.dismiss(id?)', desc: 'Dismiss by id or all' },
    { sig: 'instance.confirm(message, options)', desc: 'Await user confirmation' }
]

const NAV_LINKS = [
    { href: '#playground', label: 'Playground' },
    { href: '#examples', label: 'Examples' },
    { href: '#api-reference', label: 'API' },
    { href: '#migration', label: 'Migration' }
]

function PropsTable({ title, data }: { title: string; data: typeof PROPS_NOTIFIER }) {
    return (
        <div className='overflow-x-auto'>
            <h3 className='border-border text-foreground border-b px-6 py-3 font-mono text-xs'>
                {title}
            </h3>
            <table className='w-full border-collapse text-[13px]'>
                <thead>
                    <tr className='border-border border-b'>
                        <th className='text-faint px-6 py-2.5 text-left font-mono text-[11px] font-medium uppercase tracking-wider'>
                            Prop
                        </th>
                        <th className='text-faint px-3 py-2.5 text-left font-mono text-[11px] font-medium uppercase tracking-wider'>
                            Type
                        </th>
                        <th className='text-faint px-3 py-2.5 text-left font-mono text-[11px] font-medium uppercase tracking-wider'>
                            Default
                        </th>
                        <th className='text-faint px-3 py-2.5 text-left font-mono text-[11px] font-medium uppercase tracking-wider'>
                            Description
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row) => (
                        <tr
                            key={row.prop}
                            className='border-border hover:bg-muted border-b transition-colors last:border-b-0'
                        >
                            <td className='text-foreground whitespace-nowrap px-6 py-2.5 font-mono'>
                                {row.prop}
                            </td>
                            <td className='text-muted-foreground px-3 py-2.5 font-mono'>
                                {row.type}
                            </td>
                            <td className='text-faint px-3 py-2.5 font-mono'>{row.default}</td>
                            <td className='text-muted-foreground px-3 py-2.5'>{row.desc}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default function Home() {
    const [activeCode, setActiveCode] = useState(SNIPPETS.usage)
    const [activeLang, setActiveLang] = useState('typescript')

    const [position, setPosition] = useState<NotifyPositionType>('bottom-right')
    const [radius, setRadius] = useState<RadiusVariant>('squared')
    const [colorMode, setColorMode] = useState<ColorMode>('dark')
    const [duration, setDuration] = useState(3000)
    const [maxVisible, setMaxVisible] = useState(5)
    const [gap, setGap] = useState(8)
    const [swipeToDismiss, setSwipeToDismiss] = useState(true)
    const [pauseOnHover, setPauseOnHover] = useState(true)
    const [clickToDismiss, setClickToDismiss] = useState(false)
    const [dismissible, setDismissible] = useState(false)
    const [stack, setStack] = useState(false)
    const [iconColor, setIconColor] = useState<'colored' | 'neutral' | 'hidden'>('colored')

    const generatedCode = `<Notifier
  position="${position}"
  colorMode="${colorMode}"
  radius="${radius}"
  duration={${duration}}
  maxVisible={${maxVisible}}
  gap={${gap}}
  stack={${stack}}
  swipeToDismiss={${swipeToDismiss}}
  pauseOnHover={${pauseOnHover}}
  clickToDismiss={${clickToDismiss}}
  dismissible={${dismissible}}
  iconColor="${iconColor}"
/>`

    const copyPrompt = async () => {
        const prompt = `// Prompt for installing @remcostoeten/notifier

I want you to install a package called Notifier, listed on npm as \`@remcostoeten/notifier\` to be exact. Essentially it is exactly the same principle as Sonner toast or react-hot-toast.

### Installation

We prefer bun but check the root of the project which lock file is present and use that package manager to install notifier.

\`bun add @remcostoeten/notifier\`
\`npm install @remcostoeten/notifier\`
\`yarn add @remcostoeten/notifier\`
\`pnpm add @remcostoeten/notifier\`

Once installed the only thing to setup the notifier is to render the \`<Notifier />\` component in our app so that it is globally available.

In next.js projects you can do this in the root layout.tsx file. In react or other react-like frameworks do so in the equivalent file.

Basic Example:
\`\`\`tsx
import type { Metadata } from "next";
import "./globals.css";
import { Notifier } from '@remcostoeten/notifier'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Notifier />
      </body>
    </html>
  );
}
\`\`\`

The \`<Notifier />\` accepts various options. We want to configure it EXACTLY like this:
\`\`\`tsx
${generatedCode}
\`\`\`

Now it can be used like this:
\`\`\`tsx
import { notify } from '@remcostoeten/notifier'

function someCallback() {
  try {
    someCallback()
    notify.success("Success")
  } catch (e) {
    notify.error("Error")
  }
}
\`\`\`

To visualize this for the user create a file in the components folder called \`_notify-demo.tsx\`

\`\`\`tsx
'use client'
import { notify } from '@remcostoeten/notifier'

export function NotifyDemo() {
  return (
    <div className="flex flex-wrap gap-2 p-4">
      <button onClick={() => notify.success('Success!')} className="px-3 py-2 bg-green-500 text-white rounded">Success</button>
      <button onClick={() => notify.error('Error!')} className="px-3 py-2 bg-red-500 text-white rounded">Error</button>
      <button onClick={() => notify.loading('Loading...')} className="px-3 py-2 bg-blue-500 text-white rounded">Loading</button>
      <button onClick={() => {
        const n = notify.loading('Working...')
        setTimeout(() => n.success('Done!'), 2000)
      }} className="px-3 py-2 bg-purple-500 text-white rounded">Chain</button>
    </div>
  )
}
\`\`\`

And then render that component in the {children} index page of the root layout.tsx file (e.g. app/page.tsx).

After this is done notify the user that the notifier is ready to be used.

Instruct the user with some usage examples:
- \`notify('Hello')\` - Basic notification
- \`notify.success('Saved!')\` - Success state
- \`notify.error('Failed')\` - Error state
- \`notify.loading('Working...')\` - Loading spinner
- \`notify.promise(promise, { loading, success, error })\` - Track async ops

Also instruct him to view the demo page and that when done testing, he can remove the demo:
- Delete: \`rm components/_notify-demo.tsx\`
- Remove the <NotifyDemo /> import and usage from the page

Full docs & demo: https://remcostoeten-notify.vercel.app
Repository: https://github.com/remcostoeten/notifier
NPM: https://www.npmjs.com/package/@remcostoeten/notifier
`

        await navigator.clipboard.writeText(prompt)
        notify.success('LLM prompt copied to clipboard')
    }

    const setCode = (code: string, lang = 'typescript') => {
        setActiveCode(code)
        setActiveLang(lang)
    }

    function handleHeroChain() {
        const n = notify.loading('Building your app...')
        setTimeout(() => {
            n.loading('Deploying to production...')
            setTimeout(() => n.success('Shipped'), 1400)
        }, 1400)
    }

    function handleChain() {
        setCode(SNIPPETS.chain)
        const n = notify.loading('Calculating...')
        setTimeout(() => {
            n.loading('Still working...')
            setTimeout(() => n.success('Done!'), 1500)
        }, 1500)
    }

    function handlePromise() {
        setCode(SNIPPETS.promise)
        const promise = new Promise<string>((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.5) resolve('Data loaded')
                else reject(new Error('Random failure'))
            }, 2000)
        })
        notify.promise(promise, {
            loading: 'Fetching...',
            success: (data: unknown) => `Success: ${data}`,
            error: (err: unknown) => `Error: ${err instanceof Error ? err.message : String(err)}`
        })
    }

    async function handleConfirm() {
        setCode(SNIPPETS.confirm)
        const n = notify({})
        const confirmed = await n.confirm('Delete this item?', {
            confirmLabel: 'Delete',
            cancelLabel: 'Cancel'
        })
        if (confirmed) n.success('Deleted')
        else n.info('Cancelled')
    }

    function handleAction() {
        setCode(SNIPPETS.action)
        const n = notify.success('File moved to trash', {
            duration: 5000,
            action: {
                label: 'Undo',
                onClick: () => {
                    n.loading('Restoring...')
                    setTimeout(() => n.success('Restored'), 800)
                }
            }
        })
    }

    const positions: NotifyPositionType[] = [
        'top-left',
        'top-center',
        'top-right',
        'bottom-left',
        'bottom-center',
        'bottom-right'
    ]

    return (
        <div className='min-h-screen'>
            <header className='border-border bg-background sticky top-0 z-40 border-b'>
                <div className='border-border mx-auto flex h-14 max-w-5xl items-center justify-between border-x px-6'>
                    <a href='#' className='flex items-center gap-2.5'>
                        <span aria-hidden className='bg-foreground block h-2.5 w-2.5' />
                        <span className='text-foreground font-mono text-sm font-medium'>
                            notifier
                        </span>
                    </a>
                    <nav className='hidden items-center gap-6 md:flex'>
                        {NAV_LINKS.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className='text-muted-foreground hover:text-foreground text-[13px] transition-colors'
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>
                    <div className='flex items-center gap-5'>
                        <a
                            href='https://www.npmjs.com/package/@remcostoeten/notifier'
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-muted-foreground hover:text-foreground text-[13px] transition-colors'
                        >
                            npm
                        </a>
                        <a
                            href='https://github.com/remcostoeten/Notify'
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-muted-foreground hover:text-foreground text-[13px] transition-colors'
                        >
                            GitHub
                        </a>
                    </div>
                </div>
            </header>

            <main className='border-border mx-auto max-w-5xl border-x'>
                <section className='border-border border-b px-6 py-20 md:py-28'>
                    <p className='text-faint font-mono text-[11px] uppercase tracking-[0.25em]'>
                        @remcostoeten/notifier
                    </p>
                    <h1 className='text-foreground mt-5 max-w-2xl text-4xl font-semibold leading-[1.1] tracking-tight md:text-6xl'>
                        Notifications that chain.
                    </h1>
                    <p className='text-muted-foreground mt-5 max-w-xl text-base leading-relaxed'>
                        A Motion-animated notification system for React with a Sonner-like API. One
                        component in your layout, then{' '}
                        <code className='text-foreground font-mono text-[14px]'>
                            notify.loading().success()
                        </code>{' '}
                        anywhere.
                    </p>
                    <div className='mt-10 flex flex-wrap items-center gap-3'>
                        <PrimaryButton onClick={handleHeroChain}>Run the chain</PrimaryButton>
                        <InstallCommand />
                    </div>
                </section>

                <section>
                    <SectionHeading
                        id='playground'
                        label='Playground'
                        hint='Every change fires through the live Notifier below'
                    />
                    <div className='grid grid-cols-2 md:grid-cols-4'>
                        {(
                            [
                                {
                                    label: 'Position',
                                    value: position,
                                    onChange: (val: string) =>
                                        setPosition(val as NotifyPositionType),
                                    options: positions.map((p) => [p, p])
                                },
                                {
                                    label: 'Radius',
                                    value: radius,
                                    onChange: (val: string) => setRadius(val as RadiusVariant),
                                    options: [
                                        ['pill', 'pill'],
                                        ['rounded', 'rounded'],
                                        ['squared', 'squared']
                                    ]
                                },
                                {
                                    label: 'Theme',
                                    value: colorMode,
                                    onChange: (val: string) => setColorMode(val as ColorMode),
                                    options: [
                                        ['dark', 'dark'],
                                        ['light', 'light']
                                    ]
                                },
                                {
                                    label: 'Icon color',
                                    value: iconColor,
                                    onChange: (val: string) =>
                                        setIconColor(val as 'colored' | 'neutral' | 'hidden'),
                                    options: [
                                        ['colored', 'colored'],
                                        ['neutral', 'neutral'],
                                        ['hidden', 'hidden']
                                    ]
                                },
                                {
                                    label: 'Duration',
                                    value: String(duration),
                                    onChange: (val: string) => setDuration(Number(val)),
                                    options: [
                                        ['2000', '2s'],
                                        ['3000', '3s'],
                                        ['5000', '5s'],
                                        ['8000', '8s']
                                    ]
                                },
                                {
                                    label: 'Max visible',
                                    value: String(maxVisible),
                                    onChange: (val: string) => setMaxVisible(Number(val)),
                                    options: [
                                        ['1', '1'],
                                        ['3', '3'],
                                        ['5', '5'],
                                        ['10', '10']
                                    ]
                                },
                                {
                                    label: 'Gap',
                                    value: String(gap),
                                    onChange: (val: string) => setGap(Number(val)),
                                    options: [
                                        ['4', '4px'],
                                        ['8', '8px'],
                                        ['12', '12px'],
                                        ['16', '16px']
                                    ]
                                }
                            ] as const
                        ).map((field) => (
                            <div
                                key={field.label}
                                className='border-border flex flex-col gap-2 border-b border-r p-4'
                            >
                                <Label className='text-faint font-mono text-[11px] uppercase tracking-wider'>
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
                        <div className='border-border flex items-end border-b border-r p-4'>
                            <PrimaryButton
                                className='h-8 w-full px-3 text-[13px]'
                                onClick={() => notify.success('Changes applied', { position })}
                            >
                                Test notification
                            </PrimaryButton>
                        </div>
                    </div>

                    <div className='grid grid-cols-2 md:grid-cols-4'>
                        {(
                            [
                                ['swipe', 'Swipe to dismiss', swipeToDismiss, setSwipeToDismiss],
                                ['hover', 'Pause on hover', pauseOnHover, setPauseOnHover],
                                ['click', 'Click to dismiss', clickToDismiss, setClickToDismiss],
                                ['dismissible', 'Dismiss button', dismissible, setDismissible],
                                ['stack', 'Stacked (hover to expand)', stack, setStack]
                            ] as const
                        ).map(([id, label, checked, onChange]) => (
                            <div
                                key={id}
                                className='border-border flex items-center gap-3 border-b border-r p-4'
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

                    <div className='border-border border-b'>
                        <div className='flex items-center justify-between px-6 py-3'>
                            <span className='text-faint font-mono text-[11px] uppercase tracking-[0.2em]'>
                                Generated configuration
                            </span>
                        </div>
                        <CodeBlock
                            code={generatedCode}
                            language='tsx'
                            showLineNumbers={false}
                            className='border-0 border-t text-xs'
                        >
                            <div className='flex gap-1'>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                onClick={copyPrompt}
                                                className='text-muted-foreground hover:text-foreground p-2 transition-colors'
                                            >
                                                <Bot size={14} />
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent className='max-w-[280px] text-center'>
                                            <p>
                                                Copy LLM instructions to install Notifier with these
                                                exact settings in your project
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                <CodeBlockCopyButton />
                            </div>
                        </CodeBlock>
                    </div>
                </section>

                <Notifier
                    position={position}
                    radius={radius}
                    colorMode={colorMode}
                    duration={duration}
                    maxVisible={maxVisible}
                    gap={gap}
                    stack={stack}
                    swipeToDismiss={swipeToDismiss}
                    pauseOnHover={pauseOnHover}
                    clickToDismiss={clickToDismiss}
                    dismissible={dismissible}
                    iconColor={iconColor}
                />

                <section>
                    <SectionHeading
                        id='examples'
                        label='Examples'
                        hint='Click a button — the snippet that ran it appears below'
                    />
                    <div className='grid grid-cols-1 md:grid-cols-2'>
                        <div className='border-border space-y-3 border-b p-6 md:border-r'>
                            <h3 className='text-foreground font-mono text-xs'>Basic</h3>
                            <div className='flex flex-wrap gap-2'>
                                <Button
                                    onClick={() => {
                                        setCode(SNIPPETS.info)
                                        notify('Default notification')
                                    }}
                                >
                                    info
                                </Button>
                                <Button
                                    onClick={() => {
                                        setCode(SNIPPETS.success)
                                        notify.success('Saved')
                                    }}
                                >
                                    success
                                </Button>
                                <Button
                                    onClick={() => {
                                        setCode(SNIPPETS.error)
                                        notify.error('Failed')
                                    }}
                                >
                                    error
                                </Button>
                                <Button
                                    onClick={() => {
                                        setCode(SNIPPETS.loading)
                                        notify.loading('Loading...')
                                    }}
                                >
                                    loading
                                </Button>
                            </div>
                        </div>

                        <div className='border-border space-y-3 border-b p-6'>
                            <h3 className='text-foreground font-mono text-xs'>Chaining</h3>
                            <div className='flex flex-wrap gap-2'>
                                <Button onClick={handleChain}>state chain</Button>
                                <Button onClick={handlePromise}>promise</Button>
                            </div>
                        </div>

                        <div className='border-border space-y-3 border-b p-6 md:border-r'>
                            <h3 className='text-foreground font-mono text-xs'>Interactive</h3>
                            <div className='flex flex-wrap gap-2'>
                                <Button onClick={handleConfirm}>confirm dialog</Button>
                                <Button onClick={handleAction}>action button</Button>
                            </div>
                        </div>

                        <div className='border-border space-y-3 border-b p-6'>
                            <h3 className='text-foreground font-mono text-xs'>Positions</h3>
                            <div className='flex flex-wrap gap-2'>
                                {positions.map((pos) => (
                                    <Button
                                        key={pos}
                                        onClick={() => {
                                            setCode(SNIPPETS.position(pos))
                                            notify(pos, { position: pos })
                                        }}
                                    >
                                        {pos}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className='border-border border-b'>
                        <div className='px-6 py-3'>
                            <span className='text-faint font-mono text-[11px] uppercase tracking-[0.2em]'>
                                Last snippet
                            </span>
                        </div>
                        <CodeBlock
                            code={activeCode}
                            language={activeLang}
                            showLineNumbers={true}
                            className='border-0 border-t'
                        >
                            <CodeBlockCopyButton />
                        </CodeBlock>
                    </div>
                </section>

                <section>
                    <SectionHeading id='setup' label='Setup' />
                    <div className='space-y-4 p-6'>
                        <p className='text-muted-foreground text-sm'>
                            Place{' '}
                            <code className='text-foreground font-mono text-[13px]'>
                                {'<Notifier />'}
                            </code>{' '}
                            once in your root layout.{' '}
                            <a
                                href='#api-reference'
                                className='text-link hover:text-foreground transition-colors'
                            >
                                View all options →
                            </a>
                        </p>
                        <div className='text-muted-foreground grid grid-cols-2 gap-x-6 gap-y-1.5 font-mono text-xs md:grid-cols-3'>
                            <span>
                                <span className='text-foreground'>position</span>:
                                &quot;bottom&quot;
                            </span>
                            <span>
                                <span className='text-foreground'>duration</span>: 3000
                            </span>
                            <span>
                                <span className='text-foreground'>colorMode</span>: &quot;dark&quot;
                            </span>
                            <span>
                                <span className='text-foreground'>radius</span>: &quot;squared&quot;
                            </span>
                            <span>
                                <span className='text-foreground'>maxVisible</span>: 5
                            </span>
                            <span>
                                <span className='text-foreground'>swipeToDismiss</span>: true
                            </span>
                        </div>
                        <CodeBlock
                            code={SNIPPETS.setup}
                            language='tsx'
                            showLineNumbers={true}
                            fileName='app/layout.tsx'
                        >
                            <CodeBlockCopyButton />
                        </CodeBlock>
                    </div>
                </section>

                <section>
                    <SectionHeading id='api-reference' label='API reference' />
                    <div className='border-border border-b'>
                        <PropsTable title='<Notifier /> props' data={PROPS_NOTIFIER} />
                    </div>
                    <div className='border-border border-b'>
                        <PropsTable title='notify() options' data={PROPS_NOTIFY} />
                    </div>
                </section>

                <section>
                    <SectionHeading id='methods' label='Methods' />
                    <div className='border-border border-b'>
                        {METHODS.map((method) => (
                            <div
                                key={method.sig}
                                className='border-border flex flex-col gap-1 border-b px-6 py-3 font-mono text-xs last:border-b-0 md:flex-row md:items-baseline md:gap-4'
                            >
                                <span className='text-foreground'>{method.sig}</span>
                                <span className='text-faint'>{method.desc}</span>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <SectionHeading id='migration' label='Migration' />
                    <div className='border-border grid grid-cols-1 border-b md:grid-cols-2'>
                        <div className='md:border-border space-y-3 p-6 md:border-r'>
                            <h3 className='text-foreground text-sm font-medium'>
                                From shadcn/ui (Sonner/Toast)
                            </h3>
                            <p className='text-muted-foreground text-xs leading-relaxed'>
                                Notifier is lighter and built for the same modern aesthetic. Replace
                                the Toaster component in your layout.
                            </p>
                            <CodeBlock
                                code={SNIPPETS.migration_shadcn}
                                language='diff'
                                showLineNumbers={false}
                                className='text-xs'
                            >
                                <CodeBlockCopyButton />
                            </CodeBlock>
                        </div>

                        <div className='border-border space-y-3 border-t p-6 md:border-t-0'>
                            <h3 className='text-foreground text-sm font-medium'>
                                From react-hot-toast
                            </h3>
                            <p className='text-muted-foreground text-xs leading-relaxed'>
                                API compatible for basic methods. Switch imports and you&apos;re
                                mostly done.
                            </p>
                            <CodeBlock
                                code={SNIPPETS.migration_hottoast}
                                language='diff'
                                showLineNumbers={false}
                                className='text-xs'
                            >
                                <CodeBlockCopyButton />
                            </CodeBlock>
                        </div>
                    </div>
                </section>

                <footer className='flex flex-wrap items-center justify-between gap-4 px-6 py-8'>
                    <span className='text-faint font-mono text-xs'>MIT License</span>
                    <div className='flex items-center gap-5'>
                        <a
                            href='https://github.com/remcostoeten/Notify'
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-muted-foreground hover:text-foreground text-xs transition-colors'
                        >
                            GitHub
                        </a>
                        <a
                            href='https://www.npmjs.com/package/@remcostoeten/notifier'
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-muted-foreground hover:text-foreground text-xs transition-colors'
                        >
                            npm
                        </a>
                    </div>
                </footer>
            </main>
        </div>
    )
}
