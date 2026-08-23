// lib/board.ts — board geometry, deterministic rotation, masonry packing.

export const BOARD_W = 1180;
export const FRAME = 14;            // aluminium frame padding
export const INNER_W = BOARD_W - FRAME * 2;
export const PAD = 44;              // cork edge -> first column
export const COLS = 3;
export const GUTTER = 28;
export const COL_W = Math.round((INNER_W - PAD * 2 - GUTTER * (COLS - 1)) / COLS); // 336
export const ROW_GAP = 32;
export const TOP = 138;             // first row sits below the sticky title
export const BOTTOM_PAD = 56;

export type Span = 1 | 2 | 3;

export const spanWidth = (span: Span) => COL_W * span + GUTTER * (span - 1);
export const colX = (col: number) => PAD + col * (COL_W + GUTTER);

/** Stable string hash -> [0, 1). Same on server and client. */
function hash01(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

/** Deterministic scatter, capped so the board reads "posted", not "thrown". */
export function rotationFor(id: string, max = 1.5): number {
  return Math.round((hash01(id + "r") * 2 - 1) * max * 10) / 10;
}

export type PackInput = { id: string; span: Span; height: number };
export type Placement = {
  id: string;
  x: number;
  y: number;
  width: number;
  rotate: number;
};

/**
 * Shortest-column masonry. Multi-column items land at the leftmost run of
 * columns wide enough, aligned to the tallest cursor in that run.
 * Returns placements plus the cork panel height they need.
 */
export function packBoard(
  items: PackInput[],
  opts: { top?: number } = {}
): { placements: Placement[]; height: number } {
  const cursors = new Array(COLS).fill(opts.top ?? TOP);
  const placements: Placement[] = [];

  for (const item of items) {
    const span = Math.min(item.span, COLS) as Span;
    let bestCol = 0;
    let bestY = Infinity;

    for (let c = 0; c + span <= COLS; c++) {
      const y = Math.max(...cursors.slice(c, c + span));
      if (y < bestY - 0.5) {
        bestY = y;
        bestCol = c;
      }
    }

    placements.push({
      id: item.id,
      x: colX(bestCol),
      y: bestY,
      width: spanWidth(span),
      rotate: rotationFor(item.id),
    });

    for (let c = bestCol; c < bestCol + span; c++) {
      cursors[c] = bestY + item.height + ROW_GAP;
    }
  }

  return {
    placements,
    height: Math.max(...cursors, (opts.top ?? TOP) + 240) - ROW_GAP + BOTTOM_PAD,
  };
}

/**
 * Rough height model for a flyer, in board px. Declared rather than measured —
 * if a card overflows, adjust these numbers, not the packer.
 */
export function estimateFlyerHeight(opts: {
  span: Span;
  title: string;
  body: string;
  chips?: number;
  featured?: boolean;
  figure?: boolean;
}): number {
  const w = spanWidth(opts.span) - (opts.featured ? 68 : 52); // minus padding
  const titleSize = opts.featured ? 34 : 25;
  const titleLines = Math.max(1, Math.ceil((opts.title.length * titleSize * 0.5) / w));
  const bodyW = opts.figure ? w - 230 : w;
  const bodyLines = Math.max(1, Math.ceil((opts.body.length * 7.4) / bodyW));

  return Math.round(
    (opts.featured ? 62 : 52) +          // padding + eyebrow
      titleLines * titleSize * 1.2 +
      bodyLines * (opts.featured ? 24.7 : 23) +
      (opts.chips ? 34 : 0) +
      46                                  // rule + footer row
  );
}
