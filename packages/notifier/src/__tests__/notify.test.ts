/**
 * @fileoverview Tests for notify API
 */

import { describe, it, expect, vi, beforeEach } from "vitest"
import { notify, configure, getConfig } from "../notify"
import { getNotification, dismissAll } from "../store"
import { Defaults } from "../constants"

describe("notify", () => {
  beforeEach(() => {
    // Reset config and notifications
    configure({
      position: Defaults.POSITION,
      maxVisible: Defaults.MAX_VISIBLE,
      defaultDuration: Defaults.DURATION_MS,
      swipeToDismiss: true,
      pauseOnHover: true,
      clickToDismiss: false,
    })
    dismissAll()
    vi.advanceTimersByTime(500)
  })

  describe("notify()", () => {
    it("creates info notification with message and options", () => {
      const onDismiss = vi.fn()
      const instance = notify("Hello", { duration: 5000, onDismiss })

      const notification = getNotification(instance.id)
      expect(notification?.state).toBe("info")
      expect(notification?.message).toBe("Hello")
      expect(notification?.options.duration).toBe(5000)
      expect(notification?.options.onDismiss).toBe(onDismiss)
    })

    it("accepts options object without message", () => {
      const instance = notify({ message: "Hello", duration: 5000 })

      const notification = getNotification(instance.id)
      expect(notification?.message).toBe("Hello")
    })
  })

  describe("static methods", () => {
    it("creates notifications with correct states", () => {
      const loading = notify.loading("Loading...")
      const success = notify.success("Done!")
      const error = notify.error("Failed!")

      expect(getNotification(loading.id)?.state).toBe("loading")
      expect(getNotification(success.id)?.state).toBe("success")
      expect(getNotification(error.id)?.state).toBe("error")
    })
  })

  describe("chaining", () => {
    it("transitions states on same notification", () => {
      const instance = notify.loading("Loading...")
      expect(getNotification(instance.id)?.state).toBe("loading")

      const returned = instance.success("Done!")
      expect(getNotification(instance.id)?.state).toBe("success")
      expect(returned).toBe(instance)
    })
  })

  describe("notify.dismiss()", () => {
    it("dismisses by ID or all", () => {
      const first = notify("First")
      const second = notify("Second")

      notify.dismiss(first.id)
      expect(getNotification(first.id)?.visible).toBe(false)
      expect(getNotification(second.id)?.visible).toBe(true)

      notify.dismiss()
      vi.advanceTimersByTime(500)
    })
  })

  describe("notify.promise()", () => {
    it("tracks promise resolution", async () => {
      const promise = Promise.resolve("data")
      const result = await notify.promise(promise, {
        loading: "Loading...",
        success: "Loaded!",
      })
      expect(result).toBe("data")
    })

    it("tracks promise rejection", async () => {
      const promise = Promise.reject(new Error("Network error"))
      await expect(notify.promise(promise, { loading: "Loading...", error: "Failed" })).rejects.toThrow("Network error")
    })
  })

  describe("instance.update()", () => {
    it("updates options and returns instance", () => {
      const instance = notify("Hello")
      const action = { label: "Undo", onClick: vi.fn() }

      const returned = instance.update({ action })

      expect(getNotification(instance.id)?.options.action).toEqual(action)
      expect(returned).toBe(instance)
    })
  })

  describe("configure()", () => {
    it("updates and merges global configuration", () => {
      configure({ position: "top-right" })
      configure({ maxVisible: 5 })

      const config = getConfig()
      expect(config.position).toBe("top-right")
      expect(config.maxVisible).toBe(5)
    })
  })

  describe("maxVisible enforcement", () => {
    it("removes oldest when exceeding limit", () => {
      configure({ maxVisible: 2 })

      const first = notify("First")
      vi.advanceTimersByTime(10)
      const second = notify("Second")
      vi.advanceTimersByTime(10)
      notify("Third")

      expect(getNotification(first.id)?.visible).toBe(false)
      expect(getNotification(second.id)?.visible).toBe(true)
    })
  })
})
