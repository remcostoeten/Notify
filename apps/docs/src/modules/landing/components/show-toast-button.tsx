"use client";

import { notify } from "@remcostoeten/notifier";
import type { ReactNode } from "react";
import { cn } from "@/shared/helpers/cn";
import type { ExampleName } from "@/modules/notifier/examples";
import { examples } from "@/modules/notifier/examples";
import { useShowToast } from "@/modules/notifier/components/toast-preview";

type Props = {
  example?: ExampleName;
  message?: string;
  size?: "md" | "sm";
  children: ReactNode;
};

export function ShowToastButton({ example, message, size = "md", children }: Props) {
  const show = useShowToast();

  return (
    <button
      type="button"
      onClick={() => {
        if (example) show(examples[example]);
        else if (message) notify.success(message);
      }}
      className={cn(
        "pressable bg-foreground font-medium text-background hover:bg-foreground/85 focus-visible:bg-foreground/85 focus-visible:text-background",
        size === "md" ? "h-10 px-5 text-sm" : "h-8 px-4 text-[13px]",
      )}
    >
      {children}
    </button>
  );
}
