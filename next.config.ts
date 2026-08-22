import type { NextConfig } from "next"
import path from "path"

const nextConfig: NextConfig = {
  transpilePackages: ["next-mdx-remote"],
  turbopack: {
    root: path.resolve(__dirname),
  },
}

export default nextConfig
