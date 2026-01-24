import { notify } from "@remcostoeten/notifier"

export function BasicUsageExamples() {
  function showInfo() {
    notify("New message received")
  }

  function showSuccess() {
    notify.success("Changes saved successfully!")
  }

  function showError() {
    notify.error("Failed to save changes")
  }

  function showLoading() {
    notify.loading("Processing your request...")
  }

  function showCustomDuration() {
    notify("This stays for 10 seconds", { duration: 10000 })
  }

  function showPersistent() {
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
