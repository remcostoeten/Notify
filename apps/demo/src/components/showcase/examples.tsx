import { CloudUpload, Codepen } from 'lucide-react'
import type { ToastInput } from '@remcostoeten/notifier'

const portrait = `data:image/svg+xml;utf8,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><defs><linearGradient id="a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a06a48"/><stop offset="1" stop-color="#7b4a31"/></linearGradient><linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4bd3f"/><stop offset="1" stop-color="#e9a521"/></linearGradient></defs><rect width="80" height="80" fill="#eadfbf"/><path d="M21 32c-4 14-3 31-7 48h11c2-15 1-27-1-40z" fill="#171b1e"/><path d="M59 32c4 14 3 31 7 48H55c-2-15-1-27 1-40z" fill="#171b1e"/><path d="M33 52h14v9c-4 4-10 4-14 0z" fill="#774630"/><path d="M8 80c1-12 9-18 20-20l12 6 12-6c11 2 19 8 20 20z" fill="url(#b)"/><ellipse cx="40" cy="38" rx="13" ry="16.5" fill="url(#a)"/><path d="M26 37c-2-17 6-26 14-26s16 9 14 26c-2-9-7-14-14-14s-12 5-14 14z" fill="#171b1e"/><path d="M34 41c1.5 1 3 1 4 0m4 0c1.5 1 3 1 4 0" stroke="#3a2418" stroke-width="1.2" fill="none" stroke-linecap="round"/><path d="M36 47c2.5 2 5.5 2 8 0" stroke="#4a2c1d" stroke-width="1.2" fill="none" stroke-linecap="round"/></svg>'
)}`

export const examples = {
    profile: {
        tone: 'dark',
        status: 'success',
        icon: { shape: 'ring' },
        title: '“Amélie Laurent” details updated',
        description:
            'Your changes have been saved and your profile is live. Your team can make edits.',
        actions: [
            { label: 'Dismiss', color: 'muted' },
            { label: 'View profile', color: 'default' }
        ]
    },
    upload: {
        tone: 'light',
        icon: <CloudUpload style={{ color: 'var(--ntf-accent-text)' }} />,
        title: 'Uploading ‘toasts-FINAL06.fig’',
        description: 'Please wait while we upload your file.',
        progress: 60,
        actions: [
            { label: 'Cancel', color: 'muted' },
            { label: 'Upload another', color: 'accent' }
        ]
    },
    message: {
        tone: 'light',
        avatar: { src: portrait, alt: 'Sienna Hewitt', badge: 'online' },
        title: 'Sienna Hewitt',
        meta: '2 mins ago',
        description: 'I’ve finished adding my notes. Happy for us to review whenever you’re ready!',
        actions: [
            { label: 'Dismiss', variant: 'outline' },
            { label: 'Reply', variant: 'filled', color: 'accent' }
        ]
    },
    update: {
        tone: 'dark',
        icon: <Codepen style={{ color: 'var(--ntf-icon)' }} />,
        title: 'A new update is available',
        meta: 'v4.2',
        description: 'Includes the all new dashboard view. Pages and exports will now load faster.',
        actions: [
            { label: 'Skip this update', variant: 'outline', color: 'muted' },
            { label: 'Install now', variant: 'filled', color: 'default' }
        ]
    }
} satisfies Record<string, ToastInput>

export type ExampleName = keyof typeof examples
