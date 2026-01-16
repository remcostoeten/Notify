# Migration Adapters Specification

**Goal:** Allow users to migrate from `sonner` or `react-hot-toast` to `@remcostoeten/notifier` by changing only their import paths, with zero logic changes.

## 1. Directory Structure

Create a new `compat/` entry point in the package.

```
packages/notifier/
├── src/
│   ├── compat/
│   │   ├── sonner.ts         # Wrapper implementing Sonner API
│   │   ├── react-hot-toast.ts # Wrapper implementing React-Hot-Toast API
│   │   └── index.ts          # Exports
```

## 2. Sonner Adapter (`compat/sonner`)

**Sonner API to Mock:**
- `toast(message)`
- `toast.success(message)`
- `toast.error(message)`
- `toast.loading(message)`
- `toast.promise(promise, options)`
- `toast.dismiss(id)`
- `Toaster` component (wraps `Notifier` with sonner-like defaults)

**Implementation Strategy:**
- Map `toast()` -> `notify()`
- Map `Toaster` props to `Notifier` props
- Ensure return types match (string ID vs number ID handling)

**Example Usage:**
```typescript
// Before
import { toast, Toaster } from "sonner"

// After
import { toast, Toaster } from "@remcostoeten/notifier/compat/sonner"
```

## 3. React-Hot-Toast Adapter (`compat/react-hot-toast`)

**React-Hot-Toast API to Mock:**
- `toast(message)`
- `toast.success(message)`
- `toast.error(message)`
- `toast.loading(message)`
- `toast.promise(promise, msgs, opts)` (Different signature than sonner!)
- `Toaster` component

**Implementation Strategy:**
- Handle the different promise signature (RHT uses `success`/`error` strings or generic render functions).
- Map `position` strings (RHT uses "top-center", we use "top-center" etc - verify mapping).

## 4. Requirements

1. **Type Compatibility:** The exported types must match the original libraries' types enough to avoid TS errors.
2. **Behavioral Parity:**
   - Adapters must pre-configure `Notifier` with defaults matching the target lib (e.g. Sonner uses black toasts by default, RHT uses white/shadowy).
3. **Tree Shaking:** Compat files should not be bundled if not used.

## 5. Testing Plan

- Create `test-dts` tests to verify type compatibility.
- Integration tests comparing actual output of `compat/sonner` vs real `sonner` (optional, or just verify behavior manually).
