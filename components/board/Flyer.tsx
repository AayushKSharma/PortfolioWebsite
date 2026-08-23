// components/board/Flyer.tsx — a printed notice: project or post.

import Pinned from "./Pinned";
import type { Span } from "@/lib/board";

const MONO = "Cascadia, ui-monospace, monospace";
const HAND = "Excalifont, cursive";

export default function Flyer({
  board,
  id,
  x,
  y,
  width,
  rotate,
  span,
  eyebrow,
  eyebrowRight,
  title,
  body,
  chips,
  footer,
  footerRight,
  href,
  figure,
  featured = false,
}: {
  board: string;
  id: string;
  x: number;
  y: number;
  width: number;
  rotate: number;
  span: Span;
  eyebrow: string;
  eyebrowRight?: string;
  title: string;
  body: string;
  chips?: string[];
  footer: string;
  footerRight?: string;
  href: string;
  /** caption for the figure block on featured flyers */
  figure?: string;
  featured?: boolean;
}) {
  const pad = featured ? "32px 34px 30px" : "26px 26px 22px";

  return (
    <Pinned
      board={board}
      id={id}
      x={x}
      y={y}
      width={width}
      rotate={rotate}
      pinStyle={span >= 2 ? "two-pin" : "pushpin"}
      curl={featured ? 28 : 24}
      href={href}
      style={{
        background: "var(--cork-paper)",
        backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.45), rgba(0,0,0,0.025))",
        padding: pad,
        boxShadow: "0 1px 1px rgba(0,0,0,0.2), 0 18px 34px rgba(20,10,0,0.44)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16 }}>
        <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.16em", color: "#8a6a3d" }}>{eyebrow}</div>
        {eyebrowRight && (
          <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.1em", color: "#8a6a3d" }}>{eyebrowRight}</div>
        )}
      </div>

      <div style={{ margin: "14px 0 0", fontFamily: HAND, fontSize: featured ? 34 : 25, lineHeight: 1.15, color: "var(--cork-ink)" }}>
        {title}
      </div>

      {featured && <div style={{ margin: "16px 0 0", height: 1, background: "rgba(52,40,24,0.28)" }} />}

      <div style={{ display: "flex", gap: 30, marginTop: featured ? 18 : 12 }}>
        <div style={{ flex: "1 1 0", fontFamily: MONO, fontSize: featured ? 13 : 12.5, lineHeight: 1.9, color: "var(--cork-ink2)", textWrap: "pretty" }}>
          {body}
        </div>
        {figure && (
          <div style={{ width: 200, flex: "0 0 200px" }}>
            <div style={{ height: 118, backgroundColor: "#cdc6b6", backgroundImage: "repeating-linear-gradient(115deg, rgba(255,255,255,0.5) 0 2px, rgba(255,255,255,0) 2px 5px), linear-gradient(160deg, #d6d0c0, #b2ab9a)", display: "flex", alignItems: "flex-end", padding: 8, boxSizing: "border-box", fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.1em", color: "rgba(255,255,255,0.9)" }}>
              SCREENSHOT
            </div>
            <div style={{ marginTop: 7, fontFamily: MONO, fontSize: 10, color: "#8a6a3d", letterSpacing: "0.06em" }}>{figure}</div>
          </div>
        )}
      </div>

      {chips && chips.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 18, fontFamily: MONO, fontSize: 11, color: "#6b563c", letterSpacing: "0.06em" }}>
          {chips.map((c) => (
            <span key={c}>[ {c} ]</span>
          ))}
        </div>
      )}

      <div style={{ marginTop: 18, paddingTop: 13, borderTop: "1px solid rgba(52,40,24,0.22)", display: "flex", justifyContent: "space-between", alignItems: "baseline", fontFamily: MONO, fontSize: 12, letterSpacing: "0.1em", color: "var(--cork-ink)" }}>
        <span>{footer}</span>
        {footerRight && <span style={{ color: "#8a6a3d", letterSpacing: "0.06em" }}>{footerRight}</span>}
      </div>
    </Pinned>
  );
}
