import { highlightInline } from "../server/highlight-code";
import { snippets } from "../snippets";
import { InstallCommand } from "./install-command";
import { ShowToastButton } from "./show-toast-button";

export async function Hero() {
  return (
    <section className="border-b border-foreground/5 px-6 py-20 md:py-28">
      <h1 className="max-w-2xl text-4xl leading-[1.1] font-semibold tracking-tight md:text-6xl">
        Toasts, composed.
      </h1>
      <p className="mt-5 max-w-xl text-base leading-relaxed text-foreground/65">
        A toast is a surface with slots: an icon or avatar, a title with meta, a description,
        progress and actions. Fill the slots from one object, or build the layout yourself from the
        same primitives.
      </p>
      <div className="mt-10 flex flex-wrap items-center gap-3">
        <ShowToastButton example="profile">Show a toast</ShowToastButton>
        <InstallCommand command={snippets.install}>
          {await highlightInline(snippets.install, "bash")}
        </InstallCommand>
      </div>
    </section>
  );
}
