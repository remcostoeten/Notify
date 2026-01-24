import { notify } from "@remcostoeten/notifier"

function fetchUserData() {
  return new Promise((resolve) => setTimeout(() => resolve({ name: "John", email: "john@example.com" }), 2000))
}

function deleteUser() {
  return new Promise((resolve, reject) =>
    setTimeout(() => (Math.random() > 0.5 ? resolve(null) : reject(new Error("Network error"))), 2000),
  )
}

export function PromiseExamples() {
  function loadUser() {
    notify.promise(fetchUserData(), {
      loading: "Loading user data...",
      success: "User data loaded!",
      error: "Failed to load user data",
    })
  }

  function loadUserWithData() {
    notify.promise(fetchUserData(), {
      loading: "Loading user...",
      success: "Welcome back, ${data.name}!",
      error: "Could not load user",
    })
  }

  function deleteUserWithError() {
    notify.promise(deleteUser(), {
      loading: "Deleting user...",
      success: "User deleted successfully",
      error: "Failed to delete user",
    })
  }

  function loadWithCallbacks() {
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
