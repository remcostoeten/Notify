# @remcostoeten/notifier

A lightweight, chainable notification system for React with smooth animations, flexible theming, and a Sonner-like API.

<p align="center">
  <a href="https://www.npmjs.com/package/@remcostoeten/notifier">
    <img src="https://img.shields.io/npm/v/@remcostoeten/notifier.svg" alt="npm version" />
  </a>
  <a href="https://www.npmjs.com/package/@remcostoeten/notifier">
    <img src="https://img.shields.io/npm/dm/@remcostoeten/notifier.svg" alt="npm downloads" />
  </a>
  <a href="https://bundlephobia.com/package/@remcostoeten/notifier">
    <img src="https://img.shields.io/bundlephobia/minzip/@remcostoeten/notifier" alt="bundle size" />
  </a>
  <a href="https://github.com/remcostoeten/toasti/blob/master/LICENSE">
    <img src="https://img.shields.io/npm/l/@remcostoeten/notifier.svg" alt="license" />
  </a>
</p>

<!-- Added preview image placeholder -->
<p align="center">
  <img src="public/preview.gif" alt="Notifier Preview" width="600" />
</p>

## Features

- **Chainable API**: State transitions made easy (`notify.loading().success()`)
- **Promise Tracking**: Automatic state updates for async operations
- **Confirmations**: Built-in async/await confirmation dialogs
- **Highly Customizable**: 6 positions, 3 radius styles, and dark/light/auto modes
- **Performance First**: Driven by Framer Motion for buttery smooth 60fps animations
- **Swipe to Dismiss**: Natural touch and mouse gestures with direction awareness
- **Lightweight**: Zero unnecessary dependencies, tree-shakable
- **Typescript**: Core-first TS support with rich type definitions

## Installation

```bash
bun add @remcostoeten/notifier
# or
npm install @remcostoeten/notifier
```

## Quick Start

1. Add the Notifier component to your root layout:

```tsx
import { Notifier } from '@remcostoeten/notifier'

export default function RootLayout({ children }) {
    return (
        <html>
            <body>
                {children}
                <Notifier position='bottom-right' />
            </body>
        </html>
    )
}
```

1. Call notify from anywhere:

```tsx
import { notify } from '@remcostoeten/notifier'

function MyComponent() {
    const handleSave = async () => {
        const n = notify.loading('Saving...')

        try {
            await saveData()
            n.success('Saved!')
        } catch (err) {
            n.error('Failed to save')
        }
    }

    return <button onClick={handleSave}>Save</button>
}
```

## API

### Basic Methods

```tsx
notify('Message') // Info notification
notify.loading('Processing...') // Loading state
notify.success('Done!') // Success state
notify.error('Failed') // Error state
notify.dismiss() // Dismiss all
notify.dismiss(id) // Dismiss by ID
```

### Chaining

Each method returns an instance for state transitions:

```tsx
const n = notify.loading('Saving...')

try {
    await saveData()
    n.success('Saved!')
} catch (err) {
    n.error(err.message)
}
```

### Promise Tracking

```tsx
notify.promise(fetchData(), {
    loading: 'Loading...',
    success: 'Data loaded!',
    error: (err) => `Error: ${err.message}`
})
```

### Confirmations

```tsx
const confirmed = await notify.confirm('Delete this item?', {
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel'
})

if (confirmed) {
    await deleteItem()
}
```

## Notifier Props

| Prop           | Type                                                                                              | Default          | Description                                      |
| -------------- | ------------------------------------------------------------------------------------------------- | ---------------- | ------------------------------------------------ |
| position       | `'top-left' \| 'top-center' \| 'top-right' \| 'bottom-left' \| 'bottom-center' \| 'bottom-right'` | `'bottom-right'` | Notification position                            |
| duration       | `number`                                                                                          | `3000`           | Auto-dismiss duration in ms. Set to 0 to disable |
| maxVisible     | `number`                                                                                          | `5`              | Maximum visible notifications                    |
| colorMode      | `'dark' \| 'light' \| 'auto'`                                                                     | `'dark'`         | Color theme                                      |
| radius         | `'pill' \| 'rounded' \| 'squared'`                                                                | `'pill'`         | Border radius style                              |
| iconColor      | `'colored' \| 'neutral' \| 'hidden'`                                                              | `'colored'`      | Icon color mode                                  |
| swipeToDismiss | `boolean`                                                                                         | `true`           | Enable swipe gestures                            |
| pauseOnHover   | `boolean`                                                                                         | `true`           | Pause auto-dismiss on hover                      |
| gap            | `number`                                                                                          | `8`              | Gap between notifications (px)                   |

## Project Structure

```
├── packages/
│   ├── notifier/          # Core library (@remcostoeten/notifier)
│   └── release-cli/       # Internal release automation tool
├── apps/
│   └── demo/              # Documentation & Showcase (Next.js)
└── README.md
```

## Development

```bash
# Install dependencies
bun install

# Run documentation/showcase
bun dev

# Build the library
bun run build:notifier
```

## License

MIT © [Remco Stoeten](https://github.com/remcostoeten)
