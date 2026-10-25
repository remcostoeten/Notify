"use client";

import { Toast, type ToastInput } from "@remcostoeten/notifier";
import {
  AnimatePresence,
  animate,
  motion,
  type MotionValue,
  motionValue,
  type PanInfo,
  useIsPresent,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import {
  type PointerEvent,
  type ReactNode,
  type RefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { type Timeline, successHoldMs } from "@/modules/notifier/examples";
import { noop } from "@/shared/helpers/noop";

export type Phase = "lead" | "base" | "done" | "result";

export type StackEntry = {
  id: number;
  phase: Phase;
  pressed?: boolean;
  step?: number;
  progress?: number;
  height: MotionValue<number>;
};

type Hold = "hover" | "drag";

type PreviewStackProps = {
  input: ToastInput;
  timeline?: Timeline;
  stack: ReturnType<typeof usePreviewStack>;
};

const stack = {
  peek: 8,
  gap: 12,
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
  collapseDelayMs: 60,
  swipeThreshold: 100,
  swipeVelocity: 500,
  exitMs: 400,
  holdMs: 3200,
  restMs: 1400,
  visibleRatio: 0.6,
} as const;

const settle = { type: "tween", duration: 0.18, ease: [0.23, 1, 0.32, 1] } as const;
const resize = { ...settle, duration: 0.25 } as const;
const reveal = { ...settle, duration: 0.22 } as const;
const leave = { type: "spring", stiffness: 1218.5, damping: 69.8, mass: 1 } as const;

function pose(y: number, rotate: number, scale: number) {
  return `translateY(${y}px) rotate(${rotate}deg) scale(${scale})`;
}

function mix(from: number, to: number, amount: number) {
  return from + (to - from) * amount;
}

function reach(ahead: MotionValue<number>[]) {
  return ahead.reduce((total, value) => total + value.get() + stack.gap, 0);
}

function clip(bottom: number) {
  return `inset(-${stack.clipBleed}px -${stack.clipBleed}px ${bottom}px -${stack.clipBleed}px)`;
}

function useInView(ref: RefObject<HTMLElement | null>) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: stack.visibleRatio,
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);

  return inView;
}

function settled(entry: StackEntry, timeline: Timeline | undefined) {
  if (entry.pressed) return false;
  if (entry.phase === "done") return true;
  if (entry.phase !== "base") return false;
  return entry.progress === undefined || !timeline?.done;
}

export function usePreviewStack(timeline: Timeline | undefined, hasProgress: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const [entries, setEntries] = useState<StackEntry[]>([]);
  const [holds, setHolds] = useState<ReadonlySet<Hold>>(() => new Set());
  const nextId = useRef(0);
  const leaveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const stepTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const front: StackEntry | undefined = entries[0];
  const phase = front?.phase;
  const progress = front?.progress;
  const frontId = front?.id;
  const held = holds.size > 0;
  const expanded = holds.has("hover") && entries.length > 1;
  const ready = inView && !held && front !== undefined && settled(front, timeline);

  function patchFront(patch: (head: StackEntry) => StackEntry) {
    setEntries(([head, ...rest]) => (head ? [patch(head), ...rest] : rest));
  }

  function hold(reason: Hold, on: boolean) {
    setHolds((current) => {
      if (current.has(reason) === on) return current;
      const next = new Set(current);
      if (on) next.add(reason);
      else next.delete(reason);
      return next;
    });
  }

  function hover(on: boolean) {
    clearTimeout(leaveTimer.current);
    if (on) return hold("hover", true);
    leaveTimer.current = setTimeout(() => hold("hover", false), stack.collapseDelayMs);
  }

  function press(id: number) {
    setEntries((current) =>
      current.map((entry) => (entry.id === id ? { ...entry, pressed: true } : entry)),
    );
  }

  function dismiss(id: number) {
    setEntries((current) => current.filter((entry) => entry.id !== id));
  }

  function patchEntry(id: number, patch: Partial<StackEntry>) {
    setEntries((current) =>
      current.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)),
    );
  }

  function schedule(ms: number, run: () => void) {
    stepTimers.current.push(setTimeout(run, ms));
  }

  function advance(id: number) {
    const steps = timeline?.after ?? [];
    if (steps.length === 0) return dismiss(id);
    patchEntry(id, { phase: "result", step: 0 });
    let elapsed = 0;
    steps.forEach((step, index) => {
      elapsed += step.ms;
      if (index === steps.length - 1) schedule(elapsed, () => dismiss(id));
      else schedule(elapsed, () => patchEntry(id, { step: index + 1 }));
    });
  }

  function push() {
    const entry: StackEntry = {
      id: nextId.current,
      phase: timeline?.lead ? "lead" : "base",
      progress: hasProgress ? 0 : undefined,
      height: motionValue(0),
    };
    nextId.current += 1;
    setEntries((current) => [entry, ...current].slice(0, stack.maxVisible));
  }

  useEffect(
    () => () => {
      clearTimeout(leaveTimer.current);
      stepTimers.current.forEach(clearTimeout);
    },
    [],
  );

  useEffect(() => {
    if (!inView || entries.length > 0) return;
    const timer = setTimeout(push, nextId.current === 0 ? 300 : stack.restMs);
    return () => clearTimeout(timer);
  });

  useEffect(() => {
    if (!inView || phase !== "lead" || !timeline?.lead) return;
    const timer = setTimeout(
      () => patchFront((head) => ({ ...head, phase: "base" })),
      timeline.lead.ms,
    );
    return () => clearTimeout(timer);
  }, [inView, frontId, phase, timeline]);

  useEffect(() => {
    if (!inView || phase !== "base" || progress === undefined) return;
    if (progress >= 100) {
      if (!timeline?.done) return;
      const timer = setTimeout(
        () => patchFront((head) => ({ ...head, phase: "done" })),
        timeline.done.ms,
      );
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => {
      const step = 5 + Math.round(Math.random() * 10);
      patchFront((head) => ({ ...head, progress: Math.min(100, (head.progress ?? 0) + step) }));
    }, 450);
    return () => clearTimeout(timer);
  }, [inView, frontId, phase, progress, timeline]);

  useEffect(() => {
    if (!ready) return;
    const press = timeline?.press;
    const timer = setTimeout(
      () => {
        const button = press
          ? [
              ...(ref.current?.querySelectorAll<HTMLElement>(
                "[data-front] .ntf-action:not([inert] *)",
              ) ?? []),
            ].find((node) => node.textContent === press.label)
          : undefined;
        if (!button) return setEntries([]);
        button.click();
      },
      press ? press.afterMs : stack.holdMs,
    );
    return () => clearTimeout(timer);
  }, [ready, frontId, timeline]);

  useEffect(() => {
    if (held || entries.length < 2) return;
    const timer = setTimeout(
      () => setEntries((current) => current.slice(0, 1)),
      stack.collapseAfterMs,
    );
    return () => clearTimeout(timer);
  }, [held, entries.length, frontId]);

  return { ref, entries, expanded, push, hover, hold, press, advance, dismiss };
}

function resolveEntry(input: ToastInput, timeline: Timeline | undefined, entry: StackEntry) {
  if (entry.phase === "lead" && timeline?.lead) return timeline.lead.input;
  if (entry.phase === "done" && timeline?.done) return timeline.done.input;
  const step = timeline?.after?.[entry.step ?? 0];
  if (entry.phase === "result" && step) return step.input;
  return { ...input, progress: entry.progress ?? input.progress };
}

type Bindings = {
  onPress: () => void;
  onDismiss: () => void;
  onResolved: (label: ReactNode) => void;
};

function bindActions(input: ToastInput, { onPress, onDismiss, onResolved }: Bindings): ToastInput {
  if (!input.actions) return input;
  return {
    ...input,
    actions: input.actions.map((action) => {
      if (action.dismiss === false) return action;
      const run = action.onClick;
      return {
        ...action,
        onClick: (toast) => {
          const result = run?.(toast);
          if (!result) return onDismiss();
          onPress();
          result.then(() => setTimeout(() => onResolved(action.label), successHoldMs), noop);
          return result;
        },
      };
    }),
  };
}

type PreviewContentProps = {
  input: ToastInput;
  height: MotionValue<number>;
  reduce: boolean;
};

function PreviewContent({ input, height, reduce }: PreviewContentProps) {
  const ref = useRef<HTMLDivElement>(null);
  const present = useIsPresent();

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node || !present) return;
    let measured = 0;

    function measure(node: HTMLDivElement) {
      const next = node.offsetHeight;
      if (next === measured) return;
      measured = next;
      if (reduce || height.get() === 0) height.jump(next);
      else animate(height, next, resize);
    }

    measure(node);
    const observer = new ResizeObserver(() => measure(node));
    observer.observe(node);
    return () => observer.disconnect();
  }, [height, present, reduce]);

  return (
    <motion.div
      ref={ref}
      className="absolute inset-x-0 top-0"
      aria-hidden={present ? undefined : true}
      inert={!present}
      initial={{ opacity: reduce ? 1 : 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={reduce ? { duration: 0 } : resize}
    >
      <Toast
        {...input}
        style={{ ...input.style, width: "100%", background: "transparent", boxShadow: "none" }}
        className={`${input.className ?? ""} [&_.ntf-actions]:!transition-none [&_.ntf-actions]:!opacity-100 [&_.ntf-actions]:!transform-none`}
      />
    </motion.div>
  );
}

type PreviewCardProps = {
  input: ToastInput;
  phase: string;
  index: number;
  count: number;
  height: MotionValue<number>;
  ahead: MotionValue<number>[];
  frontHeight: MotionValue<number>;
  spread: MotionValue<number>;
  expanded: boolean;
  reduce: boolean;
  onDrag: (on: boolean) => void;
  onDismiss: () => void;
};

function PreviewCard({
  input,
  phase,
  index,
  count,
  height,
  ahead,
  frontHeight,
  spread,
  expanded,
  reduce,
  onDrag,
  onDismiss,
}: PreviewCardProps) {
  const depth = useMotionValue(index);
  const shift = useMotionValue(0);
  const lift = useRef<number | null>(null);
  const transform = useTransform(() => {
    const level = depth.get();
    const open = spread.get();
    const scale = Math.max(1 - level * stack.scaleStep, 0);
    const collapsed = level * stack.peek + (1 - scale) * frontHeight.get();
    const offset = mix(collapsed, reach(ahead) + shift.get(), open);
    const tilt = reduce ? 0 : Math.min(level * stack.tiltStep, stack.tiltMax) * (1 - open);
    return pose(-offset, tilt, mix(scale, 1, open));
  });
  const visibleHeight = useTransform(() =>
    index === 0 ? height.get() : mix(frontHeight.get(), height.get(), spread.get()),
  );
  const x = useMotionValue(0);
  const swipeOpacity = useTransform(x, [-stack.swipeThreshold, 0, stack.swipeThreshold], [0, 1, 0]);
  const faded = Math.max(index - stack.solidDepth, 0);

  useLayoutEffect(() => {
    const next = reach(ahead);
    const moved = lift.current === null ? 0 : lift.current - next;
    lift.current = next;
    if (moved !== 0 && !reduce) shift.jump(shift.get() + moved);
    if (shift.get() === 0) return;
    const animation = animate(shift, 0, reveal);
    return () => animation.stop();
  });

  useLayoutEffect(() => {
    if (index !== 0) return;
    frontHeight.set(height.get());
    const unsubscribe = height.on("change", (value) => frontHeight.set(value));
    return () => unsubscribe();
  }, [frontHeight, height, index]);

  useLayoutEffect(() => {
    if (reduce) return depth.jump(index);
    const animation = animate(depth, index, settle);
    return () => animation.stop();
  }, [depth, index, reduce]);

  useEffect(() => () => height.stop(), [height]);

  function release(_: unknown, info: PanInfo) {
    onDrag(false);
    const { offset, velocity } = info;
    if (
      offset.x > stack.swipeThreshold / 2 ||
      velocity.x > stack.swipeVelocity ||
      Math.abs(offset.x) > stack.swipeThreshold
    ) {
      onDismiss();
    }
  }

  return (
    <motion.div
      className="absolute right-0 bottom-0 left-0 flex origin-bottom-right justify-end"
      style={{ zIndex: count - index, transform }}
    >
      {expanded ? (
        <div
          aria-hidden
          className="absolute inset-x-0"
          style={{ top: -stack.gap, height: stack.gap }}
        />
      ) : null}
      <motion.div
        className="max-w-full"
        style={{ x, opacity: swipeOpacity }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.5}
        whileDrag={reduce ? undefined : { scale: 0.985 }}
        onDragStart={() => onDrag(true)}
        onDragEnd={release}
      >
        <motion.div
          className="max-w-full origin-bottom-right"
          data-front={index === 0 ? "" : undefined}
          style={{ height: visibleHeight }}
          initial={{
            opacity: reduce ? 1 : 0,
            transform: reduce ? pose(0, 0, 1) : pose(stack.enterTravel, 0, stack.enterScale),
            filter: "brightness(1)",
            clipPath: clip(-stack.clipBleed),
          }}
          animate={{
            opacity: expanded ? 1 : Math.max(1 - faded * stack.opacityStep, 0),
            transform: pose(0, 0, 1),
            filter: `brightness(${expanded ? 1 : Math.max(1 - index * stack.shadeStep, 0)})`,
            clipPath: clip(index > 0 && !expanded ? 0 : -stack.clipBleed),
          }}
          exit={{
            opacity: 0,
            transform: reduce ? pose(0, 0, 1) : pose(stack.exitTravel, 0, stack.exitScale),
            transition: reduce ? { duration: 0 } : leave,
          }}
          transition={reduce ? { duration: 0 } : expanded ? reveal : settle}
        >
          <motion.div className="max-w-full" style={{ height }}>
            <Toast
              {...input}
              style={{
                ...input.style,
                height: "100%",
                padding: 0,
                display: "block",
                overflow: "hidden",
              }}
            >
              {reduce ? (
                <PreviewContent key={phase} input={input} height={height} reduce />
              ) : (
                <AnimatePresence initial={false}>
                  <PreviewContent key={phase} input={input} height={height} reduce={false} />
                </AnimatePresence>
              )}
            </Toast>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export function PreviewStack({ input, timeline, stack: preview }: PreviewStackProps) {
  const reduce = Boolean(useReducedMotion());
  const frontHeight = useMotionValue(0);
  const spread = useMotionValue(0);
  const { ref, entries, expanded } = preview;

  useLayoutEffect(() => {
    const target = expanded ? 1 : 0;
    if (reduce) return spread.jump(target);
    const animation = animate(spread, target, expanded ? reveal : settle);
    return () => animation.stop();
  }, [expanded, reduce, spread]);

  function enter(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "touch") preview.hover(true);
  }

  return (
    <div
      ref={ref}
      className="relative w-full"
      onPointerEnter={enter}
      onPointerLeave={() => preview.hover(false)}
    >
      <AnimatePresence initial={false}>
        {entries.map((entry, index) => (
          <PreviewCard
            key={entry.id}
            input={bindActions(resolveEntry(input, timeline, entry), {
              onPress: () => preview.press(entry.id),
              onDismiss: () => preview.dismiss(entry.id),
              onResolved: (label) =>
                label === timeline?.press?.label
                  ? preview.advance(entry.id)
                  : preview.dismiss(entry.id),
            })}
            phase={entry.phase === "result" ? `result-${entry.step ?? 0}` : entry.phase}
            index={index}
            count={entries.length}
            height={entry.height}
            ahead={entries.slice(0, index).map((ahead) => ahead.height)}
            frontHeight={frontHeight}
            spread={spread}
            expanded={expanded}
            reduce={reduce}
            onDrag={(on) => preview.hold("drag", on)}
            onDismiss={() => preview.dismiss(entry.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
