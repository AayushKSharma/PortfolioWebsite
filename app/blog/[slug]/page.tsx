import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { MDXRemote } from "next-mdx-remote/rsc"
import { getAllPosts, getPostBySlug } from "@/lib/blog"
import { splitSheets, estimateSheetHeight } from "@/lib/sheets"
import { pinsFor, pinHeight } from "@/lib/boardAttachments"
import { rotationFor } from "@/lib/board"
import BoardFrame from "@/components/board/BoardFrame"
import StapledSheet from "@/components/board/StapledSheet"
import PinnedAttachment from "@/components/board/PinnedAttachment"
import BoardSwitch from "@/components/board/BoardSwitch"
import BoardStage, { MobileChrome } from "@/components/board/BoardStage"
import { mdxComponents } from "@/components/mdx"
import type { BlogPost } from "@/lib/blog"

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
    y += estimateSheetHeight(s, 864, i === 0 ? 240 : 0) + 56
    return { sheet: s, y: at, x: 160 + ((i * 17) % 36), rotate: rotationFor(slug + i, 0.9) }
  })

  const height = Math.max(y + 40, ...pins.map((p) => p.y + pinHeight(p) + 44))

  return (
    <BoardSwitch
      board={
        <main className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 pt-12 pb-24">
          <BoardStage>
          <BoardFrame title={meta.title} height={height} stickyRotate={2.2} fit backHref="/blog">
            <div style={{ paddingTop: 66, paddingBottom: 72 }}>
              {laid.map((l, i) => (
                <StapledSheet
                  key={i}
                  board={board}
                  id={`sheet-${i}`}
                  x={l.x}
                  y={0}
                  rotate={l.rotate}
                  flow
                  eyebrow={i === 0 ? "POST" : l.sheet.eyebrow}
                  heading={i === 0 ? undefined : l.sheet.heading}
                  page={i + 1}
                  pages={laid.length}
                  lead={
                    i === 0 ? (
                      <>
                        <div style={{ margin: "16px 0 0", fontFamily: "Excalifont, cursive", fontSize: 40, lineHeight: 1.14, color: "var(--cork-ink)" }}>
                          {meta.title}
                        </div>
                        <div style={{ display: "flex", gap: 18, margin: "16px 0 20px", fontFamily: MONO, fontSize: 11, letterSpacing: "0.1em", color: "var(--cork-ink3)" }}>
                          <span>{date}</span>
                          {meta.tags.map((t) => (
                            <span key={t}>[ {t} ]</span>
                          ))}
                        </div>
                      </>
                    ) : undefined
                  }
                >
                  <MDXRemote source={l.sheet.body} components={mdxComponents} />
                </StapledSheet>
              ))}
            </div>

            {pins.map((pin) => (
              <PinnedAttachment key={pin.id} board={board} pin={pin} />
            ))}
          </BoardFrame>
          </BoardStage>
        </main>
      }
      fallback={<BlogArticle meta={meta} content={content} date={date} />}
    />
  )
}

function BlogArticle({
  meta,
  content,
  date,
}: {
  meta: BlogPost
  content: string
  date: string
}) {
  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-12 pb-24">
      <MobileChrome backHref="/blog" backLabel="All posts" />

      <header className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <time className="text-sm text-neutral-700 dark:text-neutral-500">{date}</time>
          {meta.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full bg-[var(--chip)] text-neutral-800 dark:text-neutral-400"
            >
              {tag}
            </span>
          ))}
        </div>
        <h1 className="text-4xl font-bold text-neutral-950 dark:text-neutral-100">
          {meta.title}
        </h1>
      </header>

      <article className="prose prose-neutral dark:prose-invert max-w-none prose-a:text-blue-800 dark:prose-a:text-blue-500 prose-headings:font-semibold prose-headings:text-neutral-950 dark:prose-headings:text-neutral-100 prose-p:text-neutral-800 dark:prose-p:text-neutral-400 prose-li:text-neutral-800 dark:prose-li:text-neutral-400 prose-code:text-neutral-950 dark:prose-code:text-neutral-200 prose-pre:bg-[var(--chip)]">
        <MDXRemote source={content} components={mdxComponents} />
      </article>
    </main>
  )
}
