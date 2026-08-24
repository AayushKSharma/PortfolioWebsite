import type { Metadata } from "next"
import { getAllProjects } from "@/lib/projects"
import ProjectsBoard from "@/components/sections/ProjectsBoard"
import ProjectsGrid from "@/components/sections/ProjectsGrid"
import Skills from "@/components/sections/Skills"
import BoardSwitch from "@/components/board/BoardSwitch"
import BoardStage, { MobileChrome } from "@/components/board/BoardStage"

export const metadata: Metadata = {
  title: "Projects & Experience",
  description: "A selection of projects I've built and my experience.",
}

export default async function ProjectsPage() {
  const projects = await getAllProjects()

  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 pt-12 pb-24">
      <BoardSwitch
        board={
          <BoardStage>
            <ProjectsBoard projects={projects} />
          </BoardStage>
        }
        fallback={
          <>
            <MobileChrome backHref="/" backLabel="Home" />
            <ProjectsGrid projects={projects} />
            <Skills />
          </>
        }
      />
    </main>
  )
}
