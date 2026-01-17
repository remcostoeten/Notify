/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@remcostoeten/notifier'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
