"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react"
import LightsSwitch from "@/components/ui/LightsSwitch"

/**
 * Whiteboard hero — desktop board + a re-flowed portrait board for phones.
 *
 * Changes vs. the current file:
 *  - useIsNarrow() (matchMedia) picks the layout; ONE canvas / mask / stroke
 *    history is shared, so drawing, erasing and chalk mode work in both.
 *  - board geometry, tray sizes, marker lift and the chalk-stick size are all
 *    derived from the active layout instead of hardcoded desktop numbers.
 *  - body min-width:1180px is only applied on the desktop layout (it is what
 *    forced the phone to show half a board).
 *  - every phone control gets an invisible >=44px hit box (padding + negative
 *    margin) so the drawn artwork keeps its size.
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

const DESKTOP = { cw: 1054, ch: 600, lift: 16 }
const MOBILE = { cw: 652, ch: 988, lift: 9 }

const MARKER_WIDTH = 6
const LINK_CLICK_PX = 8
const ERASE_BRUSH = 40
const INK_MASK_ID = "wb-ink-mask"

const TAGLINE = (
  <>
    a music-loving software engineer:<br />backend &amp; FD in AI systems
  </>
)

type Tool = "draw" | "erase"
type Stroke = { tool: Tool; color: InkColor; w: number; pts: { x: number; y: number }[] }

const MARKERS: { color: InkColor; label: string; barrel: string; rotate: number }[] = [
  { color: INK.black, label: "Black marker", barrel: "linear-gradient(#3a4048,#1b1f24)", rotate: -2 },
  { color: INK.blue, label: "Blue marker", barrel: "linear-gradient(#3b86d4,#12508f)", rotate: 1 },
  { color: INK.red, label: "Red marker", barrel: "linear-gradient(#ef5a5a,#b02121)", rotate: -1 },
  { color: INK.green, label: "Green marker", barrel: "linear-gradient(#4cbb63,#237a34)", rotate: 2 },
]

/* ------------------------------------------------------------------ stores */

function subscribeHtmlClass(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
  return () => observer.disconnect()
}

function useIsDark() {
  return useSyncExternalStore(
    subscribeHtmlClass,
    () => document.documentElement.classList.contains("dark"),
    () => false,
  )
}

/** Phone layout below 700px. SSR renders the desktop board (no layout shift on desktop). */
function useIsNarrow() {
  return useSyncExternalStore(
    (onChange: () => void) => {
      const mq = window.matchMedia("(max-width: 700px)")
      mq.addEventListener("change", onChange)
      return () => mq.removeEventListener("change", onChange)
    },
    () => window.matchMedia("(max-width: 700px)").matches,
    () => false,
  )
}

/* ------------------------------------------------------------------ erasing */

function stampErase(
  ctx: CanvasRenderingContext2D,
  a: { x: number; y: number },
  b: { x: number; y: number },
  size: number,
) {
  ctx.save()
  ctx.lineCap = "round"
  ctx.lineJoin = "round"
  ctx.globalCompositeOperation = "destination-out"
  ctx.strokeStyle = "#000"
  ctx.globalAlpha = 0.16
  ctx.lineWidth = size
  ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke()
  ctx.globalAlpha = 0.55
  ctx.lineWidth = size * 0.6
  ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke()
  // add a little alpha back — marker residue caked onto the board
  ctx.globalCompositeOperation = "source-over"
  ctx.globalAlpha = 1
  ctx.strokeStyle = "rgba(255,255,255,.055)"
  ctx.lineWidth = size * 0.55
  ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke()
  ctx.strokeStyle = "rgba(255,255,255,.03)"
  ctx.lineWidth = size * 0.95
  ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke()
  ctx.restore()
}

function smudgeLocal(el: HTMLElement, strokes: [number, number, number, number][]) {
  const r = el.getBoundingClientRect()
  const w = Math.max(2, Math.round(r.width * 2))
  const h = Math.max(2, Math.round(r.height * 2))
  const c = document.createElement("canvas")
  c.width = w
  c.height = h
  const ctx = c.getContext("2d")!
  ctx.fillStyle = "#fff"
  ctx.fillRect(0, 0, w, h)
  const brush = Math.min(w, h) * 0.28
  for (const [ax, ay, bx, by] of strokes) {
    stampErase(ctx, { x: ax * w, y: ay * h }, { x: bx * w, y: by * h }, brush)
  }
  const url = `url("${c.toDataURL()}")`
  el.style.webkitMaskImage = url
  el.style.maskImage = url
  el.style.webkitMaskSize = "100% 100%"
  el.style.maskSize = "100% 100%"
  el.style.webkitMaskRepeat = "no-repeat"
  el.style.maskRepeat = "no-repeat"
}

const GHOST_STROKES: [number, number, number, number][][] = [
  [[0.12, 0.28, 0.88, 0.58], [0.18, 0.72, 0.82, 0.32], [0.4, 0.18, 0.78, 0.76]],
  [[-0.06, 0.15, 1.08, 0.58], [0.08, 0.82, 0.72, 0.08], [0.28, 0.95, 1.04, 0.38], [0.0, 0.4, 0.5, 0.9], [0.55, 0.05, 0.98, 0.7]],
  [[0.05, -0.08, 0.92, 0.5], [0.0, 0.32, 1.05, 0.78], [0.18, 0.52, 0.95, 1.08], [0.62, 0.05, 0.08, 0.88]],
]

/* -------------------------------------------------------------- component */

export default function WhiteboardHero() {
  const { setTheme } = useTheme()
  const router = useRouter()
  const chalk = useIsDark()
  const narrow = useIsNarrow()
  const L = narrow ? MOBILE : DESKTOP

  const [tool, setTool] = useState<Tool>("draw")
  const [color, setColor] = useState<InkColor>(INK.black)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const inkRef = useRef<HTMLDivElement>(null)
  const svgMaskImgRef = useRef<SVGImageElement>(null)
  const maskRef = useRef<HTMLCanvasElement | null>(null)
  const history = useRef<Stroke[]>([])
  const drawing = useRef(false)
  const erasingStroke = useRef(false)
  const last = useRef<{ x: number; y: number } | null>(null)
  const prev = useRef<{ x: number; y: number } | null>(null)
  const maskPending = useRef(false)
  const maskGen = useRef(0)
  const maskNeedsReplay = useRef(false)
  const pendingLink = useRef<HTMLAnchorElement | null>(null)
  const downPt = useRef<{ x: number; y: number } | null>(null)
  const hoveredLink = useRef<HTMLAnchorElement | null>(null)

  const ink = (c: InkColor) => (chalk ? CHALK[c] : c)

  /** Mask is half the backing canvas — rebuilt when the layout (canvas size) changes. */
  const mask = useCallback(() => {
    const w = Math.round(L.cw / 2)
    const h = Math.round(L.ch / 2)
    if (maskRef.current && (maskRef.current.width !== w || maskRef.current.height !== h)) {
      maskRef.current = null
    }
    if (!maskRef.current) {
      const c = document.createElement("canvas")
      c.width = w
      c.height = h
      const x = c.getContext("2d", { willReadFrequently: true })!
      x.fillStyle = "#fff"
      x.fillRect(0, 0, c.width, c.height)
      maskRef.current = c
      maskNeedsReplay.current = true
    }
    return maskRef.current
  }, [L.cw, L.ch])

  const flushMask = useCallback(() => {
    if (!maskRef.current) return
    const dataUrl = maskRef.current.toDataURL()
    const gen = ++maskGen.current
    const decoded = new Image()
    decoded.onload = () => {
      if (gen !== maskGen.current) return
      const svg = svgMaskImgRef.current
      if (svg) {
        svg.setAttribute("href", dataUrl)
        svg.setAttributeNS("http://www.w3.org/1999/xlink", "href", dataUrl)
      }
      const el = inkRef.current
      if (!el) return
      const frag = `url(#${INK_MASK_ID})`
      const already = el.style.maskImage.includes(INK_MASK_ID) || el.style.webkitMaskImage.includes(INK_MASK_ID)
      if (!already) {
        el.style.webkitMaskImage = frag
        el.style.maskImage = frag
        el.style.webkitMaskSize = "100% 100%"
        el.style.maskSize = "100% 100%"
        el.style.webkitMaskRepeat = "no-repeat"
        el.style.maskRepeat = "no-repeat"
      }
    }
    decoded.src = dataUrl
  }, [])

  /** x and y are scaled independently — the phone canvas is portrait. */
  const punch = useCallback((a: { x: number; y: number }, b: { x: number; y: number }, size = ERASE_BRUSH) => {
    const m = mask()
    const sx = m.width / L.cw
    const sy = m.height / L.ch
    stampErase(m.getContext("2d")!, { x: a.x * sx, y: a.y * sy }, { x: b.x * sx, y: b.y * sy }, size * Math.min(sx, sy))
  }, [mask, L.cw, L.ch])

  const replayErasesIntoMask = useCallback(() => {
    for (const entry of history.current) {
      if (entry.tool !== "erase") continue
      const pts = entry.pts
      if (!pts.length) continue
      if (pts.length === 1) punch(pts[0], pts[0])
      else for (let i = 1; i < pts.length; i++) punch(pts[i - 1], pts[i])
    }
  }, [punch])

  const eraseMask = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    punch(a, b)
    if (!maskPending.current) {
      maskPending.current = true
      requestAnimationFrame(() => {
        maskPending.current = false
        flushMask()
      })
    }
  }

  const smudgeGhosts = useCallback(() => {
    const inkEl = inkRef.current
    const cv = canvasRef.current
    if (!inkEl || !cv) return
    const board = cv.getBoundingClientRect()
    if (!board.width) return
    const sx = cv.width / board.width
    const sy = cv.height / board.height
    inkEl.querySelectorAll("[data-wb-ghost]").forEach((node, i) => {
      const el = node as HTMLElement
      const strokes = GHOST_STROKES[i] ?? GHOST_STROKES[0]
      if (el.getAttribute("data-wb-ghost") === "tight") {
        smudgeLocal(el, strokes)
        return
      }
      const r = el.getBoundingClientRect()
      const x = (r.left - board.left) * sx
      const y = (r.top - board.top) * sy
      const w = r.width * sx
      const h = r.height * sy
      const padX = 10 * sx
      const padY = 8 * sy
      const brush = Math.min(32, Math.max(16, Math.min(w, h) * 0.42))
      for (const [ax, ay, bx, by] of strokes) {
        punch(
          { x: x - padX + ax * (w + padX * 2), y: y - padY + ay * (h + padY * 2) },
          { x: x - padX + bx * (w + padX * 2), y: y - padY + by * (h + padY * 2) },
          brush,
        )
      }
    })
    if (maskNeedsReplay.current) {
      maskNeedsReplay.current = false
      replayErasesIntoMask()
    }
    flushMask()
  }, [punch, flushMask, replayErasesIntoMask])

  /* -------------------------------------------------------------- drawing */

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

  const linkFromEvent = (e: { clientX: number; clientY: number }) =>
    (hitUnderCanvas(e)?.closest("a.wb-link") as HTMLAnchorElement | null) ?? null

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
    if (href.startsWith("mailto:")) { window.location.href = href; return }
    if (newTab || href.endsWith(".pdf")) { window.open(a.href, "_blank", "noopener,noreferrer"); return }
    if (href.startsWith("/")) { router.push(href); return }
    window.location.assign(href)
  }

  const endStroke = () => {
    if (erasingStroke.current) flushMask()
    drawing.current = false
    erasingStroke.current = false
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
    erasingStroke.current = tool === "erase"
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
    if (link) { pendingLink.current = link; return }
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
      } else return
    }
    if (!drawing.current || !last.current) {
      if (!drawing.current) {
        setHovered(linkFromEvent(e))
        e.currentTarget.style.cursor = hoveredLink.current ? "pointer" : tool === "erase" ? "grab" : "crosshair"
      }
      return
    }
    const p = pos(e)
    history.current[history.current.length - 1]?.pts.push(p)
    segment(last.current, p)
    last.current = p
  }

  const onUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (pendingLink.current) followAnchor(pendingLink.current, e)
    setHovered(linkFromEvent(e))
    endStroke()
  }

  const onLeave = () => { setHovered(null); endStroke() }

  /* Ghosts: after mount, after fonts (glyph metrics), and after a layout swap. */
  useLayoutEffect(() => { smudgeGhosts() }, [smudgeGhosts, narrow])
  useEffect(() => {
    const raf = requestAnimationFrame(() => smudgeGhosts())
    document.fonts?.ready.then(() => { if (!drawing.current) smudgeGhosts() })
    return () => cancelAnimationFrame(raf)
  }, [smudgeGhosts, narrow])

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
  }, [chalk, narrow])

  /* Desktop board is 1180px wide; only constrain the body while this view is mounted. */
  useEffect(() => {
    document.body.style.minWidth = narrow ? "" : "1180px"
  }, [narrow])

  useEffect(() => () => {
    document.body.style.minWidth = ""
    hoveredLink.current?.classList.remove("wb-hover")
    hoveredLink.current = null
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

  const lift = (active: boolean, rotate = 0) => `translateY(${active ? -L.lift : 0}px) rotate(${rotate}deg)`

  /** invisible >=44px hit box that leaves the drawn glyph where it is */
  const tap = (px: number, py: number): React.CSSProperties =>
    narrow ? { padding: `${py}px ${px}px`, margin: `${-py}px ${-px}px` } : {}

  const navLink: React.CSSProperties = {
    display: "inline-block",
    fontFamily: "Excalifont, Virgil, cursive",
    transition: "filter .16s ease",
    padding: "0 6px",
    margin: "0 -6px",
    whiteSpace: "nowrap",
    cursor: "pointer",
  }

  const barrelW = narrow ? 44 : 104
  const barrelH = narrow ? 16 : 26
  /* chalk stick derived from the barrel, so the phone tray cannot overflow */
  const stickW = Math.round(barrelW * 0.6)
  const stickH = Math.round(barrelH * 1.16)

  const surfaceStyle: React.CSSProperties = {
    position: "relative",
    height: narrow ? 494 : 600,
    borderRadius: 3,
    overflow: "hidden",
    background: chalk
      ? "linear-gradient(178deg,#25302b 0%,#1e2723 55%,#1a221f 100%)"
      : "radial-gradient(86% 68% at 34% -8%, #fffdf5 0%, #faf6ea 38%, #f1ebdb 76%, #e7e0ce 100%)",
    boxShadow: chalk
      ? "0 1px 0 rgba(255,255,255,.06) inset, 0 -2px 10px rgba(0,0,0,.5) inset"
      : "0 1px 0 rgba(70,48,22,.14) inset, 0 -20px 44px rgba(70,48,22,.11) inset, 0 0 60px rgba(70,48,22,.07) inset",
  }

  const socialLink = (rot: number, c: string): React.CSSProperties => ({
    ...navLink,
    color: c,
    transform: `rotate(${rot}deg)`,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 1,
    ...(narrow ? { minWidth: 44, minHeight: 44, borderRadius: 10, padding: 0, margin: 0 } : {}),
  })

  return (
    <section style={{
      width: narrow ? "100%" : 1180,
      minWidth: narrow ? undefined : 1180,
      margin: "0 auto",
      position: "relative",
    }}>
      <style>{`
        a.wb-link { background: none !important; }
        a.wb-link:hover, a.wb-link.wb-hover, a.wb-link:focus-visible {
          background: none !important;
          outline: none;
          text-shadow: 0 0 3px currentColor;
        }
        a.wb-link:hover svg, a.wb-link.wb-hover svg, a.wb-link:focus-visible svg {
          filter: drop-shadow(0 0 2px currentColor);
        }
      `}</style>
      <div style={{ position: "relative", background: "transparent", padding: narrow ? "24px 14px 0" : "52px 60px 0" }}>
        {/* wall switch — invisible hit box, visible plate centered inside it */}
        <div style={{ position: "absolute", top: narrow ? 26 : 210, right: narrow ? 8 : 4, zIndex: 6 }}>
          <LightsSwitch
            on={chalk}
            onClick={() => setTheme(chalk ? "light" : "dark")}
            size={narrow ? "sm" : "lg"}
          />
        </div>

        {/* board */}
        <div style={{
          position: "relative", borderRadius: narrow ? 8 : 10, padding: narrow ? 8 : 13,
          background: chalk ? "linear-gradient(160deg,#6b5842 0%,#4a3c2c 40%,#33291e 100%)" : "linear-gradient(160deg,#f0ead9 0%,#c3bda9 40%,#968f7c 100%)",
          boxShadow: chalk
            ? "0 30px 52px rgba(0,0,0,.5), 0 2px 0 rgba(255,225,170,.14) inset"
            : "0 30px 52px rgba(52,34,14,.34), 0 8px 18px rgba(52,34,14,.18), 0 2px 0 rgba(255,250,236,.6) inset",
          marginTop: narrow ? 56 : 0,
        }}>
          <div style={surfaceStyle}>
            <div style={{
              position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
              background: chalk
                ? "linear-gradient(102deg, rgba(255,255,255,.06) 0 18%, rgba(255,255,255,0) 42%)"
                : "linear-gradient(102deg, rgba(255,245,222,.58) 0 18%, rgba(255,245,222,0) 42%), radial-gradient(66% 44% at 32% -12%, rgba(255,240,206,.5), transparent 66%), radial-gradient(60% 42% at 18% 96%, rgba(74,52,26,.10), transparent 72%)",
            }} />
            <div style={{ position: "absolute", right: "10%", top: narrow ? "34%" : "8%", width: narrow ? "44%" : "30%", height: narrow ? "18%" : "34%", borderRadius: "50%", pointerEvents: "none", background: `radial-gradient(closest-side, rgba(${chalk ? "255,255,255,.06" : "120,130,140,.13"}), transparent 72%)` }} />

            {/* ---- ink: two layouts, same hooks (wb-link / data-wb-ghost) ---- */}
            {narrow ? (
              <div ref={inkRef} style={{
                position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
                color: ink(INK.black), fontFamily: "Excalifont, Virgil, cursive",
                display: "flex", flexDirection: "column", gap: 16, padding: "26px 22px 22px",
              }}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 10, transform: "rotate(-1.4deg)" }}>
                  <div style={{ position: "relative", fontSize: 52, lineHeight: 1 }}>
                    yush<span style={{ color: ink(INK.red) }}>.</span>
                    <span data-wb-ghost="tight" style={{ position: "absolute", left: "80%", top: -26, fontSize: 19, lineHeight: 1, color: ink(INK.red), transform: "rotate(-12deg)", display: "block" }}>=3</span>
                  </div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8, pointerEvents: "auto", marginBottom: 2 }}>
                    <a className="wb-link" href="https://github.com/AayushKSharma" target="_blank" rel="noopener noreferrer" aria-label="GitHub" style={socialLink(-1.4, ink(INK.black))}>
                      <SketchGithub color={ink(INK.black)} size={narrow ? 30 : 48} />
                    </a>
                    <a className="wb-link" href="https://www.linkedin.com/in/aayush-k-sharma" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" style={socialLink(1.1, ink(INK.blue))}>
                      <SketchLinkedIn color={ink(INK.blue)} size={narrow ? 27 : 42} />
                    </a>
                  </span>
                </div>

                <div style={{ fontSize: 17, color: chalk ? "#cfcabd" : "#3d4450", lineHeight: 1.4, transform: "rotate(-.6deg)" }}>
                  {TAGLINE}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "flex-start", pointerEvents: "auto", marginTop: 4 }}>
                  <div style={{ transform: "rotate(-1.4deg)" }}>
                    <Link className="wb-link" href="/projects" style={{ ...navLink, fontSize: 27, lineHeight: 1.15, color: ink(INK.blue), padding: "2px 5px 3px", margin: "-2px -5px -3px" }}>
                      Projects &amp; Experience
                      <svg viewBox="0 0 300 14" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: 10, marginTop: 1, overflow: "visible" }}>
                        <path d="M4 9 C 80 1, 190 14, 296 4" fill="none" stroke={ink(INK.blue)} strokeWidth="3" strokeLinecap="round" />
                      </svg>
                    </Link>
                  </div>
                  <div style={{ transform: "rotate(1deg)" }}>
                    <Link className="wb-link" href="/blog" style={{ ...navLink, fontSize: 27, lineHeight: 1.15, color: ink(INK.blue), padding: "2px 5px 3px", margin: "-2px -5px -3px" }}>
                      Blog
                      <svg viewBox="0 0 90 14" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: 10, marginTop: 1, overflow: "visible" }}>
                        <path d="M4 8 C 28 2, 62 13, 86 4" fill="none" stroke={ink(INK.blue)} strokeWidth="3" strokeLinecap="round" />
                      </svg>
                    </Link>
                  </div>
                  <div style={{ display: "flex", gap: 20, marginTop: 2 }}>
                    <a className="wb-link" href="/files/Aayush-Kumar-Sharma_Resume.pdf" target="_blank" rel="noopener noreferrer" style={{ ...navLink, fontSize: 19, color: ink(INK.black), transform: "rotate(.8deg)", ...tap(6, 10) }}>résumé.pdf</a>
                    <a className="wb-link" href="mailto:aayushksharma1@gmail.com" style={{ ...navLink, fontSize: 19, color: ink(INK.black), transform: "rotate(-.8deg)", ...tap(6, 10) }}>reach out!</a>
                  </div>
                  <svg viewBox="0 0 220 20" preserveAspectRatio="none" style={{ display: "block", width: 210, height: 16, overflow: "visible" }}>
                    <path d="M4 10 C 70 20, 140 2, 216 12" fill="none" stroke={ink(INK.red)} strokeWidth="2.6" strokeLinecap="round" />
                  </svg>
                </div>

                <div style={{ marginTop: "auto", alignSelf: "center", fontSize: 15, color: ink(INK.red), transform: "rotate(-8deg)", whiteSpace: "nowrap" }}>*draw on me!*</div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "auto", pointerEvents: "auto" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
                    <Link className="wb-link" href="/projects/aotw" style={{ ...navLink, fontSize: 16, color: ink(INK.black), transform: "rotate(1.4deg)", ...tap(6, 11) }}>ship aotw v2</Link>
                    <div data-wb-ghost style={{ fontSize: 14, color: ink(INK.black), whiteSpace: "nowrap", transform: "rotate(-3deg)" }}>TODO: make website</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
                    <div style={{ fontSize: 15, color: ink(INK.green), lineHeight: 1.5, textAlign: "right", transform: "rotate(1.4deg)" }}>
                      TypeScript<br />PostgreSQL<br />Express.js
                    </div>
                    <div data-wb-ghost style={{ transform: "rotate(5deg)" }}>
                      <CoolS color={ink(INK.black)} width={26} height={46} strokeWidth={4} />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div ref={inkRef} style={{
                position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
                color: ink(INK.black), fontFamily: "Excalifont, Virgil, cursive",
                display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,auto)",
                gridTemplateRows: "auto 1fr auto", columnGap: 48, rowGap: 26,
                padding: "48px 60px 44px", alignItems: "start",
              }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, transform: "rotate(-1.6deg)" }}>
                    <div style={{ position: "relative", fontSize: 84, lineHeight: 1 }}>
                      yush<span style={{ color: ink(INK.red) }}>.</span>
                      <span data-wb-ghost="tight" style={{ position: "absolute", left: "78%", top: -48, fontSize: 30, lineHeight: 1, color: ink(INK.red), transform: "rotate(-12deg)", display: "block" }}>=3</span>
                    </div>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 12, pointerEvents: "auto", marginTop: 10 }}>
                      <a className="wb-link" href="https://github.com/AayushKSharma" target="_blank" rel="noopener noreferrer" aria-label="GitHub" style={socialLink(-1.4, ink(INK.black))}>
                        <SketchGithub color={ink(INK.black)} size={48} />
                      </a>
                      <a className="wb-link" href="https://www.linkedin.com/in/aayush-k-sharma" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" style={socialLink(1.1, ink(INK.blue))}>
                        <SketchLinkedIn color={ink(INK.blue)} size={42} />
                      </a>
                    </span>
                  </div>
                  <div style={{ fontSize: 25, color: chalk ? "#cfcabd" : "#3d4450", maxWidth: 420, lineHeight: 1.45, transform: "rotate(-.6deg)" }}>
                    {TAGLINE}
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

                <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "space-between", alignItems: "flex-end", width: "100%", paddingRight: 36 }}>
                  <div data-wb-ghost style={{ fontSize: 24, color: ink(INK.black), transform: "rotate(-3deg)" }}>TODO: make website</div>
                  <div data-wb-ghost style={{ transform: "rotate(5deg)", marginBottom: 4 }}>
                    <CoolS color={ink(INK.black)} width={46} height={82} strokeWidth={2.7} />
                  </div>
                </div>

                <div style={{ position: "absolute", left: "44%", top: "15%", fontSize: 22, color: ink(INK.red), transform: "rotate(-8deg)", whiteSpace: "nowrap" }}>*draw on me!*</div>
              </div>
            )}

            <svg width={1} height={1} aria-hidden style={{ position: "absolute", overflow: "hidden", pointerEvents: "none" }}>
              <defs>
                <mask
                  id={INK_MASK_ID}
                  maskUnits="objectBoundingBox"
                  maskContentUnits="objectBoundingBox"
                >
                  <image ref={svgMaskImgRef} x="0" y="0" width="1" height="1" preserveAspectRatio="none" />
                </mask>
              </defs>
            </svg>

            <button
              className="wb-reset"
              onClick={resetBoard}
              title="Reset the board"
              style={{
                all: "unset", position: "absolute", right: narrow ? 4 : 22, bottom: narrow ? 2 : 16, zIndex: 6, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                minWidth: narrow ? 44 : undefined, minHeight: narrow ? 44 : undefined,
                fontFamily: "Excalifont, Virgil, cursive", fontSize: narrow ? 20 : 26, lineHeight: 1,
                color: chalk ? "rgba(232,228,214,.72)" : "#8a8378", padding: narrow ? 0 : 6,
                transition: "color .18s ease, transform .35s ease",
              }}
            >↻</button>

            <canvas
              ref={canvasRef}
              width={L.cw}
              height={L.ch}
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
        <div style={{ position: "relative", margin: narrow ? "0 -4px" : "0 -10px", height: narrow ? 56 : 74, zIndex: 5 }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: narrow ? 11 : 16, background: "linear-gradient(#efe7d5,#b7b0a0)", borderRadius: "3px 3px 0 0", boxShadow: "0 1px 0 rgba(255,251,240,.7) inset" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: narrow ? 11 : 16, height: narrow ? 24 : 34, background: "linear-gradient(#9b9384,#78715f)", boxShadow: "0 -6px 10px rgba(46,30,12,.32) inset, 0 12px 20px rgba(46,30,12,.30)" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: narrow ? 35 : 50, height: narrow ? 8 : 12, background: "linear-gradient(#635c4d,#4a443a)", borderRadius: "0 0 4px 4px" }} />

          <div style={{ position: "absolute", left: narrow ? 8 : 44, bottom: "100%", display: "flex", alignItems: "flex-end", gap: narrow ? 9 : 22, zIndex: 2 }}>
            {MARKERS.map(m => {
              const active = tool === "draw" && color === m.color
              const band = Math.round(barrelW * 0.15)
              return (
                <button
                  key={m.color}
                  title={m.label}
                  onClick={() => { setTool("draw"); setColor(m.color) }}
                  style={{ all: "unset", cursor: "pointer", display: "block", ...tap(6, 14) }}
                >
                  <span style={{
                    display: "block",
                    width: chalk ? stickW : barrelW, height: chalk ? stickH : barrelH, borderRadius: chalk ? 3 : 5,
                    background: chalk
                      ? `linear-gradient(178deg, ${CHALK[m.color]} 0%, ${CHALK[m.color]} 58%, rgba(0,0,0,.14) 100%)`
                      : m.barrel,
                    boxShadow: "0 3px 5px rgba(0,0,0,.35), 0 1px 0 rgba(255,255,255,.25) inset",
                    position: "relative",
                    transform: lift(active, m.rotate),
                    transition: "transform .26s cubic-bezier(.34,1.28,.64,1)",
                  }}>
                    {!chalk && (
                      <>
                        <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: band, background: "#fbfbf9", borderRadius: "5px 0 0 5px", pointerEvents: "none" }} />
                        <span style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: band, background: "#fbfbf9", borderRadius: "0 5px 5px 0", pointerEvents: "none" }} />
                        <span style={{
                          position: "absolute",
                          right: narrow ? -12 : -22,
                          top: "50%",
                          width: narrow ? 13 : 24,
                          height: narrow ? 14 : 22,
                          marginTop: narrow ? -7 : -11,
                          borderRadius: "2px 6px 6px 2px",
                          background: `linear-gradient(180deg, rgba(255,255,255,.3), transparent 42%, rgba(0,0,0,.22)), ${m.color}`,
                          boxShadow: "0 1px 3px rgba(0,0,0,.3), 0 1px 0 rgba(255,255,255,.25) inset",
                        }} />
                      </>
                    )}
                  </span>
                </button>
              )
            })}

            <button title="Eraser" onClick={() => setTool("erase")} style={{ all: "unset", cursor: "pointer", display: "block", marginLeft: narrow ? 4 : 14, ...tap(6, 12) }}>
              <span style={{
                display: "block", width: narrow ? 40 : 96, height: narrow ? 20 : 36, borderRadius: 4,
                background: chalk ? "linear-gradient(#3a3630 0 44%, #d9d3c4 44% 100%)" : "linear-gradient(#2b2f34 0 46%, #b9b2a4 46% 100%)",
                boxShadow: "0 3px 6px rgba(0,0,0,.35), 0 1px 0 rgba(255,255,255,.2) inset",
                transform: lift(tool === "erase"),
                transition: "transform .26s cubic-bezier(.34,1.28,.64,1)",
              }} />
            </button>

            <SprayButton onClick={wipeAll} narrow={narrow} />
          </div>
        </div>

        <div style={{ height: narrow ? 18 : 26 }} />
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ pieces */

function SprayButton({ onClick, narrow }: { onClick: () => void; narrow: boolean }) {
  const [bump, setBump] = useState(false)
  return (
    <button
      title="Board cleaner — wipes everything"
      onClick={() => { onClick(); setBump(true); setTimeout(() => setBump(false), 420) }}
      style={{
        all: "unset", cursor: "pointer", display: "block", marginLeft: narrow ? 2 : 10,
        ...(narrow ? { padding: "7px 11px", margin: "-7px -9px" } : {}),
      }}
    >
      <span style={{
        display: "block", position: "relative", width: narrow ? 22 : 44, height: narrow ? 30 : 56, borderRadius: "6px 6px 5px 5px",
        background: "linear-gradient(100deg, rgba(255,255,255,.55), rgba(120,180,150,.75))",
        border: "1px solid rgba(255,255,255,.6)", boxShadow: "0 3px 6px rgba(0,0,0,.3)",
        transform: `translateY(${bump ? -12 : 0}px)`, transition: "transform .26s cubic-bezier(.34,1.28,.64,1)",
      }}>
        <span style={{ position: "absolute", left: narrow ? 7 : 12, top: narrow ? -8 : -13, width: narrow ? 12 : 20, height: narrow ? 9 : 14, borderRadius: 3, background: "linear-gradient(#e9ecef,#b7bcc1)" }} />
        <span style={{ position: "absolute", left: narrow ? 4 : 6, bottom: narrow ? 4 : 6, right: narrow ? 4 : 6, height: narrow ? 13 : 22, borderRadius: 3, background: "rgba(255,255,255,.35)" }} />
      </span>
    </button>
  )
}

function SketchGithub({ color, size }: { color: string; size: number }) {
  return (
    <svg viewBox="0 0 345 280" width={size} height={Math.round(size * 0.81)} aria-hidden style={{ display: "block", overflow: "visible", flexShrink: 0 }}>
      <path fill={color} fillRule="evenodd" d="M 183.500 8.672 C 168.276 9.218, 152.840 11.166, 144.438 13.602 C 133.397 16.803, 99.272 30.743, 88.652 36.391 C 70.113 46.250, 41.258 71.847, 31.038 87.500 C 24.587 97.379, 16.902 113.043, 13.619 123 C 10.055 133.812, 8.665 148.351, 9.281 168.395 C 9.744 183.491, 10.167 186.788, 12.881 196.464 C 18.672 217.111, 27.230 231.424, 42.214 245.520 C 54.540 257.115, 66.907 264.818, 78.925 268.386 C 85.354 270.294, 114.997 272.598, 120.307 271.602 C 126.603 270.421, 127.322 268.223, 126.804 251.734 C 126.166 231.420, 125.761 230.812, 112 229.495 C 106.815 228.998, 103.476 227.813, 95.500 223.635 C 90 220.754, 83.412 217.614, 80.860 216.658 C 74.215 214.167, 67.405 209.392, 65.039 205.564 C 62.811 201.959, 62.395 198.492, 64.065 197.460 C 66.289 196.085, 71.943 198.198, 76.296 202.029 C 78.784 204.219, 84.122 207.386, 88.160 209.067 C 110.213 218.249, 110.199 218.245, 114.917 217.598 C 117.411 217.256, 120.138 216.291, 120.976 215.454 C 122.749 213.683, 122.893 206.598, 121.568 186.424 C 120.723 173.553, 120.745 173.315, 123.001 171.214 C 124.334 169.971, 127.218 168.839, 129.896 168.507 C 145.652 166.549, 150.275 164.528, 150.797 159.366 C 151.185 155.539, 146.446 148.914, 141.715 146.669 C 139.781 145.751, 135.985 145, 133.280 145 C 126.618 145, 119.692 142.800, 112.500 138.400 C 109.200 136.381, 105.527 134.200, 104.337 133.554 C 98.101 130.163, 90.671 123.284, 88.395 118.793 C 85.087 112.264, 83.673 104.521, 85.036 100.392 C 86.252 96.707, 88.533 95.431, 101 91.464 C 105.675 89.976, 110.527 87.821, 111.781 86.676 C 113.036 85.530, 114.773 82.097, 115.642 79.046 C 116.511 75.996, 117.622 73.073, 118.111 72.550 C 118.600 72.027, 119 70.340, 119 68.800 C 119 65.491, 120.330 65.294, 124.696 67.956 C 128.428 70.232, 130.546 73.262, 131.454 77.624 C 131.811 79.343, 133.117 81.701, 134.355 82.864 C 136.527 84.904, 136.869 84.930, 144.053 83.595 C 148.149 82.834, 161.175 81.910, 173 81.541 C 184.825 81.172, 196.129 80.448, 198.119 79.932 C 203.225 78.608, 206.640 75.607, 210.179 69.336 C 213.107 64.148, 213.324 63.984, 215.110 65.599 C 218.042 68.253, 222.730 76.176, 223.476 79.738 C 224.151 82.962, 226.234 85.085, 231.652 88.069 C 233.218 88.932, 234.991 90.732, 235.590 92.069 C 239.952 101.795, 244.643 123.648, 243.664 129.681 C 242.766 135.219, 239.836 140.080, 235.778 142.766 C 232.113 145.191, 230.803 145.403, 214.803 146.151 C 205.417 146.590, 196.964 147.194, 196.020 147.494 C 190.001 149.404, 191.361 164.160, 197.684 165.546 C 205.468 167.251, 208.075 169.514, 209.446 175.753 C 209.835 177.526, 210.569 179.234, 211.077 179.548 C 211.585 179.861, 212.001 181.329, 212.003 182.809 C 212.006 185.620, 218.169 216.064, 219.898 221.809 C 220.446 223.629, 221.186 232.404, 221.543 241.309 C 221.900 250.214, 222.609 259.161, 223.119 261.192 C 223.965 264.564, 224.413 264.939, 228.273 265.510 C 233.849 266.335, 244.862 264.499, 251.872 261.576 C 254.967 260.285, 258.996 258.910, 260.825 258.519 C 262.653 258.128, 266.285 255.939, 268.895 253.654 C 271.506 251.369, 278.417 245.588, 284.253 240.806 C 295.575 231.529, 302.868 223.412, 311.555 210.421 C 317.685 201.252, 330.835 176.413, 332.077 171.655 C 332.530 169.920, 333.808 166.025, 334.918 163 C 337.626 155.614, 337.538 147.334, 334.562 129.767 C 330.878 108.022, 325.839 96.418, 310.992 75.488 C 300.271 60.376, 282.014 43.087, 264 30.989 C 260.425 28.588, 256.249 25.785, 254.720 24.760 C 249.445 21.223, 234.481 14.220, 227.792 12.159 C 219.255 9.527, 200.600 8.059, 183.500 8.672" />
    </svg>
  )
}

function SketchLinkedIn({ color, size }: { color: string; size: number }) {
  return (
    <svg viewBox="0 0 203 164" width={size} height={Math.round(size * 0.81)} aria-hidden style={{ display: "block", overflow: "visible", flexShrink: 0 }}>
      <path fill={color} fillRule="evenodd" d="M 177 4.733 C 169.261 5.950, 156.191 6.202, 106.500 6.094 C 69.662 6.013, 41.211 5.517, 34.671 4.842 C 28.714 4.227, 20.389 3.984, 16.171 4.302 C 9.174 4.830, 8.253 5.157, 5.689 8.025 L 2.878 11.168 3.547 21.834 C 3.915 27.700, 4.617 39.700, 5.107 48.500 C 5.597 57.300, 6.486 68.100, 7.081 72.500 C 7.677 76.900, 8.553 92.875, 9.028 108 C 9.504 123.125, 10.185 141.923, 10.543 149.772 L 11.193 164.045 93.846 163.608 C 139.306 163.367, 178.975 163.107, 182 163.028 C 185.025 162.950, 188.853 163.171, 190.507 163.521 C 192.716 163.987, 194.117 163.634, 195.782 162.189 L 198.049 160.223 197.526 124.361 C 197.237 104.638, 196.765 72.344, 196.476 52.598 C 195.961 17.487, 195.994 16.654, 197.975 14.809 C 200.880 12.102, 200.599 7.617, 197.365 5.073 C 194.264 2.633, 190.737 2.574, 177 4.733 M 36.038 25.041 C 34.134 26.668, 31.847 28, 30.956 28 C 29.845 28, 28.998 29.481, 28.257 32.720 C 27.313 36.845, 27.419 37.780, 29.099 40.139 C 32.155 44.430, 42.780 46.185, 50 43.590 C 54.386 42.014, 55.966 38.983, 55.985 32.110 C 56.003 25.567, 54.495 24.077, 47.809 24.032 C 45.229 24.014, 42.840 23.550, 42.500 23 C 41.482 21.353, 39.691 21.918, 36.038 25.041 M 46 66 C 45.175 66.533, 41.451 66.976, 37.725 66.985 C 31.360 66.999, 30.891 67.157, 29.964 69.594 C 29.358 71.189, 29.078 88.039, 29.239 113.344 L 29.500 154.500 37.500 154.362 C 48.867 154.165, 56.298 153.041, 58.785 151.141 C 60.732 149.654, 60.959 148.418, 61.203 138 C 61.351 131.675, 60.881 119.750, 60.160 111.500 C 59.439 103.250, 58.742 95.150, 58.611 93.500 C 58.480 91.850, 58.289 85.213, 58.186 78.750 L 58 67 54.559 67 C 52.666 67, 50.840 66.550, 50.500 66 C 49.724 64.744, 47.944 64.744, 46 66 M 99.500 68 C 99.160 68.550, 94.859 69, 89.941 69 L 81 69 81 76.777 C 81 82.180, 81.473 85.230, 82.548 86.765 C 83.878 88.664, 84.032 92.543, 83.637 114.238 C 83.385 128.132, 82.872 141.590, 82.497 144.143 C 82.069 147.061, 82.250 149.599, 82.985 150.971 C 84.108 153.071, 84.652 153.143, 96.927 152.828 C 106.421 152.584, 110.162 152.116, 111.500 151.003 C 113.165 149.619, 113.250 148.020, 112.636 129.667 L 111.974 109.827 114.968 107.030 C 118.606 103.632, 121.594 102.908, 134.434 102.317 C 145.184 101.822, 147.724 102.508, 151.749 106.994 C 153.926 109.420, 153.998 110.154, 153.999 130.005 L 154 150.511 157.528 151.615 C 159.468 152.222, 161.295 152.332, 161.587 151.859 C 161.879 151.387, 165.395 151, 169.401 151 L 176.683 151 177.842 147.134 C 178.600 144.604, 178.993 133.802, 178.979 115.884 C 178.956 85.517, 177.924 76.747, 174.055 74.038 C 172.846 73.192, 170.331 71.230, 168.465 69.678 C 165.139 66.912, 164.890 66.868, 155.786 67.437 C 150.679 67.757, 142.299 68.271, 137.166 68.580 L 127.831 69.141 123.587 73.571 C 120.404 76.893, 118.589 78, 116.326 78 C 112.761 78, 110 75.326, 110 71.871 C 110 70.512, 109.460 68.860, 108.800 68.200 C 107.349 66.749, 100.366 66.599, 99.500 68" />
    </svg>
  )
}

function CoolS({ color, width, height, strokeWidth }: { color: string; width: number; height: number; strokeWidth: number }) {
  return (
    <svg viewBox="0 0 70 124" width={width} height={height} aria-hidden style={{ display: "block", overflow: "visible" }}>
      <g fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
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
