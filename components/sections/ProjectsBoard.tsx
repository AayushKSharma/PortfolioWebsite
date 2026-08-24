// components/sections/ProjectsBoard.tsx

import type { Project } from "@/lib/projects";
import { packBoard, estimateFlyerHeight, type PackInput, type Span } from "@/lib/board";
import { pinsFor, pinHeight } from "@/lib/boardAttachments";
import BoardFrame from "@/components/board/BoardFrame";
import Flyer from "@/components/board/Flyer";
import PinnedAttachment from "@/components/board/PinnedAttachment";

const BOARD = "projects";

export default function ProjectsBoard({ projects }: { projects: Project[] }) {
  // featured first, then file order; featured spans two columns with a figure
  const ordered = [...projects].sort((a, b) => Number(b.featured) - Number(a.featured));

  const items: PackInput[] = ordered.map((p, i) => {
    const span: Span = p.featured && i === 0 ? 2 : 1;
    return {
      id: p.slug,
      span,
      height: estimateFlyerHeight({
        span,
        title: p.title,
        body: p.description,
        chips: p.tech.length,
        featured: span === 2,
        figure: span === 2,
      }),
    };
  });

  const pins = pinsFor(BOARD);
  const { placements, height } = packBoard(items);
  const pinBottom = Math.max(0, ...pins.map((p) => p.y + pinHeight(p) + 44));

  return (
    <BoardFrame
      title="projects & experience"
      meta={`${projects.length} POSTED`}
      height={Math.max(height, pinBottom)}
      stickyRotate={2.6}
    >
      {placements.map((pl, i) => {
        const p = ordered[i];
        const featured = pl.width > 400;
        return (
          <Flyer
            key={p.slug}
            board={BOARD}
            id={p.slug}
            x={pl.x}
            y={pl.y}
            width={pl.width}
            rotate={pl.rotate}
            span={featured ? 2 : 1}
            featured={featured}
            eyebrow={`PROJECT ${String(i + 1).padStart(2, "0")}`}
            title={p.title}
            body={p.description}
            chips={featured ? p.tech.slice(0, 6) : p.tech.slice(0, 3)}
            figure={featured && p.slug === "aotw" ? "fig. 1 — aotw" : featured ? "fig. 1 — screenshot" : undefined}
            figureSrc={featured && p.slug === "aotw" ? "/board/sheets/aotw-logo.png" : undefined}
            footer={featured ? "READ THE WRITE-UP →" : "READ MORE →"}
            footerRight={p.liveUrl ? p.liveUrl.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "") : undefined}
            href={`/projects/${p.slug}`}
          />
        );
      })}

      {pins.map((pin) => (
        <PinnedAttachment key={pin.id} board={BOARD} pin={pin} />
      ))}
    </BoardFrame>
  );
}
