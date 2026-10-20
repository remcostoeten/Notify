"use client";

import { useShiki } from "fumadocs-core/highlight/client";
import { Suspense, useDeferredValue } from "react";
import { CodeBlock } from "@/modules/docs/components/code-block";
import { highlightThemes } from "../highlight-options";

type Props = {
  code: string;
  lang?: string;
};

function Highlighted({ code, lang }: Required<Props>) {
  return useShiki(code, {
    lang,
    themes: highlightThemes,
    defaultColor: false,
    components: {
      pre: (props) => <CodeBlock {...props} data-language={lang} />,
    },
  });
}

export function LiveCode({ code, lang = "tsx" }: Props) {
  const deferred = useDeferredValue(code);

  return (
    <Suspense
      fallback={
        <CodeBlock data-language={lang}>
          <code>{code}</code>
        </CodeBlock>
      }
    >
      <Highlighted code={deferred} lang={lang} />
    </Suspense>
  );
}
