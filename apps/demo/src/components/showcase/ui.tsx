'use client'
import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

type ButtonProps = {
    onClick: () => void
    children: React.ReactNode
    className?: string
}

export function Button({ onClick, children, className = '' }: ButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`border-border text-muted-foreground hover:border-border-strong hover:text-foreground focus-visible:outline-ring border bg-transparent px-3 py-1.5 font-mono text-xs transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 ${className}`}
        >
            {children}
        </button>
    )
}

export function PrimaryButton({ onClick, children, className = '' }: ButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`bg-foreground text-background focus-visible:outline-ring h-10 px-5 text-sm font-medium transition-colors hover:bg-[#cccccc] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 ${className}`}
        >
            {children}
        </button>
    )
}

type StageProps = {
    children: React.ReactNode
    className?: string
}

export function Stage({ children, className = 'h-[300px] md:h-[360px]' }: StageProps) {
    return (
        <div
            className={`relative overflow-hidden rounded-2xl border border-[#e8e8ea] bg-[#fafafa] ${className}`}
        >
            <div className='absolute inset-0 right-6 bottom-6 rounded-br-[36px] border-r border-b border-[#d4d4d8] bg-white md:right-11 md:bottom-11' />
            <div className='absolute right-9 bottom-9 left-4 flex justify-end md:right-[62px] md:bottom-[62px]'>
                {children}
            </div>
        </div>
    )
}

type SectionHeadingProps = {
    id?: string
    label: string
    hint?: string
}

export function SectionHeading({ id, label, hint }: SectionHeadingProps) {
    return (
        <div
            id={id}
            className='border-border flex scroll-mt-16 items-baseline justify-between border-b px-6 py-4'
        >
            <h2 className='text-muted-foreground font-mono text-[11px] font-medium tracking-[0.2em] uppercase'>
                {label}
            </h2>
            {hint && <span className='text-faint hidden text-xs sm:block'>{hint}</span>}
        </div>
    )
}

type InstallCommandProps = {
    command: string
}

export function InstallCommand({ command }: InstallCommandProps) {
    const [copied, setCopied] = useState(false)

    async function copy() {
        await navigator.clipboard.writeText(command)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <button
            onClick={copy}
            className='border-border text-muted-foreground hover:border-border-strong hover:text-foreground focus-visible:outline-ring group flex h-10 items-center gap-3 border px-4 font-mono text-[13px] transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2'
        >
            <span className='text-faint select-none'>$</span>
            <span>{command}</span>
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
