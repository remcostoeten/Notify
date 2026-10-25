import type { ExampleName } from "@/modules/notifier/examples";

export const snippets = {
  install: "npm install @remcostoeten/notifier motion",
  setup: `import { Notifier } from '@remcostoeten/notifier'

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
})`,
};

export const exampleSnippets = {
  profile: `import { notify } from '@remcostoeten/notifier'

await notify.promise(saveProfile(form), {
  loading: { title: 'Saving “Amélie Laurent”', description: 'Publishing your profile changes to the team.' },
  success: {
    title: '“Amélie Laurent” details updated',
    description: 'Your changes have been saved and your profile is live. Your team can make edits.',
    actions: [
      { label: 'Dismiss', color: 'muted' },
      {
        label: 'View profile',
        onClick: () => router.push('/profile'),
        labels: { loading: 'Opening', success: 'Opened' }
      }
    ]
  },
  error: (error) => ({ title: 'Could not save', description: error.message })
})`,
  upload: `import { notify } from '@remcostoeten/notifier'
import { CloudUpload } from 'lucide-react'

const id = notify({
  icon: <CloudUpload />,
  title: 'Uploading ‘toasts-FINAL06.fig’',
  description: 'Please wait while we upload your file.',
  progress: 0,
  actions: [
    {
      label: 'Cancel',
      color: 'muted',
      onClick: () => upload.cancel(),
      labels: { loading: 'Cancelling', success: 'Cancelled' }
    },
    { label: 'Upload another', dismiss: false, onClick: () => pickFile() }
  ]
})

upload.on('progress', (percent) => notify.update(id, { progress: percent }))
upload.on('done', (file) =>
  notify.update(id, {
    icon: { shape: 'box' },
    status: 'success',
    title: \`Uploaded ‘\${file.name}’\`,
    description: 'Saved to Files. Your team can open it now.',
    progress: 100,
    actions: [
      { label: 'Open file', color: 'muted', onClick: () => open(file), labels: { loading: 'Opening' } },
      { label: 'Upload another', dismiss: false, onClick: () => pickFile() }
    ]
  })
)`,
  message: `import { notify } from '@remcostoeten/notifier'
import sienna from './sienna.jpg'

notify({
  avatar: { src: sienna.src, alt: 'Sienna Hewitt', badge: 'online' },
  title: 'Sienna Hewitt',
  meta: '2 mins ago',
  description: 'I’ve finished adding my notes. Happy for us to review whenever you’re ready!',
  actions: [
    { label: 'Dismiss', variant: 'outline' },
    {
      label: 'Reply',
      variant: 'filled',
      onClick: () => sendReply(thread),
      labels: { loading: 'Sending', success: 'Sent', error: 'Not sent' }
    }
  ]
})`,
  update: `import { notify } from '@remcostoeten/notifier'
import { Box } from 'lucide-react'

notify({
  icon: <Box />,
  title: 'A new update is available',
  meta: 'v4.2',
  description: 'Includes the all new dashboard view. Pages and exports will now load faster.',
  actions: [
    { label: 'Skip this update', variant: 'outline', color: 'muted' },
    {
      label: 'Install now',
      variant: 'filled',
      onClick: () => installUpdate(),
      labels: { loading: 'Installing', success: 'Installed' }
    }
  ]
})`,
  sync: `import { notify } from '@remcostoeten/notifier'

const id = notify({
  status: 'loading',
  title: 'Syncing 0 of 120 files',
  description: '0 MB of 480 MB',
  progress: 0,
  animateNumbers: true
})

notify.update(id, {
  title: 'Syncing 45 of 120 files',
  description: '180 MB of 480 MB',
  progress: 37
})`,
} satisfies Record<ExampleName, string>;
