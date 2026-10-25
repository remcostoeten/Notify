export type FlowSegment = { kind: 'text'; text: string } | { kind: 'number'; text: string }

export type FlowCell = {
    key: string
    char: string
}

export type FlowTrend = -1 | 0 | 1

// Digits with grouping or decimal separators between them, such as 45, 1,234 or 3.14
const NUMBER_TOKEN = /\d+(?:[.,]\d+)*/g

/**
 * @name splitNumbers
 * @description Splits text into runs of plain text and runs that are a number, keeping
 * the original characters so the pieces join back into the input.
 *
 * @example
 * splitNumbers('Uploaded 45 of 120')
 * // [text 'Uploaded ', number '45', text ' of ', number '120']
 */
export function splitNumbers(text: string): FlowSegment[] {
    const segments: FlowSegment[] = []
    let cursor = 0
    for (const match of text.matchAll(NUMBER_TOKEN)) {
        if (match.index > cursor)
            segments.push({ kind: 'text', text: text.slice(cursor, match.index) })
        segments.push({ kind: 'number', text: match[0] })
        cursor = match.index + match[0].length
    }
    if (cursor < text.length) segments.push({ kind: 'text', text: text.slice(cursor) })
    return segments
}

/**
 * @name cellsOf
 * @description The characters of a number, each keyed by its distance from the right
 * edge. A digit keeps its key when digits are added or removed on the left, so 99
 * becoming 100 rolls the two existing digits and adds one.
 *
 * @example
 * cellsOf('120') // [{ key: 'p2', char: '1' }, { key: 'p1', char: '2' }, { key: 'p0', char: '0' }]
 */
export function cellsOf(token: string): FlowCell[] {
    const chars = Array.from(token)
    return chars.map((char, index) => ({ key: `p${chars.length - 1 - index}`, char }))
}

function valueOf(token: string): number {
    return Number(token.replace(/\D/g, ''))
}

/**
 * @name trendOf
 * @description Which way a number moved, so its digits can roll up when it grows and
 * down when it shrinks. Zero when it did not change.
 *
 * @example
 * trendOf('45', '60') // 1
 * trendOf('1,200', '980') // -1
 */
export function trendOf(previous: string, next: string): FlowTrend {
    return Math.sign(valueOf(next) - valueOf(previous)) as FlowTrend
}

/**
 * @name formatNumber
 * @description A number as text, through `Intl.NumberFormat` when locales or options
 * are given and plain `String` otherwise.
 *
 * @example
 * formatNumber(1234.5, 'en-US', { style: 'currency', currency: 'USD' }) // '$1,234.50'
 */
export function formatNumber(
    value: number,
    locales?: string | string[],
    options?: Intl.NumberFormatOptions
): string {
    if (locales === undefined && options === undefined) return String(value)
    return new Intl.NumberFormat(locales, options).format(value)
}
