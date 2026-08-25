// components/board/BoardFrame.tsx — aluminium frame, cork panel, sticky title.

import Link from "next/link";
import { BOARD_W, FRAME, MOBILE_FRAME } from "@/lib/board";
import BoardScaler from "./BoardScaler";

const CORK_IMAGE = [
  "radial-gradient(circle at 24% 34%, rgba(74,44,14,0.55) 0 3px, rgba(74,44,14,0) 4px)",
  "radial-gradient(circle at 66% 60%, rgba(52,30,8,0.45) 0 4px, rgba(52,30,8,0) 5px)",
  "radial-gradient(circle at 40% 84%, rgba(196,152,98,0.45) 0 2px, rgba(196,152,98,0) 3px)",
  "radial-gradient(circle at 84% 18%, rgba(120,74,32,0.4) 0 5px, rgba(120,74,32,0) 6px)",
].join(", ");

export default function BoardFrame({
  title,
  meta,
  height,
  stickyRotate = -2.2,
  clip = false,
  fit = false,
  fluid = false,
  backHref,
  children,
}: {
  /** handwritten sticky-note title, flush with the frame's top edge */
  title: string;
  /** small typed line, top right on the cork */
  meta?: string;
  /** cork panel height in board px */
  height: number;
  stickyRotate?: number;
  /** if true, hide paper that hangs past the cork (section boards leave this off) */
  clip?: boolean;
  /** let in-flow sheets grow the cork instead of a fixed height */
  fit?: boolean;
  /** phone board: 100% width, native type, no 1180px scale */
  fluid?: boolean;
  /** back arrow on the sticky note */
  backHref?: string;
  children: React.ReactNode;
}) {
  const frame = fluid ? MOBILE_FRAME : FRAME;
  const stickyW = fluid ? (backHref ? 148 : 136) : backHref ? 168 : 158;
  const stickyH = fluid ? (backHref ? 156 : 136) : backHref ? 176 : 158;

  return (
    <BoardScaler height={height + frame * 2 + 14} boardW={BOARD_W} fluid={fluid}>
      <div
        style={{
          width: fluid ? "100%" : BOARD_W,
          padding: frame,
          borderRadius: fluid ? 8 : 5,
          backgroundImage: "linear-gradient(180deg, #c8ccd0 0%, #9aa0a6 42%, #7f858c 100%)",
          boxShadow: "0 20px 44px rgba(50,30,10,0.34)",
          boxSizing: "border-box",
          overflow: "visible",
        }}
      >
        <div
          className="cork-panel"
          style={{
            position: "relative",
            height: fit ? undefined : height,
            minHeight: height,
            borderRadius: 2,
            boxShadow: "inset 0 0 0 2px rgba(0,0,0,0.32), inset 0 0 110px rgba(30,14,0,0.4)",
            backgroundColor: "#a4753d",
            backgroundImage: CORK_IMAGE,
            backgroundSize: "39px 39px, 67px 67px, 53px 53px, 97px 97px",
            overflow: clip ? "hidden" : "visible",
          }}
        >
          {/* sun-faded patches + pin holes left by past notices */}
          <div style={{ position: "absolute", left: "11%", top: "16%", width: "16%", height: "28%", background: "rgba(255,238,205,0.07)", opacity: "var(--cork-grime)" }} />
          <div style={{ position: "absolute", right: "8%", bottom: "18%", width: "13%", height: "22%", background: "rgba(255,238,205,0.06)", opacity: "var(--cork-grime)" }} />
          {!fluid && (
            <div style={{ position: "absolute", left: 306, top: Math.max(120, height - 210), width: 5, height: 5, borderRadius: "50%", background: "rgba(40,20,4,0.45)", boxShadow: "46px 12px 0 rgba(40,20,4,0.4), 128px -8px 0 rgba(40,20,4,0.35), 402px 6px 0 rgba(40,20,4,0.4), 560px -4px 0 rgba(40,20,4,0.32)", opacity: "var(--cork-grime)" }} />
          )}

          <div
            style={{
              position: "absolute",
              left: fluid ? 16 : 44,
              top: -frame,
              width: stickyW,
              height: fluid ? undefined : stickyH,
              minHeight: stickyH,
              rotate: `${stickyRotate}deg`,
              backgroundColor: "var(--sticky)",
              backgroundImage: "linear-gradient(184deg, rgba(255,255,255,0.24) 0%, var(--sticky-2) 100%)",
              boxShadow: "0 2px 3px rgba(20,10,0,0.26), 10px 18px 28px rgba(20,10,0,0.34)",
              display: "flex",
              alignItems: "flex-end",
              padding: backHref ? (fluid ? "34px 12px 12px" : "40px 16px 16px") : fluid ? 14 : 18,
              boxSizing: "border-box",
              zIndex: 12,
            }}
          >
            {backHref && (
              <Link href={backHref} aria-label="Back" className="cork-back">
                ←
              </Link>
            )}
            <div style={{ fontFamily: "Excalifont, cursive", fontSize: fluid ? (title.length > 18 ? 20 : 23) : title.length > 18 ? 25 : 28, lineHeight: 1.13, color: "var(--sticky-ink)" }}>
              {title}
            </div>
          </div>

          {meta && (
            <div style={{ position: "absolute", right: fluid ? 14 : 34, top: fluid ? 16 : 34, fontFamily: "Cascadia, ui-monospace, monospace", fontSize: fluid ? 9.5 : 10.5, letterSpacing: "0.14em", color: "rgba(255,244,224,0.66)" }}>
              {meta}
            </div>
          )}

          {children}
        </div>
      </div>
    </BoardScaler>
  );
}
