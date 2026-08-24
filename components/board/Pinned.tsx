// components/board/Pinned.tsx — draggable positioned wrapper + fastener art.
"use client";

import { useEffect, useRef } from "react";

export type PinStyle = "pushpin" | "staple" | "tape" | "two-pin" | "none";

const storeKey = (board: string) => `board:${board}`;
const DRAG_THRESHOLD = 4;
const PIN_PAD = 14; // keep the 24px pin head fully on the cork

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
    .querySelectorAll<HTMLElement>(`[data-board="${board}"][data-pinned]`)
    .forEach((el) => {
      el.style.translate = "";
    });
}

let zTop = 20;

function boardScale(el: HTMLElement): number {
  const panel = el.closest(".cork-panel") as HTMLElement | null;
  if (panel?.offsetWidth) {
    return panel.getBoundingClientRect().width / panel.offsetWidth;
  }
  return 1;
}

/** Local (unrotated) fastener points relative to the item's top-left. */
function fastenerPoints(style: PinStyle, w: number, h: number): { x: number; y: number }[] {
  switch (style) {
    case "two-pin":
      return [
        { x: 36, y: 0 },
        { x: w - 36, y: 0 },
      ];
    case "staple":
      return [
        { x: 35, y: 23 },
        { x: w - 35, y: h - 23 },
      ];
    case "tape":
      return [{ x: w / 2, y: -1 }];
    case "none":
      return [{ x: w / 2, y: 0 }];
    default:
      return [{ x: w / 2, y: 0 }];
  }
}

function rotateLocal(
  lx: number,
  ly: number,
  w: number,
  h: number,
  deg: number,
): { x: number; y: number } {
  const rad = (deg * Math.PI) / 180;
  const cx = w / 2;
  const cy = h / 2;
  const dx = lx - cx;
  const dy = ly - cy;
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  return { x: cx + dx * c - dy * s, y: cy + dx * s + dy * c };
}

function clampOffset(
  el: HTMLElement,
  baseX: number,
  baseY: number,
  rotate: number,
  pinStyle: PinStyle,
  tx: number,
  ty: number,
): { x: number; y: number } {
  const panel = el.closest(".cork-panel") as HTMLElement | null;
  if (!panel) return { x: tx, y: ty };

  const w = el.offsetWidth;
  const h = el.offsetHeight;
  const panelW = panel.offsetWidth;
  const panelH = panel.offsetHeight;
  const points = fastenerPoints(pinStyle, w, h);

  let minTx = -Infinity;
  let maxTx = Infinity;
  let minTy = -Infinity;
  let maxTy = Infinity;

  for (const p of points) {
    const r = rotateLocal(p.x, p.y, w, h, rotate);
    minTx = Math.max(minTx, PIN_PAD - baseX - r.x);
    maxTx = Math.min(maxTx, panelW - PIN_PAD - baseX - r.x);
    minTy = Math.max(minTy, PIN_PAD - baseY - r.y);
    maxTy = Math.min(maxTy, panelH - PIN_PAD - baseY - r.y);
  }

  return {
    x: Math.min(maxTx, Math.max(minTx, tx)),
    y: Math.min(maxTy, Math.max(minTy, ty)),
  };
}

function killNativeDrag(el: HTMLElement) {
  const block = (e: Event) => e.preventDefault();
  el.addEventListener("dragstart", block);
  el.querySelectorAll("a, img").forEach((node) => {
    node.setAttribute("draggable", "false");
    node.addEventListener("dragstart", block);
  });
  return () => {
    el.removeEventListener("dragstart", block);
    el.querySelectorAll("a, img").forEach((node) => {
      node.removeEventListener("dragstart", block);
    });
  };
}

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
  flow = false,
  zIndex,
  href,
  className,
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
  /** in-flow stacking for slug write-up pages (no overlap from guessed heights) */
  flow?: boolean;
  zIndex?: number;
  href?: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const saved = load(board)[id];
    if (saved) {
      const clamped = clampOffset(el, x, y, rotate, pinStyle, saved.x, saved.y);
      el.style.translate = `${clamped.x}px ${clamped.y}px`;
      if (clamped.x !== saved.x || clamped.y !== saved.y) {
        const next = load(board);
        next[id] = clamped;
        try {
          localStorage.setItem(storeKey(board), JSON.stringify(next));
        } catch {}
      }
    }

    const stopNative = killNativeDrag(el);
    if (!draggable) return stopNative;

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const start = load(board)[id] || { x: 0, y: 0 };
      const ox = e.clientX;
      const oy = e.clientY;
      const scale = boardScale(el) || 1;
      let cur = start;
      let dragging = false;

      const move = (ev: PointerEvent) => {
        const screenDx = ev.clientX - ox;
        const screenDy = ev.clientY - oy;
        if (!dragging && Math.hypot(screenDx, screenDy) < DRAG_THRESHOLD) return;
        if (!dragging) {
          dragging = true;
          el.setPointerCapture(e.pointerId);
          el.style.zIndex = String(++zTop);
          el.style.cursor = "grabbing";
          el.classList.add("cork-dragging");
        }
        ev.preventDefault();
        const dx = screenDx / scale;
        const dy = screenDy / scale;
        cur = clampOffset(el, x, y, rotate, pinStyle, start.x + dx, start.y + dy);
        el.style.translate = `${cur.x}px ${cur.y}px`;
      };

      const up = (ev: PointerEvent) => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerup", up);
        el.removeEventListener("pointercancel", up);
        el.style.cursor = "grab";
        el.classList.remove("cork-dragging");
        if (!dragging) return;
        ev.preventDefault();
        const swallow = (ce: Event) => {
          ce.preventDefault();
          ce.stopPropagation();
          el.removeEventListener("click", swallow, true);
        };
        el.addEventListener("click", swallow, true);
        const s = load(board);
        s[id] = cur;
        try {
          localStorage.setItem(storeKey(board), JSON.stringify(s));
        } catch {}
      };

      el.addEventListener("pointermove", move);
      el.addEventListener("pointerup", up);
      el.addEventListener("pointercancel", up);
    };

    el.addEventListener("pointerdown", onDown);
    return () => {
      stopNative();
      el.removeEventListener("pointerdown", onDown);
    };
  }, [board, id, draggable, x, y, rotate, pinStyle]);

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
        pointerEvents: "none",
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
          <div style={{ position: "absolute", right: 24, top: -12, width: 24, height: 24, borderRadius: "50%", backgroundImage: `radial-gradient(circle at 34% 30%, #ffffff 0 2px, ${pinColor} 3px 60%, #7d2418 100%)`, boxShadow: "2px 5px 8px rgba(20,10,0,0.5)", pointerEvents: "none" }} />
        </>
      )}
      {pinStyle === "staple" && (
        <>
          <div style={{ position: "absolute", left: 22, top: 20, width: 26, height: 5, background: "#9aa0a6", rotate: "-42deg", boxShadow: "0 1px 2px rgba(20,10,0,0.45)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", right: 22, bottom: 20, width: 26, height: 5, background: "#9aa0a6", rotate: "-42deg", boxShadow: "0 1px 2px rgba(20,10,0,0.45)", pointerEvents: "none" }} />
        </>
      )}
      {pinStyle === "tape" && (
        <div style={{ position: "absolute", left: "50%", top: -14, marginLeft: -34, width: 68, height: 26, background: "rgba(246,240,222,0.62)", boxShadow: "0 2px 5px rgba(20,10,0,0.22)", rotate: "-2deg", pointerEvents: "none" }} />
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
            backgroundImage: "var(--cork-curl)",
            boxShadow: "-4px -4px 10px rgba(20,10,0,0.4)",
            pointerEvents: "none",
          }}
        />
      )}
    </>
  );

  const shell: React.CSSProperties = {
    position: flow ? "relative" : "absolute",
    left: flow ? undefined : x,
    top: flow ? undefined : y,
    marginLeft: flow ? x : undefined,
    marginBottom: flow ? 56 : undefined,
    width,
    rotate: `${rotate}deg`,
    touchAction: draggable ? "none" : undefined,
    cursor: draggable ? "grab" : undefined,
    zIndex,
    boxSizing: "border-box",
    userSelect: "none",
    ...style,
  };

  return (
    <div
      ref={ref}
      data-board={board}
      data-pinned={id}
      style={shell}
      className={["cork-lift", className].filter(Boolean).join(" ")}
    >
      {href ? (
        <a
          href={href}
          {...(href.toLowerCase().includes(".pdf")
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
          style={{
            display: "block",
            color: "inherit",
            textDecoration: "none",
          }}
        >
          {inner}
        </a>
      ) : (
        inner
      )}
    </div>
  );
}
