"use client";

import { notify, Toast } from "@remcostoeten/notifier";
import type { ToastHandle, ToastInput } from "@remcostoeten/notifier";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import {
  type ExampleName,
  type Step,
  type Timeline,
  examples,
  stepPatch,
  successHoldMs,
  timelines,
} from "../examples";

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
  | "animateNumbers"
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
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
    },
    [],
  );

  function later(ms: number, run: () => void) {
    timers.current.push(setTimeout(run, ms));
  }

  function countUp(id: string, timeline: Timeline | undefined, finished: ToastInput | undefined) {
    let value = 0;
    function tick() {
      value = Math.min(100, value + 5 + Math.round(Math.random() * 10));
      notify.update(id, { ...timeline?.derive?.(value), progress: value });
      if (value < 100) return later(450, tick);
      const done = timeline?.done;
      if (done && finished) later(done.ms, () => notify.update(id, finished));
    }
    later(450, tick);
  }

  function play(toast: ToastHandle, steps: Step[], index: number) {
    const step = steps[index];
    if (!step) return;
    const rest = steps.slice(index).reduce((total, next) => total + next.ms, 0);
    const last = index === steps.length - 1;
    toast.update({ ...stepPatch(step), duration: last ? step.ms : rest + successHoldMs });
    if (!last) later(step.ms, () => play(toast, steps, index + 1));
  }

  function chain(input: ToastInput, timeline: Timeline | undefined): ToastInput {
    const { press, after } = timeline ?? {};
    if (!press || !after?.length || !input.actions) return input;
    const total = after.reduce((sum, step) => sum + step.ms, 0);
    return {
      ...input,
      actions: input.actions.map((action) => {
        const run = action.onClick;
        if (action.label !== press.label || !run) return action;
        return {
          ...action,
          dismiss: false,
          onClick: async (toast: ToastHandle) => {
            toast.update({ duration: press.requestMs + successHoldMs + total + successHoldMs });
            await run(toast);
            later(successHoldMs, () => play(toast, after, 0));
          },
        };
      }),
    };
  }

  return function show(source: ToastInput, timeline?: Timeline) {
    const input = chain(source, timeline);
    const done = timeline?.done ? chain(timeline.done.input, timeline) : undefined;
    const hasProgress = typeof input.progress === "number";
    const opening = timeline?.lead ? timeline.lead.input : input;
    const started = { ...input, ...timeline?.derive?.(0), progress: 0 };
    const id = notify(hasProgress && !timeline?.lead ? started : opening);
    if (timeline?.lead) {
      later(timeline.lead.ms, () => {
        notify.update(id, hasProgress ? started : input);
        if (hasProgress) countUp(id, timeline, done);
      });
    } else if (hasProgress) {
      countUp(id, timeline, done);
    }
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
            onClick={() => show(input, example ? timelines[example] : undefined)}
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
      onClick={() => show(resolve(example, content), example ? timelines[example] : undefined)}
      className="pressable not-prose my-1 border border-foreground/10 px-3 py-1.5 font-mono text-xs text-foreground/70 transition-colors duration-150 ease-hover hover:bg-foreground/5 hover:text-foreground focus-visible:bg-foreground/8"
    >
      {children}
    </button>
  );
}
