import type { ReactElement, ReactNode, SVGProps } from 'react'
import type { IconShape, ToastStatus } from '../types'

function Svg(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            aria-hidden='true'
            {...props}
        />
    )
}

type PartProps = {
    name: string
    children: ReactNode
}

function Part({ name, children }: PartProps) {
    return <g data-ntf-part={name}>{children}</g>
}

export function CheckCircleGlyph() {
    return (
        <Svg>
            <Part name='circle'>
                <circle cx='12' cy='12' r='10' />
            </Part>
            <Part name='tick'>
                <path d='m7.5 12 3 3 6-6' />
            </Part>
        </Svg>
    )
}

export function XCircleGlyph() {
    return (
        <Svg>
            <Part name='circle'>
                <circle cx='12' cy='12' r='10' />
            </Part>
            <Part name='cross'>
                <path d='m15 9-6 6' />
                <path d='m9 9 6 6' />
            </Part>
        </Svg>
    )
}

export function AlertGlyph() {
    return (
        <Svg>
            <Part name='sign'>
                <path d='m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3' />
                <Part name='bang'>
                    <Part name='bar'>
                        <path d='M12 9v4' />
                    </Part>
                    <Part name='point'>
                        <path d='M12 17h.01' />
                    </Part>
                </Part>
            </Part>
        </Svg>
    )
}

export function InfoGlyph() {
    return (
        <Svg>
            <Part name='circle'>
                <circle cx='12' cy='12' r='10' />
            </Part>
            <Part name='stem'>
                <path d='M12 16v-4' />
            </Part>
            <Part name='dot'>
                <path d='M12 8h.01' />
            </Part>
        </Svg>
    )
}

export function CheckMark() {
    return (
        <Svg>
            <Part name='tick'>
                <path d='m5.5 12.5 4.5 4.5 8.5-9' />
            </Part>
        </Svg>
    )
}

export function CrossMark() {
    return (
        <Svg>
            <Part name='cross'>
                <path d='M6.5 6.5l11 11M17.5 6.5l-11 11' />
            </Part>
        </Svg>
    )
}

export function InfoMark() {
    return (
        <Svg>
            <Part name='stem'>
                <path d='M12 10.5v6.5' />
            </Part>
            <Part name='dot'>
                <path d='M12 7h.01' />
            </Part>
        </Svg>
    )
}

export function SpinnerGlyph() {
    return (
        <Svg className='ntf-spin'>
            <path d='M21 12a9 9 0 1 1-6.219-8.56' />
        </Svg>
    )
}

export function CloseGlyph() {
    return (
        <Svg>
            <Part name='cross'>
                <path d='M18 6 6 18M6 6l12 12' />
            </Part>
        </Svg>
    )
}

const statusGlyphs: Record<ToastStatus, () => ReactElement> = {
    success: CheckCircleGlyph,
    error: XCircleGlyph,
    warning: AlertGlyph,
    info: InfoGlyph,
    loading: SpinnerGlyph
}

const statusMarks: Record<ToastStatus, () => ReactElement> = {
    success: CheckMark,
    error: CrossMark,
    warning: AlertGlyph,
    info: InfoMark,
    loading: SpinnerGlyph
}

type Props = {
    status: ToastStatus
    shape: IconShape
}

export function StatusGlyph({ status, shape }: Props) {
    const Glyph = shape === 'circle' ? statusMarks[status] : statusGlyphs[status]
    return <Glyph />
}
