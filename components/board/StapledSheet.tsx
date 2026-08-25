// components/board/StapledSheet.tsx — one page of a slug-page write-up.

import type { ReactNode } from "react";
import Pinned from "./Pinned";

const MONO = "Cascadia, ui-monospace, monospace";
const HAND = "Excalifont, cursive";

export default function StapledSheet({
  board,
  id,
  x,
  y,
  width = 864,
  rotate,
  eyebrow,
  heading,
  page,
  pages,
  lead,
  fade = false,
  flow = false,
  compact = false,
  children,
}: {
  board: string;
  id: string;
  x: number;
  y: number;
  width?: number;
  rotate: number;
  eyebrow?: string;
  heading?: string;
  page: number;
  pages: number;
  /** true on the first sheet: bigger title block */
  lead?: ReactNode;
  /** fade the bottom edge (last sheet, continues below) */
  fade?: boolean;
  /** stack in document flow so pages never cover each other */
  flow?: boolean;
  /** phone layout: tighter type, full-width sheet */
  compact?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <Pinned
      board={board}
      id={id}
      x={x}
      y={y}
      width={width}
      rotate={rotate}
      pinStyle="staple"
      draggable={false}
      flow={flow}
      className="cork-sheet"
      style={{
        padding: compact
          ? lead
            ? "26px 18px 42px"
            : "22px 18px 38px"
          : lead
            ? "44px 52px 34px"
            : "38px 52px 30px",
        boxShadow: "0 1px 1px rgba(0,0,0,0.2), 0 20px 38px rgba(20,10,0,0.45)",
        ...(compact
          ? {
              width: `calc(100% - ${x * 2}px)`,
              marginBottom: 22,
            }
          : {}),
      }}
    >
      {eyebrow && (
        <div style={{ fontFamily: MONO, fontSize: compact ? 10 : 10.5, letterSpacing: "0.18em", color: "var(--cork-ink3)", marginBottom: compact ? 10 : 12 }}>
          {eyebrow}
        </div>
      )}
      {heading && (
        <div style={{ fontFamily: HAND, fontSize: compact ? 22 : 27, color: "var(--cork-ink)", marginBottom: compact ? 12 : 16 }}>{heading}</div>
      )}

      {lead}

      <div className={compact ? "cork-prose cork-prose-compact" : "cork-prose"}>{children}</div>

      {/* dog-eared top-right corner */}
      <div style={{ position: "absolute", right: 0, top: 0, width: compact ? 24 : 34, height: compact ? 24 : 34, borderBottomLeftRadius: compact ? 10 : 14, backgroundImage: "var(--cork-dogear)", boxShadow: "-5px 5px 10px rgba(20,10,0,0.24)" }} />

      <div style={{ position: "absolute", right: compact ? 16 : 34, bottom: compact ? 10 : 12, fontFamily: MONO, fontSize: compact ? 10 : 10.5, color: "var(--cork-ink3)", letterSpacing: "0.1em" }}>
        {page} / {pages}
      </div>

      {fade && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 64, background: "var(--cork-fade)" }} />
      )}
    </Pinned>
  );
}
