import type { Metadata } from "next"
import { getAllProjects } from "@/lib/projects"
import ProjectsBoard from "@/components/sections/ProjectsBoard"
import BoardStage from "@/components/board/BoardStage"

export const metadata: Metadata = {
  title: "Projects & Experience",
  description: "A selection of projects I've built and my experience.",
}

export default async function ProjectsPage() {
  const projects = await getAllProjects()

  return (
    <main className="mx-auto w-full max-w-[1280px] px-[14px] sm:px-6 pt-8 sm:pt-12 pb-24">
      <BoardStage>
        <ProjectsBoard projects={projects} />
      </BoardStage>
    </main>
  )
}
