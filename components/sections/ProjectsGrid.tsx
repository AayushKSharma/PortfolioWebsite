"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import ProjectCard from "@/components/ui/ProjectCard"
import type { Project } from "@/lib/projects"

export default function ProjectsGrid({ projects }: { projects: Project[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <div ref={ref}>
      <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">
        Projects
      </h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {projects.map((project, i) => (
          <motion.div
            key={project.slug}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.08, duration: 0.5, ease: "easeOut" }}
          >
            <ProjectCard project={project} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
