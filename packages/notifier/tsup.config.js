import { defineConfig } from 'tsup'

export default defineConfig({
    entry: [
        'src/index.tsx',
        'src/compat/sonner/index.tsx',
        'src/compat/react-hot-toast/index.tsx',
        'src/compat/shadcn/index.tsx'
    ],
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    clean: true,
    external: ['react', 'react-dom', 'motion'],
    esbuildOptions(options) {
        options.banner = {
            js: '"use client";'
        }
    }
})
