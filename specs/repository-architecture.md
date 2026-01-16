# Repository Architecture Restructure

**Goal:** Transition from a hybrid "Root = App" structure to a clean "Standard Monorepo" layout.

## 1. Current State (Hybrid)
- **Root:** Contains Next.js app files (`next.config.mjs`, `public/`, `module/`) PLUS workspace config.
- **`apps/app`:** Contains page components but not the app shell.
- **Issues:** Confusing structure, `module` alias is brittle, root is cluttered.

## 2. Target State (Standard Monorepo)

```
/
├── package.json          # Workspace Root (No Next.js dependencies)
├── turbo.json           # Turborepo config (optional/future)
├── apps/
│   └── web/             # comprehensive Next.js Application
│       ├── package.json
│       ├── next.config.mjs
│       ├── tsconfig.json
│       ├── public/      # Moved from root
│       └── src/
│           └── app/     # Moved from apps/app
└── packages/
    ├── notifier/        # The library
    └── release-cli/     # The CLI
```

## 3. Migration Steps

### A. Create `apps/web`
1. Initialize new directory.
2. Move `public/` from root to `apps/web/public`.
3. Move `next.config.mjs`, `next-env.d.ts`, `postcss.config.mjs`, `tailwind.config.ts` to `apps/web`.
4. Move `apps/app/*` content to `apps/web/src/app`.

### B. Clean Root
1. Delete `module/` folder.
2. Remove Next.js dependencies from root `package.json`.
3. Ensure root `package.json` has `workspaces: ["apps/*", "packages/*"]`.

### C. Configure `apps/web`
1. Create `apps/web/package.json` with moved dependencies.
2. Update `tsconfig.json` in `apps/web` to resolve `@remcostoeten/notifier` via paths or workspace linking.

### D. Verify
1. Run `bun install`.
2. Run `bun --filter web dev`.

## 4. DX Improvements
- **Clear Separation:** "Where is the app?" -> `apps/web`. "Where is the lib?" -> `packages/notifier`.
- **Standard Imports:** App imports library like a consumer: `import { notify } from "@remcostoeten/notifier"`.
- **Scalable:** Easy to add `apps/docs` or `apps/storybook` later without polluting root.
