/**
 * @fileoverview Utility functions for the notify module.
 * Contains helper functions used across the module.
 */

let idCounter = 0

/**
 * Generates a unique identifier for notifications.
 *
 * Combines a timestamp with a monotonically increasing counter so that ids
 * created within the same millisecond never collide.
 *
 * @returns A unique string identifier
 *
 * @example
 * ```ts
 * const id = generateId() // "notify_1234567890_0"
 * ```
 */
export function generateId(): string {
    idCounter += 1
    return `notify_${Date.now()}_${idCounter}`
}

/**
 * Safely extracts an error message from an unknown error type.
 * @param error - The error to extract message from
 * @param fallback - Fallback message if extraction fails
 * @returns The error message string
 *
 * @example
 * ```ts
 * try {
 *   throw new Error("Network failed")
 * } catch (e) {
 *   const msg = getErrorMessage(e, "Unknown error")
 *   // msg === "Network failed"
 * }
 * ```
 */
export function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error) {
        return error.message
    }
    if (typeof error === 'string') {
        return error
    }
    return fallback
}

/**
 * Creates a delay promise for async operations.
 * @param ms - Milliseconds to wait
 * @returns Promise that resolves after the delay
 *
 * @example
 * ```ts
 * await delay(1000) // Wait 1 second
 * ```
 */
export function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Type guard to check if a value is a non-null object.
 * @param value - Value to check
 * @returns True if value is a non-null object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null
}

/**
 * Type guard to check if a value is a React element without importing React.
 * Elements are branded with a `$$typeof` symbol by the JSX runtime.
 * @param value - Value to check
 * @returns True if value looks like a React element
 */
export function isReactElement(value: unknown): boolean {
    return isObject(value) && '$$typeof' in value
}

/**
 * Merges multiple class names, filtering out falsy values.
 * @param classes - Class names to merge
 * @returns Merged class string
 *
 * @example
 * ```ts
 * cn("foo", false && "bar", "baz") // "foo baz"
 * ```
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
    return classes.filter(Boolean).join(' ')
}
