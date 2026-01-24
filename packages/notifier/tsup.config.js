import { defineConfig } from "tsup"

export default defineConfig({
  entry: [
    "src/index.tsx",
    "src/compat/sonner/index.ts",
    "src/compat/react-hot-toast/index.ts",
    "src/compat/shadcn/index.ts"
  ],
  format: ["cjs", "esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom", "motion"],
  esbuildOptions(options) {
    options.banner = {
      js: '"use client";',
    }
  },
})
