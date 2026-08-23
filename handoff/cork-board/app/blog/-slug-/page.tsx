// app/blog/[slug]/page.tsx

import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { MDXRemote } from "next-mdx-remote/rsc"
import { getAllPosts, getPostBySlug } from "@/lib/blog"
import { splitSheets, estimateSheetHeight } from "@/lib/sheets"
import { pinsFor, pinHeight } from "@/lib/boardAttachments"
import { rotationFor } from "@/lib/board"
import BoardFrame from "@/components/board/BoardFrame"
import StapledSheet from "@/components/board/StapledSheet"
import PinnedAttachment from "@/components/board/PinnedAttachment"

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

  let y = 66
  const laid = sheets.map((s, i) => {
    const at = y
    y += estimateSheetHeight(s) + 34
    return { sheet: s, y: at, x: 160 + ((i * 17) % 36), rotate: rotationFor(slug + i, 0.9) }
  })

  const height = Math.max(y + 40, ...pins.map((p) => p.y + pinHeight(p) + 44))

  return (
    <main className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 pt-28 pb-24">
      <BoardFrame title={meta.title} height={height} stickyRotate={2.2} clip>
        <div style={{ position: "absolute", left: 46, top: 24, fontFamily: MONO, fontSize: 12, letterSpacing: "0.12em", color: "rgba(255,244,224,0.8)", zIndex: 6 }}>
          <Link href="/blog" style={{ color: "inherit", textDecoration: "none" }}>← ALL POSTS</Link>
        </div>

        {laid.map((l, i) => (
          <StapledSheet
            key={i}
            board={board}
            id={`sheet-${i}`}
            x={l.x}
            y={l.y}
            rotate={l.rotate}
            eyebrow={i === 0 ? "POST" : l.sheet.eyebrow}
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
                  <div style={{ display: "flex", gap: 18, margin: "16px 0 20px", fontFamily: MONO, fontSize: 11, letterSpacing: "0.1em", color: "#8a6a3d" }}>
                    <span>{date}</span>
                    {meta.tags.map((t) => (
                      <span key={t}>[ {t} ]</span>
                    ))}
                  </div>
                </>
              ) : undefined
            }
          >
            <MDXRemote source={l.sheet.body} />
          </StapledSheet>
        ))}

        {pins.map((pin) => (
          <PinnedAttachment key={pin.id} board={board} pin={pin} draggable={false} />
        ))}
      </BoardFrame>
    </main>
  )
}
