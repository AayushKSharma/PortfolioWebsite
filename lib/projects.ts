import fs from "fs"
import path from "path"
import matter from "gray-matter"

const PROJECTS_DIR = path.join(process.cwd(), "content/projects")

export type Project = {
  slug: string
  title: string
  description: string
  tech: string[]
  githubUrl?: string
  liveUrl?: string
  featured: boolean
}

export async function getAllProjects(): Promise<Project[]> {
  if (!fs.existsSync(PROJECTS_DIR)) return []

  const files = fs.readdirSync(PROJECTS_DIR).filter((f) => f.endsWith(".mdx"))

  return files.map((file) => {
    const slug = file.replace(/\.mdx$/, "")
    const raw = fs.readFileSync(path.join(PROJECTS_DIR, file), "utf-8")
    const { data } = matter(raw)

    return {
      slug,
      title: data.title ?? slug,
      description: data.description ?? "",
      tech: data.tech ?? [],
      githubUrl: data.githubUrl,
      liveUrl: data.liveUrl,
      featured: data.featured ?? false,
    } satisfies Project
  })
}

export async function getProjectBySlug(
  slug: string
): Promise<{ meta: Project; content: string } | null> {
  const filePath = path.join(PROJECTS_DIR, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null

  const raw = fs.readFileSync(filePath, "utf-8")
  const { data, content } = matter(raw)

  return {
    meta: {
      slug,
      title: data.title ?? slug,
      description: data.description ?? "",
      tech: data.tech ?? [],
      githubUrl: data.githubUrl,
      liveUrl: data.liveUrl,
      featured: data.featured ?? false,
    },
    content,
  }
}
