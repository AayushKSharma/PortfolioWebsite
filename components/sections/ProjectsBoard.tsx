// components/sections/ProjectsBoard.tsx

import type { Project } from "@/lib/projects";
import { packBoard, estimateFlyerHeight, rotationFor, MOBILE_PAD, MOBILE_TOP, type PackInput, type Span } from "@/lib/board";
import { pinsFor, pinHeight } from "@/lib/boardAttachments";
import { SKILL_GROUPS } from "@/lib/skills";
import BoardFrame from "@/components/board/BoardFrame";
import Flyer from "@/components/board/Flyer";
import PinnedAttachment from "@/components/board/PinnedAttachment";
import StickyNote from "@/components/board/StickyNote";

const BOARD = "projects";

const stickyLook = {
  languages: { color: "#f5e488", wash: "#f8ea9c", ink: "#3a3116" },
  frontend: { color: "#f3c6b4", wash: "#f7d4c6", ink: "#4a2c22" },
  backend: { color: "#cfe8a8", wash: "#dcefc0", ink: "#2c3a18" },
  infrastructure: { color: "#c5dcf0", wash: "#d7e8f6", ink: "#1e3348" },
} as const;

export default function ProjectsBoard({ projects }: { projects: Project[] }) {
  return (
    <>
      <div className="max-[700px]:hidden">
        <ProjectsBoardView projects={projects} />
      </div>
      <div className="min-[701px]:hidden">
        <ProjectsBoardView projects={projects} mobile />
      </div>
    </>
  );
}

function ProjectsBoardView({ projects, mobile = false }: { projects: Project[]; mobile?: boolean }) {
  const ordered = [...projects].sort((a, b) => Number(b.featured) - Number(a.featured));

  if (mobile) {
    return (
      <BoardFrame
        title="projects & experience"
        meta={`${projects.length} POSTED`}
        height={280}
        stickyRotate={2.6}
        backHref="/"
        fluid
        fit
      >
        <div style={{ paddingTop: MOBILE_TOP, paddingBottom: 36 }}>
          {ordered.map((p, i) => {
            const featured = Boolean(p.featured && i === 0);
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
                featured={featured}
                compact
                flow
                draggable={false}
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

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
              marginLeft: MOBILE_PAD,
              marginRight: MOBILE_PAD,
              marginTop: 4,
            }}
          >
            {SKILL_GROUPS.map((group) => {
              const look = stickyLook[group.id];
              return (
                <StickyNote
                  key={group.id}
                  board={`${BOARD}-m`}
                  id={`skill-${group.id}`}
                  x={0}
                  y={0}
                  flow
                  draggable={false}
                  rotate={rotationFor(`skill-${group.id}`, 2.2)}
                  color={look.color}
                  wash={look.wash}
                  ink={look.ink}
                  title={group.label}
                  items={group.skills}
                />
              );
            })}
          </div>
        </div>
      </BoardFrame>
    );
  }

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

  const STICKY_H = 186;
  const stickyY = Math.max(height, pinBottom) + 20;
  const boardH = stickyY + STICKY_H + 52;
  const stickyX = [52, 318, 590, 862];
  const stickyNudge = [8, -12, 6, -8];

  return (
    <BoardFrame
      title="projects & experience"
      meta={`${projects.length} POSTED`}
      height={boardH}
      stickyRotate={2.6}
      backHref="/"
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

      {SKILL_GROUPS.map((group, i) => {
        const look = stickyLook[group.id];
        return (
          <StickyNote
            key={group.id}
            board={BOARD}
            id={`skill-${group.id}`}
            x={stickyX[i]}
            y={stickyY + stickyNudge[i]}
            rotate={rotationFor(`skill-${group.id}`, 2.8)}
            color={look.color}
            wash={look.wash}
            ink={look.ink}
            title={group.label}
            items={group.skills}
          />
        );
      })}
    </BoardFrame>
  );
}
