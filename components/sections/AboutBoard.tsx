// components/sections/AboutBoard.tsx
//
// Replaces components/sections/About.tsx. Same copy and links; the framer-motion
// reveal is gone — the board is the entrance.

import Link from "next/link";
import BoardFrame from "@/components/board/BoardFrame";
import Pinned from "@/components/board/Pinned";
import PinnedAttachment from "@/components/board/PinnedAttachment";
import { pinsFor, pinHeight } from "@/lib/boardAttachments";
import { colX, spanWidth } from "@/lib/board";

const BOARD = "about";
const MONO = "Cascadia, ui-monospace, monospace";
const LINK: React.CSSProperties = { color: "inherit", textDecoration: "underline" };

export default function AboutBoard() {
  const pins = pinsFor(BOARD);
  const height = Math.max(520, ...pins.map((p) => p.y + pinHeight(p) + 44));

  return (
    <section>
      <BoardFrame title="about me" meta="SOFTWARE ENGINEER · DALLAS, TX" height={height} stickyRotate={-3}>
        <Pinned
          board={BOARD}
          id="about-sheet"
          x={colX(0)}
          y={138}
          width={spanWidth(2)}
          rotate={-0.6}
          pinStyle="two-pin"
          curl={26}
          style={{
            background: "var(--cork-paper)",
            backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.5), rgba(0,0,0,0.02))",
            padding: "34px 36px 30px",
            boxShadow: "0 1px 1px rgba(0,0,0,0.16), 0 14px 26px rgba(50,30,10,0.28)",
          }}
        >
          <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.18em", color: "#8a6a3d", marginBottom: 14 }}>
            ABOUT
          </div>
          <div style={{ fontFamily: MONO, fontSize: 14, lineHeight: 1.95, color: "var(--cork-ink2)", textWrap: "pretty" }}>
            <p style={{ margin: "0 0 15px" }}>
              I&apos;m a software engineer based in Dallas, Texas. I greatly enjoy discovering and
              listening to music (see my work for{" "}
              <Link href="/projects/aotw" style={LINK}>Album of the Week</Link> or my{" "}
              <a href="https://open.spotify.com/user/meowmaster6400?si=2d52bb77274947b4" target="_blank" rel="noopener noreferrer" style={LINK}>Spotify</a>).
            </p>
            <p style={{ margin: "0 0 15px" }}>
              During my mathematics undergrad at Texas A&amp;M University, I was working on{" "}
              <Link href="/projects/aotw" style={LINK}>Album of the Week</Link>. Now I&apos;m forward
              deployed in AI systems at{" "}
              <a href="https://valiantresidential.com/" target="_blank" rel="noopener noreferrer" style={LINK}>Valiant Residential</a>.
            </p>
            <p style={{ margin: 0 }}>
              I care a lot about developer experience, backend / systems engineering, and writing
              software that other people actually enjoy using.
            </p>
          </div>
        </Pinned>

        {/* graph paper holds handwriting only */}
        <Pinned
          board={BOARD}
          id="about-note"
          x={colX(2) - 12}
          y={150}
          width={212}
          rotate={2.2}
          pinColor="#3f6f9a"
          style={{
            padding: "20px 22px 26px",
            backgroundColor: "#f7f5ea",
            backgroundImage:
              "linear-gradient(rgba(120,140,160,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(120,140,160,0.16) 1px, transparent 1px)",
            backgroundSize: "21px 21px, 21px 21px",
            boxShadow: "0 1px 1px rgba(0,0,0,0.14), 0 12px 22px rgba(50,30,10,0.26)",
          }}
        >
          <div style={{ fontFamily: "Excalifont, cursive", fontSize: 19, lineHeight: 1.45, color: "#2c3540" }}>
            currently: re-reading Hunter x Hunter &amp; working on an Obsidian clone
          </div>
        </Pinned>

        {pins.map((pin) => (
          <PinnedAttachment key={pin.id} board={BOARD} pin={pin} />
        ))}
      </BoardFrame>
    </section>
  );
}
