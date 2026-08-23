// components/board/Pinned.tsx — draggable positioned wrapper + fastener art.
"use client";

import { useEffect, useRef } from "react";

export type PinStyle = "pushpin" | "staple" | "tape" | "two-pin" | "none";

const storeKey = (board: string) => `board:${board}`;

function load(board: string): Record<string, { x: number; y: number }> {
  try {
    return JSON.parse(localStorage.getItem(storeKey(board)) || "{}");
  } catch {
    return {};
  }
}

export function resetBoard(board: string) {
  try {
    localStorage.removeItem(storeKey(board));
  } catch {}
  document
    .querySelectorAll<HTMLElement>(`[data-board="${board}"] [data-pinned]`)
    .forEach((el) => {
      el.style.translate = "";
    });
}

let zTop = 20;

export default function Pinned({
  board,
  id,
  x,
  y,
  width,
  rotate = 0,
  pinStyle = "pushpin",
  pinColor = "var(--pin-red)",
  curl = 0,
  draggable = true,
  zIndex,
  href,
  style,
  children,
}: {
  board: string;
  id: string;
  x: number;
  y: number;
  width: number;
  rotate?: number;
  pinStyle?: PinStyle;
  pinColor?: string;
  /** resting size of the curled corner in px; 0 = none */
  curl?: number;
  draggable?: boolean;
  zIndex?: number;
  href?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const saved = load(board)[id];
    if (saved) el.style.translate = `${saved.x}px ${saved.y}px`;
    if (!draggable) return;

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const start = load(board)[id] || { x: 0, y: 0 };
      const ox = e.clientX;
      const oy = e.clientY;
      let cur = start;
      let dragging = false;

      const move = (ev: PointerEvent) => {
        const dx = ev.clientX - ox;
        const dy = ev.clientY - oy;
        // let clicks through: only claim the pointer past a 4px threshold
        if (!dragging && Math.hypot(dx, dy) < 4) return;
        if (!dragging) {
          dragging = true;
          el.setPointerCapture(e.pointerId);
          el.style.zIndex = String(++zTop);
          el.style.cursor = "grabbing";
        }
        cur = { x: start.x + dx, y: start.y + dy };
        el.style.translate = `${cur.x}px ${cur.y}px`;
      };

      const up = (ev: PointerEvent) => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerup", up);
        el.style.cursor = "grab";
        if (!dragging) return;
        ev.preventDefault();
        const s = load(board);
        s[id] = cur;
        try {
          localStorage.setItem(storeKey(board), JSON.stringify(s));
        } catch {}
      };

      el.addEventListener("pointermove", move);
      el.addEventListener("pointerup", up);
    };

    el.addEventListener("pointerdown", onDown);
    return () => el.removeEventListener("pointerdown", onDown);
  }, [board, id, draggable]);

  const pin = (left: string, mLeft: number, color = pinColor) => (
    <div
      style={{
        position: "absolute",
        left,
        top: -12,
        marginLeft: mLeft,
        width: 24,
        height: 24,
        borderRadius: "50%",
        backgroundImage: `radial-gradient(circle at 34% 30%, #ffffff 0 2px, ${color} 3px 60%, #7d2418 100%)`,
        boxShadow: "2px 5px 8px rgba(20,10,0,0.5)",
      }}
    />
  );

  const inner = (
    <>
      {children}
      {pinStyle === "pushpin" && pin("50%", -12)}
      {pinStyle === "two-pin" && (
        <>
          {pin("24px", 0)}
          <div style={{ position: "absolute", right: 24, top: -12, width: 24, height: 24, borderRadius: "50%", backgroundImage: `radial-gradient(circle at 34% 30%, #ffffff 0 2px, ${pinColor} 3px 60%, #7d2418 100%)`, boxShadow: "2px 5px 8px rgba(20,10,0,0.5)" }} />
        </>
      )}
      {pinStyle === "staple" && (
        <>
          <div style={{ position: "absolute", left: 22, top: 20, width: 26, height: 5, background: "#9aa0a6", rotate: "-42deg", boxShadow: "0 1px 2px rgba(20,10,0,0.45)" }} />
          <div style={{ position: "absolute", right: 22, bottom: 20, width: 26, height: 5, background: "#9aa0a6", rotate: "-42deg", boxShadow: "0 1px 2px rgba(20,10,0,0.45)" }} />
        </>
      )}
      {pinStyle === "tape" && (
        <div style={{ position: "absolute", left: "50%", top: -14, marginLeft: -34, width: 68, height: 26, background: "rgba(246,240,222,0.62)", boxShadow: "0 2px 5px rgba(20,10,0,0.22)", rotate: "-2deg" }} />
      )}
      {curl > 0 && (
        <div
          className="cork-curl"
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            width: curl,
            height: curl,
            backgroundImage: "linear-gradient(315deg, #a4753d 0%, #f2ead6 46%, #cfc4a7 100%)",
            boxShadow: "-4px -4px 10px rgba(20,10,0,0.4)",
          }}
        />
      )}
    </>
  );

  const shell: React.CSSProperties = {
    position: "absolute",
    left: x,
    top: y,
    width,
    rotate: `${rotate}deg`,
    touchAction: draggable ? "none" : undefined,
    cursor: draggable ? "grab" : undefined,
    zIndex,
    boxSizing: "border-box",
    ...style,
  };

  return (
    <div ref={ref} data-pinned={id} style={shell} className="cork-lift">
      {href ? (
        <a href={href} style={{ display: "block", color: "inherit", textDecoration: "none" }}>
          {inner}
        </a>
      ) : (
        inner
      )}
    </div>
  );
}
