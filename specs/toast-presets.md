# Toast Presets Specification

**Goal:** Provide one-liner configurations that instantly make `@remcostoeten/notifier` look and feel like other popular libraries or follow common design systems.

## 1. Preset Structure

```typescript
// packages/notifier/src/presets/index.ts

export const presets = {
  sonner: { /* config */ },
  ios: { /* config */ },
  material: { /* config */ },
  default: { /* config */ }
}
```

## 2. Supported Presets

### A. Sonner
- **Colors:** Black background/white text (dark mode), White bg/black text (light).
- **Radius:** `rounded` (approx 12px?)
- **Behavior:** `swipeToDismiss: true`
- **Position:** `bottom-right`

### B. iOS / Apple
- **Colors:** Blurry translucent background (backdrop-filter support needed in core).
- **Radius:** `pill` (large radius)
- **Position:** `top-center`

### C. Material Design
- **Radius:** `squared` (4px)
- **Shadow:** Deep shadows
- **Buttons:** Uppercase action text

## 3. Implementation

- Add `presets` export to package entry.
- Ensure `configure()` method accepts these preset objects directly.

**Example Usage:**
```tsx
import { notify, presets } from "@remcostoeten/notifier"
import { useEffect } from "react"

export function App() {
  useEffect(() => {
    // Apply preset
    notify.configure(presets.sonner)
  }, [])

  return <Notifier /> // Uses configured preset defaults
}
```

## 4. Requirements

- Presets must use strict TypeScript types matching `NotifyContainerConfig`.
- Should facilitate community contributed presets in the future.
