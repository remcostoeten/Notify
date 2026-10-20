import { highlightCode } from "../server/highlight-code";
import { DocsLink } from "./docs-link";

type Props = {
  title: string;
  code: string;
  lang?: string;
  docs?: { href: string; label: string };
};

export async function Snippet({ title, code, lang = "tsx", docs }: Props) {
  return (
    <div className="border-b border-foreground/5 px-6 pt-4 pb-1">
      <div className="flex items-baseline justify-between gap-4">
        <span className="font-mono text-xs text-foreground/45">{title}</span>
        {docs ? <DocsLink href={docs.href}>{docs.label}</DocsLink> : null}
      </div>
      {await highlightCode(code, lang)}
    </div>
  );
}
