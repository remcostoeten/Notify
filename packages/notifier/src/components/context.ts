import { createContext, useContext } from 'react'
import { Defaults } from '../constants'
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

export const CloseLabelContext = createContext<string>(Defaults.CLOSE_LABEL)

export function useToast(): ToastRuntime {
    return useContext(RuntimeContext)
}
