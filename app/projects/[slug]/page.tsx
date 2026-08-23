import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ExternalLink } from "lucide-react"
import { MDXRemote } from "next-mdx-remote/rsc"
import { getAllProjects, getProjectBySlug } from "@/lib/projects"
import { splitSheets, estimateSheetHeight } from "@/lib/sheets"
import { pinsFor, pinHeight } from "@/lib/boardAttachments"
import { rotationFor } from "@/lib/board"
import BoardFrame from "@/components/board/BoardFrame"
import StapledSheet from "@/components/board/StapledSheet"
import PinnedAttachment from "@/components/board/PinnedAttachment"
import BoardSwitch from "@/components/board/BoardSwitch"
import GithubIcon from "@/components/ui/GithubIcon"
import type { Project } from "@/lib/projects"

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

  let y = 66
  const laid = sheets.map((s, i) => {
    const at = y
    y += estimateSheetHeight(s) + 34
    return { sheet: s, y: at, x: 160 + ((i * 17) % 36), rotate: rotationFor(slug + i, 0.9) }
  })

  const height = Math.max(y + 40, ...pins.map((p) => p.y + pinHeight(p) + 44))

  return (
    <BoardSwitch
      board={
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
                {i === 0 && l.sheet.heading ? (
                  <h2>{l.sheet.heading}</h2>
                ) : null}
                {l.sheet.body ? <MDXRemote source={l.sheet.body} /> : null}
              </StapledSheet>
            ))}

            {pins.map((pin) => (
              <PinnedAttachment key={pin.id} board={board} pin={pin} draggable={false} />
            ))}
          </BoardFrame>
        </main>
      }
      fallback={<ProjectArticle meta={meta} content={content} />}
    />
  )
}

function ProjectArticle({ meta, content }: { meta: Project; content: string }) {
  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-28 pb-24">
      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 text-sm text-neutral-800 hover:text-neutral-950 dark:hover:text-neutral-100 mb-10 transition-colors"
      >
        <ArrowLeft size={14} />
        All projects/experience
      </Link>

      <header className="mb-8">
        <h1 className="text-4xl font-bold text-neutral-950 dark:text-neutral-100 mb-3">
          {meta.title}
        </h1>
        <p className="text-neutral-800 dark:text-neutral-400 mb-6 leading-relaxed">
          {meta.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {meta.tech.map((t) => (
            <span
              key={t}
              className="text-sm px-3 py-1 rounded-full bg-[var(--chip)] text-neutral-900 dark:text-neutral-300"
            >
              {t}
            </span>
          ))}
        </div>

        <div className="flex gap-3">
          {meta.githubUrl && (
            <a
              href={meta.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--island-border)] text-sm text-neutral-900 dark:text-neutral-300 hover:border-[var(--island-border-hover)] transition-colors"
            >
              <GithubIcon size={15} />
              View on GitHub
            </a>
          )}
          {meta.liveUrl && (
            <a
              href={meta.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-sm hover:opacity-80 transition-opacity"
            >
              <ExternalLink size={15} />
              Live site
            </a>
          )}
        </div>
      </header>

      <article className="prose prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-base prose-neutral dark:prose-invert max-w-none prose-a:text-blue-800 dark:prose-a:text-blue-500 prose-headings:font-semibold prose-headings:text-neutral-950 dark:prose-headings:text-neutral-100 prose-p:text-neutral-800 dark:prose-p:text-neutral-400 prose-li:text-neutral-800 dark:prose-p:text-neutral-400 prose-code:text-neutral-950 dark:prose-code:text-neutral-200 prose-pre:bg-[var(--chip)]">
        <MDXRemote source={content} />
      </article>
    </main>
  )
}
