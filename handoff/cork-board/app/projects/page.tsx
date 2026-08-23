// app/projects/page.tsx

import type { Metadata } from "next"
import { getAllProjects } from "@/lib/projects"
import ProjectsBoard from "@/components/sections/ProjectsBoard"
import Skills from "@/components/sections/Skills"

export const metadata: Metadata = {
  title: "Projects & Experience",
  description: "A selection of projects I've built and my experience.",
}

export default async function ProjectsPage() {
  const projects = await getAllProjects()

  return (
    <main className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 pt-28 pb-24">
      <ProjectsBoard projects={projects} />
      <Skills />
    </main>
  )
}
