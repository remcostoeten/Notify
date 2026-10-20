import Link from "next/link";
import { ThemeToggle } from "@/modules/theme/components/theme-toggle";
import { GitHubIcon } from "@/shared/components/github-icon";
import { site } from "@/shared/config/site";
import { SearchTrigger } from "./search-trigger";

const sections = [
  { href: "#gallery", label: "Gallery" },
  { href: "#playground", label: "Playground" },
  { href: "#compose", label: "Compose" },
  { href: "#style", label: "Style" },
  { href: "#api-reference", label: "API" },
];

const linkClass =
  "px-3 text-[13px] text-foreground/60 transition-colors duration-150 ease-hover hover:text-foreground focus-visible:text-foreground";

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-foreground/5 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-(--topbar-height) max-w-5xl items-center justify-between px-3">
        <Link href="/" className="flex items-center gap-2 px-3 py-1">
          <span aria-hidden className="block size-2.5 bg-foreground" />
          <span className="font-mono text-sm font-medium">notifier</span>
        </Link>
        <nav aria-label="Sections" className="hidden items-center md:flex">
          {sections.map((section) => (
            <a key={section.href} href={section.href} className={linkClass}>
              {section.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center">
          <Link href="/docs" className={linkClass}>
            Docs
          </Link>
          <a
            href={site.npm}
            target="_blank"
            rel="noreferrer noopener"
            className={`${linkClass} hidden sm:block`}
          >
            npm
          </a>
          <a
            href={site.repository}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="GitHub"
            className="inline-flex size-8 items-center justify-center text-foreground/40 pressable hover:bg-foreground/5 hover:text-foreground/70 focus-visible:bg-foreground/8 focus-visible:text-foreground"
          >
            <GitHubIcon className="size-4" />
          </a>
          <SearchTrigger />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
