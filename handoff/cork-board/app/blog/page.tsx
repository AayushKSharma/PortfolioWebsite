// app/blog/page.tsx
//
// The sticky note is the page title now, so the old h1 + intro paragraph go.

import type { Metadata } from "next"
import { getAllPosts } from "@/lib/blog"
import BlogBoard from "@/components/sections/BlogBoard"

export const metadata: Metadata = {
  title: "Blog",
  description: "Writing about software engineering, projects, and things I'm learning.",
}

export default async function BlogPage() {
  const posts = await getAllPosts()

  return (
    <main className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 pt-28 pb-24">
      <BlogBoard posts={posts} />
    </main>
  )
}
