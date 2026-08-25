// components/board/BoardScaler.tsx
"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { BOARD_W } from "@/lib/board";

/**
 * Desktop boards are authored at a fixed 1180px. This scales them DOWN to fit
 * mid-width viewports (never up) and reserves the scaled height so the page
 * flows. Inner height is measured so slug boards can grow with in-flow sheets.
 *
 * Phone boards are fluid (width 100%, native type) — no transform.
 */
export default function BoardScaler({
  height,
  boardW = BOARD_W,
  fluid = false,
  children,
}: {
  height: number;
  boardW?: number;
  fluid?: boolean;
  children: React.ReactNode;
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [innerH, setInnerH] = useState(height);

  useLayoutEffect(() => {
    if (fluid) return;
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const apply = () => {
      setScale(Math.min(1, outer.getBoundingClientRect().width / boardW));
      setInnerH(inner.offsetHeight);
    };
    apply();

    const ro = new ResizeObserver(apply);
    ro.observe(outer);
    ro.observe(inner);
    return () => ro.disconnect();
  }, [height, boardW, fluid]);

  if (fluid) {
    return <div style={{ width: "100%", overflow: "visible" }}>{children}</div>;
  }

  return (
    <div ref={outerRef} style={{ width: "100%", height: innerH * scale, overflow: "visible" }}>
      <div
        ref={innerRef}
        style={{
          width: boardW,
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
