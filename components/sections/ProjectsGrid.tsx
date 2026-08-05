"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import ProjectCard from "@/components/ui/ProjectCard"
import type { Project } from "@/lib/projects"

export default function ProjectsGrid({ projects }: { projects: Project[] }) {
  const ref = useRef<HTMLDivElement>(null) // Ref to the root div element, react document.getElementById analogue 
  const inView = useInView(ref, { once: true, margin: "-80px" }) // Check if the root div is in view`

  return (
    <div ref={ref}> // Root div element
      <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">
        Projects & Experience
      </h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {projects.map((project, i) => (
          <motion.div
            key={project.slug}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.08, duration: 0.5, ease: "easeOut" }}
          > // handles fade in animation when in and out of view
            <ProjectCard project={project} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
