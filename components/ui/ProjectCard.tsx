import Link from "next/link"
import type { Project } from "@/lib/projects"

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block rounded-2xl border border-[var(--island-border)] bg-[var(--island)] p-6 hover:border-[var(--island-border-hover)] transition-colors"
    >
      <h3 className="font-semibold text-neutral-950 dark:text-neutral-100 mb-2 group-hover:text-blue-800 dark:group-hover:text-blue-500 transition-colors">
        {project.title}
      </h3>
      <p className="text-sm text-neutral-800 dark:text-neutral-400 mb-4 leading-relaxed">
        {project.description}
      </p>
      <div className="flex flex-wrap gap-2">
        {project.tech.map((t) => (
          <span
            key={t}
            className="text-xs px-2.5 py-1 rounded-full bg-[var(--chip)] text-neutral-800 dark:text-neutral-400"
          >
            {t}
          </span>
        ))}
      </div>
    </Link>
  )
}
