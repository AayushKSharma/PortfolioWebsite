import type { Metadata } from "next"
import { getAllPosts } from "@/lib/blog"
import BlogBoard from "@/components/sections/BlogBoard"
import BoardStage from "@/components/board/BoardStage"

export const metadata: Metadata = {
  title: "Blog",
  description: "Writing about software engineering, projects, and things I'm learning.",
}

export default async function BlogPage() {
  const posts = await getAllPosts()

  return (
    <main className="mx-auto w-full max-w-[1280px] px-[14px] sm:px-6 pt-8 sm:pt-12 pb-24">
      <BoardStage>
        <BlogBoard posts={posts} />
      </BoardStage>
    </main>
  )
}
