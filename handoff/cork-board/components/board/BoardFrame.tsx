// components/board/BoardFrame.tsx — aluminium frame, cork panel, sticky title.

import { BOARD_W, FRAME } from "@/lib/board";
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
  children,
}: {
  /** handwritten sticky-note title, flush with the frame's top edge */
  title: string;
  /** small typed line, top right on the cork */
  meta?: string;
  /** cork panel height in board px */
  height: number;
  stickyRotate?: number;
  /** slug boards clip; section boards let art hang over the edge */
  clip?: boolean;
  children: React.ReactNode;
}) {
  return (
    <BoardScaler height={height + FRAME * 2 + 14}>
      <div
        style={{
          width: BOARD_W,
          padding: FRAME,
          borderRadius: 5,
          backgroundImage: "linear-gradient(180deg, #c8ccd0 0%, #9aa0a6 42%, #7f858c 100%)",
          boxShadow: "0 20px 44px rgba(50,30,10,0.34)",
          boxSizing: "border-box",
        }}
      >
        <div
          className="cork-panel"
          style={{
            position: "relative",
            height,
            borderRadius: 2,
            boxShadow: "inset 0 0 0 2px rgba(0,0,0,0.32), inset 0 0 110px rgba(30,14,0,0.4)",
            backgroundColor: "#a4753d",
            backgroundImage: CORK_IMAGE,
            backgroundSize: "39px 39px, 67px 67px, 53px 53px, 97px 97px",
            overflow: clip ? "hidden" : "visible",
          }}
        >
          {/* sun-faded patches + pin holes left by past notices */}
          <div style={{ position: "absolute", left: 128, top: 128, width: 190, height: 244, background: "rgba(255,238,205,0.07)", opacity: "var(--cork-grime)" }} />
          <div style={{ position: "absolute", left: 880, top: Math.max(80, height - 430), width: 150, height: 190, background: "rgba(255,238,205,0.06)", opacity: "var(--cork-grime)" }} />
          <div style={{ position: "absolute", left: 306, top: Math.max(120, height - 210), width: 5, height: 5, borderRadius: "50%", background: "rgba(40,20,4,0.45)", boxShadow: "46px 12px 0 rgba(40,20,4,0.4), 128px -8px 0 rgba(40,20,4,0.35), 402px 6px 0 rgba(40,20,4,0.4), 560px -4px 0 rgba(40,20,4,0.32)", opacity: "var(--cork-grime)" }} />

          <div
            style={{
              position: "absolute",
              left: 44,
              top: -FRAME,
              width: 158,
              height: 158,
              rotate: `${stickyRotate}deg`,
              backgroundColor: "#f5e488",
              backgroundImage: "linear-gradient(184deg, #f8ea9c 0%, #ecd66d 100%)",
              boxShadow: "0 2px 3px rgba(20,10,0,0.26), 10px 18px 28px rgba(20,10,0,0.34)",
              display: "flex",
              alignItems: "flex-end",
              padding: 18,
              boxSizing: "border-box",
              zIndex: 5,
            }}
          >
            <div style={{ fontFamily: "Excalifont, cursive", fontSize: title.length > 18 ? 25 : 28, lineHeight: 1.13, color: "#3a3116" }}>
              {title}
            </div>
          </div>

          {meta && (
            <div style={{ position: "absolute", right: 34, top: 34, fontFamily: "Cascadia, ui-monospace, monospace", fontSize: 10.5, letterSpacing: "0.14em", color: "rgba(255,244,224,0.66)" }}>
              {meta}
            </div>
          )}

          {children}
        </div>
      </div>
    </BoardScaler>
  );
}
