import { Defaults } from './constants'
import { generateId } from './utils'
import type {
    CustomRender,
    CustomToastOptions,
    DismissReason,
    ToastHandle,
    ToastID,
    ToastInput,
    ToastPatch,
    ToastPosition,
    ToastRecord
} from './types'

type StoreConfig = {
    position: ToastPosition
    duration: number
    maxVisible: number
}

type Hold = 'hover' | 'hidden' | 'focus'

type Timer = {
    handle: ReturnType<typeof setTimeout> | null
    total: number
    remaining: number
    startedAt: number
}

const records = new Map<ToastID, ToastRecord>()
const listeners = new Set<() => void>()
const timers = new Map<ToastID, Timer>()
const removals = new Map<ToastID, ReturnType<typeof setTimeout>>()
const holds = new Set<Hold>()

const defaultConfig: StoreConfig = {
    position: Defaults.POSITION,
    duration: Defaults.DURATION_MS,
    maxVisible: Defaults.MAX_VISIBLE
}

let config: StoreConfig = { ...defaultConfig }
let snapshot: readonly ToastRecord[] = []

function emit() {
    snapshot = Array.from(records.values())
    listeners.forEach((listener) => listener())
}

function positionOf(input: ToastInput): ToastPosition {
    return input.position ?? config.position
}

/**
 * @name resolveDuration
 * @description Milliseconds a toast stays open, or Infinity when it stays until
 * it is updated or dismissed. An explicit `duration` wins, with 0 meaning
 * persistent. Loading toasts and toasts with unfinished progress are persistent,
 * and so is every toast when the fallback is 0.
 *
 * @example
 * resolveDuration({ status: 'loading' }, 5000) // Infinity
 * resolveDuration({ progress: 100 }, 5000) // 5000
 */
export function resolveDuration(input: ToastInput, fallback: number): number {
    if (input.duration !== undefined) return input.duration > 0 ? input.duration : Infinity
    if (input.status === 'loading') return Infinity
    if (input.progress !== undefined) {
        const value = typeof input.progress === 'number' ? input.progress : input.progress.value
        if (value === null || value < 100) return Infinity
    }
    return fallback > 0 ? fallback : Infinity
}

function schedule(id: ToastID, timer: Timer) {
    if (timer.handle !== null || holds.size > 0 || !Number.isFinite(timer.remaining)) return
    timer.startedAt = Date.now()
    timer.handle = setTimeout(() => dismiss(id, 'timeout'), timer.remaining)
}

function clearTimer(id: ToastID) {
    const timer = timers.get(id)
    if (timer?.handle) clearTimeout(timer.handle)
    timers.delete(id)
}

function startTimer(id: ToastID, total: number) {
    clearTimer(id)
    const timer: Timer = { handle: null, total, remaining: total, startedAt: 0 }
    timers.set(id, timer)
    schedule(id, timer)
}

function retime(id: ToastID, input: ToastInput, restart: boolean) {
    const total = resolveDuration(input, config.duration)
    if (restart || timers.get(id)?.total !== total) startTimer(id, total)
}

function cancelRemoval(id: ToastID) {
    const removal = removals.get(id)
    if (removal) clearTimeout(removal)
    removals.delete(id)
}

function enforceMaxVisible(position: ToastPosition) {
    const open = Array.from(records.values()).filter(
        (record) => record.open && positionOf(record.input) === position
    )
    const overflow = open.length - config.maxVisible + 1
    if (overflow > 0) open.slice(0, overflow).forEach((record) => dismiss(record.id, 'replaced'))
}

function open(id: ToastID, input: ToastInput, render: CustomRender | null) {
    cancelRemoval(id)
    const existing = records.get(id)

    if (existing) {
        const merged = { ...existing.input, ...input }
        records.set(id, {
            ...existing,
            input: merged,
            render: render ?? existing.render,
            open: true
        })
        retime(id, merged, !existing.open)
        emit()
        return
    }

    enforceMaxVisible(positionOf(input))
    records.set(id, { id, input, render, open: true, createdAt: Date.now() })
    input.onOpen?.(id)
    startTimer(id, resolveDuration(input, config.duration))
    emit()
}

/**
 * @name configureStore
 * @description Sets the defaults every toast falls back to. Called by `Notifier`
 * when it mounts and whenever its props change.
 *
 * @example
 * configureStore({ position: 'top-right', maxVisible: 4 })
 */
export function configureStore(patch: Partial<StoreConfig>) {
    config = { ...config, ...patch }
}

export function getStoreConfig(): StoreConfig {
    return config
}

export function subscribe(listener: () => void): () => void {
    listeners.add(listener)
    return () => {
        listeners.delete(listener)
    }
}

export function getSnapshot(): readonly ToastRecord[] {
    return snapshot
}

export function getRecord(id: ToastID): ToastRecord | undefined {
    return records.get(id)
}

/**
 * @name show
 * @description Opens a toast from declarative content. Passing the id of an
 * existing toast updates it instead.
 *
 * @example
 * const id = show({ title: 'Saved', status: 'success' })
 */
export function show(input: ToastInput): ToastID {
    const id = input.id ?? generateId()
    open(id, input, null)
    return id
}

/**
 * @name showCustom
 * @description Opens a toast whose content is rendered by the caller.
 *
 * @example
 * showCustom((toast) => <Toast title='Hello' />, { duration: 3000 })
 */
export function showCustom(render: CustomRender, options: CustomToastOptions = {}): ToastID {
    const id = options.id ?? generateId()
    open(id, options, render)
    return id
}

/**
 * @name update
 * @description Merges a patch into an open toast. The timer keeps running unless
 * the patch sets `duration` or changes whether the toast is persistent.
 *
 * @example
 * update(id, { progress: 60 })
 */
export function update(id: ToastID, patch: ToastPatch) {
    const existing = records.get(id)
    if (!existing || !existing.open) return
    const merged = { ...existing.input, ...patch }
    records.set(id, { ...existing, input: merged })
    retime(id, merged, 'duration' in patch)
    emit()
}

/**
 * @name dismiss
 * @description Closes a toast. It stays in the store until its exit animation has
 * played, then `onClose` fires and it is removed.
 *
 * @example
 * dismiss(id, 'manual')
 */
export function dismiss(id: ToastID, reason: DismissReason = 'manual') {
    const record = records.get(id)
    if (!record || !record.open) return
    clearTimer(id)
    records.set(id, { ...record, open: false })
    record.input.onDismiss?.(id, reason)
    emit()
    removals.set(
        id,
        setTimeout(() => {
            removals.delete(id)
            records.delete(id)
            record.input.onClose?.(id)
            emit()
        }, Defaults.EXIT_MS)
    )
}

export function dismissAll(reason: DismissReason = 'manual') {
    records.forEach((_, id) => dismiss(id, reason))
}

export function handleFor(id: ToastID): ToastHandle {
    return {
        id,
        dismiss: (reason) => dismiss(id, reason),
        update: (patch) => update(id, patch)
    }
}

/**
 * @name pauseTimers
 * @description Holds every auto-dismiss timer, remembering the time each had left.
 * Timers resume once every hold has been released.
 *
 * @example
 * pauseTimers('hover')
 */
export function pauseTimers(hold: Hold) {
    const running = holds.size === 0
    holds.add(hold)
    if (!running) return
    const now = Date.now()
    timers.forEach((timer) => {
        if (timer.handle === null) return
        clearTimeout(timer.handle)
        timer.handle = null
        timer.remaining = Math.max(0, timer.remaining - (now - timer.startedAt))
    })
}

export function resumeTimers(hold: Hold) {
    holds.delete(hold)
    if (holds.size > 0) return
    timers.forEach((timer, id) => schedule(id, timer))
}

export function resetStore() {
    timers.forEach((timer) => {
        if (timer.handle) clearTimeout(timer.handle)
    })
    removals.forEach((removal) => clearTimeout(removal))
    records.clear()
    listeners.clear()
    timers.clear()
    removals.clear()
    holds.clear()
    config = { ...defaultConfig }
    snapshot = []
}
