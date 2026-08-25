// components/sections/AboutBoard.tsx
//
// Replaces components/sections/About.tsx. Same copy and links; the framer-motion
// reveal is gone — the board is the entrance.

import Link from "next/link";
import type { CSSProperties } from "react";
import BoardFrame from "@/components/board/BoardFrame";
import Pinned from "@/components/board/Pinned";
import PinnedAttachment from "@/components/board/PinnedAttachment";
import { pinsFor, pinHeight } from "@/lib/boardAttachments";
import { colX, spanWidth, rotationFor, MOBILE_PAD, MOBILE_TOP } from "@/lib/board";

const BOARD = "about";
const MONO = "Cascadia, ui-monospace, monospace";
const LINK: CSSProperties = { color: "inherit", textDecoration: "underline" };

function AboutCopy() {
  return (
    <>
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
    </>
  );
}

export default function AboutBoard() {
  return (
    <>
      <div className="max-[700px]:hidden">
        <AboutBoardView />
      </div>
      <div className="min-[701px]:hidden">
        <AboutBoardView mobile />
      </div>
    </>
  );
}

export function AboutBoardView({ mobile = false }: { mobile?: boolean }) {
  if (mobile) {
    return (
      <section>
        <BoardFrame title="about me" meta="SOFTWARE ENGINEER · DALLAS, TX" height={240} stickyRotate={-3} fluid fit>
          <div style={{ paddingTop: MOBILE_TOP, paddingBottom: 28 }}>
            <Pinned
              board={`${BOARD}-m`}
              id="about-sheet"
              x={MOBILE_PAD}
              y={0}
              width={320}
              rotate={-0.4}
              pinStyle="two-pin"
              curl={18}
              flow
              draggable={false}
              className="cork-sheet"
              style={{
                padding: "22px 20px 20px",
                boxShadow: "0 1px 1px rgba(0,0,0,0.16), 0 14px 26px rgba(50,30,10,0.28)",
                width: `calc(100% - ${MOBILE_PAD * 2}px)`,
                marginBottom: 22,
              }}
            >
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.18em", color: "var(--cork-ink3)", marginBottom: 12 }}>
                ABOUT
              </div>
              <div style={{ fontFamily: MONO, fontSize: 13.5, lineHeight: 1.9, color: "var(--cork-ink2)", textWrap: "pretty" }}>
                <AboutCopy />
              </div>
            </Pinned>

            <Pinned
              board={`${BOARD}-m`}
              id="about-note"
              x={MOBILE_PAD}
              y={0}
              width={320}
              rotate={rotationFor("about-note", 2)}
              pinColor="#3f6f9a"
              flow
              draggable={false}
              style={{
                padding: "16px 18px 20px",
                backgroundColor: "#f7f5ea",
                backgroundImage:
                  "linear-gradient(rgba(120,140,160,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(120,140,160,0.16) 1px, transparent 1px)",
                backgroundSize: "21px 21px, 21px 21px",
                boxShadow: "0 1px 1px rgba(0,0,0,0.14), 0 12px 22px rgba(50,30,10,0.26)",
                width: `calc(100% - ${MOBILE_PAD * 2}px)`,
                marginBottom: 8,
              }}
            >
              <div style={{ fontFamily: "Excalifont, cursive", fontSize: 18, lineHeight: 1.45, color: "#2c3540" }}>
                currently: re-reading Hunter x Hunter &amp; working on an Obsidian clone
              </div>
            </Pinned>
          </div>
        </BoardFrame>
      </section>
    );
  }

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
          className="cork-sheet"
          style={{
            padding: "34px 36px 30px",
            boxShadow: "0 1px 1px rgba(0,0,0,0.16), 0 14px 26px rgba(50,30,10,0.28)",
          }}
        >
          <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.18em", color: "var(--cork-ink3)", marginBottom: 14 }}>
            ABOUT
          </div>
          <div style={{ fontFamily: MONO, fontSize: 14, lineHeight: 1.95, color: "var(--cork-ink2)", textWrap: "pretty" }}>
            <AboutCopy />
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
