'use client'
import { cn } from '@/lib/utils'
import {
    CheckIcon,
    ChevronDown,
    ChevronUp,
    Code2,
    CopyIcon,
    File,
    FileCode,
    FileJson,
    FileText,
    FileType,
    Hash,
    Search,
    X,
    type LucideIcon
} from 'lucide-react'
import type { ComponentProps, HTMLAttributes, ReactNode } from 'react'
import { createContext, useContext, useMemo, useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Input, Button } from './ui'

const LANG_ICONS: Record<string, LucideIcon> = {
    javascript: FileCode,
    js: FileCode,
    jsx: FileCode,
    typescript: FileType,
    ts: FileType,
    tsx: FileType,
    json: FileJson,
    markdown: FileText,
    md: FileText,
    python: Code2,
    py: Code2,
    html: FileCode,
    css: FileCode,
    scss: FileCode,
    bash: Code2,
    shell: Code2,
    sql: Code2
}

// Language display names
const languageNames: Record<string, string> = {
    javascript: 'JavaScript',
    js: 'JavaScript',
    jsx: 'JSX',
    typescript: 'TypeScript',
    ts: 'TypeScript',
    tsx: 'TSX',
    json: 'JSON',
    markdown: 'Markdown',
    md: 'Markdown',
    python: 'Python',
    py: 'Python',
    html: 'HTML',
    css: 'CSS',
    scss: 'SCSS',
    bash: 'Bash',
    shell: 'Shell',
    sql: 'SQL'
}

// Parse highlight lines string into array of line numbers
const parseHighlightLines = (highlightLines?: string): number[] => {
    if (!highlightLines) return []

    const lines: number[] = []
    const parts = highlightLines.split(',').map((p) => p.trim())

    for (const part of parts) {
        if (part.includes('-')) {
            const [start, end] = part.split('-').map((n) => parseInt(n.trim(), 10))
            if (!isNaN(start) && !isNaN(end)) {
                for (let i = start; i <= end; i++) {
                    if (!lines.includes(i)) lines.push(i)
                }
            }
        } else {
            const num = parseInt(part, 10)
            if (!isNaN(num) && !lines.includes(num)) {
                lines.push(num)
            }
        }
    }

    return lines.sort((a, b) => a - b)
}

type CodeBlockContextType = {
    code: string
}

const CodeBlockContext = createContext<CodeBlockContextType>({
    code: ''
})

export type CodeBlockProps = HTMLAttributes<HTMLDivElement> & {
    code: string
    language: string
    showLineNumbers?: boolean
    /** Allow toggling line numbers from the header */
    lineNumbersToggleable?: boolean
    showLanguageIcon?: boolean
    showLanguage?: boolean
    fileName?: string
    title?: string
    highlightLines?: string
    /** Line number after which to collapse (fade out). Set to 0 or undefined to disable partial collapse. */
    collapseAfterLine?: number
    /** If true, the entire code block can be collapsed/expanded */
    collapsible?: boolean
    /** Initial collapsed state */
    defaultCollapsed?: boolean
    /** Enable search functionality */
    searchable?: boolean
    /** Initial search query */
    defaultSearchQuery?: string
    /** Inline single-line variant without header */
    inline?: boolean
    children?: ReactNode
}

export const CodeBlock = ({
    code,
    language,
    showLineNumbers = false,
    lineNumbersToggleable = false,
    showLanguageIcon = true,
    showLanguage = false,
    fileName,
    title,
    highlightLines,
    collapseAfterLine,
    collapsible = false,
    defaultCollapsed = false,
    searchable = false,
    defaultSearchQuery = '',
    inline = false,
    className,
    children,
    ...props
}: CodeBlockProps) => {
    const [isExpanded, setIsExpanded] = useState(!defaultCollapsed)
    const [isPartialExpanded, setIsPartialExpanded] = useState(false)
    const [lineNumbersVisible, setLineNumbersVisible] = useState(showLineNumbers)
    const [isSearchOpen, setIsSearchOpen] = useState(!!defaultSearchQuery)
    const [searchQuery, setSearchQuery] = useState(defaultSearchQuery)

    const highlightedLines = parseHighlightLines(highlightLines)
    const LanguageIcon = LANG_ICONS[language.toLowerCase()] || File
    const displayName = languageNames[language.toLowerCase()] || language

    // Inline variant bypasses header
    const hasHeader =
        !inline &&
        (title || fileName || showLanguage || collapsible || lineNumbersToggleable || searchable)
    const totalLines = code.split('\n').length
    const hasPartialCollapse =
        collapseAfterLine && collapseAfterLine > 0 && collapseAfterLine < totalLines

    // Find matching lines for search
    const searchMatchLines = useMemo(() => {
        if (!searchQuery.trim()) return []
        const lines = code.split('\n')
        const matches: number[] = []
        const lowerQuery = searchQuery.toLowerCase()
        lines.forEach((line, index) => {
            if (line.toLowerCase().includes(lowerQuery)) {
                matches.push(index + 1)
            }
        })
        return matches
    }, [code, searchQuery])

    const lineProps = (lineNumber: number) => {
        const isHighlighted = highlightedLines.includes(lineNumber)
        const isSearchMatch = searchMatchLines.includes(lineNumber)
        const shouldHighlight = isHighlighted || isSearchMatch
        return {
            style: {
                display: 'block',
                backgroundColor: shouldHighlight ? 'hsl(var(--code-highlight))' : undefined,
                borderLeft: shouldHighlight
                    ? `3px solid hsl(var(--code-highlight-border${isSearchMatch && !isHighlighted ? '-search' : ''}))`
                    : '3px solid transparent',
                marginLeft: '-0.5rem',
                paddingLeft: 'calc(0.5rem - 3px)',
                paddingRight: '0.5rem'
            }
        }
    }

    // Calculate visible code for partial collapse
    const getVisibleCode = () => {
        if (!hasPartialCollapse || isPartialExpanded) return code
        const lines = code.split('\n')
        return lines.slice(0, collapseAfterLine).join('\n')
    }

    const visibleCode = getVisibleCode()
    const hiddenLinesCount =
        hasPartialCollapse && !isPartialExpanded ? totalLines - collapseAfterLine! : 0

    const syntaxHighlighterProps = {
        language,
        customStyle: {
            margin: 0,
            padding: inline ? '0.25rem 0.5rem' : '1rem',
            fontSize: inline ? '0.8125rem' : '0.875rem',
            background: 'var(--code-background)',
            color: 'var(--foreground)',
            ...(inline && { display: 'inline', borderRadius: '0.25rem' })
        },
        showLineNumbers: inline ? false : lineNumbersVisible,
        lineNumberStyle: {
            color: 'hsl(var(--muted-foreground))',
            paddingRight: '1rem',
            minWidth: '2.5rem'
        },
        wrapLines: !inline,
        lineProps: inline ? undefined : lineProps,
        codeTagProps: {
            className: cn('font-mono', inline ? 'text-[0.8125rem]' : 'text-sm')
        }
    }

    // Inline variant - simple single-line code
    if (inline) {
        return (
            <code
                className={cn(
                    'inline-block rounded px-1.5 py-0.5 font-mono text-[0.8125rem]',
                    className
                )}
                style={{ background: 'var(--code-background)' }}
            >
                <SyntaxHighlighter
                    {...syntaxHighlighterProps}
                    style={oneLight}
                    className='!inline !bg-transparent !p-0 dark:hidden'
                    PreTag='span'
                    CodeTag='span'
                >
                    {code.trim()}
                </SyntaxHighlighter>
                <SyntaxHighlighter
                    {...syntaxHighlighterProps}
                    style={oneDark}
                    className='hidden !bg-transparent !p-0 dark:inline'
                    PreTag='span'
                    CodeTag='span'
                >
                    {code.trim()}
                </SyntaxHighlighter>
            </code>
        )
    }

    return (
        <CodeBlockContext.Provider value={{ code }}>
            <div
                className={cn(
                    'bg-background text-foreground relative w-full overflow-hidden rounded-md border border-stone-200 dark:border-zinc-800',
                    className
                )}
                {...props}
            >
                {hasHeader && (
                    <div
                        className='flex items-center gap-2 border-b border-stone-200 px-3 py-2 text-sm dark:border-zinc-800'
                        style={{ background: 'var(--code-header)' }}
                    >
                        {collapsible && (
                            <Button
                                variant='ghost'
                                size='sm'
                                className='h-6 w-6 shrink-0 p-0'
                                onClick={() => setIsExpanded(!isExpanded)}
                            >
                                <ChevronDown
                                    className={cn(
                                        'h-4 w-4 transition-transform duration-200',
                                        isExpanded ? 'rotate-0' : '-rotate-90'
                                    )}
                                />
                            </Button>
                        )}
                        {showLanguage && showLanguageIcon && (
                            <LanguageIcon className='text-muted-foreground h-4 w-4' />
                        )}
                        {(title || fileName) && (
                            <span className='text-foreground font-medium'>{title || fileName}</span>
                        )}
                        {showLanguage && !title && !fileName && (
                            <span className='text-muted-foreground'>{displayName}</span>
                        )}
                        {showLanguage && (title || fileName) && (
                            <span className='text-muted-foreground'>{displayName}</span>
                        )}

                        {/* Right side controls */}
                        <div className='ml-auto flex items-center gap-1'>
                            {/* Search toggle and input */}
                            {searchable && (
                                <div className='flex items-center gap-1'>
                                    <div
                                        className={cn(
                                            'flex items-center overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
                                            isSearchOpen
                                                ? 'w-40 opacity-100'
                                                : 'pointer-events-none w-0 opacity-0'
                                        )}
                                    >
                                        <div className='relative flex w-full min-w-[10rem] items-center'>
                                            <Input
                                                type='text'
                                                placeholder='Search...'
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className='h-6 w-full px-2 pr-12 text-xs'
                                                autoFocus={isSearchOpen}
                                            />
                                            {searchQuery && (
                                                <span className='text-muted-foreground absolute right-7 text-[10px] tabular-nums'>
                                                    {searchMatchLines.length}
                                                </span>
                                            )}
                                            <Button
                                                variant='ghost'
                                                size='sm'
                                                className='absolute right-0 h-6 w-6 p-0'
                                                onClick={() => {
                                                    setSearchQuery('')
                                                    setIsSearchOpen(false)
                                                }}
                                            >
                                                <X className='h-3 w-3' />
                                            </Button>
                                        </div>
                                    </div>
                                    <Button
                                        variant='ghost'
                                        size='sm'
                                        className={cn(
                                            'h-6 w-6 shrink-0 p-0 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
                                            isSearchOpen && 'hidden'
                                        )}
                                        onClick={() => setIsSearchOpen(true)}
                                        title='Search code'
                                    >
                                        <Search className='h-3.5 w-3.5' />
                                    </Button>
                                </div>
                            )}

                            {/* Line numbers toggle */}
                            {lineNumbersToggleable && (
                                <Button
                                    variant='ghost'
                                    size='sm'
                                    className={cn(
                                        'h-6 w-6 p-0 transition-colors',
                                        lineNumbersVisible && 'bg-muted'
                                    )}
                                    onClick={() => setLineNumbersVisible(!lineNumbersVisible)}
                                    title='Toggle line numbers'
                                >
                                    <Hash className='h-3.5 w-3.5' />
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                <div
                    className={cn(
                        'relative overflow-hidden transition-all duration-300 ease-out',
                        collapsible && !isExpanded && 'max-h-0'
                    )}
                    style={collapsible && !isExpanded ? { maxHeight: 0 } : undefined}
                >
                    <div className='relative'>
                        <SyntaxHighlighter
                            {...syntaxHighlighterProps}
                            style={oneLight}
                            className='overflow-hidden dark:hidden'
                        >
                            {visibleCode}
                        </SyntaxHighlighter>
                        <SyntaxHighlighter
                            {...syntaxHighlighterProps}
                            style={oneDark}
                            className='hidden overflow-hidden dark:block'
                        >
                            {visibleCode}
                        </SyntaxHighlighter>

                        {/* Partial collapse fade overlay */}
                        {hasPartialCollapse && !isPartialExpanded && (
                            <div className='absolute bottom-0 left-0 right-0'>
                                <div className='from-background via-background/80 h-20 bg-gradient-to-t to-transparent' />
                                <div className='bg-background flex items-center justify-center px-4 pb-3 pt-1'>
                                    <Button
                                        variant='ghost'
                                        size='sm'
                                        onClick={() => setIsPartialExpanded(true)}
                                        className='text-muted-foreground hover:text-foreground gap-1'
                                    >
                                        <ChevronDown className='h-4 w-4' />
                                        Show {hiddenLinesCount} more line
                                        {hiddenLinesCount > 1 ? 's' : ''}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Collapse button when expanded */}
                        {hasPartialCollapse && isPartialExpanded && (
                            <div className='bg-background flex items-center justify-center border-t border-stone-200 px-4 py-2 dark:border-zinc-800'>
                                <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={() => setIsPartialExpanded(false)}
                                    className='text-muted-foreground hover:text-foreground gap-1'
                                >
                                    <ChevronUp className='h-4 w-4' />
                                    Show less
                                </Button>
                            </div>
                        )}

                        {children && (
                            <div className='absolute right-2 top-2 flex items-center gap-2'>
                                {children}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </CodeBlockContext.Provider>
    )
}

export type CodeBlockCopyButtonProps = ComponentProps<typeof Button> & {
    onCopy?: () => void
    onError?: (error: Error) => void
    timeout?: number
}

export const CodeBlockCopyButton = ({
    onCopy,
    onError,
    timeout = 2000,
    children,
    className,
    ...props
}: CodeBlockCopyButtonProps) => {
    const [isCopied, setIsCopied] = useState(false)
    const { code } = useContext(CodeBlockContext)

    const copyToClipboard = async () => {
        if (typeof window === 'undefined' || !navigator.clipboard.writeText) {
            onError?.(new Error('Clipboard API not available'))
            return
        }

        try {
            await navigator.clipboard.writeText(code)
            setIsCopied(true)
            onCopy?.()
            setTimeout(() => setIsCopied(false), timeout)
        } catch (error) {
            onError?.(error as Error)
        }
    }

    return (
        <Button
            className={cn('relative shrink-0 overflow-hidden', className)}
            onClick={copyToClipboard}
            size='icon'
            variant='ghost'
            {...props}
        >
            {children ?? (
                <div className='relative h-[14px] w-[14px]'>
                    <CopyIcon
                        size={14}
                        className={cn(
                            'absolute inset-0 transition-all duration-300 ease-out',
                            isCopied
                                ? 'rotate-90 scale-50 opacity-0'
                                : 'rotate-0 scale-100 opacity-100'
                        )}
                    />
                    <CheckIcon
                        size={14}
                        className={cn(
                            'absolute inset-0 text-green-500 transition-all duration-300 ease-out',
                            isCopied
                                ? 'rotate-0 scale-100 opacity-100'
                                : '-rotate-90 scale-50 opacity-0'
                        )}
                    />
                </div>
            )}
        </Button>
    )
}
