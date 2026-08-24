// components/board/BoardScaler.tsx
"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { BOARD_W } from "@/lib/board";

/**
 * The board is authored at a fixed 1180px. This scales it DOWN to fit narrow
 * viewports (never up) and reserves the scaled height so the page flows.
 * Inner height is measured so slug boards can grow with in-flow sheets.
 */
export default function BoardScaler({
  height,
  children,
}: {
  height: number;
  children: React.ReactNode;
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [innerH, setInnerH] = useState(height);

  useLayoutEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const apply = () => {
      setScale(Math.min(1, outer.getBoundingClientRect().width / BOARD_W));
      setInnerH(inner.offsetHeight);
    };
    apply();

    const ro = new ResizeObserver(apply);
    ro.observe(outer);
    ro.observe(inner);
    return () => ro.disconnect();
  }, [height]);

  return (
    <div ref={outerRef} style={{ width: "100%", height: innerH * scale, overflow: "visible" }}>
      <div
        ref={innerRef}
        style={{
          width: BOARD_W,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          overflow: "visible",
        }}
      >
        {children}
      </div>
    </div>
  );
}
