'use client'
import { notify, Notifier } from '@remcostoeten/notifier'
import type { NotifyPositionType, ColorMode, RadiusVariant } from '@remcostoeten/notifier'
import { ThemeToggle } from '@/components/theme-toggle'
import { useState } from 'react'
import { CodeBlock, CodeBlockCopyButton } from '@/components/code-block'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Bot } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { HoverButton } from './liquid-button'

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
            className={`rounded border border-stone-300 bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-700 transition-all hover:bg-stone-200 active:scale-95 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 ${className}`}
        >
            {children}
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
        default: '"pill"',
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

function PropsTable({ title, data }: { title: string; data: typeof PROPS_NOTIFIER }) {
    return (
        <div className='overflow-x-auto'>
            <h3 className='mb-3 text-sm font-semibold text-stone-700 dark:text-zinc-300'>
                {title}
            </h3>
            <table className='w-full border-collapse text-xs'>
                <thead>
                    <tr className='border-b border-stone-200 dark:border-zinc-800'>
                        <th className='px-3 py-2 text-left font-medium text-stone-500 dark:text-zinc-400'>
                            Prop
                        </th>
                        <th className='px-3 py-2 text-left font-medium text-stone-500 dark:text-zinc-400'>
                            Type
                        </th>
                        <th className='px-3 py-2 text-left font-medium text-stone-500 dark:text-zinc-400'>
                            Default
                        </th>
                        <th className='px-3 py-2 text-left font-medium text-stone-500 dark:text-zinc-400'>
                            Description
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row) => (
                        <tr
                            key={row.prop}
                            className='border-b border-stone-200/50 hover:bg-stone-100/50 dark:border-zinc-800/50 dark:hover:bg-zinc-800/30'
                        >
                            <td className='px-3 py-2 font-mono text-stone-800 dark:text-zinc-200'>
                                {row.prop}
                            </td>
                            <td className='px-3 py-2 font-mono text-stone-500 dark:text-zinc-400'>
                                {row.type}
                            </td>
                            <td className='px-3 py-2 font-mono text-stone-400 dark:text-zinc-500'>
                                {row.default}
                            </td>
                            <td className='px-3 py-2 text-stone-500 dark:text-zinc-400'>
                                {row.desc}
                            </td>
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

    // Tweaker State
    const [position, setPosition] = useState<NotifyPositionType>('bottom-right')
    const [radius, setRadius] = useState<RadiusVariant>('pill')
    const [colorMode, setColorMode] = useState<ColorMode>('dark')
    const [duration, setDuration] = useState(3000)
    const [maxVisible, setMaxVisible] = useState(5)
    const [gap, setGap] = useState(8)
    const [swipeToDismiss, setSwipeToDismiss] = useState(true)
    const [pauseOnHover, setPauseOnHover] = useState(true)
    const [clickToDismiss, setClickToDismiss] = useState(false)
    const [dismissible, setDismissible] = useState(false)
    const [iconColor, setIconColor] = useState<'colored' | 'neutral' | 'hidden'>('colored')

    // Generate dynamic code snippet
    const generatedCode = `<Notifier
  position="${position}"
  colorMode="${colorMode}"
  radius="${radius}"
  duration={${duration}}
  maxVisible={${maxVisible}}
  gap={${gap}}
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
        notify.success('LLM Prompt copied to clipboard!')
    }

    const setCode = (code: string, lang = 'typescript') => {
        setActiveCode(code)
        setActiveLang(lang)
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
            success: (data: unknown) => `Success:${data} `,
            error: (err: unknown) => `Error: ${err instanceof Error ? err.message : String(err)} `
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
        <div className='min-h-screen bg-stone-50 font-mono text-stone-900 dark:bg-zinc-950 dark:text-zinc-100'>
            <div className='mx-auto max-w-4xl space-y-12 px-6 py-12'>
                <header className='space-y-4'>
                    <div className='flex items-center justify-between'>
                        <h1 className='text-2xl font-bold text-stone-900 dark:text-zinc-100'>
                            @remcostoeten/notifier
                        </h1>
                        <div className='flex items-center gap-3'>
                            <a
                                href='https://github.com/remcostoeten/Notify'
                                target='_blank'
                                rel='noopener noreferrer'
                                className='text-xs text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                            >
                                GitHub
                            </a>
                            <ThemeToggle />
                        </div>
                    </div>
                    <p className='mt-2 text-sm text-zinc-500 dark:text-zinc-400'>
                        The notification system that lets you{' '}
                        <code className='rounded border border-stone-300 bg-stone-200 px-1.5 py-0.5 font-mono text-xs text-stone-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200'>{`notify.loading('Building').success('Shipped 🚀')`}</code>
                    </p>
                </header>

                {/* Tweaker / Playground */}
                <div className='rounded-lg border border-stone-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50'>
                    <div className='flex flex-col gap-6'>
                        <div className='flex flex-wrap gap-6'>
                            <div className='flex flex-col gap-2'>
                                <Label>Position</Label>
                                <Select
                                    value={position}
                                    onValueChange={(val) => setPosition(val as NotifyPositionType)}
                                >
                                    <SelectTrigger className='w-[140px]'>
                                        <SelectValue placeholder='Position' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='top-left'>top-left</SelectItem>
                                        <SelectItem value='top-center'>top-center</SelectItem>
                                        <SelectItem value='top-right'>top-right</SelectItem>
                                        <SelectItem value='bottom-left'>bottom-left</SelectItem>
                                        <SelectItem value='bottom-center'>bottom-center</SelectItem>
                                        <SelectItem value='bottom-right'>bottom-right</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='flex flex-col gap-2'>
                                <Label>Radius</Label>
                                <Select
                                    value={radius}
                                    onValueChange={(val) => setRadius(val as RadiusVariant)}
                                >
                                    <SelectTrigger className='w-[120px]'>
                                        <SelectValue placeholder='Radius' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='pill'>pill</SelectItem>
                                        <SelectItem value='rounded'>rounded</SelectItem>
                                        <SelectItem value='squared'>squared</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='flex flex-col gap-2'>
                                <Label>Theme</Label>
                                <Select
                                    value={colorMode}
                                    onValueChange={(val) => setColorMode(val as ColorMode)}
                                >
                                    <SelectTrigger className='w-[120px]'>
                                        <SelectValue placeholder='Theme' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='dark'>Dark</SelectItem>
                                        <SelectItem value='light'>Light</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='flex flex-col gap-2'>
                                <Label>Duration</Label>
                                <Select
                                    value={String(duration)}
                                    onValueChange={(val) => setDuration(Number(val))}
                                >
                                    <SelectTrigger className='w-[100px]'>
                                        <SelectValue placeholder='3s' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='2000'>2s</SelectItem>
                                        <SelectItem value='3000'>3s</SelectItem>
                                        <SelectItem value='5000'>5s</SelectItem>
                                        <SelectItem value='8000'>8s</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='flex flex-col gap-2'>
                                <Label>Max Visible</Label>
                                <Select
                                    value={String(maxVisible)}
                                    onValueChange={(val) => setMaxVisible(Number(val))}
                                >
                                    <SelectTrigger className='w-[100px]'>
                                        <SelectValue placeholder='5' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='1'>1</SelectItem>
                                        <SelectItem value='3'>3</SelectItem>
                                        <SelectItem value='5'>5</SelectItem>
                                        <SelectItem value='10'>10</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='flex flex-col gap-2'>
                                <Label>Gap</Label>
                                <Select
                                    value={String(gap)}
                                    onValueChange={(val) => setGap(Number(val))}
                                >
                                    <SelectTrigger className='w-[100px]'>
                                        <SelectValue placeholder='8px' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='4'>4px</SelectItem>
                                        <SelectItem value='8'>8px</SelectItem>
                                        <SelectItem value='12'>12px</SelectItem>
                                        <SelectItem value='16'>16px</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='flex flex-col gap-2'>
                                <Label>Icon Color</Label>
                                <Select
                                    value={iconColor}
                                    onValueChange={(val) =>
                                        setIconColor(val as 'colored' | 'neutral' | 'hidden')
                                    }
                                >
                                    <SelectTrigger className='w-[120px]'>
                                        <SelectValue placeholder='Colored' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='colored'>Colored</SelectItem>
                                        <SelectItem value='neutral'>Neutral</SelectItem>
                                        <SelectItem value='hidden'>Hidden</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className='flex w-fit flex-1 flex-wrap items-center gap-8 rounded-lg border border-stone-100 bg-stone-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50'>
                            <div className='flex items-center space-x-2'>
                                <Switch
                                    id='swipe'
                                    checked={swipeToDismiss}
                                    onCheckedChange={setSwipeToDismiss}
                                />
                                <Label htmlFor='swipe' className='cursor-pointer font-normal'>
                                    Swipe to dismiss
                                </Label>
                            </div>

                            <div className='flex items-center space-x-2'>
                                <Switch
                                    id='hover'
                                    checked={pauseOnHover}
                                    onCheckedChange={setPauseOnHover}
                                />
                                <Label htmlFor='hover' className='cursor-pointer font-normal'>
                                    Pause on hover
                                </Label>
                            </div>

                            <div className='flex items-center space-x-2'>
                                <Switch
                                    id='click'
                                    checked={clickToDismiss}
                                    onCheckedChange={setClickToDismiss}
                                />
                                <Label htmlFor='click' className='cursor-pointer font-normal'>
                                    Click to dismiss
                                </Label>
                            </div>

                            <div className='flex items-center space-x-2'>
                                <Switch
                                    id='dismissible'
                                    checked={dismissible}
                                    onCheckedChange={setDismissible}
                                />
                                <Label htmlFor='dismissible' className='cursor-pointer font-normal'>
                                    Show dismiss button
                                </Label>
                            </div>
                        </div>

                        <HoverButton
                            className='w-fit'
                            onClick={() => notify.success('Changes applied!', { position })}
                        >
                            Test Notification
                        </HoverButton>
                    </div>

                    <div className='mt-6 border-t border-stone-200 pt-4 dark:border-zinc-800'>
                        <div className='mb-2 flex items-center justify-between'>
                            <div className='text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-zinc-500'>
                                Generated Configuration
                            </div>
                        </div>
                        <CodeBlock
                            code={generatedCode}
                            language='tsx'
                            showLineNumbers={false}
                            className='!bg-stone-50 text-xs dark:!bg-zinc-950/50'
                        >
                            <div className='flex gap-2'>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                onClick={copyPrompt}
                                                className='rounded p-2 text-stone-500 transition-colors hover:bg-stone-200 dark:text-zinc-400 dark:hover:bg-zinc-800'
                                            >
                                                <Bot size={14} />
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent className='max-w-[280px] bg-stone-900 text-center text-stone-100 dark:bg-zinc-100 dark:text-zinc-900'>
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
                </div>

                <Notifier
                    position={position}
                    radius={radius}
                    colorMode={colorMode}
                    duration={duration}
                    maxVisible={maxVisible}
                    gap={gap}
                    swipeToDismiss={swipeToDismiss}
                    pauseOnHover={pauseOnHover}
                    clickToDismiss={clickToDismiss}
                    dismissible={dismissible}
                    iconColor={iconColor}
                />

                <section className='space-y-4'>
                    <h2 className='text-sm font-semibold uppercase tracking-wider text-stone-700 dark:text-zinc-300'>
                        Installation
                    </h2>
                    <CodeBlock code={SNIPPETS.install} language='bash' showLineNumbers={false}>
                        <CodeBlockCopyButton />
                    </CodeBlock>
                </section>

                <section className='space-y-4'>
                    <h2 className='text-sm font-semibold uppercase tracking-wider text-stone-700 dark:text-zinc-300'>
                        Docs().Examples().Basic{' '}
                    </h2>

                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        <div className='space-y-3 rounded-lg border border-stone-200 bg-stone-100/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50'>
                            <h3 className='text-xs font-semibold text-stone-500 dark:text-zinc-400'>
                                Basic
                            </h3>
                            <div className='flex flex-wrap gap-2'>
                                <Button
                                    onClick={() => {
                                        setCode(SNIPPETS.info)
                                        notify('Default notification')
                                    }}
                                >
                                    Basic Info
                                </Button>
                                <Button
                                    onClick={() => {
                                        setCode(SNIPPETS.success)
                                        notify.success('Saved')
                                    }}
                                >
                                    Basic Success
                                </Button>
                                <Button
                                    onClick={() => {
                                        setCode(SNIPPETS.error)
                                        notify.error('Failed')
                                    }}
                                >
                                    Basic Error
                                </Button>
                                <Button
                                    onClick={() => {
                                        setCode(SNIPPETS.loading)
                                        notify.loading('Loading...')
                                    }}
                                >
                                    Basic Loading
                                </Button>
                            </div>
                        </div>

                        <div className='space-y-3 rounded-lg border border-stone-200 bg-stone-100/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50'>
                            <h3 className='text-xs font-semibold text-stone-500 dark:text-zinc-400'>
                                Chaining
                            </h3>
                            <div className='flex flex-wrap gap-2'>
                                <Button onClick={handleChain}>State Chain</Button>
                                <Button onClick={handlePromise}>Promise</Button>
                            </div>
                        </div>

                        <div className='space-y-3 rounded-lg border border-stone-200 bg-stone-100/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50'>
                            <h3 className='text-xs font-semibold text-stone-500 dark:text-zinc-400'>
                                Interactive
                            </h3>
                            <div className='flex flex-wrap gap-2'>
                                <Button onClick={handleConfirm}>Confirm Dialog</Button>
                                <Button onClick={handleAction}>Action Button</Button>
                            </div>
                        </div>

                        <div className='space-y-3 rounded-lg border border-stone-200 bg-stone-100/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50'>
                            <h3 className='text-xs font-semibold text-stone-500 dark:text-zinc-400'>
                                Positions
                            </h3>
                            <div className='flex flex-wrap gap-2'>
                                {positions.map((pos) => (
                                    <Button
                                        key={pos}
                                        onClick={() => {
                                            setCode(SNIPPETS.position(pos))
                                            notify(`${pos} `, { position: pos })
                                        }}
                                    >
                                        {pos}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className='space-y-4'>
                    <h2 className='text-sm font-semibold uppercase tracking-wider text-stone-700 dark:text-zinc-300'>
                        Setup
                    </h2>
                    <p className='text-sm text-stone-600 dark:text-zinc-400'>
                        Place the{' '}
                        <code className='rounded bg-stone-200 px-1 text-xs dark:bg-zinc-800'>
                            {'<Notifier />'}
                        </code>{' '}
                        in your root layout.{' '}
                        <a
                            href='#api-reference'
                            className='text-stone-800 underline hover:no-underline dark:text-zinc-200'
                        >
                            View all options →
                        </a>
                    </p>
                    <div className='mt-2 space-y-1 text-xs text-stone-500 dark:text-zinc-400'>
                        <div className='font-medium text-stone-700 dark:text-zinc-300'>
                            Default options:
                        </div>
                        <div className='grid grid-cols-2 gap-x-4 gap-y-1 font-mono md:grid-cols-3'>
                            <span>
                                <code>position</code>: &quot;bottom&quot;
                            </span>
                            <span>
                                <code>duration</code>: 3000
                            </span>
                            <span>
                                <code>colorMode</code>: &quot;dark&quot;
                            </span>
                            <span>
                                <code>radius</code>: &quot;pill&quot;
                            </span>
                            <span>
                                <code>maxVisible</code>: 5
                            </span>
                            <span>
                                <code>swipeToDismiss</code>: true
                            </span>
                        </div>
                    </div>
                    <CodeBlock
                        code={SNIPPETS.setup}
                        language='tsx'
                        showLineNumbers={true}
                        fileName='app/layout.tsx'
                    >
                        <CodeBlockCopyButton />
                    </CodeBlock>
                </section>

                <section className='space-y-4'>
                    <h2 className='text-sm font-semibold uppercase tracking-wider text-stone-700 dark:text-zinc-300'>
                        Usage
                    </h2>
                    <CodeBlock code={activeCode} language={activeLang} showLineNumbers={true}>
                        <CodeBlockCopyButton />
                    </CodeBlock>
                </section>

                <section id='api-reference' className='space-y-6'>
                    <h2 className='text-sm font-semibold uppercase tracking-wider text-stone-700 dark:text-zinc-300'>
                        API Reference
                    </h2>
                    <PropsTable title='<Notifier /> Props' data={PROPS_NOTIFIER} />
                    <PropsTable title='notify() Options' data={PROPS_NOTIFY} />
                </section>

                <section className='space-y-6'>
                    <h2 className='text-sm font-semibold uppercase tracking-wider text-stone-700 dark:text-zinc-300'>
                        Migration Guide
                    </h2>

                    <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                        <div className='space-y-3'>
                            <h3 className='text-sm font-medium text-stone-900 dark:text-zinc-100'>
                                From shadcn/ui (Sonner/Toast)
                            </h3>
                            <p className='text-xs text-stone-600 dark:text-zinc-400'>
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

                        <div className='space-y-3'>
                            <h3 className='text-sm font-medium text-stone-900 dark:text-zinc-100'>
                                From react-hot-toast
                            </h3>
                            <p className='text-xs text-stone-600 dark:text-zinc-400'>
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

                <section className='space-y-4'>
                    <h2 className='text-sm font-semibold uppercase tracking-wider text-stone-700 dark:text-zinc-300'>
                        Methods
                    </h2>
                    <div className='space-y-2 font-mono text-xs text-stone-500 dark:text-zinc-400'>
                        <div>
                            <span className='text-stone-800 dark:text-zinc-200'>
                                notify(message, options?)
                            </span>{' '}
                            — Default info notification
                        </div>
                        <div>
                            <span className='text-stone-800 dark:text-zinc-200'>
                                notify.success(message, options?)
                            </span>{' '}
                            — Success state
                        </div>
                        <div>
                            <span className='text-stone-800 dark:text-zinc-200'>
                                notify.error(message, options?)
                            </span>{' '}
                            — Error state
                        </div>
                        <div>
                            <span className='text-stone-800 dark:text-zinc-200'>
                                notify.loading(message, options?)
                            </span>{' '}
                            — Loading spinner
                        </div>
                        <div>
                            <span className='text-stone-800 dark:text-zinc-200'>
                                notify.promise(promise, messages)
                            </span>{' '}
                            — Track async operations
                        </div>
                        <div>
                            <span className='text-stone-800 dark:text-zinc-200'>
                                notify.dismiss(id?)
                            </span>{' '}
                            — Dismiss by id or all
                        </div>
                        <div>
                            <span className='text-stone-800 dark:text-zinc-200'>
                                instance.confirm(message, options)
                            </span>{' '}
                            — Await user confirmation
                        </div>
                    </div>
                </section>

                <footer className='border-t border-stone-200 pt-8 text-xs text-stone-400 dark:border-zinc-800 dark:text-zinc-600'>
                    MIT License
                </footer>
            </div>
        </div>
    )
}
