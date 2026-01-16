# Claude Project Context

## Overview
Notify is a headless, chainable toast notification library for React.
It supports:
- Promise tracking (`notify.promise`)
- Confirmations (`notify.confirm`)
- Custom themes and positions.

## Tech Stack
- **Runtime**: Bun
- **Framework**: React 19
- **Animation**: Framer Motion
- **Styling**: Tailwind CSS (for apps), CSS Modules/Inline (for package).

## Key Files
- `packages/notifier/src/store.ts`: Core state management (Observer pattern).
- `packages/notifier/src/notify.ts`: Public API facade.
- `packages/notifier/src/components/notification.tsx`: Main component.

## Directives
- When suggesting changes, always check `packages/notifier/src/types.ts` first.
- Maintain chainable API signature.
- Ensure strict type safety.
