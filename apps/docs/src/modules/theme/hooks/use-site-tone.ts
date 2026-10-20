"use client";

import type { ToastTone } from "@remcostoeten/notifier";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { noop } from "@/shared/helpers/noop";

function subscribe() {
  return noop;
}

/**
 * @name useSiteTone
 * @description The toast tone that matches the site theme. Light until the
 * page has hydrated, because the server does not know the stored theme.
 *
 * @example
 * const tone = useSiteTone()
 */
export function useSiteTone(): ToastTone {
  const { resolvedTheme } = useTheme();
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  return hydrated && resolvedTheme === "dark" ? "dark" : "light";
}
