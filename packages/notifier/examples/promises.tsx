"use client"

/**
 * Promise Tracking Example
 * Demonstrates automatic promise state tracking
 */

import { notify } from "@remcostoeten/notifier"

// Simulated API calls
const fetchUserData = () =>
  new Promise((resolve) => setTimeout(() => resolve({ name: "John", email: "john@example.com" }), 2000))

const deleteUser = () =>
  new Promise((resolve, reject) =>
    setTimeout(() => (Math.random() > 0.5 ? resolve() : reject(new Error("Network error"))), 2000),
  )

export function PromiseExamples() {
  // Basic promise tracking
  const loadUser = () => {
    notify.promise(fetchUserData(), {
      loading: "Loading user data...",
      success: "User data loaded!",
      error: "Failed to load user data",
    })
  }

  // Dynamic success message
  const loadUserWithData = () => {
    notify.promise(fetchUserData(), {
      loading: "Loading user...",
      success: (data) => `Welcome back, ${data.name}!`,
      error: "Could not load user",
    })
  }

  // Dynamic error message
  const deleteUserWithError = () => {
    notify.promise(deleteUser(), {
      loading: "Deleting user...",
      success: "User deleted successfully",
      error: (err) => `Error: ${err.message}`,
    })
  }

  // With callbacks
  const loadWithCallbacks = () => {
    notify.promise(
      fetchUserData(),
      {
        loading: "Fetching...",
        success: "Done!",
        error: "Failed!",
      },
      {
        onSuccess: (data) => console.log("Data:", data),
        onError: (error) => console.error("Error:", error),
      },
    )
  }

  return (
    <div className="space-y-2">
      <button onClick={loadUser}>Load User (Basic)</button>
      <button onClick={loadUserWithData}>Load User (With Data)</button>
      <button onClick={deleteUserWithError}>Delete User (With Error)</button>
      <button onClick={loadWithCallbacks}>With Callbacks</button>
    </div>
  )
}
