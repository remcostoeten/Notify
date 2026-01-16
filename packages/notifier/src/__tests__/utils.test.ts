/**
 * @fileoverview Tests for utility functions
 */

import { describe, it, expect } from "vitest"
import { generateId, getErrorMessage, isObject, cn } from "../utils"

describe("utils", () => {
  describe("generateId", () => {
    it("generates unique IDs with correct format", () => {
      const id1 = generateId()
      const id2 = generateId()

      expect(id1).not.toBe(id2)
      expect(id1).toMatch(/^notify_\d+_[a-z0-9]+$/)
    })
  })

  describe("getErrorMessage", () => {
    it("extracts message from Error instance", () => {
      expect(getErrorMessage(new Error("Network failed"), "fallback")).toBe("Network failed")
    })

    it("returns string errors directly", () => {
      expect(getErrorMessage("String error", "fallback")).toBe("String error")
    })

    it("returns fallback for non-error types", () => {
      expect(getErrorMessage(null, "fallback")).toBe("fallback")
      expect(getErrorMessage(undefined, "fallback")).toBe("fallback")
      expect(getErrorMessage(123, "fallback")).toBe("fallback")
    })
  })

  describe("isObject", () => {
    it("correctly identifies objects vs primitives", () => {
      expect(isObject({})).toBe(true)
      expect(isObject({ key: "value" })).toBe(true)
      expect(isObject([])).toBe(true)
      expect(isObject(null)).toBe(false)
      expect(isObject(undefined)).toBe(false)
      expect(isObject("string")).toBe(false)
      expect(isObject(123)).toBe(false)
    })
  })

  describe("cn", () => {
    it("merges class names and filters falsy values", () => {
      expect(cn("foo", "bar", "baz")).toBe("foo bar baz")
      expect(cn("foo", false, "bar", null, undefined)).toBe("foo bar")
      expect(cn("base", true && "active", false && "disabled")).toBe("base active")
    })
  })
})
