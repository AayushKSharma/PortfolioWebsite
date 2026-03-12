import Link from "next/link"
import type { BlogPost } from "@/lib/blog"

export default function BlogCard({ post }: { post: BlogPost }) {
  const date = new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors"
    >
      <div className="flex items-center gap-2 mb-3">
        <time className="text-xs text-neutral-400 dark:text-neutral-500">{date}</time>
        {post.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
          >
            {tag}
          </span>
        ))}
      </div>
      <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2 group-hover:text-blue-500 transition-colors">
        {post.title}
      </h3>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
        {post.excerpt}
      </p>
    </Link>
  )
}
