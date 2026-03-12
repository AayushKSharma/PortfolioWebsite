import Link from "next/link"
import type { Project } from "@/lib/projects"

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors"
    >
      <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2 group-hover:text-blue-500 transition-colors">
        {project.title}
      </h3>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 leading-relaxed">
        {project.description}
      </p>
      <div className="flex flex-wrap gap-2">
        {project.tech.map((t) => (
          <span
            key={t}
            className="text-xs px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
          >
            {t}
          </span>
        ))}
      </div>
    </Link>
  )
}
