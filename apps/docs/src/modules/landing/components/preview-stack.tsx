"use client";

import { Toast, type ToastInput } from "@remcostoeten/notifier";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

export type StackEntry = {
  id: number;
  progress?: number;
};

type PreviewStackProps = {
  input: ToastInput;
  entries: StackEntry[];
};

const stack = {
  peek: 8,
  scaleStep: 0.05,
  tiltStep: 1.1,
  tiltMax: 3,
  shadeStep: 0.04,
  solidDepth: 2,
  opacityStep: 0.35,
  clipBleed: 48,
  enterTravel: 48,
  enterScale: 0.85,
  exitTravel: 24,
  exitScale: 0.8,
  maxVisible: 3,
  collapseAfterMs: 4000,
} as const;

const settle = { type: "tween", duration: 0.18, ease: [0.23, 1, 0.32, 1] } as const;
const leave = { type: "spring", stiffness: 1218.5, damping: 69.8, mass: 1 } as const;

function pose(y: number, rotate: number, scale: number) {
  return `translateY(${y}px) rotate(${rotate}deg) scale(${scale})`;
}

function clip(bottom: number) {
  return `inset(-${stack.clipBleed}px -${stack.clipBleed}px ${bottom}px -${stack.clipBleed}px)`;
}

export function usePreviewStack(countsProgress: boolean) {
  const [entries, setEntries] = useState<StackEntry[]>([{ id: 0 }]);
  const nextId = useRef(1);
  const front = entries[0];

  useEffect(() => {
    if (front.progress === undefined || front.progress >= 100) return;
    const timer = setTimeout(() => {
      const step = 5 + Math.round(Math.random() * 10);
      setEntries(([head, ...rest]) => [
        { ...head, progress: Math.min(100, (head.progress ?? 0) + step) },
        ...rest,
      ]);
    }, 450);
    return () => clearTimeout(timer);
  }, [front.id, front.progress]);

  useEffect(() => {
    if (entries.length < 2) return;
    const timer = setTimeout(
      () => setEntries((current) => current.slice(0, 1)),
      stack.collapseAfterMs,
    );
    return () => clearTimeout(timer);
  }, [entries.length, front.id]);

  function push() {
    const entry: StackEntry = { id: nextId.current, progress: countsProgress ? 0 : undefined };
    nextId.current += 1;
    setEntries((current) => [entry, ...current].slice(0, stack.maxVisible));
  }

  return { entries, push };
}

export function PreviewStack({ input, entries }: PreviewStackProps) {
  const reduce = useReducedMotion();
  const frontRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const frontId = entries[0].id;

  useEffect(() => {
    const node = frontRef.current;
    if (!node) return;
    const observer = new ResizeObserver(() => setHeight(node.offsetHeight));
    observer.observe(node);
    return () => observer.disconnect();
  }, [frontId]);

  return (
    <div className="relative w-full">
      <AnimatePresence initial={false}>
        {entries.map((entry, index) => {
          const scale = Math.max(1 - index * stack.scaleStep, 0);
          const faded = Math.max(index - stack.solidDepth, 0);
          const offset = index * stack.peek + (1 - scale) * height;
          const tilt = reduce ? 0 : Math.min(index * stack.tiltStep, stack.tiltMax);
          const clamped = index > 0 && height > 0;

          return (
            <motion.div
              key={entry.id}
              className="absolute right-0 bottom-0 left-0 flex origin-bottom-right justify-end"
              style={{ zIndex: entries.length - index }}
              initial={{
                opacity: 0,
                transform: reduce ? pose(0, 0, 1) : pose(stack.enterTravel, 0, stack.enterScale),
                filter: "brightness(1)",
                clipPath: clip(-stack.clipBleed),
              }}
              animate={{
                opacity: Math.max(1 - faded * stack.opacityStep, 0),
                transform: pose(-offset, tilt, scale),
                filter: `brightness(${Math.max(1 - index * stack.shadeStep, 0)})`,
                height: clamped ? height : "auto",
                clipPath: clip(clamped ? 0 : -stack.clipBleed),
              }}
              exit={{
                opacity: 0,
                transform: reduce ? pose(0, 0, 1) : pose(stack.exitTravel, 0, stack.exitScale),
                transition: leave,
              }}
              transition={settle}
            >
              <div ref={index === 0 ? frontRef : undefined}>
                <Toast {...input} progress={entry.progress ?? input.progress} />
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
