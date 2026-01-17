'use client'

import type React from 'react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Notifier, notify, type NotifyPositionType } from '@remcostoeten/notifier'

// --- Specialized Components ---

function HighlightedCode({ code }: { code: string }) {
    // Simple regex-based syntax highlighting
    // Simple regex-based syntax highlighting

    const fragment = code.split(/(\n)/).map((line, lineIndex) => {
        // Fallback to "dangerouslySetInnerHTML" strategy for the visual effect
        let html = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') // Escape HTML

        // Apply highlighting in specific order (Strings first to avoid matching keywords inside)
        // 1. Strings
        html = html.replace(
            /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g,
            '<span class="text-emerald-400">$1</span>'
        )

        html = html
            .replace(
                /\b(import|export|from|const|let|var|function|return|if|else|async|await|default|type|interface)\b/g,
                '<span class="text-purple-400">$1</span>'
            )
            .replace(/\b(true|false|null|undefined)\b/g, '<span class="text-orange-400">$1</span>')
            .replace(/\b([A-Z][a-zA-Z0-9]*)\b/g, '<span class="text-yellow-100">$1</span>') // Components/Types
            .replace(/\b(notify)\b/g, '<span class="text-blue-400 font-bold">$1</span>') // Special highlight for our lib
            .replace(/(\/\/.*$)/gm, '<span class="text-white/30 italic">$1</span>') // Comments last

        return <div key={lineIndex} dangerouslySetInnerHTML={{ __html: html || '&nbsp;' }} />
    })

    return <>{fragment}</>
}

function CodeBlock({ children, title }: { children: string; title?: string }) {
    const [copied, setCopied] = useState(false)

    const copy = () => {
        // eslint-disable-next-line
        navigator.clipboard.writeText(children)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className='group relative overflow-hidden rounded-lg bg-[#111] ring-1 ring-white/10 transition-all hover:ring-white/20'>
            {title && (
                <div className='flex items-center justify-between border-b border-white/5 bg-white/5 px-4 py-2'>
                    <span className='font-mono text-[11px] uppercase tracking-wider text-white/50'>
                        {title}
                    </span>
                    <button
                        onClick={copy}
                        className='text-[10px] text-white/40 transition-colors hover:text-white/80'
                    >
                        {copied ? 'COPIED' : 'COPY'}
                    </button>
                </div>
            )}
            <div className='overflow-x-auto p-4 font-mono text-xs leading-relaxed sm:text-sm'>
                <HighlightedCode code={children} />
            </div>
        </div>
    )
}

function Nav() {
    return (
        <motion.nav
            className='sticky top-0 z-40 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-md'
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <div className='mx-auto flex h-14 max-w-5xl items-center justify-between px-6'>
                <div className='flex items-center gap-2'>
                    <span className='h-3 w-3 animate-pulse rounded-full bg-emerald-500' />
                    <span className='font-bold tracking-tight text-white'>notify</span>
                    <span className='rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/40'>
                        v1.0.0
                    </span>
                </div>
                <div className='flex items-center gap-6 text-xs font-medium text-white/50'>
                    <a href='#quick-start' className='transition-colors hover:text-white'>
                        Docs
                    </a>
                    <a href='#examples' className='transition-colors hover:text-white'>
                        Examples
                    </a>
                    <a
                        href='https://github.com/remcostoeten/notifier'
                        target='_blank'
                        rel='noreferrer'
                        className='transition-colors hover:text-white'
                    >
                        GitHub
                    </a>
                </div>
            </div>
        </motion.nav>
    )
}

const PositionButton = ({
    active,
    onClick,
    position
}: {
    active: boolean
    onClick: () => void
    position: NotifyPositionType
}) => {
    // Mini visualization of the position
    const isTop = position.includes('top')

    const isLeft = position.includes('left')
    const isRight = position.includes('right')
    const isCenter = !isLeft && !isRight

    return (
        <button
            onClick={onClick}
            className={`relative h-12 w-16 rounded-lg border transition-all duration-200 ${
                active
                    ? 'border-emerald-500/50 bg-emerald-500/20 shadow-lg shadow-emerald-500/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
            } `}
            title={position}
        >
            <div
                className={`absolute h-2 w-2 rounded-full ${active ? 'bg-emerald-400' : 'bg-white/30'} ${isTop ? 'top-1.5' : 'bottom-1.5'} ${isLeft ? 'left-1.5' : ''} ${isRight ? 'right-1.5' : ''} ${isCenter ? 'left-1/2 -translate-x-1/2' : ''} `}
            />
        </button>
    )
}

export default function Home() {
    const [position, setPosition] = useState<NotifyPositionType>('bottom-right')

    // --- Demos ---
    const triggerSuccess = () => notify.success('Changes saved successfully.', { duration: 3000 })
    const triggerError = () => notify.error('Failed to connect to server.', { duration: 3000 })

    const triggerComplex = () => {
        // 1. Start with loading
        const id = notify.loading('Initializing secure connection...', {
            duration: 0 // Persistent until update
        }).id

        // 2. Update to intermediate state after 1.5s
        setTimeout(() => {
            notify.loading('Verifying credentials...', { id })
        }, 1500)

        // 3. Update to another intermediate state (simulating steps)
        setTimeout(() => {
            notify.loading('Synchronizing constraints...', { id })
        }, 3000)

        // 4. Final success state
        setTimeout(() => {
            notify.success('Environment synced successfully!', {
                id,
                duration: 4000 // Auto dismiss after success
            })
        }, 4500)
    }

    return (
        <div className='min-h-screen bg-[#09090b] text-white selection:bg-emerald-500/30'>
            <Nav />
            {/* Dynamic Position Notifier */}
            <Notifier position={position} />

            <main className='mx-auto max-w-5xl space-y-24 px-6 py-12 sm:py-20'>
                {/* Header / Intro */}
                <section className='space-y-8'>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <h1 className='mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl'>
                            Type-safe notifications <br />
                            <span className='text-white/40'>for React applications.</span>
                        </h1>
                        <p className='max-w-2xl text-lg leading-relaxed text-white/60'>
                            A headless, chainable notification system designed for performance and
                            flexibility. Build tailored notification experiences with full
                            TypeScript support.
                        </p>
                    </motion.div>

                    <motion.div
                        className='flex flex-col gap-8'
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                    >
                        {/* Action Buttons */}
                        <div className='flex flex-wrap gap-3'>
                            <button
                                onClick={triggerSuccess}
                                className='rounded-md bg-white px-4 py-2 text-sm font-semibold text-black transition-transform hover:bg-white/90 active:scale-95'
                            >
                                Trigger Success
                            </button>
                            <button
                                onClick={triggerError}
                                className='rounded-md bg-white/10 px-4 py-2 text-sm font-medium text-white transition-transform hover:bg-white/15 active:scale-95'
                            >
                                Trigger Error
                            </button>
                            <button
                                onClick={triggerComplex}
                                className='rounded-md bg-gradient-to-r from-emerald-500/20 to-blue-500/20 px-4 py-2 text-sm font-medium text-emerald-300 shadow-lg shadow-emerald-900/20 ring-1 ring-white/10 transition-all hover:from-emerald-500/30 hover:to-blue-500/30 active:scale-95'
                            >
                                Multi-Stage Demo
                            </button>
                        </div>

                        {/* Position Picker */}
                        <div className='max-w-xl rounded-xl border border-white/10 bg-white/5 p-6'>
                            <div className='mb-4 flex items-center gap-3'>
                                <h3 className='font-mono text-xs uppercase tracking-wider text-white/40'>
                                    Notification Position
                                </h3>
                                <span className='rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/50'>
                                    {position}
                                </span>
                            </div>
                            <div className='grid w-fit grid-cols-3 gap-3'>
                                {(['top-left', 'top', 'top-right'] as const).map((pos) => (
                                    <PositionButton
                                        key={pos}
                                        position={pos}
                                        active={position === pos}
                                        onClick={() => setPosition(pos)}
                                    />
                                ))}
                                {(['bottom-left', 'bottom', 'bottom-right'] as const).map((pos) => (
                                    <PositionButton
                                        key={pos}
                                        position={pos}
                                        active={position === pos}
                                        onClick={() => setPosition(pos)}
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* Quick Start */}
                <motion.section
                    id='quick-start'
                    className='grid items-start gap-12 md:grid-cols-2'
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.5 }}
                >
                    <div className='space-y-4'>
                        <h2 className='text-2xl font-semibold text-white'>Quick Start</h2>
                        <p className='leading-relaxed text-white/50'>
                            Install the package and add the provider to your root layout. The
                            toaster is headless by default but comes with sensible presets.
                        </p>
                        <ul className='space-y-2 text-sm text-white/60'>
                            <li className='flex items-center gap-2'>
                                <span className='text-emerald-400'>✓</span>
                                <span>Under 2kb gzipped</span>
                            </li>
                            <li className='flex items-center gap-2'>
                                <span className='text-emerald-400'>✓</span>
                                <span>React 18 & 19 compatible</span>
                            </li>
                            <li className='flex items-center gap-2'>
                                <span className='text-emerald-400'>✓</span>
                                <span>Zero dependencies (core)</span>
                            </li>
                        </ul>
                    </div>

                    <div className='space-y-4'>
                        <CodeBlock title='Terminal'>
                            {`npm install @remcostoeten/notifier`}
                        </CodeBlock>

                        <CodeBlock title='layout.tsx'>
                            {`import { Notifier } from "@remcostoeten/notifier"
import "@remcostoeten/notifier/dist/style.css"

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Notifier position="bottom-right" />
      </body>
    </html>
  )
}`}
                        </CodeBlock>
                    </div>
                </motion.section>

                {/* API Examples */}
                <motion.section
                    id='examples'
                    className='space-y-8'
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.5 }}
                >
                    <div className='max-w-2xl'>
                        <h2 className='mb-2 text-2xl font-semibold text-white'>Fluent API</h2>
                        <p className='text-white/50'>
                            The API is designed to be expressive and readable. Chain methods to
                            update state seamlessly.
                        </p>
                    </div>

                    <div className='grid gap-6 md:grid-cols-2'>
                        <CodeBlock title='Basic Usage'>
                            {`import { notify } from "@remcostoeten/notifier"

// Simple message
notify("Event triggered")

// Success state
notify.success("Database sync complete")

// Error state with duration
notify.error("Connection failed", { 
  duration: 5000 
})`}
                        </CodeBlock>

                        <CodeBlock title='Async Promises'>
                            {`const handleSubmit = async () => {
  // Start loading
  const id = notify.loading("Creating account...")
  
  try {
    await createUser()
    // Update same notification to success
    notify.update(id, {
      message: "Welcome aboard!",
      state: "success"
    })
  } catch (err) {
    // Or update to error
    notify.update(id, {
      message: "Email already taken",
      state: "error"
    })
  }
}`}
                        </CodeBlock>
                    </div>
                </motion.section>
            </main>

            <footer className='border-t border-white/5 py-8 text-center'>
                <p className='text-xs text-white/20'>MIT License © 2024 Remco Stoeten</p>
            </footer>
        </div>
    )
}
