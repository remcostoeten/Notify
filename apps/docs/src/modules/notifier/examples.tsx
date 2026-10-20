import type { ToastInput } from "@remcostoeten/notifier";
import { Part } from "@/shared/icons/glyph";
import { ToastGlyph } from "./components/toast-glyph";

function CloudUploadGlyph() {
  return (
    <ToastGlyph name="upload">
      <Part icon="upload" part="cloud">
        <path d="M20 16.2A4.5 4.5 0 0 0 17.5 8h-1.8A7 7 0 1 0 4 14.9" />
      </Part>
      <Part icon="upload" part="arrow">
        <path d="M12 12v9" />
        <path d="m16 16-4-4-4 4" />
      </Part>
    </ToastGlyph>
  );
}

function CubeGlyph() {
  return (
    <ToastGlyph name="cube">
      <Part icon="cube" part="cube">
        <path d="M12 2 22 8.5v7L12 22 2 15.5v-7z" />
        <path d="M12 22v-6.5" />
        <path d="m22 8.5-10 7-10-7" />
        <path d="m2 15.5 10-7 10 7M12 2v6.5" />
      </Part>
    </ToastGlyph>
  );
}

const portrait = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="#eadfbf"/><path d="M12 80c2-17 15-23 28-23s26 6 28 23z" fill="#f2b631"/><ellipse cx="40" cy="37" rx="13" ry="16" fill="#8a5a3c"/><path d="M26 34c0-14 8-21 14-21s14 7 14 21c-3-8-8-11-14-11s-11 3-14 11z" fill="#1d2a2e"/></svg>',
)}`;

export const examples = {
  profile: {
    status: "success",
    icon: { shape: "ring" },
    title: "“Amélie Laurent” details updated",
    description: "Your changes have been saved and your profile is live. Your team can make edits.",
    actions: [
      { label: "Dismiss", color: "muted" },
      { label: "View profile", color: "default" },
    ],
  },
  upload: {
    icon: <CloudUploadGlyph />,
    title: "Uploading ‘toasts-FINAL06.fig’",
    description: "Please wait while we upload your file.",
    progress: 60,
    actions: [
      { label: "Cancel", color: "muted" },
      { label: "Upload another", color: "accent" },
    ],
  },
  message: {
    avatar: { src: portrait, alt: "Sienna Hewitt", badge: "online" },
    title: "Sienna Hewitt",
    meta: "2 mins ago",
    description: "I’ve finished adding my notes. Happy for us to review whenever you’re ready!",
    actions: [
      { label: "Dismiss", variant: "outline" },
      { label: "Reply", variant: "filled", color: "accent" },
    ],
  },
  update: {
    icon: <CubeGlyph />,
    title: "A new update is available",
    meta: "v4.2",
    description: "Includes the all new dashboard view. Pages and exports will now load faster.",
    actions: [
      { label: "Skip this update", variant: "outline", color: "muted" },
      { label: "Install now", variant: "filled", color: "default" },
    ],
  },
} satisfies Record<string, ToastInput>;

export type ExampleName = keyof typeof examples;
