# Whiteboard hero — mobile view

Drop-in replacement for `components/sections/WhiteboardHero.tsx`. Same deps as
your current file (`next/link`, `next/navigation`, `next-themes`); the desktop
board, click-through-canvas link handling, ghosts and chalk mode are unchanged.

## 1. Replace the component

Copy `WhiteboardHero.tsx` over `components/sections/WhiteboardHero.tsx`.

Nothing else in the app needs to change — `page.tsx`, the `/` guard in `Navbar`,
and the `.wb-link` / `.wb-reset` rules in `globals.css` all still apply.

## 2. globals.css — two small additions

```css
/* stop iOS from flashing a grey box on the drawn links */
.wb-link { -webkit-tap-highlight-color: transparent; }

/* the board owns the page background; don't let html paint over it */
@media (max-width: 700px) {
  html { background-color: transparent; }
}
```

## What changed

| | Desktop (>700px) | Phone (≤700px) |
|---|---|---|
| board canvas | 1054×600 | 652×988 (portrait) |
| surface height | 600 | 494 |
| ink layout | 2-col grid | single column, nav stacked |
| marker barrel | 104×26 | 44×16 |
| marker lift | 16px | 9px |
| section width | fixed 1180 | 100% |
| `body { min-width }` | 1180px | *unset* |

Key points if you tweak it later:

- **`useIsNarrow()`** (matchMedia `max-width: 700px`) picks the layout. SSR
  returns `false`, so desktop renders identically on the server — the phone does
  one client swap on mount, which is why the ghost smudge re-runs on `narrow`.
- **One canvas, one mask, one stroke history** across both layouts. The mask is
  rebuilt when the canvas size changes, and erase strokes scale x and y
  *independently* (the phone canvas is portrait — a single scale factor puts the
  holes in the wrong place).
- **`body { min-width: 1180px }` is desktop-only.** That rule is what made the
  phone show half a board; on mobile it's removed and the section is fluid.
- **Chalk sticks derive from the barrel size** (`0.6×` width, `1.16×` height)
  instead of the old hardcoded 62×30 — a constant overflowed the phone tray and
  pushed the spray bottle off-screen.
- **Touch targets:** `tap(px, py)` returns padding + matching negative margin,
  so every phone control has a ≥44px box while the drawn artwork keeps its size.
  If you add a control, wrap it the same way.
- **Ghost notes** (`data-wb-ghost`) are pre-smudged from `GHOST_STROKES`; the
  `"tight"` variant (`=3`) gets its own local mask so the coarse board brush
  can't nick the wordmark or the GitHub mark.

## Not included

- Landscape phone (≤700px wide but short) still uses the portrait board; it
  fits, but the tray sits close to the fold.
- Drawings are not persisted — fresh board each visit, on both layouts.
