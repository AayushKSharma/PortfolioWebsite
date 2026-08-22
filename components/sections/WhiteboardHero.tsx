"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react"

/**
 * Whiteboard hero — replaces Navbar + Hero on the landing page.
 * Visitors draw with the markers on the tray, erase (nav ink smudges away and
 * leaves residue), spray to wipe everything, ↻ to reset, wall switch for chalk mode.
 *
 * Fonts: expects /public/fonts/Excalifont + Virgil (already in this repo).
 */

const INK = {
  black: "#20242a",
  blue: "#1971c2",
  red: "#e03131",
  green: "#2f9e44",
} as const

type InkColor = (typeof INK)[keyof typeof INK]

const CHALK: Record<string, string> = {
  [INK.black]: "#f4f1e8",
  [INK.blue]: "#9ec9f2",
  [INK.red]: "#f2a2a2",
  [INK.green]: "#a6e2b4",
}

const CANVAS_W = 1054
const CANVAS_H = 600
const MASK_W = 527
const MASK_H = 300
const MARKER_WIDTH = 6
const LINK_CLICK_PX = 8

type Tool = "draw" | "erase"
type Stroke = { tool: Tool; color: InkColor; w: number; pts: { x: number; y: number }[] }

const MARKERS: { color: InkColor; label: string; barrel: string; rotate: number }[] = [
  { color: INK.black, label: "Black marker", barrel: "linear-gradient(#3a4048,#1b1f24)", rotate: -2 },
  { color: INK.blue, label: "Blue marker", barrel: "linear-gradient(#3b86d4,#12508f)", rotate: 1 },
  { color: INK.red, label: "Red marker", barrel: "linear-gradient(#ef5a5a,#b02121)", rotate: -1 },
  { color: INK.green, label: "Green marker", barrel: "linear-gradient(#4cbb63,#237a34)", rotate: 2 },
]

function subscribeHtmlClass(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
  return () => observer.disconnect()
}

function punchErase(
  m: HTMLCanvasElement,
  a: { x: number; y: number },
  b: { x: number; y: number },
) {
  const x = m.getContext("2d")!
  const s = m.width / CANVAS_W
  x.globalCompositeOperation = "destination-out"
  x.strokeStyle = "#000"
  x.lineCap = "round"
  x.lineJoin = "round"
  x.globalAlpha = 0.16
  x.lineWidth = 40 * s
  x.beginPath(); x.moveTo(a.x * s, a.y * s); x.lineTo(b.x * s, b.y * s); x.stroke()
  x.globalAlpha = 0.55
  x.lineWidth = 24 * s
  x.beginPath(); x.moveTo(a.x * s, a.y * s); x.lineTo(b.x * s, b.y * s); x.stroke()
  x.globalCompositeOperation = "source-over"
  x.globalAlpha = 1
  x.strokeStyle = "rgba(255,255,255,.055)"
  x.lineWidth = 22 * s
  x.beginPath(); x.moveTo(a.x * s, a.y * s); x.lineTo(b.x * s, b.y * s); x.stroke()
  x.strokeStyle = "rgba(255,255,255,.03)"
  x.lineWidth = 38 * s
  x.beginPath(); x.moveTo(a.x * s, a.y * s); x.lineTo(b.x * s, b.y * s); x.stroke()
}

const GHOST_STROKES: [number, number, number, number][][] = [
  // =3
  [[0.02, 0.1, 1.05, 0.72], [0.0, 0.85, 0.92, 0.18], [0.4, -0.1, 1.0, 0.95]],
  // TODO: make website
  [[-0.06, 0.15, 1.08, 0.58], [0.08, 0.82, 0.72, 0.08], [0.28, 0.95, 1.04, 0.38], [0.0, 0.4, 0.5, 0.9], [0.55, 0.05, 0.98, 0.7]],
  // Cool S
  [[0.05, -0.08, 0.92, 0.5], [0.0, 0.32, 1.05, 0.78], [0.18, 0.52, 0.95, 1.08], [0.62, 0.05, 0.08, 0.88]],
]

function useIsDark() {
  return useSyncExternalStore(
    subscribeHtmlClass,
    () => document.documentElement.classList.contains("dark"),
    () => false,
  )
}

export default function WhiteboardHero() {
  const { setTheme } = useTheme()
  const router = useRouter()
  const chalk = useIsDark()
  const [tool, setTool] = useState<Tool>("draw")
  const [color, setColor] = useState<InkColor>(INK.black)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const inkRef = useRef<HTMLDivElement>(null)
  const maskRef = useRef<HTMLCanvasElement | null>(null)
  const history = useRef<Stroke[]>([])
  const drawing = useRef(false)
  const last = useRef<{ x: number; y: number } | null>(null)
  const prev = useRef<{ x: number; y: number } | null>(null)
  const maskPending = useRef(false)
  const pendingLink = useRef<HTMLAnchorElement | null>(null)
  const downPt = useRef<{ x: number; y: number } | null>(null)
  const hoveredLink = useRef<HTMLAnchorElement | null>(null)

  const ink = (c: InkColor) => (chalk ? CHALK[c] : c)

  /* ---------------------------------------------------------------- mask */

  const mask = useCallback(() => {
    if (!maskRef.current) {
      const c = document.createElement("canvas")
      c.width = MASK_W
      c.height = MASK_H
      const x = c.getContext("2d")!
      x.fillStyle = "#fff"
      x.fillRect(0, 0, c.width, c.height)
      maskRef.current = c
    }
    return maskRef.current
  }, [])

  const flushMask = useCallback(() => {
    const el = inkRef.current
    if (!el || !maskRef.current) return
    const url = `url(${maskRef.current.toDataURL()})`
    el.style.webkitMaskImage = url
    el.style.maskImage = url
    el.style.webkitMaskSize = "100% 100%"
    el.style.maskSize = "100% 100%"
    el.style.webkitMaskRepeat = "no-repeat"
    el.style.maskRepeat = "no-repeat"
  }, [])

  const eraseMask = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    punchErase(mask(), a, b)
    if (!maskPending.current) {
      maskPending.current = true
      requestAnimationFrame(() => { maskPending.current = false; flushMask() })
    }
  }

  const smudgeGhosts = useCallback(() => {
    const inkEl = inkRef.current
    const cv = canvasRef.current
    if (!inkEl || !cv) return
    const board = cv.getBoundingClientRect()
    const sx = cv.width / board.width
    const sy = cv.height / board.height
    const m = mask()
    inkEl.querySelectorAll("[data-wb-ghost]").forEach((el, i) => {
      const r = el.getBoundingClientRect()
      const x = (r.left - board.left) * sx
      const y = (r.top - board.top) * sy
      const w = r.width * sx
      const h = r.height * sy
      const padX = 14 * sx
      const padY = 12 * sy
      for (const [ax, ay, bx, by] of GHOST_STROKES[i] ?? GHOST_STROKES[0]) {
        punchErase(
          m,
          { x: x - padX + ax * (w + padX * 2), y: y - padY + ay * (h + padY * 2) },
          { x: x - padX + bx * (w + padX * 2), y: y - padY + by * (h + padY * 2) },
        )
      }
    })
    flushMask()
  }, [mask, flushMask])

  /* -------------------------------------------------------------- canvas */

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const cv = e.currentTarget
    const r = cv.getBoundingClientRect()
    return { x: (e.clientX - r.left) * (cv.width / r.width), y: (e.clientY - r.top) * (cv.height / r.height) }
  }

  const hitUnderCanvas = (e: { clientX: number; clientY: number }) => {
    const cv = canvasRef.current
    if (!cv) return null
    const previous = cv.style.pointerEvents
    cv.style.pointerEvents = "none"
    const el = document.elementFromPoint(e.clientX, e.clientY)
    cv.style.pointerEvents = previous
    return el
  }

  const linkFromEvent = (e: { clientX: number; clientY: number }) => {
    const el = hitUnderCanvas(e)
    return el?.closest("a.wb-link") as HTMLAnchorElement | null
  }

  const setHovered = (link: HTMLAnchorElement | null) => {
    if (hoveredLink.current === link) return
    hoveredLink.current?.classList.remove("wb-hover")
    hoveredLink.current = link
    link?.classList.add("wb-hover")
  }

  const followAnchor = (a: HTMLAnchorElement, e: { metaKey: boolean; ctrlKey: boolean }) => {
    const href = a.getAttribute("href")
    if (!href) return
    const newTab = a.target === "_blank" || e.metaKey || e.ctrlKey
    if (href.startsWith("mailto:")) {
      window.location.href = href
      return
    }
    if (newTab || href.endsWith(".pdf")) {
      window.open(a.href, "_blank", "noopener,noreferrer")
      return
    }
    if (href.startsWith("/")) {
      router.push(href)
      return
    }
    window.location.assign(href)
  }

  const endStroke = () => {
    drawing.current = false
    last.current = null
    prev.current = null
    downPt.current = null
    pendingLink.current = null
  }

  const segment = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const cv = canvasRef.current
    if (!cv) return
    const ctx = cv.getContext("2d")!
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.globalAlpha = 1
    if (tool === "erase") {
      ctx.globalCompositeOperation = "destination-out"
      ctx.lineWidth = 52
      ctx.strokeStyle = "rgba(0,0,0,1)"
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke()
      ctx.globalCompositeOperation = "source-over"
      eraseMask(a, b)
      return
    }
    ctx.globalCompositeOperation = "source-over"
    ctx.strokeStyle = ink(color)
    ctx.lineWidth = MARKER_WIDTH
    ctx.beginPath()
    if (prev.current) {
      const m1 = { x: (prev.current.x + a.x) / 2, y: (prev.current.y + a.y) / 2 }
      const m2 = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
      ctx.moveTo(m1.x, m1.y)
      ctx.quadraticCurveTo(a.x, a.y, m2.x, m2.y)
    } else {
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(b.x, b.y)
    }
    ctx.stroke()
    prev.current = a
  }

  const startStroke = (e: React.PointerEvent<HTMLCanvasElement>, p: { x: number; y: number }) => {
    drawing.current = true
    prev.current = null
    last.current = p
    history.current.push({ tool, color, w: MARKER_WIDTH, pts: [p] })
    e.currentTarget.setPointerCapture?.(e.pointerId)
    segment(p, p)
  }

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const p = pos(e)
    downPt.current = p
    const link = linkFromEvent(e)
    if (link) {
      pendingLink.current = link
      return
    }
    pendingLink.current = null
    startStroke(e, p)
  }

  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (pendingLink.current && downPt.current) {
      const p = pos(e)
      const dx = p.x - downPt.current.x
      const dy = p.y - downPt.current.y
      if (dx * dx + dy * dy > LINK_CLICK_PX * LINK_CLICK_PX) {
        const start = downPt.current
        pendingLink.current = null
        setHovered(null)
        startStroke(e, start)
      } else {
        return
      }
    }
    if (!drawing.current || !last.current) {
      if (!drawing.current) {
        setHovered(linkFromEvent(e))
        e.currentTarget.style.cursor = hoveredLink.current
          ? "pointer"
          : tool === "erase"
            ? "grab"
            : "crosshair"
      }
      return
    }
    const p = pos(e)
    segment(last.current, p)
    history.current[history.current.length - 1]?.pts.push(p)
    last.current = p
  }

  const onUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (pendingLink.current) {
      followAnchor(pendingLink.current, e)
    }
    setHovered(linkFromEvent(e))
    endStroke()
  }

  const onLeave = () => {
    setHovered(null)
    endStroke()
  }

  useLayoutEffect(() => {
    smudgeGhosts()
  }, [smudgeGhosts])

  /* Replay strokes on the opposite palette when the lights flip. */
  useEffect(() => {
    const cv = canvasRef.current
    if (!cv) return
    const ctx = cv.getContext("2d")!
    ctx.clearRect(0, 0, cv.width, cv.height)
    for (const entry of history.current) {
      const pts = entry.pts
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.globalAlpha = 1
      if (entry.tool === "erase") {
        ctx.globalCompositeOperation = "destination-out"
        ctx.strokeStyle = "#000"
        ctx.lineWidth = 52
      } else {
        ctx.globalCompositeOperation = "source-over"
        ctx.strokeStyle = chalk ? CHALK[entry.color] : entry.color
        ctx.lineWidth = entry.w
      }
      ctx.beginPath()
      if (pts.length === 1) {
        ctx.moveTo(pts[0].x, pts[0].y)
        ctx.lineTo(pts[0].x + 0.01, pts[0].y)
      } else {
        ctx.moveTo(pts[0].x, pts[0].y)
        for (let i = 1; i < pts.length - 1; i++) {
          const m = { x: (pts[i].x + pts[i + 1].x) / 2, y: (pts[i].y + pts[i + 1].y) / 2 }
          ctx.quadraticCurveTo(pts[i].x, pts[i].y, m.x, m.y)
        }
        ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y)
      }
      ctx.stroke()
    }
    ctx.globalCompositeOperation = "source-over"
  }, [chalk])

  /* Room lighting lives on <body> so it spans the viewport with no seams. */
  useEffect(() => {
    const b = document.body.style
    b.minWidth = "1180px"
    b.backgroundColor = chalk ? "#151412" : "#a8926f"
    b.backgroundImage = chalk
      ? "repeating-linear-gradient(90deg, rgba(0,0,0,0) 0 118px, rgba(255,230,190,.022) 118px 120px), radial-gradient(72% 40% at 50% 0%, #2c2a26 0%, #232220 34%, #1b1a18 70%, #151412 100%)"
      : "repeating-linear-gradient(90deg, rgba(0,0,0,0) 0 118px, rgba(80,54,26,.045) 118px 120px), radial-gradient(72% 40% at 50% 0%, #f4e2c1 0%, #e6d2b0 30%, #cdb794 62%, #b39d7c 88%, #a8926f 100%)"
    b.backgroundRepeat = "repeat, no-repeat"
    b.backgroundSize = "auto, 100% 1400px"
  }, [chalk])

  useEffect(() => {
    return () => {
      const b = document.body.style
      b.minWidth = ""
      b.backgroundColor = ""
      b.backgroundImage = ""
      b.backgroundRepeat = ""
      b.backgroundSize = ""
      hoveredLink.current?.classList.remove("wb-hover")
      hoveredLink.current = null
    }
  }, [])

  const wipeAll = () => {
    const cv = canvasRef.current
    if (cv) cv.getContext("2d")!.clearRect(0, 0, cv.width, cv.height)
    history.current = []
    const m = mask()
    const x = m.getContext("2d")!
    x.globalCompositeOperation = "source-over"
    x.clearRect(0, 0, m.width, m.height)
    flushMask()
  }

  const resetBoard = () => {
    const cv = canvasRef.current
    if (cv) cv.getContext("2d")!.clearRect(0, 0, cv.width, cv.height)
    history.current = []
    const m = mask()
    const x = m.getContext("2d")!
    x.globalCompositeOperation = "source-over"
    x.fillStyle = "#fff"
    x.fillRect(0, 0, m.width, m.height)
    smudgeGhosts()
  }

  /* --------------------------------------------------------------- chrome */

  const raised = (active: boolean, rotate = 0) =>
    `translateY(${active ? -16 : 0}px) rotate(${rotate}deg)`

  const navLink: React.CSSProperties = {
    display: "inline-block",
    fontFamily: "Excalifont, Virgil, cursive",
    transition: "background .16s ease",
    padding: "0 6px",
    margin: "0 -6px",
    whiteSpace: "nowrap",
    cursor: "pointer",
  }

  return (
    <section style={{ width: 1180, minWidth: 1180, margin: "0 auto", position: "relative" }}>
      <div style={{ position: "relative", background: "transparent", padding: "52px 60px 0" }}>
        {/* wall light switch */}
        <div style={{ position: "absolute", top: 210, right: 4, zIndex: 6 }}>
          <button
            onClick={() => setTheme(chalk ? "light" : "dark")}
            aria-label="Lights"
            aria-pressed={chalk}
            style={{
              all: "unset", cursor: "pointer", position: "relative", display: "block",
              width: 48, height: 76, borderRadius: 5,
              background: chalk ? "linear-gradient(150deg,#4a453b,#332f28)" : "linear-gradient(150deg,#faf6ec,#e4ddcd)",
              boxShadow: chalk
                ? "0 3px 7px rgba(0,0,0,.5), 0 1px 0 rgba(255,240,214,.12) inset"
                : "0 3px 7px rgba(52,34,14,.3), 0 1px 0 rgba(255,255,255,.85) inset",
            }}
          >
            <span style={{ position: "absolute", left: "50%", top: 7, width: 5, height: 5, marginLeft: -2.5, borderRadius: "50%", background: "radial-gradient(circle at 35% 35%, #cfc8b8, #9c9483)" }} />
            <span style={{ position: "absolute", left: "50%", bottom: 7, width: 5, height: 5, marginLeft: -2.5, borderRadius: "50%", background: "radial-gradient(circle at 35% 35%, #cfc8b8, #9c9483)" }} />
            <span style={{ position: "absolute", left: 11, top: 17, width: 26, height: 42, borderRadius: 3, background: "linear-gradient(#d7d0c0,#bcb5a5)", boxShadow: "0 1px 3px rgba(52,34,14,.35) inset" }}>
              <span style={{ position: "absolute", left: 2, right: 2, top: 2, height: 19, borderRadius: 2, background: "linear-gradient(#fffdf8,#e6e0d2)", boxShadow: "0 2px 3px rgba(52,34,14,.35)", transform: `translateY(${chalk ? 19 : 0}px)`, transition: "transform .16s ease" }} />
            </span>
          </button>
        </div>

        {/* board */}
        <div style={{
          position: "relative", borderRadius: 10, padding: 13,
          background: chalk ? "linear-gradient(160deg,#6b5842 0%,#4a3c2c 40%,#33291e 100%)" : "linear-gradient(160deg,#f0ead9 0%,#c3bda9 40%,#968f7c 100%)",
          boxShadow: chalk
            ? "0 30px 52px rgba(0,0,0,.5), 0 2px 0 rgba(255,225,170,.14) inset"
            : "0 30px 52px rgba(52,34,14,.34), 0 8px 18px rgba(52,34,14,.18), 0 2px 0 rgba(255,250,236,.6) inset",
        }}>
          <div style={{
            position: "relative", height: CANVAS_H, borderRadius: 3, overflow: "hidden",
            background: chalk
              ? "linear-gradient(178deg,#25302b 0%,#1e2723 55%,#1a221f 100%)"
              : "radial-gradient(86% 68% at 34% -8%, #fffdf5 0%, #faf6ea 38%, #f1ebdb 76%, #e7e0ce 100%)",
            boxShadow: chalk
              ? "0 1px 0 rgba(255,255,255,.06) inset, 0 -2px 10px rgba(0,0,0,.5) inset"
              : "0 1px 0 rgba(70,48,22,.14) inset, 0 -20px 44px rgba(70,48,22,.11) inset, 0 0 60px rgba(70,48,22,.07) inset",
          }}>
            {/* glare — below the ink so it never washes out the writing */}
            <div style={{
              position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
              background: chalk
                ? "linear-gradient(102deg, rgba(255,255,255,.06) 0 18%, rgba(255,255,255,0) 42%)"
                : "linear-gradient(102deg, rgba(255,245,222,.58) 0 18%, rgba(255,245,222,0) 42%), radial-gradient(66% 44% at 32% -12%, rgba(255,240,206,.5), transparent 66%), radial-gradient(60% 42% at 18% 96%, rgba(74,52,26,.10), transparent 72%)",
            }} />
            <div style={{ position: "absolute", right: "10%", top: "8%", width: "30%", height: "34%", borderRadius: "50%", pointerEvents: "none", background: `radial-gradient(closest-side, rgba(${chalk ? "255,255,255,.06" : "120,130,140,.13"}), transparent 72%)` }} />

            {/* marker ink — a grid, so nothing can collide */}
            <div ref={inkRef} style={{
              position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
              color: ink(INK.black), fontFamily: "Excalifont, Virgil, cursive",
              display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,auto)",
              gridTemplateRows: "auto 1fr auto", columnGap: 48, rowGap: 26,
              padding: "48px 60px 44px", alignItems: "start",
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
                <div style={{ position: "relative", fontSize: 84, lineHeight: 1, transform: "rotate(-1.6deg)" }}>
                  yush<span style={{ color: ink(INK.red) }}>.</span>
                  <span data-wb-ghost style={{
                    position: "absolute", left: "104%", top: "-0.28em",
                    fontSize: 30, lineHeight: 1, color: ink(INK.red),
                    transform: "rotate(-12deg)",
                  }}>=3</span>
                </div>
                <div style={{ fontSize: 25, color: chalk ? "#cfcabd" : "#3d4450", maxWidth: 420, lineHeight: 1.45, transform: "rotate(-.6deg)" }}>
                  music-loving software engineer<br />who loves building on the web
                </div>
              </div>

              <div style={{ justifySelf: "end", fontSize: 24, color: ink(INK.green), lineHeight: 1.65, textAlign: "right", transform: "rotate(1.4deg)" }}>
                TypeScript<br />PostgreSQL<br />Express.js
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 22, alignItems: "flex-start", pointerEvents: "auto", paddingTop: 12 }}>
                <div style={{ transform: "rotate(-2deg)" }}>
                  <Link className="wb-link" href="/blog" style={{ ...navLink, fontSize: 40, lineHeight: 1.15, color: ink(INK.blue) }}>
                    Blog
                    <svg viewBox="0 0 120 16" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: 12, marginTop: 2, overflow: "visible" }}>
                      <path d="M4 9 C 36 2, 80 15, 116 5" fill="none" stroke={ink(INK.blue)} strokeWidth="3.2" strokeLinecap="round" />
                    </svg>
                  </Link>
                </div>
                <div style={{ display: "flex", gap: 36, flexWrap: "wrap", marginTop: 8 }}>
                  <a className="wb-link" href="/files/Aayush-Kumar-Sharma_Resume.pdf" target="_blank" rel="noopener noreferrer" style={{ ...navLink, fontSize: 27, color: ink(INK.black), transform: "rotate(.8deg)" }}>résumé.pdf</a>
                  <a className="wb-link" href="https://github.com/AayushKSharma" target="_blank" rel="noopener noreferrer" style={{ ...navLink, fontSize: 27, color: ink(INK.black), transform: "rotate(-1.4deg)" }}>github</a>
                  <a className="wb-link" href="mailto:aayushksharma1@gmail.com" style={{ ...navLink, fontSize: 27, color: ink(INK.black), transform: "rotate(.8deg)" }}>reach out!</a>
                </div>
                <svg viewBox="0 0 300 26" preserveAspectRatio="none" style={{ display: "block", width: 296, height: 22, overflow: "visible" }}>
                  <path d="M4 12 C 90 26, 190 2, 292 16" fill="none" stroke={ink(INK.red)} strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>

              <div style={{ justifySelf: "end", alignSelf: "center", display: "flex", flexDirection: "column", gap: 20, alignItems: "flex-end", pointerEvents: "auto" }}>
                <div style={{ transform: "rotate(1.2deg)" }}>
                  <Link className="wb-link" href="/projects" style={{ ...navLink, fontSize: 38, lineHeight: 1.15, color: ink(INK.blue) }}>
                    Projects &amp; Experience
                    <svg viewBox="0 0 360 16" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: 12, marginTop: 2, overflow: "visible" }}>
                      <path d="M4 10 C 90 1, 210 16, 354 4" fill="none" stroke={ink(INK.blue)} strokeWidth="3.2" strokeLinecap="round" />
                    </svg>
                  </Link>
                </div>
                <Link className="wb-link" href="/projects/aotw" style={{ ...navLink, fontSize: 22, color: ink(INK.black), transform: "rotate(1.8deg)" }}>ship aotw v2</Link>
              </div>

              <div style={{
                gridColumn: "1 / -1", display: "flex", justifyContent: "space-between",
                alignItems: "flex-end", width: "100%", paddingRight: 36,
              }}>
                <div data-wb-ghost style={{ fontSize: 24, color: ink(INK.black), transform: "rotate(-3deg)" }}>
                  TODO: make website
                </div>
                <div data-wb-ghost style={{ transform: "rotate(5deg)", marginBottom: 4 }}>
                  <CoolS color={ink(INK.black)} />
                </div>
              </div>
            </div>

            <button
              className="wb-reset"
              onClick={resetBoard}
              title="Reset the board"
              style={{
                all: "unset", position: "absolute", right: 22, bottom: 16, zIndex: 6, cursor: "pointer",
                fontFamily: "Excalifont, Virgil, cursive", fontSize: 26, lineHeight: 1,
                color: chalk ? "rgba(232,228,214,.72)" : "#8a8378", padding: 6,
                transition: "color .18s ease, transform .35s ease",
              }}
            >↻</button>

            <canvas
              ref={canvasRef}
              width={CANVAS_W}
              height={CANVAS_H}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onLeave}
              onPointerLeave={onLeave}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 4, cursor: tool === "erase" ? "grab" : "crosshair", touchAction: "none" }}
            />
          </div>
        </div>

        {/* tray */}
        <div style={{ position: "relative", margin: "0 -10px", height: 74, zIndex: 5 }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 16, background: "linear-gradient(#efe7d5,#b7b0a0)", borderRadius: "3px 3px 0 0", boxShadow: "0 1px 0 rgba(255,251,240,.7) inset" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 16, height: 34, background: "linear-gradient(#9b9384,#78715f)", boxShadow: "0 -6px 10px rgba(46,30,12,.32) inset, 0 12px 20px rgba(46,30,12,.30)" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 50, height: 12, background: "linear-gradient(#635c4d,#4a443a)", borderRadius: "0 0 4px 4px" }} />

          <div style={{ position: "absolute", left: 44, top: -4, display: "flex", alignItems: "flex-end", gap: 22, zIndex: 2 }}>
            {MARKERS.map(m => {
              const active = tool === "draw" && color === m.color
              return (
                <button key={m.color} title={m.label} onClick={() => { setTool("draw"); setColor(m.color) }} style={{ all: "unset", cursor: "pointer", display: "block" }}>
                  <span style={{
                    display: "block",
                    width: chalk ? 62 : 104, height: chalk ? 30 : 26, borderRadius: chalk ? 3 : 5,
                    background: chalk ? `linear-gradient(178deg, ${CHALK[m.color]} 0%, ${CHALK[m.color]} 58%, rgba(0,0,0,.14) 100%)` : m.barrel,
                    boxShadow: "0 3px 5px rgba(0,0,0,.35), 0 1px 0 rgba(255,255,255,.25) inset",
                    position: "relative",
                    transform: raised(active, m.rotate),
                    transition: "transform .26s cubic-bezier(.34,1.28,.64,1)",
                  }}>
                    {!chalk && <span style={{ position: "absolute", right: -14, top: 5, width: 18, height: 16, borderRadius: "2px 4px 4px 2px", background: "linear-gradient(#d8dade,#a9adb2)" }} />}
                  </span>
                </button>
              )
            })}

            <button title="Eraser" onClick={() => setTool("erase")} style={{ all: "unset", cursor: "pointer", display: "block", marginLeft: 14 }}>
              <span style={{
                display: "block", width: 96, height: 36, borderRadius: 4,
                background: chalk ? "linear-gradient(#3a3630 0 44%, #d9d3c4 44% 100%)" : "linear-gradient(#2b2f34 0 46%, #b9b2a4 46% 100%)",
                boxShadow: "0 3px 6px rgba(0,0,0,.35), 0 1px 0 rgba(255,255,255,.2) inset",
                transform: raised(tool === "erase"),
                transition: "transform .26s cubic-bezier(.34,1.28,.64,1)",
              }} />
            </button>

            <SprayButton onClick={wipeAll} />
          </div>
        </div>

        <div style={{ height: 26 }} />
      </div>
    </section>
  )
}

function CoolS({ color }: { color: string }) {
  return (
    <svg
      viewBox="0 0 70 124"
      width={46}
      height={82}
      aria-hidden
      style={{ display: "block", overflow: "visible" }}
    >
      <g fill="none" stroke={color} strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="14,26 35,6 56,26" />
        <line x1="14" y1="26" x2="14" y2="50" />
        <line x1="35" y1="26" x2="35" y2="50" />
        <line x1="56" y1="26" x2="56" y2="50" />
        <line x1="14" y1="50" x2="35" y2="74" />
        <line x1="35" y1="50" x2="56" y2="74" />
        <line x1="56" y1="50" x2="42" y2="58" />
        <line x1="28" y1="66" x2="14" y2="74" />
        <line x1="14" y1="74" x2="14" y2="98" />
        <line x1="35" y1="74" x2="35" y2="98" />
        <line x1="56" y1="74" x2="56" y2="98" />
        <polyline points="14,98 35,118 56,98" />
      </g>
    </svg>
  )
}

function SprayButton({ onClick }: { onClick: () => void }) {
  const [bump, setBump] = useState(false)
  return (
    <button
      title="Board cleaner — wipes everything"
      onClick={() => { onClick(); setBump(true); setTimeout(() => setBump(false), 420) }}
      style={{ all: "unset", cursor: "pointer", display: "block", marginLeft: 10 }}
    >
      <span style={{
        display: "block", position: "relative", width: 44, height: 56, borderRadius: "6px 6px 5px 5px",
        background: "linear-gradient(100deg, rgba(255,255,255,.55), rgba(120,180,150,.75))",
        border: "1px solid rgba(255,255,255,.6)", boxShadow: "0 3px 6px rgba(0,0,0,.3)",
        transform: `translateY(${bump ? -12 : 0}px)`, transition: "transform .26s cubic-bezier(.34,1.28,.64,1)",
      }}>
        <span style={{ position: "absolute", left: 12, top: -13, width: 20, height: 14, borderRadius: 3, background: "linear-gradient(#e9ecef,#b7bcc1)" }} />
        <span style={{ position: "absolute", left: 6, bottom: 6, right: 6, height: 22, borderRadius: 3, background: "rgba(255,255,255,.35)" }} />
      </span>
    </button>
  )
}
