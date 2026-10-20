import Link from "next/link";
import { site } from "@/shared/config/site";

const linkClass =
  "text-xs text-foreground/60 transition-colors duration-150 ease-hover hover:text-foreground focus-visible:text-foreground";

export function LandingFooter() {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-4 px-6 py-8">
      <span className="font-mono text-xs text-foreground/45">MIT License</span>
      <div className="flex items-center gap-5">
        <Link href="/docs" className={linkClass}>
          Docs
        </Link>
        <a href={site.repository} target="_blank" rel="noreferrer noopener" className={linkClass}>
          GitHub
        </a>
        <a href={site.npm} target="_blank" rel="noreferrer noopener" className={linkClass}>
          npm
        </a>
      </div>
    </footer>
  );
}
