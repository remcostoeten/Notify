/**
 * @fileoverview Utility functions for the notify module.
 * Contains helper functions used across the module.
 */

/**
 * Generates a unique identifier for notifications.
 * @returns A unique string identifier
 *
 * @example
 * ```ts
 * const id = generateId() // "notify_1234567890_abc"
 * ```
 */
export function generateId(): string {
  return `notify_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`
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
  if (typeof error === "string") {
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
  return typeof value === "object" && value !== null
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
  return classes.filter(Boolean).join(" ")
}
