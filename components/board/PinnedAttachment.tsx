// components/board/PinnedAttachment.tsx — renders one manifest entry.

import Image from "next/image";
import Pinned from "./Pinned";
import type { Attachment, Pin } from "@/lib/boardAttachments";

const MONO = "Cascadia, ui-monospace, monospace";

export default function PinnedAttachment({
  board,
  pin,
  draggable = true,
}: {
  board: string;
  pin: Pin & { attachment: Attachment };
  draggable?: boolean;
}) {
  const a = pin.attachment;
  const isSheet = a.kind === "sheet";
  const artW = isSheet ? a.width - 24 : a.width;
  const artH = Math.round(artW / a.aspect);

  return (
    <Pinned
      board={board}
      id={`att-${pin.id}`}
      x={pin.x}
      y={pin.y}
      width={a.width}
      rotate={pin.rotate ?? 0}
      pinStyle={pin.pinStyle ?? "pushpin"}
      curl={pin.curl ? 30 : 0}
      draggable={draggable}
      href={a.file}
      zIndex={8}
      className={isSheet ? undefined : "cork-sheet"}
      style={{
        background: isSheet ? "var(--cork-mount)" : undefined,
        padding: isSheet ? "12px 12px 0" : "10px 10px 4px",
        boxShadow: "0 1px 1px rgba(0,0,0,0.2), 0 18px 32px rgba(20,10,0,0.44)",
      }}
    >
      <div style={{ position: "relative", width: artW, height: artH, background: "var(--cork-art)", boxShadow: "inset 0 0 0 1px var(--cork-hairline)" }}>
        <Image src={a.src} alt={a.alt} fill sizes={`${artW}px`} draggable={false} style={{ objectFit: "cover" }} />
      </div>

      {isSheet ? (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "10px 2px 12px", fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: "var(--cork-ink3)" }}>
          <span>{a.label}</span>
          <span>{a.pages === 1 ? "1 PAGE" : `${a.pages ?? 1} PAGES`}</span>
        </div>
      ) : a.label ? (
        <div style={{ padding: "8px 4px 2px", fontFamily: "Excalifont, cursive", fontSize: 16, color: "var(--cork-ink2)" }}>
          {a.label}
        </div>
      ) : null}
    </Pinned>
  );
}
