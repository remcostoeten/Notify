"use client"

/**
 * Basic Usage Example
 * Demonstrates the most common notification patterns
 */

import { notify } from "@remcostoeten/notifier"

export function BasicUsageExamples() {
  // Simple info notification
  const showInfo = () => {
    notify("New message received")
  }

  // Success notification
  const showSuccess = () => {
    notify.success("Changes saved successfully!")
  }

  // Error notification
  const showError = () => {
    notify.error("Failed to save changes")
  }

  // Loading notification
  const showLoading = () => {
    notify.loading("Processing your request...")
  }

  // With custom duration
  const showCustomDuration = () => {
    notify("This stays for 10 seconds", { duration: 10000 })
  }

  // Never auto-dismiss
  const showPersistent = () => {
    notify("This stays until manually dismissed", { duration: 0 })
  }

  return (
    <div className="space-y-2">
      <button onClick={showInfo}>Info</button>
      <button onClick={showSuccess}>Success</button>
      <button onClick={showError}>Error</button>
      <button onClick={showLoading}>Loading</button>
      <button onClick={showCustomDuration}>Custom Duration</button>
      <button onClick={showPersistent}>Persistent</button>
    </div>
  )
}
