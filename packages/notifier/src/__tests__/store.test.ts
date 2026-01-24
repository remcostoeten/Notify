/**
 * @fileoverview Tests for notification store
 * Consolidated redundant tests, focused on behavior over implementation
 */

import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  getNotifications,
  getNotification,
  subscribe,
  setState,
  setConfirmState,
  resolveConfirm,
  pauseTimer,
  resumeTimer,
  dismiss,
  dismissAll,
  enforceMaxVisible,
  updateOptions,
} from "../store"
import { DismissReason } from "../constants"

describe("store", () => {
  beforeEach(() => {
    dismissAll()
    vi.advanceTimersByTime(500)
  })

  describe("setState", () => {
    it("creates and updates notifications with proper state tracking", () => {
      setState("test-1", "loading", "Loading...")

      const initial = getNotification("test-1")
      expect(initial?.state).toBe("loading")
      expect(initial?.visible).toBe(true)

      setState("test-1", "success", "Done!")

      const updated = getNotification("test-1")
      expect(updated?.state).toBe("success")
      expect(updated?.prevState).toBe("loading")
    })

    it("preserves options and actions through state changes", () => {
      const action = { label: "Undo", onClick: vi.fn() }
      setState("test-1", "info", "Message", { duration: 5000, action })
      setState("test-1", "success", "Done!")

      const notification = getNotification("test-1")
      expect(notification?.options.duration).toBe(5000)
      expect(notification?.options.action).toEqual(action)
    })

    it("triggers lifecycle callbacks correctly", () => {
      const onOpen = vi.fn()
      const onUpdate = vi.fn()

      setState("test-1", "loading", "Loading...", { onOpen, onUpdate })
      expect(onOpen).toHaveBeenCalledWith("test-1")

      setState("test-1", "success", "Done!")
      expect(onUpdate).toHaveBeenCalledWith("test-1", "success", "loading")
    })

    it("handles auto-dismiss for terminal states", () => {
      setState("test-1", "success", "Done!", { duration: 3000 })
      expect(getNotification("test-1")?.visible).toBe(true)

      vi.advanceTimersByTime(3000)
      expect(getNotification("test-1")?.visible).toBe(false)
    })

    it("respects duration: 0 to prevent auto-dismiss", () => {
      setState("test-1", "success", "Done!", { duration: 0 })
      vi.advanceTimersByTime(10000)
      expect(getNotification("test-1")?.visible).toBe(true)
    })

    it("does not auto-dismiss loading state", () => {
      setState("test-1", "loading", "Loading...")
      vi.advanceTimersByTime(10000)
      expect(getNotification("test-1")?.visible).toBe(true)
    })
  })

  describe("subscribe", () => {
    it("manages listeners correctly", () => {
      const listener = vi.fn()
      const unsubscribe = subscribe(listener)

      setState("test-1", "info", "Message")
      expect(listener).toHaveBeenCalled()

      listener.mockClear()
      unsubscribe()

      setState("test-2", "info", "Message")
      expect(listener).not.toHaveBeenCalled()
    })
  })

  describe("confirm flow", () => {
    it("handles full confirm lifecycle", () => {
      const resolver = vi.fn()
      setConfirmState("test-1", "Delete?", {}, resolver)

      expect(getNotification("test-1")?.state).toBe("confirm")

      resolveConfirm("test-1", true)
      expect(resolver).toHaveBeenCalledWith(true)
      expect(getNotification("test-1")?.confirmResolver).toBeNull()
    })

    it("auto-resolves as false on dismiss", () => {
      const resolver = vi.fn()
      setConfirmState("test-1", "Delete?", {}, resolver)

      dismiss("test-1")
      expect(resolver).toHaveBeenCalledWith(false)
    })
  })

  describe("pause/resume timer", () => {
    it("pauses and resumes auto-dismiss timer", () => {
      setState("test-1", "success", "Done!", { duration: 3000 })

      vi.advanceTimersByTime(1000)
      pauseTimer("test-1")

      expect(getNotification("test-1")?.paused).toBe(true)

      vi.advanceTimersByTime(5000)
      expect(getNotification("test-1")?.visible).toBe(true)

      resumeTimer("test-1")
      expect(getNotification("test-1")?.paused).toBe(false)
    })
  })

  describe("dismiss", () => {
    it("handles full dismiss lifecycle with callbacks", () => {
      const onDismiss = vi.fn()
      const onClose = vi.fn()
      setState("test-1", "info", "Message", { onDismiss, onClose })

      dismiss("test-1", DismissReason.MANUAL)

      expect(getNotification("test-1")?.visible).toBe(false)
      expect(onDismiss).toHaveBeenCalledWith("test-1", DismissReason.MANUAL)

      vi.advanceTimersByTime(300)
      expect(getNotification("test-1")).toBeUndefined()
      expect(onClose).toHaveBeenCalledWith("test-1")
    })
  })

  describe("dismissAll", () => {
    it("dismisses all notifications", () => {
      setState("test-1", "info", "Message 1")
      setState("test-2", "info", "Message 2")

      dismissAll()

      expect(getNotifications().every((n) => !n.visible)).toBe(true)
    })
  })

  describe("enforceMaxVisible", () => {
    it("removes oldest when exceeding max", () => {
      setState("test-1", "info", "Message 1")
      vi.advanceTimersByTime(10)
      setState("test-2", "info", "Message 2")
      vi.advanceTimersByTime(10)
      setState("test-3", "info", "Message 3")

      enforceMaxVisible(3, "test-4")

      expect(getNotification("test-1")?.visible).toBe(false)
      expect(getNotification("test-2")?.visible).toBe(true)
      expect(getNotification("test-3")?.visible).toBe(true)
    })
  })

  describe("updateOptions", () => {
    it("updates and adds notification options", () => {
      setState("test-1", "info", "Message", { duration: 3000 })

      const action = { label: "Undo", onClick: vi.fn() }
      updateOptions("test-1", { duration: 5000, action })

      const notification = getNotification("test-1")
      expect(notification?.options.duration).toBe(5000)
      expect(notification?.options.action).toEqual(action)
    })
  })
})
