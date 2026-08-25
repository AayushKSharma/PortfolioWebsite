// components/sections/WriteupBoard.tsx — project / blog slug cork boards.

import type { ReactNode } from "react";
import { MDXRemote } from "next-mdx-remote/rsc";
import { rotationFor, MOBILE_PAD, MOBILE_TOP } from "@/lib/board";
import { estimateSheetHeight, type Sheet } from "@/lib/sheets";
import { pinHeight, type Attachment, type Pin } from "@/lib/boardAttachments";
import { mdxComponents } from "@/components/mdx";
import BoardFrame from "@/components/board/BoardFrame";
import StapledSheet from "@/components/board/StapledSheet";
import PinnedAttachment from "@/components/board/PinnedAttachment";

type LaidPin = Pin & { attachment: Attachment };

function mobileTopForTitle(title: string) {
  const lines = Math.max(2, Math.ceil(title.length / 11));
  return Math.max(MOBILE_TOP, 52 + lines * 23);
}

export default function WriteupBoard({
  board,
  title,
  backHref,
  stickyRotate = -2.4,
  sheets,
  pins,
  lead,
  firstSheetAsProseHeading = false,
  leadEyebrow,
}: {
  board: string;
  title: string;
  backHref: string;
  stickyRotate?: number;
  sheets: Sheet[];
  pins: LaidPin[];
  lead: (compact: boolean) => ReactNode;
  /** project write-ups put the first heading in the prose, not the sheet header */
  firstSheetAsProseHeading?: boolean;
  leadEyebrow: string;
}) {
  return (
    <>
      <div className="max-[700px]:hidden">
        <WriteupView
          board={board}
          title={title}
          backHref={backHref}
          stickyRotate={stickyRotate}
          sheets={sheets}
          pins={pins}
          lead={lead(false)}
          leadEyebrow={leadEyebrow}
          firstSheetAsProseHeading={firstSheetAsProseHeading}
        />
      </div>
      <div className="min-[701px]:hidden">
        <WriteupView
          board={`${board}-m`}
          title={title}
          backHref={backHref}
          stickyRotate={stickyRotate}
          sheets={sheets}
          pins={[]}
          lead={lead(true)}
          leadEyebrow={leadEyebrow}
          firstSheetAsProseHeading={firstSheetAsProseHeading}
          compact
        />
      </div>
    </>
  );
}

function WriteupView({
  board,
  title,
  backHref,
  stickyRotate,
  sheets,
  pins,
  lead,
  leadEyebrow,
  firstSheetAsProseHeading,
  compact = false,
}: {
  board: string;
  title: string;
  backHref: string;
  stickyRotate: number;
  sheets: Sheet[];
  pins: LaidPin[];
  lead: ReactNode;
  leadEyebrow: string;
  firstSheetAsProseHeading: boolean;
  compact?: boolean;
}) {
  const padTop = compact ? mobileTopForTitle(title) : 66;
  const laid = sheets.map((s, i) => ({
    sheet: s,
    x: compact ? MOBILE_PAD : 160 + ((i * 17) % 36),
    rotate: rotationFor(board + i, compact ? 0.5 : 0.9),
  }));

  let y = padTop;
  sheets.forEach((s, i) => {
    y += estimateSheetHeight(s, compact ? 320 : 864, i === 0 ? (compact ? 140 : 240) : 0) + (compact ? 22 : 56);
  });
  const height = Math.max(
    y + 40,
    ...pins.map((p) => p.y + pinHeight(p) + 44),
  );

  return (
    <BoardFrame
      title={title}
      height={compact ? 240 : height}
      stickyRotate={stickyRotate}
      fit
      fluid={compact}
      backHref={backHref}
    >
      <div style={{ paddingTop: padTop, paddingBottom: compact ? 28 : 72 }}>
        {laid.map((l, i) => (
          <StapledSheet
            key={i}
            board={board}
            id={`sheet-${i}`}
            x={l.x}
            y={0}
            rotate={l.rotate}
            flow
            compact={compact}
            eyebrow={i === 0 ? leadEyebrow : undefined}
            heading={i === 0 ? undefined : l.sheet.heading}
            page={i + 1}
            pages={laid.length}
            lead={i === 0 ? lead : undefined}
          >
            {i === 0 && firstSheetAsProseHeading && l.sheet.heading ? (
              <h2>{l.sheet.heading}</h2>
            ) : null}
            {l.sheet.body ? <MDXRemote source={l.sheet.body} components={mdxComponents} /> : null}
          </StapledSheet>
        ))}
      </div>

      {pins.map((pin) => (
        <PinnedAttachment key={pin.id} board={board} pin={pin} />
      ))}
    </BoardFrame>
  );
}
