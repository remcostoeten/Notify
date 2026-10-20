import { cn } from "@/shared/helpers/cn";
import { Glyph } from "@/shared/icons/glyph";
import { ChevronIcon } from "@/shared/icons/icons";

type Hue = "pink" | "violet" | "indigo" | "amber" | "emerald" | "sky" | "neutral";

type CalendarEvent = {
  title: string;
  time: string;
  hue: Hue;
};

type CalendarDay = {
  date: number;
  events: CalendarEvent[];
  more?: number;
};

type FileRow = {
  name: string;
  size: string;
  kind: string;
  modified: string;
  hue: Hue;
  starred: boolean;
};

type BoardCard = {
  title: string;
  label: string;
  hue: Hue;
  comments?: number;
};

type BoardColumn = {
  name: string;
  hue: Hue;
  cards: BoardCard[];
};

type StarProps = {
  filled: boolean;
};

type InvoiceStatus = "Subscribed" | "Trial" | "Refunded";

type Invoice = {
  id: string;
  date: string;
  amount: string;
  status: InvoiceStatus;
};

const chips: Record<Hue, string> = {
  pink: "border-pink-500/30 bg-pink-500/10 text-pink-700 dark:text-pink-300",
  violet: "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  indigo: "border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  amber: "border-amber-500/35 bg-amber-500/12 text-amber-800 dark:text-amber-300",
  emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  sky: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  neutral: "border-foreground/10 bg-foreground/5 text-foreground/70",
};

const dots: Record<Hue, string> = {
  pink: "bg-pink-500",
  violet: "bg-violet-500",
  indigo: "bg-indigo-500",
  amber: "bg-amber-500",
  emerald: "bg-emerald-500",
  sky: "bg-sky-500",
  neutral: "bg-foreground/35",
};

const weeks: CalendarDay[][] = [
  [
    {
      date: 10,
      events: [
        { title: "Olivia x Riley", time: "10:00", hue: "violet" },
        { title: "Product demo", time: "1:30", hue: "indigo" },
      ],
    },
    { date: 11, events: [{ title: "Dentist", time: "8:15", hue: "neutral" }] },
    { date: 12, events: [] },
    { date: 13, events: [{ title: "Book club", time: "7:30", hue: "amber" }] },
  ],
  [
    {
      date: 17,
      events: [
        { title: "Amélie’s first day", time: "10:00", hue: "pink" },
        { title: "All-hands", time: "4:00", hue: "neutral" },
      ],
    },
    {
      date: 18,
      events: [
        { title: "Coffee w/ Amélie", time: "9:30", hue: "violet" },
        { title: "Design review", time: "2:30", hue: "indigo" },
      ],
      more: 2,
    },
    { date: 19, events: [{ title: "Half marathon", time: "7:00", hue: "emerald" }] },
    { date: 20, events: [] },
  ],
  [
    { date: 24, events: [{ title: "Amélie 1:1", time: "10:00", hue: "pink" }] },
    {
      date: 25,
      events: [
        { title: "Accountant", time: "1:45", hue: "amber" },
        { title: "Marketing site", time: "2:30", hue: "indigo" },
      ],
      more: 3,
    },
    { date: 26, events: [] },
    { date: 27, events: [{ title: "Offsite", time: "9:00", hue: "sky" }] },
  ],
  [
    {
      date: 31,
      events: [
        { title: "All-hands", time: "4:00", hue: "neutral" },
        { title: "Team dinner", time: "5:30", hue: "pink" },
      ],
    },
    { date: 1, events: [{ title: "Standup", time: "9:00", hue: "neutral" }] },
    { date: 2, events: [] },
    { date: 3, events: [] },
  ],
];

const files: FileRow[] = [
  {
    name: "toasts-FINAL05.fig",
    size: "24.8 MB",
    kind: "Figma",
    modified: "2 hours ago",
    hue: "violet",
    starred: true,
  },
  {
    name: "brand-guidelines.pdf",
    size: "12.4 MB",
    kind: "PDF",
    modified: "Yesterday",
    hue: "pink",
    starred: false,
  },
  {
    name: "onboarding-flow.fig",
    size: "18.2 MB",
    kind: "Figma",
    modified: "Mar 2",
    hue: "violet",
    starred: false,
  },
  {
    name: "launch-teaser.mp4",
    size: "86.1 MB",
    kind: "Video",
    modified: "Feb 27",
    hue: "sky",
    starred: true,
  },
  {
    name: "icon-set.svg",
    size: "48 KB",
    kind: "SVG",
    modified: "Feb 21",
    hue: "amber",
    starred: false,
  },
  {
    name: "toasts-FINAL04.fig",
    size: "23.1 MB",
    kind: "Figma",
    modified: "Feb 18",
    hue: "violet",
    starred: false,
  },
  {
    name: "press-kit.zip",
    size: "142 MB",
    kind: "Archive",
    modified: "Feb 11",
    hue: "neutral",
    starred: true,
  },
  {
    name: "q4-report.pdf",
    size: "3.6 MB",
    kind: "PDF",
    modified: "Jan 30",
    hue: "pink",
    starred: false,
  },
];

const columns: BoardColumn[] = [
  {
    name: "In progress",
    hue: "amber",
    cards: [
      { title: "Pricing page copy", label: "Marketing", hue: "amber" },
      { title: "Empty states", label: "Design", hue: "violet", comments: 2 },
      { title: "Keyboard shortcuts", label: "Engineering", hue: "emerald" },
      { title: "Changelog layout", label: "Design", hue: "violet", comments: 1 },
    ],
  },
  {
    name: "In review",
    hue: "sky",
    cards: [
      { title: "Q3 launch notes", label: "Docs", hue: "sky", comments: 4 },
      { title: "Toast stacking", label: "Engineering", hue: "emerald" },
      { title: "Onboarding emails", label: "Marketing", hue: "amber", comments: 3 },
      { title: "Settings page", label: "Design", hue: "violet" },
    ],
  },
  {
    name: "Done",
    hue: "emerald",
    cards: [
      { title: "Release v4.1", label: "Engineering", hue: "emerald", comments: 7 },
      { title: "Customer interviews", label: "Research", hue: "pink" },
      { title: "Brand refresh", label: "Design", hue: "violet", comments: 5 },
      { title: "Status page", label: "Engineering", hue: "emerald" },
    ],
  },
];

const invoices: Invoice[] = [
  { id: "INV-0046", date: "Mar 4, 2025", amount: "$64.00", status: "Subscribed" },
  { id: "INV-0045", date: "Feb 4, 2025", amount: "$64.00", status: "Subscribed" },
  { id: "INV-0044", date: "Jan 4, 2025", amount: "$18.00", status: "Refunded" },
  { id: "INV-0043", date: "Dec 4, 2024", amount: "$64.00", status: "Subscribed" },
  { id: "INV-0042", date: "Nov 4, 2024", amount: "$0.00", status: "Trial" },
  { id: "INV-0041", date: "Oct 4, 2024", amount: "$64.00", status: "Subscribed" },
  { id: "INV-0040", date: "Sep 4, 2024", amount: "$64.00", status: "Subscribed" },
  { id: "INV-0039", date: "Aug 4, 2024", amount: "$64.00", status: "Subscribed" },
];

const statusHues: Record<InvoiceStatus, Hue> = {
  Subscribed: "emerald",
  Trial: "sky",
  Refunded: "neutral",
};

function KebabIcon() {
  return (
    <Glyph name="kebab" className="size-3.5">
      <circle cx="12" cy="5" r="1" fill="currentColor" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
      <circle cx="12" cy="19" r="1" fill="currentColor" />
    </Glyph>
  );
}

function StarIcon({ filled }: StarProps) {
  return (
    <Glyph
      name="star"
      className={cn(
        "size-3.5",
        filled ? "fill-amber-400 text-amber-400" : "fill-foreground/15 text-transparent",
      )}
    >
      <path d="M11.53 2.3a.53.53 0 0 1 .94 0l2.31 4.68a2.12 2.12 0 0 0 1.6 1.16l5.16.75a.53.53 0 0 1 .3.9l-3.74 3.65a2.12 2.12 0 0 0-.61 1.87l.88 5.14a.53.53 0 0 1-.77.56l-4.62-2.43a2.12 2.12 0 0 0-1.97 0l-4.62 2.43a.53.53 0 0 1-.77-.56l.88-5.14a2.12 2.12 0 0 0-.61-1.87L2.16 9.8a.53.53 0 0 1 .3-.9l5.16-.76a2.12 2.12 0 0 0 1.6-1.16z" />
    </Glyph>
  );
}

function CommentIcon() {
  return (
    <Glyph name="comment" className="size-3">
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z" />
    </Glyph>
  );
}

export function CalendarScene() {
  return (
    <div className="absolute -top-5 right-0 -left-10 grid grid-cols-4">
      {weeks.flat().map((day) => (
        <div
          key={day.date}
          className="flex h-26 min-w-0 flex-col gap-1 overflow-hidden border-r border-b border-foreground/8 p-1.5 nth-[4n]:border-r-0"
        >
          <span className="px-0.5 text-[11px] text-foreground/55 tabular-nums">{day.date}</span>
          {day.events.map((event) => (
            <span
              key={event.title}
              className={cn(
                "flex items-center justify-between gap-1.5 rounded-[5px] border px-1.5 py-1 text-[10.5px] leading-none font-medium",
                chips[event.hue],
              )}
            >
              <span className="flex min-w-0 items-center gap-1">
                {event.hue === "emerald" ? (
                  <span className={cn("size-1.5 shrink-0 rounded-full", dots[event.hue])} />
                ) : null}
                <span className="truncate">{event.title}</span>
              </span>
              <span className="shrink-0 opacity-65 tabular-nums">{event.time}</span>
            </span>
          ))}
          {day.more ? (
            <span className="px-1 text-[10.5px] text-foreground/45">{day.more} more…</span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function FilesScene() {
  return (
    <div className="@container absolute inset-0 bg-stone-50 text-[11.5px] dark:bg-[#0e0f15]">
      <div className="grid grid-cols-[1fr_64px_60px] items-center border-b border-foreground/8 px-5 py-2.5 text-[10.5px] text-foreground/40 @sm:grid-cols-[1fr_64px_84px_60px]">
        <span>Name</span>
        <span>Size</span>
        <span className="hidden @sm:block">Modified</span>
        <span />
      </div>
      {files.map((file) => (
        <div
          key={file.name}
          className="grid h-11 grid-cols-[1fr_64px_60px] items-center border-b border-foreground/6 px-5 text-foreground/55 @sm:grid-cols-[1fr_64px_84px_60px]"
        >
          <span className="flex min-w-0 items-center gap-2.5 pr-3">
            <span
              className={cn(
                "grid size-6 shrink-0 place-items-center rounded-md border text-[8px] font-semibold uppercase",
                chips[file.hue],
              )}
            >
              {file.kind.slice(0, 3)}
            </span>
            <span className="truncate font-medium text-foreground/80">{file.name}</span>
          </span>
          <span className="tabular-nums">{file.size}</span>
          <span className="hidden @sm:block">{file.modified}</span>
          <span className="flex items-center justify-end gap-2.5 text-foreground/35">
            <StarIcon filled={file.starred} />
            <ChevronIcon className="size-3.5" />
            <KebabIcon />
          </span>
        </div>
      ))}
    </div>
  );
}

export function BoardScene() {
  return (
    <div className="absolute inset-0 bg-zinc-50 dark:bg-zinc-950">
      <div className="absolute top-4 -right-16 -bottom-4 left-4 grid grid-cols-3 gap-3">
        {columns.map((column) => (
          <div
            key={column.name}
            className="flex min-w-0 flex-col gap-2 overflow-hidden rounded-xl bg-foreground/3 p-2"
          >
            <div className="flex items-center gap-1.5 px-1 pt-0.5 text-[11px] font-medium whitespace-nowrap text-foreground/70">
              <span className={cn("size-1.5 rounded-full", dots[column.hue])} />
              {column.name}
              <span className="text-foreground/35 tabular-nums">{column.cards.length}</span>
            </div>
            {column.cards.map((card) => (
              <div
                key={card.title}
                className="flex flex-col gap-2.5 rounded-lg border border-foreground/8 bg-background p-2.5 shadow-xs"
              >
                <span className="truncate text-[11.5px] font-medium text-foreground/80">
                  {card.title}
                </span>
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "rounded border px-1.5 py-0.5 text-[9.5px] leading-none font-medium",
                      chips[card.hue],
                    )}
                  >
                    {card.label}
                  </span>
                  {card.comments ? (
                    <span className="flex items-center gap-1 text-[10px] text-foreground/40 tabular-nums">
                      <CommentIcon />
                      {card.comments}
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function BillingScene() {
  return (
    <div className="@container absolute inset-0 text-[12px]">
      <div className="grid grid-cols-[1fr_64px_92px_24px] items-center border-b border-foreground/8 px-5 py-2.5 text-[10.5px] text-foreground/40 @sm:grid-cols-[1fr_88px_64px_92px_24px]">
        <span>Invoice</span>
        <span className="hidden @sm:block">Date</span>
        <span>Amount</span>
        <span>Status</span>
        <span />
      </div>
      {invoices.map((invoice) => (
        <div
          key={invoice.id}
          className="grid h-12 grid-cols-[1fr_64px_92px_24px] items-center border-b border-foreground/6 px-5 text-foreground/50 tabular-nums @sm:grid-cols-[1fr_88px_64px_92px_24px]"
        >
          <span className="truncate pr-3 font-medium text-foreground/75">
            {invoice.id}
            <span className="ml-2 font-normal text-foreground/40">Pro plan</span>
          </span>
          <span className="hidden @sm:block">{invoice.date}</span>
          <span>{invoice.amount}</span>
          <span>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-foreground/12 px-1.5 py-0.5 text-[10.5px] text-foreground/65 shadow-xs">
              <span className={cn("size-1.5 rounded-full", dots[statusHues[invoice.status]])} />
              {invoice.status}
            </span>
          </span>
          <span className="flex justify-end text-foreground/40">
            <KebabIcon />
          </span>
        </div>
      ))}
    </div>
  );
}
