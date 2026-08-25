// components/board/StickyNote.tsx — a square post-it on the cork.

import Pinned from "./Pinned";

const MONO = "Cascadia, ui-monospace, monospace";
const HAND = "Excalifont, cursive";

export default function StickyNote({
  board,
  id,
  x,
  y,
  rotate,
  color,
  wash,
  ink,
  title,
  items,
  flow = false,
  width = 168,
  draggable = true,
}: {
  board: string;
  id: string;
  x: number;
  y: number;
  rotate: number;
  color: string;
  wash: string;
  ink: string;
  title: string;
  items: string[];
  flow?: boolean;
  width?: number;
  draggable?: boolean;
}) {
  return (
    <Pinned
      board={board}
      id={id}
      x={x}
      y={y}
      width={width}
      rotate={rotate}
      pinStyle="tape"
      zIndex={6}
      flow={flow}
      draggable={draggable}
      style={{
        minHeight: flow ? 150 : 168,
        padding: flow ? "18px 14px 14px" : "22px 18px 18px",
        backgroundColor: color,
        backgroundImage: `linear-gradient(184deg, ${wash} 0%, ${color} 100%)`,
        boxShadow: "0 2px 3px rgba(20,10,0,0.26), 10px 18px 28px rgba(20,10,0,0.34)",
        ...(flow ? { width: "100%", marginBottom: 0 } : {}),
      }}
    >
      <div
        style={{
          fontFamily: MONO,
          fontSize: flow ? 9 : 10,
          letterSpacing: flow ? "0.1em" : "0.16em",
          color: ink,
          opacity: 0.7,
          marginBottom: 10,
        }}
      >
        {title.toUpperCase()}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: flow ? 3 : 4 }}>
        {items.map((item) => (
          <div key={item} style={{ fontFamily: HAND, fontSize: flow ? 17 : 20, lineHeight: 1.25, color: ink }}>
            {item}
          </div>
        ))}
      </div>
    </Pinned>
  );
}
