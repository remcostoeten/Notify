/**
 * @fileoverview iOS-style spinner component for loading states.
 */

"use client"
import type { JSX } from "react"
import "../styles/spinner.css"

/**
 * Number of blades in the spinner.
 * @internal
 */
const BLADE_COUNT = 12

/**
 * iOS-style loading spinner.
 * Renders 12 animated blades in a circular pattern.
 *
 * @example
 * \`\`\`tsx
 * <Spinner />
 * \`\`\`
 */
export function Spinner(): JSX.Element {
  return (
    <div className="notify-spinner" role="status" aria-label="Loading">
      {Array.from({ length: BLADE_COUNT }, (_, i) => (
        <div key={i} className="notify-spinner-blade" />
      ))}
    </div>
  )
}
