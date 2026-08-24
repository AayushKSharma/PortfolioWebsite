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
  figureSrc,
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
  /** image shown in the figure slot; sized with object-fit, never stretched */
  figureSrc?: string;
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
      className="cork-sheet"
      style={{
        padding: pad,
        boxShadow: "0 1px 1px rgba(0,0,0,0.2), 0 18px 34px rgba(20,10,0,0.44)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16 }}>
        <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.16em", color: "var(--cork-ink3)" }}>{eyebrow}</div>
        {eyebrowRight && (
          <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.1em", color: "var(--cork-ink3)" }}>{eyebrowRight}</div>
        )}
      </div>

      <div style={{ margin: "14px 0 0", fontFamily: HAND, fontSize: featured ? 34 : 25, lineHeight: 1.15, color: "var(--cork-ink)" }}>
        {title}
      </div>

      {featured && <div style={{ margin: "16px 0 0", height: 1, background: "var(--cork-rule-strong)" }} />}

      <div style={{ display: "flex", gap: 30, marginTop: featured ? 18 : 12 }}>
        <div style={{ flex: "1 1 0", fontFamily: MONO, fontSize: featured ? 13 : 12.5, lineHeight: 1.9, color: "var(--cork-ink2)", textWrap: "pretty" }}>
          {body}
        </div>
        {figure && (
          <div style={{ width: 200, flex: "0 0 200px" }}>
            <div
              style={{
                height: 160,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {figureSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={figureSrc}
                  alt="AOTW logo"
                  draggable={false}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    width: "auto",
                    height: "auto",
                    objectFit: "contain",
                    objectPosition: "center",
                    display: "block",
                  }}
                />
              ) : (
                <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.1em", color: "var(--cork-ink3)", alignSelf: "flex-end" }}>
                  SCREENSHOT
                </div>
              )}
            </div>
            <div style={{ marginTop: 7, fontFamily: MONO, fontSize: 10, color: "var(--cork-ink3)", letterSpacing: "0.06em" }}>{figure}</div>
          </div>
        )}
      </div>

      {chips && chips.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 18, fontFamily: MONO, fontSize: 11, color: "var(--cork-ink3)", letterSpacing: "0.06em" }}>
          {chips.map((c) => (
            <span key={c}>[ {c} ]</span>
          ))}
        </div>
      )}

      <div style={{ marginTop: 18, paddingTop: 13, borderTop: "1px solid var(--cork-rule)", display: "flex", justifyContent: "space-between", alignItems: "baseline", fontFamily: MONO, fontSize: 12, letterSpacing: "0.1em", color: "var(--cork-ink)" }}>
        <span>{footer}</span>
        {footerRight && <span style={{ color: "var(--cork-ink3)", letterSpacing: "0.06em" }}>{footerRight}</span>}
      </div>
    </Pinned>
  );
}
