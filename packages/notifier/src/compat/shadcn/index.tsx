'use client'

import { notify } from '../../notify'
import { Notifier } from '../../components/notification'
import type { NotifierProps } from '../../components/notification'

/**
 * Shadcn UI 'use-toast' hook compatibility.
 * Many users copy-paste the 'use-toast.ts' hook from shadcn.
 * This adapter replaces that hook file implementation.
 */

// Values often used in shadcn

export function useToast() {
    const toast = ({ title, description, variant, action, ...props }: any) => {
        // Map 'destructive' variant to 'error' state
        if (variant === 'destructive') {
            return notify.error(String(title), {
                action: action ? { label: 'Action', onClick: () => {} } : undefined, // Partial support
                ...props
            })
        }

        // Default toast
        // If description exists, append it? Or use it as message?
        // Notifier currently supports single message.
        const message = description ? `${title} - ${description}` : String(title)

        return notify(message, {
            action: action ? { label: 'Action', onClick: () => {} } : undefined,
            ...props
        })
    }

    return {
        toast,
        dismiss: (id?: string) => notify.dismiss(id),
        toasts: [] // Not supported in headless mode yet without hook state
    }
}

// Re-export basic Toaster for app root
export function Toaster(props: NotifierProps) {
    return <Notifier {...props} />
}
