# Whiteboard landing page — integration

Drop-in replacement for `Navbar` + `Hero` on the home route. No new dependencies
(no framer-motion, no lucide) — plain React + canvas, inline styles.

## 1. Add the component

Copy `WhiteboardHero.tsx` to `components/sections/WhiteboardHero.tsx`
(it can replace the empty `components/sections/Whiteboard.tsx` placeholder).

## 2. Fonts

The board writes in **Excalifont** with **Virgil** as fallback — both are already
in `public/fonts/`. Register them once in `app/globals.css`:

```css
@font-face {
  font-family: "Excalifont";
  src: url("/fonts/Excalifont/Excalifont-Regular-349fac6ca4700ffec595a7150a0d1e1d.woff2") format("woff2");
  font-display: swap;
}
@font-face {
  font-family: "Virgil";
  src: url("/fonts/Virgil/Virgil-Regular.woff2") format("woff2");
  font-display: swap;
}
```

## 3. Home route

`app/page.tsx` — the board *is* the nav, so it sits outside the `max-w-4xl` wrapper:

```tsx
import WhiteboardHero from "@/components/sections/WhiteboardHero"
import About from "@/components/sections/About"
import Contact from "@/components/sections/Contact"

export default function Home() {
  return (
    <>
      <WhiteboardHero />
      <main className="max-w-4xl mx-auto px-4 sm:px-6">
        <About />
        <Contact />
      </main>
    </>
  )
}
```

## 4. Navbar

Hide the fixed `Navbar` on `/` only (keep it on `/projects` and `/blog`), e.g. in
`components/ui/Navbar.tsx`:

```tsx
const pathname = usePathname()
if (pathname === "/") return null
```

Also drop the `pt-16` compensation the old `Hero` used.

## 5. Background

The room lighting is painted on `document.body` from inside the component (a
`useEffect`), because a fixed-width element would leave a visible seam down the
page. It sets `background-color`, `background-image`, `background-repeat`,
`background-size` and `min-width: 1180px`. If you keep `next-themes`, drive
`chalk` from `resolvedTheme` instead of local state and let the effect handle the
body — then remove the `background` rule from `body` in `globals.css` so they
don't fight.

`About`/`Contact` sit directly on that warm wall, so their text needs warming:
`#2a2117` headings, `#3f3428` body, `rgba(58,44,26,.28)` borders (dark mode:
`#ece7da` / `#b9b2a3` / `rgba(236,231,218,.28)`).

## Behaviour notes

- **Board is fixed-width (1180px)** — the ink is laid out in a grid inside a
  1034×600 surface. Going responsive means re-flowing that grid and making the
  600px surface height fluid.
- **Erasing the nav** works by punching partial alpha into an offscreen mask
  canvas applied as a CSS `mask-image` on the ink layer; the eraser adds a little
  alpha back each pass, which is the caked residue that never fully wipes.
- **Spray bottle** clears the canvas *and* the mask entirely (residue included);
  **↻** restores everything.
- **Lights switch** flips to chalkboard: markers become chalk sticks and existing
  drawings are replayed on the chalk palette (stroke history is kept in a ref).
- Drawings are not persisted — a fresh board every visit, as specced.
