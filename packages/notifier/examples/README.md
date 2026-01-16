# @remcostoeten/notifier - Examples

This directory contains comprehensive examples demonstrating all features of the notifier library.

## Examples

### [basic-usage.tsx](./basic-usage.tsx)
Basic notification patterns including info, success, error, loading, and custom durations.

### [chaining.tsx](./chaining.tsx)
Chaining state transitions on a single notification instance for multi-step processes.

### [promises.tsx](./promises.tsx)
Automatic promise tracking with loading/success/error states.

### [confirmations.tsx](./confirmations.tsx)
Confirmation dialogs with async/await support.

### [actions.tsx](./actions.tsx)
Interactive action buttons within notifications.

### [theming.tsx](./theming.tsx)
Theme customization examples with different color modes, borders, and icon styles.

## Running Examples

To use these examples in your project:

1. Install the package:
```bash
npm install @remcostoeten/notifier framer-motion
```

2. Add the `<Notifier />` component to your app:
```tsx
import { Notifier } from '@remcostoeten/notifier'

export default function App() {
  return (
    <>
      <YourApp />
      <Notifier />
    </>
  )
}
```

3. Import and use any example component:
```tsx
import { BasicUsageExamples } from './examples/basic-usage'

function Page() {
  return <BasicUsageExamples />
}
```

## Live Demo

Visit [your-demo-url] to see all examples in action.

## Contributing Examples

Have a useful pattern? Submit a PR with a new example file!
