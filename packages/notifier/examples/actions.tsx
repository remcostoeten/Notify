"use client"

/**
 * Action Buttons Example
 * Demonstrates notifications with interactive action buttons
 */

import { notify } from "@remcostoeten/notifier"

export function ActionExamples() {
  // Basic action
  const notifyWithAction = () => {
    notify("File moved to trash", {
      duration: 5000,
      action: {
        label: "Undo",
        onClick: () => notify.success("File restored"),
      },
    })
  }

  // Action that updates the notification
  const actionWithUpdate = () => {
    const n = notify("Ready to sync?", {
      duration: 0,
      action: {
        label: "Sync Now",
        onClick: async () => {
          n.loading("Syncing...")
          await new Promise((resolve) => setTimeout(resolve, 2000))
          n.success("Sync complete!")
        },
      },
    })
  }

  // Multiple actions pattern
  const multipleActions = () => {
    let timeoutId: NodeJS.Timeout

    notify("3 new messages", {
      duration: 0,
      action: {
        label: "View",
        onClick: () => {
          clearTimeout(timeoutId)
          notify.success("Opening messages...")
        },
      },
      onDismiss: (reason) => {
        if (reason === "manual") {
          timeoutId = setTimeout(() => {
            console.log("Mark as read")
          }, 100)
        }
      },
    })
  }

  // Delayed action
  const delayedAction = () => {
    let cancelled = false

    notify("Download starting in 5 seconds", {
      duration: 5000,
      action: {
        label: "Cancel",
        onClick: () => {
          cancelled = true
          notify("Download cancelled")
        },
      },
      onDismiss: () => {
        if (!cancelled) {
          notify.loading("Downloading...")
        }
      },
    })
  }

  return (
    <div className="space-y-2">
      <button onClick={notifyWithAction}>Undo Action</button>
      <button onClick={actionWithUpdate}>Action with Update</button>
      <button onClick={multipleActions}>Multiple Actions</button>
      <button onClick={delayedAction}>Delayed Action</button>
    </div>
  )
}
