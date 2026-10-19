import path from 'node:path'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    reactCompiler: true,
    typedRoutes: true,
    turbopack: {
        root: path.join(__dirname, '../..')
    },
    experimental: {
        inlineCss: true
    }
}

export default nextConfig
