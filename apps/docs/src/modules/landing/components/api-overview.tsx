import Link from "next/link";

type Entry = {
  name: string;
  description: string;
  href: string;
};

const references: Entry[] = [
  {
    name: "<Notifier /> props",
    description: "Position, tone, duration, stack, offset, theme and the other mount options",
    href: "/docs/reference/notifier",
  },
  {
    name: "notify(input) and <Toast /> props",
    description: "Every slot, behavior option and lifecycle callback",
    href: "/docs/reference/toast-input",
  },
  {
    name: "Theme tokens",
    description: "Each token with its light and dark default, as a CSS variable per tone",
    href: "/docs/reference/tokens",
  },
  {
    name: "Types",
    description: "The exported TypeScript types",
    href: "/docs/reference/types",
  },
];

const methods: Entry[] = [
  {
    name: "notify(title | input)",
    description: "Open a toast, returns its id",
    href: "/docs/reference/notify",
  },
  {
    name: "notify.success | error | warning | info | loading(title, input?)",
    description: "Shortcuts that set status",
    href: "/docs/reference/notify",
  },
  {
    name: "notify.update(id, patch)",
    description: "Merge a patch into an open toast",
    href: "/docs/reference/notify",
  },
  {
    name: "notify.dismiss(id?)",
    description: "Close one toast, or all of them",
    href: "/docs/reference/notify",
  },
  {
    name: "notify.promise(promise, { loading, success, error })",
    description: "Loading toast that turns into success or error",
    href: "/docs/guides/promises",
  },
  {
    name: "notify.custom(render, options?)",
    description: "Render your own content with the Toast primitives",
    href: "/docs/guides/custom-toasts",
  },
];

const primitives: Entry[] = [
  {
    name: "Toast",
    description: "Surface. Takes content props, or children for a custom layout",
    href: "/docs/components/toast",
  },
  { name: "Toast.Icon", description: "shape, status, node", href: "/docs/components/icon" },
  {
    name: "Toast.Avatar",
    description: "src, alt, fallback, badge, shape",
    href: "/docs/components/avatar",
  },
  {
    name: "Toast.Body",
    description: "Column that holds the text, progress and actions",
    href: "/docs/components/title",
  },
  {
    name: "Toast.Title",
    description: "meta adds a divider and muted text",
    href: "/docs/components/title",
  },
  {
    name: "Toast.Description",
    description: "Muted body text",
    href: "/docs/components/description",
  },
  {
    name: "Toast.Progress",
    description: "value (null is indeterminate), label",
    href: "/docs/components/progress",
  },
  {
    name: "Toast.Actions",
    description: "Row of actions, aside adds trailing content",
    href: "/docs/components/actions",
  },
  {
    name: "Toast.Action",
    description: "variant, color, onClick, dismiss, href",
    href: "/docs/components/actions",
  },
  { name: "Toast.Close", description: "Close button", href: "/docs/components/close" },
];

type GroupProps = {
  title: string;
  entries: Entry[];
  last?: boolean;
};

function Group({ title, entries, last }: GroupProps) {
  return (
    <div className={last ? undefined : "border-b border-foreground/5"}>
      <h3 className="border-b border-foreground/5 px-6 py-3 font-mono text-xs">{title}</h3>
      {entries.map((entry) => (
        <Link
          key={`${entry.name}-${entry.href}`}
          href={entry.href}
          className="flex flex-col gap-1 border-b border-foreground/5 px-6 py-3 font-mono text-xs last:border-b-0 hover:bg-foreground/3 focus-visible:bg-foreground/6 md:flex-row md:items-baseline md:gap-4"
        >
          <span className="text-foreground md:shrink-0">{entry.name}</span>
          <span className="text-foreground/45">{entry.description}</span>
        </Link>
      ))}
    </div>
  );
}

export function ApiOverview() {
  return (
    <div>
      <Group title="Reference" entries={references} />
      <Group title="Methods" entries={methods} />
      <Group title="Primitives" entries={primitives} last />
    </div>
  );
}
