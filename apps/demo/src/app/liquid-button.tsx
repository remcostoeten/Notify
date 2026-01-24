'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface HoverButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode
}

const HoverButton = React.forwardRef<HTMLButtonElement, HoverButtonProps>(
    ({ className, children, ...props }, ref) => {
        const buttonRef = React.useRef<HTMLButtonElement>(null)
        const [isListening, setIsListening] = React.useState(false)
        const [circles, setCircles] = React.useState<
            Array<{
                id: number
                x: number
                y: number
                color: string
                fadeState: 'in' | 'out' | null
            }>
        >([])
        const lastAddedRef = React.useRef(0)

        const createCircle = React.useCallback((x: number, y: number) => {
            const buttonWidth = buttonRef.current?.offsetWidth || 0
            const xPos = x / buttonWidth
            const color = `linear-gradient(to right, var(--circle-start) ${xPos * 100}%, var(--circle-end) ${
                xPos * 100
            }%)`

            setCircles((prev) => [...prev, { id: Date.now(), x, y, color, fadeState: null }])
        }, [])

        const handlePointerMove = React.useCallback(
            (event: React.PointerEvent<HTMLButtonElement>) => {
                if (!isListening) return

                const currentTime = Date.now()
                if (currentTime - lastAddedRef.current > 100) {
                    lastAddedRef.current = currentTime
                    const rect = event.currentTarget.getBoundingClientRect()
                    const x = event.clientX - rect.left
                    const y = event.clientY - rect.top
                    createCircle(x, y)
                }
            },
            [isListening, createCircle]
        )

        const handlePointerEnter = React.useCallback(() => {
            setIsListening(true)
        }, [])

        const handlePointerLeave = React.useCallback(() => {
            setIsListening(false)
        }, [])

        React.useEffect(() => {
            circles.forEach((circle) => {
                if (!circle.fadeState) {
                    setTimeout(() => {
                        setCircles((prev) =>
                            prev.map((c) => (c.id === circle.id ? { ...c, fadeState: 'in' } : c))
                        )
                    }, 0)

                    setTimeout(() => {
                        setCircles((prev) =>
                            prev.map((c) => (c.id === circle.id ? { ...c, fadeState: 'out' } : c))
                        )
                    }, 1000)

                    setTimeout(() => {
                        setCircles((prev) => prev.filter((c) => c.id !== circle.id))
                    }, 2200)
                }
            })
        }, [circles])

        return (
            <button
                ref={buttonRef}
                className={cn(
                    'relative isolate rounded-xl px-8 py-3',
                    'text-sm font-medium leading-6 text-zinc-100',
                    'bg-zinc-900/80 backdrop-blur-lg',
                    'cursor-pointer overflow-hidden',
                    'border border-zinc-700/50',
                    "before:absolute before:inset-0 before:content-['']",
                    'before:pointer-events-none before:rounded-[inherit]',
                    'before:z-[1]',
                    'before:shadow-[inset_0_0_0_1px_rgba(161,161,170,0.1),inset_0_0_16px_0_rgba(161,161,170,0.05),inset_0_-3px_12px_0_rgba(161,161,170,0.08),0_1px_3px_0_rgba(0,0,0,0.50),0_4px_12px_0_rgba(0,0,0,0.45)]',
                    'before:transition-transform before:duration-300',
                    'hover:border-zinc-600/60 hover:bg-zinc-800/90',
                    'active:before:scale-[0.975]',
                    'transition-colors duration-200',
                    className
                )}
                onPointerMove={handlePointerMove}
                onPointerEnter={handlePointerEnter}
                onPointerLeave={handlePointerLeave}
                {...props}
                style={
                    {
                        '--circle-start': '#a1a1aa',
                        '--circle-end': '#52525b'
                    } as React.CSSProperties
                }
            >
                {circles.map(({ id, x, y, color, fadeState }) => (
                    <div
                        key={id}
                        className={cn(
                            'absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full',
                            'pointer-events-none z-[-1] blur-lg transition-opacity duration-300',
                            fadeState === 'in' && 'opacity-75',
                            fadeState === 'out' && 'opacity-0 duration-[1.2s]',
                            !fadeState && 'opacity-0'
                        )}
                        style={{
                            left: x,
                            top: y,
                            background: color
                        }}
                    />
                ))}
                {children}
            </button>
        )
    }
)

HoverButton.displayName = 'HoverButton'

export { HoverButton }
