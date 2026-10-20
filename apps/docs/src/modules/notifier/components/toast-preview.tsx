"use client";

import { notify, Toast } from "@remcostoeten/notifier";
import type { ToastInput } from "@remcostoeten/notifier";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { type ExampleName, examples } from "../examples";

type Content = Pick<
  ToastInput,
  | "tone"
  | "status"
  | "icon"
  | "avatar"
  | "title"
  | "meta"
  | "description"
  | "progress"
  | "actions"
  | "close"
  | "width"
  | "position"
  | "duration"
>;

type PreviewProps = Content & {
  example?: ExampleName;
  label?: string;
  trigger?: boolean;
  stock?: boolean;
};

type ButtonProps = Content & {
  example?: ExampleName;
  children: ReactNode;
};

function resolve(example: ExampleName | undefined, content: Content): ToastInput {
  return { ...(example ? examples[example] : {}), ...content };
}

export function useShowToast() {
  const timers = useRef<ReturnType<typeof setInterval>[]>([]);

  useEffect(
    () => () => {
      timers.current.forEach(clearInterval);
    },
    [],
  );

  return function show(input: ToastInput) {
    if (typeof input.progress !== "number") return notify(input);
    const id = notify({ ...input, progress: 0 });
    let value = 0;
    const timer = setInterval(() => {
      value = Math.min(100, value + 5 + Math.round(Math.random() * 10));
      notify.update(id, { progress: value });
      if (value >= 100) clearInterval(timer);
    }, 450);
    timers.current.push(timer);
    return id;
  };
}

export function ToastPreview({
  example,
  label,
  trigger = true,
  stock = false,
  ...content
}: PreviewProps) {
  const show = useShowToast();
  const input = resolve(example, content);

  return (
    <div
      data-site-tone={input.tone ? undefined : ""}
      data-stock-tone={stock ? "" : undefined}
      className="not-prose my-6 border border-foreground/5"
    >
      <div className="flex min-h-40 items-center justify-center overflow-x-auto bg-foreground/3 px-4 py-8">
        <Toast {...input} />
      </div>
      {trigger ? (
        <div className="flex items-center justify-between gap-4 border-t border-foreground/5 px-4 py-2">
          <span className="font-mono text-xs text-foreground/50">{label ?? "Live preview"}</span>
          <button
            type="button"
            onClick={() => show(input)}
            className="pressable border border-foreground/10 px-3 py-1 font-mono text-xs text-foreground/70 transition-colors duration-150 ease-hover hover:bg-foreground/5 hover:text-foreground focus-visible:bg-foreground/8"
          >
            Show toast
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function ToastButton({ example, children, ...content }: ButtonProps) {
  const show = useShowToast();

  return (
    <button
      type="button"
      onClick={() => show(resolve(example, content))}
      className="pressable not-prose my-1 border border-foreground/10 px-3 py-1.5 font-mono text-xs text-foreground/70 transition-colors duration-150 ease-hover hover:bg-foreground/5 hover:text-foreground focus-visible:bg-foreground/8"
    >
      {children}
    </button>
  );
}
