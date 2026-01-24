'use client'

import React from 'react'
import { createToastAdapter } from '../factory'
import { Notifier } from '../../components/notification'
import type { NotifierProps, NotifyPositionType } from '../../components/notification'

// Create adapter
export const toast = createToastAdapter({
    defaultOptions: {
        // RHT defaults
        duration: 4000,
        position: 'top-center'
    }
})

export { toast as default }

// RHT Toaster
export interface ToasterProps extends NotifierProps {
    position?: NotifyPositionType
    reverseOrder?: boolean
    containerStyle?: React.CSSProperties
    toastOptions?: any
}

export function Toaster({ position = 'top-center', ...props }: ToasterProps) {
    return <Notifier position={position as any} radius='rounded' iconColor='colored' {...props} />
}
