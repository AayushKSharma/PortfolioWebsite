"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import BlogCard from "@/components/ui/BlogCard"
import type { BlogPost } from "@/lib/blog"

export default function BlogList({ posts }: { posts: BlogPost[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })

  if (posts.length === 0) {
    return (
      <p className="text-neutral-500 dark:text-neutral-400 text-sm">
        No posts yet — check back soon.
      </p>
    )
  }

  return (
    <div ref={ref} className="flex flex-col gap-4">
      {posts.map((post, i) => (
        <motion.div
          key={post.slug}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: i * 0.08, duration: 0.5, ease: "easeOut" }}
        >
          <BlogCard post={post} />
        </motion.div>
      ))}
    </div>
  )
}
