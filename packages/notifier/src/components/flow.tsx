import { Children, useContext, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { cellsOf, formatNumber, splitNumbers, trendOf } from '../number-flow'
import type { FlowTrend } from '../number-flow'
import { cx } from '../utils'
import { NumbersContext } from './context'
import { useDigitRoll, useWidthMotion } from './play-motion'

type DigitCellProps = {
    char: string
    trend: FlowTrend
    enter: boolean
}

function DigitCell({ char, trend, enter }: DigitCellProps) {
    const ref = useRef<HTMLSpanElement>(null)
    useDigitRoll(ref, char, trend, enter)
    return (
        <span ref={ref} className='ntf-digit'>
            <span className='ntf-digit-face'>{char}</span>
        </span>
    )
}

type FlowNumberProps = {
    text: string
}

function FlowNumber({ text }: FlowNumberProps) {
    const ref = useRef<HTMLSpanElement>(null)
    const [shown, setShown] = useState({ text, previous: text, changed: false })
    if (shown.text !== text) setShown({ text, previous: shown.text, changed: true })
    const trend = trendOf(shown.previous, text)
    useWidthMotion(ref, text)

    return (
        <span ref={ref} className='ntf-num'>
            {cellsOf(text).map((cell) => (
                <DigitCell key={cell.key} char={cell.char} trend={trend} enter={shown.changed} />
            ))}
        </span>
    )
}

function flowNodes(children: ReactNode): ReactNode[] {
    let ordinal = 0
    function numberAt(text: string) {
        const node = <FlowNumber key={`n${ordinal}`} text={text} />
        ordinal += 1
        return node
    }
    return Children.toArray(children).flatMap((child) => {
        if (typeof child === 'number') return [numberAt(String(child))]
        if (typeof child !== 'string') return [child]
        return splitNumbers(child).map((segment) =>
            segment.kind === 'number' ? numberAt(segment.text) : segment.text
        )
    })
}

type FlowedProps = {
    children: ReactNode
}

/**
 * @name Flowed
 * @description Renders its children with every number in them rolling digit by digit
 * when it changes. Numbers are found in text and in number children. When number
 * animation is off, which is the default, the children render untouched.
 *
 * @example
 * <Flowed>{`Uploaded ${done} of ${total}`}</Flowed>
 */
export function Flowed({ children }: FlowedProps) {
    const enabled = useContext(NumbersContext)
    return <>{enabled ? flowNodes(children) : children}</>
}

type DigitsProps = {
    value: number
    locales?: string | string[]
    format?: Intl.NumberFormatOptions
    className?: string
}

export function Digits({ value, locales, format, className }: DigitsProps) {
    return (
        <span className={cx('ntf-digits', className)}>
            {flowNodes(formatNumber(value, locales, format))}
        </span>
    )
}
