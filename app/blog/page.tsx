import type { Metadata } from "next"
import { getAllPosts } from "@/lib/blog"
import BlogList from "@/components/sections/BlogList"

export const metadata: Metadata = {
  title: "Blog",
  description: "Writing about software engineering, projects, and things I'm learning.",
}

export default async function BlogPage() {
  const posts = await getAllPosts()

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-24">
      <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
        Blog
      </h1>
      <p className="text-neutral-500 dark:text-neutral-400 mb-12">
        Writing about software, side projects, and things I find interesting.
      </p>
      <BlogList posts={posts} />
    </main>
  )
}
