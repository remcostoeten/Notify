'use client'
import { notify } from '@remcostoeten/notifier'
import { CodeBlock, CodeBlockCopyButton } from '@/components/code-block'
import { ApiReference } from '@/components/showcase/api-reference'
import { Gallery, showExample } from '@/components/showcase/gallery'
import { Playground } from '@/components/showcase/playground'
import { SNIPPETS } from '@/components/showcase/snippets'
import { InstallCommand, PrimaryButton, SectionHeading } from '@/components/showcase/ui'

const NAV_LINKS = [
    { href: '#gallery', label: 'Gallery' },
    { href: '#playground', label: 'Playground' },
    { href: '#compose', label: 'Compose' },
    { href: '#style', label: 'Style' },
    { href: '#api-reference', label: 'API' }
]

type SnippetProps = {
    title: string
    code: string
    language?: string
}

function Snippet({ title, code, language = 'tsx' }: SnippetProps) {
    return (
        <div className='border-border border-b'>
            <div className='px-6 py-3'>
                <span className='text-faint font-mono text-[11px] tracking-[0.2em] uppercase'>
                    {title}
                </span>
            </div>
            <CodeBlock
                code={code}
                language={language}
                showLineNumbers={false}
                className='border-0 border-t text-xs'
            >
                <CodeBlockCopyButton />
            </CodeBlock>
        </div>
    )
}

export default function Home() {
    return (
        <div className='bg-background text-foreground min-h-screen'>
            <header className='border-border bg-background/80 sticky top-0 z-40 border-b backdrop-blur'>
                <div className='mx-auto flex h-12 max-w-5xl items-center justify-between px-6'>
                    <a href='#' className='flex items-center gap-2'>
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
                    <p className='text-faint font-mono text-[11px] tracking-[0.25em] uppercase'>
                        @remcostoeten/notifier
                    </p>
                    <h1 className='text-foreground mt-5 max-w-2xl text-4xl leading-[1.1] font-semibold tracking-tight md:text-6xl'>
                        Toasts, composed.
                    </h1>
                    <p className='text-muted-foreground mt-5 max-w-xl text-base leading-relaxed'>
                        A toast is a surface with slots: an icon or avatar, a title with meta, a
                        description, progress and actions. Fill the slots from one object, or build
                        the layout yourself from the same primitives.
                    </p>
                    <div className='mt-10 flex flex-wrap items-center gap-3'>
                        <PrimaryButton onClick={() => showExample('profile')}>
                            Show a toast
                        </PrimaryButton>
                        <InstallCommand command={SNIPPETS.install} />
                    </div>
                </section>

                <section>
                    <SectionHeading
                        id='gallery'
                        label='Gallery'
                        hint='Four layouts from the same slots. Show opens the live version'
                    />
                    <Gallery />
                </section>

                <section>
                    <SectionHeading
                        id='playground'
                        label='Playground'
                        hint='Mix slots, tones and positions'
                    />
                    <Playground />
                </section>

                <section>
                    <SectionHeading
                        id='compose'
                        label='Compose'
                        hint='Declarative for most toasts, primitives for the rest'
                    />
                    <Snippet title='Content from an object' code={SNIPPETS.content} />
                    <Snippet title='Avatar, meta and buttons' code={SNIPPETS.avatar} />
                    <Snippet title='Progress that you update' code={SNIPPETS.progress} />
                    <Snippet title='Promise' code={SNIPPETS.promise} />
                    <Snippet title='Primitives' code={SNIPPETS.compose} />
                </section>

                <section>
                    <SectionHeading
                        id='style'
                        label='Style'
                        hint='Tokens are CSS variables, every slot takes a class'
                    />
                    <Snippet title='Theme prop' code={SNIPPETS.theme} />
                    <Snippet title='Or plain CSS' code={SNIPPETS.css} language='css' />
                    <Snippet title='Class names per slot' code={SNIPPETS.slots} />
                </section>

                <section>
                    <SectionHeading id='setup' label='Setup' />
                    <div className='space-y-4 p-6'>
                        <p className='text-muted-foreground text-sm'>
                            Mount{' '}
                            <code className='text-foreground font-mono text-[13px]'>
                                {'<Notifier />'}
                            </code>{' '}
                            once in your root layout, then call{' '}
                            <code className='text-foreground font-mono text-[13px]'>notify</code>{' '}
                            from anywhere. The toast stylesheet is included, and the font is
                            whatever Inter or system font your page already loads.
                        </p>
                        <CodeBlock
                            code={SNIPPETS.setup}
                            language='tsx'
                            showLineNumbers={true}
                            fileName='app/layout.tsx'
                        >
                            <CodeBlockCopyButton />
                        </CodeBlock>
                        <div>
                            <PrimaryButton
                                className='h-8 px-4 text-[13px]'
                                onClick={() => notify.success('Notifier is mounted')}
                            >
                                Try it
                            </PrimaryButton>
                        </div>
                    </div>
                </section>

                <section>
                    <SectionHeading id='api-reference' label='API reference' />
                    <ApiReference />
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
