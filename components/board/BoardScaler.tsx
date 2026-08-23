// components/board/BoardScaler.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { BOARD_W } from "@/lib/board";

/**
 * The board is authored at a fixed 1180px. This scales it DOWN to fit narrow
 * viewports (never up) and reserves the scaled height so the page flows.
 */
export default function BoardScaler({
  height,
  children,
}: {
  height: number;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setScale(Math.min(1, entry.contentRect.width / BOARD_W));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ width: "100%", height: height * scale }}>
      <div
        style={{
          width: BOARD_W,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  );
}
