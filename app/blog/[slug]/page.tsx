import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getAllPosts, getPostBySlug } from "@/lib/blog"
import { splitSheets } from "@/lib/sheets"
import { pinsFor } from "@/lib/boardAttachments"
import BoardStage from "@/components/board/BoardStage"
import WriteupBoard from "@/components/sections/WriteupBoard"

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const result = await getPostBySlug(slug)
  if (!result) return {}
  return { title: result.meta.title, description: result.meta.excerpt }
}

const MONO = "Cascadia, ui-monospace, monospace"

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const result = await getPostBySlug(slug)
  if (!result) notFound()

  const { meta, content } = result
  const date = meta.date
    ? new Date(meta.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : ""

  const sheets = splitSheets(content)
  const board = `blog:${slug}`
  const pins = pinsFor(board)

  return (
    <main className="mx-auto w-full max-w-[1280px] px-[14px] sm:px-6 pt-8 sm:pt-12 pb-24">
      <BoardStage>
        <WriteupBoard
          board={board}
          title={meta.title}
          backHref="/blog"
          stickyRotate={2.2}
          sheets={sheets}
          pins={pins}
          leadEyebrow="POST"
          lead={(compact) => (
            <>
              <div style={{ margin: compact ? "10px 0 0" : "16px 0 0", fontFamily: "Excalifont, cursive", fontSize: compact ? 26 : 40, lineHeight: 1.14, color: "var(--cork-ink)" }}>
                {meta.title}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: compact ? 12 : 18, margin: compact ? "12px 0 16px" : "16px 0 20px", fontFamily: MONO, fontSize: compact ? 10.5 : 11, letterSpacing: "0.1em", color: "var(--cork-ink3)" }}>
                {date ? <span>{date}</span> : null}
                {meta.tags.map((t) => (
                  <span key={t}>[ {t} ]</span>
                ))}
              </div>
            </>
          )}
        />
      </BoardStage>
    </main>
  )
}
