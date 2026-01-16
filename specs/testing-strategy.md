# Comprehensive Testing Strategy Specification

**Goal:** Ensure enterprise-grade reliability through a layered testing approach: Unit, Component, and End-to-End (E2E), specifically focusing on verifying the notification system and migration tools.

## 1. Unit Testing (Vitest)
*Current coverage is good for Store logic. Needs expansion.*

- **Scope:** `store.ts`, `utils.ts`, `compat/*` adapters.
- **Location:** `src/__tests__/unit/`
- **Tools:** Vitest (already installed)
- **Key Scenarios:**
  - Store state transitions (IDLE -> LOADING -> SUCCESS).
  - Max visible enforcement logic.
  - Timer pause/resume logic (verify critical fix).
  - Compatibility adapter type mapping.

## 2. Component Testing (React Testing Library + Vitest)
*Currently missing/minimal.*

- **Scope:** `Notifier`, `NotificationItem`, `NotifyIcon`.
- **Location:** `src/__tests__/component/`
- **Tools:** `@testing-library/react`, `jsdom`.
- **Key Scenarios:**
  - **Rendering:** Verify correct class names and styles for `solid`, `pill`, etc.
  - **Interactions:**
    - Click to dismiss.
    - Hover pauses timer (mock timers).
    - Action button clicks.
  - **Animations:** Verify `framer-motion` exit animations don't break unmounting.
  - **Accessibility:** Check `role="alert"`, aria-live regions.

## 3. End-to-End Testing (Playwright)
*New requirement.*

- **Scope:** Full library usage in the `apps/app` demo application.
- **Location:** `apps/app/e2e/`
- **Tools:** Playwright
- **Key Scenarios:**
  - **Visual Regression:** Screenshot tests of notifications in different positions/themes.
  - **Gestures:** Simulate real swipe gestures (touch events) to verify dismiss.
  - **Concurrency:** Trigger 20 notifications rapidly and verify performance/stacking.
  - **Framework Integration:** Verify it works in a real Next.js build (SSR hydration checks).

## 4. Migration Testing (The "Safe Switch")

- **Fixture Projects:**
  - Create `test/fixtures/sonner-app`
  - Create `test/fixtures/rht-app`
- **Tests:**
  1. Run fixture app with original lib -> Capture screenshot.
  2. Run migration tool (or manually swap import).
  3. Run fixture app with `@remcostoeten/notifier` -> Capture screenshot.
  4. **Validation:** Ensure visual delta is acceptable (or identical if that's the goal).

## 5. CI Pipeline Implementation

```yaml
jobs:
  test:
    steps:
      - run: bun test:unit
      - run: bun test:component
  e2e:
    steps:
      - run: bun run build
      - run: bun run test:e2e
```
