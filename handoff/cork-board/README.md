# Cork notice boards — implementation handoff

Ports direction **2a (Notice Board)** from `Cork Board Sections.dc.html` into the
Next app: `/projects`, `/blog`, the About section, and both slug templates.

## File map

Copy each file to the path in its header comment.

```
lib/board.ts                       geometry, grid packing, deterministic rotation
lib/boardAttachments.ts            the committed-art manifest (posters/PDFs/photos)
lib/sheets.ts                      splits MDX into stapled pages
components/board/BoardFrame.tsx    aluminium frame + cork panel + sticky title
components/board/BoardScaler.tsx   fits the 1180px canvas into any viewport
components/board/Pinned.tsx        draggable wrapper + pushpin/staple/tape/curl
components/board/Flyer.tsx         project + post flyer
components/board/PinnedAttachment.tsx   renders one manifest entry
components/board/StapledSheet.tsx  slug-page sheet
components/sections/ProjectsBoard.tsx
components/sections/BlogBoard.tsx
components/sections/AboutBoard.tsx
app/projects/page.tsx              (replacement)
app/blog/page.tsx                  (replacement)
app/projects/-slug-/page.tsx      (replacement -> app/projects/[slug]/page.tsx)
app/blog/-slug-/page.tsx          (replacement -> app/blog/[slug]/page.tsx)
globals.additions.css              paste into app/globals.css
```

## Order of work

1. **globals.css** — paste `globals.additions.css` in. It adds the Cascadia
   `@font-face` (the file is already in `public/fonts/Cascadia/`) and the board
   custom properties. Nothing else in the file changes.
2. **`lib/board.ts`, `lib/boardAttachments.ts`, `lib/sheets.ts`** — no deps.
3. **`components/board/*`** — `Pinned` and `BoardScaler` are `"use client"`;
   everything else renders on the server.
4. **Sections + pages.** The four page files are drop-in replacements. Their
   `generateStaticParams` / `generateMetadata` are unchanged from yours.
5. **Content**: add `public/board/` (see the attachments section) and, if you
   want per-project sheet titles, nothing — sheets are derived from your MDX
   headings as-is.

## The board canvas

Every board is a fixed **1180 × N** canvas. Positions in the manifest and in
`lib/board.ts` are in that space, so a board looks identical on every screen;
`BoardScaler` scales the whole thing down (never up) to fit narrow viewports.
That's what keeps hand-placed art and auto-packed flyers in the same
coordinate system.

Inner grid (inside the 14px frame): 3 columns of **336px**, 28px gutters, 44px
outer padding. A flyer spans 1, 2, or 3 columns (`336 / 700 / 1064`).

## Layout: packed, not hand-placed

`packBoard()` in `lib/board.ts` is a shortest-column masonry pack. It takes
`{ id, span, height }` and returns `{ x, y, width, rotate }`. Rotation is a hash
of the id → deterministic, ±1.5°, identical on server and client (no hydration
mismatch, no `Math.random`).

Heights are **declared, not measured** — `estimateFlyerHeight()` is a rough
line-count model. If a card overflows its slot, bump the constants at the top
of that function rather than fighting the packer.

Hand-placed art (the manifest) is layered *over* the pack and does not
participate in it. Overlap is intentional in this aesthetic; if a poster covers
a flyer, move the poster.

## Attachments — committed art, placed by code

```
public/board/
  posters/    poster + flyer art
  sheets/     page-1 renders of committed PDFs
  photos/     snapshots
public/files/ the actual PDFs (already exists)
```

Nothing is auto-discovered. To add a piece:

1. Drop the image in `public/board/…` (PDF page 1 → PNG, ~2× the board width;
   600px wide is plenty). Keep the PDF itself in `public/files/`.
2. Add an `ATTACHMENTS` entry: `src`, `alt`, `width` (board px), `aspect`
   (`src` width ÷ height), plus `label` / `pages` / `file` as needed.
3. Add a `Pin` to each board that should show it — `x`/`y` in board space,
   `rotate` under ±2.5°.

Board keys: `projects`, `blog`, `about`, `project:<slug>`, `blog:<slug>`.
A missing key means no attachments. The same attachment can hang on several
boards at different coordinates — that's why the registry and the placements
are separate tables.

## Drag + persistence

`Pinned` handles pointer drag and writes offsets to
`localStorage["board:<boardId>"]` as `{ [pinId]: {x, y} }`. On mount it applies
saved offsets via `style.translate`, so the server HTML is the canonical layout
and a user's rearrangement is a client-side overlay. `resetBoard(boardId)`
clears it. Set `draggable={false}` on a board to freeze it (slug pages ship
frozen — dragging a page of prose out of reading order is annoying).

Links inside a draggable card: the drag handler only claims the pointer after
4px of movement, so clicks and taps still reach anchors.

## Slug pages

`splitSheets()` cuts the MDX at top-level `#`/`##` headings into sheets, each
rendered as a `StapledSheet` with a `n / total` page number, left edges
staggered 160–194px and rotations under ±1°. The first sheet gets the title
block (tech chips, GitHub / live links). Attachments pinned to
`project:<slug>` stack between sheets at their manifest `y`.

MDX still goes through `MDXRemote`; the prose classes are replaced by the board
`.cork-prose` rules in the CSS additions (mono body, Excalifont headings).

## Known limits

- **Mobile**: below ~700px the scaler drops the board to ~55%, which puts body
  copy near 8px. The boards are desktop-first — consider gating them behind
  `useIsNarrow()` (already in `WhiteboardHero`) and keeping the current list
  layouts on phones. I left that call to you; nothing here breaks if you do.
- **Dark mode** is not themed. The cork is the same in both; only the page
  background behind the frame changes. If you want a dimmed board, add a
  `.dark .cork-panel { filter: brightness(0.82) }` rule.
- The two `-slug-` folders are only named that way here — put them back as
  `[slug]` in the repo. Also: `AboutBoard` replaces `About` wherever you render
  it today (`app/page.tsx`), and `Skills` is untouched.
- `in-progress/` content is never read by any of this — drafts stay off the
  boards, as agreed.
- Aspect ratios in the manifest are declared, so swapping a file for one with
  different proportions letterboxes until you update `aspect`.
