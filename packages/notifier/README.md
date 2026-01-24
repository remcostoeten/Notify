# @remcostoeten/notifier

<div align="center">
  <img src="./assets/logo.png" alt="Notifier Logo" width="200" />
  <br />
  
  [![npm version](https://img.shields.io/npm/v/@remcostoeten/notifier.svg)](https://www.npmjs.com/package/@remcostoeten/notifier)
  [![npm downloads](https://img.shields.io/npm/dm/@remcostoeten/notifier.svg)](https://www.npmjs.com/package/@remcostoeten/notifier)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Bundle Size](https://img.shields.io/bundlephobia/minzip/@remcostoeten/notifier?label=minzipped)](https://bundlephobia.com/package/@remcostoeten/notifier)
</div>

Enterprise-grade chainable notification system for React with smooth animations, confirmations, and promise tracking.

## Features

- **Chainable API** - `notify.loading("Saving...").success("Done!")`
- **Promise tracking** - Automatic loading → success/error transitions
- **Confirmations** - Built-in confirm/cancel dialogs with async/await
- **Fully themeable** - Dark/light modes, custom colors, borders, icons
- **6 positions** - Top, bottom, corners
- **Swipe to dismiss** - Smooth gesture-based dismissal
- **Smooth animations** - Powered by Motion
- **Zero config** - Works out of the box
- **Highly configurable** - Every aspect is customizable
- **TypeScript** - Full type safety

## Installation

```bash
bun add @remcostoeten/notifier motion
# or
npm install @remcostoeten/notifier motion
# or iff you're a maniac in 2026 use
yarn add @remcostoeten/notifier motion
npm i @remcostoeten/notifier motion
```

## Quick Start

### 1. Add the mother notifier instance to your app

\_

```tsx
import { Notifier } from '@remcostoeten/notifier'
import '@remcostoeten/notifier/styles'

export default function RootLayout({ children }) {
    return (
        <html>
            <body>
                {children}
                <Notifier />
            </body>
        </html>
    )
}
```

### 2. Use notify anywhere

```tsx
import { notify } from '@remcostoeten/notifier'

function MyComponent() {
    return <button onClick={() => notify('Hello!')}>Show notification</button>
}
```

## Migration from other notification libraries

### Migration from Sonner

The package provides a built-in compatibility layer that mimics the Sonner API.

```tsx
// 1. Change your imports
// FROM: import { Toaster, toast } from 'sonner'
// TO:
import { Toaster, toast } from '@remcostoeten/notifier/compat/sonner'

// 2. That's it! Most common props are supported:
// <Toaster position="top-center" richColors closeButton />
// toast.success('Event has been created')
```

### Migration from react-hot-toast

Drop-in replacement for React Hot Toast is also available.

```tsx
// 1. Change your imports
// FROM: import { Toaster, toast } from 'react-hot-toast'
// TO:
import { Toaster, toast } from '@remcostoeten/notifier/compat/react-hot-toast'

// 2. Use as usual
// <Toaster position="bottom-center" />
// toast.success('Successfully saved!')
```

### Migration from shadcn/ui

Replace your `use-toast.ts` hook or imports:

```tsx
import { useToast } from '@remcostoeten/notifier/compat/shadcn'
import { Toaster } from '@remcostoeten/notifier/compat/shadcn'

// Usage remains the same:
// const { toast } = useToast()
// <Toaster />
```

## Basic Usage

```tsx
// Info (default)
notify('New message received')

// States
notify.loading('Processing...')
notify.success('Operation completed')
notify.error('Something went wrong')

// With options
notify('Custom notification', {
    duration: 5000,
    action: {
        label: 'Undo',
        onClick: () => console.log('Undo clicked')
    }
})
```

## Chaining

```tsx
const n = notify.loading('Saving...')

try {
    await saveData()
    n.success('Saved!')
} catch (error) {
    n.error('Failed to save')
}
```

## Promise Tracking

```tsx
notify.promise(fetchData(), {
    loading: 'Loading data...',
    success: 'Data loaded!',
    error: 'Failed to load data'
})
```

## Confirmations

```tsx
const confirmed = await notify.confirm('Delete this file?', {
    confirmLabel: 'Delete',
    cancelLabel: 'Keep'
})

if (confirmed) {
    // User clicked Delete
    await deleteFile()
}
```

## Configuration

Configure global behavior via the `<Notifier />` component:

```tsx
<Notifier
    // Position
    position='top-right'
    // Behavior
    duration={4000}
    maxVisible={5}
    swipeToDismiss={true}
    pauseOnHover={true}
    clickToDismiss={false}
    // Theme
    colorMode='dark'
    radius='pill'
    iconColor='colored'
    // Border
    border={{
        enabled: true,
        width: 1,
        color: 'rgba(255, 255, 255, 0.1)',
        style: 'solid'
    }}
    // Custom icons
    icons={{
        success: <CustomCheckIcon />,
        error: <CustomErrorIcon />
    }}
/>
```

## API Reference

### notify(message, options?)

Show an info notification.

**Parameters:**

- `message` (string) - The notification message
- `options` (NotifyOptions) - Optional configuration

**Returns:** `NotifyInstance` - Chainable notification instance

### notify.loading(message, options?)

Show a loading notification with spinner.

### notify.success(message, options?)

Show a success notification.

### notify.error(messageOrError, options?)

Show an error notification. Accepts Error objects.

### notify.dismiss(id?)

Dismiss a notification by ID, or all if no ID provided.

### notify.promise(promise, options)

Track a promise with automatic state transitions.

**Options:**

- `loading` (string) - Loading message
- `success` (string | function) - Success message or function receiving result
- `error` (string | function) - Error message or function receiving error

### notify.confirm(message, options?)

Show a confirmation dialog and await user response.

**Options:**

- `confirmLabel` (string) - Confirm button text (default: "Confirm")
- `cancelLabel` (string) - Cancel button text (default: "Cancel")

**Returns:** `Promise<boolean>` - true if confirmed, false if cancelled

### Instance Methods

Every `notify()` call returns an instance with chainable methods:

```tsx
const n = notify('Hello')

n.loading('Loading...')
n.success('Success!')
n.error('Error!')
n.update({ message: 'Updated', action: {...} })
n.dismiss()
```

## Notifier Props

| Prop             | Type                        | Default     | Description                                                                                            |
| ---------------- | --------------------------- | ----------- | ------------------------------------------------------------------------------------------------------ |
| `position`       | `NotifyPositionType`        | `"bottom"`  | `top`, `bottom`, `top-left`, `top-right`, `bottom-left`, `bottom-right`, `top-center`, `bottom-center` |
| `duration`       | `number`                    | `3000`      | Auto-dismiss duration in ms (0 = never)                                                                |
| `maxVisible`     | `number`                    | `5`         | Maximum visible notifications                                                                          |
| `swipeToDismiss` | `boolean`                   | `true`      | Enable swipe to dismiss                                                                                |
| `pauseOnHover`   | `boolean`                   | `true`      | Pause auto-dismiss on hover                                                                            |
| `clickToDismiss` | `boolean`                   | `false`     | Dismiss on click anywhere on the toast                                                                 |
| `dismissible`    | `boolean`                   | `false`     | Show a dismiss (X) button by default                                                                   |
| `offset`         | `number \| string \| {x,y}` | `16`        | Offset from screen edge (e.g. `16`, `"16px"`, `{x: 20, y: 40}`)                                        |
| `gap`            | `number`                    | `8`         | Gap between stacked notifications                                                                      |
| `colorMode`      | `ColorMode`                 | `"dark"`    | Theme: `dark`, `light`, `auto`                                                                         |
| `radius`         | `RadiusVariant`             | `"pill"`    | Border radius: `pill`, `rounded`, `squared`                                                            |
| `iconColor`      | `IconColorMode`             | `"colored"` | Icon style: `colored`, `neutral`, `hidden`                                                             |
| `border`         | `boolean \| BorderConfig`   | `false`     | Border configuration                                                                                   |
| `icons`          | `IconConfig`                | -           | Custom icon overrides                                                                                  |

## NotifyOptions

Options for individual notifications:

| Option           | Type           | Description                       |
| ---------------- | -------------- | --------------------------------- |
| `duration`       | `number`       | Override default duration         |
| `action`         | `NotifyAction` | Add action button                 |
| `onOpen`         | `function`     | Called when shown                 |
| `onClose`        | `function`     | Called when hidden                |
| `onDismiss`      | `function`     | Called when dismissed with reason |
| `onUpdate`       | `function`     | Called when state changes         |
| `swipeToDismiss` | `boolean`      | Override swipe behavior           |
| `clickToDismiss` | `boolean`      | Override click behavior           |

## Contributing

You do you, but can't promise anything.

MIT

xxx,
Remco Stoeten

[Remco Stoeten website](https://remcostoeten-nl.vercel.app)
[@remcostoeten on GitHub](https://github.com/remcostoeten)
[@yowremco on Twitter](https://twitter.com/yowremco)
