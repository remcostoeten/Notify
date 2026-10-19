import { createContext, useContext } from 'react'
import { noop } from '../utils'
import type { ToastClassNames, ToastRuntime } from '../types'

const detachedRuntime: ToastRuntime = {
    id: '',
    tone: 'light',
    dismiss: noop,
    update: noop
}

export const RuntimeContext = createContext<ToastRuntime>(detachedRuntime)

export const SlotContext = createContext<ToastClassNames>({})

export const SheetContext = createContext(false)

export function useToast(): ToastRuntime {
    return useContext(RuntimeContext)
}
