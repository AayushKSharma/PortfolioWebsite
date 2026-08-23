import type { NextConfig } from "next"
import path from "path"

const nextConfig: NextConfig = {
  transpilePackages: ["next-mdx-remote"],
  // Turbopack + Tailwind v4 can serve a stale globals.css chunk (same URL,
  // old yellow hover rule, etc.). Dev uses webpack via `next dev --webpack`.
  experimental: {
    turbopackFileSystemCacheForDev: false,
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/,
      }
    }
    return config
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
}

export default nextConfig
