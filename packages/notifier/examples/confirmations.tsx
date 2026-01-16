"use client"

/**
 * Confirmation Dialog Example
 * Demonstrates confirmation dialogs with async/await
 */

import { notify } from "@remcostoeten/notifier"

export function ConfirmationExamples() {
  // Basic confirmation
  const deleteFile = async () => {
    const confirmed = await notify.confirm("Delete this file?")

    if (confirmed) {
      notify.success("File deleted")
    } else {
      notify("Deletion cancelled")
    }
  }

  // Custom labels
  const deleteWithCustomLabels = async () => {
    const confirmed = await notify.confirm("Delete this file?", {
      confirmLabel: "Delete",
      cancelLabel: "Keep",
    })

    if (confirmed) {
      const n = notify.loading("Deleting...")
      await new Promise((resolve) => setTimeout(resolve, 1000))
      n.success("File deleted")
    }
  }

  // Dangerous action
  const dangerousAction = async () => {
    const confirmed = await notify.confirm("This action cannot be undone!", {
      confirmLabel: "I understand, proceed",
      cancelLabel: "Cancel",
    })

    if (confirmed) {
      notify.error("Action performed")
    }
  }

  // Multiple confirmations
  const multipleConfirmations = async () => {
    const firstConfirm = await notify.confirm("Are you sure?")

    if (firstConfirm) {
      const secondConfirm = await notify.confirm("Are you really sure?", {
        confirmLabel: "Yes, I am sure",
        cancelLabel: "Wait, no",
      })

      if (secondConfirm) {
        notify.success("Double confirmed!")
      }
    }
  }

  return (
    <div className="space-y-2">
      <button onClick={deleteFile}>Delete File</button>
      <button onClick={deleteWithCustomLabels}>Custom Labels</button>
      <button onClick={dangerousAction}>Dangerous Action</button>
      <button onClick={multipleConfirmations}>Multiple Confirmations</button>
    </div>
  )
}
