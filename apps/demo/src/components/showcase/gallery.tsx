'use client'
import { notify, Toast } from '@remcostoeten/notifier'
import { useEffect, useRef } from 'react'
import { examples } from './examples'
import type { ExampleName } from './examples'
import { Button, Stage } from './ui'

const names: { name: ExampleName; label: string }[] = [
    { name: 'profile', label: 'Status with actions' },
    { name: 'upload', label: 'Progress' },
    { name: 'message', label: 'Avatar and buttons' },
    { name: 'update', label: 'Icon box and buttons' }
]

export function showExample(name: ExampleName, onProgress?: (stop: () => void) => void): string {
    if (name !== 'upload') return notify(examples[name])
    const id = notify({ ...examples.upload, progress: 0 })
    let value = 0
    const timer = setInterval(() => {
        value = Math.min(100, value + 5 + Math.round(Math.random() * 10))
        notify.update(id, { progress: value })
        if (value >= 100) clearInterval(timer)
    }, 450)
    onProgress?.(() => clearInterval(timer))
    return id
}

export function Gallery() {
    const stops = useRef<(() => void)[]>([])

    useEffect(
        () => () => {
            stops.current.forEach((stop) => stop())
        },
        []
    )

    return (
        <div className='grid grid-cols-1 gap-x-4 gap-y-8 p-6 md:grid-cols-2'>
            {names.map(({ name, label }) => (
                <div key={name} className='flex flex-col gap-3'>
                    <Stage>
                        <Toast {...examples[name]} />
                    </Stage>
                    <div className='flex items-center justify-between px-1'>
                        <span className='text-muted-foreground text-[13px]'>{label}</span>
                        <Button
                            className='rounded-md'
                            onClick={() => showExample(name, (stop) => stops.current.push(stop))}
                        >
                            Show
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    )
}
