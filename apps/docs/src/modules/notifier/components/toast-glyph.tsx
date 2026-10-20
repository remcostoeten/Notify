"use client";

import { type CSSProperties, type ReactNode, useEffect, useRef } from "react";
import { playIcon } from "@/shared/icons/icon-motion";
import type { MotionIcon } from "@/shared/icons/motion";

type Props = {
  name: MotionIcon;
  style?: CSSProperties;
  children: ReactNode;
};

const openDelay = 120;
const calmQuery = "(prefers-reduced-motion: reduce)";
const hoverQuery = "(hover: hover) and (pointer: fine)";

function bind(svg: SVGSVGElement, name: MotionIcon) {
  let seen = false;

  function play(delay: number) {
    if (!window.matchMedia(calmQuery).matches) playIcon(svg, name, delay);
  }

  function replay() {
    if (seen && window.matchMedia(hoverQuery).matches) play(0);
  }

  const observer = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    observer.disconnect();
    seen = true;
    play(openDelay);
  });
  const host = svg.closest(".ntf-toast") ?? svg;
  observer.observe(svg);
  host.addEventListener("pointerenter", replay);

  return () => {
    observer.disconnect();
    host.removeEventListener("pointerenter", replay);
  };
}

export function ToastGlyph({ name, style, children }: Props) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (ref.current) return bind(ref.current, name);
  }, [name]);

  return (
    <svg
      ref={ref}
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      overflow="visible"
      aria-hidden="true"
      data-icon={name}
      style={style}
    >
      {children}
    </svg>
  );
}
