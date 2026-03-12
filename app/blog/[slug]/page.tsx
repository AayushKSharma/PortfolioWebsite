import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { MDXRemote } from "next-mdx-remote/rsc"
import { getAllPosts, getPostBySlug } from "@/lib/blog"

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const result = await getPostBySlug(slug)
  if (!result) return {}
  return { title: result.meta.title, description: result.meta.excerpt }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const result = await getPostBySlug(slug)
  if (!result) notFound()

  const { meta, content } = result

  const date = new Date(meta.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-28 pb-24">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 mb-10 transition-colors"
      >
        <ArrowLeft size={14} />
        All posts
      </Link>

      <header className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <time className="text-sm text-neutral-400 dark:text-neutral-500">{date}</time>
          {meta.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
            >
              {tag}
            </span>
          ))}
        </div>
        <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100">
          {meta.title}
        </h1>
      </header>

      <article className="prose prose-neutral dark:prose-invert max-w-none prose-a:text-blue-500 prose-headings:font-semibold prose-headings:text-neutral-900 dark:prose-headings:text-neutral-100 prose-p:text-neutral-600 dark:prose-p:text-neutral-400 prose-code:text-neutral-800 dark:prose-code:text-neutral-200 prose-pre:bg-neutral-100 dark:prose-pre:bg-neutral-900">
        <MDXRemote source={content} />
      </article>
    </main>
  )
}
