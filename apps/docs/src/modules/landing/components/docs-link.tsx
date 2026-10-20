import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  href: string;
  children: ReactNode;
};

export function DocsLink({ href, children }: Props) {
  return (
    <Link
      href={href}
      className="shrink-0 text-xs text-foreground/45 underline decoration-foreground/15 underline-offset-4 transition-colors duration-150 ease-hover hover:text-foreground hover:decoration-foreground/40 focus-visible:text-foreground"
    >
      {children}
    </Link>
  );
}
