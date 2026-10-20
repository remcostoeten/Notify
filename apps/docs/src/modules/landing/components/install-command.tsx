"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { CheckIcon, CopyIcon } from "@/shared/icons/icons";

type Props = {
  command: string;
  children: ReactNode;
};

const resetDelay = 2000;

export function InstallCommand({ command, children }: Props) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  function copy() {
    void navigator.clipboard.writeText(command).then(() => {
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), resetDelay);
    });
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : `Copy ${command}`}
      className="group pressable flex h-10 items-center gap-3 border text-left border-foreground/10 px-4 font-mono text-[13px] text-foreground/65 hover:border-foreground/20 hover:text-foreground"
    >
      <span className="text-foreground/40 select-none">$</span>
      {children}
      {copied ? (
        <CheckIcon className="size-3.5 text-foreground" />
      ) : (
        <CopyIcon className="size-3.5 text-foreground/40 group-hover:text-foreground" />
      )}
    </button>
  );
}
