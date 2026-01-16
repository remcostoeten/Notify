# Zero-Config Provider Specification

**Goal:** Simplify setup by providing a context-based provider wrapper, which is a common pattern in React apps, rather than just a standalone component.

## 1. API Design

```tsx
// app/providers.tsx
import { NotifierProvider } from "@remcostoeten/notifier"

export function Providers({ children }) {
  return (
    <NotifierProvider
       position="top-right"
       colorMode="auto"
    >
      {children}
    </NotifierProvider>
  )
}
```

## 2. Why?

- **Context Isolation:** Allows potentially scoped notifications (though the store is currently global/module-level).
- **Theme Inheritance:** Can access parent theme contexts easier than a sibling component.
- **Micro-Frontend Support:** Easier to mount multiple Notifier instances in different sub-trees if creating scoped instances.

## 3. Implementation

1. Create `src/components/notifier-provider.tsx`.
2. It renders `<Notifier {...props} />` and optionally a Context Provider if we move state to Context (future proofing).
3. For now, it's mostly a wrapper for DX familiarity.

## 4. Requirements

- Must accept all `NotifierProps`.
- Must render `children`.
- Should use `React.memo` to prevent re-renders of the entire app tree if props change.
