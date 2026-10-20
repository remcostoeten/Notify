"use client";

import { Notifier } from "@remcostoeten/notifier";
import { useTheme } from "next-themes";
import { useNotifierSettings } from "../notifier-settings";

export function SiteNotifier() {
  const { resolvedTheme } = useTheme();
  const settings = useNotifierSettings();

  return <Notifier {...settings} tone={resolvedTheme === "dark" ? "dark" : "light"} />;
}
