// app/projects/[slug]/page.tsx

import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { MDXRemote } from "next-mdx-remote/rsc"
import { getAllProjects, getProjectBySlug } from "@/lib/projects"
import { splitSheets, estimateSheetHeight } from "@/lib/sheets"
import { pinsFor, pinHeight } from "@/lib/boardAttachments"
import { rotationFor } from "@/lib/board"
import BoardFrame from "@/components/board/BoardFrame"
import StapledSheet from "@/components/board/StapledSheet"
import PinnedAttachment from "@/components/board/PinnedAttachment"

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

  // stack the sheets: staggered left edges, sub-1° rotations
  let y = 66
  const laid = sheets.map((s, i) => {
    const at = y
    y += estimateSheetHeight(s) + 34
    return { sheet: s, y: at, x: 160 + ((i * 17) % 36), rotate: rotationFor(slug + i, 0.9) }
  })

  const height = Math.max(y + 40, ...pins.map((p) => p.y + pinHeight(p) + 44))

  return (
    <main className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 pt-28 pb-24">
      <BoardFrame title={meta.title} height={height} stickyRotate={-2.4} clip>
        <div style={{ position: "absolute", left: 46, top: 24, fontFamily: MONO, fontSize: 12, letterSpacing: "0.12em", color: "rgba(255,244,224,0.8)", zIndex: 6 }}>
          <Link href="/projects" style={{ color: "inherit", textDecoration: "none" }}>
            ← ALL PROJECTS / EXPERIENCE
          </Link>
        </div>

        {laid.map((l, i) => (
          <StapledSheet
            key={i}
            board={board}
            id={`sheet-${i}`}
            x={l.x}
            y={l.y}
            rotate={l.rotate}
            eyebrow={i === 0 ? `PROJECT · WRITE-UP` : l.sheet.eyebrow}
            heading={i === 0 ? undefined : l.sheet.heading}
            page={i + 1}
            pages={laid.length}
            fade={i === laid.length - 1}
            lead={
              i === 0 ? (
                <>
                  <div style={{ margin: "16px 0 0", fontFamily: "Excalifont, cursive", fontSize: 40, lineHeight: 1.14, color: "var(--cork-ink)" }}>
                    {meta.title}
                  </div>
                  <div style={{ margin: "16px 0 20px", fontFamily: MONO, fontSize: 13.5, lineHeight: 1.85, color: "var(--cork-ink2)" }}>
                    {meta.description}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 24, fontFamily: MONO, fontSize: 11, color: "#6b563c", letterSpacing: "0.06em" }}>
                    {meta.tech.map((t) => (
                      <span key={t}>[ {t} ]</span>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 24, paddingTop: 14, borderTop: "1px solid rgba(52,40,24,0.22)", fontFamily: MONO, fontSize: 12, letterSpacing: "0.1em", color: "var(--cork-ink)" }}>
                    {meta.githubUrl && (
                      <a href={meta.githubUrl} target="_blank" rel="noopener noreferrer" style={{ color: "inherit" }}>VIEW ON GITHUB →</a>
                    )}
                    {meta.liveUrl && (
                      <a href={meta.liveUrl} target="_blank" rel="noopener noreferrer" style={{ color: "inherit" }}>LIVE SITE ↗</a>
                    )}
                  </div>
                </>
              ) : undefined
            }
          >
            {i === 0 ? null : <MDXRemote source={l.sheet.body} />}
          </StapledSheet>
        ))}

        {pins.map((pin) => (
          <PinnedAttachment key={pin.id} board={board} pin={pin} draggable={false} />
        ))}
      </BoardFrame>
    </main>
  )
}
