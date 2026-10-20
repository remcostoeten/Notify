import type { NotifierProps } from "@remcostoeten/notifier";
import { useSyncExternalStore } from "react";

export type NotifierSettings = Required<
  Pick<NotifierProps, "position" | "stack" | "duration" | "maxVisible">
>;

const defaults: NotifierSettings = {
  position: "bottom-right",
  stack: true,
  duration: 5000,
  maxVisible: 3,
};

const listeners = new Set<() => void>();
let current = defaults;

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return current;
}

function getServerSnapshot() {
  return defaults;
}

/**
 * @name useNotifierSettings
 * @description Reads the options of the single mounted Notifier, so a page can
 * change them without mounting a second Notifier.
 *
 * @example
 * const { position } = useNotifierSettings()
 */
export function useNotifierSettings() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * @name setNotifierSettings
 * @description Merges a change into the options of the mounted Notifier.
 *
 * @example
 * setNotifierSettings({ position: "top-center" })
 */
export function setNotifierSettings(change: Partial<NotifierSettings>) {
  current = { ...current, ...change };
  emit();
}

/**
 * @name resetNotifierSettings
 * @description Restores the default options of the mounted Notifier.
 *
 * @example
 * useEffect(() => resetNotifierSettings, [])
 */
export function resetNotifierSettings() {
  current = defaults;
  emit();
}
