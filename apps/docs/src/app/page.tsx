import type { Metadata } from "next";
import { ApiOverview } from "@/modules/landing/components/api-overview";
import { Gallery } from "@/modules/landing/components/gallery";
import { Hero } from "@/modules/landing/components/hero";
import { LandingFooter } from "@/modules/landing/components/landing-footer";
import { LandingHeader } from "@/modules/landing/components/landing-header";
import { Playground } from "@/modules/landing/components/playground";
import { Section } from "@/modules/landing/components/section";
import { ShowToastButton } from "@/modules/landing/components/show-toast-button";
import { Snippet } from "@/modules/landing/components/snippet";
import { snippets } from "@/modules/landing/snippets";
import { site } from "@/shared/config/site";

export const metadata: Metadata = {
  title: { absolute: "Notifier: composable toasts for React" },
  description: site.description,
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <div data-landing="" className="min-h-screen bg-background text-foreground">
      <LandingHeader />
      <main className="mx-auto max-w-5xl border-x border-foreground/5">
        <Hero />

        <Section id="gallery" label="Gallery">
          <Gallery />
        </Section>

        <Section id="playground" label="Playground">
          <Playground />
        </Section>

        <Section id="compose" label="Compose">
          <Snippet
            title="Content from an object"
            code={snippets.content}
            docs={{ href: "/docs/concepts/anatomy", label: "Anatomy" }}
          />
          <Snippet
            title="Avatar, meta and buttons"
            code={snippets.avatar}
            docs={{ href: "/docs/components/avatar", label: "Avatar" }}
          />
          <Snippet
            title="Progress that you update"
            code={snippets.progress}
            docs={{ href: "/docs/guides/progress", label: "Progress guide" }}
          />
          <Snippet
            title="Promise"
            code={snippets.promise}
            docs={{ href: "/docs/guides/promises", label: "Promises guide" }}
          />
          <Snippet
            title="Primitives"
            code={snippets.compose}
            docs={{ href: "/docs/guides/custom-toasts", label: "Custom toasts" }}
          />
        </Section>

        <Section id="style" label="Style">
          <Snippet
            title="Theme prop"
            code={snippets.theme}
            docs={{ href: "/docs/guides/theming", label: "Theming guide" }}
          />
          <Snippet
            title="Or plain CSS"
            code={snippets.css}
            docs={{ href: "/docs/reference/tokens", label: "Token reference" }}
            lang="css"
          />
          <Snippet
            title="Class names per slot"
            code={snippets.slots}
            docs={{ href: "/docs/guides/styling", label: "Styling guide" }}
          />
        </Section>

        <Section id="setup" label="Setup">
          <div className="space-y-4 p-6 pb-1">
            <p className="max-w-3xl text-sm text-foreground/65">
              Mount <code className="font-mono text-[13px] text-foreground">{"<Notifier />"}</code>{" "}
              once in your root layout, then call{" "}
              <code className="font-mono text-[13px] text-foreground">notify</code> from anywhere.
              The toast stylesheet is included, and the font is whatever Inter or system font your
              page already loads.
            </p>
          </div>
          <Snippet
            title="app/layout.tsx"
            code={snippets.setup}
            docs={{ href: "/docs/installation", label: "Installation" }}
          />
          <div className="p-6">
            <ShowToastButton message="Notifier is mounted" size="sm">
              Try it
            </ShowToastButton>
          </div>
        </Section>

        <Section id="api-reference" label="API reference">
          <ApiOverview />
        </Section>

        <LandingFooter />
      </main>
    </div>
  );
}
