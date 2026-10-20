import { highlight } from "fumadocs-core/highlight";
import type { ComponentProps } from "react";
import { CodeBlock } from "@/modules/docs/components/code-block";
import { highlightThemes } from "../highlight-options";

/**
 * @name highlightCode
 * @description Highlights a code string with the same Shiki themes and code
 * block as the MDX pages.
 *
 * @example
 * const node = await highlightCode("notify('Saved')", "tsx")
 */
export function highlightCode(code: string, lang: string) {
  return highlight(code, {
    lang,
    themes: highlightThemes,
    defaultColor: false,
    components: {
      pre: (props: ComponentProps<"pre">) => <CodeBlock {...props} data-language={lang} />,
    },
  });
}

/**
 * @name highlightInline
 * @description Highlights a single line of code as inline tokens, without the
 * surrounding code block.
 *
 * @example
 * const node = await highlightInline("npm install @remcostoeten/notifier", "bash")
 */
export function highlightInline(code: string, lang: string) {
  return highlight(code, {
    lang,
    themes: highlightThemes,
    defaultColor: false,
    components: {
      pre: ({ children }: ComponentProps<"pre">) => <>{children}</>,
      code: (props: ComponentProps<"code">) => <code {...props} className="shiki" />,
    },
  });
}
