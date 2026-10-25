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

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export const requestMs = {
  profile: 900,
  upload: 700,
  open: 800,
  message: 1200,
  update: 1800,
} as const;

export const examples = {
  profile: {
    status: "success",
    title: "“Amélie Laurent” details updated",
    description: "Your changes have been saved and your profile is live. Your team can make edits.",
    actions: [
      { label: "Dismiss", color: "muted" },
      {
        label: "View profile",
        color: "default",
        onClick: () => wait(requestMs.profile),
        labels: { loading: "Opening", success: "Opened" },
      },
    ],
  },
  upload: {
    icon: <CloudUploadGlyph />,
    title: "Uploading ‘toasts-FINAL06.fig’",
    description: "Please wait while we upload your file.",
    progress: 60,
    actions: [
      {
        label: "Cancel",
        color: "muted",
        onClick: () => wait(requestMs.upload),
        labels: { loading: "Cancelling", success: "Cancelled" },
      },
      { label: "Upload another", color: "default", dismiss: false },
    ],
  },
  message: {
    avatar: { src: portrait, alt: "Sienna Hewitt", badge: "online" },
    title: "Sienna Hewitt",
    meta: "2 mins ago",
    description: "I’ve finished adding my notes. Happy for us to review whenever you’re ready!",
    actions: [
      { label: "Dismiss", variant: "outline" },
      {
        label: "Reply",
        variant: "filled",
        onClick: () => wait(requestMs.message),
        labels: { loading: "Sending", success: "Sent" },
      },
    ],
  },
  sync: {
    status: "loading",
    title: "Syncing 72 of 120 files",
    description: "288 MB of 480 MB",
    progress: 60,
    animateNumbers: true,
  },
  update: {
    icon: <CubeGlyph />,
    title: "A new update is available",
    meta: "v4.2",
    description: "Includes the all new dashboard view. Pages and exports will now load faster.",
    actions: [
      { label: "Skip this update", variant: "outline", color: "muted" },
      {
        label: "Install now",
        variant: "filled",
        onClick: () => wait(requestMs.update),
        labels: { loading: "Installing", success: "Installed" },
      },
    ],
  },
} satisfies Record<string, ToastInput>;

export type ExampleName = keyof typeof examples;

function syncStep(progress: number): ToastInput {
  const files = Math.round(progress * 1.2);
  return { title: `Syncing ${files} of 120 files`, description: `${files * 4} MB of 480 MB` };
}

export type Step = { input: ToastInput; ms: number };

export const successHoldMs = 900;

export type Timeline = {
  derive?: (progress: number) => ToastInput;
  after?: Step[];
  lead?: { input: ToastInput; ms: number };
  done?: { input: ToastInput; ms: number };
  press?: { label: string; afterMs: number; requestMs: number };
};

export const timelines: Record<ExampleName, Timeline> = {
  profile: {
    lead: {
      ms: 1200,
      input: {
        status: "loading",
        title: "Saving “Amélie Laurent”",
        description: "Publishing your profile changes to the team.",
      },
    },
    after: [
      {
        ms: 2400,
        input: {
          status: "success",
          title: "Opened “Amélie Laurent”",
          description: "The profile is open in a new tab.",
        },
      },
    ],
    press: { label: "View profile", afterMs: 1800, requestMs: requestMs.profile },
  },
  upload: {
    done: {
      ms: 500,
      input: {
        icon: { shape: "box" },
        status: "success",
        title: "Uploaded ‘toasts-FINAL06.fig’",
        description: "Saved to Files. Your team can open it now.",
        progress: 100,
        actions: [
          {
            label: "Open file",
            color: "muted",
            onClick: () => wait(requestMs.open),
            labels: { loading: "Opening", success: "Opened" },
          },
          { label: "Upload another", color: "default", dismiss: false },
        ],
      },
    },
    after: [
      {
        ms: 2400,
        input: {
          icon: { shape: "box" },
          status: "success",
          title: "Opened ‘toasts-FINAL06.fig’",
          description: "You are viewing the latest version.",
        },
      },
    ],
    press: { label: "Open file", afterMs: 1600, requestMs: requestMs.open },
  },
  sync: {
    derive: syncStep,
    done: {
      ms: 500,
      input: {
        status: "success",
        title: "Synced 120 of 120 files",
        description: "480 MB of 480 MB",
        progress: 100,
      },
    },
  },
  message: {
    after: [
      {
        ms: 2400,
        input: {
          avatar: examples.message.avatar,
          title: "Reply sent",
          meta: "Just now",
          description: "Sienna Hewitt will see it the next time they open the thread.",
        },
      },
    ],
    press: { label: "Reply", afterMs: 1800, requestMs: requestMs.message },
  },
  update: {
    after: [
      {
        ms: 1800,
        input: {
          icon: { shape: "box" },
          status: "loading",
          title: "Restarting to finish the update",
          meta: "v4.2",
          description: "This takes a few seconds.",
          progress: { value: null },
        },
      },
      {
        ms: 2400,
        input: {
          icon: { shape: "box" },
          status: "success",
          title: "Updated to v4.2",
          description: "The new dashboard view is ready.",
        },
      },
    ],
    press: { label: "Install now", afterMs: 1800, requestMs: requestMs.update },
  },
};

const clearedSlots: ToastInput = {
  status: undefined,
  icon: undefined,
  meta: undefined,
  description: undefined,
  progress: undefined,
  actions: undefined,
};

/**
 * @name stepPatch
 * @description The patch that moves an open toast to a step. `notify.update` merges, so
 * the slots the step leaves out are cleared first.
 *
 * @example
 * notify.update(id, stepPatch(timelines.update.after[0]))
 */
export function stepPatch(step: Step): ToastInput {
  return { ...clearedSlots, ...step.input };
}
