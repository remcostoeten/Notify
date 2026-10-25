"use client";

import { Toast } from "@remcostoeten/notifier";

const shapes = ["bare", "ring", "box", "circle"] as const;
const statuses = ["success", "error", "warning", "info", "loading"] as const;

export function IconGallery() {
  return (
    <div
      data-site-tone=""
      className="not-prose my-6 overflow-x-auto border border-foreground/5 bg-foreground/3"
    >
      <table className="w-full border-collapse text-center">
        <thead>
          <tr className="border-b border-foreground/5 font-mono text-[11px] text-foreground/45 uppercase">
            <th className="px-4 py-3 text-left font-normal">
              <span className="sr-only">Shape</span>
            </th>
            {statuses.map((status) => (
              <th key={status} className="px-4 py-3 font-normal">
                {status}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {shapes.map((shape) => (
            <tr key={shape} className="border-b border-foreground/5 last:border-b-0">
              <th className="px-4 py-3 text-left font-mono text-xs font-normal text-foreground/60">
                {shape}
              </th>
              {statuses.map((status) => (
                <td key={status} className="px-4 py-4">
                  <div className="flex items-center justify-center">
                    <Toast.Icon shape={shape} status={status} />
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
