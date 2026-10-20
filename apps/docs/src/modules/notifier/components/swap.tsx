"use client";

import type { ToastStatus } from "@remcostoeten/notifier";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { CSSProperties } from "react";

const ease = [0.23, 1, 0.32, 1] as const;
const pop = { type: "spring", duration: 0.45, bounce: 0.3 } as const;
const fade = { duration: 0.2, ease } as const;
const leave = { duration: 0.12, ease } as const;

const frame = {
  position: "relative",
  display: "inline-block",
  verticalAlign: "top",
} satisfies CSSProperties;

const unseen = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clipPath: "inset(50%)",
  whiteSpace: "nowrap",
} satisfies CSSProperties;

const marks = {
  success: ["m5.5 12.5 4.5 4.5 8.5-9"],
  error: ["M6.5 6.5l11 11", "M17.5 6.5l-11 11"],
  warning: [
    "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",
    "M12 9v4",
    "M12 17h.01",
  ],
  info: ["M12 7h.01", "M12 10.5v6.5"],
  loading: ["M21 12a9 9 0 1 1-6.219-8.56"],
} satisfies Record<ToastStatus, string[]>;

type Word = {
  text: string;
  start: number;
};

type TextProps = {
  children: string;
};

type IconProps = {
  status: ToastStatus;
};

function split(text: string) {
  let start = 0;
  return text.split(" ").map((word): Word => {
    const entry = { text: word, start };
    start += word.length + 1;
    return entry;
  });
}

export function SwapText({ children }: TextProps) {
  const reduce = useReducedMotion();
  const gap = reduce ? 0 : Math.min(0.016, 0.16 / children.length);

  return (
    <span style={frame}>
      <span style={unseen}>{children}</span>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={children}
          aria-hidden="true"
          style={{ display: "inline-block" }}
          initial={false}
          animate={{ opacity: 1, transform: "translateY(0%)", filter: "blur(0px)" }}
          exit={{
            opacity: 0,
            transform: reduce ? "translateY(0%)" : "translateY(-25%)",
            filter: reduce ? "blur(0px)" : "blur(2px)",
            transition: leave,
          }}
        >
          {split(children).map((word, index) => (
            <span key={index}>
              {index > 0 ? " " : null}
              <span style={{ display: "inline-block", whiteSpace: "nowrap" }}>
                {Array.from(word.text).map((letter, offset) => (
                  <motion.span
                    key={offset}
                    style={{ display: "inline-block" }}
                    initial={
                      reduce
                        ? { opacity: 0 }
                        : { opacity: 0, transform: "translateY(35%)", filter: "blur(2px)" }
                    }
                    animate={{
                      opacity: 1,
                      transform: "translateY(0%)",
                      filter: "blur(0px)",
                      transition: { duration: 0.3, ease, delay: (word.start + offset) * gap },
                    }}
                  >
                    {letter}
                  </motion.span>
                ))}
              </span>
            </span>
          ))}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function SwapIcon({ status }: IconProps) {
  const reduce = useReducedMotion();

  return (
    <span style={frame}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={status}
          style={{ display: "flex" }}
          initial={{
            opacity: 0,
            transform: reduce ? "scale(1)" : "scale(0.6)",
            filter: reduce ? "blur(0px)" : "blur(4px)",
          }}
          animate={{
            opacity: 1,
            transform: "scale(1)",
            filter: "blur(0px)",
            transition: { default: pop, opacity: fade, filter: fade },
          }}
          exit={{
            opacity: 0,
            transform: reduce ? "scale(1)" : "scale(0.6)",
            filter: reduce ? "blur(0px)" : "blur(4px)",
            transition: leave,
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className={status === "loading" ? "swap-spin" : undefined}
          >
            {marks[status].map((path, index) => (
              <motion.path
                key={path}
                d={path}
                initial={reduce ? false : { pathLength: 0, opacity: 0 }}
                animate={{
                  pathLength: 1,
                  opacity: 1,
                  transition: {
                    pathLength: { duration: 0.32, ease, delay: 0.06 + index * 0.1 },
                    opacity: { duration: 0.05, delay: 0.06 + index * 0.1 },
                  },
                }}
              />
            ))}
          </svg>
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
