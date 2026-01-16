"use client"

/**
 * Chaining Example
 * Demonstrates how to chain state transitions on a single notification
 */

import { notify } from "@remcostoeten/notifier"

export function ChainingExamples() {
  // Basic chaining
  const saveData = async () => {
    const n = notify.loading("Saving changes...")

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      n.success("Changes saved!")
    } catch (error) {
      n.error("Failed to save changes")
    }
  }

  // Multi-step process
  const multiStepProcess = async () => {
    const n = notify.loading("Step 1: Validating data...")

    await new Promise((resolve) => setTimeout(resolve, 1000))
    n.loading("Step 2: Uploading files...")

    await new Promise((resolve) => setTimeout(resolve, 1000))
    n.loading("Step 3: Processing...")

    await new Promise((resolve) => setTimeout(resolve, 1000))
    n.success("All steps completed!")
  }

  // Update message and options
  const updateNotification = async () => {
    const n = notify("Starting process...")

    await new Promise((resolve) => setTimeout(resolve, 1000))

    n.update({
      message: "Process running...",
      action: {
        label: "Cancel",
        onClick: () => {
          n.error("Process cancelled")
        },
      },
    })

    await new Promise((resolve) => setTimeout(resolve, 2000))
    n.success("Process complete!")
  }

  return (
    <div className="space-y-2">
      <button onClick={saveData}>Save with Chaining</button>
      <button onClick={multiStepProcess}>Multi-Step Process</button>
      <button onClick={updateNotification}>Update Notification</button>
    </div>
  )
}
