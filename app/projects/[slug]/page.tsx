import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ExternalLink } from "lucide-react"
import { MDXRemote } from "next-mdx-remote/rsc"
import { getAllProjects, getProjectBySlug } from "@/lib/projects"
import GithubIcon from "@/components/ui/GithubIcon"

export async function generateStaticParams() {
  const projects = await getAllProjects()
  return projects.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const result = await getProjectBySlug(slug)
  if (!result) return {}
  return { title: result.meta.title, description: result.meta.description }
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const result = await getProjectBySlug(slug)
  if (!result) notFound()

  const { meta, content } = result

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-28 pb-24">
      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 mb-10 transition-colors"
      >
        <ArrowLeft size={14} />
        All projects/experience
      </Link>

      <header className="mb-8">
        <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
          {meta.title}
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mb-6 leading-relaxed">
          {meta.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {meta.tech.map((t) => (
            <span
              key={t}
              className="text-sm px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
            >
              {t}
            </span>
          ))}
        </div>

        <div className="flex gap-3">
          {meta.githubUrl && (
            <a
              href={meta.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 text-sm text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors"
            >
              <GithubIcon size={15} />
              View on GitHub
            </a>
          )}
          {meta.liveUrl && (
            <a
              href={meta.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-sm hover:opacity-80 transition-opacity"
            >
              <ExternalLink size={15} />
              Live site
            </a>
          )}
        </div>
      </header>

      <article className="prose prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-base prose-neutral dark:prose-invert max-w-none prose-a:text-blue-500 prose-headings:font-semibold prose-headings:text-neutral-900 dark:prose-headings:text-neutral-100 prose-p:text-neutral-600 dark:prose-p:text-neutral-400 prose-code:text-neutral-800 dark:prose-code:text-neutral-200 prose-pre:bg-neutral-100 dark:prose-pre:bg-neutral-900">
        <MDXRemote source={content} />
      </article>
    </main>
  )
}
