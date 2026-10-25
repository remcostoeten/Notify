import type { ReactNode } from "react";
import { cn } from "@/shared/helpers/cn";

type Props = {
  children: ReactNode;
  scene?: ReactNode;
  className?: string;
};

export function Stage({ children, scene, className }: Props) {
  return (
    <div
      className={cn(
        "relative h-75 overflow-hidden rounded-2xl border border-foreground/8 bg-foreground/4 md:h-90",
        className,
      )}
    >
      {scene ? (
        <div aria-hidden="true" className="absolute inset-0 bg-background select-none">
          {scene}
        </div>
      ) : (
        <div className="absolute inset-0 right-6 bottom-6 rounded-br-[36px] border-r border-b border-foreground/10 bg-background md:right-11 md:bottom-11" />
      )}
      <div
        className={cn(
          "absolute flex justify-end",
          scene
            ? "right-4 bottom-4 left-4 md:right-6 md:bottom-6"
            : "right-9 bottom-9 left-4 md:right-15.5 md:bottom-15.5",
        )}
      >
        {children}
      </div>
    </div>
  );
}
