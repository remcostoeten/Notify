"use client";

import type { ToastInput } from "@remcostoeten/notifier";
import { AnimatePresence, motion } from "motion/react";
import { type CSSProperties, type ReactNode, useEffect, useId, useRef, useState } from "react";
import { type ExampleName, examples, timelines } from "@/modules/notifier/examples";
import { exampleSnippets } from "../snippets";
import { LiveCode } from "./live-code";
import { PreviewStack, usePreviewStack } from "./preview-stack";
import { BillingScene, BoardScene, CalendarScene, FilesScene } from "./scenes";
import { Stage } from "./stage";

type Item = {
  name: ExampleName;
  label: string;
  scene: ReactNode;
};

const items: Item[] = [
  {
    name: "profile",
    label: "Status with actions",
    scene: <CalendarScene />,
  },
  {
    name: "upload",
    label: "Progress",
    scene: <FilesScene />,
  },
  {
    name: "message",
    label: "Avatar and buttons",
    scene: <BoardScene />,
  },
  {
    name: "update",
    label: "Icon box and buttons",
    scene: <BillingScene />,
  },
];

const buttonClassName =
  "pressable rounded-md border border-foreground/10 px-3 py-1.5 font-mono text-xs text-foreground/65 hover:border-foreground/20 hover:text-foreground aria-expanded:border-foreground/20 aria-expanded:bg-foreground/5 aria-expanded:text-foreground";

type ItemProps = Item & {
  index: number;
  codeId: string;
  codeOpen: boolean;
  onToggleCode: () => void;
};

function GalleryItem({ name, label, scene, index, codeId, codeOpen, onToggleCode }: ItemProps) {
  const input: ToastInput = examples[name];
  const timeline = timelines[name];
  const stack = usePreviewStack(timeline, typeof input.progress === "number");
  const placement = {
    "--item-row": Math.floor(index / 2) * 2 + 1,
    "--item-col": (index % 2) + 1,
    "--item-order": index * 2,
  } as CSSProperties;

  return (
    <div
      style={placement}
      className="order-(--item-order) pb-8 md:order-none md:col-(--item-col) md:row-(--item-row)"
    >
      <div className="flex flex-col gap-3">
        <Stage scene={scene}>
          <PreviewStack input={input} timeline={timeline} stack={stack} />
        </Stage>
        <div className="flex items-center justify-between gap-4 px-1">
          <span className="text-[13px] text-foreground/65">{label}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-expanded={codeOpen}
              aria-controls={codeId}
              onClick={onToggleCode}
              className={buttonClassName}
            >
              Code
            </button>
            <button type="button" onClick={stack.push} className={buttonClassName}>
              Replay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

type PanelProps = {
  id: string;
  row: number;
  order: number;
  name: ExampleName | null;
};

function CodePanel({ id, row, order, name }: PanelProps) {
  const [height, setHeight] = useState(0);
  const content = useRef<HTMLDivElement>(null);
  const placement = { "--code-row": row, "--code-order": order } as CSSProperties;

  useEffect(() => {
    const node = content.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => setHeight(entry.contentRect.height));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      id={id}
      initial={false}
      animate={{ height: name ? height : 0 }}
      transition={
        name
          ? { type: "spring", duration: 0.4, bounce: 0 }
          : { type: "spring", duration: 0.22, bounce: 0 }
      }
      style={placement}
      className="order-(--code-order) overflow-hidden md:order-none md:col-[1/-1] md:row-(--code-row)"
    >
      <div ref={content} className="relative">
        <AnimatePresence mode="popLayout" initial={false}>
          {name ? (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { duration: 0.26, ease: [0.23, 1, 0.32, 1] },
              }}
              exit={{ opacity: 0, transition: { duration: 0.12, ease: "easeOut" } }}
              className="[&_.code-block]:mt-0 [&_.code-block]:mb-8"
            >
              <LiveCode code={exampleSnippets[name]} />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function Gallery() {
  const [openCode, setOpenCode] = useState<ExampleName | null>(null);
  const baseId = useId();
  const pairs = Array.from({ length: Math.ceil(items.length / 2) }, (_, pair) => pair);

  return (
    <div data-site-tone="" className="grid grid-cols-1 gap-x-4 px-6 pt-6 pb-0 md:grid-cols-2">
      {items.map((item, index) => (
        <GalleryItem
          key={item.name}
          index={index}
          codeId={`${baseId}-${Math.floor(index / 2)}`}
          codeOpen={openCode === item.name}
          onToggleCode={() => setOpenCode((open) => (open === item.name ? null : item.name))}
          {...item}
        />
      ))}
      {pairs.map((pair) => {
        const openIndex = items.findIndex(
          (item, index) => Math.floor(index / 2) === pair && item.name === openCode,
        );
        const name = openIndex === -1 ? null : items[openIndex].name;
        return (
          <CodePanel
            key={pair}
            id={`${baseId}-${pair}`}
            row={pair * 2 + 2}
            order={Math.max(openIndex, pair * 2) * 2 + 1}
            name={name}
          />
        );
      })}
    </div>
  );
}
