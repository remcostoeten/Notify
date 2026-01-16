"use client"

import type React from "react"
import { useState } from "react"
import {
  notify,
  Notifier,
  type NotifierProps,
  type RadiusVariant,
  type ColorMode,
  type IconColorMode,
} from "@/module/notify"

// ============================================================================
// TYPES
// ============================================================================

interface PlaygroundConfig {
  position: NotifierProps["position"]
  maxVisible: number
  duration: number
  colorMode: ColorMode
  radius: RadiusVariant
  iconColor: IconColorMode
  borderEnabled: boolean
  swipeToDismiss: boolean
  pauseOnHover: boolean
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_CONFIG: PlaygroundConfig = {
  position: "top",
  maxVisible: 3,
  duration: 3000,
  colorMode: "dark",
  radius: "pill",
  iconColor: "colored",
  borderEnabled: false,
  swipeToDismiss: true,
  pauseOnHover: true,
}

const POSITIONS = [
  { value: "top", label: "Top" },
  { value: "top-left", label: "Top Left" },
  { value: "top-right", label: "Top Right" },
  { value: "bottom", label: "Bottom" },
  { value: "bottom-left", label: "Bottom Left" },
  { value: "bottom-right", label: "Bottom Right" },
] as const

const RADIUS_OPTIONS: { value: RadiusVariant; label: string }[] = [
  { value: "pill", label: "Pill" },
  { value: "rounded", label: "Rounded" },
  { value: "squared", label: "Squared" },
]

const COLOR_MODES: { value: ColorMode; label: string }[] = [
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
  { value: "auto", label: "Auto" },
]

// ============================================================================
// UI COMPONENTS
// ============================================================================

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`
        px-3 py-1.5 rounded-md text-xs font-mono transition-all
        ${
          active
            ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30"
            : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70"
        }
      `}
    >
      {children}
    </button>
  )
}

function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean
  onChange: (enabled: boolean) => void
}) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`
        relative w-10 h-5 rounded-full transition-colors
        ${enabled ? "bg-emerald-500/30" : "bg-white/10"}
      `}
    >
      <span
        className={`
          absolute top-0.5 w-4 h-4 rounded-full transition-all
          ${enabled ? "left-5 bg-emerald-400" : "left-0.5 bg-white/60"}
        `}
      />
    </button>
  )
}

function CodeBlock({ children, title }: { children: string; title?: string }) {
  return (
    <div className="rounded-lg overflow-hidden bg-black/40 ring-1 ring-white/10">
      {title && (
        <div className="px-3 py-1.5 bg-white/5 border-b border-white/5">
          <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">{title}</span>
        </div>
      )}
      <pre className="p-3 text-xs font-mono text-white/70 overflow-x-auto">
        <code>{children}</code>
      </pre>
    </div>
  )
}

function APICard({
  name,
  signature,
  description,
  example,
  onTry,
  returns,
}: {
  name: string
  signature: string
  description: string
  example: string
  onTry?: () => void
  returns?: string
}) {
  return (
    <div className="space-y-3 p-4 rounded-lg bg-white/[0.02] ring-1 ring-white/5 hover:ring-white/10 transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <code className="text-sm font-semibold text-emerald-400">{name}</code>
            <code className="text-xs text-white/30">{signature}</code>
          </div>
          <p className="text-xs text-white/50 leading-relaxed">{description}</p>
          {returns && (
            <p className="text-[10px] text-white/30">
              Returns: <code className="text-white/40">{returns}</code>
            </p>
          )}
        </div>
        {onTry && (
          <button
            onClick={onTry}
            className="shrink-0 px-3 py-1.5 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-xs text-emerald-400 hover:text-emerald-300 transition-all ring-1 ring-emerald-500/20 hover:ring-emerald-500/30"
          >
            Run
          </button>
        )}
      </div>
      <CodeBlock>{example}</CodeBlock>
    </div>
  )
}

function Section({
  id,
  title,
  description,
  children,
}: {
  id?: string
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="space-y-4 scroll-mt-8">
      <div className="space-y-1">
        <h2 className="text-sm font-semibold text-white/90">{title}</h2>
        {description && <p className="text-xs text-white/40 leading-relaxed">{description}</p>}
      </div>
      {children}
    </section>
  )
}

function PropsTable({
  props,
}: {
  props: { name: string; type: string; default?: string; description: string }[]
}) {
  return (
    <div className="rounded-lg overflow-hidden ring-1 ring-white/10 overflow-x-auto">
      <table className="w-full text-xs min-w-[500px]">
        <thead>
          <tr className="bg-white/5 text-left">
            <th className="px-3 py-2 font-medium text-white/60">Prop</th>
            <th className="px-3 py-2 font-medium text-white/60">Type</th>
            <th className="px-3 py-2 font-medium text-white/60">Default</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {props.map((prop) => (
            <tr key={prop.name} className="hover:bg-white/[0.02]">
              <td className="px-3 py-2">
                <code className="text-emerald-400">{prop.name}</code>
                <p className="text-white/40 mt-0.5 max-w-xs">{prop.description}</p>
              </td>
              <td className="px-3 py-2 font-mono text-white/50 whitespace-nowrap">{prop.type}</td>
              <td className="px-3 py-2 font-mono text-white/40">{prop.default || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TypeCard({
  name,
  description,
  properties,
}: {
  name: string
  description: string
  properties: { name: string; type: string; description: string; required?: boolean }[]
}) {
  return (
    <div className="space-y-3 p-4 rounded-lg bg-white/[0.02] ring-1 ring-white/5">
      <div className="space-y-1">
        <code className="text-sm font-semibold text-emerald-400">{name}</code>
        <p className="text-xs text-white/50">{description}</p>
      </div>
      <div className="space-y-1">
        {properties.map((prop) => (
          <div key={prop.name} className="flex items-start gap-3 py-1.5 border-t border-white/5 first:border-t-0">
            <div className="flex items-center gap-1.5 shrink-0">
              <code className="text-xs text-white/70">{prop.name}</code>
              {prop.required && <span className="text-[9px] text-amber-400/70">required</span>}
            </div>
            <code className="text-xs text-white/30 shrink-0">{prop.type}</code>
            <span className="text-xs text-white/40 flex-1">{prop.description}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// CONFIG PANEL
// ============================================================================

function ConfigPanel({
  config,
  onConfigChange,
}: {
  config: PlaygroundConfig
  onConfigChange: (config: PlaygroundConfig) => void
}) {
  return (
    <div className="sticky top-16 z-30 space-y-4 p-4 rounded-lg bg-[#0e0e10] ring-1 ring-white/5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-white/60 uppercase tracking-wider">Live Config</span>
        <button
          onClick={() => notify.dismiss()}
          className="text-[10px] text-white/30 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-red-500/10"
        >
          Clear All
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Theme Options */}
        <div className="space-y-4">
          <div className="text-[10px] text-white/30 uppercase tracking-wider font-medium">Appearance</div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-white/40 uppercase tracking-wider">Color Mode</label>
            <div className="flex gap-1 flex-wrap">
              {COLOR_MODES.map(({ value, label }) => (
                <ToggleButton
                  key={value}
                  active={config.colorMode === value}
                  onClick={() => onConfigChange({ ...config, colorMode: value })}
                >
                  {label}
                </ToggleButton>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-white/40 uppercase tracking-wider">Radius</label>
            <div className="flex gap-1 flex-wrap">
              {RADIUS_OPTIONS.map(({ value, label }) => (
                <ToggleButton
                  key={value}
                  active={config.radius === value}
                  onClick={() => onConfigChange({ ...config, radius: value })}
                >
                  {label}
                </ToggleButton>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-[10px] text-white/40 uppercase tracking-wider">Neutral Icons</label>
            <Toggle
              enabled={config.iconColor === "neutral"}
              onChange={(enabled) => onConfigChange({ ...config, iconColor: enabled ? "neutral" : "colored" })}
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-[10px] text-white/40 uppercase tracking-wider">Border</label>
            <Toggle
              enabled={config.borderEnabled}
              onChange={(enabled) => onConfigChange({ ...config, borderEnabled: enabled })}
            />
          </div>
        </div>

        {/* Behavior Options */}
        <div className="space-y-4">
          <div className="text-[10px] text-white/30 uppercase tracking-wider font-medium">Behavior</div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-white/40 uppercase tracking-wider">Position</label>
            <div className="grid grid-cols-3 gap-1">
              {POSITIONS.map(({ value, label }) => (
                <ToggleButton
                  key={value}
                  active={config.position === value}
                  onClick={() => onConfigChange({ ...config, position: value })}
                >
                  {label.replace("Top ", "T-").replace("Bottom ", "B-")}
                </ToggleButton>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-[10px] text-white/40 uppercase tracking-wider">Max Visible</label>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onConfigChange({ ...config, maxVisible: Math.max(1, config.maxVisible - 1) })}
                className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 text-white/40 text-xs"
              >
                -
              </button>
              <span className="w-6 text-center text-xs text-white/60 tabular-nums">{config.maxVisible}</span>
              <button
                onClick={() => onConfigChange({ ...config, maxVisible: Math.min(10, config.maxVisible + 1) })}
                className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 text-white/40 text-xs"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-[10px] text-white/40 uppercase tracking-wider">Swipe to Dismiss</label>
            <Toggle
              enabled={config.swipeToDismiss}
              onChange={(enabled) => onConfigChange({ ...config, swipeToDismiss: enabled })}
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-[10px] text-white/40 uppercase tracking-wider">Pause on Hover</label>
            <Toggle
              enabled={config.pauseOnHover}
              onChange={(enabled) => onConfigChange({ ...config, pauseOnHover: enabled })}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// NAV
// ============================================================================

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="text-xs text-white/40 hover:text-white/70 transition-colors">
      {children}
    </a>
  )
}

// ============================================================================
// MAIN
// ============================================================================

export default function Home() {
  const [config, setConfig] = useState<PlaygroundConfig>(DEFAULT_CONFIG)

  // API Demo handlers
  const demos = {
    basic: () => notify("New message received"),
    loading: () => notify.loading("Processing request..."),
    success: () => notify.success("Operation completed"),
    error: () => notify.error("Something went wrong"),

    chained: () => {
      const n = notify.loading("Saving...")
      setTimeout(() => n.success("Saved!"), 1500)
    },

    promise: () => {
      const asyncOp = new Promise((r) => setTimeout(r, 2000))
      notify.promise(asyncOp, {
        loading: "Uploading file...",
        success: "Upload complete!",
        error: "Upload failed",
      })
    },

    withAction: () => {
      const n = notify("File moved to trash", { duration: 8000 })
      n.update({
        action: {
          label: "Undo",
          onClick: () => n.success("File restored"),
        },
      })
    },

    confirm: async () => {
      const n = notify({})
      const confirmed = await n.confirm("Delete permanently?", {
        confirmLabel: "Delete",
        cancelLabel: "Cancel",
      })
      if (confirmed) {
        n.loading("Deleting...")
        await new Promise((r) => setTimeout(r, 1000))
        n.success("Deleted")
      } else {
        n.dismiss()
      }
    },

    persistent: () => {
      const n = notify("This won't auto-dismiss", { duration: 0 })
      n.update({
        action: { label: "Dismiss", onClick: () => n.dismiss() },
      })
    },

    update: () => {
      const n = notify.loading("Step 1: Preparing...")
      setTimeout(() => {
        n.loading("Step 2: Processing...")
        setTimeout(() => {
          n.loading("Step 3: Finalizing...")
          setTimeout(() => n.success("All steps complete!"), 1000)
        }, 1000)
      }, 1000)
    },

    dismissById: () => {
      const n = notify("I have an ID", { duration: 10000 })
      setTimeout(() => n.dismiss(), 2000)
    },
  }

  const notifierCode = `<Notifier
  position="${config.position}"
  maxVisible={${config.maxVisible}}
  duration={${config.duration}}
  swipeToDismiss={${config.swipeToDismiss}}
  pauseOnHover={${config.pauseOnHover}}
  colorMode="${config.colorMode}"
  radius="${config.radius}"
  iconColor="${config.iconColor}"${config.borderEnabled ? "\n  border={{ enabled: true }}" : ""}
/>`

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Notifier with current config */}
      <Notifier
        position={config.position}
        maxVisible={config.maxVisible}
        duration={config.duration}
        colorMode={config.colorMode}
        radius={config.radius}
        iconColor={config.iconColor}
        border={config.borderEnabled ? { enabled: true } : undefined}
        swipeToDismiss={config.swipeToDismiss}
        pauseOnHover={config.pauseOnHover}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-semibold tracking-tight">notify</h1>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono">
              v1.0.0
            </span>
          </div>
          <nav className="hidden sm:flex items-center gap-4">
            <NavLink href="#quick-start">Quick Start</NavLink>
            <NavLink href="#playground">Playground</NavLink>
            <NavLink href="#api">API</NavLink>
            <NavLink href="#props">Props</NavLink>
            <NavLink href="#types">Types</NavLink>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-16">
        {/* Hero */}
        <div className="space-y-4 pt-4">
          <p className="text-sm text-white/50 leading-relaxed max-w-lg">
            A lightweight, chainable notification system for React with smooth animations, flexible theming, and a
            Sonner-like API. Place once, call anywhere.
          </p>
          <div className="flex gap-2">
            <button
              onClick={demos.success}
              className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/30 transition-colors ring-1 ring-emerald-500/30"
            >
              Try it
            </button>
            <button
              onClick={demos.chained}
              className="px-4 py-2 rounded-lg bg-white/5 text-white/70 text-sm font-medium hover:bg-white/10 transition-colors ring-1 ring-white/10"
            >
              See chaining
            </button>
          </div>
        </div>

        {/* Quick Start */}
        <Section
          id="quick-start"
          title="Quick Start"
          description="Two steps: add the Notifier component, then call notify() from anywhere in your app."
        >
          <div className="grid gap-4">
            <CodeBlock title="1. Add to your root layout">{`import { Notifier } from "@/module/notify"

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Notifier />
      </body>
    </html>
  )
}`}</CodeBlock>
            <CodeBlock title="2. Call from any component">{`import { notify } from "@/module/notify"

function MyComponent() {
  const handleSave = async () => {
    const n = notify.loading("Saving...")
    
    try {
      await saveData()
      n.success("Saved!")
    } catch (err) {
      n.error("Failed to save")
    }
  }
  
  return <button onClick={handleSave}>Save</button>
}`}</CodeBlock>
          </div>
        </Section>

        {/* Playground */}
        <Section
          id="playground"
          title="Playground"
          description="Configure appearance and behavior in real-time. Click any API example below to test."
        >
          <ConfigPanel config={config} onConfigChange={setConfig} />
          <CodeBlock title="Generated Notifier Props">{notifierCode}</CodeBlock>
        </Section>

        {/* API Reference */}
        <Section
          id="api"
          title="API Reference"
          description="All methods return a NotifyInstance for chaining. Static methods create new notifications."
        >
          <div className="space-y-6">
            {/* Basic Methods */}
            <div className="space-y-3">
              <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider">Basic Methods</h3>
              <div className="grid gap-3">
                <APICard
                  name="notify"
                  signature="(message: string, options?: NotifyOptions)"
                  description="Show an info notification. The simplest way to display a message."
                  returns="NotifyInstance"
                  example={`notify("New message received")

// With options
notify("File uploaded", { duration: 5000 })}`}
                  onTry={demos.basic}
                />
                <APICard
                  name="notify.loading"
                  signature="(message?: string)"
                  description="Show a loading notification with spinner. Perfect for async operations."
                  returns="NotifyInstance"
                  example={`notify.loading("Processing...")

// Chain to success/error when done
const n = notify.loading("Saving...")
await save()
n.success("Saved!")`}
                  onTry={demos.loading}
                />
                <APICard
                  name="notify.success"
                  signature="(message?: string)"
                  description="Show a success notification with checkmark icon."
                  returns="NotifyInstance"
                  example={`notify.success("Operation completed")`}
                  onTry={demos.success}
                />
                <APICard
                  name="notify.error"
                  signature="(message?: string)"
                  description="Show an error notification with error icon."
                  returns="NotifyInstance"
                  example={`notify.error("Something went wrong")`}
                  onTry={demos.error}
                />
                <APICard
                  name="notify.dismiss"
                  signature="(id?: string)"
                  description="Dismiss a specific notification by ID, or all notifications if no ID provided."
                  returns="void"
                  example={`// Dismiss all
notify.dismiss()

// Dismiss specific
const n = notify("Hello")
n.dismiss()}`}
                  onTry={() => notify.dismiss()}
                />
              </div>
            </div>

            {/* Advanced Methods */}
            <div className="space-y-3">
              <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider">Advanced Methods</h3>
              <div className="grid gap-3">
                <APICard
                  name="notify.promise"
                  signature="<T>(promise: Promise<T>, options: PromiseOptions)"
                  description="Track a promise with automatic state transitions. Shows loading, then success or error based on promise result."
                  returns="Promise<T>"
                  example={`const result = await notify.promise(
  fetchData(),
  {
    loading: "Fetching data...",
    success: "Data loaded!",
    error: "Failed to load"
  }
)`}
                  onTry={demos.promise}
                />
                <APICard
                  name="instance.confirm"
                  signature="(message: string, options?: ConfirmOptions)"
                  description="Show confirm/cancel buttons and wait for user response. Returns a Promise that resolves to true (confirmed) or false (cancelled)."
                  returns="Promise<boolean>"
                  example={`const n = notify({})
const confirmed = await n.confirm("Delete?", {
  confirmLabel: "Delete",
  cancelLabel: "Keep"
})

if (confirmed) {
  n.loading("Deleting...")
  await deleteItem()
  n.success("Deleted")
} else {
  n.dismiss()
}`}
                  onTry={demos.confirm}
                />
                <APICard
                  name="instance.update"
                  signature="(options: Partial<NotifyOptions>)"
                  description="Update notification options after creation. Useful for adding actions or changing behavior dynamically."
                  returns="NotifyInstance"
                  example={`const n = notify("File deleted")

// Add undo action after creation
n.update({
  action: {
    label: "Undo",
    onClick: () => n.success("Restored")
  }
})`}
                  onTry={demos.withAction}
                />
              </div>
            </div>

            {/* Chaining Examples */}
            <div className="space-y-3">
              <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider">Chaining Patterns</h3>
              <div className="grid gap-3">
                <APICard
                  name="State Transitions"
                  signature=""
                  description="Chain multiple state transitions on the same notification. The notification stays in place while content animates."
                  returns="NotifyInstance"
                  example={`// Basic chaining
const n = notify.loading("Saving...")
setTimeout(() => n.success("Done!"), 1500)

// Multi-step progress
const n = notify.loading("Step 1...")
setTimeout(() => n.loading("Step 2..."), 1000)
setTimeout(() => n.loading("Step 3..."), 2000)
setTimeout(() => n.success("Complete!"), 3000)`}
                  onTry={demos.update}
                />
                <APICard
                  name="Persistent Notifications"
                  signature=""
                  description="Set duration to 0 for notifications that don't auto-dismiss. Combine with actions for user-controlled dismissal."
                  returns="NotifyInstance"
                  example={`const n = notify("Important message", { 
  duration: 0 // Never auto-dismiss
})

n.update({
  action: {
    label: "Got it",
    onClick: () => n.dismiss()
  }
})`}
                  onTry={demos.persistent}
                />
              </div>
            </div>
          </div>
        </Section>

        {/* Props Reference */}
        <Section
          id="props"
          title="Notifier Props"
          description="Configure the Notifier component. All props are optional with sensible defaults."
        >
          <div className="space-y-6">
            {/* Behavior Props */}
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider">Behavior</h3>
              <PropsTable
                props={[
                  {
                    name: "position",
                    type: "NotifyPosition",
                    default: '"top"',
                    description:
                      "Where notifications appear on screen. Options: top, top-left, top-right, bottom, bottom-left, bottom-right",
                  },
                  {
                    name: "maxVisible",
                    type: "number",
                    default: "3",
                    description: "Maximum notifications shown at once. Oldest are dismissed when limit is reached.",
                  },
                  {
                    name: "duration",
                    type: "number",
                    default: "3000",
                    description: "Default auto-dismiss time in milliseconds. Set to 0 for persistent notifications.",
                  },
                  {
                    name: "swipeToDismiss",
                    type: "boolean",
                    default: "true",
                    description: "Allow users to swipe notifications away. Swipe direction matches entry direction.",
                  },
                  {
                    name: "pauseOnHover",
                    type: "boolean",
                    default: "true",
                    description: "Pause the auto-dismiss timer when user hovers over notification.",
                  },
                  {
                    name: "clickToDismiss",
                    type: "boolean",
                    default: "false",
                    description: "Dismiss notification when clicking anywhere on it (not just action buttons).",
                  },
                  {
                    name: "offset",
                    type: "number | {x, y}",
                    default: "16",
                    description: "Distance from screen edges in pixels. Use object for different x/y values.",
                  },
                  {
                    name: "gap",
                    type: "number",
                    default: "8",
                    description: "Spacing between stacked notifications in pixels.",
                  },
                ]}
              />
            </div>

            {/* Appearance Props */}
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider">Appearance</h3>
              <PropsTable
                props={[
                  {
                    name: "colorMode",
                    type: '"dark" | "light" | "auto"',
                    default: '"dark"',
                    description: "Color theme. 'auto' follows system preference using prefers-color-scheme.",
                  },
                  {
                    name: "radius",
                    type: '"pill" | "rounded" | "squared"',
                    default: '"pill"',
                    description: "Border radius style. Pill is fully rounded, squared has no rounding.",
                  },
                  {
                    name: "iconColor",
                    type: '"colored" | "neutral" | "hidden"',
                    default: '"colored"',
                    description:
                      "Icon coloring. Colored uses semantic colors, neutral is monochrome, hidden shows no icons except spinner.",
                  },
                  {
                    name: "border",
                    type: "BorderConfig",
                    default: "undefined",
                    description: "Border configuration object. See BorderConfig type below for options.",
                  },
                  {
                    name: "icons",
                    type: "IconConfig",
                    default: "undefined",
                    description:
                      "Custom icon configuration. Override default icons per state or provide a render function.",
                  },
                ]}
              />
            </div>

            {/* NotifyOptions */}
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider">
                NotifyOptions (per-notification)
              </h3>
              <PropsTable
                props={[
                  {
                    name: "message",
                    type: "string",
                    default: '""',
                    description: "The text to display in the notification.",
                  },
                  {
                    name: "duration",
                    type: "number",
                    default: "3000",
                    description: "Override default duration for this notification. Set to 0 to disable auto-dismiss.",
                  },
                  {
                    name: "action",
                    type: "NotifyAction",
                    default: "undefined",
                    description: "Action button with label and onClick handler. Button appears inline with message.",
                  },
                  {
                    name: "dismissible",
                    type: "boolean",
                    default: "true",
                    description: "Show a dismiss (X) button on the notification.",
                  },
                  {
                    name: "pauseOnHover",
                    type: "boolean",
                    default: "true",
                    description: "Override global pauseOnHover for this notification.",
                  },
                  {
                    name: "swipeToDismiss",
                    type: "boolean",
                    default: "true",
                    description: "Override global swipeToDismiss for this notification.",
                  },
                  {
                    name: "clickToDismiss",
                    type: "boolean",
                    default: "false",
                    description: "Override global clickToDismiss for this notification.",
                  },
                  {
                    name: "onOpen",
                    type: "(id: string) => void",
                    default: "undefined",
                    description: "Callback fired when notification opens and animation completes.",
                  },
                  {
                    name: "onClose",
                    type: "(id: string) => void",
                    default: "undefined",
                    description: "Callback fired when notification closes and exit animation completes.",
                  },
                  {
                    name: "onDismiss",
                    type: "(id: string, reason) => void",
                    default: "undefined",
                    description:
                      "Callback fired when dismissed. Reason: 'timeout' | 'swipe' | 'click' | 'manual' | 'replaced'",
                  },
                  {
                    name: "onUpdate",
                    type: "(id, newState, prevState) => void",
                    default: "undefined",
                    description: "Callback fired when notification state changes (e.g., loading -> success).",
                  },
                ]}
              />
            </div>
          </div>
        </Section>

        {/* Types Reference */}
        <Section
          id="types"
          title="Types Reference"
          description="TypeScript interfaces for advanced usage and customization."
        >
          <div className="grid gap-4">
            <TypeCard
              name="NotifyAction"
              description="Configuration for action buttons displayed inline with the notification message."
              properties={[
                { name: "label", type: "string", description: "Button text displayed to the user", required: true },
                {
                  name: "onClick",
                  type: "() => void",
                  description: "Handler called when button is clicked",
                  required: true,
                },
              ]}
            />

            <TypeCard
              name="ConfirmOptions"
              description="Options for the confirm dialog shown by instance.confirm()."
              properties={[
                { name: "confirmLabel", type: "string", description: "Text for confirm button. Default: 'Confirm'" },
                { name: "cancelLabel", type: "string", description: "Text for cancel button. Default: 'Cancel'" },
              ]}
            />

            <TypeCard
              name="PromiseOptions"
              description="Messages for each state when tracking a promise with notify.promise()."
              properties={[
                { name: "loading", type: "string", description: "Message shown while promise is pending" },
                { name: "success", type: "string", description: "Message shown when promise resolves" },
                {
                  name: "error",
                  type: "string | (err) => string",
                  description:
                    "Message shown when promise rejects. Can be a string or function to extract message from error.",
                },
              ]}
            />

            <TypeCard
              name="BorderConfig"
              description="Configuration for notification borders. Pass to the border prop on Notifier."
              properties={[
                { name: "enabled", type: "boolean", description: "Whether to show a border. Default: false" },
                { name: "width", type: "number", description: "Border width in pixels. Default: 1" },
                { name: "color", type: "string", description: "Border color as CSS value. Default: theme-based" },
                { name: "style", type: '"solid" | "dashed" | "dotted"', description: "Border style. Default: 'solid'" },
              ]}
            />

            <TypeCard
              name="IconConfig"
              description="Custom icon configuration. Override default icons per state or use a render function for full control."
              properties={[
                {
                  name: "loading",
                  type: "ReactNode",
                  description: "Custom loading icon (spinner always shown regardless)",
                },
                { name: "success", type: "ReactNode", description: "Custom success state icon" },
                { name: "error", type: "ReactNode", description: "Custom error state icon" },
                { name: "info", type: "ReactNode", description: "Custom info state icon" },
                { name: "confirm", type: "ReactNode", description: "Custom confirm state icon" },
                {
                  name: "render",
                  type: "(props: IconProps) => ReactNode",
                  description: "Full control render function. Receives state, colorMode, and size props.",
                },
              ]}
            />

            <TypeCard
              name="IconProps"
              description="Props passed to custom icon render function."
              properties={[
                {
                  name: "state",
                  type: "NotifyState",
                  description: "Current notification state: idle, loading, success, error, info, confirm",
                },
                {
                  name: "colorMode",
                  type: "IconColorMode",
                  description: "Current icon color mode: colored, neutral, or hidden",
                },
                { name: "size", type: "number", description: "Icon size in pixels (default: 18)" },
              ]}
            />

            <TypeCard
              name="NotifyInstance"
              description="Chainable instance returned by notify(). All methods return the instance for chaining except dismiss()."
              properties={[
                { name: "id", type: "string", description: "Unique identifier for this notification" },
                {
                  name: "loading",
                  type: "(msg?) => NotifyInstance",
                  description: "Transition to loading state with optional message",
                },
                {
                  name: "success",
                  type: "(msg?) => NotifyInstance",
                  description: "Transition to success state with optional message",
                },
                {
                  name: "error",
                  type: "(msg?) => NotifyInstance",
                  description: "Transition to error state with optional message",
                },
                { name: "dismiss", type: "() => void", description: "Dismiss this notification" },
                { name: "update", type: "(opts) => NotifyInstance", description: "Update options (e.g., add action)" },
                {
                  name: "promise",
                  type: "<T>(p, opts) => Promise<T>",
                  description: "Track promise with auto state transitions",
                },
                {
                  name: "confirm",
                  type: "(msg, opts) => Promise<boolean>",
                  description: "Show confirm/cancel and wait for response",
                },
              ]}
            />

            {/* Enum Types */}
            <div className="space-y-2 p-4 rounded-lg bg-white/[0.02] ring-1 ring-white/5">
              <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider mb-3">String Literal Types</h3>
              <div className="grid gap-3 text-xs">
                <div>
                  <code className="text-emerald-400">NotifyPosition</code>
                  <span className="text-white/30 ml-2">
                    "top" | "top-left" | "top-right" | "bottom" | "bottom-left" | "bottom-right"
                  </span>
                </div>
                <div>
                  <code className="text-emerald-400">NotifyState</code>
                  <span className="text-white/30 ml-2">
                    "idle" | "loading" | "success" | "error" | "info" | "confirm"
                  </span>
                </div>
                <div>
                  <code className="text-emerald-400">DismissReason</code>
                  <span className="text-white/30 ml-2">"timeout" | "swipe" | "click" | "manual" | "replaced"</span>
                </div>
                <div>
                  <code className="text-emerald-400">ColorMode</code>
                  <span className="text-white/30 ml-2">"dark" | "light" | "auto"</span>
                </div>
                <div>
                  <code className="text-emerald-400">RadiusVariant</code>
                  <span className="text-white/30 ml-2">"pill" | "rounded" | "squared"</span>
                </div>
                <div>
                  <code className="text-emerald-400">IconColorMode</code>
                  <span className="text-white/30 ml-2">"colored" | "neutral" | "hidden"</span>
                </div>
              </div>
            </div>
          </div>
        </Section>

        <Section
          id="examples"
          title="Configuration Examples"
          description="Common configuration patterns for borders and custom icons."
        >
          <div className="grid gap-4">
            <CodeBlock title="Border Configuration">{`// Simple border
<Notifier border={{ enabled: true }} />

// Custom border styling
<Notifier
  border={{
    enabled: true,
    width: 2,
    color: "rgba(255, 255, 255, 0.1)",
    style: "solid"
  }}
/>

// Dashed border with custom color
<Notifier
  border={{
    enabled: true,
    width: 1,
    color: "#3b82f6",
    style: "dashed"
  }}
/>`}</CodeBlock>

            <CodeBlock title="Icon Configuration">{`// Neutral (monochrome) icons
<Notifier iconColor="neutral" />

// Hidden icons (only spinner shows for loading)
<Notifier iconColor="hidden" />

// Custom icons per state
<Notifier
  icons={{
    success: <CheckCircle className="w-4 h-4" />,
    error: <XCircle className="w-4 h-4" />,
    info: <Info className="w-4 h-4" />,
  }}
/>

// Full control with render function
<Notifier
  icons={{
    render: ({ state, colorMode, size }) => {
      if (state === "loading") return <Loader2 className="animate-spin" />
      if (state === "success") return <Check />
      if (state === "error") return <AlertCircle />
      return <Info />
    }
  }}
/>`}</CodeBlock>

            <CodeBlock title="Complete Theme Example">{`// Light mode with rounded corners and borders
<Notifier
  colorMode="light"
  radius="rounded"
  iconColor="colored"
  border={{ enabled: true, color: "rgba(0,0,0,0.1)" }}
  position="bottom-right"
  maxVisible={5}
  duration={4000}
/>

// Minimal dark theme
<Notifier
  colorMode="dark"
  radius="squared"
  iconColor="neutral"
  position="top"
  swipeToDismiss={false}
/>`}</CodeBlock>

            <CodeBlock title="Callbacks Example">{`// Per-notification callbacks
notify("File saved", {
  onOpen: (id) => console.log("Opened:", id),
  onClose: (id) => console.log("Closed:", id),
  onDismiss: (id, reason) => {
    console.log(\`Dismissed: \${id}, reason: \${reason}\`)
    // reason: "timeout" | "swipe" | "click" | "manual"
  },
  onUpdate: (id, newState, prevState) => {
    console.log(\`State: \${prevState} -> \${newState}\`)
  }
})`}</CodeBlock>
          </div>
        </Section>

        {/* Footer */}
        <footer className="pt-8 border-t border-white/5">
          <p className="text-xs text-white/30 text-center">Built with React, Framer Motion, and TypeScript</p>
        </footer>
      </main>
    </div>
  )
}
