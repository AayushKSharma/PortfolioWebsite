# Dark-mode paper + rough stock texture

Turns the board's manila paper into near-black kraft in dark mode, and gives every
sheet a rough-stock grain in **both** themes. Approved direction: **1D — near-black
kraft, amber ink**, sticky dimmed with the paper, cork desaturated toward grey, body
ink one step softer.

Preview: `Textured Paper.dc.html` (light 2A / dark 2B, grain tweak: smooth · medium · rough).

## What ships

| File | Where it goes |
| --- | --- |
| `globals.dark-paper.css` | replaces the board-token block in `app/globals.css` |
| `public-board/paper-noise-*.svg` (4) | `public/board/` |

Component edits are small and mechanical — 11 line-level swaps across 5 files, all
listed below. No structural or layout changes.

## Why two paper tokens

`--cork-paper` **stays a flat colour**. It is interpolated inside
`linear-gradient()` in `StapledSheet` (dog-ear, bottom fade), where a layered value
is invalid CSS and silently kills the whole declaration.

`--cork-paper-bg` is the 7-layer textured stack, valid only in a `background:`
shorthand. It needs a matching `background-size` list, so it is delivered as the
`.cork-sheet` class rather than an inline style — that keeps the layer count and the
size list from drifting apart.

## Why the noise is a file, not a data URI

`feTurbulence` needs `baseFrequency` / `numOctaves` / `stitchTiles`. Inline
`data:image/svg+xml` in a stylesheet can have those camelCase attributes rewritten by
a CSS pipeline; the filter then falls back to frequency 0 and renders a **flat grey
tile**. Nothing errors — the grain just isn't there. Real files avoid it entirely.

Grain strength comes from the file (`paper-noise-medium.svg` at 8.5% is the shipped
default; `-smooth` 3.5%, `-rough` 16%) plus the `--paper-grain` / `--paper-fiber` /
`--paper-blotch` numbers. To dial the whole board, change `--paper-noise` in `:root`.

## Component edits

### 1. `components/board/Flyer.tsx`

Line ~64 — the separate `backgroundImage` must go; its top-light gradient is already
layer 5 of the token, and leaving it in place overwrites all seven layers.

```diff
-      style={{
-        background: "var(--cork-paper)",
-        backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.45), rgba(0,0,0,0.025))",
-        padding: pad,
+      className="cork-sheet"
+      style={{
+        padding: pad,
```

Then the hardcoded warm greys, which stay warm-brown on a near-black sheet and go
muddy (5 occurrences of `#8a6a3d`, lines ~71, 73, 115, 120, 135):

```diff
-        color: "#8a6a3d"
+        color: "var(--cork-ink3)"
```

Line ~81 and ~133 — rules:

```diff
-      {featured && <div style={{ margin: "16px 0 0", height: 1, background: "rgba(52,40,24,0.28)" }} />}
+      {featured && <div style={{ margin: "16px 0 0", height: 1, background: "var(--cork-rule-strong)" }} />}
-        borderTop: "1px solid rgba(52,40,24,0.22)",
+        borderTop: "1px solid var(--cork-rule)",
```

> `Pinned` forwards `className`, so `className="cork-sheet"` lands on the paper
> element. If your local copy doesn't, add `className={["cork-lift", className].filter(Boolean).join(" ")}` to its root.

### 2. `components/board/StapledSheet.tsx`

Line ~54 — same swap, and `lead`'s extra top-light gradient is redundant now:

```diff
-      style={{
-        background: "var(--cork-paper)",
-        backgroundImage: lead ? "linear-gradient(180deg, rgba(255,255,255,0.45), rgba(0,0,0,0.02))" : undefined,
-        padding: lead ? "44px 52px 34px" : "38px 52px 30px",
+      className="cork-sheet"
+      style={{
+        padding: lead ? "44px 52px 34px" : "38px 52px 30px",
```

Line ~61 kicker → `var(--cork-ink3)`. Lines ~74 and ~81 — dog-ear and bottom fade
were hardcoded to the light stock:

```diff
-      backgroundImage: "linear-gradient(226deg, #b9ad90 0%, #ded4bb 42%, var(--cork-paper) 100%)"
+      backgroundImage: "var(--cork-dogear)"
-      background: "linear-gradient(180deg, rgba(246,239,221,0) 0%, var(--cork-paper) 72%)"
+      background: "var(--cork-fade)"
```

The fade one matters most: `rgba(246,239,221,0)` is transparent *manila*, so on dark
paper the text faded into a cream haze.

### 3. `components/board/PinnedAttachment.tsx`

```diff
-        background: isSheet ? "#fdfcf7" : "var(--cork-paper)",
+        background: isSheet ? "var(--cork-mount)" : undefined,
+        // non-sheet case: add className="cork-sheet"
-      <div style={{ ..., background: "#f3f1ea", boxShadow: "inset 0 0 0 1px rgba(52,40,24,0.12)" }}>
+      <div style={{ ..., background: "var(--cork-art)", boxShadow: "inset 0 0 0 1px var(--cork-hairline)" }}>
```

Line ~47 kicker → `var(--cork-ink3)`.

### 4. `components/board/BoardFrame.tsx`

Lines ~79–80 and ~94 — sticky titles move to tokens so dark mode can dim them:

```diff
-              backgroundColor: "#f5e488",
-              backgroundImage: "linear-gradient(184deg, #f8ea9c 0%, #ecd66d 100%)",
+              backgroundColor: "var(--sticky)",
+              backgroundImage: "linear-gradient(184deg, rgba(255,255,255,0.24) 0%, var(--sticky-2) 100%)",
-            color: "#3a3116"
+            color: "var(--sticky-ink)"
```

Keep `backgroundColor: "#a4753d"` on the cork panel (line ~60) — dark mode handles it
through the `.cork-panel::before` wash, not a different base colour.

### 5. `components/board/Pinned.tsx` + `components/sections/*Board.tsx`

`Pinned.tsx` line ~296 — the page-curl gradient:

```diff
-            backgroundImage: "linear-gradient(315deg, #a4753d 0%, #f2ead6 46%, #cfc4a7 100%)",
+            backgroundImage: "var(--cork-curl)",
```

`AboutBoard.tsx` line ~34 gets `className="cork-sheet"` (drop its `background`), line
~40 kicker → `var(--cork-ink3)`. `ProjectsBoard.tsx` line ~43's per-tag sticky palette
(`{ color: "#f5e488", wash: "#f8ea9c", ink: "#3a3116" }`) is decorative — either leave
it or point it at the sticky tokens.

Also in `app/globals.css`, `.cork-back` / `.cork-stage-back` already have a
`html.dark` override; the `#3a3116` light value can now read `var(--sticky-ink)`.

## Checks after integration

- Toggle dark mode: no sheet should read brighter than the cork behind it.
- The bottom fade on a truncated stapled sheet must fade to black, not cream.
- Zoom to 200% on a flyer — grain should be visible mottling, not a flat tint. If it
  looks flat, the SVGs aren't being served from `/board/`.
- Drag a flyer: the curl and hover shadow should both be dark-mode variants.
