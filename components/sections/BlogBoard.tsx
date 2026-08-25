// components/sections/BlogBoard.tsx

import type { BlogPost } from "@/lib/blog";
import { packBoard, estimateFlyerHeight, rotationFor, MOBILE_PAD, MOBILE_TOP, type PackInput } from "@/lib/board";
import { pinsFor, pinHeight } from "@/lib/boardAttachments";
import BoardFrame from "@/components/board/BoardFrame";
import Flyer from "@/components/board/Flyer";
import PinnedAttachment from "@/components/board/PinnedAttachment";

const BOARD = "blog";

export default function BlogBoard({ posts }: { posts: BlogPost[] }) {
  return (
    <>
      <div className="max-[700px]:hidden">
        <BlogBoardView posts={posts} />
      </div>
      <div className="min-[701px]:hidden">
        <BlogBoardView posts={posts} mobile />
      </div>
    </>
  );
}

function BlogBoardView({ posts, mobile = false }: { posts: BlogPost[]; mobile?: boolean }) {
  if (mobile) {
    return (
      <BoardFrame
        title="writing"
        meta={`${posts.length} POSTED`}
        height={240}
        stickyRotate={-2.2}
        backHref="/"
        fluid
        fit
      >
        <div style={{ paddingTop: MOBILE_TOP, paddingBottom: 28 }}>
          {posts.map((p, i) => {
            const year = p.date ? new Date(p.date).getFullYear() : undefined;
            return (
              <Flyer
                key={p.slug}
                board={`${BOARD}-m`}
                id={p.slug}
                x={MOBILE_PAD}
                y={0}
                width={320}
                rotate={rotationFor(p.slug, 1.1)}
                span={1}
                compact
                flow
                draggable={false}
                eyebrow={`POST ${String(i + 1).padStart(2, "0")}`}
                eyebrowRight={p.tags[0]?.toUpperCase()}
                title={p.title}
                body={p.excerpt}
                footer="READ →"
                footerRight={year ? String(year) : undefined}
                href={`/blog/${p.slug}`}
              />
            );
          })}
        </div>
      </BoardFrame>
    );
  }

  const items: PackInput[] = posts.map((p) => ({
    id: p.slug,
    span: 1,
    height: estimateFlyerHeight({ span: 1, title: p.title, body: p.excerpt, chips: p.tags.length }),
  }));

  const pins = pinsFor(BOARD);
  const { placements, height } = packBoard(items);
  const pinBottom = Math.max(0, ...pins.map((p) => p.y + pinHeight(p) + 44));

  return (
    <BoardFrame
      title="writing"
      meta={`${posts.length} POSTED`}
      height={Math.max(height, pinBottom)}
      stickyRotate={-2.2}
      backHref="/"
    >
      {placements.map((pl, i) => {
        const p = posts[i];
        const year = p.date ? new Date(p.date).getFullYear() : undefined;
        return (
          <Flyer
            key={p.slug}
            board={BOARD}
            id={p.slug}
            x={pl.x}
            y={pl.y}
            width={pl.width}
            rotate={pl.rotate}
            span={1}
            eyebrow={`POST ${String(i + 1).padStart(2, "0")}`}
            eyebrowRight={p.tags[0]?.toUpperCase()}
            title={p.title}
            body={p.excerpt}
            footer="READ →"
            footerRight={year ? String(year) : undefined}
            href={`/blog/${p.slug}`}
          />
        );
      })}

      {pins.map((pin) => (
        <PinnedAttachment key={pin.id} board={BOARD} pin={pin} />
      ))}
    </BoardFrame>
  );
}
