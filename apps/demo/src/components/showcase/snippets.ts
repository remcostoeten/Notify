export const SNIPPETS = {
    install: 'npm install @remcostoeten/notifier motion',
    setup: `// app/layout.tsx
import { Notifier } from '@remcostoeten/notifier'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <Notifier position="bottom-right" />
      </body>
    </html>
  )
}`,
    content: `import { notify } from '@remcostoeten/notifier'

notify('Saved')

notify({
  tone: 'dark',
  status: 'success',
  title: '“Amélie Laurent” details updated',
  description: 'Your changes have been saved and your profile is live.',
  actions: [
    { label: 'Dismiss', color: 'muted' },
    { label: 'View profile', onClick: () => router.push('/profile') }
  ]
})`,
    avatar: `notify({
  avatar: { src: sienna.src, badge: 'online' },
  title: 'Sienna Hewitt',
  meta: '2 mins ago',
  description: 'I’ve finished adding my notes.',
  actions: [
    { label: 'Dismiss', variant: 'outline' },
    { label: 'Reply', variant: 'filled', color: 'accent' }
  ]
})`,
    progress: `const id = notify({
  icon: <CloudUpload />,
  title: 'Uploading ‘toasts-FINAL06.fig’',
  progress: 0,
  actions: [{ label: 'Cancel', color: 'muted', onClick: cancel }]
})

upload.on('progress', (percent) => notify.update(id, { progress: percent }))
upload.on('done', () => notify.update(id, { title: 'Upload complete', progress: 100 }))`,
    promise: `await notify.promise(save(), {
  loading: 'Saving',
  success: (data) => ({ title: 'Saved', description: data.name }),
  error: (error) => ({ title: 'Could not save', description: error.message })
})`,
    compose: `import { notify, Toast } from '@remcostoeten/notifier'

notify.custom((toast) => (
  <Toast tone="light">
    <Toast.Avatar src={sienna.src} badge="online" />
    <Toast.Body>
      <Toast.Title meta="2 mins ago">Sienna Hewitt</Toast.Title>
      <Toast.Description>I’ve finished adding my notes.</Toast.Description>
      <Toast.Progress value={60} label />
      <Toast.Actions>
        <Toast.Action variant="outline">Dismiss</Toast.Action>
        <Toast.Action variant="filled" color="accent" onClick={() => reply()}>
          Reply
        </Toast.Action>
      </Toast.Actions>
    </Toast.Body>
    <Toast.Close />
  </Toast>
))`,
    theme: `<Notifier
  theme={{
    font: 'Geist, sans-serif',
    radius: 16,
    width: 420,
    dark: { background: '#0b0b0c', accent: '#7c6cff' },
    light: { accentText: '#4338ca' }
  }}
/>`,
    css: `:root {
  --ntf-dark-background: #0b0b0c;
  --ntf-light-accent: #5f5afa;
  --ntf-radius: 16px;
}`,
    slots: `notify({
  title: 'Saved',
  className: 'shadow-2xl',
  classNames: { title: 'tracking-tight', action: 'uppercase' }
})`
}
