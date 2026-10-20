"use client";

import type { ToastInput } from "@remcostoeten/notifier";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { type ReactNode, useId, useState } from "react";
import { type ExampleName, examples } from "@/modules/notifier/examples";
import { exampleSnippets } from "../snippets";
import { LiveCode } from "./live-code";
import { PreviewStack, usePreviewStack } from "./preview-stack";
import { BillingScene, BoardScene, CalendarScene, FilesScene } from "./scenes";
import { Stage } from "./stage";

type Item = {
  name: ExampleName;
  label: string;
  scene: ReactNode;
  countsProgress?: boolean;
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
    countsProgress: true,
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

function GalleryItem({ name, label, scene, countsProgress = false }: Item) {
  const { entries, push } = usePreviewStack(countsProgress);
  const input: ToastInput = examples[name];
  const [codeOpen, setCodeOpen] = useState(false);
  const codeId = useId();
  const reduce = useReducedMotion();
  const closedHeight = reduce ? "auto" : 0;

  return (
    <div>
      <div className="flex flex-col gap-3">
        <Stage scene={scene}>
          <PreviewStack input={input} entries={entries} />
        </Stage>
        <div className="flex items-center justify-between gap-4 px-1">
          <span className="text-[13px] text-foreground/65">{label}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-expanded={codeOpen}
              aria-controls={codeId}
              onClick={() => setCodeOpen((open) => !open)}
              className={buttonClassName}
            >
              Code
            </button>
            <button type="button" onClick={push} className={buttonClassName}>
              Show
            </button>
          </div>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {codeOpen ? (
          <motion.div
            key="code"
            id={codeId}
            initial={{ height: closedHeight, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{
              height: closedHeight,
              opacity: 0,
              transition: { type: "spring", duration: 0.2, bounce: 0 },
            }}
            transition={{ type: "spring", duration: 0.3, bounce: 0 }}
            className="overflow-hidden"
          >
            <LiveCode code={exampleSnippets[name]} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function Gallery() {
  return (
    <div data-site-tone="" className="grid grid-cols-1 gap-x-4 gap-y-8 p-6 md:grid-cols-2">
      {items.map((item) => (
        <GalleryItem key={item.name} {...item} />
      ))}
    </div>
  );
}
