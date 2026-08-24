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
}) {
  return (
    <Pinned
      board={board}
      id={id}
      x={x}
      y={y}
      width={168}
      rotate={rotate}
      pinStyle="tape"
      zIndex={6}
      style={{
        minHeight: 168,
        padding: "22px 18px 18px",
        backgroundColor: color,
        backgroundImage: `linear-gradient(184deg, ${wash} 0%, ${color} 100%)`,
        boxShadow: "0 2px 3px rgba(20,10,0,0.26), 10px 18px 28px rgba(20,10,0,0.34)",
      }}
    >
      <div
        style={{
          fontFamily: MONO,
          fontSize: 10,
          letterSpacing: "0.16em",
          color: ink,
          opacity: 0.7,
          marginBottom: 10,
        }}
      >
        {title.toUpperCase()}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {items.map((item) => (
          <div key={item} style={{ fontFamily: HAND, fontSize: 20, lineHeight: 1.25, color: ink }}>
            {item}
          </div>
        ))}
      </div>
    </Pinned>
  );
}
