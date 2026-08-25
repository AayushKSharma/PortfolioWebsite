import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getAllProjects, getProjectBySlug } from "@/lib/projects"
import { splitSheets } from "@/lib/sheets"
import { pinsFor } from "@/lib/boardAttachments"
import BoardStage from "@/components/board/BoardStage"
import WriteupBoard from "@/components/sections/WriteupBoard"

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

const MONO = "Cascadia, ui-monospace, monospace"

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const result = await getProjectBySlug(slug)
  if (!result) notFound()

  const { meta, content } = result
  const sheets = splitSheets(content)
  const board = `project:${slug}`
  const pins = pinsFor(board)

  return (
    <main className="mx-auto w-full max-w-[1280px] px-[14px] sm:px-6 pt-8 sm:pt-12 pb-24">
      <BoardStage>
        <WriteupBoard
          board={board}
          title={meta.title}
          backHref="/projects"
          stickyRotate={-2.4}
          sheets={sheets}
          pins={pins}
          leadEyebrow="PROJECT · WRITE-UP"
          firstSheetAsProseHeading
          lead={(compact) => (
            <>
              <div style={{ margin: compact ? "10px 0 0" : "16px 0 0", fontFamily: "Excalifont, cursive", fontSize: compact ? 26 : 40, lineHeight: 1.14, color: "var(--cork-ink)" }}>
                {meta.title}
              </div>
              <div style={{ margin: compact ? "12px 0 16px" : "16px 0 20px", fontFamily: MONO, fontSize: compact ? 13 : 13.5, lineHeight: 1.85, color: "var(--cork-ink2)" }}>
                {meta.description}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: compact ? 10 : 14, marginBottom: compact ? 18 : 24, fontFamily: MONO, fontSize: 11, color: "var(--cork-ink3)", letterSpacing: "0.06em" }}>
                {meta.tech.map((t) => (
                  <span key={t}>[ {t} ]</span>
                ))}
              </div>
              {(meta.githubUrl || meta.liveUrl) && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: compact ? 16 : 24, paddingTop: 14, borderTop: "1px solid var(--cork-rule)", fontFamily: MONO, fontSize: compact ? 11 : 12, letterSpacing: "0.1em", color: "var(--cork-ink)" }}>
                  {meta.githubUrl && (
                    <a href={meta.githubUrl} target="_blank" rel="noopener noreferrer" style={{ color: "inherit" }}>VIEW ON GITHUB →</a>
                  )}
                  {meta.liveUrl && (
                    <a href={meta.liveUrl} target="_blank" rel="noopener noreferrer" style={{ color: "inherit" }}>LIVE SITE ↗</a>
                  )}
                </div>
              )}
            </>
          )}
        />
      </BoardStage>
    </main>
  )
}
