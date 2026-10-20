"use client";

import { notify } from "@remcostoeten/notifier";
import type { ToastInput, ToastStatus } from "@remcostoeten/notifier";
import { noop } from "@/shared/helpers/noop";
import { SwapIcon, SwapText } from "./swap";

type Flow = "save" | "retry" | "network" | "deploy";

type DemoProps = {
  flow: Flow;
};

type Trigger = {
  label: string;
  run: () => void;
};

type Stage = {
  title: string;
  description: string;
  progress: number;
};

const uploadId = "swap-upload";
const networkId = "swap-network";
const deployId = "swap-deploy";

const runs = { upload: 0, deploy: 0 };

const build: Stage = { title: "Building", description: "Compiling 128 modules", progress: 20 };
const optimize: Stage = { title: "Optimizing", description: "Compressing assets", progress: 55 };
const ship: Stage = { title: "Deploying", description: "Uploading to the edge", progress: 85 };

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function step(status: ToastStatus, title: string, description: string): ToastInput {
  return {
    status,
    icon: { status, node: <SwapIcon status={status} /> },
    title: <SwapText>{title}</SwapText>,
    description: <SwapText>{description}</SwapText>,
  };
}

function stage({ title, description, progress }: Stage): ToastInput {
  return { ...step("loading", title, description), progress };
}

function save(outcome: "success" | "error") {
  const request = wait(1600).then(() => {
    if (outcome === "error") throw new Error("The disk is full");
  });

  notify
    .promise(request, {
      loading: step("loading", "Saving changes", "Writing 3 files"),
      success: step("success", "Changes saved", "3 files written"),
      error: (error) => step("error", "Could not save", error.message),
      id: "swap-save",
    })
    .catch(noop);
}

async function upload(fail: boolean) {
  const mine = ++runs.upload;

  notify({
    id: uploadId,
    ...step("loading", "Uploading report.pdf", "Sending 2.4 MB"),
    actions: [{ label: <SwapText>Cancel</SwapText>, color: "muted" }],
  });

  await wait(1500);
  if (mine !== runs.upload) return;

  if (fail) {
    notify.update(uploadId, {
      ...step("error", "Upload failed", "The connection dropped"),
      duration: 0,
      actions: [
        {
          label: <SwapText>Retry</SwapText>,
          color: "accent",
          dismiss: false,
          onClick: () => upload(false),
        },
      ],
    });
    return;
  }

  notify.update(uploadId, {
    ...step("success", "Upload complete", "report.pdf is ready"),
    duration: 4000,
    actions: [{ label: <SwapText>Open</SwapText>, color: "accent" }],
  });
}

function goOffline() {
  notify({
    id: networkId,
    ...step("warning", "You are offline", "Changes stay on this device"),
    duration: 0,
  });
}

function goOnline() {
  notify({
    id: networkId,
    ...step("success", "Back online", "Syncing 4 queued changes"),
    duration: 4000,
  });
}

async function deploy() {
  const mine = ++runs.deploy;

  notify({ id: deployId, ...stage(build) });

  for (const next of [optimize, ship]) {
    await wait(1300);
    if (mine !== runs.deploy) return;
    notify.update(deployId, stage(next));
  }

  await wait(1300);
  if (mine !== runs.deploy) return;
  notify.update(deployId, {
    ...step("success", "Deployed", "Live in 12 regions"),
    progress: 100,
  });
}

const triggers: Record<Flow, Trigger[]> = {
  save: [
    { label: "Save, succeeds", run: () => save("success") },
    { label: "Save, fails", run: () => save("error") },
  ],
  retry: [{ label: "Upload", run: () => upload(true) }],
  network: [
    { label: "Go offline", run: goOffline },
    { label: "Go online", run: goOnline },
  ],
  deploy: [{ label: "Deploy", run: () => deploy() }],
};

export function SwapDemo({ flow }: DemoProps) {
  return (
    <div className="not-prose my-6 flex flex-wrap gap-2">
      {triggers[flow].map(({ label, run }) => (
        <button
          key={label}
          type="button"
          onClick={() => run()}
          className="pressable border border-foreground/10 px-3 py-1.5 font-mono text-xs text-foreground/70 transition-colors duration-150 ease-hover hover:bg-foreground/5 hover:text-foreground focus-visible:bg-foreground/8"
        >
          {label}
        </button>
      ))}
    </div>
  );
}
