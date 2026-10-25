"use client";

import { notify, Toast } from "@remcostoeten/notifier";
import type {
  IconShape,
  ToastInput,
  ToastPosition,
  ToastStatus,
  ToastTone,
} from "@remcostoeten/notifier";
import { useEffect, useState } from "react";
import {
  resetNotifierSettings,
  setNotifierSettings,
  useNotifierSettings,
} from "@/modules/notifier/notifier-settings";
import { ToastGlyph } from "@/modules/notifier/components/toast-glyph";
import { useSiteTone } from "@/modules/theme/hooks/use-site-tone";
import { Part } from "@/shared/icons/glyph";
import { type Option, SelectField, SwitchField } from "./controls";
import { DocsLink } from "./docs-link";
import { LiveCode } from "./live-code";
import { Stage } from "./stage";

type Media = ToastStatus | "none" | "icon" | "avatar";
type ProgressMode = "none" | "determinate" | "indeterminate";
type ActionsMode = "none" | "text" | "buttons";

type Draft = {
  tone?: ToastTone;
  media: Media;
  shape: IconShape;
  meta: boolean;
  description: boolean;
  progress: ProgressMode;
  actions: ActionsMode;
  close: boolean;
};

const statuses: ToastStatus[] = ["success", "error", "warning", "info", "loading"];

const titles: Record<ToastStatus, string> = {
  success: "Changes saved",
  error: "Could not save changes",
  warning: "Storage almost full",
  info: "New version available",
  loading: "Syncing your workspace",
};

const toneOptions: Option<ToastTone>[] = [
  { value: "light", label: "light" },
  { value: "dark", label: "dark" },
];

const mediaOptions: Option<Media>[] = [
  { value: "none", label: "none" },
  ...statuses.map((status): Option<Media> => ({ value: status, label: `status: ${status}` })),
  { value: "icon", label: "custom icon" },
  { value: "avatar", label: "avatar" },
];

const shapeOptions: Option<IconShape>[] = [
  { value: "bare", label: "bare" },
  { value: "ring", label: "ring" },
  { value: "box", label: "box" },
  { value: "circle", label: "circle" },
];

const progressOptions: Option<ProgressMode>[] = [
  { value: "none", label: "none" },
  { value: "determinate", label: "60%" },
  { value: "indeterminate", label: "indeterminate" },
];

const actionOptions: Option<ActionsMode>[] = [
  { value: "none", label: "none" },
  { value: "text", label: "text links" },
  { value: "buttons", label: "buttons" },
];

const positions: ToastPosition[] = [
  "bottom-right",
  "bottom-center",
  "bottom-left",
  "top-right",
  "top-center",
  "top-left",
];

const positionOptions = positions.map((position): Option<ToastPosition> => ({
  value: position,
  label: position,
}));

const durationOptions: Option<number>[] = [
  { value: 2000, label: "2s" },
  { value: 5000, label: "5s" },
  { value: 8000, label: "8s" },
  { value: 0, label: "persistent" },
];

const maxVisibleOptions: Option<number>[] = [
  { value: 1, label: "1" },
  { value: 3, label: "3" },
  { value: 5, label: "5" },
];

const portrait = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="#eadfbf"/><path d="M12 80c2-17 15-23 28-23s26 6 28 23z" fill="#f2b631"/><ellipse cx="40" cy="37" rx="13" ry="16" fill="#8a5a3c"/><path d="M26 34c0-14 8-21 14-21s14 7 14 21c-3-8-8-11-14-11s-11 3-14 11z" fill="#1d2a2e"/></svg>',
)}`;

function SparkleGlyph() {
  return (
    <ToastGlyph name="sparkle" style={{ color: "var(--ntf-accent-text)" }}>
      <Part icon="sparkle" part="star">
        <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
      </Part>
      <Part icon="sparkle" part="spark">
        <path d="M19 15v4M17 17h4" />
      </Part>
    </ToastGlyph>
  );
}

function isStatus(media: Media): media is ToastStatus {
  return statuses.some((status) => status === media);
}

function titleFor(media: Media) {
  if (isStatus(media)) return titles[media];
  return media === "avatar" ? "Sienna Hewitt" : "Weekly report is ready";
}

function metaFor(media: Media) {
  return media === "avatar" ? "2 mins ago" : "v4.2";
}

function buildInput(draft: Draft): ToastInput {
  const { media, shape } = draft;
  const status = isStatus(media) ? media : undefined;
  const input: ToastInput = {
    tone: draft.tone,
    status,
    title: titleFor(media),
    description: draft.description
      ? "Your changes have been saved and your profile is live. Your team can make edits."
      : undefined,
    meta: draft.meta ? metaFor(media) : undefined,
    close: draft.close,
  };
  if (draft.progress === "determinate") input.progress = 60;
  if (draft.progress === "indeterminate") input.progress = { value: null };
  if (draft.actions === "text") {
    input.actions = [
      { label: "Dismiss", color: "muted" },
      { label: "View", color: "default" },
    ];
  }
  if (draft.actions === "buttons") {
    input.actions = [
      { label: "Dismiss", variant: "outline" },
      { label: "Open", variant: "filled", color: "accent" },
    ];
  }
  if (status) input.icon = { shape, status };
  if (media === "icon") input.icon = { shape, node: <SparkleGlyph /> };
  if (media === "avatar") input.avatar = { src: portrait, alt: "Sienna Hewitt", badge: "online" };
  return input;
}

function toCode(draft: Draft): string {
  const { media, shape } = draft;
  const status = isStatus(media) ? media : undefined;
  const lines = draft.tone ? [`  tone: '${draft.tone}',`] : [];
  if (status) {
    lines.push(
      shape === "circle"
        ? `  status: '${status}',`
        : `  icon: { shape: '${shape}', status: '${status}' },`,
    );
  }
  if (media === "icon") lines.push(`  icon: { shape: '${shape}', node: <Sparkles /> },`);
  if (media === "avatar") lines.push("  avatar: { src: portrait, badge: 'online' },");
  lines.push(`  title: '${titleFor(media)}',`);
  if (draft.meta) lines.push(`  meta: '${metaFor(media)}',`);
  if (draft.description) lines.push("  description: 'Your team can make edits.',");
  if (draft.progress === "determinate") lines.push("  progress: 60,");
  if (draft.progress === "indeterminate") lines.push("  progress: { value: null },");
  if (draft.actions === "text") {
    lines.push(
      "  actions: [\n    { label: 'Dismiss', color: 'muted' },\n    { label: 'View' }\n  ],",
    );
  }
  if (draft.actions === "buttons") {
    lines.push(
      "  actions: [\n    { label: 'Dismiss', variant: 'outline' },\n    { label: 'Open', variant: 'filled', color: 'accent' }\n  ],",
    );
  }
  if (!draft.close) lines.push("  close: false,");
  return `notify({\n${lines.join("\n")}\n})`;
}

type Props = {
  title: string;
  code: string;
  docs: { href: string; label: string };
  className?: string;
};

function CodePane({ title, code, docs, className }: Props) {
  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-4 px-6 pt-4">
        <span className="font-mono text-xs text-foreground/45">{title}</span>
        <DocsLink href={docs.href}>{docs.label}</DocsLink>
      </div>
      <div className="px-6 pb-1">
        <LiveCode code={code} />
      </div>
    </div>
  );
}

export function Playground() {
  const setup = useNotifierSettings();
  const siteTone = useSiteTone();
  const [draft, setDraft] = useState<Draft>({
    media: "success",
    shape: "bare",
    meta: false,
    description: true,
    progress: "none",
    actions: "text",
    close: true,
  });

  useEffect(() => resetNotifierSettings, []);

  function patch(change: Partial<Draft>) {
    setDraft((current) => ({ ...current, ...change }));
  }

  const input = buildInput(draft);
  const notifierCode = `<Notifier\n  position='${setup.position}'\n  duration={${setup.duration}}\n  maxVisible={${setup.maxVisible}}${setup.stack ? "\n  stack" : ""}\n/>`;

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div
          data-site-tone={draft.tone ? undefined : ""}
          className="flex items-stretch border-b border-foreground/5 p-6 md:border-r"
        >
          <Stage className="min-h-80 flex-1">
            <Toast {...input} />
          </Stage>
        </div>
        <div className="grid grid-cols-2 border-b border-foreground/5 [&>label]:border-r [&>label]:border-b [&>label]:border-foreground/5 [&>label:nth-child(2n)]:border-r-0">
          <SelectField
            label="Tone"
            value={draft.tone ?? siteTone}
            options={toneOptions}
            onChange={(tone) => patch({ tone })}
          />
          <SelectField
            label="Media"
            value={draft.media}
            options={mediaOptions}
            onChange={(media) => patch({ media })}
          />
          <SelectField
            label="Icon shape"
            value={draft.shape}
            options={shapeOptions}
            onChange={(shape) => patch({ shape })}
          />
          <SelectField
            label="Progress"
            value={draft.progress}
            options={progressOptions}
            onChange={(progress) => patch({ progress })}
          />
          <SelectField
            label="Actions"
            value={draft.actions}
            options={actionOptions}
            onChange={(actions) => patch({ actions })}
          />
          <SelectField
            label="Position"
            value={setup.position}
            options={positionOptions}
            onChange={(position) => setNotifierSettings({ position })}
          />
          <SelectField
            label="Duration"
            value={setup.duration}
            options={durationOptions}
            onChange={(duration) => setNotifierSettings({ duration })}
          />
          <SelectField
            label="Max visible"
            value={setup.maxVisible}
            options={maxVisibleOptions}
            onChange={(maxVisible) => setNotifierSettings({ maxVisible })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4">
        <SwitchField
          id="playground-meta"
          label="Meta next to title"
          checked={draft.meta}
          onChange={(meta) => patch({ meta })}
        />
        <SwitchField
          id="playground-description"
          label="Description"
          checked={draft.description}
          onChange={(description) => patch({ description })}
        />
        <SwitchField
          id="playground-close"
          label="Close button"
          checked={draft.close}
          onChange={(close) => patch({ close })}
        />
        <SwitchField
          id="playground-stack"
          label="Stacked (hover to expand)"
          checked={setup.stack}
          onChange={(stack) => setNotifierSettings({ stack })}
        />
      </div>

      <div className="flex items-center justify-between gap-4 border-b border-foreground/5 px-6 py-4">
        <span className="hidden font-mono text-xs text-foreground/45 sm:block">
          Opens {setup.position.replace("-", " ")}{" "}
          {setup.duration === 0 ? "until closed" : `for ${setup.duration / 1000} seconds`}
        </span>
        <button
          type="button"
          onClick={() => notify({ ...input, duration: setup.duration })}
          className="pressable h-8 bg-foreground px-4 text-[13px] font-medium text-background hover:bg-foreground/85 focus-visible:bg-foreground/85 focus-visible:text-background"
        >
          Show toast
        </button>
      </div>

      <div className="grid grid-cols-1 border-b border-foreground/5 md:grid-cols-2">
        <CodePane
          title="Toast"
          code={toCode(draft)}
          docs={{ href: "/docs/reference/toast-input", label: "Toast options" }}
          className="md:border-r md:border-foreground/5"
        />
        <CodePane
          title="Notifier"
          code={notifierCode}
          docs={{ href: "/docs/reference/notifier", label: "Notifier props" }}
          className="border-t border-foreground/5 md:border-t-0"
        />
      </div>
    </div>
  );
}
