import type { Metadata } from "next"
import { getAllProjects } from "@/lib/projects"
import ProjectsGrid from "@/components/sections/ProjectsGrid"
import Skills from "@/components/sections/Skills"

export const metadata: Metadata = {
  title: "Projects & Experience",
  description: "A selection of projects I've built and my experience.",
}

export default async function ProjectsPage() {
  const projects = await getAllProjects()

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-24">
      <ProjectsGrid projects={projects} />
      <Skills />
    </main>
  )
}
