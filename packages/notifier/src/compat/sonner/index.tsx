'use client'

import React from 'react'
import { createToastAdapter } from '../factory'
import { Notifier } from '../../components/notification'
import type { NotifierProps, NotifyPositionType } from '../../components/notification'

// Create the adapter instance
export const toast = createToastAdapter({
    defaultOptions: {
        // Sonner defaults
        duration: 4000
    }
})

// Sonner Toaster component compatibility
// Maps Sonner props to Notifier props where applicable
export interface ToasterProps extends NotifierProps {
    invert?: boolean
    theme?: 'light' | 'dark' | 'system'
    position?: NotifyPositionType
    hotkey?: string[]
    richColors?: boolean
    expand?: boolean
    duration?: number
    visibleToasts?: number
    closeButton?: boolean
    toastOptions?: any
    offset?: string | number
}

export function Toaster({
    theme = 'system',
    position = 'bottom-right',
    richColors = false,
    visibleToasts = 3,
    duration = 4000,
    closeButton = false,
    offset,
    ...props
}: ToasterProps) {
    // Map 'system' theme to 'auto'
    const colorMode = theme === 'system' ? 'auto' : theme

    return (
        <Notifier
            position={position as any}
            colorMode={colorMode}
            maxVisible={visibleToasts}
            duration={duration}
            dismissible={closeButton}
            iconColor={richColors ? 'colored' : 'neutral'}
            offset={typeof offset === 'string' ? parseInt(offset) : offset}
            {...props}
        />
    )
}
